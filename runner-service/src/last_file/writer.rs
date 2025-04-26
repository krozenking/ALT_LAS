use std::path::{Path, PathBuf};
use std::fs;
use std::io::{self, Write, Read};
use log::{info, error, warn, debug};
use serde_json;
use chrono::Utc;
use std::collections::HashMap;

use super::models::{LastFile, LastFileStatus, Artifact, ArtifactType};

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

/// Writes a LAST file to disk in a compressed format
pub fn write_compressed_last_file(last_file: &LastFile, output_dir: &Path) -> io::Result<PathBuf> {
    info!("Writing compressed LAST file to disk: {}", last_file.id);
    
    // Create output directory if it doesn't exist
    if !output_dir.exists() {
        fs::create_dir_all(output_dir)?;
    }
    
    // Generate file name
    let file_name = format!("{}.last.gz", last_file.id);
    let file_path = output_dir.join(file_name);
    
    // Serialize LAST file to JSON
    let json = match serde_json::to_string(last_file) {
        Ok(json) => json,
        Err(err) => {
            error!("Failed to serialize LAST file: {}", err);
            return Err(io::Error::new(io::ErrorKind::Other, format!("Failed to serialize LAST file: {}", err)));
        }
    };
    
    // Create gzip encoder
    let file = fs::File::create(&file_path)?;
    let mut encoder = flate2::write::GzEncoder::new(file, flate2::Compression::default());
    
    // Write to compressed file
    encoder.write_all(json.as_bytes())?;
    encoder.finish()?;
    
    info!("Compressed LAST file written to: {:?}", file_path);
    Ok(file_path)
}

/// Reads a compressed LAST file from disk
pub fn read_compressed_last_file(file_path: &Path) -> io::Result<LastFile> {
    info!("Reading compressed LAST file from: {:?}", file_path);
    
    // Open the compressed file
    let file = fs::File::open(file_path)?;
    let mut decoder = flate2::read::GzDecoder::new(file);
    
    // Read the decompressed content
    let mut content = String::new();
    decoder.read_to_string(&mut content)?;
    
    // Deserialize JSON to LAST file
    match serde_json::from_str(&content) {
        Ok(last_file) => {
            info!("Compressed LAST file read successfully: {}", file_path.display());
            Ok(last_file)
        },
        Err(err) => {
            error!("Failed to deserialize compressed LAST file: {}", err);
            Err(io::Error::new(io::ErrorKind::InvalidData, format!("Failed to deserialize compressed LAST file: {}", err)))
        }
    }
}

/// Creates an archive containing the LAST file and all its artifacts
pub fn create_last_file_archive(last_file: &LastFile, output_dir: &Path) -> io::Result<PathBuf> {
    info!("Creating archive for LAST file: {}", last_file.id);
    
    // Create output directory if it doesn't exist
    if !output_dir.exists() {
        fs::create_dir_all(output_dir)?;
    }
    
    // Generate archive file name
    let archive_name = format!("{}_archive.zip", last_file.id);
    let archive_path = output_dir.join(archive_name);
    
    // Create a temporary directory for archive contents
    let temp_dir = tempfile::tempdir()?;
    
    // Write LAST file to temporary directory
    let last_file_path = temp_dir.path().join(format!("{}.last", last_file.id));
    let json = serde_json::to_string_pretty(last_file)?;
    fs::write(&last_file_path, json)?;
    
    // Write summary to temporary directory
    if let Some(summary) = &last_file.summary {
        let summary_path = temp_dir.path().join(format!("{}_summary.txt", last_file.id));
        fs::write(&summary_path, summary)?;
    }
    
    // Copy artifacts to temporary directory if available
    if let Some(artifacts) = &last_file.artifacts {
        let artifacts_dir = temp_dir.path().join("artifacts");
        fs::create_dir_all(&artifacts_dir)?;
        
        for artifact in artifacts {
            let source_path = Path::new(&artifact.path);
            if source_path.exists() {
                let file_name = source_path.file_name().unwrap_or_default();
                let dest_path = artifacts_dir.join(file_name);
                
                if let Err(e) = fs::copy(source_path, &dest_path) {
                    warn!("Failed to copy artifact to archive: {}", e);
                }
            }
        }
    }
    
    // Create zip file
    let file = fs::File::create(&archive_path)?;
    let mut zip = zip::ZipWriter::new(file);
    
    // Add files to zip
    let options = zip::write::FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o644);
    
    // Walk the temporary directory and add all files
    let walker = walkdir::WalkDir::new(temp_dir.path()).into_iter();
    let temp_path = temp_dir.path();
    
    for entry in walker.filter_map(|e| e.ok()) {
        let path = entry.path();
        
        if path.is_file() {
            // Create relative path for zip entry
            let rel_path = path.strip_prefix(temp_path).unwrap();
            let zip_path = rel_path.to_string_lossy();
            
            // Add file to zip
            zip.start_file(zip_path, options)?;
            let mut file = fs::File::open(path)?;
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
        }
    }
    
    // Finalize zip file
    zip.finish()?;
    
    info!("LAST file archive created: {:?}", archive_path);
    Ok(archive_path)
}

/// Exports a LAST file to HTML format for better visualization
pub fn export_last_file_to_html(last_file: &LastFile, output_dir: &Path) -> io::Result<PathBuf> {
    info!("Exporting LAST file to HTML: {}", last_file.id);
    
    // Create output directory if it doesn't exist
    if !output_dir.exists() {
        fs::create_dir_all(output_dir)?;
    }
    
    // Generate HTML file name
    let html_name = format!("{}_report.html", last_file.id);
    let html_path = output_dir.join(html_name);
    
    // Start building HTML content
    let mut html = String::new();
    
    // HTML header
    html.push_str("<!DOCTYPE html>\n");
    html.push_str("<html lang=\"en\">\n");
    html.push_str("<head>\n");
    html.push_str("  <meta charset=\"UTF-8\">\n");
    html.push_str("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
    html.push_str(&format!("  <title>LAST File Report: {}</title>\n", last_file.id));
    html.push_str("  <style>\n");
    html.push_str("    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }\n");
    html.push_str("    h1, h2, h3 { color: #333; }\n");
    html.push_str("    .container { max-width: 1200px; margin: 0 auto; }\n");
    html.push_str("    .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }\n");
    html.push_str("    .section { margin-bottom: 30px; }\n");
    html.push_str("    .task { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; }\n");
    html.push_str("    .task-completed { border-left: 5px solid #4CAF50; }\n");
    html.push_str("    .task-failed { border-left: 5px solid #F44336; }\n");
    html.push_str("    .task-timeout { border-left: 5px solid #FF9800; }\n");
    html.push_str("    .task-cancelled { border-left: 5px solid #9E9E9E; }\n");
    html.push_str("    .artifact { background-color: #f9f9f9; padding: 10px; margin: 5px 0; border-radius: 3px; }\n");
    html.push_str("    .metadata { font-family: monospace; white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border-radius: 3px; }\n");
    html.push_str("    .summary { white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 5px; }\n");
    html.push_str("    .status-success { color: #4CAF50; }\n");
    html.push_str("    .status-partial { color: #FF9800; }\n");
    html.push_str("    .status-failure { color: #F44336; }\n");
    html.push_str("  </style>\n");
    html.push_str("</head>\n");
    html.push_str("<body>\n");
    html.push_str("  <div class=\"container\">\n");
    
    // Header section
    html.push_str("    <div class=\"header\">\n");
    html.push_str(&format!("      <h1>LAST File Report: {}</h1>\n", last_file.id));
    html.push_str(&format!("      <p><strong>ALT File:</strong> {} ({})</p>\n", last_file.alt_file_title, last_file.alt_file_id));
    html.push_str(&format!("      <p><strong>Execution ID:</strong> {}</p>\n", last_file.execution_id));
    html.push_str(&format!("      <p><strong>Created:</strong> {}</p>\n", last_file.created_at.to_rfc3339()));
    html.push_str(&format!("      <p><strong>Mode:</strong> {:?}</p>\n", last_file.mode));
    
    // Status with color coding
    let status_class = match last_file.status {
        LastFileStatus::Success => "status-success",
        LastFileStatus::PartialSuccess => "status-partial",
        LastFileStatus::Failure => "status-failure",
    };
    html.push_str(&format!("      <p><strong>Status:</strong> <span class=\"{}\">{:?}</span></p>\n", status_class, last_file.status));
    
    html.push_str(&format!("      <p><strong>Success Rate:</strong> {:.2}%</p>\n", last_file.success_rate * 100.0));
    html.push_str(&format!("      <p><strong>Execution Time:</strong> {}ms</p>\n", last_file.execution_time_ms));
    
    if let Some(persona) = &last_file.persona {
        html.push_str(&format!("      <p><strong>Persona:</strong> {}</p>\n", persona));
    }
    
    if let Some(priority) = &last_file.priority {
        html.push_str(&format!("      <p><strong>Priority:</strong> {:?}</p>\n", priority));
    }
    
    if let Some(tags) = &last_file.tags {
        if !tags.is_empty() {
            html.push_str(&format!("      <p><strong>Tags:</strong> {}</p>\n", tags.join(", ")));
        }
    }
    
    html.push_str("    </div>\n");
    
    // Summary section
    if let Some(summary) = &last_file.summary {
        html.push_str("    <div class=\"section\">\n");
        html.push_str("      <h2>Summary</h2>\n");
        html.push_str(&format!("      <div class=\"summary\">{}</div>\n", summary));
        html.push_str("    </div>\n");
    }
    
    // Tasks section
    html.push_str("    <div class=\"section\">\n");
    html.push_str(&format!("      <h2>Tasks ({})</h2>\n", last_file.task_results.len()));
    
    for (task_id, result) in &last_file.task_results {
        let task_class = match result.status {
            TaskStatus::Completed => "task task-completed",
            TaskStatus::Failed => "task task-failed",
            TaskStatus::Timeout => "task task-timeout",
            TaskStatus::Cancelled => "task task-cancelled",
            _ => "task",
        };
        
        html.push_str(&format!("      <div class=\"{}\">\n", task_class));
        html.push_str(&format!("        <h3>{}</h3>\n", task_id));
        html.push_str(&format!("        <p><strong>Status:</strong> {:?}</p>\n", result.status));
        
        if let Some(duration) = result.duration_ms {
            html.push_str(&format!("        <p><strong>Duration:</strong> {}ms</p>\n", duration));
        }
        
        if let Some(output) = &result.output {
            html.push_str("        <p><strong>Output:</strong></p>\n");
            html.push_str(&format!("        <div class=\"metadata\">{}</div>\n", serde_json::to_string_pretty(output).unwrap_or_default()));
        }
        
        if let Some(error) = &result.error {
            html.push_str(&format!("        <p><strong>Error:</strong> {}</p>\n", error));
        }
        
        html.push_str("      </div>\n");
    }
    
    html.push_str("    </div>\n");
    
    // Artifacts section
    if let Some(artifacts) = &last_file.artifacts {
        if !artifacts.is_empty() {
            html.push_str("    <div class=\"section\">\n");
            html.push_str(&format!("      <h2>Artifacts ({})</h2>\n", artifacts.len()));
            
            for artifact in artifacts {
                html.push_str("      <div class=\"artifact\">\n");
                html.push_str(&format!("        <p><strong>Name:</strong> {}</p>\n", artifact.name));
                html.push_str(&format!("        <p><strong>Type:</strong> {:?}</p>\n", artifact.artifact_type));
                html.push_str(&format!("        <p><strong>Task:</strong> {}</p>\n", artifact.task_id));
                html.push_str(&format!("        <p><strong>Path:</strong> {}</p>\n", artifact.path));
                
                if let Some(size) = artifact.size_bytes {
                    let size_str = if size < 1024 {
                        format!("{} bytes", size)
                    } else if size < 1024 * 1024 {
                        format!("{:.2} KB", size as f64 / 1024.0)
                    } else {
                        format!("{:.2} MB", size as f64 / (1024.0 * 1024.0))
                    };
                    html.push_str(&format!("        <p><strong>Size:</strong> {}</p>\n", size_str));
                }
                
                if let Some(mime) = &artifact.mime_type {
                    html.push_str(&format!("        <p><strong>MIME Type:</strong> {}</p>\n", mime));
                }
                
                html.push_str("      </div>\n");
            }
            
            html.push_str("    </div>\n");
        }
    }
    
    // Metadata section
    if let Some(metadata) = &last_file.metadata {
        if !metadata.is_empty() {
            html.push_str("    <div class=\"section\">\n");
            html.push_str("      <h2>Metadata</h2>\n");
            html.push_str(&format!("      <div class=\"metadata\">{}</div>\n", serde_json::to_string_pretty(metadata).unwrap_or_default()));
            html.push_str("    </div>\n");
        }
    }
    
    // Close HTML
    html.push_str("  </div>\n");
    html.push_str("</body>\n");
    html.push_str("</html>\n");
    
    // Write HTML to file
    fs::write(&html_path, html)?;
    
    info!("LAST file exported to HTML: {:?}", html_path);
    Ok(html_path)
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
    
    #[test]
    fn test_export_last_file_to_html() {
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
        
        // Export LAST file to HTML
        let html_path = export_last_file_to_html(&last_file, temp_dir.path()).unwrap();
        
        // Read HTML file
        let html_content = fs::read_to_string(html_path).unwrap();
        
        // Verify the HTML content
        assert!(html_content.contains("<!DOCTYPE html>"));
        assert!(html_content.contains(&last_file.id));
        assert!(html_content.contains(&last_file.alt_file_title));
    }
}
