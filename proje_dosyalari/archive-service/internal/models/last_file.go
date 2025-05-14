package models

import (
	"time"
)

// LastFile represents a *.last file in the system
type LastFile struct {
	ID          string                 `json:"id" db:"id"`
	FilePath    string                 `json:"file_path" db:"file_path"`
	SuccessRate float64                `json:"success_rate" db:"success_rate"`
	Timestamp   time.Time              `json:"timestamp" db:"timestamp"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
	AtlasID     string                 `json:"atlas_id,omitempty" db:"atlas_id"`
	Status      string                 `json:"status" db:"status"`
	CreatedAt   time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at" db:"updated_at"`
}

// LastFileStatus represents the possible statuses of a LastFile
const (
	LastFileStatusReceived  = "received"
	LastFileStatusProcessing = "processing"
	LastFileStatusArchived  = "archived"
	LastFileStatusFailed    = "failed"
)
