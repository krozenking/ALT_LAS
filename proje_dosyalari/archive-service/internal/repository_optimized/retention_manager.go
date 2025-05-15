package repository_optimized

import (
	"fmt"
	"os" // Added os import
	"time"

	"github.com/krozenking/ALT_LAS/archive-service/internal/logging"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
)

// RetentionManager handles data retention policies
type RetentionManager struct {
	dbManager *DBManager
	logger    *logging.Logger
	policies  map[string]RetentionPolicy
}

// RetentionPolicy defines a retention policy for a specific data type
type RetentionPolicy struct {
	DataType      string
	RetentionDays int
	ArchiveFirst  bool
}

// NewRetentionManager creates a new RetentionManager
func NewRetentionManager(dbManager *DBManager, logger *logging.Logger) *RetentionManager {
	return &RetentionManager{
		dbManager: dbManager,
		logger:    logger,
		policies:  make(map[string]RetentionPolicy),
	}
}

// AddPolicy adds a retention policy
func (m *RetentionManager) AddPolicy(policy RetentionPolicy) {
	m.policies[policy.DataType] = policy
	m.logger.Info("Added retention policy for %s: %d days, archive first: %t",
		policy.DataType, policy.RetentionDays, policy.ArchiveFirst)
}

// ApplyPolicies applies all retention policies
func (m *RetentionManager) ApplyPolicies() error {
	for dataType, policy := range m.policies {
		m.logger.Info("Applying retention policy for %s", dataType)

		switch dataType {
		case "last_files":
			if err := m.applyLastFilePolicy(policy); err != nil {
				m.logger.Error("Failed to apply retention policy for %s: %v", dataType, err)
				return err
			}
		case "atlas_files":
			if err := m.applyAtlasFilePolicy(policy); err != nil {
				m.logger.Error("Failed to apply retention policy for %s: %v", dataType, err)
				return err
			}
		default:
			m.logger.Warn("Unknown data type for retention policy: %s", dataType)
		}
	}

	return nil
}

// applyLastFilePolicy applies retention policy to LastFile records
func (m *RetentionManager) applyLastFilePolicy(policy RetentionPolicy) error {
	cutoffDate := time.Now().AddDate(0, 0, -policy.RetentionDays)

	// Find records older than cutoff date
	query := `
		SELECT id, file_path, status
		FROM last_files
		WHERE created_at < $1
		LIMIT 1000
	`

	rows, err := m.dbManager.QueryxContext(query, cutoffDate) // Corrected: removed explicit ctx
	if err != nil {
		return fmt.Errorf("failed to query old last files: %w", err)
	}
	defer rows.Close()

	var records []struct {
		ID       string `db:"id"`
		FilePath string `db:"file_path"`
		Status   string `db:"status"`
	}

	for rows.Next() {
		var record struct {
			ID       string `db:"id"`
			FilePath string `db:"file_path"`
			Status   string `db:"status"`
		}
		if err := rows.StructScan(&record); err != nil {
			return fmt.Errorf("failed to scan record: %w", err)
		}
		records = append(records, record)
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("error iterating records: %w", err)
	}

	m.logger.Info("Found %d LastFile records to process for retention policy", len(records))

	// Process records
	for _, record := range records {
		if policy.ArchiveFirst && record.Status != models.LastFileStatusArchived {
			// Archive first
			if err := m.archiveLastFile(record.ID); err != nil {
				m.logger.Warn("Failed to archive LastFile %s: %v", record.ID, err)
				continue
			}
		}

		// Delete file
		if err := m.deleteLastFile(record.ID, record.FilePath); err != nil {
			m.logger.Warn("Failed to delete LastFile %s: %v", record.ID, err)
			continue
		}
	}

	return nil
}

// applyAtlasFilePolicy applies retention policy to AtlasFile records
func (m *RetentionManager) applyAtlasFilePolicy(policy RetentionPolicy) error {
	cutoffDate := time.Now().AddDate(0, 0, -policy.RetentionDays)

	// Find records older than cutoff date
	query := `
		SELECT id, status
		FROM atlas_files
		WHERE created_at < $1
		LIMIT 1000
	`

	rows, err := m.dbManager.QueryxContext(query, cutoffDate) // Corrected: removed explicit ctx
	if err != nil {
		return fmt.Errorf("failed to query old atlas files: %w", err)
	}
	defer rows.Close()

	var records []struct {
		ID     string `db:"id"`
		Status string `db:"status"`
	}

	for rows.Next() {
		var record struct {
			ID     string `db:"id"`
			Status string `db:"status"`
		}
		if err := rows.StructScan(&record); err != nil {
			return fmt.Errorf("failed to scan record: %w", err)
		}
		records = append(records, record)
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("error iterating records: %w", err)
	}

	m.logger.Info("Found %d AtlasFile records to process for retention policy", len(records))

	// Process records
	for _, record := range records {
		if policy.ArchiveFirst && record.Status != "archived" {
			// Archive first
			if err := m.archiveAtlasFile(record.ID); err != nil {
				m.logger.Warn("Failed to archive AtlasFile %s: %v", record.ID, err)
				continue
			}
		}

		// Delete record
		if err := m.deleteAtlasFile(record.ID); err != nil {
			m.logger.Warn("Failed to delete AtlasFile %s: %v", record.ID, err)
			continue
		}
	}

	return nil
}

// archiveLastFile archives a LastFile record
func (m *RetentionManager) archiveLastFile(id string) error {
	query := `
		UPDATE last_files
		SET status = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := m.dbManager.ExecContext(query, models.LastFileStatusArchived, id) // Corrected: removed explicit ctx
	if err != nil {
		return fmt.Errorf("failed to archive LastFile: %w", err)
	}

	m.logger.Info("Archived LastFile: %s", id)
	return nil
}

// deleteLastFile deletes a LastFile record and its file
func (m *RetentionManager) deleteLastFile(id, filePath string) error {
	// Delete from database
	query := `
		DELETE FROM last_files
		WHERE id = $1
	`

	_, err := m.dbManager.ExecContext(query, id) // Corrected: removed explicit ctx
	if err != nil {
		return fmt.Errorf("failed to delete LastFile from database: %w", err)
	}

	m.logger.Info("Deleted LastFile from database: %s", id)

	// Delete file if it exists
	if filePath != "" {
		if err := m.deleteFile(filePath); err != nil {
			m.logger.Warn("Failed to delete LastFile file %s: %v", filePath, err)
		}
	}

	return nil
}

// archiveAtlasFile archives an AtlasFile record
func (m *RetentionManager) archiveAtlasFile(id string) error {
	query := `
		UPDATE atlas_files
		SET status = 'archived', updated_at = NOW()
		WHERE id = $1
	`

	_, err := m.dbManager.ExecContext(query, id) // Corrected: removed explicit ctx
	if err != nil {
		return fmt.Errorf("failed to archive AtlasFile: %w", err)
	}

	m.logger.Info("Archived AtlasFile: %s", id)
	return nil
}

// deleteAtlasFile deletes an AtlasFile record
func (m *RetentionManager) deleteAtlasFile(id string) error {
	query := `
		DELETE FROM atlas_files
		WHERE id = $1
	`

	_, err := m.dbManager.ExecContext(query, id) // Corrected: removed explicit ctx
	if err != nil {
		return fmt.Errorf("failed to delete AtlasFile: %w", err)
	}

	m.logger.Info("Deleted AtlasFile: %s", id)
	return nil
}

// deleteFile deletes a file from the filesystem
func (m *RetentionManager) deleteFile(filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		// File doesn't exist, nothing to do
		return nil
	}

	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	m.logger.Info("Deleted file: %s", filePath)
	return nil
}

// ScheduleRetentionPolicyApplication schedules regular application of retention policies
func (m *RetentionManager) ScheduleRetentionPolicyApplication(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				if err := m.ApplyPolicies(); err != nil {
					m.logger.Error("Scheduled retention policy application failed: %v", err)
				}
			}
		}
	}()

	m.logger.Info("Scheduled retention policy application every %v", interval)
}

