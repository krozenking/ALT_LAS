package repository_test

import (
	"context"
	"testing"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/krozenking/ALT_LAS/archive-service/internal/config"
	"github.com/krozenking/ALT_LAS/archive-service/internal/repository"
)

func TestDBManager(t *testing.T) {
	// Create a test configuration
	dbConfig := &config.DatabaseConfig{
		Host:     "localhost",
		Port:     5432,
		User:     "postgres",
		Password: "postgres",
		DBName:   "atlas_archive_test",
		SSLMode:  "disable",
		MaxConns: 5,
		MaxIdle:  2,
	}

	// Test GetDSN
	dsn := dbConfig.GetDSN()
	assert.Contains(t, dsn, "host=localhost")
	assert.Contains(t, dsn, "port=5432")
	assert.Contains(t, dsn, "user=postgres")
	assert.Contains(t, dsn, "dbname=atlas_archive_test")
	assert.Contains(t, dsn, "sslmode=disable")

	// Create DB manager
	dbManager := repository.NewDBManager(dbConfig)
	assert.NotNil(t, dbManager)

	// Test Connect and Close
	// Note: This will be skipped if the database is not available
	err := dbManager.Connect()
	if err != nil {
		t.Skip("Database connection not available:", err)
	}

	db := dbManager.GetDB()
	assert.NotNil(t, db)

	// Test Transaction
	err = testTransaction(t, db)
	assert.NoError(t, err)

	// Clean up
	err = dbManager.Close()
	assert.NoError(t, err)
}

func testTransaction(t *testing.T, db *sqlx.DB) error {
	ctx := context.Background()
	
	// Create a temporary test table
	_, err := db.ExecContext(ctx, `
		CREATE TEMPORARY TABLE test_transaction (
			id SERIAL PRIMARY KEY,
			value TEXT NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Test successful transaction
	err = repository.Transaction(ctx, db, func(tx *sqlx.Tx) error {
		_, err := tx.ExecContext(ctx, "INSERT INTO test_transaction (value) VALUES ($1)", "test1")
		return err
	})
	assert.NoError(t, err)

	// Verify the insert worked
	var count int
	err = db.GetContext(ctx, &count, "SELECT COUNT(*) FROM test_transaction WHERE value = $1", "test1")
	assert.NoError(t, err)
	assert.Equal(t, 1, count)

	// Test failed transaction
	err = repository.Transaction(ctx, db, func(tx *sqlx.Tx) error {
		_, err := tx.ExecContext(ctx, "INSERT INTO test_transaction (value) VALUES ($1)", "test2")
		if err != nil {
			return err
		}
		return assert.AnError // Force a rollback
	})
	assert.Error(t, err)

	// Verify the second insert was rolled back
	err = db.GetContext(ctx, &count, "SELECT COUNT(*) FROM test_transaction WHERE value = $1", "test2")
	assert.NoError(t, err)
	assert.Equal(t, 0, count)

	return nil
}

// Helper function to make Transaction available for testing
func init() {
	// Export the Transaction function for testing
	if repository.Transaction == nil {
		repository.Transaction = func(ctx context.Context, db *sqlx.DB, fn func(tx *sqlx.Tx) error) error {
			tx, err := db.BeginTxx(ctx, nil)
			if err != nil {
				return err
			}

			defer func() {
				if p := recover(); p != nil {
					_ = tx.Rollback()
					panic(p)
				}
			}()

			if err := fn(tx); err != nil {
				_ = tx.Rollback()
				return err
			}

			return tx.Commit()
		}
	}
}
