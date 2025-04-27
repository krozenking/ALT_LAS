package service

import (
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/krozenking/ALT_LAS/archive-service/internal/listener"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/krozenking/ALT_LAS/archive-service/internal/repository"
)

// AtlasService handles business logic for Atlas operations
type AtlasService struct {
	lastFileRepo *repository.LastFileRepository
	atlasRepo    *repository.AtlasRepository
}

// NewAtlasService creates a new AtlasService
func NewAtlasService(lastFileRepo *repository.LastFileRepository, atlasRepo *repository.AtlasRepository) *AtlasService {
	return &AtlasService{
		lastFileRepo: lastFileRepo,
		atlasRepo:    atlasRepo,
	}
}

// ProcessLastFile processes a LastFileMessage and creates an Atlas entry
func (s *AtlasService) ProcessLastFile(msg *listener.LastFileMessage) error {
	log.Printf("Processing LastFileMessage for Atlas conversion: %s", msg.FilePath)

	// Check if success rate meets minimum threshold
	const minSuccessRate = 0.7 // 70%
	if msg.SuccessRate < minSuccessRate {
		log.Printf("Warning: LastFile %s has low success rate: %.2f (threshold: %.2f)",
			msg.FilePath, msg.SuccessRate, minSuccessRate)
	}

	// Create Atlas entry
	atlasID := "atlas_" + uuid.New().String()
	atlasFilePath := fmt.Sprintf("%s.atlas", atlasID)

	// Extract tags from metadata
	tags := extractTags(msg.Metadata)

	// Create Atlas model
	atlas := &models.Atlas{
		ID:          atlasID,
		LastFileID:  msg.ID,
		FilePath:    atlasFilePath,
		SuccessRate: msg.SuccessRate,
		Timestamp:   time.Now(),
		Metadata:    msg.Metadata,
		Tags:        tags,
		Status:      models.AtlasStatusActive,
	}

	// Save Atlas entry to database
	if err := s.atlasRepo.Create(atlas); err != nil {
		return fmt.Errorf("failed to create Atlas entry: %w", err)
	}

	// Update LastFile with Atlas ID
	if err := s.lastFileRepo.UpdateAtlasID(msg.ID, atlasID); err != nil {
		return fmt.Errorf("failed to update LastFile with Atlas ID: %w", err)
	}

	log.Printf("Successfully created Atlas entry %s for LastFile %s", atlasID, msg.ID)
	return nil
}

// SearchAtlas searches Atlas entries based on criteria
func (s *AtlasService) SearchAtlas(query string, tags []string, minSuccessRate float64, limit, offset int) ([]*models.Atlas, error) {
	return s.atlasRepo.Search(query, tags, minSuccessRate, limit, offset)
}

// GetAtlasByID retrieves an Atlas entry by ID
func (s *AtlasService) GetAtlasByID(id string) (*models.Atlas, error) {
	return s.atlasRepo.GetByID(id)
}

// GetTags returns all unique tags used in Atlas entries
func (s *AtlasService) GetTags() ([]string, error) {
	return s.atlasRepo.GetTags()
}

// ArchiveAtlas archives an Atlas entry
func (s *AtlasService) ArchiveAtlas(id string) error {
	return s.atlasRepo.UpdateStatus(id, models.AtlasStatusArchived)
}

// DeleteAtlas marks an Atlas entry as deleted
func (s *AtlasService) DeleteAtlas(id string) error {
	return s.atlasRepo.UpdateStatus(id, models.AtlasStatusDeleted)
}

// Helper function to extract tags from metadata
func extractTags(metadata map[string]interface{}) []string {
	var tags []string

	// Extract tags directly from metadata if available
	if metaTags, ok := metadata["tags"].([]interface{}); ok {
		for _, tag := range metaTags {
			if tagStr, ok := tag.(string); ok {
				tags = append(tags, tagStr)
			}
		}
	}

	// Extract command type as a tag if available
	if cmdType, ok := metadata["command_type"].(string); ok {
		tags = append(tags, "type:"+cmdType)
	}

	// Extract success rate range as a tag
	if successRate, ok := metadata["success_rate"].(float64); ok {
		if successRate >= 0.9 {
			tags = append(tags, "success:high")
		} else if successRate >= 0.7 {
			tags = append(tags, "success:medium")
		} else {
			tags = append(tags, "success:low")
		}
	}

	return tags
}
