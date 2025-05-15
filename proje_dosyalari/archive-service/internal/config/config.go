package config

import (
	"github.com/krozenking/ALT_LAS/archive-service/internal/logging"
)

// Config holds the application configuration
type Config struct {
	Server  ServerConfig  `json:"server"`
	NATS    NATSConfig    `json:"nats"`
	DB      DBConfig      `json:"db"`
	Logging LoggingConfig `json:"logging"`
}

// ServerConfig holds the HTTP server configuration
type ServerConfig struct {
	Port int `json:"port"`
}

// NATSConfig holds the NATS configuration
type NATSConfig struct {
	URL        string `json:"url"`
	Subject    string `json:"subject"`
	QueueGroup string `json:"queue_group"`
}

// DBConfig holds the database configuration
type DBConfig struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	DBName   string `json:"dbname"`
	SSLMode  string `json:"sslmode"`
}

// LoggingConfig holds the logging configuration
type LoggingConfig struct {
	Level  string `json:"level"`
	LogDir string `json:"log_dir"`
}

// DefaultConfig returns the default configuration
func DefaultConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port: 9000,
		},
		NATS: NATSConfig{
			URL:        "nats://localhost:4222",
			Subject:    "last.files",
			QueueGroup: "archive-service",
		},
		DB: DBConfig{
			Host:     "localhost",
			Port:     5432,
			User:     "postgres",
			Password: "postgres",
			DBName:   "atlas_db",
			SSLMode:  "disable",
		},
		Logging: LoggingConfig{
			Level:  "INFO",
			LogDir: "./logs",
		},
	}
}

// GetLogLevel returns the logging level as a LogLevel type
func (c *Config) GetLogLevel() logging.LogLevel {
	return logging.StringToLevel(c.Logging.Level)
}
