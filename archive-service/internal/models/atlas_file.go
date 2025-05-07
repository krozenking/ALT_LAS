package models

import "time"

// AtlasFile represents the structure of an .atlas file content.
// This is a placeholder and should be defined based on the actual
// structure and requirements of .atlas files in the project.
type AtlasFile struct {
    ID                string                 `json:"id,omitempty" db:"id"`
    Version           string                 `json:"version" db:"version"`
    LastFileID        string                 `json:"last_file_id" db:"last_file_id"`
    LastFileRef       string                 `json:"last_file_ref,omitempty" db:"last_file_ref"`
    Timestamp         time.Time              `json:"timestamp" db:"timestamp"`
    SuccessRate       float64                `json:"success_rate" db:"success_rate"`
    SegmentResults    []SegmentResult        `json:"segment_results" db:"segment_results"` // Changed from Segments to SegmentResults based on test error
    Summary           string                 `json:"summary,omitempty" db:"summary"`
    RawOutput         string                 `json:"raw_output,omitempty" db:"raw_output"`
    Content           string                 `json:"content,omitempty" db:"content"`
    Metadata          map[string]interface{} `json:"metadata,omitempty" db:"metadata"` // This was already map[string]interface{}
    Tags              []string               `json:"tags,omitempty" db:"tags"`
    Status            string                 `json:"status,omitempty" db:"status"`
    CreatedAt         time.Time              `json:"created_at,omitempty" db:"created_at"`
    ProcessingTimeMs  int64                  `json:"processing_time_ms,omitempty" db:"processing_time_ms"`
    TokenCount        int                    `json:"token_count,omitempty" db:"token_count"`
    OriginalPrompt    string                 `json:"original_prompt,omitempty" db:"original_prompt"`
    AnalysisResults   map[string]interface{} `json:"analysis_results,omitempty" db:"analysis_results"`
    SystemInfo        map[string]interface{} `json:"system_info,omitempty" db:"system_info"`
}

