package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
)

// AtlasMetadataRepository defines the interface for atlas metadata operations
type AtlasMetadataRepository interface {
	Create(ctx context.Context, metadata *models.AtlasMetadata) error
	GetByID(ctx context.Context, id string) (*models.AtlasMetadata, error)
	GetByArchiveID(ctx context.Context, archiveID string) (*models.AtlasMetadata, error)
	Update(ctx context.Context, metadata *models.AtlasMetadata) error
	Delete(ctx context.Context, id string) error
	ListByTags(ctx context.Context, tags []string, limit, offset int) ([]*models.AtlasMetadata, int64, error)
	SearchByMetadata(ctx context.Context, query map[string]interface{}, limit, offset int) ([]*models.AtlasMetadata, int64, error)
}

// PostgresAtlasMetadataRepository implements AtlasMetadataRepository using PostgreSQL
type PostgresAtlasMetadataRepository struct {
	db *sqlx.DB
}

// NewPostgresAtlasMetadataRepository creates a new PostgreSQL atlas metadata repository
func NewPostgresAtlasMetadataRepository(db *sqlx.DB) *PostgresAtlasMetadataRepository {
	return &PostgresAtlasMetadataRepository{
		db: db,
	}
}

// Create inserts a new atlas metadata record
func (r *PostgresAtlasMetadataRepository) Create(ctx context.Context, metadata *models.AtlasMetadata) error {
	query := `
		INSERT INTO atlas_metadata (
			id, archive_id, version, success_rate, processing_time_ms, token_count, 
			prompt_summary, tags, custom_metadata, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		metadata.ID,
		metadata.ArchiveID,
		metadata.Version,
		metadata.SuccessRate,
		metadata.ProcessingTimeMs,
		metadata.TokenCount,
		metadata.PromptSummary,
		metadata.Tags,
		metadata.CustomMetadata,
		metadata.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create atlas metadata: %w", err)
	}

	return nil
}

// GetByID retrieves atlas metadata by ID
func (r *PostgresAtlasMetadataRepository) GetByID(ctx context.Context, id string) (*models.AtlasMetadata, error) {
	query := `
		SELECT 
			id, archive_id, version, success_rate, processing_time_ms, token_count, 
			prompt_summary, tags, custom_metadata, created_at
		FROM 
			atlas_metadata
		WHERE 
			id = $1
	`

	var metadata models.AtlasMetadata
	err := r.db.GetContext(ctx, &metadata, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("atlas metadata not found: %s", id)
		}
		return nil, fmt.Errorf("failed to get atlas metadata: %w", err)
	}

	return &metadata, nil
}

// GetByArchiveID retrieves atlas metadata by archive ID
func (r *PostgresAtlasMetadataRepository) GetByArchiveID(ctx context.Context, archiveID string) (*models.AtlasMetadata, error) {
	query := `
		SELECT 
			id, archive_id, version, success_rate, processing_time_ms, token_count, 
			prompt_summary, tags, custom_metadata, created_at
		FROM 
			atlas_metadata
		WHERE 
			archive_id = $1
	`

	var metadata models.AtlasMetadata
	err := r.db.GetContext(ctx, &metadata, query, archiveID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("atlas metadata not found for archive: %s", archiveID)
		}
		return nil, fmt.Errorf("failed to get atlas metadata by archive ID: %w", err)
	}

	return &metadata, nil
}

// Update updates an existing atlas metadata
func (r *PostgresAtlasMetadataRepository) Update(ctx context.Context, metadata *models.AtlasMetadata) error {
	query := `
		UPDATE atlas_metadata
		SET 
			version = $1,
			success_rate = $2,
			processing_time_ms = $3,
			token_count = $4,
			prompt_summary = $5,
			tags = $6,
			custom_metadata = $7
		WHERE 
			id = $8
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		metadata.Version,
		metadata.SuccessRate,
		metadata.ProcessingTimeMs,
		metadata.TokenCount,
		metadata.PromptSummary,
		metadata.Tags,
		metadata.CustomMetadata,
		metadata.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update atlas metadata: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("atlas metadata not found: %s", metadata.ID)
	}

	return nil
}

// Delete removes atlas metadata
func (r *PostgresAtlasMetadataRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM atlas_metadata WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete atlas metadata: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("atlas metadata not found: %s", id)
	}

	return nil
}

// ListByTags retrieves atlas metadata by tags
func (r *PostgresAtlasMetadataRepository) ListByTags(ctx context.Context, tags []string, limit, offset int) ([]*models.AtlasMetadata, int64, error) {
	// Build the WHERE clause for tag filtering
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if len(tags) > 0 {
		// Use array overlap operator for tag filtering
		whereClause += fmt.Sprintf(" AND tags && $%d", argIndex)
		args = append(args, tags)
		argIndex++
	}

	// Count total results
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM atlas_metadata %s", whereClause)
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count atlas metadata by tags: %w", err)
	}

	// Build the final query
	query := fmt.Sprintf(`
		SELECT 
			id, archive_id, version, success_rate, processing_time_ms, token_count, 
			prompt_summary, tags, custom_metadata, created_at
		FROM 
			atlas_metadata
		%s
		ORDER BY 
			created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	var metadataList []*models.AtlasMetadata
	err = r.db.SelectContext(ctx, &metadataList, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list atlas metadata by tags: %w", err)
	}

	return metadataList, total, nil
}

// SearchByMetadata searches atlas metadata by custom metadata fields
func (r *PostgresAtlasMetadataRepository) SearchByMetadata(ctx context.Context, query map[string]interface{}, limit, offset int) ([]*models.AtlasMetadata, int64, error) {
	// Build the WHERE clause for metadata filtering
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if len(query) > 0 {
		// Use JSONB containment operator for metadata filtering
		whereClause += fmt.Sprintf(" AND custom_metadata @> $%d", argIndex)
		args = append(args, query)
		argIndex++
	}

	// Count total results
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM atlas_metadata %s", whereClause)
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count atlas metadata by metadata: %w", err)
	}

	// Build the final query
	searchQuery := fmt.Sprintf(`
		SELECT 
			id, archive_id, version, success_rate, processing_time_ms, token_count, 
			prompt_summary, tags, custom_metadata, created_at
		FROM 
			atlas_metadata
		%s
		ORDER BY 
			created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	var metadataList []*models.AtlasMetadata
	err = r.db.SelectContext(ctx, &metadataList, searchQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search atlas metadata by metadata: %w", err)
	}

	return metadataList, total, nil
}
