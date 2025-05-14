package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/lib/pq"
)

// AtlasRepository handles database operations for Atlas entities
type AtlasRepository struct {
	db *sqlx.DB
}

// NewAtlasRepository creates a new AtlasRepository
func NewAtlasRepository(db *sqlx.DB) *AtlasRepository {
	return &AtlasRepository{
		db: db,
	}
}

// Create inserts a new Atlas record into the database
func (r *AtlasRepository) Create(atlas *models.Atlas) error {
	// Convert metadata to JSON
	metadataJSON, err := json.Marshal(atlas.Metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	// Set timestamps
	now := time.Now()
	atlas.CreatedAt = now
	atlas.UpdatedAt = now

	// Set initial status if not set
	if atlas.Status == "" {
		atlas.Status = models.AtlasStatusActive
	}

	query := `
		INSERT INTO atlas_entries (
			id, last_file_id, file_path, success_rate, timestamp, 
			metadata, tags, status, created_at, updated_at
		) VALUES (
			:id, :last_file_id, :file_path, :success_rate, :timestamp, 
			:metadata, :tags, :status, :created_at, :updated_at
		) RETURNING id
	`

	// Execute the query
	_, err = r.db.NamedExec(query, map[string]interface{}{
		"id":           atlas.ID,
		"last_file_id": atlas.LastFileID,
		"file_path":    atlas.FilePath,
		"success_rate": atlas.SuccessRate,
		"timestamp":    atlas.Timestamp,
		"metadata":     metadataJSON,
		"tags":         pq.Array(atlas.Tags),
		"status":       atlas.Status,
		"created_at":   atlas.CreatedAt,
		"updated_at":   atlas.UpdatedAt,
	})

	if err != nil {
		return fmt.Errorf("failed to create atlas entry: %w", err)
	}

	return nil
}

// GetByID retrieves an Atlas entry by its ID
func (r *AtlasRepository) GetByID(id string) (*models.Atlas, error) {
	query := `
		SELECT id, last_file_id, file_path, success_rate, timestamp, 
			   metadata, tags, status, created_at, updated_at
		FROM atlas_entries
		WHERE id = $1
	`

	var atlas models.Atlas
	var metadataJSON []byte
	var tags []string

	err := r.db.QueryRowx(query, id).Scan(
		&atlas.ID,
		&atlas.LastFileID,
		&atlas.FilePath,
		&atlas.SuccessRate,
		&atlas.Timestamp,
		&metadataJSON,
		pq.Array(&tags),
		&atlas.Status,
		&atlas.CreatedAt,
		&atlas.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to get atlas entry: %w", err)
	}

	// Unmarshal metadata
	if err := json.Unmarshal(metadataJSON, &atlas.Metadata); err != nil {
		return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
	}

	atlas.Tags = tags

	return &atlas, nil
}

// UpdateStatus updates the status of an Atlas entry
func (r *AtlasRepository) UpdateStatus(id, status string) error {
	query := `
		UPDATE atlas_entries
		SET status = $1, updated_at = $2
		WHERE id = $3
	`

	_, err := r.db.Exec(query, status, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update atlas entry status: %w", err)
	}

	return nil
}

// Search searches Atlas entries based on various criteria
func (r *AtlasRepository) Search(query string, tags []string, minSuccessRate float64, limit, offset int) ([]*models.Atlas, error) {
	// Build the query
	sqlQuery := `
		SELECT id, last_file_id, file_path, success_rate, timestamp, 
			   metadata, tags, status, created_at, updated_at
		FROM atlas_entries
		WHERE status = 'active'
	`

	args := []interface{}{}
	argCount := 1

	// Add text search if provided
	if query != "" {
		sqlQuery += fmt.Sprintf(" AND (file_path ILIKE $%d OR metadata::text ILIKE $%d)", argCount, argCount)
		args = append(args, "%"+query+"%")
		argCount++
	}

	// Add success rate filter if provided
	if minSuccessRate > 0 {
		sqlQuery += fmt.Sprintf(" AND success_rate >= $%d", argCount)
		args = append(args, minSuccessRate)
		argCount++
	}

	// Add tags filter if provided
	if len(tags) > 0 {
		sqlQuery += fmt.Sprintf(" AND tags @> $%d", argCount)
		args = append(args, pq.Array(tags))
		argCount++
	}

	// Add ordering and pagination
	sqlQuery += " ORDER BY created_at DESC LIMIT $" + fmt.Sprintf("%d", argCount) + " OFFSET $" + fmt.Sprintf("%d", argCount+1)
	args = append(args, limit, offset)

	// Execute the query
	rows, err := r.db.Queryx(sqlQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to search atlas entries: %w", err)
	}
	defer rows.Close()

	var atlasEntries []*models.Atlas
	for rows.Next() {
		var atlas models.Atlas
		var metadataJSON []byte
		var tags []string

		err := rows.Scan(
			&atlas.ID,
			&atlas.LastFileID,
			&atlas.FilePath,
			&atlas.SuccessRate,
			&atlas.Timestamp,
			&metadataJSON,
			pq.Array(&tags),
			&atlas.Status,
			&atlas.CreatedAt,
			&atlas.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan atlas entry: %w", err)
		}

		// Unmarshal metadata
		if err := json.Unmarshal(metadataJSON, &atlas.Metadata); err != nil {
			return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
		}

		atlas.Tags = tags
		atlasEntries = append(atlasEntries, &atlas)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating atlas entries rows: %w", err)
	}

	return atlasEntries, nil
}

// GetTags returns all unique tags used in Atlas entries
func (r *AtlasRepository) GetTags() ([]string, error) {
	query := `
		SELECT DISTINCT unnest(tags) as tag
		FROM atlas_entries
		WHERE status = 'active'
		ORDER BY tag
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get tags: %w", err)
	}
	defer rows.Close()

	var tags []string
	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}
		tags = append(tags, tag)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating tags rows: %w", err)
	}

	return tags, nil
}
