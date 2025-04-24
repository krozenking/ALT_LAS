package models_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
)

func TestArchiveModel(t *testing.T) {
	// Test NewArchive
	lastFile := "test_file.last"
	metadata := map[string]interface{}{
		"test_key": "test_value",
	}
	
	archive := models.NewArchive(lastFile, metadata)
	
	assert.NotEqual(t, uuid.Nil, archive.ID)
	assert.Equal(t, lastFile, archive.LastFile)
	assert.Equal(t, models.ArchiveStatusPending, archive.Status)
	assert.Equal(t, metadata, archive.Metadata)
	assert.False(t, archive.CreatedAt.IsZero())
	assert.False(t, archive.UpdatedAt.IsZero())
	assert.Nil(t, archive.ProcessedAt)
	
	// Test ToResponse
	response := archive.ToResponse()
	
	assert.Equal(t, archive.ID.String(), response.ID)
	assert.Equal(t, archive.Status, response.Status)
	assert.Equal(t, archive.LastFile, response.LastFile)
	assert.Equal(t, archive.Metadata, response.Metadata)
	assert.Equal(t, archive.CreatedAt, response.CreatedAt)
	assert.Equal(t, archive.UpdatedAt, response.UpdatedAt)
	assert.Nil(t, response.ProcessedAt)
	
	// Test with processed state
	now := time.Now()
	archive.Status = models.ArchiveStatusCompleted
	archive.AtlasFile = "test_file.atlas"
	archive.SuccessRate = 0.95
	archive.ProcessedAt = &now
	
	response = archive.ToResponse()
	
	assert.Equal(t, models.ArchiveStatusCompleted, response.Status)
	assert.Equal(t, "test_file.atlas", response.AtlasFile)
	assert.Equal(t, 0.95, response.SuccessRate)
	assert.Equal(t, &now, response.ProcessedAt)
}

func TestArchiveStatusConstants(t *testing.T) {
	assert.Equal(t, "pending", models.ArchiveStatusPending)
	assert.Equal(t, "processing", models.ArchiveStatusProcessing)
	assert.Equal(t, "completed", models.ArchiveStatusCompleted)
	assert.Equal(t, "failed", models.ArchiveStatusFailed)
}

func TestAtlasModels(t *testing.T) {
	// Test AtlasFile model
	atlasFile := models.AtlasFile{
		Version:          "1.0",
		CreatedAt:        time.Now(),
		LastFileRef:      "test_file.last",
		Metadata:         map[string]interface{}{"test": "value"},
		SuccessRate:      0.95,
		ProcessingTimeMs: 1500,
		TokenCount:       1000,
		OriginalPrompt:   "Test prompt",
		SegmentResults: []models.SegmentResult{
			{
				SegmentID:    "seg1",
				SegmentType:  "text",
				SegmentText:  "Test segment",
				Success:      true,
				ResponseText: "Test response",
				ProcessingMs: 500,
				ModelUsed:    "test-model",
				TokensUsed:   100,
				Metadata:     map[string]interface{}{"key": "value"},
			},
		},
		AnalysisResults: map[string]interface{}{"analysis": "result"},
		SystemInfo:      map[string]interface{}{"system": "info"},
	}
	
	assert.Equal(t, "1.0", atlasFile.Version)
	assert.Equal(t, "test_file.last", atlasFile.LastFileRef)
	assert.Equal(t, 0.95, atlasFile.SuccessRate)
	assert.Equal(t, int64(1500), atlasFile.ProcessingTimeMs)
	assert.Equal(t, 1000, atlasFile.TokenCount)
	assert.Equal(t, "Test prompt", atlasFile.OriginalPrompt)
	assert.Len(t, atlasFile.SegmentResults, 1)
	assert.Equal(t, "seg1", atlasFile.SegmentResults[0].SegmentID)
	assert.True(t, atlasFile.SegmentResults[0].Success)
	
	// Test SegmentResult model
	segment := atlasFile.SegmentResults[0]
	assert.Equal(t, "text", segment.SegmentType)
	assert.Equal(t, "Test segment", segment.SegmentText)
	assert.Equal(t, "Test response", segment.ResponseText)
	assert.Equal(t, int64(500), segment.ProcessingMs)
	assert.Equal(t, "test-model", segment.ModelUsed)
	assert.Equal(t, 100, segment.TokensUsed)
	assert.Equal(t, "value", segment.Metadata["key"])
	
	// Test AtlasMetadata model
	metadata := models.AtlasMetadata{
		ID:              "test-id",
		ArchiveID:       "archive-id",
		Version:         "1.0",
		SuccessRate:     0.95,
		ProcessingTimeMs: 1500,
		TokenCount:      1000,
		PromptSummary:   "Test summary",
		Tags:            []string{"tag1", "tag2"},
		CustomMetadata:  map[string]interface{}{"custom": "metadata"},
		CreatedAt:       time.Now(),
	}
	
	assert.Equal(t, "test-id", metadata.ID)
	assert.Equal(t, "archive-id", metadata.ArchiveID)
	assert.Equal(t, "1.0", metadata.Version)
	assert.Equal(t, 0.95, metadata.SuccessRate)
	assert.Equal(t, int64(1500), metadata.ProcessingTimeMs)
	assert.Equal(t, 1000, metadata.TokenCount)
	assert.Equal(t, "Test summary", metadata.PromptSummary)
	assert.Contains(t, metadata.Tags, "tag1")
	assert.Contains(t, metadata.Tags, "tag2")
	assert.Equal(t, "metadata", metadata.CustomMetadata["custom"])
}

func TestAnalyticsModels(t *testing.T) {
	// Test AnalyticsData model
	analytics := models.AnalyticsData{
		Period:          "2025-04-24",
		ArchiveCount:    100,
		AvgSuccessRate:  0.92,
		AvgProcessingMs: 1200.5,
		TotalTokens:     50000,
		FailureCount:    8,
		TopTags: []models.TagCount{
			{Tag: "tag1", Count: 50},
			{Tag: "tag2", Count: 30},
		},
	}
	
	assert.Equal(t, "2025-04-24", analytics.Period)
	assert.Equal(t, int64(100), analytics.ArchiveCount)
	assert.Equal(t, 0.92, analytics.AvgSuccessRate)
	assert.Equal(t, 1200.5, analytics.AvgProcessingMs)
	assert.Equal(t, int64(50000), analytics.TotalTokens)
	assert.Equal(t, int64(8), analytics.FailureCount)
	assert.Len(t, analytics.TopTags, 2)
	assert.Equal(t, "tag1", analytics.TopTags[0].Tag)
	assert.Equal(t, int64(50), analytics.TopTags[0].Count)
	
	// Test TagCount model
	tagCount := analytics.TopTags[1]
	assert.Equal(t, "tag2", tagCount.Tag)
	assert.Equal(t, int64(30), tagCount.Count)
}

func TestSearchQuery(t *testing.T) {
	// Test SearchQuery model
	now := time.Now()
	query := models.SearchQuery{
		Query:       "test",
		Status:      "completed",
		StartDate:   now.AddDate(0, -1, 0), // 1 month ago
		EndDate:     now,
		MinSuccess:  0.8,
		MaxSuccess:  1.0,
		Limit:       20,
		Offset:      40,
		SortBy:      "success_rate",
		SortOrder:   "desc",
	}
	
	assert.Equal(t, "test", query.Query)
	assert.Equal(t, "completed", query.Status)
	assert.True(t, query.StartDate.Before(query.EndDate))
	assert.Equal(t, 0.8, query.MinSuccess)
	assert.Equal(t, 1.0, query.MaxSuccess)
	assert.Equal(t, 20, query.Limit)
	assert.Equal(t, 40, query.Offset)
	assert.Equal(t, "success_rate", query.SortBy)
	assert.Equal(t, "desc", query.SortOrder)
}
