package logging

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"
)

// LogLevel represents the severity level of a log message
type LogLevel int

const (
	// DEBUG level for detailed debugging information
	DEBUG LogLevel = iota
	// INFO level for general operational information
	INFO
	// WARN level for warning events that might cause issues
	WARN
	// ERROR level for error events that might still allow the application to continue
	ERROR
	// FATAL level for severe error events that will lead the application to abort
	FATAL
)

// Logger represents a custom logger with multiple output destinations and levels
type Logger struct {
	debugLogger *log.Logger
	infoLogger  *log.Logger
	warnLogger  *log.Logger
	errorLogger *log.Logger
	fatalLogger *log.Logger
	level       LogLevel
}

// NewLogger creates a new Logger with the specified minimum log level
func NewLogger(level LogLevel, logDir string) (*Logger, error) {
	// Create log directory if it doesn't exist
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create log directory: %w", err)
	}

	// Create log file with current date
	logFile := filepath.Join(logDir, fmt.Sprintf("archive-service-%s.log", time.Now().Format("2006-01-02")))
	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return nil, fmt.Errorf("failed to open log file: %w", err)
	}

	// Create multi-writer for console and file
	multiWriter := io.MultiWriter(os.Stdout, file)

	// Create loggers for each level
	debugLogger := log.New(multiWriter, "DEBUG: ", log.Ldate|log.Ltime|log.Lshortfile)
	infoLogger := log.New(multiWriter, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	warnLogger := log.New(multiWriter, "WARN: ", log.Ldate|log.Ltime|log.Lshortfile)
	errorLogger := log.New(multiWriter, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
	fatalLogger := log.New(multiWriter, "FATAL: ", log.Ldate|log.Ltime|log.Lshortfile)

	return &Logger{
		debugLogger: debugLogger,
		infoLogger:  infoLogger,
		warnLogger:  warnLogger,
		errorLogger: errorLogger,
		fatalLogger: fatalLogger,
		level:       level,
	}, nil
}

// Debug logs a debug message
func (l *Logger) Debug(format string, v ...interface{}) {
	if l.level <= DEBUG {
		l.debugLogger.Printf(format, v...)
	}
}

// Info logs an info message
func (l *Logger) Info(format string, v ...interface{}) {
	if l.level <= INFO {
		l.infoLogger.Printf(format, v...)
	}
}

// Warn logs a warning message
func (l *Logger) Warn(format string, v ...interface{}) {
	if l.level <= WARN {
		l.warnLogger.Printf(format, v...)
	}
}

// Error logs an error message
func (l *Logger) Error(format string, v ...interface{}) {
	if l.level <= ERROR {
		l.errorLogger.Printf(format, v...)
	}
}

// Fatal logs a fatal message and exits the application
func (l *Logger) Fatal(format string, v ...interface{}) {
	if l.level <= FATAL {
		l.fatalLogger.Printf(format, v...)
		os.Exit(1)
	}
}

// SetLevel sets the minimum log level
func (l *Logger) SetLevel(level LogLevel) {
	l.level = level
}

// GetLevel returns the current minimum log level
func (l *Logger) GetLevel() LogLevel {
	return l.level
}

// LevelToString converts a LogLevel to its string representation
func LevelToString(level LogLevel) string {
	switch level {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	case FATAL:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

// StringToLevel converts a string to its LogLevel representation
func StringToLevel(level string) LogLevel {
	switch level {
	case "DEBUG":
		return DEBUG
	case "INFO":
		return INFO
	case "WARN":
		return WARN
	case "ERROR":
		return ERROR
	case "FATAL":
		return FATAL
	default:
		return INFO // Default to INFO level
	}
}
