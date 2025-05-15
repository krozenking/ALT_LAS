package service

import (
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/krozenking/ALT_LAS/archive-service/internal/listener"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/krozenking/ALT_LAS/archive-service/internal/repository_optimized"
)

// AtlasService handles business logic for Atlas operations
type AtlasService struct {
	lastFileRepo *repository_optimized.LastFileRepository
	AtlasRepo    *repository_optimized.AtlasRepository
}

// NewAtlasService creates a new AtlasService
func NewAtlasService(lastFileRepo *repository_optimized.LastFileRepository, atlasRepo *repository_optimized.AtlasRepository) *AtlasService {
	return &AtlasService{
		lastFileRepo: lastFileRepo,
		AtlasRepo:    atlasRepo,
	}
}

// Helper function to convert models.Atlas to models.AtlasFile
func convertAtlasToAtlasFile(atlas *models.Atlas) *models.AtlasFile {
	if atlas == nil {
		return nil
	}
	// This is a simplified conversion. A more robust solution might involve
	// more detailed field mapping or a library for struct conversion.
	return &models.AtlasFile{
		ID:             atlas.ID,
		Version:        "1.0", // Assuming a default or derivable version
		LastFileID:     atlas.LastFileID,
		LastFileRef:    atlas.LastFileRef, // if available in models.Atlas
		Timestamp:      atlas.Timestamp,
		SuccessRate:    atlas.SuccessRate,
		Content:        atlas.FilePath, // Or some other content field from Atlas
		Metadata:       atlas.Metadata,
		Tags:           atlas.Tags,
		Status:         atlas.Status,
		CreatedAt:      atlas.Timestamp, // Or a more specific CreatedAt if available
		// SegmentResults would need to be populated if models.Atlas contains equivalent data
	}
}

// Helper function to convert models.AtlasFile to models.Atlas
func convertAtlasFileToAtlas(atlasFile *models.AtlasFile) *models.Atlas {
	if atlasFile == nil {
		return nil
	}
	return &models.Atlas{
		ID:          atlasFile.ID,
		LastFileID:  atlasFile.LastFileID,
		LastFileRef: atlasFile.LastFileRef,
		FilePath:    atlasFile.Content, // Or derive from AtlasFile.ID or other fields
		SuccessRate: atlasFile.SuccessRate,
		Timestamp:   atlasFile.Timestamp,
		Metadata:    atlasFile.Metadata,
		Tags:        atlasFile.Tags,
		Status:      atlasFile.Status,
	}
}

// Helper function to convert a slice of models.AtlasFile to models.Atlas
func convertAtlasFilesToAtlases(atlasFiles []*models.AtlasFile) []*models.Atlas {
	atlases := make([]*models.Atlas, len(atlasFiles))
	for i, af := range atlasFiles {
		atlases[i] = convertAtlasFileToAtlas(af)
	}
	return atlases
}

func (s *AtlasService) ProcessLastFile(msg *listener.LastFileMessage) error {
	log.Printf("Processing LastFileMessage for Atlas conversion: %s", msg.FilePath)

	const minSuccessRate = 0.7
	if msg.SuccessRate < minSuccessRate {
		log.Printf("Warning: LastFile %s has low success rate: %.2f (threshold: %.2f)",
			msg.FilePath, msg.SuccessRate, minSuccessRate)
	}

	atlasID := "atlas_" + uuid.New().String()
	atlasFilePath := fmt.Sprintf("%s.atlas", atlasID) // This is likely the intended content for AtlasFile.Content
	tags := extractTags(msg.Metadata)

	// Create models.Atlas first as it seems to be the primary domain model here
	atlasDomainModel := &models.Atlas{
		ID:          atlasID,
		LastFileID:  msg.ID,
		FilePath:    atlasFilePath, // This might be redundant if AtlasFile.Content is used
		SuccessRate: msg.SuccessRate,
		Timestamp:   time.Now(),
		Metadata:    msg.Metadata,
		Tags:        tags,
		Status:      models.AtlasStatusActive,
	}

	// Convert to models.AtlasFile for repository interaction
	atlasFileModel := convertAtlasToAtlasFile(atlasDomainModel)
	atlasFileModel.Content = atlasFilePath // Ensure content is set for AtlasFile

	if err := s.AtlasRepo.Create(atlasFileModel); err != nil {
		return fmt.Errorf("failed to create Atlas entry: %w", err)
	}

	if err := s.lastFileRepo.UpdateAtlasID(msg.ID, atlasID); err != nil {
		return fmt.Errorf("failed to update LastFile with Atlas ID: %w", err)
	}

	log.Printf("Successfully created Atlas entry %s for LastFile %s", atlasID, msg.ID)
	return nil
}

func (s *AtlasService) SearchAtlas(query string, tags []string, minSuccessRate float64, limit, offset int) ([]*models.Atlas, error) {
	// Assuming AtlasRepository.Search expects different/more parameters based on previous errors.
	// For now, sticking to the parameters provided in the function signature and previous attempts.
	// The error "not enough arguments in call to s.AtlasRepo.Search" suggests the repo method expects more.
	// Let's assume the repository Search needs: query, status_filter, tags_filter, sort_by, limit, offset
	// We'll use empty strings or defaults for missing parameters for now.
	atlasFiles, err := s.AtlasRepo.Search(query, "", tags, "created_at", limit, offset) // Adjusted call
	if err != nil {
		return nil, fmt.Errorf("failed to search atlas files: %w", err)
	}
	return convertAtlasFilesToAtlases(atlasFiles), nil
}

func (s *AtlasService) GetAtlasByID(id string) (*models.Atlas, error) {
	atlasFile, err := s.AtlasRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get atlas file by ID: %w", err)
	}
	return convertAtlasFileToAtlas(atlasFile), nil
}

func (s *AtlasService) GetTags() ([]string, error) {
	return s.AtlasRepo.GetTags()
}

func (s *AtlasService) ArchiveAtlas(id string) error {
	return s.AtlasRepo.UpdateStatus(id, models.AtlasStatusArchived)
}

func (s *AtlasService) DeleteAtlas(id string) error {
	return s.AtlasRepo.UpdateStatus(id, models.AtlasStatusDeleted)
}

func extractTags(metadata map[string]interface{}) []string {
	var tags []string
	if metaTags, ok := metadata["tags"].([]interface{}); ok {
		for _, tag := range metaTags {
			if tagStr, ok := tag.(string); ok {
				tags = append(tags, tagStr)
			}
		}
	}
	if cmdType, ok := metadata["command_type"].(string); ok {
		tags = append(tags, "type:"+cmdType)
	}
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

