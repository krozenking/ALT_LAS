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

// LastFileRepository handles database operations for LastFile
type LastFileRepository struct {
	db         *sqlx.DB
	logger     *logging.Logger
	dbManager  *DBManager
	statements map[string]*sqlx.Stmt
}

// NewLastFileRepository creates a new LastFileRepository
func NewLastFileRepository(dbManager *DBManager, logger *logging.Logger) *LastFileRepository {
	repo := &LastFileRepository{
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
func (r *LastFileRepository) prepareStatements() {
	statements := map[string]string{
		"create": `
			INSERT INTO last_files (id, file_path, success_rate, timestamp, metadata, status)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`,
		"getByID": `
			SELECT id, file_path, success_rate, timestamp, metadata, status, created_at, updated_at
			FROM last_files
			WHERE id = $1
		`,
		"updateStatus": `
			UPDATE last_files
			SET status = $2, updated_at = NOW()
			WHERE id = $1
		`,
		"updateAtlasID": `
			UPDATE last_files
			SET atlas_id = $2, updated_at = NOW()
			WHERE id = $1
		`,
		"getByStatus": `
			SELECT id, file_path, success_rate, timestamp, metadata, status, created_at, updated_at
			FROM last_files
			WHERE status = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`,
		"getSuccessRateStats": `
			SELECT 
				AVG(success_rate) as avg_rate,
				MIN(success_rate) as min_rate,
				MAX(success_rate) as max_rate,
				COUNT(*) as total_count
			FROM last_files
		`,
		"getLowSuccessRateEntries": `
			SELECT id, file_path, success_rate, timestamp, metadata, status, created_at, updated_at
			FROM last_files
			WHERE success_rate < $1
			ORDER BY success_rate ASC
			LIMIT $2
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

// Create creates a new LastFile record
func (r *LastFileRepository) Create(lastFile *models.LastFile) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["create"]
	if !ok {
		return fmt.Errorf("create statement not prepared")
	}

	var id string
	err := stmt.QueryRowxContext(ctx,
		lastFile.ID,
		lastFile.FilePath,
		lastFile.SuccessRate,
		lastFile.Timestamp,
		lastFile.Metadata,
		lastFile.Status,
	).Scan(&id)

	if err != nil {
		return fmt.Errorf("failed to create last file: %w", err)
	}

	return nil
}

// GetByID gets a LastFile by ID
func (r *LastFileRepository) GetByID(id string) (*models.LastFile, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["getByID"]
	if !ok {
		return nil, fmt.Errorf("getByID statement not prepared")
	}

	var lastFile models.LastFile
	err := stmt.QueryRowxContext(ctx, id).StructScan(&lastFile)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get last file: %w", err)
	}

	return &lastFile, nil
}

// UpdateStatus updates the status of a LastFile
func (r *LastFileRepository) UpdateStatus(id string, status string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["updateStatus"]
	if !ok {
		return fmt.Errorf("updateStatus statement not prepared")
	}

	_, err := stmt.ExecContext(ctx, id, status)
	if err != nil {
		return fmt.Errorf("failed to update last file status: %w", err)
	}

	return nil
}

// UpdateAtlasID updates the atlas_id of a LastFile
func (r *LastFileRepository) UpdateAtlasID(id string, atlasID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stmt, ok := r.statements["updateAtlasID"]
	if !ok {
		// Fallback to preparing the statement if not found (e.g., if prepareStatements failed for it)
		var err error
		stmt, err = r.db.PreparexContext(ctx, `UPDATE last_files SET atlas_id = $2, updated_at = NOW() WHERE id = $1`)
		if err != nil {
			return fmt.Errorf("failed to prepare updateAtlasID statement: %w", err)
		}
		// Optionally, cache it here if that logic is desired, though prepareStatements should handle it.
	}

	_, err := stmt.ExecContext(ctx, id, atlasID)
	if err != nil {
		return fmt.Errorf("failed to update last file atlas_id: %w", err)
	}

	return nil
}


// GetByStatus gets LastFiles by status with pagination
func (r *LastFileRepository) GetByStatus(status string, limit, offset int) ([]*models.LastFile, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stmt, ok := r.statements["getByStatus"]
	if !ok {
		return nil, fmt.Errorf("getByStatus statement not prepared")
	}

	rows, err := stmt.QueryxContext(ctx, status, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get last files by status: %w", err)
	}
	defer rows.Close()

	var lastFiles []*models.LastFile
	for rows.Next() {
		var lastFile models.LastFile
		if err := rows.StructScan(&lastFile); err != nil {
			return nil, fmt.Errorf("failed to scan last file: %w", err)
		}
		lastFiles = append(lastFiles, &lastFile)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating last files: %w", err)
	}

	return lastFiles, nil
}

// GetSuccessRateStats gets success rate statistics
func (r *LastFileRepository) GetSuccessRateStats() (map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stmt, ok := r.statements["getSuccessRateStats"]
	if !ok {
		return nil, fmt.Errorf("getSuccessRateStats statement not prepared")
	}

	var stats struct {
		AvgRate    float64 `db:"avg_rate"`
		MinRate    float64 `db:"min_rate"`
		MaxRate    float64 `db:"max_rate"`
		TotalCount int     `db:"total_count"`
	}

	err := stmt.QueryRowxContext(ctx).StructScan(&stats)
	if err != nil {
		return nil, fmt.Errorf("failed to get success rate stats: %w", err)
	}

	return map[string]interface{}{
		"average_success_rate": stats.AvgRate,
		"minimum_success_rate": stats.MinRate,
		"maximum_success_rate": stats.MaxRate,
		"total_entries":        stats.TotalCount,
	}, nil
}

// GetLowSuccessRateEntries gets entries with low success rates
func (r *LastFileRepository) GetLowSuccessRateEntries(threshold float64, limit int) ([]*models.LastFile, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stmt, ok := r.statements["getLowSuccessRateEntries"]
	if !ok {
		return nil, fmt.Errorf("getLowSuccessRateEntries statement not prepared")
	}

	rows, err := stmt.QueryxContext(ctx, threshold, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get low success rate entries: %w", err)
	}
	defer rows.Close()

	var lastFiles []*models.LastFile
	for rows.Next() {
		var lastFile models.LastFile
		if err := rows.StructScan(&lastFile); err != nil {
			return nil, fmt.Errorf("failed to scan last file: %w", err)
		}
		lastFiles = append(lastFiles, &lastFile)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating last files: %w", err)
	}

	return lastFiles, nil
}

