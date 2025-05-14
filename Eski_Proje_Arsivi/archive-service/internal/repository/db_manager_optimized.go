package repository

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/krozenking/ALT_LAS/archive-service/internal/config"
)

// DBManager handles database connection and migrations
type DBManager struct {
	db            *sqlx.DB
	queryTimeout  time.Duration
	maxOpenConns  int
	maxIdleConns  int
	connMaxLife   time.Duration
	connMaxIdle   time.Duration
	preparedStmts map[string]*sqlx.Stmt
}

// DBManagerOption defines a function to configure DBManager
type DBManagerOption func(*DBManager)

// WithQueryTimeout sets the query timeout
func WithQueryTimeout(timeout time.Duration) DBManagerOption {
	return func(m *DBManager) {
		m.queryTimeout = timeout
	}
}

// WithMaxOpenConns sets the maximum number of open connections
func WithMaxOpenConns(n int) DBManagerOption {
	return func(m *DBManager) {
		m.maxOpenConns = n
	}
}

// WithMaxIdleConns sets the maximum number of idle connections
func WithMaxIdleConns(n int) DBManagerOption {
	return func(m *DBManager) {
		m.maxIdleConns = n
	}
}

// WithConnMaxLifetime sets the maximum lifetime of a connection
func WithConnMaxLifetime(d time.Duration) DBManagerOption {
	return func(m *DBManager) {
		m.connMaxLife = d
	}
}

// WithConnMaxIdleTime sets the maximum idle time of a connection
func WithConnMaxIdleTime(d time.Duration) DBManagerOption {
	return func(m *DBManager) {
		m.connMaxIdle = d
	}
}

// NewDBManager creates a new DBManager with optimized settings
func NewDBManager(cfg *config.DBConfig, opts ...DBManagerOption) (*DBManager, error) {
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

	// Create manager with default settings
	manager := &DBManager{
		db:            db,
		queryTimeout:  30 * time.Second, // Default query timeout
		maxOpenConns:  25,               // Default max open connections
		maxIdleConns:  10,               // Default max idle connections
		connMaxLife:   15 * time.Minute, // Default connection max lifetime
		connMaxIdle:   5 * time.Minute,  // Default connection max idle time
		preparedStmts: make(map[string]*sqlx.Stmt),
	}

	// Apply options
	for _, opt := range opts {
		opt(manager)
	}

	// Configure connection pool
	db.SetMaxOpenConns(manager.maxOpenConns)
	db.SetMaxIdleConns(manager.maxIdleConns)
	db.SetConnMaxLifetime(manager.connMaxLife)
	db.SetConnMaxIdleTime(manager.connMaxIdle)

	return manager, nil
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

// Close closes the database connection and prepared statements
func (m *DBManager) Close() error {
	// Close all prepared statements
	for name, stmt := range m.preparedStmts {
		if err := stmt.Close(); err != nil {
			log.Printf("Error closing prepared statement %s: %v", name, err)
		}
	}
	
	// Close database connection
	return m.db.Close()
}

// QueryContext executes a query with timeout context
func (m *DBManager) QueryContext(query string, args ...interface{}) (*sql.Rows, error) {
	ctx, cancel := context.WithTimeout(context.Background(), m.queryTimeout)
	defer cancel()
	
	return m.db.QueryContext(ctx, query, args...)
}

// QueryxContext executes a query with timeout context and returns a sqlx.Rows
func (m *DBManager) QueryxContext(query string, args ...interface{}) (*sqlx.Rows, error) {
	ctx, cancel := context.WithTimeout(context.Background(), m.queryTimeout)
	defer cancel()
	
	return m.db.QueryxContext(ctx, query, args...)
}

// QueryRowContext executes a query with timeout context and returns a single row
func (m *DBManager) QueryRowContext(query string, args ...interface{}) *sql.Row {
	ctx, cancel := context.WithTimeout(context.Background(), m.queryTimeout)
	defer cancel()
	
	return m.db.QueryRowContext(ctx, query, args...)
}

// QueryRowxContext executes a query with timeout context and returns a sqlx.Row
func (m *DBManager) QueryRowxContext(query string, args ...interface{}) *sqlx.Row {
	ctx, cancel := context.WithTimeout(context.Background(), m.queryTimeout)
	defer cancel()
	
	return m.db.QueryRowxContext(ctx, query, args...)
}

// ExecContext executes a query with timeout context
func (m *DBManager) ExecContext(query string, args ...interface{}) (sql.Result, error) {
	ctx, cancel := context.WithTimeout(context.Background(), m.queryTimeout)
	defer cancel()
	
	return m.db.ExecContext(ctx, query, args...)
}

// PrepareStatement prepares and caches a statement
func (m *DBManager) PrepareStatement(name, query string) (*sqlx.Stmt, error) {
	// Check if statement is already prepared
	if stmt, ok := m.preparedStmts[name]; ok {
		return stmt, nil
	}
	
	// Prepare statement
	stmt, err := m.db.Preparex(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare statement %s: %w", name, err)
	}
	
	// Cache statement
	m.preparedStmts[name] = stmt
	
	return stmt, nil
}

// GetPreparedStatement returns a prepared statement by name
func (m *DBManager) GetPreparedStatement(name string) (*sqlx.Stmt, error) {
	stmt, ok := m.preparedStmts[name]
	if !ok {
		return nil, fmt.Errorf("prepared statement %s not found", name)
	}
	
	return stmt, nil
}

// BeginTx starts a transaction with timeout context
func (m *DBManager) BeginTx() (*sqlx.Tx, error) {
	ctx, cancel := context.WithTimeout(context.Background(), m.queryTimeout)
	defer cancel()
	
	return m.db.BeginTxx(ctx, nil)
}

// Stats returns database statistics
func (m *DBManager) Stats() sql.DBStats {
	return m.db.Stats()
}
