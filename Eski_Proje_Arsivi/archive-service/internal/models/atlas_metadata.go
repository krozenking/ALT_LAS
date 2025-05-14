package models

import "time"

// AtlasMetadata represents metadata associated with an Atlas file.
// Updated to include fields expected by tests.
type AtlasMetadata struct {
    ID               string                 `json:"id,omitempty" db:"id"`
    ArchiveID        string                 `json:"archive_id,omitempty" db:"archive_id"`
    Source           string                 `json:"source,omitempty" db:"source"`
    Description      string                 `json:"description,omitempty" db:"description"`
    Version          string                 `json:"version,omitempty" db:"version"`
    Tags             []string               `json:"tags,omitempty" db:"tags"`
    CreatedAt        time.Time              `json:"created_at,omitempty" db:"created_at"`
    UpdatedAt        time.Time              `json:"updated_at,omitempty" db:"updated_at"`
    SuccessRate      float64                `json:"success_rate,omitempty" db:"success_rate"`          // Added based on test error
    ProcessingTimeMs int64                  `json:"processing_time_ms,omitempty" db:"processing_time_ms"` // Added based on test error
    TokenCount       int                    `json:"token_count,omitempty" db:"token_count"`             // Added based on test error
    PromptSummary    string                 `json:"prompt_summary,omitempty" db:"prompt_summary"`       // Added based on test error
    CustomMetadata   map[string]interface{} `json:"custom_metadata,omitempty" db:"custom_metadata"`   // Added based on test error
}

// Validate checks if the AtlasMetadata is valid.
// This is a placeholder for actual validation logic.
func (m *AtlasMetadata) Validate() error {
    // Implement validation logic here, e.g., check for required fields.
    return nil
}

