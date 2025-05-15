package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
)

// LastFileRepository handles database operations for LastFile entities
type LastFileRepository struct {
	db *sqlx.DB
}

// NewLastFileRepository creates a new LastFileRepository
func NewLastFileRepository(db *sqlx.DB) *LastFileRepository {
	return &LastFileRepository{
		db: db,
	}
}

// Create inserts a new LastFile record into the database
func (r *LastFileRepository) Create(lastFile *models.LastFile) error {
	// Convert metadata to JSON
	metadataJSON, err := json.Marshal(lastFile.Metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	// Set timestamps
	now := time.Now()
	lastFile.CreatedAt = now
	lastFile.UpdatedAt = now

	// Set initial status if not set
	if lastFile.Status == "" {
		lastFile.Status = models.LastFileStatusReceived
	}

	query := `
		INSERT INTO last_files (
			id, file_path, success_rate, timestamp, metadata, 
			atlas_id, status, created_at, updated_at
		) VALUES (
			:id, :file_path, :success_rate, :timestamp, :metadata, 
			:atlas_id, :status, :created_at, :updated_at
		) RETURNING id
	`

	// Execute the query
	_, err = r.db.NamedExec(query, map[string]interface{}{
		"id":           lastFile.ID,
		"file_path":    lastFile.FilePath,
		"success_rate": lastFile.SuccessRate,
		"timestamp":    lastFile.Timestamp,
		"metadata":     metadataJSON,
		"atlas_id":     lastFile.AtlasID,
		"status":       lastFile.Status,
		"created_at":   lastFile.CreatedAt,
		"updated_at":   lastFile.UpdatedAt,
	})

	if err != nil {
		return fmt.Errorf("failed to create last file record: %w", err)
	}

	return nil
}

// GetByID retrieves a LastFile by its ID
func (r *LastFileRepository) GetByID(id string) (*models.LastFile, error) {
	query := `
		SELECT id, file_path, success_rate, timestamp, metadata, 
			   atlas_id, status, created_at, updated_at
		FROM last_files
		WHERE id = $1
	`

	var lastFile models.LastFile
	var metadataJSON []byte

	err := r.db.QueryRowx(query, id).Scan(
		&lastFile.ID,
		&lastFile.FilePath,
		&lastFile.SuccessRate,
		&lastFile.Timestamp,
		&metadataJSON,
		&lastFile.AtlasID,
		&lastFile.Status,
		&lastFile.CreatedAt,
		&lastFile.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to get last file: %w", err)
	}

	// Unmarshal metadata
	if err := json.Unmarshal(metadataJSON, &lastFile.Metadata); err != nil {
		return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
	}

	return &lastFile, nil
}

// UpdateStatus updates the status of a LastFile
func (r *LastFileRepository) UpdateStatus(id, status string) error {
	query := `
		UPDATE last_files
		SET status = $1, updated_at = $2
		WHERE id = $3
	`

	_, err := r.db.Exec(query, status, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update last file status: %w", err)
	}

	return nil
}

// UpdateAtlasID updates the AtlasID of a LastFile
func (r *LastFileRepository) UpdateAtlasID(id, atlasID string) error {
	query := `
		UPDATE last_files
		SET atlas_id = $1, status = $2, updated_at = $3
		WHERE id = $4
	`

	_, err := r.db.Exec(query, atlasID, models.LastFileStatusArchived, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update last file atlas ID: %w", err)
	}

	return nil
}

// List retrieves a list of LastFiles with optional filtering
func (r *LastFileRepository) List(limit, offset int, status string) ([]*models.LastFile, error) {
	query := `
		SELECT id, file_path, success_rate, timestamp, metadata, 
			   atlas_id, status, created_at, updated_at
		FROM last_files
	`

	// Add status filter if provided
	args := []interface{}{}
	if status != "" {
		query += " WHERE status = $1"
		args = append(args, status)
	}

	// Add ordering and pagination
	query += " ORDER BY created_at DESC LIMIT $" + fmt.Sprintf("%d", len(args)+1) + " OFFSET $" + fmt.Sprintf("%d", len(args)+2)
	args = append(args, limit, offset)

	rows, err := r.db.Queryx(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list last files: %w", err)
	}
	defer rows.Close()

	var lastFiles []*models.LastFile
	for rows.Next() {
		var lastFile models.LastFile
		var metadataJSON []byte

		err := rows.Scan(
			&lastFile.ID,
			&lastFile.FilePath,
			&lastFile.SuccessRate,
			&lastFile.Timestamp,
			&metadataJSON,
			&lastFile.AtlasID,
			&lastFile.Status,
			&lastFile.CreatedAt,
			&lastFile.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan last file: %w", err)
		}

		// Unmarshal metadata
		if err := json.Unmarshal(metadataJSON, &lastFile.Metadata); err != nil {
			return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
		}

		lastFiles = append(lastFiles, &lastFile)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating last files rows: %w", err)
	}

	return lastFiles, nil
}
