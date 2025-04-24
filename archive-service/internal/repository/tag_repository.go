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

// TagRepository defines the interface for tag operations
type TagRepository interface {
	Create(ctx context.Context, tag *models.Tag) error
	GetByID(ctx context.Context, id string) (*models.Tag, error)
	GetByName(ctx context.Context, name string) (*models.Tag, error)
	Update(ctx context.Context, tag *models.Tag) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, limit, offset int) ([]*models.Tag, int64, error)
	ListByCategory(ctx context.Context, category string, limit, offset int) ([]*models.Tag, int64, error)
}

// PostgresTagRepository implements TagRepository using PostgreSQL
type PostgresTagRepository struct {
	db *sqlx.DB
}

// NewPostgresTagRepository creates a new PostgreSQL tag repository
func NewPostgresTagRepository(db *sqlx.DB) *PostgresTagRepository {
	return &PostgresTagRepository{
		db: db,
	}
}

// Create inserts a new tag
func (r *PostgresTagRepository) Create(ctx context.Context, tag *models.Tag) error {
	if tag.ID == "" {
		tag.ID = uuid.New().String()
	}
	
	now := time.Now()
	if tag.CreatedAt.IsZero() {
		tag.CreatedAt = now
	}
	
	tag.UpdatedAt = now

	query := `
		INSERT INTO tags (
			id, name, category, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5
		)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		tag.ID,
		tag.Name,
		tag.Category,
		tag.CreatedAt,
		tag.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create tag: %w", err)
	}

	return nil
}

// GetByID retrieves a tag by ID
func (r *PostgresTagRepository) GetByID(ctx context.Context, id string) (*models.Tag, error) {
	query := `
		SELECT 
			id, name, category, created_at, updated_at
		FROM 
			tags
		WHERE 
			id = $1
	`

	var tag models.Tag
	err := r.db.GetContext(ctx, &tag, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("tag not found: %s", id)
		}
		return nil, fmt.Errorf("failed to get tag: %w", err)
	}

	return &tag, nil
}

// GetByName retrieves a tag by name
func (r *PostgresTagRepository) GetByName(ctx context.Context, name string) (*models.Tag, error) {
	query := `
		SELECT 
			id, name, category, created_at, updated_at
		FROM 
			tags
		WHERE 
			name = $1
	`

	var tag models.Tag
	err := r.db.GetContext(ctx, &tag, query, name)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("tag not found: %s", name)
		}
		return nil, fmt.Errorf("failed to get tag by name: %w", err)
	}

	return &tag, nil
}

// Update updates an existing tag
func (r *PostgresTagRepository) Update(ctx context.Context, tag *models.Tag) error {
	tag.UpdatedAt = time.Now()

	query := `
		UPDATE tags
		SET 
			name = $1,
			category = $2,
			updated_at = $3
		WHERE 
			id = $4
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		tag.Name,
		tag.Category,
		tag.UpdatedAt,
		tag.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update tag: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("tag not found: %s", tag.ID)
	}

	return nil
}

// Delete removes a tag
func (r *PostgresTagRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM tags WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete tag: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("tag not found: %s", id)
	}

	return nil
}

// List retrieves a paginated list of tags
func (r *PostgresTagRepository) List(ctx context.Context, limit, offset int) ([]*models.Tag, int64, error) {
	// Count total results
	countQuery := `SELECT COUNT(*) FROM tags`
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count tags: %w", err)
	}

	// Get paginated results
	query := `
		SELECT 
			id, name, category, created_at, updated_at
		FROM 
			tags
		ORDER BY 
			name ASC
		LIMIT $1 OFFSET $2
	`

	var tags []*models.Tag
	err = r.db.SelectContext(ctx, &tags, query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list tags: %w", err)
	}

	return tags, total, nil
}

// ListByCategory retrieves a paginated list of tags by category
func (r *PostgresTagRepository) ListByCategory(ctx context.Context, category string, limit, offset int) ([]*models.Tag, int64, error) {
	// Count total results
	countQuery := `SELECT COUNT(*) FROM tags WHERE category = $1`
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery, category)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count tags by category: %w", err)
	}

	// Get paginated results
	query := `
		SELECT 
			id, name, category, created_at, updated_at
		FROM 
			tags
		WHERE 
			category = $1
		ORDER BY 
			name ASC
		LIMIT $2 OFFSET $3
	`

	var tags []*models.Tag
	err = r.db.SelectContext(ctx, &tags, query, category, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list tags by category: %w", err)
	}

	return tags, total, nil
}
