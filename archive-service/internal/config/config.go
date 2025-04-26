package config

// Config holds the application configuration
type Config struct {
	Server ServerConfig `json:"server"`
	NATS   NATSConfig   `json:"nats"`
	DB     DBConfig     `json:"db"`
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
	}
}
