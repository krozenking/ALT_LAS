use std::fs::{self, File};
use std::io::{self, Write, Read};
use std::path::{Path, PathBuf};
use log::{info, warn}; // Removed unused error, debug
use serde_json;
use flate2::write::GzEncoder;
use flate2::read::GzDecoder;
use flate2::Compression;
use zip::write::{FileOptions, ZipWriter};
use zip::CompressionMethod;
// use chrono::Utc; // Removed unused Utc

use super::models::LastFile; // Removed unused LastFileStatus, ArtifactType

/// Error type for LAST file writing operations
#[derive(Debug)]
pub enum LastWriteError {
    IoError(io::Error),
    JsonError(serde_json::Error),
    ZipError(zip::result::ZipError),
    FormatError(String),
}

impl From<io::Error> for LastWriteError {
    fn from(err: io::Error) -> Self {
        LastWriteError::IoError(err)
    }
}

impl From<serde_json::Error> for LastWriteError {
    fn from(err: serde_json::Error) -> Self {
        LastWriteError::JsonError(err)
    }
}

impl From<zip::result::ZipError> for LastWriteError {
    fn from(err: zip::result::ZipError) -> Self {
        LastWriteError::ZipError(err)
    }
}

impl std::fmt::Display for LastWriteError {
    fn fmt(&self, f: &mut std::fmt::Formatter<\'_>) -> std::fmt::Result {
        match self {
            LastWriteError::IoError(err) => write!(f, "IO Error: {}", err),
            LastWriteError::JsonError(err) => write!(f, "JSON Error: {}", err),
            LastWriteError::ZipError(err) => write!(f, "ZIP Error: {}", err),
            LastWriteError::FormatError(err) => write!(f, "Format Error: {}", err),
        }
    }
}

impl std::error::Error for LastWriteError {}

/// Writes a LAST file to a JSON file
pub fn write_last_file(last_file: &LastFile, output_dir: &Path) -> Result<PathBuf, LastWriteError> {
    let file_name = format!("last_{}.json", last_file.execution_id);
    let file_path = output_dir.join(file_name);
    
    info!("Writing LAST file to JSON: {:?}", file_path);
    
    // Ensure output directory exists
    fs::create_dir_all(output_dir)?;
    
    // Serialize to JSON
    let json = serde_json::to_string_pretty(last_file)?;
    
    // Write to file
    fs::write(&file_path, json)?;
    
    info!("Successfully wrote LAST file to JSON: {:?}", file_path);
    Ok(file_path)
}

/// Reads a LAST file from a JSON file
pub fn read_last_file(file_path: &Path) -> Result<LastFile, LastWriteError> {
    info!("Reading LAST file from JSON: {:?}", file_path);
    
    // Check if file exists
    if !file_path.exists() {
        return Err(LastWriteError::IoError(io::Error::new(
            io::ErrorKind::NotFound,
            format!("File not found: {:?}", file_path),
        )));
    }
    
    // Read file content
    let content = fs::read_to_string(file_path)?;
    
    // Deserialize from JSON
    let last_file: LastFile = serde_json::from_str(&content)?;
    
    info!("Successfully read LAST file from JSON: {:?}", file_path);
    Ok(last_file)
}

/// Writes a summary of the LAST file to a text file
pub fn write_last_file_summary(last_file: &LastFile, output_dir: &Path) -> Result<PathBuf, LastWriteError> {
    let file_name = format!("last_{}_summary.txt", last_file.execution_id);
    let file_path = output_dir.join(file_name);
    
    info!("Writing LAST file summary to: {:?}", file_path);
    
    // Ensure output directory exists
    fs::create_dir_all(output_dir)?;
    
    // Get summary content
    let summary = last_file.summary.clone().unwrap_or_else(|| "No summary available".to_string());
    
    // Write to file
    fs::write(&file_path, summary)?;
    
    info!("Successfully wrote LAST file summary to: {:?}", file_path);
    Ok(file_path)
}

/// Writes a LAST file to a compressed Gzip file
pub fn write_compressed_last_file(last_file: &LastFile, output_dir: &Path) -> Result<PathBuf, LastWriteError> {
    let file_name = format!("last_{}.json.gz", last_file.execution_id);
    let file_path = output_dir.join(file_name);
    
    info!("Writing compressed LAST file to: {:?}", file_path);
    
    // Ensure output directory exists
    fs::create_dir_all(output_dir)?;
    
    // Serialize to JSON
    let json = serde_json::to_vec(last_file)?;
    
    // Create Gzip encoder
    let file = File::create(&file_path)?;
    let mut encoder = GzEncoder::new(file, Compression::default());
    
    // Write compressed data
    encoder.write_all(&json)?;
    encoder.finish()?;
    
    info!("Successfully wrote compressed LAST file to: {:?}", file_path);
    Ok(file_path)
}

/// Reads a LAST file from a compressed Gzip file
pub fn read_compressed_last_file(file_path: &Path) -> Result<LastFile, LastWriteError> {
    info!("Reading compressed LAST file from: {:?}", file_path);
    
    // Check if file exists
    if !file_path.exists() {
        return Err(LastWriteError::IoError(io::Error::new(
            io::ErrorKind::NotFound,
            format!("File not found: {:?}", file_path),
        )));
    }
    
    // Open file and create Gzip decoder
    let file = File::open(file_path)?;
    let mut decoder = GzDecoder::new(file);
    
    // Read decompressed data
    let mut json = Vec::new();
    decoder.read_to_end(&mut json)?;
    
    // Deserialize from JSON
    let last_file: LastFile = serde_json::from_slice(&json)?;
    
    info!("Successfully read compressed LAST file from: {:?}", file_path);
    Ok(last_file)
}

/// Creates a ZIP archive containing the LAST file and its artifacts
pub fn create_last_file_archive(last_file: &LastFile, output_dir: &Path) -> Result<PathBuf, LastWriteError> {
    let archive_name = format!("last_{}.zip", last_file.execution_id);
    let archive_path = output_dir.join(archive_name);
    
    info!("Creating LAST file archive: {:?}", archive_path);
    
    // Ensure output directory exists
    fs::create_dir_all(output_dir)?;
    
    // Create ZIP file
    let file = File::create(&archive_path)?;
    let mut zip = ZipWriter::new(file);
    
    let options = FileOptions::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o755);
    
    // Add LAST file JSON to archive
    let last_file_json = serde_json::to_string_pretty(last_file)?;
    zip.start_file(format!("last_{}.json", last_file.execution_id), options)?;
    zip.write_all(last_file_json.as_bytes())?;
    
    // Add artifacts to archive
    if let Some(artifacts) = &last_file.artifacts {
        for artifact in artifacts {
            let artifact_path = Path::new(&artifact.path);
            if artifact_path.exists() {
                // Use relative path within the archive
                let archive_entry_name = format!("artifacts/{}", artifact_path.file_name().unwrap_or_default().to_string_lossy());
                
                zip.start_file(&archive_entry_name, options)?;
                let mut artifact_file = File::open(artifact_path)?;
                io::copy(&mut artifact_file, &mut zip)?;
            } else {
                warn!("Artifact file not found, skipping: {:?}", artifact_path);
            }
        }
    }
    
    // Finish writing the archive
    zip.finish()?;
    
    info!("Successfully created LAST file archive: {:?}", archive_path);
    Ok(archive_path)
}

/// Exports the LAST file to an HTML report
pub fn export_last_file_to_html(last_file: &LastFile, output_dir: &Path) -> Result<PathBuf, LastWriteError> {
    let file_name = format!("last_{}_report.html", last_file.execution_id);
    let file_path = output_dir.join(file_name);
    
    info!("Exporting LAST file to HTML report: {:?}", file_path);
    
    // Ensure output directory exists
    fs::create_dir_all(output_dir)?;
    
    // Generate HTML content
    let html = generate_html_report(last_file);
    
    // Write to file
    fs::write(&file_path, html)?;
    
    info!("Successfully exported LAST file to HTML: {:?}", file_path);
    Ok(file_path)
}

/// Generates HTML content for the LAST file report
fn generate_html_report(last_file: &LastFile) -> String {
    let mut html = String::new();
    
    // HTML Header
    html.push_str("<!DOCTYPE html>\n");
    html.push_str("<html lang=\"en\">\n");
    html.push_str("<head>\n");
    html.push_str("  <meta charset=\"UTF-8\">\n");
    html.push_str("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
    html.push_str(&format!("  <title>ALT_LAS Execution Report - {}</title>\n", last_file.title));
    html.push_str("  <style>\n");
    html.push_str("    body { font-family: sans-serif; margin: 20px; }\n");
    html.push_str("    h1, h2, h3 { color: #333; }\n");
    html.push_str("    .summary { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }\n");
    html.push_str("    .task { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 5px; }\n");
    html.push_str("    .task-header { font-weight: bold; margin-bottom: 5px; }\n");
    html.push_str("    .status-completed { border-left: 5px solid green; }\n");
    html.push_str("    .status-failed { border-left: 5px solid red; }\n");
    html.push_str("    .status-timeout { border-left: 5px solid orange; }\n");
    html.push_str("    .status-cancelled { border-left: 5px solid gray; }\n");
    html.push_str("    .status-pending { border-left: 5px solid lightblue; }\n");
    html.push_str("    pre { background-color: #eee; padding: 10px; border-radius: 3px; white-space: pre-wrap; word-wrap: break-word; }\n");
    html.push_str("    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }\n");
    html.push_str("    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n");
    html.push_str("    th { background-color: #f2f2f2; }\n");
    html.push_str("  </style>\n");
    html.push_str("</head>\n");
    html.push_str("<body>\n");
    
    // Report Title
    html.push_str(&format!("<h1>ALT_LAS Execution Report: {}</h1>\n", last_file.title));
    
    // Summary Section
    html.push_str("<div class=\"summary\">\n");
    html.push_str("  <h2>Execution Summary</h2>\n");
    html.push_str(&format!("  <p><strong>Execution ID:</strong> {}</p>\n", last_file.execution_id));
    html.push_str(&format!("  <p><strong>ALT File ID:</strong> {}</p>\n", last_file.alt_file_id));
    html.push_str(&format!("  <p><strong>Status:</strong> {:?}</p>\n", last_file.status));
    html.push_str(&format!("  <p><strong>Success Rate:</strong> {:.2}%</p>\n", last_file.success_rate * 100.0));
    html.push_str(&format!("  <p><strong>Total Execution Time:</strong> {} ms</p>\n", last_file.execution_time_ms));
    html.push_str(&format!("  <p><strong>Mode:</strong> {:?}</p>\n", last_file.mode));
    if let Some(persona) = &last_file.persona {
        html.push_str(&format!("  <p><strong>Persona:</strong> {}</p>\n", persona));
    }
    if let Some(summary_text) = &last_file.summary {
        html.push_str("  <h3>Summary Text:</h3>\n");
        html.push_str(&format!("  <pre>{}</pre>\n", summary_text));
    }
    html.push_str("</div>\n");
    
    // Task Results Section
    html.push_str("<h2>Task Results</h2>\n");
    if last_file.task_results.is_empty() {
        html.push_str("<p>No task results available.</p>\n");
    } else {
        for (task_id, result) in &last_file.task_results {
            let status_class = match result.status {
                crate::task_manager::models::TaskStatus::Completed => "status-completed",
                crate::task_manager::models::TaskStatus::Failed => "status-failed",
                crate::task_manager::models::TaskStatus::Timeout => "status-timeout",
                crate::task_manager::models::TaskStatus::Cancelled => "status-cancelled",
                _ => "status-pending",
            };
            html.push_str(&format!("<div class=\"task {}\">\n", status_class));
            html.push_str(&format!("  <div class=\"task-header\">Task ID: {}</div>\n", task_id));
            html.push_str(&format!("  <p><strong>Status:</strong> {:?}</p>\n", result.status));
            if let Some(duration) = result.duration_ms {
                html.push_str(&format!("  <p><strong>Duration:</strong> {} ms</p>\n", duration));
            }
            if let Some(output) = &result.output {
                html.push_str("  <h3>Output:</h3>\n");
                html.push_str(&format!("  <pre>{}</pre>\n", serde_json::to_string_pretty(output).unwrap_or_default()));
            }
            if let Some(error) = &result.error {
                html.push_str("  <h3>Error:</h3>\n");
                html.push_str(&format!("  <pre>{}</pre>\n", error));
            }
            html.push_str("</div>\n");
        }
    }
    
    // Artifacts Section
    html.push_str("<h2>Artifacts</h2>\n");
    if let Some(artifacts) = &last_file.artifacts {
        if artifacts.is_empty() {
            html.push_str("<p>No artifacts generated.</p>\n");
        } else {
            html.push_str("<table>\n");
            html.push_str("  <thead>\n");
            html.push_str("    <tr><th>Name</th><th>Type</th><th>Task ID</th><th>Path</th><th>Size (Bytes)</th><th>MIME Type</th></tr>\n");
            html.push_str("  </thead>\n");
            html.push_str("  <tbody>\n");
            for artifact in artifacts {
                let size_str = artifact.size_bytes.map_or("N/A".to_string(), |s| s.to_string());
                let mime_str = artifact.mime_type.clone().unwrap_or_else(|| "N/A".to_string());
                // Make artifact path relative for display
                let display_path = Path::new(&artifact.path)
                    .file_name()
                    .map(|name| format!("artifacts/{}", name.to_string_lossy()))
                    .unwrap_or_else(|| artifact.path.clone());
                    
                html.push_str(&format!("    <tr><td>{}</td><td>{:?}</td><td>{}</td><td><a href=\"{}\">{}</a></td><td>{}</td><td>{}</td></tr>\n", 
                                    artifact.name, artifact.artifact_type, artifact.task_id, display_path, display_path, size_str, mime_str));
            }
            html.push_str("  </tbody>\n");
            html.push_str("</table>\n");
        }
    } else {
        html.push_str("<p>No artifacts generated.</p>\n");
    }
    
    // Metadata Section
    html.push_str("<h2>Metadata</h2>\n");
    if let Some(metadata) = &last_file.metadata {
        if metadata.is_empty() {
            html.push_str("<p>No metadata available.</p>\n");
        } else {
            html.push_str("<table>\n");
            html.push_str("  <thead>\n");
            html.push_str("    <tr><th>Key</th><th>Value</th></tr>\n");
            html.push_str("  </thead>\n");
            html.push_str("  <tbody>\n");
            for (key, value) in metadata {
                html.push_str(&format!("    <tr><td>{}</td><td><pre>{}</pre></td></tr>\n", 
                                    key, serde_json::to_string_pretty(value).unwrap_or_default()));
            }
            html.push_str("  </tbody>\n");
            html.push_str("</table>\n");
        }
    } else {
        html.push_str("<p>No metadata available.</p>\n");
    }
    
    // Execution Graph Section (if available)
    if let Some(_graph) = &last_file.execution_graph { // Changed to _graph as it's not used
        html.push_str("<h2>Execution Graph</h2>\n");
        // Try to embed SVG if generated - using a placeholder path since output_dir is not in scope
        let svg_filename = format!("{}_graph.svg", last_file.execution_id);
        html.push_str(&format!("<img src=\"{}\" alt=\"Execution Graph\" style=\"max-width: 100%;\">\n", svg_filename));
        html.push_str("<p>Graph visualization may be available in the artifacts directory.</p>\n");
    }
    
    // HTML Footer
    html.push_str("</body>\n");
    html.push_str("</html>\n");
    
    html
}

#[cfg(test)]
mod tests {
    use super::*;
    // use crate::last_file::models::{LastFile, LastFileStatus, TaskResult, TaskStatus, Artifact, ArtifactType}; // Removed unused imports
    use crate::last_file::models::{TaskResult, TaskStatus};
    use crate::alt_file::models::{AltMode, Priority};
    use tempfile::tempdir;
    use std::fs;
    use std::io::Read;
    // use chrono::Utc; // Removed unused Utc
    // use uuid::Uuid; // Removed unused Uuid

    fn create_test_last_file() -> LastFile {
        let mut last_file = LastFile::new(
            "test_alt_id".to_string(),
            "Test Title".to_string(),
            AltMode::Normal,
            Some("Test Persona".to_string()),
        );
        last_file.add_task_result("task1".to_string(), TaskResult {
            status: TaskStatus::Completed,
            output: Some(serde_json::json!({ "message": "Task 1 done" })),
            error: None,
            start_time: chrono::Utc::now(),
            end_time: Some(chrono::Utc::now()),
            duration_ms: Some(100),
        });
        last_file.add_task_result("task2".to_string(), TaskResult {
            status: TaskStatus::Failed,
            output: None,
            error: Some("Task 2 failed".to_string()),
            start_time: chrono::Utc::now(),
            end_time: Some(chrono::Utc::now()),
            duration_ms: Some(50),
        });
        last_file.calculate_success_rate();
        last_file.calculate_execution_time();
        last_file.generate_summary();
        last_file.set_priority(Priority::High);
        last_file
    }

    #[test]
    fn test_write_read_last_file() -> Result<(), LastWriteError> {
        let dir = tempdir()?;
        let last_file = create_test_last_file();
        
        let file_path = write_last_file(&last_file, dir.path())?;
        assert!(file_path.exists());
        
        let read_last_file_data = read_last_file(&file_path)?;
        assert_eq!(last_file.id, read_last_file_data.id);
        assert_eq!(last_file.title, read_last_file_data.title);
        assert_eq!(last_file.task_results.len(), read_last_file_data.task_results.len());
        
        dir.close()?;
        Ok(())
    }

    #[test]
    fn test_write_last_file_summary() -> Result<(), LastWriteError> {
        let dir = tempdir()?;
        let last_file = create_test_last_file();
        
        let file_path = write_last_file_summary(&last_file, dir.path())?;
        assert!(file_path.exists());
        
        let content = fs::read_to_string(file_path)?;
        assert!(content.contains("Execution Summary:"));
        assert!(content.contains("Test Title"));
        
        dir.close()?;
        Ok(())
    }

    #[test]
    fn test_write_read_compressed_last_file() -> Result<(), LastWriteError> {
        let dir = tempdir()?;
        let last_file = create_test_last_file();
        
        let file_path = write_compressed_last_file(&last_file, dir.path())?;
        assert!(file_path.exists());
        
        let read_last_file_data = read_compressed_last_file(&file_path)?;
        assert_eq!(last_file.id, read_last_file_data.id);
        assert_eq!(last_file.title, read_last_file_data.title);
        
        dir.close()?;
        Ok(())
    }

    #[test]
    fn test_create_last_file_archive() -> Result<(), LastWriteError> {
        let dir = tempdir()?;
        let mut last_file = create_test_last_file();
        
        // Create a dummy artifact file
        let artifact_dir = dir.path().join("artifacts");
        fs::create_dir_all(&artifact_dir)?;
        let artifact_path = artifact_dir.join("dummy_artifact.txt");
        fs::write(&artifact_path, "This is a dummy artifact.")?;
        
        let artifact = crate::last_file::models::create_artifact(
            "Dummy Artifact".to_string(),
            crate::last_file::models::ArtifactType::Text,
            "task1".to_string(),
            artifact_path.to_string_lossy().to_string(),
        );
        last_file.add_artifact(artifact);
        
        let archive_path = create_last_file_archive(&last_file, dir.path())?;
        assert!(archive_path.exists());
        
        // Basic check: open the zip and see if files exist
        let file = File::open(&archive_path)?;
        let mut archive = zip::ZipArchive::new(file)?;
        
        assert!(archive.by_name(&format!("last_{}.json", last_file.execution_id)).is_ok());
        assert!(archive.by_name("artifacts/dummy_artifact.txt").is_ok());
        
        dir.close()?;
        Ok(())
    }

    #[test]
    fn test_export_last_file_to_html() -> Result<(), LastWriteError> {
        let dir = tempdir()?;
        let last_file = create_test_last_file();
        
        let file_path = export_last_file_to_html(&last_file, dir.path())?;
        assert!(file_path.exists());
        
        let content = fs::read_to_string(file_path)?;
        assert!(content.contains("<h1>ALT_LAS Execution Report: Test Title</h1>"));
        assert!(content.contains("Task ID: task1"));
        assert!(content.contains("Task ID: task2"));
        
        dir.close()?;
        Ok(())
    }
}

