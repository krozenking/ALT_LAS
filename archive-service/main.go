package main

import (
	"fmt" // Added fmt import
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	// "github.com/google/uuid" // Unused import, commented out
	"github.com/gorilla/mux"
	"github.com/krozenking/ALT_LAS/archive-service/internal/config"
	"github.com/krozenking/ALT_LAS/archive-service/internal/errors"
	"github.com/krozenking/ALT_LAS/archive-service/internal/handlers"
	"github.com/krozenking/ALT_LAS/archive-service/internal/listener"
	"github.com/krozenking/ALT_LAS/archive-service/internal/logging"
	"github.com/krozenking/ALT_LAS/archive-service/internal/middleware"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/krozenking/ALT_LAS/archive-service/internal/repository_optimized"
	"github.com/krozenking/ALT_LAS/archive-service/internal/service"
)

func main() {
	// Load configuration
	cfg := config.DefaultConfig()

	// Initialize logger
	logger, err := logging.NewLogger(cfg.GetLogLevel(), cfg.Logging.LogDir)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}

	logger.Info("Starting Archive Service...")

	// Initialize database using repository_optimized
	dbManager, err := repository_optimized.NewDBManager(&cfg.DB)
	if err != nil {
		logger.Fatal("Failed to initialize database: %v", err)
	}
	defer dbManager.Close()

	// Run migrations
	logger.Info("Running database migrations...")
	if err := dbManager.RunMigrations("./migrations"); err != nil {
		logger.Fatal("Failed to run migrations: %v", err)
	}

	// Initialize repositories using repository_optimized
	lastFileRepo := repository_optimized.NewLastFileRepository(dbManager, logger) // Corrected arguments
	atlasRepo := repository_optimized.NewAtlasRepository(dbManager, logger)       // Corrected arguments

	// Initialize services
	// Note: Service layer might need adjustment if it expects non-optimized repository types
	atlasService := service.NewAtlasService(lastFileRepo, atlasRepo)
	successRateService := service.NewSuccessRateService(lastFileRepo, atlasRepo)

	// Initialize handlers
	atlasHandler := handlers.NewAtlasHandler(atlasService)
	successRateHandler := handlers.NewSuccessRateHandler(successRateService)

	// Initialize last file processor with success rate check
	processor := listener.NewLastFileProcessor(service.SuccessRateThreshold)

	// Initialize NATS listener
	logger.Info("Connecting to NATS server at %s...", cfg.NATS.URL)
	natsListener, err := listener.NewNatsListener(
		cfg.NATS.URL,
		cfg.NATS.Subject,
		cfg.NATS.QueueGroup,
		createLastFileHandler(lastFileRepo, processor, atlasService, successRateService, logger),
	)
	if err != nil {
		logger.Fatal("Failed to initialize NATS listener: %v", err)
	}

	// Start NATS listener
	logger.Info("Starting NATS listener on subject %s...", cfg.NATS.Subject)
	if err := natsListener.Start(); err != nil {
		logger.Fatal("Failed to start NATS listener: %v", err)
	}
	defer natsListener.Stop()

	// Initialize HTTP router
	r := mux.NewRouter()

	// Apply middleware
	r.Use(middleware.LoggingMiddleware(logger))
	r.Use(middleware.RecoveryMiddleware(logger))

	// Routes
	r.HandleFunc("/", indexHandler).Methods("GET")
	r.HandleFunc("/health", healthCheckHandler).Methods("GET")

	// LastFile routes
	r.HandleFunc("/archive", createArchiveHandler(lastFileRepo, logger)).Methods("POST")
	r.HandleFunc("/archive/{id}", getArchiveStatusHandler(lastFileRepo, logger)).Methods("GET")

	// Atlas routes
	r.HandleFunc("/atlas/search", atlasHandler.SearchAtlasHandler).Methods("GET")
	r.HandleFunc("/atlas/{id}", atlasHandler.GetAtlasHandler).Methods("GET")
	r.HandleFunc("/atlas/{id}/archive", atlasHandler.ArchiveAtlasHandler).Methods("POST")
	r.HandleFunc("/atlas/{id}/delete", atlasHandler.DeleteAtlasHandler).Methods("POST")
	r.HandleFunc("/atlas/tags", atlasHandler.GetTagsHandler).Methods("GET")
	r.HandleFunc("/atlas/mock", atlasHandler.CreateMockAtlasHandler).Methods("POST") // For testing

	// Success Rate routes
	r.HandleFunc("/success-rate/stats", successRateHandler.GetSuccessRateStatsHandler).Methods("GET")
	r.HandleFunc("/success-rate/distribution", successRateHandler.GetSuccessRateDistributionHandler).Methods("GET")
	r.HandleFunc("/success-rate/low-entries", successRateHandler.GetLowSuccessRateEntriesHandler).Methods("GET")
	r.HandleFunc("/success-rate/check", successRateHandler.CheckSuccessRateHandler).Methods("GET")

	// Start HTTP server
	go func() {
		logger.Info("Starting HTTP server on port %d...", cfg.Server.Port)
		if err := http.ListenAndServe(fmt.Sprintf(":%d", cfg.Server.Port), r); err != nil {
			logger.Fatal("Failed to start HTTP server: %v", err)
		}
	}()

	// Wait for termination signal
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	logger.Info("Shutting down Archive Service...")
}

func createLastFileHandler(
	repo *repository_optimized.LastFileRepository,
	processor *listener.LastFileProcessor,
	atlasService *service.AtlasService,
	successRateService *service.SuccessRateService,
	logger *logging.Logger,
) listener.LastFileHandler {
	return func(msg *listener.LastFileMessage) error {
		logger.Info("Received *.last file: %s", msg.FilePath)

		// Check success rate
		if !successRateService.CheckSuccessRate(msg.SuccessRate) {
			logger.Warn("Low success rate detected: %.2f for file %s", msg.SuccessRate, msg.FilePath)
			successRateService.LogSuccessRateAlert(msg.ID, msg.SuccessRate)
		}

		// Create a LastFile record
		lastFile := &models.LastFile{
			ID:          msg.ID,
			FilePath:    msg.FilePath,
			SuccessRate: msg.SuccessRate,
			Timestamp:   msg.Timestamp,
			Metadata:    msg.Metadata,
			Status:      models.LastFileStatusReceived,
		}

		// Save to database
		if err := repo.Create(lastFile); err != nil {
			logger.Error("Failed to save *.last file to database: %v", err)
			return errors.NewDatabaseError(err, "Failed to save *.last file")
		}

		// Update status to processing
		if err := repo.UpdateStatus(lastFile.ID, models.LastFileStatusProcessing); err != nil {
			logger.Error("Failed to update *.last file status: %v", err)
			return errors.NewDatabaseError(err, "Failed to update *.last file status")
		}

		// Process the file
		if err := processor.ProcessLastFile(msg); err != nil {
			logger.Error("Failed to process *.last file: %v", err)
			repo.UpdateStatus(lastFile.ID, models.LastFileStatusFailed)
			return err
		}

		// Process for Atlas conversion
		if err := atlasService.ProcessLastFile(msg); err != nil {
			logger.Error("Failed to process *.last file for Atlas conversion: %v", err)
			repo.UpdateStatus(lastFile.ID, models.LastFileStatusFailed)
			return err
		}

		logger.Info("Successfully processed *.last file: %s", msg.FilePath)
		return nil
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("ALT_LAS Archive Service"))
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"UP"}`))
}

func createArchiveHandler(repo *repository_optimized.LastFileRepository, logger *logging.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logger.Debug("Received archive request")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"received","id":"mock-id"}`))
	}
}

func getArchiveStatusHandler(repo *repository_optimized.LastFileRepository, logger *logging.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logger.Debug("Received archive status request")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"processing","id":"mock-id"}`))
	}
}

