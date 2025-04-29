package repository

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/krozenking/ALT_LAS/archive-service/internal/config"
)

// DBManager handles database connection and migrations
type DBManager struct {
	db *sqlx.DB
}

// NewDBManager creates a new DBManager
func NewDBManager(cfg *config.DBConfig) (*DBManager, error) {
	// Create connection string
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
	)

	// Connect to database
	db, err := sqlx.Connect("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DBManager{
		db: db,
	}, nil
}

// RunMigrations runs database migrations
func (m *DBManager) RunMigrations(migrationsPath string) error {
	log.Printf("Running migrations from: %s", migrationsPath)

	// Get the database driver
	driver, err := postgres.WithInstance(m.db.DB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("failed to create migration driver: %w", err)
	}

	// Create a new migrate instance
	migrations, err := migrate.NewWithDatabaseInstance(
		fmt.Sprintf("file://%s", migrationsPath),
		"postgres", driver,
	)
	if err != nil {
		return fmt.Errorf("failed to create migration instance: %w", err)
	}

	// Run migrations
	if err := migrations.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

// GetDB returns the database connection
func (m *DBManager) GetDB() *sqlx.DB {
	return m.db
}

// Close closes the database connection
func (m *DBManager) Close() error {
	return m.db.Close()
}
