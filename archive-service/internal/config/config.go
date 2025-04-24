package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	NATS     NATSConfig
	Elastic  ElasticConfig
}

// ServerConfig holds the configuration for the HTTP server
type ServerConfig struct {
	Port         int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// DatabaseConfig holds the configuration for the PostgreSQL database
type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
	MaxConns int
	MaxIdle  int
}

// NATSConfig holds the configuration for the NATS message queue
type NATSConfig struct {
	URL      string
	Subject  string
	QueueGroup string
	MaxReconnects int
	ReconnectWait time.Duration
}

// ElasticConfig holds the configuration for Elasticsearch
type ElasticConfig struct {
	URL      string
	Username string
	Password string
	IndexPrefix string
	Sniff    bool
}

// GetDSN returns the PostgreSQL connection string
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

// LoadConfig loads the configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port:         getEnvAsInt("SERVER_PORT", 9000),
			ReadTimeout:  getEnvAsDuration("SERVER_READ_TIMEOUT", 10*time.Second),
			WriteTimeout: getEnvAsDuration("SERVER_WRITE_TIMEOUT", 10*time.Second),
			IdleTimeout:  getEnvAsDuration("SERVER_IDLE_TIMEOUT", 60*time.Second),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "atlas_archive"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
			MaxConns: getEnvAsInt("DB_MAX_CONNS", 10),
			MaxIdle:  getEnvAsInt("DB_MAX_IDLE", 5),
		},
		NATS: NATSConfig{
			URL:           getEnv("NATS_URL", "nats://localhost:4222"),
			Subject:       getEnv("NATS_SUBJECT", "last.files"),
			QueueGroup:    getEnv("NATS_QUEUE_GROUP", "archive-service"),
			MaxReconnects: getEnvAsInt("NATS_MAX_RECONNECTS", 10),
			ReconnectWait: getEnvAsDuration("NATS_RECONNECT_WAIT", 5*time.Second),
		},
		Elastic: ElasticConfig{
			URL:         getEnv("ELASTIC_URL", "http://localhost:9200"),
			Username:    getEnv("ELASTIC_USERNAME", ""),
			Password:    getEnv("ELASTIC_PASSWORD", ""),
			IndexPrefix: getEnv("ELASTIC_INDEX_PREFIX", "atlas"),
			Sniff:       getEnvAsBool("ELASTIC_SNIFF", true),
		},
	}
}

// Helper functions to get environment variables with defaults
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value, exists := os.LookupEnv(key); exists {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
