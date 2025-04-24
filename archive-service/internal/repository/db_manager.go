package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"github.com/krozenking/ALT_LAS/archive-service/internal/config"
)

// DBManager handles database connections and migrations
type DBManager struct {
	db     *sqlx.DB
	config *config.DatabaseConfig
}

// NewDBManager creates a new database manager
func NewDBManager(cfg *config.DatabaseConfig) *DBManager {
	return &DBManager{
		config: cfg,
	}
}

// Connect establishes a connection to the database
func (m *DBManager) Connect() error {
	db, err := sqlx.Connect("postgres", m.config.GetDSN())
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(m.config.MaxConns)
	db.SetMaxIdleConns(m.config.MaxIdle)
	db.SetConnMaxLifetime(time.Hour)

	// Test the connection
	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	m.db = db
	return nil
}

// Close closes the database connection
func (m *DBManager) Close() error {
	if m.db != nil {
		return m.db.Close()
	}
	return nil
}

// GetDB returns the database connection
func (m *DBManager) GetDB() *sqlx.DB {
	return m.db
}

// RunMigrations runs database migrations
func (m *DBManager) RunMigrations(migrationsPath string) error {
	if m.db == nil {
		return errors.New("database connection not established")
	}

	driver, err := postgres.WithInstance(m.db.DB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("failed to create migration driver: %w", err)
	}

	migration, err := migrate.NewWithDatabaseInstance(
		fmt.Sprintf("file://%s", migrationsPath),
		"postgres", driver)
	if err != nil {
		return fmt.Errorf("failed to create migration instance: %w", err)
	}

	if err := migration.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}

// Transaction executes a function within a database transaction
func (m *DBManager) Transaction(ctx context.Context, fn func(tx *sqlx.Tx) error) error {
	tx, err := m.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}

	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p) // re-throw panic after rollback
		}
	}()

	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}

	return tx.Commit()
}
