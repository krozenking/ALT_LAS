package tests

import (
	"testing"

	"github.com/krozenking/ALT_LAS/archive-service/internal/errors"
	"github.com/krozenking/ALT_LAS/archive-service/internal/logging"
	"github.com/stretchr/testify/assert"
)

func TestErrorHandling(t *testing.T) {
	// Test creating a database error
	dbErr := errors.NewDatabaseError(nil, "Failed to connect to database")
	assert.Equal(t, errors.ErrCodeDatabase, dbErr.Code)
	assert.Equal(t, "Failed to connect to database", dbErr.Message)
	assert.Contains(t, dbErr.Error(), "DATABASE_ERROR")

	// Test creating a validation error
	validationErr := errors.NewValidationError(nil, "Invalid input")
	assert.Equal(t, errors.ErrCodeValidation, validationErr.Code)
	assert.Equal(t, "Invalid input", validationErr.Message)
	assert.Contains(t, validationErr.Error(), "VALIDATION_ERROR")

	// Test creating a not found error
	notFoundErr := errors.NewNotFoundError(nil, "Resource not found")
	assert.Equal(t, errors.ErrCodeNotFound, notFoundErr.Code)
	assert.Equal(t, "Resource not found", notFoundErr.Message)
	assert.Contains(t, notFoundErr.Error(), "NOT_FOUND")

	// Test error type checking
	assert.True(t, errors.IsNotFound(notFoundErr))
	assert.False(t, errors.IsNotFound(dbErr))
	assert.True(t, errors.IsDatabase(dbErr))
	assert.False(t, errors.IsDatabase(notFoundErr))

	// Test error unwrapping
	wrappedErr := errors.New(dbErr, "Outer error", errors.ErrCodeInternal)
	assert.Equal(t, errors.ErrCodeInternal, wrappedErr.Code)
	assert.Equal(t, "Outer error", wrappedErr.Message)
	assert.Equal(t, dbErr, wrappedErr.Unwrap())
}

func TestLogging(t *testing.T) {
	// Create a logger with DEBUG level
	logger, err := logging.NewLogger(logging.DEBUG, "/tmp/test-logs")
	assert.NoError(t, err)
	assert.NotNil(t, logger)

	// Test log level conversion
	assert.Equal(t, "DEBUG", logging.LevelToString(logging.DEBUG))
	assert.Equal(t, "INFO", logging.LevelToString(logging.INFO))
	assert.Equal(t, "WARN", logging.LevelToString(logging.WARN))
	assert.Equal(t, "ERROR", logging.LevelToString(logging.ERROR))
	assert.Equal(t, "FATAL", logging.LevelToString(logging.FATAL))
	assert.Equal(t, "UNKNOWN", logging.LevelToString(99))

	assert.Equal(t, logging.DEBUG, logging.StringToLevel("DEBUG"))
	assert.Equal(t, logging.INFO, logging.StringToLevel("INFO"))
	assert.Equal(t, logging.WARN, logging.StringToLevel("WARN"))
	assert.Equal(t, logging.ERROR, logging.StringToLevel("ERROR"))
	assert.Equal(t, logging.FATAL, logging.StringToLevel("FATAL"))
	assert.Equal(t, logging.INFO, logging.StringToLevel("UNKNOWN"))

	// Test setting and getting log level
	logger.SetLevel(logging.INFO)
	assert.Equal(t, logging.INFO, logger.GetLevel())

	// Test logging (no assertions, just make sure it doesn't panic)
	logger.Debug("This is a debug message")
	logger.Info("This is an info message")
	logger.Warn("This is a warning message")
	logger.Error("This is an error message")
	// Don't test Fatal as it would exit the program
}
