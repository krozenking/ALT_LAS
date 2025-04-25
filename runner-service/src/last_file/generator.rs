use std::collections::HashMap;
use log::{info, error};

use crate::alt_file::AltFile;
use crate::task_manager::models::TaskResult;
use super::models::{LastFile, LastFileStatus};

/// Generates a LAST file from an ALT file and task results
pub fn generate_last_file(
    alt_file: &AltFile,
    task_results: HashMap<String, TaskResult>,
) -> LastFile {
    info!("Generating LAST file for ALT file: {}", alt_file.id);
    
    // Create a new LAST file
    let mut last_file = LastFile::new(
        alt_file.id.clone(),
        alt_file.title.clone(),
        alt_file.mode.clone().unwrap_or_default(),
        alt_file.persona.clone(),
    );
    
    // Add task results
    last_file.add_task_results(task_results);
    
    // Calculate success rate and status
    last_file.calculate_success_rate();
    
    // Calculate execution time
    last_file.calculate_execution_time();
    
    // Generate summary
    last_file.generate_summary();
    
    // Add metadata from ALT file
    if let Some(alt_metadata) = &alt_file.metadata {
        for (key, value) in alt_metadata {
            last_file.add_metadata(&format!("alt_{}", key), value.clone());
        }
    }
    
    // Add additional metadata
    last_file.add_metadata("generated_at", serde_json::json!(chrono::Utc::now().to_rfc3339()));
    last_file.add_metadata("task_count", serde_json::json!(alt_file.tasks.len()));
    
    info!("LAST file generated with ID: {}", last_file.id);
    last_file
}

/// Generates a LAST file with failure status
pub fn generate_failure_last_file(
    alt_file: &AltFile,
    error_message: &str,
) -> LastFile {
    info!("Generating failure LAST file for ALT file: {}", alt_file.id);
    
    // Create a new LAST file
    let mut last_file = LastFile::new(
        alt_file.id.clone(),
        alt_file.title.clone(),
        alt_file.mode.clone().unwrap_or_default(),
        alt_file.persona.clone(),
    );
    
    // Set failure status
    last_file.status = LastFileStatus::Failure;
    last_file.success_rate = 0.0;
    
    // Add error metadata
    last_file.add_metadata("error", serde_json::json!(error_message));
    last_file.add_metadata("generated_at", serde_json::json!(chrono::Utc::now().to_rfc3339()));
    
    // Generate summary
    let summary = format!(
        "Execution Failed:\n\
        - ALT File: {}\n\
        - Execution ID: {}\n\
        - Error: {}",
        alt_file.title,
        last_file.execution_id,
        error_message
    );
    
    last_file.summary = Some(summary);
    
    info!("Failure LAST file generated with ID: {}", last_file.id);
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::{Task, AltMode};
    use crate::task_manager::models::{TaskStatus, TaskResult};
    use chrono::Utc;
    use uuid::Uuid;
    
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
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
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
            "output": "Task 1 completed successfully"
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
}
