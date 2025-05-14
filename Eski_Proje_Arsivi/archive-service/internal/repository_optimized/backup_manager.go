package repository_optimized

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/krozenking/ALT_LAS/archive-service/internal/logging"
)

// BackupManager handles database backup operations
type BackupManager struct {
	dbManager     *DBManager
	logger        *logging.Logger
	backupDir     string
	retentionDays int
}

// NewBackupManager creates a new BackupManager
func NewBackupManager(dbManager *DBManager, logger *logging.Logger, backupDir string, retentionDays int) (*BackupManager, error) {
	// Create backup directory if it doesn't exist
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create backup directory: %w", err)
	}

	return &BackupManager{
		dbManager:     dbManager,
		logger:        logger,
		backupDir:     backupDir,
		retentionDays: retentionDays,
	}, nil
}

// CreateBackup creates a database backup
func (m *BackupManager) CreateBackup() (string, error) {
	m.logger.Info("Creating database backup...")
	
	// Create timestamp for backup filename
	timestamp := time.Now().Format("20060102_150405")
	backupFile := filepath.Join(m.backupDir, fmt.Sprintf("backup_%s.sql", timestamp))
	
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
	defer cancel()
	
	// Get database connection info from dbManager
	db := m.dbManager.GetDB()
	dbStats := db.Stats()
	
	m.logger.Info("Database stats before backup: Open=%d, InUse=%d, Idle=%d", 
		dbStats.OpenConnections, dbStats.InUse, dbStats.Idle)
	
	// Execute pg_dump command
	cmd := fmt.Sprintf("PGPASSWORD='%s' pg_dump -h %s -p %d -U %s -d %s -F c -f %s",
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		5432, // Default PostgreSQL port
		os.Getenv("DB_USER"),
		os.Getenv("DB_NAME"),
		backupFile,
	)
	
	// Execute command
	execCmd := exec.CommandContext(ctx, "bash", "-c", cmd)
	output, err := execCmd.CombinedOutput()
	if err != nil {
		m.logger.Error("Backup failed: %v, Output: %s", err, string(output))
		return "", fmt.Errorf("backup failed: %w", err)
	}
	
	m.logger.Info("Backup created successfully: %s", backupFile)
	
	// Clean up old backups
	if err := m.cleanupOldBackups(); err != nil {
		m.logger.Warn("Failed to clean up old backups: %v", err)
	}
	
	return backupFile, nil
}

// RestoreBackup restores a database from backup
func (m *BackupManager) RestoreBackup(backupFile string) error {
	m.logger.Info("Restoring database from backup: %s", backupFile)
	
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
	defer cancel()
	
	// Execute pg_restore command
	cmd := fmt.Sprintf("PGPASSWORD='%s' pg_restore -h %s -p %d -U %s -d %s -c %s",
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		5432, // Default PostgreSQL port
		os.Getenv("DB_USER"),
		os.Getenv("DB_NAME"),
		backupFile,
	)
	
	// Execute command
	execCmd := exec.CommandContext(ctx, "bash", "-c", cmd)
	output, err := execCmd.CombinedOutput()
	if err != nil {
		m.logger.Error("Restore failed: %v, Output: %s", err, string(output))
		return fmt.Errorf("restore failed: %w", err)
	}
	
	m.logger.Info("Database restored successfully from: %s", backupFile)
	return nil
}

// ListBackups lists all available backups
func (m *BackupManager) ListBackups() ([]string, error) {
	files, err := os.ReadDir(m.backupDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read backup directory: %w", err)
	}
	
	var backups []string
	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".sql" {
			backups = append(backups, filepath.Join(m.backupDir, file.Name()))
		}
	}
	
	return backups, nil
}

// GetLatestBackup gets the most recent backup
func (m *BackupManager) GetLatestBackup() (string, error) {
	backups, err := m.ListBackups()
	if err != nil {
		return "", err
	}
	
	if len(backups) == 0 {
		return "", fmt.Errorf("no backups found")
	}
	
	// Find the most recent backup
	var latestBackup string
	var latestTime time.Time
	
	for _, backup := range backups {
		fileInfo, err := os.Stat(backup)
		if err != nil {
			continue
		}
		
		if latestBackup == "" || fileInfo.ModTime().After(latestTime) {
			latestBackup = backup
			latestTime = fileInfo.ModTime()
		}
	}
	
	return latestBackup, nil
}

// cleanupOldBackups removes backups older than retention period
func (m *BackupManager) cleanupOldBackups() error {
	cutoffTime := time.Now().AddDate(0, 0, -m.retentionDays)
	
	files, err := os.ReadDir(m.backupDir)
	if err != nil {
		return fmt.Errorf("failed to read backup directory: %w", err)
	}
	
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		
		filePath := filepath.Join(m.backupDir, file.Name())
		fileInfo, err := os.Stat(filePath)
		if err != nil {
			m.logger.Warn("Failed to get file info for %s: %v", filePath, err)
			continue
		}
		
		if fileInfo.ModTime().Before(cutoffTime) {
			m.logger.Info("Removing old backup: %s", filePath)
			if err := os.Remove(filePath); err != nil {
				m.logger.Warn("Failed to remove old backup %s: %v", filePath, err)
			}
		}
	}
	
	return nil
}

// ScheduleBackups schedules regular backups
func (m *BackupManager) ScheduleBackups(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		
		for {
			select {
			case <-ticker.C:
				if _, err := m.CreateBackup(); err != nil {
					m.logger.Error("Scheduled backup failed: %v", err)
				}
			}
		}
	}()
	
	m.logger.Info("Scheduled backups every %v", interval)
}
