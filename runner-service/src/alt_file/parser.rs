use std::fs;
use std::path::Path;
use std::io::{self, Read};
use serde_json;
use log::{info, error, debug};
use super::models::{AltFile, Task, TaskStatus};
use super::validator::validate_alt_file;

/// Error type for ALT file parsing operations
#[derive(Debug)]
pub enum AltParseError {
    IoError(io::Error),
    JsonError(serde_json::Error),
    ValidationError(String),
    FormatError(String),
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
        }
    }
}

impl std::error::Error for AltParseError {}

/// Parses an ALT file from a file path
pub fn parse_alt_file_from_path(path: &Path) -> Result<AltFile, AltParseError> {
    info!("Parsing ALT file from path: {:?}", path);
    
    // Check if file exists
    if !path.exists() {
        return Err(AltParseError::IoError(io::Error::new(
            io::ErrorKind::NotFound,
            format!("File not found: {:?}", path),
        )));
    }
    
    // Read file content
    let mut file = fs::File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    
    parse_alt_file(&content)
}

/// Parses an ALT file from a string content
pub fn parse_alt_file(content: &str) -> Result<AltFile, AltParseError> {
    info!("Parsing ALT file from content");
    
    // Check if content is empty
    if content.trim().is_empty() {
        return Err(AltParseError::FormatError("ALT file content is empty".to_string()));
    }
    
    // Parse JSON
    let mut alt_file: AltFile = serde_json::from_str(content)?;
    
    // Initialize task statuses if not set
    for task in &mut alt_file.tasks {
        if task.status.is_none() {
            task.status = Some(TaskStatus::Pending);
        }
    }
    
    // Validate the parsed ALT file
    if let Err(validation_error) = validate_alt_file(&alt_file) {
        error!("ALT file validation failed: {}", validation_error);
        return Err(AltParseError::ValidationError(validation_error));
    }
    
    info!("Successfully parsed ALT file with ID: {}", alt_file.id);
    debug!("ALT file contains {} tasks", alt_file.tasks.len());
    
    Ok(alt_file)
}

/// Saves an ALT file to a file path
pub fn save_alt_file_to_path(alt_file: &AltFile, path: &Path) -> Result<(), AltParseError> {
    info!("Saving ALT file to path: {:?}", path);
    
    // Validate the ALT file before saving
    if let Err(validation_error) = validate_alt_file(alt_file) {
        error!("ALT file validation failed: {}", validation_error);
        return Err(AltParseError::ValidationError(validation_error));
    }
    
    // Convert to JSON
    let json = serde_json::to_string_pretty(alt_file)
        .map_err(|e| AltParseError::JsonError(e))?;
    
    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| AltParseError::IoError(e))?;
    }
    
    // Write to file
    fs::write(path, json)
        .map_err(|e| AltParseError::IoError(e))?;
    
    info!("Successfully saved ALT file with ID: {} to {:?}", alt_file.id, path);
    Ok(())
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

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;
    use std::io::Write;
    
    #[test]
    fn test_parse_valid_alt_file() {
        let alt_file = create_sample_alt_file();
        let json = serde_json::to_string(&alt_file).unwrap();
        
        let parsed = parse_alt_file(&json).unwrap();
        assert_eq!(parsed.title, "Sample ALT File");
        assert_eq!(parsed.tasks.len(), 3);
    }
    
    #[test]
    fn test_parse_alt_file_from_path() {
        let alt_file = create_sample_alt_file();
        let json = serde_json::to_string(&alt_file).unwrap();
        
        let mut temp_file = NamedTempFile::new().unwrap();
        temp_file.write_all(json.as_bytes()).unwrap();
        
        let parsed = parse_alt_file_from_path(temp_file.path()).unwrap();
        assert_eq!(parsed.title, "Sample ALT File");
        assert_eq!(parsed.tasks.len(), 3);
    }
    
    #[test]
    fn test_save_and_load_alt_file() {
        let alt_file = create_sample_alt_file();
        let temp_file = NamedTempFile::new().unwrap();
        
        save_alt_file_to_path(&alt_file, temp_file.path()).unwrap();
        let loaded = parse_alt_file_from_path(temp_file.path()).unwrap();
        
        assert_eq!(loaded.id, alt_file.id);
        assert_eq!(loaded.title, alt_file.title);
        assert_eq!(loaded.tasks.len(), alt_file.tasks.len());
    }
    
    #[test]
    fn test_parse_empty_content() {
        let result = parse_alt_file("");
        assert!(result.is_err());
        match result {
            Err(AltParseError::FormatError(_)) => (),
            _ => panic!("Expected FormatError"),
        }
    }
}
