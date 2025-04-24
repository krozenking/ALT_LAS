package models

import (
	"time"
)

// AtlasFile represents the structure of an Atlas file
type AtlasFile struct {
	// Header information
	Version     string                 `json:"version"`
	CreatedAt   time.Time              `json:"created_at"`
	LastFileRef string                 `json:"last_file_ref"`
	Metadata    map[string]interface{} `json:"metadata"`
	
	// Performance metrics
	SuccessRate      float64 `json:"success_rate"`
	ProcessingTimeMs int64   `json:"processing_time_ms"`
	TokenCount       int     `json:"token_count"`
	
	// Content sections
	OriginalPrompt   string                 `json:"original_prompt"`
	SegmentResults   []SegmentResult        `json:"segment_results"`
	AnalysisResults  map[string]interface{} `json:"analysis_results"`
	
	// System information
	SystemInfo map[string]interface{} `json:"system_info"`
}

// SegmentResult represents the result of processing a segment
type SegmentResult struct {
	SegmentID     string                 `json:"segment_id"`
	SegmentType   string                 `json:"segment_type"`
	SegmentText   string                 `json:"segment_text"`
	Success       bool                   `json:"success"`
	ErrorMessage  string                 `json:"error_message,omitempty"`
	ResponseText  string                 `json:"response_text,omitempty"`
	ProcessingMs  int64                  `json:"processing_ms"`
	ModelUsed     string                 `json:"model_used,omitempty"`
	TokensUsed    int                    `json:"tokens_used"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// AtlasMetadata represents the metadata stored in the database for an Atlas file
type AtlasMetadata struct {
	ID              string                 `json:"id" db:"id"`
	ArchiveID       string                 `json:"archive_id" db:"archive_id"`
	Version         string                 `json:"version" db:"version"`
	SuccessRate     float64                `json:"success_rate" db:"success_rate"`
	ProcessingTimeMs int64                 `json:"processing_time_ms" db:"processing_time_ms"`
	TokenCount      int                    `json:"token_count" db:"token_count"`
	PromptSummary   string                 `json:"prompt_summary" db:"prompt_summary"`
	Tags            []string               `json:"tags" db:"tags"`
	CustomMetadata  map[string]interface{} `json:"custom_metadata" db:"custom_metadata"`
	CreatedAt       time.Time              `json:"created_at" db:"created_at"`
}

// Tag represents a tag that can be applied to Atlas files
type Tag struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Category  string    `json:"category" db:"category"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// AnalyticsData represents aggregated analytics data
type AnalyticsData struct {
	Period           string  `json:"period"`
	ArchiveCount     int64   `json:"archive_count"`
	AvgSuccessRate   float64 `json:"avg_success_rate"`
	AvgProcessingMs  float64 `json:"avg_processing_ms"`
	TotalTokens      int64   `json:"total_tokens"`
	FailureCount     int64   `json:"failure_count"`
	TopTags          []TagCount `json:"top_tags"`
}

// TagCount represents a tag and its count for analytics
type TagCount struct {
	Tag   string `json:"tag"`
	Count int64  `json:"count"`
}
