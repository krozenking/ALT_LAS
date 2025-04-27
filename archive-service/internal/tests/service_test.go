package tests

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/krozenking/ALT_LAS/archive-service/internal/service"
	"github.com/stretchr/testify/assert"
)

func TestSuccessRateService(t *testing.T) {
	// Create a success rate service (with nil repositories since we're not testing DB operations)
	successRateService := service.NewSuccessRateService(nil, nil)

	// Test CheckSuccessRate
	assert.True(t, successRateService.CheckSuccessRate(0.8), "Success rate of 0.8 should pass threshold")
	assert.True(t, successRateService.CheckSuccessRate(0.7), "Success rate of 0.7 should pass threshold")
	assert.False(t, successRateService.CheckSuccessRate(0.6), "Success rate of 0.6 should fail threshold")

	// Test GetSuccessRateCategory
	assert.Equal(t, "high", successRateService.GetSuccessRateCategory(0.95))
	assert.Equal(t, "medium", successRateService.GetSuccessRateCategory(0.8))
	assert.Equal(t, "low", successRateService.GetSuccessRateCategory(0.5))

	// Test GetSuccessRateStats
	stats, err := successRateService.GetSuccessRateStats()
	assert.NoError(t, err)
	assert.NotNil(t, stats)
	assert.Equal(t, service.SuccessRateThreshold, stats.ThresholdValue)
	assert.Greater(t, stats.AverageRate, 0.0)
	assert.Greater(t, stats.TotalProcessed, 0)

	// Test AnalyzeSuccessRateDistribution
	distribution, err := successRateService.AnalyzeSuccessRateDistribution()
	assert.NoError(t, err)
	assert.NotNil(t, distribution)
	assert.Greater(t, len(distribution), 0)
}

func TestExtractTags(t *testing.T) {
	// This is a private function, so we can't test it directly
	// Instead, we'll test the behavior through the AtlasService

	// Create test metadata
	metadata := map[string]interface{}{
		"command_type": "test_command",
		"success_rate": 0.95,
		"tags": []interface{}{"test", "unit_test"},
	}

	// Create a mock LastFileMessage
	msg := &listener.LastFileMessage{
		ID:          uuid.New().String(),
		FilePath:    "/path/to/test.last",
		SuccessRate: 0.95,
		Timestamp:   time.Now(),
		Metadata:    metadata,
	}

	// Create an AtlasService (with nil repositories since we're mocking)
	atlasService := service.NewAtlasService(nil, nil)

	// Process the message (this will call extractTags internally)
	// Since we can't access the private function directly, we'll just verify
	// that the service doesn't panic when processing a message with tags
	err := atlasService.ProcessLastFile(msg)
	
	// We expect an error since we're using nil repositories
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "failed to create Atlas entry")
}
