package models

import (
	"time"
)

// Atlas represents a *.atlas file in the system
type Atlas struct {
	ID          string                 `json:"id" db:"id"`
	LastFileID  string                 `json:"last_file_id" db:"last_file_id"`
	LastFileRef string                 `json:"last_file_ref,omitempty" db:"last_file_ref"` // Added LastFileRef
	FilePath    string                 `json:"file_path" db:"file_path"`
	SuccessRate float64                `json:"success_rate" db:"success_rate"`
	Timestamp   time.Time              `json:"timestamp" db:"timestamp"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
	Tags        []string               `json:"tags" db:"tags"`
	Status      string                 `json:"status" db:"status"`
	CreatedAt   time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at" db:"updated_at"`
}

// AtlasStatus represents the possible statuses of an Atlas entry
const (
	AtlasStatusActive   = "active"
	AtlasStatusArchived = "archived"
	AtlasStatusDeleted  = "deleted"
)

