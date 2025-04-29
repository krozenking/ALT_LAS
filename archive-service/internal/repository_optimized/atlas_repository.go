package repository_optimized

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/krozenking/ALT_LAS/archive-service/internal/logging"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
)

// AtlasRepository handles database operations for Atlas files
type AtlasRepository struct {
	db         *sqlx.DB
	logger     *logging.Logger
	dbManager  *DBManager
	statements map[string]*sqlx.Stmt
}

// NewAtlasRepository creates a new AtlasRepository
func NewAtlasRepository(dbManager *DBManager, logger *logging.Logger) *AtlasRepository {
	repo := &AtlasRepository{
		db:         dbManager.GetDB(),
		logger:     logger,
		dbManager:  dbManager,
		statements: make(map[string]*sqlx.Stmt),
	}

	// Prepare common statements
	repo.prepareStatements()

	return repo
}

// prepareStatements prepares and caches common SQL statements
func (r *AtlasRepository) prepareStatements() {
	statements := map[string]string{
		"create": `
			INSERT INTO atlas_files (id, last_file_id, content, metadata, tags, status)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`,
		"getByID": `
			SELECT id, last_file_id, content, metadata, tags, status, created_at, updated_at
			FROM atlas_files
			WHERE id = $1
		`,
		"updateStatus": `
			UPDATE atlas_files
			SET status = $2, updated_at = NOW()
			WHERE id = $1
		`,
		"search": `
			SELECT id, last_file_id, content, metadata, tags, status, created_at, updated_at
			FROM atlas_files
			WHERE 
				($1::text IS NULL OR content @@ to_tsquery($1)) AND
				($2::text IS NULL OR metadata::text ILIKE '%' || $2 || '%') AND
				($3::text[] IS NULL OR tags && $3)
			ORDER BY 
				CASE WHEN $4 = 'created_at_desc' THEN created_at END DESC,
				CASE WHEN $4 = 'created_at_asc' THEN created_at END ASC,
				CASE WHEN $4 = 'updated_at_desc' THEN updated_at END DESC,
				CASE WHEN $4 = 'updated_at_asc' THEN updated_at END ASC
			LIMIT $5 OFFSET $6
		`,
		"getTags": `
			SELECT DISTINCT unnest(tags) as tag
			FROM atlas_files
			ORDER BY tag
		`,
		"delete": `
			DELETE FROM atlas_files
			WHERE id = $1
		`,
		"archive": `
			UPDATE atlas_files
			SET status = 'archived', updated_at = NOW()
			WHERE id = $1
		`,
		"getByLastFileID": `
			SELECT id, last_file_id, content, metadata, tags, status, created_at, updated_at
			FROM atlas_files
			WHERE last_file_id = $1
		`,
		"countByTags": `
			SELECT tag, COUNT(*) as count
			FROM (
				SELECT unnest(tags) as tag
				FROM atlas_files
			) as tag_counts
			GROUP BY tag
			ORDER BY count DESC
			LIMIT $1
		`,
	}

	for name, query := range statements {
		stmt, err := r.dbManager.PrepareStatement(name, query)
		if err != nil {
			r.logger.Error("Failed to prepare statement %s: %v", name, err)
		} else {
			r.statements[name] = stmt
		}
	}
}

// Create creates a new Atlas file record
func (r *AtlasRepository) Create(atlas *models.AtlasFile) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["create"]
	if !ok {
		return fmt.Errorf("create statement not prepared")
	}

	var id string
	err := stmt.QueryRowxContext(ctx,
		atlas.ID,
		atlas.LastFileID,
		atlas.Content,
		atlas.Metadata,
		atlas.Tags,
		atlas.Status,
	).Scan(&id)

	if err != nil {
		return fmt.Errorf("failed to create atlas file: %w", err)
	}

	return nil
}

// GetByID gets an Atlas file by ID
func (r *AtlasRepository) GetByID(id string) (*models.AtlasFile, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["getByID"]
	if !ok {
		return nil, fmt.Errorf("getByID statement not prepared")
	}

	var atlas models.AtlasFile
	err := stmt.QueryRowxContext(ctx, id).StructScan(&atlas)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get atlas file: %w", err)
	}

	return &atlas, nil
}

// UpdateStatus updates the status of an Atlas file
func (r *AtlasRepository) UpdateStatus(id string, status string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["updateStatus"]
	if !ok {
		return fmt.Errorf("updateStatus statement not prepared")
	}

	_, err := stmt.ExecContext(ctx, id, status)
	if err != nil {
		return fmt.Errorf("failed to update atlas file status: %w", err)
	}

	return nil
}

// Search searches Atlas files with various filters
func (r *AtlasRepository) Search(query, metadataFilter string, tags []string, sortBy string, limit, offset int) ([]*models.AtlasFile, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	stmt, ok := r.statements["search"]
	if !ok {
		return nil, fmt.Errorf("search statement not prepared")
	}

	// Validate and set default sort order
	if sortBy == "" {
		sortBy = "created_at_desc"
	}

	// Convert empty strings to nil for SQL query
	var queryParam, metadataParam interface{}
	var tagsParam interface{}
	
	if query != "" {
		queryParam = query
	}
	
	if metadataFilter != "" {
		metadataParam = metadataFilter
	}
	
	if len(tags) > 0 {
		tagsParam = tags
	}

	rows, err := stmt.QueryxContext(ctx, queryParam, metadataParam, tagsParam, sortBy, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to search atlas files: %w", err)
	}
	defer rows.Close()

	var atlasFiles []*models.AtlasFile
	for rows.Next() {
		var atlas models.AtlasFile
		if err := rows.StructScan(&atlas); err != nil {
			return nil, fmt.Errorf("failed to scan atlas file: %w", err)
		}
		atlasFiles = append(atlasFiles, &atlas)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating atlas files: %w", err)
	}

	return atlasFiles, nil
}

// GetTags gets all unique tags
func (r *AtlasRepository) GetTags() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stmt, ok := r.statements["getTags"]
	if !ok {
		return nil, fmt.Errorf("getTags statement not prepared")
	}

	rows, err := stmt.QueryxContext(ctx)
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
		return nil, fmt.Errorf("error iterating tags: %w", err)
	}

	return tags, nil
}

// Delete deletes an Atlas file
func (r *AtlasRepository) Delete(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["delete"]
	if !ok {
		return fmt.Errorf("delete statement not prepared")
	}

	_, err := stmt.ExecContext(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete atlas file: %w", err)
	}

	return nil
}

// Archive archives an Atlas file
func (r *AtlasRepository) Archive(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["archive"]
	if !ok {
		return fmt.Errorf("archive statement not prepared")
	}

	_, err := stmt.ExecContext(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to archive atlas file: %w", err)
	}

	return nil
}

// GetByLastFileID gets Atlas files by LastFile ID
func (r *AtlasRepository) GetByLastFileID(lastFileID string) ([]*models.AtlasFile, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stmt, ok := r.statements["getByLastFileID"]
	if !ok {
		return nil, fmt.Errorf("getByLastFileID statement not prepared")
	}

	rows, err := stmt.QueryxContext(ctx, lastFileID)
	if err != nil {
		return nil, fmt.Errorf("failed to get atlas files by last file ID: %w", err)
	}
	defer rows.Close()

	var atlasFiles []*models.AtlasFile
	for rows.Next() {
		var atlas models.AtlasFile
		if err := rows.StructScan(&atlas); err != nil {
			return nil, fmt.Errorf("failed to scan atlas file: %w", err)
		}
		atlasFiles = append(atlasFiles, &atlas)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating atlas files: %w", err)
	}

	return atlasFiles, nil
}

// GetTagCounts gets tag counts
func (r *AtlasRepository) GetTagCounts(limit int) (map[string]int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stmt, ok := r.statements["countByTags"]
	if !ok {
		return nil, fmt.Errorf("countByTags statement not prepared")
	}

	rows, err := stmt.QueryxContext(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get tag counts: %w", err)
	}
	defer rows.Close()

	tagCounts := make(map[string]int)
	for rows.Next() {
		var tag string
		var count int
		if err := rows.Scan(&tag, &count); err != nil {
			return nil, fmt.Errorf("failed to scan tag count: %w", err)
		}
		tagCounts[tag] = count
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating tag counts: %w", err)
	}

	return tagCounts, nil
}
