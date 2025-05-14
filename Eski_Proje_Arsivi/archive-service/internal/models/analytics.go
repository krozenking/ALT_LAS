package models

import "time"

// AnalyticsData stores aggregated statistics for analytics.
type AnalyticsData struct {
    ID                string    `json:"id" db:"id"`
    Period            string    `json:"period" db:"period"` // Added: Date string or period identifier
    TotalRuns         int       `json:"total_runs" db:"total_runs"` // Kept for potential broader use, though repository uses ArchiveCount
    SuccessfulRuns    int       `json:"successful_runs" db:"successful_runs"` // Kept for potential broader use
    FailedRuns        int       `json:"failed_runs" db:"failed_runs"` // Kept for potential broader use, though repository uses FailureCount
    AverageSuccessRate float64  `json:"average_success_rate" db:"average_success_rate"` // Renamed from avg_success_rate in repo query for consistency
    ArchiveCount      int64     `json:"archive_count" db:"archive_count"` // Added
    AvgSuccessRate    float64   `json:"avg_success_rate" db:"avg_success_rate"` // Added, as used in repo query
    AvgProcessingMs   float64   `json:"avg_processing_ms" db:"avg_processing_ms"` // Added
    TotalTokens       int64     `json:"total_tokens" db:"total_tokens"` // Added
    FailureCount      int64     `json:"failure_count" db:"failure_count"` // Added
    TopTags           []TagCount `json:"top_tags" db:"top_tags"` // Added, assuming TagCount is defined
    Date              time.Time `json:"date" db:"date"` // Original field, might be redundant if Period is used
    CreatedAt         time.Time `json:"created_at" db:"created_at"`
    UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// TagCount stores a tag and its frequency.
type TagCount struct {
    Tag   string `json:"tag" db:"tag"`
    Count int    `json:"count" db:"count"`
}

