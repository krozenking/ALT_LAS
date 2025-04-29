package errors

import (
	"fmt"
	"runtime"
)

// AppError represents an application error with context
type AppError struct {
	Err     error
	Message string
	Code    string
	File    string
	Line    int
	Stack   []string
}

// Error codes
const (
	ErrCodeDatabase     = "DATABASE_ERROR"
	ErrCodeNATS         = "NATS_ERROR"
	ErrCodeValidation   = "VALIDATION_ERROR"
	ErrCodeNotFound     = "NOT_FOUND"
	ErrCodeUnauthorized = "UNAUTHORIZED"
	ErrCodeInternal     = "INTERNAL_ERROR"
)

// New creates a new AppError
func New(err error, message, code string) *AppError {
	appErr := &AppError{
		Err:     err,
		Message: message,
		Code:    code,
		Stack:   make([]string, 0),
	}

	// Get caller information
	_, file, line, ok := runtime.Caller(1)
	if ok {
		appErr.File = file
		appErr.Line = line
	}

	// Capture stack trace
	for i := 1; i < 10; i++ {
		_, file, line, ok := runtime.Caller(i)
		if !ok {
			break
		}
		appErr.Stack = append(appErr.Stack, fmt.Sprintf("%s:%d", file, line))
	}

	return appErr
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s (%s)", e.Code, e.Message, e.Err.Error())
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// Unwrap returns the wrapped error
func (e *AppError) Unwrap() error {
	return e.Err
}

// WithMessage adds or updates the error message
func (e *AppError) WithMessage(message string) *AppError {
	e.Message = message
	return e
}

// WithCode adds or updates the error code
func (e *AppError) WithCode(code string) *AppError {
	e.Code = code
	return e
}

// NewDatabaseError creates a new database error
func NewDatabaseError(err error, message string) *AppError {
	return New(err, message, ErrCodeDatabase)
}

// NewNATSError creates a new NATS error
func NewNATSError(err error, message string) *AppError {
	return New(err, message, ErrCodeNATS)
}

// NewValidationError creates a new validation error
func NewValidationError(err error, message string) *AppError {
	return New(err, message, ErrCodeValidation)
}

// NewNotFoundError creates a new not found error
func NewNotFoundError(err error, message string) *AppError {
	return New(err, message, ErrCodeNotFound)
}

// IsNotFound checks if an error is a not found error
func IsNotFound(err error) bool {
	if appErr, ok := err.(*AppError); ok {
		return appErr.Code == ErrCodeNotFound
	}
	return false
}

// IsDatabase checks if an error is a database error
func IsDatabase(err error) bool {
	if appErr, ok := err.(*AppError); ok {
		return appErr.Code == ErrCodeDatabase
	}
	return false
}
