package models

import (
	"time"

	"github.com/google/uuid"
)

// Archive represents an archived LAST file in the database
type Archive struct {
	ID           uuid.UUID              `json:"id" db:"id"`
	LastFile     string                 `json:"last_file" db:"last_file"`
	AtlasFile    string                 `json:"atlas_file" db:"atlas_file"`
	Status       string                 `json:"status" db:"status"`
	SuccessRate  float64                `json:"success_rate" db:"success_rate"`
	Metadata     map[string]interface{} `json:"metadata" db:"metadata"`
	CreatedAt    time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at" db:"updated_at"`
	ProcessedAt  *time.Time             `json:"processed_at,omitempty" db:"processed_at"`
}

// ArchiveStatus represents the possible statuses of an archive
const (
	ArchiveStatusPending   = "pending"
	ArchiveStatusProcessing = "processing"
	ArchiveStatusCompleted = "completed"
	ArchiveStatusFailed    = "failed"
)

// NewArchive creates a new Archive with default values
func NewArchive(lastFile string, metadata map[string]interface{}) *Archive {
	now := time.Now()
	return &Archive{
		ID:        uuid.New(),
		LastFile:  lastFile,
		Status:    ArchiveStatusPending,
		Metadata:  metadata,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// ArchiveRequest represents a request to archive a LAST file
type ArchiveRequest struct {
	LastFile string                 `json:"last_file" binding:"required"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// ArchiveResponse represents the response from archiving a LAST file
type ArchiveResponse struct {
	ID         string                 `json:"id"`
	Status     string                 `json:"status"`
	LastFile   string                 `json:"last_file"`
	AtlasFile  string                 `json:"atlas_file,omitempty"`
	SuccessRate float64               `json:"success_rate,omitempty"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
	ProcessedAt *time.Time            `json:"processed_at,omitempty"`
}

// ToResponse converts an Archive to an ArchiveResponse
func (a *Archive) ToResponse() *ArchiveResponse {
	return &ArchiveResponse{
		ID:          a.ID.String(),
		Status:      a.Status,
		LastFile:    a.LastFile,
		AtlasFile:   a.AtlasFile,
		SuccessRate: a.SuccessRate,
		Metadata:    a.Metadata,
		CreatedAt:   a.CreatedAt,
		UpdatedAt:   a.UpdatedAt,
		ProcessedAt: a.ProcessedAt,
	}
}

// SearchQuery represents a query to search the archives
type SearchQuery struct {
	Query       string    `form:"query"`
	Status      string    `form:"status"`
	StartDate   time.Time `form:"start_date"`
	EndDate     time.Time `form:"end_date"`
	MinSuccess  float64   `form:"min_success"`
	MaxSuccess  float64   `form:"max_success"`
	Limit       int       `form:"limit,default=10"`
	Offset      int       `form:"offset,default=0"`
	SortBy      string    `form:"sort_by,default=created_at"`
	SortOrder   string    `form:"sort_order,default=desc"`
}

// SearchResult represents the result of a search query
type SearchResult struct {
	Results []ArchiveResponse `json:"results"`
	Total   int64             `json:"total"`
	Limit   int               `json:"limit"`
	Offset  int               `json:"offset"`
}
