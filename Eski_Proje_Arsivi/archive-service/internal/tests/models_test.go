package tests

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/krozenking/ALT_LAS/archive-service/internal/listener"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLastFileProcessor(t *testing.T) {
	// Create a processor with a threshold
	processor := listener.NewLastFileProcessor(0.7)

	// Create a test message
	msg := &listener.LastFileMessage{
		ID:         uuid.New().String(),
		FilePath:   "/path/to/test.last",
		SuccessRate: 0.85,
		Timestamp:  time.Now(),
		Metadata: map[string]interface{}{
			"command_type": "test",
			"source":      "unit_test",
		},
	}

	// Process the message
	err := processor.ProcessLastFile(msg)
	
	// Assert no error
	assert.NoError(t, err)
}

func TestLastFileModel(t *testing.T) {
	// Create a LastFile model
	lastFile := &models.LastFile{
		ID:          uuid.New().String(),
		FilePath:    "/path/to/test.last",
		SuccessRate: 0.85,
		Timestamp:   time.Now(),
		Metadata: map[string]interface{}{
			"command_type": "test",
			"source":      "unit_test",
		},
		Status:    models.LastFileStatusReceived,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Assert fields are set correctly
	assert.NotEmpty(t, lastFile.ID)
	assert.Equal(t, "/path/to/test.last", lastFile.FilePath)
	assert.Equal(t, 0.85, lastFile.SuccessRate)
	assert.Equal(t, models.LastFileStatusReceived, lastFile.Status)
}

func TestAtlasModel(t *testing.T) {
	// Create an Atlas model
	atlas := &models.Atlas{
		ID:          uuid.New().String(),
		LastFileID:  uuid.New().String(),
		FilePath:    "/path/to/test.atlas",
		SuccessRate: 0.85,
		Timestamp:   time.Now(),
		Metadata: map[string]interface{}{
			"command_type": "test",
			"source":      "unit_test",
		},
		Tags:      []string{"test", "unit_test", "success:high"},
		Status:    models.AtlasStatusActive,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Assert fields are set correctly
	assert.NotEmpty(t, atlas.ID)
	assert.NotEmpty(t, atlas.LastFileID)
	assert.Equal(t, "/path/to/test.atlas", atlas.FilePath)
	assert.Equal(t, 0.85, atlas.SuccessRate)
	assert.Equal(t, models.AtlasStatusActive, atlas.Status)
	assert.Len(t, atlas.Tags, 3)
	assert.Contains(t, atlas.Tags, "test")
	assert.Contains(t, atlas.Tags, "unit_test")
	assert.Contains(t, atlas.Tags, "success:high")
}

func TestJSONSerialization(t *testing.T) {
	// Create a LastFile model
	lastFile := &models.LastFile{
		ID:          uuid.New().String(),
		FilePath:    "/path/to/test.last",
		SuccessRate: 0.85,
		Timestamp:   time.Now(),
		Metadata: map[string]interface{}{
			"command_type": "test",
			"source":      "unit_test",
		},
		Status:    models.LastFileStatusReceived,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Serialize to JSON
	jsonData, err := json.Marshal(lastFile)
	require.NoError(t, err)
	assert.NotEmpty(t, jsonData)

	// Deserialize from JSON
	var deserializedLastFile models.LastFile
	err = json.Unmarshal(jsonData, &deserializedLastFile)
	require.NoError(t, err)

	// Assert fields match
	assert.Equal(t, lastFile.ID, deserializedLastFile.ID)
	assert.Equal(t, lastFile.FilePath, deserializedLastFile.FilePath)
	assert.Equal(t, lastFile.SuccessRate, deserializedLastFile.SuccessRate)
	assert.Equal(t, lastFile.Status, deserializedLastFile.Status)
}
