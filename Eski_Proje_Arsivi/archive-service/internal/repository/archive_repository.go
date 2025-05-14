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

// ArchiveRepository defines the interface for archive operations
type ArchiveRepository interface {
	Create(ctx context.Context, archive *models.Archive) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Archive, error)
	Update(ctx context.Context, archive *models.Archive) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, limit, offset int) ([]*models.Archive, error)
	Search(ctx context.Context, query *models.SearchQuery) ([]*models.Archive, int64, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
	UpdateSuccessRate(ctx context.Context, id uuid.UUID, successRate float64) error
}

// PostgresArchiveRepository implements ArchiveRepository using PostgreSQL
type PostgresArchiveRepository struct {
	db *sqlx.DB
}

// NewPostgresArchiveRepository creates a new PostgreSQL archive repository
func NewPostgresArchiveRepository(db *sqlx.DB) *PostgresArchiveRepository {
	return &PostgresArchiveRepository{
		db: db,
	}
}

// Create inserts a new archive record
func (r *PostgresArchiveRepository) Create(ctx context.Context, archive *models.Archive) error {
	query := `
		INSERT INTO archives (
			id, last_file, atlas_file, status, success_rate, metadata, created_at, updated_at, processed_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		archive.ID,
		archive.LastFile,
		archive.AtlasFile,
		archive.Status,
		archive.SuccessRate,
		archive.Metadata,
		archive.CreatedAt,
		archive.UpdatedAt,
		archive.ProcessedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create archive: %w", err)
	}

	return nil
}

// GetByID retrieves an archive by ID
func (r *PostgresArchiveRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Archive, error) {
	query := `
		SELECT 
			id, last_file, atlas_file, status, success_rate, metadata, created_at, updated_at, processed_at
		FROM 
			archives
		WHERE 
			id = $1
	`

	var archive models.Archive
	err := r.db.GetContext(ctx, &archive, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("archive not found: %s", id)
		}
		return nil, fmt.Errorf("failed to get archive: %w", err)
	}

	return &archive, nil
}

// Update updates an existing archive
func (r *PostgresArchiveRepository) Update(ctx context.Context, archive *models.Archive) error {
	query := `
		UPDATE archives
		SET 
			last_file = $1,
			atlas_file = $2,
			status = $3,
			success_rate = $4,
			metadata = $5,
			updated_at = $6,
			processed_at = $7
		WHERE 
			id = $8
	`

	archive.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		archive.LastFile,
		archive.AtlasFile,
		archive.Status,
		archive.SuccessRate,
		archive.Metadata,
		archive.UpdatedAt,
		archive.ProcessedAt,
		archive.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update archive: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("archive not found: %s", archive.ID)
	}

	return nil
}

// Delete removes an archive
func (r *PostgresArchiveRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM archives WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete archive: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("archive not found: %s", id)
	}

	return nil
}

// List retrieves a paginated list of archives
func (r *PostgresArchiveRepository) List(ctx context.Context, limit, offset int) ([]*models.Archive, error) {
	query := `
		SELECT 
			id, last_file, atlas_file, status, success_rate, metadata, created_at, updated_at, processed_at
		FROM 
			archives
		ORDER BY 
			created_at DESC
		LIMIT $1 OFFSET $2
	`

	var archives []*models.Archive
	err := r.db.SelectContext(ctx, &archives, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list archives: %w", err)
	}

	return archives, nil
}

// Search searches archives based on query parameters
func (r *PostgresArchiveRepository) Search(ctx context.Context, query *models.SearchQuery) ([]*models.Archive, int64, error) {
	// Build the WHERE clause based on search parameters
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if query.Status != "" {
		whereClause += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, query.Status)
		argIndex++
	}

	if !query.StartDate.IsZero() {
		whereClause += fmt.Sprintf(" AND created_at >= $%d", argIndex)
		args = append(args, query.StartDate)
		argIndex++
	}

	if !query.EndDate.IsZero() {
		whereClause += fmt.Sprintf(" AND created_at <= $%d", argIndex)
		args = append(args, query.EndDate)
		argIndex++
	}

	if query.MinSuccess > 0 {
		whereClause += fmt.Sprintf(" AND success_rate >= $%d", argIndex)
		args = append(args, query.MinSuccess)
		argIndex++
	}

	if query.MaxSuccess > 0 {
		whereClause += fmt.Sprintf(" AND success_rate <= $%d", argIndex)
		args = append(args, query.MaxSuccess)
		argIndex++
	}

	if query.Query != "" {
		// Search in metadata using JSONB containment
		whereClause += fmt.Sprintf(" AND (metadata @> $%d::jsonb OR last_file ILIKE $%d OR atlas_file ILIKE $%d)", 
			argIndex, argIndex+1, argIndex+2)
		args = append(args, fmt.Sprintf(`{"query": "%s"}`, query.Query))
		args = append(args, "%"+query.Query+"%")
		args = append(args, "%"+query.Query+"%")
		argIndex += 3
	}

	// Count total results
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM archives %s", whereClause)
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count search results: %w", err)
	}

	// Build the ORDER BY clause
	orderBy := "created_at"
	if query.SortBy != "" {
		// Validate sort field to prevent SQL injection
		validSortFields := map[string]bool{
			"created_at":   true,
			"updated_at":   true,
			"processed_at": true,
			"status":       true,
			"success_rate": true,
		}
		if validSortFields[query.SortBy] {
			orderBy = query.SortBy
		}
	}

	// Validate sort order
	sortOrder := "DESC"
	if query.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	// Build the final query
	searchQuery := fmt.Sprintf(`
		SELECT 
			id, last_file, atlas_file, status, success_rate, metadata, created_at, updated_at, processed_at
		FROM 
			archives
		%s
		ORDER BY 
			%s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderBy, sortOrder, argIndex, argIndex+1)

	args = append(args, query.Limit, query.Offset)

	var archives []*models.Archive
	err = r.db.SelectContext(ctx, &archives, searchQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search archives: %w", err)
	}

	return archives, total, nil
}

// UpdateStatus updates the status of an archive
func (r *PostgresArchiveRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	query := `
		UPDATE archives
		SET 
			status = $1,
			updated_at = $2
		WHERE 
			id = $3
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		status,
		time.Now(),
		id,
	)

	if err != nil {
		return fmt.Errorf("failed to update archive status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("archive not found: %s", id)
	}

	return nil
}

// UpdateSuccessRate updates the success rate of an archive
func (r *PostgresArchiveRepository) UpdateSuccessRate(ctx context.Context, id uuid.UUID, successRate float64) error {
	query := `
		UPDATE archives
		SET 
			success_rate = $1,
			updated_at = $2,
			processed_at = $3
		WHERE 
			id = $4
	`

	now := time.Now()

	result, err := r.db.ExecContext(
		ctx,
		query,
		successRate,
		now,
		now,
		id,
	)

	if err != nil {
		return fmt.Errorf("failed to update archive success rate: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("archive not found: %s", id)
	}

	return nil
}
