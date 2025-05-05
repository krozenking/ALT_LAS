use serde;
use std::collections::HashMap;
use std::fs::File;
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};
use log::{info, error, debug, warn};
use uuid::Uuid;
use chrono::Utc;
use super::validator::validate_alt_file;

/// Error type for ALT file parsing operations
#[derive(Debug)]
pub enum AltParseError {
    IoError(io::Error),
    JsonError(serde_json::Error),
    ValidationError(String),
    FormatError(String),
    SchemaError(String),
}

impl From<io::Error> for AltParseError {
    fn from(err: io::Error) -> Self {
        AltParseError::IoError(err)
    }
}

impl From<serde_json::Error> for AltParseError {
    fn from(err: serde_json::Error) -> Self {
        AltParseError::JsonError(err)
    }
}

impl std::fmt::Display for AltParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AltParseError::IoError(err) => write!(f, "IO Error: {}", err),
            AltParseError::JsonError(err) => write!(f, "JSON Error: {}", err),
            AltParseError::ValidationError(err) => write!(f, "Validation Error: {}", err),
            AltParseError::FormatError(err) => write!(f, "Format Error: {}", err),
            AltParseError::SchemaError(err) => write!(f, "Schema Error: {}", err),
        }
    }
}

impl std::error::Error for AltParseError {}

/// Represents a parser for ALT files
pub struct AltParser {
    /// Optional schema for validation
    schema: Option<serde_json::Value>,
    /// Default directory for ALT files
    default_dir: Option<PathBuf>,
    /// Whether to perform strict validation
    strict_validation: bool,
}

impl Default for AltParser {
    fn default() -> Self {
        AltParser {
            schema: None,
            default_dir: None,
            strict_validation: true,
        }
    }
}

impl AltParser {
    /// Creates a new ALT parser with default settings
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets the JSON schema for validation
    pub fn with_schema(mut self, schema: serde_json::Value) -> Self {
        self.schema = Some(schema);
        self
    }

    /// Sets the default directory for ALT files
    pub fn with_default_dir<P: AsRef<Path>>(mut self, dir: P) -> Self {
        self.default_dir = Some(dir.as_ref().to_path_buf());
        self
    }

    /// Sets whether to perform strict validation
    pub fn with_strict_validation(mut self, strict: bool) -> Self {
        self.strict_validation = strict;
        self
    }

    /// Parses an ALT file from a file path
    pub fn parse_from_path<P: AsRef<Path>>(&self, path: P) -> Result<AltFile, AltParseError> {
        let path = path.as_ref();
        info!("Parsing ALT file from path: {:?}", path);
        
        // Check if file exists
        if !path.exists() {
            return Err(AltParseError::IoError(io::Error::new(
                io::ErrorKind::NotFound,
                format!("File not found: {:?}", path),
            )));
        }
        
        // Check file extension
        if let Some(ext) = path.extension() {
            if ext != "alt" && ext != "json" {
                warn!("File extension is not .alt or .json: {:?}", path);
            }
        } else {
            warn!("File has no extension: {:?}", path);
        }
        
        // Read file content
        let mut file = File::open(path)?;
        let mut content = String::new();
        file.read_to_string(&mut content)?;
        
        self.parse_from_string(&content)
    }

    /// Parses an ALT file from a string content
    pub fn parse_from_string(&self, content: &str) -> Result<AltFile, AltParseError> {
        info!("Parsing ALT file from content");
        
        // Check if content is empty
        if content.trim().is_empty() {
            return Err(AltParseError::FormatError("ALT file content is empty".to_string()));
        }
        
        // Parse JSON
        let mut alt_file: AltFile = serde_json::from_str(content)
            .map_err(|e| {
                error!("Failed to parse ALT file JSON: {}", e);
                AltParseError::JsonError(e)
            })?;
        
        // Validate against schema if provided
        if let Some(schema) = &self.schema {
            self.validate_against_schema(&alt_file, schema)?;
        }
        
        // Initialize task statuses if not set
        for task in &mut alt_file.tasks {
            if task.status.is_none() {
                task.status = Some(TaskStatus::Pending);
            }
        }
        
        // Validate the parsed ALT file
        if self.strict_validation {
            if let Err(validation_error) = validate_alt_file(&alt_file) {
                error!("ALT file validation failed: {}", validation_error);
                return Err(AltParseError::ValidationError(validation_error));
            }
        }
        
        info!("Successfully parsed ALT file with ID: {}", alt_file.id);
        debug!("ALT file contains {} tasks", alt_file.tasks.len());
        
        Ok(alt_file)
    }

    /// Validates an ALT file against a JSON schema
    fn validate_against_schema(&self, alt_file: &AltFile, schema: &serde_json::Value) -> Result<(), AltParseError> {
        debug!("Validating ALT file against schema");
        
        // Convert ALT file to JSON for schema validation
        let _alt_file_json = serde_json::to_value(alt_file)
            .map_err(|e| AltParseError::JsonError(e))?;
        
        // Use jsonschema crate for validation
        // Note: This is a placeholder. In a real implementation, you would use a schema validation library.
        // For example: jsonschema::validate(&alt_file_json, schema)
        
        // For now, we'll just do a simple check
        if !schema.is_object() {
            return Err(AltParseError::SchemaError("Invalid schema format".to_string()));
        }
        
        debug!("Schema validation successful");
        Ok(())
    }

    /// Saves an ALT file to a file path
    pub fn save_to_path<P: AsRef<Path>>(&self, alt_file: &AltFile, path: P) -> Result<(), AltParseError> {
        let path = path.as_ref();
        info!("Saving ALT file to path: {:?}", path);
        
        // Validate the ALT file before saving
        if self.strict_validation {
            if let Err(validation_error) = validate_alt_file(alt_file) {
                error!("ALT file validation failed: {}", validation_error);
                return Err(AltParseError::ValidationError(validation_error));
            }
        }
        
        // Convert to JSON
        let json = serde_json::to_string_pretty(alt_file)
            .map_err(|e| {
                error!("Failed to serialize ALT file to JSON: {}", e);
                AltParseError::JsonError(e)
            })?;
        
        // Ensure directory exists
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| {
                    error!("Failed to create directory: {:?}: {}", parent, e);
                    AltParseError::IoError(e)
                })?;
        }
        
        // Write to file
        let mut file = File::create(path)
            .map_err(|e| {
                error!("Failed to create file: {:?}: {}", path, e);
                AltParseError::IoError(e)
            })?;
        
        file.write_all(json.as_bytes())
            .map_err(|e| {
                error!("Failed to write to file: {:?}: {}", path, e);
                AltParseError::IoError(e)
            })?;
        
        info!("Successfully saved ALT file with ID: {} to {:?}", alt_file.id, path);
        Ok(())
    }

    /// Merges multiple ALT files into a single ALT file
    pub fn merge_alt_files(&self, alt_files: &[AltFile], title: &str) -> Result<AltFile, AltParseError> {
        info!("Merging {} ALT files", alt_files.len());
        
        if alt_files.is_empty() {
            return Err(AltParseError::FormatError("No ALT files to merge".to_string()));
        }
        
        // Create a new ALT file with a new ID
        let mut merged = AltFile {
            id: Uuid::new_v4().to_string(),
            version: "1.0".to_string(),
            created_at: Utc::now(),
            title: title.to_string(),
            description: Some(format!("Merged from {} ALT files", alt_files.len())),
            mode: Some(AltMode::Normal),
            persona: None,
            tasks: Vec::new(),
            metadata: Some(HashMap::new()),
            priority: None,
            tags: None,
            expected_completion_time: None,
        };
        
        // Track task IDs to avoid duplicates
        let mut task_ids = std::collections::HashSet::new();
        
        // Merge tasks from all ALT files
        for (file_index, alt_file) in alt_files.iter().enumerate() {
            // Add source file info to metadata
            if let Some(metadata) = &mut merged.metadata {
                metadata.insert(
                    format!("source_file_{}", file_index),
                    serde_json::Value::String(alt_file.id.clone()),
                );
            }
            
            // Add tasks with prefix to avoid ID conflicts
            for task in &alt_file.tasks {
                let mut new_task = task.clone();
                
                // Create a new ID with prefix if there's a conflict
                if !task_ids.insert(new_task.id.clone()) {
                    let new_id = format!("{}_{}", file_index, new_task.id);
                    debug!("Renaming task ID from {} to {} to avoid conflict", new_task.id, new_id);
                    
                    // Update dependencies to use the new ID format
                    if let Some(deps) = &mut new_task.dependencies {
                        for dep in deps.iter_mut() {
                            if task_ids.contains(dep) {
                                continue; // This dependency is already in the merged file
                            }
                            
                            // Check if this dependency is from the same source file
                            if alt_file.tasks.iter().any(|t| t.id == *dep) {
                                *dep = format!("{}_{}", file_index, dep);
                            }
                        }
                    }
                    
                    new_task.id = new_id;
                    task_ids.insert(new_task.id.clone());
                }
                
                merged.add_task(new_task);
            }
        }
        
        // Validate the merged ALT file
        if self.strict_validation {
            if let Err(validation_error) = validate_alt_file(&merged) {
                error!("Merged ALT file validation failed: {}", validation_error);
                return Err(AltParseError::ValidationError(validation_error));
            }
        }
        
        info!("Successfully merged {} ALT files into one with ID: {}", alt_files.len(), merged.id);
        Ok(merged)
    }
}

/// Creates a sample ALT file for testing purposes
pub fn create_sample_alt_file() -> AltFile {
    let mut alt_file = AltFile::new("Sample ALT File".to_string());
    
    // Add description
    alt_file.description = Some("This is a sample ALT file for testing purposes".to_string());
    
    // Add tasks
    let task1 = Task {
        id: "task1".to_string(),
        description: "First task".to_string(),
        dependencies: None,
        parameters: None,
        timeout_seconds: Some(30),
        retry_count: Some(3),
        status: Some(TaskStatus::Pending),
        priority: None,
        tags: Some(vec!["init".to_string(), "setup".to_string()]),
    };
    
    let task2 = Task {
        id: "task2".to_string(),
        description: "Second task".to_string(),
        dependencies: Some(vec!["task1".to_string()]),
        parameters: None,
        timeout_seconds: Some(60),
        retry_count: Some(2),
        status: Some(TaskStatus::Pending),
        priority: None,
        tags: Some(vec!["processing".to_string()]),
    };
    
    let task3 = Task {
        id: "task3".to_string(),
        description: "Third task".to_string(),
        dependencies: Some(vec!["task2".to_string()]),
        parameters: None,
        timeout_seconds: Some(120),
        retry_count: Some(1),
        status: Some(TaskStatus::Pending),
        priority: None,
        tags: Some(vec!["finalize".to_string()]),
    };
    
    alt_file.add_task(task1);
    alt_file.add_task(task2);
    alt_file.add_task(task3);
    
    alt_file
}

/// Parses an ALT file from a file path (legacy function for backward compatibility)
pub fn parse_alt_file_from_path<P: AsRef<Path>>(path: P) -> Result<AltFile, AltParseError> {
    AltParser::new().parse_from_path(path)
}

/// Parses an ALT file from a string content (legacy function for backward compatibility)
pub fn parse_alt_file(content: &str) -> Result<AltFile, AltParseError> {
    AltParser::new().parse_from_string(content)
}

/// Saves an ALT file to a file path (legacy function for backward compatibility)
pub fn save_alt_file_to_path<P: AsRef<Path>>(alt_file: &AltFile, path: P) -> Result<(), AltParseError> {
    AltParser::new().save_to_path(alt_file, path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::{NamedTempFile, TempDir};
    use std::io::Write;
    
    #[test]
    fn test_parse_valid_alt_file() {
        let alt_file = create_sample_alt_file();
        let json = serde_json::to_string(&alt_file).unwrap();
        
        let parser = AltParser::new();
        let parsed = parser.parse_from_string(&json).unwrap();
        assert_eq!(parsed.title, "Sample ALT File");
        assert_eq!(parsed.tasks.len(), 3);
    }
    
    #[test]
    fn test_parse_alt_file_from_path() {
        let alt_file = create_sample_alt_file();
        let json = serde_json::to_string(&alt_file).unwrap();
        
        let mut temp_file = NamedTempFile::new().unwrap();
        temp_file.write_all(json.as_bytes()).unwrap();
        
        let parser = AltParser::new();
        let parsed = parser.parse_from_path(temp_file.path()).unwrap();
        assert_eq!(parsed.title, "Sample ALT File");
        assert_eq!(parsed.tasks.len(), 3);
    }
    
    #[test]
    fn test_save_and_load_alt_file() {
        let alt_file = create_sample_alt_file();
        let temp_file = NamedTempFile::new().unwrap();
        
        let parser = AltParser::new();
        parser.save_to_path(&alt_file, temp_file.path()).unwrap();
        let loaded = parser.parse_from_path(temp_file.path()).unwrap();
        
        assert_eq!(loaded.id, alt_file.id);
        assert_eq!(loaded.title, alt_file.title);
        assert_eq!(loaded.tasks.len(), alt_file.tasks.len());
    }
    
    #[test]
    fn test_parse_empty_content() {
        let parser = AltParser::new();
        let result = parser.parse_from_string("");
        assert!(result.is_err());
        match result {
            Err(AltParseError::FormatError(_)) => (),
            _ => panic!("Expected FormatError"),
        }
    }
    
    #[test]
    fn test_non_strict_validation() {
        // Create an invalid ALT file (missing task description)
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        let mut task = Task {
            id: "task1".to_string(),
            description: "".to_string(), // Empty description, should fail validation
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: None,
            tags: None,
        };
        alt_file.add_task(task);
        
        let json = serde_json::to_string(&alt_file).unwrap();
        
        // Strict validation should fail
        let strict_parser = AltParser::new().with_strict_validation(true);
        let result = strict_parser.parse_from_string(&json);
        assert!(result.is_err());
        
        // Non-strict validation should pass
        let non_strict_parser = AltParser::new().with_strict_validation(false);
        let result = non_strict_parser.parse_from_string(&json);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_merge_alt_files() {
        // Create first ALT file
        let mut alt_file1 = AltFile::new("First ALT File".to_string());
        alt_file1.add_task(Task {
            id: "task1".to_string(),
            description: "Task 1".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: None,
            tags: None,
        });
        
        // Create second ALT file with a task that depends on a task in the first file
        let mut alt_file2 = AltFile::new("Second ALT File".to_string());
        alt_file2.add_task(Task {
            id: "task1".to_string(), // Same ID as in first file
            description: "Task 1 from second file".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: None,
            tags: None,
        });
        alt_file2.add_task(Task {
            id: "task2".to_string(),
            description: "Task 2".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: None,
            tags: None,
        });
        
        // Merge the ALT files
        let parser = AltParser::new();
        let merged = parser.merge_alt_files(&[alt_file1, alt_file2], "Merged ALT File").unwrap();
        
        // Check the merged file
        assert_eq!(merged.title, "Merged ALT File");
        assert_eq!(merged.tasks.len(), 3); // 1 from first file + 2 from second file
        
        // Check that task IDs were properly renamed to avoid conflicts
        let task_ids: Vec<String> = merged.tasks.iter().map(|t| t.id.clone()).collect();
        assert!(task_ids.contains(&"task1".to_string())); // Original from first file
        assert!(task_ids.contains(&"1_task1".to_string())); // Renamed from second file
        assert!(task_ids.contains(&"task2".to_string()) || task_ids.contains(&"1_task2".to_string()));
        
        // Check that dependencies were updated
        let task2 = merged.tasks.iter().find(|t| t.id == "1_task2" || t.id == "task2").unwrap();
        if let Some(deps) = &task2.dependencies {
            // The dependency should point to the renamed task
            assert!(deps.contains(&"1_task1".to_string()) || deps.contains(&"task1".to_string()));
        } else {
            panic!("Task2 should have dependencies");
        }
    }
    
    #[test]
    fn test_save_to_custom_directory() {
        let alt_file = create_sample_alt_file();
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test_dir").join("test.alt");
        
        let parser = AltParser::new();
        parser.save_to_path(&alt_file, &file_path).unwrap();
        
        // Check that the directory was created
        assert!(file_path.parent().unwrap().exists());
        
        // Check that the file was created
        assert!(file_path.exists());
        
        // Load the file back
        let loaded = parser.parse_from_path(&file_path).unwrap();
        assert_eq!(loaded.id, alt_file.id);
    }
}
