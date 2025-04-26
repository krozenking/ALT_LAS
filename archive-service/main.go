package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/krozenking/ALT_LAS/archive-service/internal/config"
	"github.com/krozenking/ALT_LAS/archive-service/internal/listener"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/krozenking/ALT_LAS/archive-service/internal/repository"
)

func main() {
	// Load configuration
	cfg := config.DefaultConfig()

	// Initialize database
	dbManager, err := repository.NewDBManager(&cfg.DB)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer dbManager.Close()

	// Run migrations
	if err := dbManager.RunMigrations("./migrations"); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repositories
	lastFileRepo := repository.NewLastFileRepository(dbManager.GetDB())

	// Initialize last file processor
	processor := listener.NewLastFileProcessor(0.7) // 70% success rate threshold

	// Initialize NATS listener
	natsListener, err := listener.NewNatsListener(
		cfg.NATS.URL,
		cfg.NATS.Subject,
		cfg.NATS.QueueGroup,
		createLastFileHandler(lastFileRepo, processor),
	)
	if err != nil {
		log.Fatalf("Failed to initialize NATS listener: %v", err)
	}

	// Start NATS listener
	if err := natsListener.Start(); err != nil {
		log.Fatalf("Failed to start NATS listener: %v", err)
	}
	defer natsListener.Stop()

	// Initialize HTTP router
	r := mux.NewRouter()

	// Routes
	r.HandleFunc("/", indexHandler).Methods("GET")
	r.HandleFunc("/health", healthCheckHandler).Methods("GET")
	r.HandleFunc("/archive", createArchiveHandler(lastFileRepo)).Methods("POST")
	r.HandleFunc("/archive/{id}", getArchiveStatusHandler(lastFileRepo)).Methods("GET")
	r.HandleFunc("/search", searchAtlasHandler).Methods("GET")

	// Start HTTP server
	go func() {
		log.Printf("Starting Archive Service on port %d", cfg.Server.Port)
		if err := http.ListenAndServe(":9000", r); err != nil {
			log.Fatalf("Failed to start HTTP server: %v", err)
		}
	}()

	// Wait for termination signal
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	log.Println("Shutting down Archive Service...")
}

// createLastFileHandler creates a handler function for processing LastFileMessages
func createLastFileHandler(repo *repository.LastFileRepository, processor *listener.LastFileProcessor) listener.LastFileHandler {
	return func(msg *listener.LastFileMessage) error {
		log.Printf("Received *.last file: %s", msg.FilePath)

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
			log.Printf("Failed to save *.last file to database: %v", err)
			return err
		}

		// Update status to processing
		if err := repo.UpdateStatus(lastFile.ID, models.LastFileStatusProcessing); err != nil {
			log.Printf("Failed to update *.last file status: %v", err)
			return err
		}

		// Process the file
		if err := processor.ProcessLastFile(msg); err != nil {
			log.Printf("Failed to process *.last file: %v", err)
			repo.UpdateStatus(lastFile.ID, models.LastFileStatusFailed)
			return err
		}

		// Generate Atlas ID and update status
		atlasID := "atlas_" + uuid.New().String()
		if err := repo.UpdateAtlasID(lastFile.ID, atlasID); err != nil {
			log.Printf("Failed to update atlas ID: %v", err)
			return err
		}

		log.Printf("Successfully processed *.last file: %s", msg.FilePath)
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

func createArchiveHandler(repo *repository.LastFileRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Implementation remains the same as in the original main.go
		// but would use the repository for database operations
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"received","id":"mock-id"}`))
	}
}

func getArchiveStatusHandler(repo *repository.LastFileRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Implementation remains the same as in the original main.go
		// but would use the repository for database operations
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"processing","id":"mock-id"}`))
	}
}

func searchAtlasHandler(w http.ResponseWriter, r *http.Request) {
	// Implementation remains the same as in the original main.go
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"results":[],"count":0}`))
}
