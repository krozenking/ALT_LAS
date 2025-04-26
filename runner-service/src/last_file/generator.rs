use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::fs;
use std::io::{self, Write};
use log::{info, error, debug, warn};
use serde_json;
use chrono::Utc;

use crate::alt_file::models::{AltFile, AltMode};
use crate::task_manager::models::{TaskResult, TaskStatus};
use super::models::{LastFile, LastFileStatus, Artifact, ArtifactType, create_artifact};

/// Generates a LAST file from an ALT file and task results
pub fn generate_last_file(alt_file: &AltFile, task_results: HashMap<String, TaskResult>) -> LastFile {
    info!("Generating LAST file for ALT file: {}", alt_file.id);
    
    // Create LAST file
    let mut last_file = LastFile::new(
        alt_file.id.clone(),
        alt_file.title.clone(),
        alt_file.mode.clone().unwrap_or(AltMode::Normal),
        alt_file.persona.clone(),
    );
    
    // Add task results
    last_file.add_task_results(task_results);
    
    // Calculate success rate and update status
    last_file.calculate_success_rate();
    
    // Calculate execution time
    last_file.calculate_execution_time();
    
    // Add metadata from ALT file
    if let Some(alt_metadata) = &alt_file.metadata {
        for (key, value) in alt_metadata {
            last_file.add_metadata(&format!("alt_{}", key), value.clone());
        }
    }
    
    // Add timestamp metadata
    last_file.add_metadata("generated_at", serde_json::json!(Utc::now().to_rfc3339()));
    
    // Add tags from ALT file if available
    if let Some(tags) = &alt_file.tags {
        for tag in tags {
            last_file.add_tag(tag);
        }
    }
    
    // Set priority from ALT file if available
    if let Some(priority) = &alt_file.priority {
        last_file.set_priority(priority.clone());
    }
    
    // Create execution graph
    last_file.create_execution_graph();
    
    // Generate summary
    last_file.generate_summary();
    
    info!("LAST file generated successfully: {}", last_file.id);
    debug!("LAST file status: {:?}, success rate: {:.2}%", last_file.status, last_file.success_rate * 100.0);
    
    last_file
}

/// Generates a failure LAST file for an ALT file
pub fn generate_failure_last_file(alt_file: &AltFile, error_message: &str) -> LastFile {
    info!("Generating failure LAST file for ALT file: {}", alt_file.id);
    
    // Create LAST file
    let mut last_file = LastFile::new(
        alt_file.id.clone(),
        alt_file.title.clone(),
        alt_file.mode.clone().unwrap_or(AltMode::Normal),
        alt_file.persona.clone(),
    );
    
    // Set failure status
    last_file.status = LastFileStatus::Failure;
    last_file.success_rate = 0.0;
    
    // Add error metadata
    last_file.add_metadata("error", serde_json::json!(error_message));
    last_file.add_metadata("generated_at", serde_json::json!(Utc::now().to_rfc3339()));
    
    // Generate summary with error message
    let summary = format!(
        "Execution Failed:\n\
        - ALT File: {}\n\
        - Execution ID: {}\n\
        - Error: {}\n\
        - Time: {}",
        alt_file.title,
        last_file.execution_id,
        error_message,
        Utc::now().to_rfc3339()
    );
    last_file.summary = Some(summary);
    
    info!("Failure LAST file generated: {}", last_file.id);
    
    last_file
}

/// Enhances a LAST file with AI-generated content
pub async fn enhance_last_file_with_ai(
    mut last_file: LastFile,
    ai_client: &crate::ai_service::AiServiceClient,
) -> Result<LastFile, String> {
    info!("Enhancing LAST file with AI: {}", last_file.id);
    
    // Create a prompt for the AI
    let prompt = format!(
        "Analyze the following execution results and provide insights:\n{}",
        last_file.summary.clone().unwrap_or_default()
    );
    
    // Create parameters for the AI request
    let mut params = HashMap::new();
    params.insert("prompt".to_string(), serde_json::json!(prompt));
    params.insert("operation".to_string(), serde_json::json!("analyze"));
    
    // Send request to AI service
    match ai_client.send_request(
        &last_file.id,
        &prompt,
        Some(match last_file.mode {
            crate::alt_file::models::AltMode::Normal => "Normal",
            crate::alt_file::models::AltMode::Dream => "Dream",
            crate::alt_file::models::AltMode::Explore => "Explore",
            crate::alt_file::models::AltMode::Chaos => "Chaos",
        }),
        last_file.persona.as_deref(),
        Some(params),
    ).await {
        Ok(response) => {
            // Extract insights from AI response
            if let Some(insights) = response.get("text").and_then(|v| v.as_str()) {
                // Add insights to LAST file
                last_file.add_metadata("ai_insights", serde_json::json!(insights));
                
                // Append insights to summary
                if let Some(summary) = &mut last_file.summary {
                    summary.push_str("\n\nAI Insights:\n");
                    summary.push_str(insights);
                }
                
                // Create an artifact for the AI insights
                let artifact_path = format!("/tmp/artifacts/{}_ai_insights.txt", last_file.id);
                let artifact = create_artifact(
                    "AI Insights".to_string(),
                    ArtifactType::Text,
                    "ai_analysis".to_string(),
                    artifact_path.clone()
                );
                
                // Add the artifact to the LAST file
                last_file.add_artifact(artifact);
                
                // Try to save the insights to the artifact path
                if let Some(dir) = Path::new(&artifact_path).parent() {
                    if !dir.exists() {
                        if let Err(e) = fs::create_dir_all(dir) {
                            warn!("Failed to create artifact directory: {}", e);
                        }
                    }
                }
                
                if let Err(e) = fs::write(&artifact_path, insights) {
                    warn!("Failed to write AI insights to artifact file: {}", e);
                }
            }
            
            Ok(last_file)
        },
        Err(err) => {
            error!("Failed to enhance LAST file with AI: {}", err);
            // Return the original LAST file without AI enhancements
            Ok(last_file)
        }
    }
}

/// Extracts artifacts from task results and adds them to the LAST file
pub fn extract_artifacts_from_results(mut last_file: LastFile, output_dir: &Path) -> LastFile {
    info!("Extracting artifacts from task results for LAST file: {}", last_file.id);
    
    // Create artifacts directory if it doesn't exist
    let artifacts_dir = output_dir.join("artifacts").join(&last_file.id);
    if !artifacts_dir.exists() {
        if let Err(e) = fs::create_dir_all(&artifacts_dir) {
            warn!("Failed to create artifacts directory: {}", e);
            return last_file;
        }
    }
    
    // Process each task result
    for (task_id, result) in &last_file.task_results {
        // Extract output artifacts if available
        if let Some(output) = &result.output {
            // Check if output contains file paths
            if let Some(files) = output.get("files").and_then(|f| f.as_array()) {
                for (i, file) in files.iter().enumerate() {
                    if let Some(file_path) = file.as_str() {
                        // Determine artifact type based on file extension
                        let path = Path::new(file_path);
                        let artifact_type = match path.extension().and_then(|e| e.to_str()) {
                            Some("jpg") | Some("jpeg") | Some("png") | Some("gif") | Some("webp") => ArtifactType::Image,
                            Some("json") => ArtifactType::Json,
                            Some("txt") | Some("md") | Some("html") | Some("css") | Some("js") => ArtifactType::Text,
                            _ => ArtifactType::File,
                        };
                        
                        // Create artifact name from filename or index
                        let name = path.file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or(&format!("artifact_{}", i))
                            .to_string();
                        
                        // Copy file to artifacts directory if it exists
                        if Path::new(file_path).exists() {
                            let dest_path = artifacts_dir.join(&name);
                            if let Err(e) = fs::copy(file_path, &dest_path) {
                                warn!("Failed to copy artifact file: {}", e);
                                continue;
                            }
                            
                            // Get file size
                            let size = match fs::metadata(file_path) {
                                Ok(metadata) => Some(metadata.len()),
                                Err(_) => None,
                            };
                            
                            // Create and add artifact
                            let mut artifact = create_artifact(
                                name,
                                artifact_type,
                                task_id.clone(),
                                dest_path.to_string_lossy().to_string()
                            );
                            
                            artifact.size_bytes = size;
                            
                            // Add MIME type based on extension
                            artifact.mime_type = match path.extension().and_then(|e| e.to_str()) {
                                Some("jpg") | Some("jpeg") => Some("image/jpeg".to_string()),
                                Some("png") => Some("image/png".to_string()),
                                Some("gif") => Some("image/gif".to_string()),
                                Some("webp") => Some("image/webp".to_string()),
                                Some("json") => Some("application/json".to_string()),
                                Some("txt") => Some("text/plain".to_string()),
                                Some("md") => Some("text/markdown".to_string()),
                                Some("html") => Some("text/html".to_string()),
                                Some("css") => Some("text/css".to_string()),
                                Some("js") => Some("application/javascript".to_string()),
                                _ => Some("application/octet-stream".to_string()),
                            };
                            
                            last_file.add_artifact(artifact);
                        }
                    }
                }
            }
            
            // Check if output contains text content to save as artifact
            if let Some(text) = output.get("text").and_then(|t| t.as_str()) {
                if !text.is_empty() {
                    // Save text content as artifact
                    let artifact_name = format!("{}_output.txt", task_id);
                    let artifact_path = artifacts_dir.join(&artifact_name);
                    
                    if let Err(e) = fs::write(&artifact_path, text) {
                        warn!("Failed to write text artifact: {}", e);
                    } else {
                        // Get file size
                        let size = match fs::metadata(&artifact_path) {
                            Ok(metadata) => Some(metadata.len()),
                            Err(_) => None,
                        };
                        
                        // Create and add artifact
                        let mut artifact = create_artifact(
                            artifact_name,
                            ArtifactType::Text,
                            task_id.clone(),
                            artifact_path.to_string_lossy().to_string()
                        );
                        
                        artifact.size_bytes = size;
                        artifact.mime_type = Some("text/plain".to_string());
                        
                        last_file.add_artifact(artifact);
                    }
                }
            }
        }
    }
    
    // Update summary with artifact count
    last_file.generate_summary();
    
    info!("Extracted {} artifacts for LAST file", 
          last_file.artifacts.as_ref().map_or(0, |a| a.len()));
    
    last_file
}

/// Generates a visualization of the execution graph
pub fn generate_execution_graph_visualization(last_file: &LastFile, output_dir: &Path) -> Option<PathBuf> {
    info!("Generating execution graph visualization for LAST file: {}", last_file.id);
    
    if last_file.execution_graph.is_none() {
        warn!("No execution graph available for visualization");
        return None;
    }
    
    let graph = last_file.execution_graph.as_ref().unwrap();
    
    // Create DOT format for GraphViz
    let mut dot = String::from("digraph execution {\n");
    dot.push_str("  rankdir=LR;\n");
    dot.push_str("  node [shape=box, style=filled];\n\n");
    
    // Add nodes
    for node in &graph.nodes {
        let color = match node.status {
            TaskStatus::Completed => "green",
            TaskStatus::Failed => "red",
            TaskStatus::Timeout => "orange",
            TaskStatus::Cancelled => "gray",
            _ => "lightblue",
        };
        
        let duration = node.duration_ms.map_or("N/A".to_string(), |d| format!("{}ms", d));
        
        dot.push_str(&format!(
            "  \"{}\" [label=\"{}\nStatus: {:?}\nDuration: {}\", fillcolor={}];\n",
            node.id, node.task_id, node.status, duration, color
        ));
    }
    
    dot.push_str("\n");
    
    // Add edges
    for edge in &graph.edges {
        let style = match edge.dependency_type {
            super::models::DependencyType::Required => "solid",
            super::models::DependencyType::Optional => "dashed",
            super::models::DependencyType::Conditional => "dotted",
        };
        
        dot.push_str(&format!(
            "  \"{}\" -> \"{}\" [style={}];\n",
            edge.source, edge.target, style
        ));
    }
    
    dot.push_str("}\n");
    
    // Create output directory if it doesn't exist
    if !output_dir.exists() {
        if let Err(e) = fs::create_dir_all(output_dir) {
            error!("Failed to create output directory: {}", e);
            return None;
        }
    }
    
    // Write DOT file
    let dot_path = output_dir.join(format!("{}_graph.dot", last_file.id));
    if let Err(e) = fs::write(&dot_path, &dot) {
        error!("Failed to write DOT file: {}", e);
        return None;
    }
    
    // Try to generate SVG using GraphViz if available
    let svg_path = output_dir.join(format!("{}_graph.svg", last_file.id));
    let result = std::process::Command::new("dot")
        .args(["-Tsvg", "-o", svg_path.to_str().unwrap_or("")])
        .arg(dot_path.to_str().unwrap_or(""))
        .output();
    
    match result {
        Ok(output) => {
            if output.status.success() {
                info!("Generated execution graph visualization: {:?}", svg_path);
                Some(svg_path)
            } else {
                warn!("GraphViz command failed: {}", String::from_utf8_lossy(&output.stderr));
                None
            }
        },
        Err(e) => {
            warn!("Failed to run GraphViz: {}. Is it installed?", e);
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::{Task, AltMode};
    use crate::task_manager::models::{TaskStatus, TaskResult};
    use chrono::Utc;
    use uuid::Uuid;
    use tempfile::TempDir;
    
    fn create_test_alt_file() -> AltFile {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        alt_file.mode = Some(AltMode::Normal);
        
        let task1 = Task {
            id: "task1".to_string(),
            description: "First task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        
        alt_file
    }
    
    fn create_test_task_results() -> HashMap<String, TaskResult> {
        let mut results = HashMap::new();
        
        // Create successful task result
        let mut result1 = TaskResult::new("task1".to_string());
        result1.mark_running();
        result1.mark_completed(serde_json::json!({
            "output": "Task 1 completed successfully",
            "text": "This is the output text from task 1"
        }));
        
        // Create failed task result
        let mut result2 = TaskResult::new("task2".to_string());
        result2.mark_running();
        result2.mark_failed("Task 2 failed".to_string());
        
        results.insert("task1".to_string(), result1);
        results.insert("task2".to_string(), result2);
        
        results
    }
    
    #[test]
    fn test_generate_last_file() {
        let alt_file = create_test_alt_file();
        let task_results = create_test_task_results();
        
        let last_file = generate_last_file(&alt_file, task_results);
        
        assert_eq!(last_file.alt_file_id, alt_file.id);
        assert_eq!(last_file.alt_file_title, "Test ALT File");
        assert_eq!(last_file.status, LastFileStatus::PartialSuccess);
        assert_eq!(last_file.task_results.len(), 2);
        assert!(last_file.success_rate > 0.0 && last_file.success_rate < 1.0);
        assert!(last_file.execution_time_ms > 0);
        assert!(last_file.summary.is_some());
        assert!(last_file.execution_graph.is_some());
    }
    
    #[test]
    fn test_generate_failure_last_file() {
        let alt_file = create_test_alt_file();
        let error_message = "Failed to process ALT file";
        
        let last_file = generate_failure_last_file(&alt_file, error_message);
        
        assert_eq!(last_file.alt_file_id, alt_file.id);
        assert_eq!(last_file.status, LastFileStatus::Failure);
        assert_eq!(last_file.success_rate, 0.0);
        assert!(last_file.summary.is_some());
        assert!(last_file.summary.unwrap().contains(error_message));
    }
    
    #[test]
    fn test_extract_artifacts_from_results() {
        let alt_file = create_test_alt_file();
        let mut task_results = create_test_task_results();
        
        // Add a file path to the task result
        let temp_dir = TempDir::new().unwrap();
        let test_file_path = temp_dir.path().join("test_file.txt");
        fs::write(&test_file_path, "Test file content").unwrap();
        
        if let Some(result) = task_results.get_mut("task1") {
            if let Some(output) = result.output.as_mut() {
                let files = vec![test_file_path.to_string_lossy().to_string()];
                output["files"] = serde_json::json!(files);
            }
        }
        
        let last_file = generate_last_file(&alt_file, task_results);
        let output_dir = temp_dir.path();
        
        let enhanced_last_file = extract_artifacts_from_results(last_file, output_dir);
        
        // Check that artifacts were extracted
        assert!(enhanced_last_file.artifacts.is_some());
        assert!(enhanced_last_file.artifacts.as_ref().unwrap().len() > 0);
    }
}
