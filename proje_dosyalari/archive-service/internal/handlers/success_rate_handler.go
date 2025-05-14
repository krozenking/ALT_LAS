package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/krozenking/ALT_LAS/archive-service/internal/service"
)

// SuccessRateHandler handles HTTP requests for success rate operations
type SuccessRateHandler struct {
	successRateService *service.SuccessRateService
}

// NewSuccessRateHandler creates a new SuccessRateHandler
func NewSuccessRateHandler(successRateService *service.SuccessRateService) *SuccessRateHandler {
	return &SuccessRateHandler{
		successRateService: successRateService,
	}
}

// GetSuccessRateStatsHandler handles requests to get success rate statistics
func (h *SuccessRateHandler) GetSuccessRateStatsHandler(w http.ResponseWriter, r *http.Request) {
	// Get success rate statistics
	stats, err := h.successRateService.GetSuccessRateStats()
	if err != nil {
		http.Error(w, "Failed to get success rate statistics: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GetSuccessRateDistributionHandler handles requests to get success rate distribution
func (h *SuccessRateHandler) GetSuccessRateDistributionHandler(w http.ResponseWriter, r *http.Request) {
	// Get success rate distribution
	distribution, err := h.successRateService.AnalyzeSuccessRateDistribution()
	if err != nil {
		http.Error(w, "Failed to get success rate distribution: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(distribution)
}

// GetLowSuccessRateEntriesHandler handles requests to get entries with low success rates
func (h *SuccessRateHandler) GetLowSuccessRateEntriesHandler(w http.ResponseWriter, r *http.Request) {
	// Parse limit parameter
	limitStr := r.URL.Query().Get("limit")
	limit := 10 // Default limit
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	// Get low success rate entries
	entries, err := h.successRateService.GetLowSuccessRateEntries(limit)
	if err != nil {
		http.Error(w, "Failed to get low success rate entries: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create response
	response := map[string]interface{}{
		"entries": entries,
		"count":   len(entries),
		"threshold": service.SuccessRateThreshold,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CheckSuccessRateHandler handles requests to check a specific success rate
func (h *SuccessRateHandler) CheckSuccessRateHandler(w http.ResponseWriter, r *http.Request) {
	// Parse success rate parameter
	rateStr := r.URL.Query().Get("rate")
	if rateStr == "" {
		http.Error(w, "Missing rate parameter", http.StatusBadRequest)
		return
	}

	rate, err := strconv.ParseFloat(rateStr, 64)
	if err != nil {
		http.Error(w, "Invalid rate parameter", http.StatusBadRequest)
		return
	}

	// Check success rate
	meets := h.successRateService.CheckSuccessRate(rate)
	category := h.successRateService.GetSuccessRateCategory(rate)

	// Create response
	response := map[string]interface{}{
		"rate":      rate,
		"meets_threshold": meets,
		"threshold": service.SuccessRateThreshold,
		"category":  category,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
