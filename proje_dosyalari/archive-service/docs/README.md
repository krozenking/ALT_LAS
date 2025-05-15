# Archive Service Documentation

## Overview
The Archive Service is responsible for storing, managing, and retrieving archived data in the ALT_LAS system. It handles *.last files produced by the Runner Service, processes them, and stores them in a structured format for future reference and analysis.

## Architecture
The Archive Service is built using Go and follows a clean architecture pattern with the following components:
- **API Layer**: HTTP endpoints for interacting with the service
- **Service Layer**: Business logic implementation
- **Repository Layer**: Data access and storage
- **Models**: Data structures and entities

## Key Features
- Processing and storing *.last files
- Converting *.last files to *.atlas format
- Success rate analysis and reporting
- Searching and retrieving archived data
- Data retention policy management
- Database backup and recovery

## Performance Optimizations
The Archive Service includes several performance optimizations:
- Connection pooling for database access
- Prepared statements for common queries
- Query timeouts to prevent long-running operations
- Context-based query execution
- Optimized database schema with proper indexing

## Data Management
### Backup and Recovery
The service includes a comprehensive backup system that:
- Creates regular database backups
- Supports point-in-time recovery
- Implements backup rotation and cleanup
- Provides disaster recovery capabilities

### Retention Policies
Data retention is managed through configurable policies that:
- Define retention periods for different data types
- Automatically archive or delete old data
- Ensure compliance with data retention requirements
- Optimize storage usage

## API Reference
### Last File Endpoints
- `POST /archive`: Submit a *.last file for archiving
- `GET /archive/{id}`: Get the status of an archived file

### Atlas Endpoints
- `GET /atlas/search`: Search archived data with filters
- `GET /atlas/{id}`: Get a specific atlas file
- `POST /atlas/{id}/archive`: Archive an atlas file
- `POST /atlas/{id}/delete`: Delete an atlas file
- `GET /atlas/tags`: Get all available tags

### Success Rate Endpoints
- `GET /success-rate/stats`: Get success rate statistics
- `GET /success-rate/distribution`: Get success rate distribution
- `GET /success-rate/low-entries`: Get entries with low success rates
- `GET /success-rate/check`: Check if a success rate is acceptable

## Deployment
The Archive Service is containerized using Docker and can be deployed using Kubernetes. A CI/CD pipeline is configured to automate the build, test, and deployment process.

## Configuration
The service is configured through environment variables:
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: PostgreSQL database name
- `DB_SSLMODE`: PostgreSQL SSL mode
- `NATS_URL`: NATS server URL
- `NATS_SUBJECT`: NATS subject to subscribe to
- `NATS_QUEUE_GROUP`: NATS queue group
- `LOG_LEVEL`: Logging level
- `LOG_DIR`: Directory for log files
- `BACKUP_DIR`: Directory for database backups
- `RETENTION_DAYS`: Number of days to retain backups

## Monitoring and Alerting
The service exposes metrics for Prometheus and can be monitored using Grafana dashboards. Alerts are configured for:
- Service availability
- Database connectivity
- Success rate thresholds
- Backup failures
- Storage usage

## Troubleshooting
Common issues and their solutions:
- **Database connection failures**: Check network connectivity and credentials
- **NATS connection issues**: Verify NATS server is running and accessible
- **Low success rates**: Review Runner Service logs for processing errors
- **Backup failures**: Check disk space and permissions
- **Performance issues**: Monitor database query performance and connection pool usage

## Future Improvements
Planned enhancements for the Archive Service:
- Enhanced search capabilities with full-text search
- Advanced analytics for success rate trends
- Integration with external storage systems for long-term archiving
- Improved visualization of archived data
- Multi-region replication for disaster recovery
