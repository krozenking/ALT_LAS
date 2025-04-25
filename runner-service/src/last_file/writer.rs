use std::fs;
use std::path::{Path, PathBuf};
use std::io::{self, Write};
use log::{info, error};

use super::models::LastFile;

/// Writes a LAST file to disk
pub fn write_last_file(last_file: &LastFile, output_dir: &Path) -> io::Result<PathBuf> {
    info!("Writing LAST file to disk: {}", last_file.id);
    
    // Create output directory if it doesn't exist
    if !output_dir.exists() {
        fs::create_dir_all(output_dir)?;
    }
    
    // Generate file name
    let file_name = format!("{}.last", last_file.id);
    let file_path = output_dir.join(file_name);
    
    // Serialize LAST file to JSON
    let json = match serde_json::to_string_pretty(last_file) {
        Ok(json) => json,
        Err(err) => {
            error!("Failed to serialize LAST file: {}", err);
            return Err(io::Error::new(io::ErrorKind::Other, format!("Failed to serialize LAST file: {}", err)));
        }
    };
    
    // Write to file
    let mut file = fs::File::create(&file_path)?;
    file.write_all(json.as_bytes())?;
    
    info!("LAST file written to: {:?}", file_path);
    Ok(file_path)
}

/// Reads a LAST file from disk
pub fn read_last_file(file_path: &Path) -> io::Result<LastFile> {
    info!("Reading LAST file from: {:?}", file_path);
    
    // Read file content
    let content = fs::read_to_string(file_path)?;
    
    // Deserialize JSON to LAST file
    match serde_json::from_str(&content) {
        Ok(last_file) => {
            info!("LAST file read successfully: {}", file_path.display());
            Ok(last_file)
        },
        Err(err) => {
            error!("Failed to deserialize LAST file: {}", err);
            Err(io::Error::new(io::ErrorKind::InvalidData, format!("Failed to deserialize LAST file: {}", err)))
        }
    }
}

/// Writes a summary of the LAST file to disk
pub fn write_last_file_summary(last_file: &LastFile, output_dir: &Path) -> io::Result<PathBuf> {
    info!("Writing LAST file summary to disk: {}", last_file.id);
    
    // Create output directory if it doesn't exist
    if !output_dir.exists() {
        fs::create_dir_all(output_dir)?;
    }
    
    // Generate file name
    let file_name = format!("{}_summary.txt", last_file.id);
    let file_path = output_dir.join(file_name);
    
    // Get summary text
    let summary = match &last_file.summary {
        Some(summary) => summary.clone(),
        None => "No summary available".to_string(),
    };
    
    // Write to file
    let mut file = fs::File::create(&file_path)?;
    file.write_all(summary.as_bytes())?;
    
    info!("LAST file summary written to: {:?}", file_path);
    Ok(file_path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::{AltFile, AltMode};
    use crate::last_file::generator::generate_last_file;
    use crate::task_manager::models::{TaskResult, TaskStatus};
    use std::collections::HashMap;
    use tempfile::TempDir;
    
    #[test]
    fn test_write_and_read_last_file() {
        // Create a temporary directory
        let temp_dir = TempDir::new().unwrap();
        
        // Create a simple ALT file
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        alt_file.mode = Some(AltMode::Normal);
        
        // Create a task result
        let mut task_result = TaskResult::new("task1".to_string());
        task_result.mark_completed(serde_json::json!({
            "output": "Task completed successfully"
        }));
        
        let mut task_results = HashMap::new();
        task_results.insert("task1".to_string(), task_result);
        
        // Generate a LAST file
        let last_file = generate_last_file(&alt_file, task_results);
        
        // Write LAST file to disk
        let file_path = write_last_file(&last_file, temp_dir.path()).unwrap();
        
        // Read LAST file from disk
        let read_last_file = read_last_file(&file_path).unwrap();
        
        // Verify the read LAST file matches the original
        assert_eq!(read_last_file.id, last_file.id);
        assert_eq!(read_last_file.alt_file_id, last_file.alt_file_id);
        assert_eq!(read_last_file.status, last_file.status);
    }
    
    #[test]
    fn test_write_last_file_summary() {
        // Create a temporary directory
        let temp_dir = TempDir::new().unwrap();
        
        // Create a simple ALT file
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        alt_file.mode = Some(AltMode::Normal);
        
        // Create a task result
        let mut task_result = TaskResult::new("task1".to_string());
        task_result.mark_completed(serde_json::json!({
            "output": "Task completed successfully"
        }));
        
        let mut task_results = HashMap::new();
        task_results.insert("task1".to_string(), task_result);
        
        // Generate a LAST file
        let last_file = generate_last_file(&alt_file, task_results);
        
        // Write LAST file summary to disk
        let summary_path = write_last_file_summary(&last_file, temp_dir.path()).unwrap();
        
        // Read summary file
        let summary_content = fs::read_to_string(summary_path).unwrap();
        
        // Verify the summary content
        assert!(summary_content.contains("Execution Summary"));
        assert!(summary_content.contains(&last_file.alt_file_title));
    }
}
