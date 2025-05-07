package models

// SegmentResult represents the result of a segment processing.
// This structure is updated to include fields expected by tests.
type SegmentResult struct {
    SegmentID     string                 `json:"segment_id"`
    Success       bool                   `json:"success"`
    Output        string                 `json:"output,omitempty"`
    Error         string                 `json:"error,omitempty"`
    Metrics       interface{}            `json:"metrics,omitempty"`      // Placeholder for any metrics
    SegmentType   string                 `json:"segment_type,omitempty"` // Added based on test error
    SegmentText   string                 `json:"segment_text,omitempty"` // Added based on test error
    ResponseText  string                 `json:"response_text,omitempty"`// Added based on test error
    ProcessingMs  int64                  `json:"processing_ms,omitempty"`// Added based on test error
    ModelUsed     string                 `json:"model_used,omitempty"`   // Added based on test error
    TokensUsed    int                    `json:"tokens_used,omitempty"`  // Added based on test error
    Metadata      map[string]interface{} `json:"metadata,omitempty"`    // Added based on test error, assuming map
}

