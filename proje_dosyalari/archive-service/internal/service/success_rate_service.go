package service

import (
	"log"
	"time"

	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/krozenking/ALT_LAS/archive-service/internal/repository_optimized"
)

// SuccessRateService handles success rate analysis and reporting
type SuccessRateService struct {
	lastFileRepo *repository_optimized.LastFileRepository // Changed to repository_optimized
	atlasRepo    *repository_optimized.AtlasRepository    // Changed to repository_optimized
}

// NewSuccessRateService creates a new SuccessRateService
func NewSuccessRateService(lastFileRepo *repository_optimized.LastFileRepository, atlasRepo *repository_optimized.AtlasRepository) *SuccessRateService {
	return &SuccessRateService{
		lastFileRepo: lastFileRepo,
		atlasRepo:    atlasRepo,
	}
}

// SuccessRateThreshold defines the minimum acceptable success rate
const SuccessRateThreshold = 0.7 // 70%

// SuccessRateStats contains statistics about success rates
type SuccessRateStats struct {
	AverageRate     float64   `json:"average_rate"`
	MinRate         float64   `json:"min_rate"`
	MaxRate         float64   `json:"max_rate"`
	BelowThreshold  int       `json:"below_threshold"`
	AboveThreshold  int       `json:"above_threshold"`
	TotalProcessed  int       `json:"total_processed"`
	ThresholdValue  float64   `json:"threshold_value"`
	LastUpdated     time.Time `json:"last_updated"`
}

// CheckSuccessRate checks if a success rate meets the threshold
func (s *SuccessRateService) CheckSuccessRate(rate float64) bool {
	return rate >= SuccessRateThreshold
}

// GetSuccessRateCategory returns a category based on success rate
func (s *SuccessRateService) GetSuccessRateCategory(rate float64) string {
	if rate >= 0.9 {
		return "high"
	} else if rate >= SuccessRateThreshold {
		return "medium"
	}
	return "low"
}

// GetSuccessRateStats calculates success rate statistics
// This method would need to be updated to use the repository_optimized methods
// if it were to fetch live data. For now, it returns mock data.
func (s *SuccessRateService) GetSuccessRateStats() (*SuccessRateStats, error) {
	// In a real implementation, this would query the database using s.lastFileRepo or s.atlasRepo
	// For now, we'll return mock statistics

	stats := &SuccessRateStats{
		AverageRate:     0.85,
		MinRate:         0.45,
		MaxRate:         0.99,
		BelowThreshold:  12,
		AboveThreshold:  88,
		TotalProcessed:  100,
		ThresholdValue:  SuccessRateThreshold,
		LastUpdated:     time.Now(),
	}

	return stats, nil
}

// AnalyzeSuccessRateDistribution analyzes the distribution of success rates
// This method would need to be updated to use the repository_optimized methods
// if it were to fetch live data. For now, it returns mock data.
func (s *SuccessRateService) AnalyzeSuccessRateDistribution() (map[string]int, error) {
	// In a real implementation, this would query the database
	// For now, we'll return mock distribution

	distribution := map[string]int{
		"0.0-0.1": 0,
		"0.1-0.2": 1,
		"0.2-0.3": 2,
		"0.3-0.4": 3,
		"0.4-0.5": 6,
		"0.5-0.6": 8,
		"0.6-0.7": 10,
		"0.7-0.8": 25,
		"0.8-0.9": 30,
		"0.9-1.0": 15,
	}

	return distribution, nil
}

// GetLowSuccessRateEntries retrieves entries with low success rates
// This method would need to be updated to use the repository_optimized methods
// if it were to fetch live data. For now, it returns mock data.
func (s *SuccessRateService) GetLowSuccessRateEntries(limit int) ([]*models.Atlas, error) {
	// In a real implementation, this would query the database using s.atlasRepo
	// For now, we'll return an empty slice
	return []*models.Atlas{}, nil
}

// LogSuccessRateAlert logs an alert for low success rates
func (s *SuccessRateService) LogSuccessRateAlert(id string, rate float64) {
	log.Printf("SUCCESS RATE ALERT: Entry %s has a low success rate of %.2f (threshold: %.2f)",
		id, rate, SuccessRateThreshold)
}

