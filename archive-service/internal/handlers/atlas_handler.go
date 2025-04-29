package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/krozenking/ALT_LAS/archive-service/internal/service"
)

// AtlasHandler handles HTTP requests for Atlas operations
type AtlasHandler struct {
	atlasService *service.AtlasService
}

// NewAtlasHandler creates a new AtlasHandler
func NewAtlasHandler(atlasService *service.AtlasService) *AtlasHandler {
	return &AtlasHandler{
		atlasService: atlasService,
	}
}

// SearchAtlasHandler handles search requests for Atlas entries
func (h *AtlasHandler) SearchAtlasHandler(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	query := r.URL.Query().Get("query")
	tagsParam := r.URL.Query().Get("tags")
	minSuccessRateStr := r.URL.Query().Get("min_success_rate")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	// Parse tags
	var tags []string
	if tagsParam != "" {
		if err := json.Unmarshal([]byte(tagsParam), &tags); err != nil {
			http.Error(w, "Invalid tags format", http.StatusBadRequest)
			return
		}
	}

	// Parse min success rate
	var minSuccessRate float64
	if minSuccessRateStr != "" {
		var err error
		minSuccessRate, err = strconv.ParseFloat(minSuccessRateStr, 64)
		if err != nil {
			http.Error(w, "Invalid min_success_rate", http.StatusBadRequest)
			return
		}
	}

	// Parse limit and offset
	limit := 10 // Default limit
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	offset := 0 // Default offset
	if offsetStr != "" {
		parsedOffset, err := strconv.Atoi(offsetStr)
		if err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Search Atlas entries
	results, err := h.atlasService.SearchAtlas(query, tags, minSuccessRate, limit, offset)
	if err != nil {
		http.Error(w, "Failed to search Atlas entries: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create response
	response := map[string]interface{}{
		"results": results,
		"count":   len(results),
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetAtlasHandler handles requests to get a specific Atlas entry
func (h *AtlasHandler) GetAtlasHandler(w http.ResponseWriter, r *http.Request) {
	// Get Atlas ID from URL
	vars := mux.Vars(r)
	atlasID := vars["id"]

	// Get Atlas entry
	atlas, err := h.atlasService.GetAtlasByID(atlasID)
	if err != nil {
		http.Error(w, "Failed to get Atlas entry: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if atlas == nil {
		http.Error(w, "Atlas entry not found", http.StatusNotFound)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(atlas)
}

// GetTagsHandler handles requests to get all unique tags
func (h *AtlasHandler) GetTagsHandler(w http.ResponseWriter, r *http.Request) {
	// Get all tags
	tags, err := h.atlasService.GetTags()
	if err != nil {
		http.Error(w, "Failed to get tags: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create response
	response := map[string]interface{}{
		"tags":  tags,
		"count": len(tags),
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ArchiveAtlasHandler handles requests to archive an Atlas entry
func (h *AtlasHandler) ArchiveAtlasHandler(w http.ResponseWriter, r *http.Request) {
	// Get Atlas ID from URL
	vars := mux.Vars(r)
	atlasID := vars["id"]

	// Archive Atlas entry
	err := h.atlasService.ArchiveAtlas(atlasID)
	if err != nil {
		http.Error(w, "Failed to archive Atlas entry: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"id":      atlasID,
		"status":  models.AtlasStatusArchived,
		"message": "Atlas entry archived successfully",
	})
}

// DeleteAtlasHandler handles requests to delete an Atlas entry
func (h *AtlasHandler) DeleteAtlasHandler(w http.ResponseWriter, r *http.Request) {
	// Get Atlas ID from URL
	vars := mux.Vars(r)
	atlasID := vars["id"]

	// Delete Atlas entry
	err := h.atlasService.DeleteAtlas(atlasID)
	if err != nil {
		http.Error(w, "Failed to delete Atlas entry: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"id":      atlasID,
		"status":  models.AtlasStatusDeleted,
		"message": "Atlas entry deleted successfully",
	})
}

// CreateMockAtlasHandler handles requests to create a mock Atlas entry (for testing)
func (h *AtlasHandler) CreateMockAtlasHandler(w http.ResponseWriter, r *http.Request) {
	// Create a mock Atlas entry
	atlasID := "atlas_" + uuid.New().String()
	lastFileID := "last_" + uuid.New().String()
	
	atlas := &models.Atlas{
		ID:          atlasID,
		LastFileID:  lastFileID,
		FilePath:    "mock_" + atlasID + ".atlas",
		SuccessRate: 0.95,
		Timestamp:   time.Now(),
		Metadata: map[string]interface{}{
			"command_type": "mock",
			"source":       "test",
		},
		Tags:   []string{"mock", "test", "success:high"},
		Status: models.AtlasStatusActive,
	}

	// Save Atlas entry
	err := h.atlasService.atlasRepo.Create(atlas)
	if err != nil {
		http.Error(w, "Failed to create mock Atlas entry: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(atlas)
}
