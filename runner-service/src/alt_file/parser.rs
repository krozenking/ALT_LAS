use std::fs;
use std::path::Path;
use std::io::{self, Read};
use serde_json;
use log::{info, error};

use super::models::{AltFile, Task};
use super::validator::validate_alt_file;

/// Error type for ALT file parsing operations
#[derive(Debug)]
pub enum AltParseError {
    IoError(io::Error),
    JsonError(serde_json::Error),
    ValidationError(String),
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

/// Parses an ALT file from a file path
pub fn parse_alt_file_from_path(path: &Path) -> Result<AltFile, AltParseError> {
    info!("Parsing ALT file from path: {:?}", path);
    
    // Read file content
    let mut file = fs::File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    
    parse_alt_file(&content)
}

/// Parses an ALT file from a string content
pub fn parse_alt_file(content: &str) -> Result<AltFile, AltParseError> {
    info!("Parsing ALT file from content");
    
    // Parse JSON
    let alt_file: AltFile = serde_json::from_str(content)?;
    
    // Validate the parsed ALT file
    if let Err(validation_error) = validate_alt_file(&alt_file) {
        error!("ALT file validation failed: {}", validation_error);
        return Err(AltParseError::ValidationError(validation_error));
    }
    
    info!("Successfully parsed ALT file with ID: {}", alt_file.id);
    Ok(alt_file)
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
    };
    
    let task2 = Task {
        id: "task2".to_string(),
        description: "Second task".to_string(),
        dependencies: Some(vec!["task1".to_string()]),
        parameters: None,
        timeout_seconds: Some(60),
        retry_count: Some(2),
    };
    
    let task3 = Task {
        id: "task3".to_string(),
        description: "Third task".to_string(),
        dependencies: Some(vec!["task2".to_string()]),
        parameters: None,
        timeout_seconds: Some(120),
        retry_count: Some(1),
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
}
