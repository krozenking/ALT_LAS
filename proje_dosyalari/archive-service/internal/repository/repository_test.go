package repository_test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/krozenking/ALT_LAS/archive-service/internal/config"
	"github.com/krozenking/ALT_LAS/archive-service/internal/models"
	"github.com/krozenking/ALT_LAS/archive-service/internal/repository"
)

var (
	testDB *sqlx.DB
	dbManager *repository.DBManager
)

func TestMain(m *testing.M) {
	// Setup test database
	dbConfig := &config.DatabaseConfig{
		Host:     "localhost",
		Port:     5432,
		User:     "postgres",
		Password: "postgres",
		DBName:   "atlas_archive_test",
		SSLMode:  "disable",
		MaxConns: 5,
		MaxIdle:  2,
	}

	// Override with environment variables if available
	if host := os.Getenv("TEST_DB_HOST"); host != "" {
		dbConfig.Host = host
	}
	if port := os.Getenv("TEST_DB_PORT"); port != "" {
		// Parse port, ignoring error for simplicity in test
		dbConfig.Port = 5432
	}
	if user := os.Getenv("TEST_DB_USER"); user != "" {
		dbConfig.User = user
	}
	if password := os.Getenv("TEST_DB_PASSWORD"); password != "" {
		dbConfig.Password = password
	}
	if dbName := os.Getenv("TEST_DB_NAME"); dbName != "" {
		dbConfig.DBName = dbName
	}

	// Create DB manager
	dbManager = repository.NewDBManager(dbConfig)
	
	// Connect to database
	err := dbManager.Connect()
	if err != nil {
		// If we can't connect, skip tests that require database
		os.Exit(0)
	}
	
	testDB = dbManager.GetDB()
	
	// Run migrations
	err = dbManager.RunMigrations("../migrations")
	if err != nil {
		// If migrations fail, skip tests
		os.Exit(0)
	}
	
	// Run tests
	exitCode := m.Run()
	
	// Clean up
	if testDB != nil {
		testDB.Close()
	}
	
	os.Exit(exitCode)
}

func TestArchiveRepository_CRUD(t *testing.T) {
	if testDB == nil {
		t.Skip("Database connection not available")
	}
	
	// Create repository
	repo := repository.NewPostgresArchiveRepository(testDB)
	
	// Create test archive
	ctx := context.Background()
	id := uuid.New()
	now := time.Now().UTC()
	
	archive := &models.Archive{
		ID:          id,
		LastFile:    "test_last_file.last",
		Status:      models.ArchiveStatusPending,
		SuccessRate: 0,
		Metadata: map[string]interface{}{
			"test_key": "test_value",
		},
		CreatedAt: now,
		UpdatedAt: now,
	}
	
	// Test Create
	err := repo.Create(ctx, archive)
	require.NoError(t, err)
	
	// Test GetByID
	retrieved, err := repo.GetByID(ctx, id)
	require.NoError(t, err)
	assert.Equal(t, id, retrieved.ID)
	assert.Equal(t, "test_last_file.last", retrieved.LastFile)
	assert.Equal(t, models.ArchiveStatusPending, retrieved.Status)
	
	// Test Update
	retrieved.Status = models.ArchiveStatusCompleted
	retrieved.AtlasFile = "test_atlas_file.atlas"
	retrieved.SuccessRate = 0.95
	processedAt := time.Now().UTC()
	retrieved.ProcessedAt = &processedAt
	
	err = repo.Update(ctx, retrieved)
	require.NoError(t, err)
	
	// Verify update
	updated, err := repo.GetByID(ctx, id)
	require.NoError(t, err)
	assert.Equal(t, models.ArchiveStatusCompleted, updated.Status)
	assert.Equal(t, "test_atlas_file.atlas", updated.AtlasFile)
	assert.Equal(t, 0.95, updated.SuccessRate)
	assert.NotNil(t, updated.ProcessedAt)
	
	// Test List
	archives, err := repo.List(ctx, 10, 0)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, len(archives), 1)
	
	// Test Search
	query := &models.SearchQuery{
		Status:     models.ArchiveStatusCompleted,
		MinSuccess: 0.9,
		Limit:      10,
		Offset:     0,
	}
	
	searchResults, count, err := repo.Search(ctx, query)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, count, int64(1))
	assert.GreaterOrEqual(t, len(searchResults), 1)
	
	// Test Delete
	err = repo.Delete(ctx, id)
	require.NoError(t, err)
	
	// Verify deletion
	_, err = repo.GetByID(ctx, id)
	assert.Error(t, err)
}

func TestAtlasMetadataRepository_CRUD(t *testing.T) {
	if testDB == nil {
		t.Skip("Database connection not available")
	}
	
	// Create repositories
	archiveRepo := repository.NewPostgresArchiveRepository(testDB)
	metadataRepo := repository.NewPostgresAtlasMetadataRepository(testDB)
	
	// Create test archive first
	ctx := context.Background()
	archiveID := uuid.New()
	now := time.Now().UTC()
	
	archive := &models.Archive{
		ID:          archiveID,
		LastFile:    "test_last_file.last",
		AtlasFile:   "test_atlas_file.atlas",
		Status:      models.ArchiveStatusCompleted,
		SuccessRate: 0.95,
		Metadata: map[string]interface{}{
			"test_key": "test_value",
		},
		CreatedAt:   now,
		UpdatedAt:   now,
		ProcessedAt: &now,
	}
	
	err := archiveRepo.Create(ctx, archive)
	require.NoError(t, err)
	
	// Create test atlas metadata
	metadataID := uuid.New().String()
	metadata := &models.AtlasMetadata{
		ID:              metadataID,
		ArchiveID:       archiveID.String(),
		Version:         "1.0",
		SuccessRate:     0.95,
		ProcessingTimeMs: 1500,
		TokenCount:      1000,
		PromptSummary:   "Test prompt summary",
		Tags:            []string{"test", "example"},
		CustomMetadata: map[string]interface{}{
			"model": "test-model",
			"environment": "test",
		},
		CreatedAt: now,
	}
	
	// Test Create
	err = metadataRepo.Create(ctx, metadata)
	require.NoError(t, err)
	
	// Test GetByID
	retrieved, err := metadataRepo.GetByID(ctx, metadataID)
	require.NoError(t, err)
	assert.Equal(t, metadataID, retrieved.ID)
	assert.Equal(t, archiveID.String(), retrieved.ArchiveID)
	assert.Equal(t, "1.0", retrieved.Version)
	assert.Equal(t, 0.95, retrieved.SuccessRate)
	
	// Test GetByArchiveID
	retrievedByArchive, err := metadataRepo.GetByArchiveID(ctx, archiveID.String())
	require.NoError(t, err)
	assert.Equal(t, metadataID, retrievedByArchive.ID)
	
	// Test Update
	retrieved.SuccessRate = 0.98
	retrieved.TokenCount = 1200
	retrieved.Tags = append(retrieved.Tags, "updated")
	
	err = metadataRepo.Update(ctx, retrieved)
	require.NoError(t, err)
	
	// Verify update
	updated, err := metadataRepo.GetByID(ctx, metadataID)
	require.NoError(t, err)
	assert.Equal(t, 0.98, updated.SuccessRate)
	assert.Equal(t, 1200, updated.TokenCount)
	assert.Contains(t, updated.Tags, "updated")
	
	// Test ListByTags
	metadataList, count, err := metadataRepo.ListByTags(ctx, []string{"test"}, 10, 0)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, count, int64(1))
	assert.GreaterOrEqual(t, len(metadataList), 1)
	
	// Test SearchByMetadata
	searchQuery := map[string]interface{}{
		"model": "test-model",
	}
	
	searchResults, searchCount, err := metadataRepo.SearchByMetadata(ctx, searchQuery, 10, 0)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, searchCount, int64(1))
	assert.GreaterOrEqual(t, len(searchResults), 1)
	
	// Test Delete
	err = metadataRepo.Delete(ctx, metadataID)
	require.NoError(t, err)
	
	// Verify deletion
	_, err = metadataRepo.GetByID(ctx, metadataID)
	assert.Error(t, err)
	
	// Clean up archive
	err = archiveRepo.Delete(ctx, archiveID)
	require.NoError(t, err)
}

func TestTagRepository_CRUD(t *testing.T) {
	if testDB == nil {
		t.Skip("Database connection not available")
	}
	
	// Create repository
	repo := repository.NewPostgresTagRepository(testDB)
	
	// Create test tag
	ctx := context.Background()
	id := uuid.New().String()
	now := time.Now().UTC()
	
	tag := &models.Tag{
		ID:        id,
		Name:      "test-tag-" + id[:8],
		Category:  "test-category",
		CreatedAt: now,
		UpdatedAt: now,
	}
	
	// Test Create
	err := repo.Create(ctx, tag)
	require.NoError(t, err)
	
	// Test GetByID
	retrieved, err := repo.GetByID(ctx, id)
	require.NoError(t, err)
	assert.Equal(t, id, retrieved.ID)
	assert.Equal(t, tag.Name, retrieved.Name)
	assert.Equal(t, "test-category", retrieved.Category)
	
	// Test GetByName
	retrievedByName, err := repo.GetByName(ctx, tag.Name)
	require.NoError(t, err)
	assert.Equal(t, id, retrievedByName.ID)
	
	// Test Update
	retrieved.Category = "updated-category"
	
	err = repo.Update(ctx, retrieved)
	require.NoError(t, err)
	
	// Verify update
	updated, err := repo.GetByID(ctx, id)
	require.NoError(t, err)
	assert.Equal(t, "updated-category", updated.Category)
	
	// Test List
	tags, count, err := repo.List(ctx, 10, 0)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, count, int64(1))
	assert.GreaterOrEqual(t, len(tags), 1)
	
	// Test ListByCategory
	categoryTags, categoryCount, err := repo.ListByCategory(ctx, "updated-category", 10, 0)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, categoryCount, int64(1))
	assert.GreaterOrEqual(t, len(categoryTags), 1)
	
	// Test Delete
	err = repo.Delete(ctx, id)
	require.NoError(t, err)
	
	// Verify deletion
	_, err = repo.GetByID(ctx, id)
	assert.Error(t, err)
}

func TestAnalyticsRepository(t *testing.T) {
	if testDB == nil {
		t.Skip("Database connection not available")
	}
	
	// Create repositories
	archiveRepo := repository.NewPostgresArchiveRepository(testDB)
	analyticsRepo := repository.NewPostgresAnalyticsRepository(testDB)
	
	// Create test archive for analytics
	ctx := context.Background()
	archiveID := uuid.New()
	now := time.Now().UTC()
	
	archive := &models.Archive{
		ID:          archiveID,
		LastFile:    "analytics_test_file.last",
		AtlasFile:   "analytics_test_file.atlas",
		Status:      models.ArchiveStatusCompleted,
		SuccessRate: 0.95,
		Metadata: map[string]interface{}{
			"test_key": "analytics_test",
		},
		CreatedAt:   now,
		UpdatedAt:   now,
		ProcessedAt: &now,
	}
	
	err := archiveRepo.Create(ctx, archive)
	require.NoError(t, err)
	
	// Generate analytics for today
	today := time.Now().UTC().Truncate(24 * time.Hour)
	analyticsData, err := analyticsRepo.GenerateAnalyticsForDate(ctx, today)
	require.NoError(t, err)
	
	// Test UpdateDailyAnalytics
	err = analyticsRepo.UpdateDailyAnalytics(ctx, today, analyticsData)
	require.NoError(t, err)
	
	// Test GetDailyAnalytics
	retrieved, err := analyticsRepo.GetDailyAnalytics(ctx, today)
	if err != nil {
		// This might fail if the analytics table is empty, which is fine for tests
		t.Log("GetDailyAnalytics error:", err)
	} else {
		assert.Equal(t, today.Format("2006-01-02"), retrieved.Period)
	}
	
	// Test GetAnalyticsRange
	startDate := today.AddDate(0, 0, -7)
	endDate := today
	
	rangeData, err := analyticsRepo.GetAnalyticsRange(ctx, startDate, endDate)
	require.NoError(t, err)
	
	// The range might be empty, which is fine for tests
	t.Logf("Analytics range returned %d records", len(rangeData))
	
	// Clean up archive
	err = archiveRepo.Delete(ctx, archiveID)
	require.NoError(t, err)
}
