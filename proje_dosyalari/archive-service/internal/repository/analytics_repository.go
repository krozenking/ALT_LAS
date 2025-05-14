package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"

	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
)

// AnalyticsRepository defines the interface for analytics operations
type AnalyticsRepository interface {
	GetDailyAnalytics(ctx context.Context, date time.Time) (*models.AnalyticsData, error)
	UpdateDailyAnalytics(ctx context.Context, date time.Time, data *models.AnalyticsData) error
	GetAnalyticsRange(ctx context.Context, startDate, endDate time.Time) ([]*models.AnalyticsData, error)
	GetTopTags(ctx context.Context, limit int) ([]models.TagCount, error)
	GenerateAnalyticsForDate(ctx context.Context, date time.Time) (*models.AnalyticsData, error)
}

// PostgresAnalyticsRepository implements AnalyticsRepository using PostgreSQL
type PostgresAnalyticsRepository struct {
	db *sqlx.DB
}

// NewPostgresAnalyticsRepository creates a new PostgreSQL analytics repository
func NewPostgresAnalyticsRepository(db *sqlx.DB) *PostgresAnalyticsRepository {
	return &PostgresAnalyticsRepository{
		db: db,
	}
}

// GetDailyAnalytics retrieves analytics data for a specific date
func (r *PostgresAnalyticsRepository) GetDailyAnalytics(ctx context.Context, date time.Time) (*models.AnalyticsData, error) {
	query := `
		SELECT 
			date::text as period,
			archive_count,
			avg_success_rate,
			avg_processing_ms,
			total_tokens,
			failure_count,
			top_tags
		FROM 
			analytics_daily
		WHERE 
			date = $1
	`

	var data models.AnalyticsData
	err := r.db.GetContext(ctx, &data, query, date.Format("2006-01-02"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("analytics data not found for date: %s", date.Format("2006-01-02"))
		}
		return nil, fmt.Errorf("failed to get daily analytics: %w", err)
	}

	return &data, nil
}

// UpdateDailyAnalytics updates or inserts analytics data for a specific date
func (r *PostgresAnalyticsRepository) UpdateDailyAnalytics(ctx context.Context, date time.Time, data *models.AnalyticsData) error {
	query := `
		INSERT INTO analytics_daily (
			date, archive_count, avg_success_rate, avg_processing_ms, 
			total_tokens, failure_count, top_tags, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $8
		)
		ON CONFLICT (date) DO UPDATE SET
			archive_count = $2,
			avg_success_rate = $3,
			avg_processing_ms = $4,
			total_tokens = $5,
			failure_count = $6,
			top_tags = $7,
			updated_at = $8
	`

	now := time.Now()
	_, err := r.db.ExecContext(
		ctx,
		query,
		date.Format("2006-01-02"),
		data.ArchiveCount,
		data.AvgSuccessRate,
		data.AvgProcessingMs,
		data.TotalTokens,
		data.FailureCount,
		data.TopTags,
		now,
	)

	if err != nil {
		return fmt.Errorf("failed to update daily analytics: %w", err)
	}

	return nil
}

// GetAnalyticsRange retrieves analytics data for a date range
func (r *PostgresAnalyticsRepository) GetAnalyticsRange(ctx context.Context, startDate, endDate time.Time) ([]*models.AnalyticsData, error) {
	query := `
		SELECT 
			date::text as period,
			archive_count,
			avg_success_rate,
			avg_processing_ms,
			total_tokens,
			failure_count,
			top_tags
		FROM 
			analytics_daily
		WHERE 
			date BETWEEN $1 AND $2
		ORDER BY
			date ASC
	`

	var dataList []*models.AnalyticsData
	err := r.db.SelectContext(
		ctx,
		&dataList,
		query,
		startDate.Format("2006-01-02"),
		endDate.Format("2006-01-02"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get analytics range: %w", err)
	}

	return dataList, nil
}

// GetTopTags retrieves the most frequently used tags
func (r *PostgresAnalyticsRepository) GetTopTags(ctx context.Context, limit int) ([]models.TagCount, error) {
	query := `
		SELECT 
			unnest(tags) as tag,
			COUNT(*) as count
		FROM 
			atlas_metadata
		GROUP BY 
			tag
		ORDER BY 
			count DESC
		LIMIT $1
	`

	var tagCounts []models.TagCount
	err := r.db.SelectContext(ctx, &tagCounts, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get top tags: %w", err)
	}

	return tagCounts, nil
}

// GenerateAnalyticsForDate generates analytics data for a specific date from raw data
func (r *PostgresAnalyticsRepository) GenerateAnalyticsForDate(ctx context.Context, date time.Time) (*models.AnalyticsData, error) {
	// Format date for SQL query
	dateStr := date.Format("2006-01-02")
	startOfDay := dateStr + " 00:00:00"
	endOfDay := dateStr + " 23:59:59.999999"

	// Query to get archive statistics for the day
	query := `
		SELECT
			COUNT(*) as archive_count,
			AVG(success_rate) as avg_success_rate,
			SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failure_count
		FROM
			archives
		WHERE
			created_at BETWEEN $1 AND $2
	`

	var stats struct {
		ArchiveCount   int64   `db:"archive_count"`
		AvgSuccessRate float64 `db:"avg_success_rate"`
		FailureCount   int64   `db:"failure_count"`
	}

	err := r.db.GetContext(ctx, &stats, query, startOfDay, endOfDay)
	if err != nil {
		return nil, fmt.Errorf("failed to generate archive statistics: %w", err)
	}

	// Query to get atlas metadata statistics for the day
	metadataQuery := `
		SELECT
			AVG(processing_time_ms) as avg_processing_ms,
			SUM(token_count) as total_tokens
		FROM
			atlas_metadata am
		JOIN
			archives a ON am.archive_id = a.id::text
		WHERE
			a.created_at BETWEEN $1 AND $2
	`

	var metadataStats struct {
		AvgProcessingMs float64 `db:"avg_processing_ms"`
		TotalTokens     int64   `db:"total_tokens"`
	}

	err = r.db.GetContext(ctx, &metadataStats, metadataQuery, startOfDay, endOfDay)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("failed to generate metadata statistics: %w", err)
	}

	// Query to get top tags for the day
	tagsQuery := `
		SELECT
			unnest(tags) as tag,
			COUNT(*) as count
		FROM
			atlas_metadata am
		JOIN
			archives a ON am.archive_id = a.id::text
		WHERE
			a.created_at BETWEEN $1 AND $2
		GROUP BY
			tag
		ORDER BY
			count DESC
		LIMIT 10
	`

	var topTags []models.TagCount
	err = r.db.SelectContext(ctx, &topTags, tagsQuery, startOfDay, endOfDay)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("failed to generate top tags: %w", err)
	}

	// Create analytics data
	analyticsData := &models.AnalyticsData{
		Period:          dateStr,
		ArchiveCount:    stats.ArchiveCount,
		AvgSuccessRate:  stats.AvgSuccessRate,
		AvgProcessingMs: metadataStats.AvgProcessingMs,
		TotalTokens:     metadataStats.TotalTokens,
		FailureCount:    stats.FailureCount,
		TopTags:         topTags,
	}

	return analyticsData, nil
}
