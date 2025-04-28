use std::collections::HashMap;
use tokio::time::{timeout, Duration};
use log::{info, error, warn, debug};
use serde_json::json;
use chrono::Utc;

use super::models::{TaskExecution, TaskResult, TaskStatus};
use crate::ai_service::AiTaskProcessor;

/// Task executor for running individual tasks
#[derive(Clone)]
pub struct TaskExecutor {
    ai_processor: Option<AiTaskProcessor>,
}

impl TaskExecutor {
    /// Creates a new task executor
    pub fn new(ai_processor: Option<AiTaskProcessor>) -> Self {
        TaskExecutor {
            ai_processor,
        }
    }
    
    /// Executes a task with the given dependencies
    pub async fn execute_task(
        task: TaskExecution,
        dependency_results: HashMap<String, TaskResult>,
    ) -> TaskResult {
        info!("Executing task: {}", task.task_id);
        debug!("Task description: {}", task.description);
        
        let start_time = Utc::now();
        
        // Create a new task result
        let mut result = TaskResult::new(task.task_id.clone());
        
        // Check if all required dependencies are completed successfully
        for dep_id in &task.dependencies {
            if let Some(dep_result) = dependency_results.get(dep_id) {
                if dep_result.status != TaskStatus::Completed {
                    warn!("Dependency {} failed with status {:?}", dep_id, dep_result.status);
                    result.mark_failed(format!("Dependency {} failed with status {:?}", dep_id, dep_result.status));
                    return result;
                }
            } else {
                warn!("Dependency {} not found in results", dep_id);
                result.mark_failed(format!("Dependency {} not found in results", dep_id));
                return result;
            }
        }
        
        // Get timeout from task parameters or use default
        let timeout_seconds = task.parameters.as_ref()
            .and_then(|p| p.get("timeout_seconds"))
            .and_then(|t| t.as_u64())
            .unwrap_or(60);
        
        // Execute the task with timeout
        match timeout(
            Duration::from_secs(timeout_seconds),
            Self::process_task(task.clone(), dependency_results.clone()),
        ).await {
            Ok(task_result) => {
                // Task completed within timeout
                let end_time = Utc::now();
                let duration = end_time.signed_duration_since(start_time).num_milliseconds() as u64;
                
                result.duration_ms = Some(duration);
                
                match task_result {
                    Ok((status, output, error)) => {
                        result.status = status;
                        result.output = output;
                        result.error = error;
                    },
                    Err(err) => {
                        error!("Task execution failed: {}", err);
                        result.mark_failed(format!("Task execution failed: {}", err));
                    }
                }
            },
            Err(_) => {
                // Task timed out
                warn!("Task execution timed out after {} seconds", timeout_seconds);
                let error_msg = format!("Task execution timed out after {} seconds", timeout_seconds);
                result.mark_timeout(error_msg);
            }
        }
        
        info!("Task {} completed with status: {:?}", task.task_id, result.status);
        result
    }
    
    /// Processes a task and returns the result
    async fn process_task(
        task: TaskExecution,
        dependency_results: HashMap<String, TaskResult>,
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        // Get task type from parameters
        let task_type = task.parameters.as_ref()
            .and_then(|p| p.get("task_type"))
            .and_then(|t| t.as_str())
            .unwrap_or("generic");
        
        match task_type {
            "ai_prompt" => {
                Self::process_ai_prompt_task(task, dependency_results).await
            },
            "file_operation" => {
                Self::process_file_operation_task(task, dependency_results).await
            },
            "data_processing" => {
                Self::process_data_processing_task(task, dependency_results).await
            },
            "system_command" => {
                Self::process_system_command_task(task, dependency_results).await
            },
            _ => {
                // Generic task processing
                Self::process_generic_task(task, dependency_results).await
            }
        }
    }
    
    /// Processes an AI prompt task
    async fn process_ai_prompt_task(
        task: TaskExecution,
        _dependency_results: HashMap<String, TaskResult>, // Mark as unused
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        info!("Processing AI prompt task: {}", task.task_id);
        
        // Create AI processor if not provided (or use self.ai_processor if available)
        // For now, creating a new one as self.ai_processor is Option<AiTaskProcessor>
        // and might not be initialized. A better approach might be needed.
        let ai_processor = AiTaskProcessor::new(
            "http://ai-orchestrator:8000".to_string(),
            60,
            4, // Add concurrency limit parameter
        );
        
        // Send task execution to AI service
        match ai_processor.process_task(&task).await { // Pass the whole task execution
            Ok(response) => {
                // Create output with AI response
                let output = json!({
                    "text": response.get("text").and_then(|t| t.as_str()).unwrap_or(""),
                    "model_used": response.get("model_used").and_then(|m| m.as_str()).unwrap_or("unknown"),
                    "tokens_used": response.get("tokens_used").and_then(|t| t.as_u64()).unwrap_or(0),
                    "processing_time_ms": response.get("processing_time_ms").and_then(|t| t.as_u64()).unwrap_or(0),
                });
                
                Ok((TaskStatus::Completed, Some(output), None))
            },
            Err(err) => {
                error!("AI task processing failed: {}", err);
                Err(format!("AI task processing failed: {}", err))
            }
        }
    }
    
    /// Processes a file operation task
    async fn process_file_operation_task(
        task: TaskExecution,
        _dependency_results: HashMap<String, TaskResult>, // Mark as unused
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        info!("Processing file operation task: {}", task.task_id);
        
        // Get operation type from parameters
        let operation = task.parameters.as_ref()
            .and_then(|p| p.get("operation"))
            .and_then(|o| o.as_str())
            .ok_or_else(|| "No operation specified in task parameters".to_string())?;
        
        // Get file path from parameters
        let file_path = task.parameters.as_ref()
            .and_then(|p| p.get("file_path"))
            .and_then(|p| p.as_str())
            .ok_or_else(|| "No file_path specified in task parameters".to_string())?;
        
        match operation {
            "read" => {
                // Read file content
                match tokio::fs::read_to_string(file_path).await {
                    Ok(content) => {
                        let output = json!({
                            "content": content,
                            "file_path": file_path,
                            "operation": "read",
                        });
                        
                        Ok((TaskStatus::Completed, Some(output), None))
                    },
                    Err(err) => {
                        error!("Failed to read file {}: {}", file_path, err);
                        Err(format!("Failed to read file {}: {}", file_path, err))
                    }
                }
            },
            "write" => {
                // Get content from parameters
                let content = task.parameters.as_ref()
                    .and_then(|p| p.get("content"))
                    .and_then(|c| c.as_str())
                    .ok_or_else(|| "No content specified for write operation".to_string())?;
                
                // Create directory if it doesn't exist
                if let Some(parent) = std::path::Path::new(file_path).parent() {
                    if !parent.exists() {
                        if let Err(err) = tokio::fs::create_dir_all(parent).await {
                            error!("Failed to create directory {}: {}", parent.display(), err);
                            return Err(format!("Failed to create directory {}: {}", parent.display(), err));
                        }
                    }
                }
                
                // Write content to file
                match tokio::fs::write(file_path, content).await {
                    Ok(_) => {
                        let output = json!({
                            "file_path": file_path,
                            "operation": "write",
                            "bytes_written": content.len(),
                        });
                        
                        Ok((TaskStatus::Completed, Some(output), None))
                    },
                    Err(err) => {
                        error!("Failed to write to file {}: {}", file_path, err);
                        Err(format!("Failed to write to file {}: {}", file_path, err))
                    }
                }
            },
            "append" => {
                // Get content from parameters
                let content = task.parameters.as_ref()
                    .and_then(|p| p.get("content"))
                    .and_then(|c| c.as_str())
                    .ok_or_else(|| "No content specified for append operation".to_string())?;
                
                // Create directory if it doesn't exist
                if let Some(parent) = std::path::Path::new(file_path).parent() {
                    if !parent.exists() {
                        if let Err(err) = tokio::fs::create_dir_all(parent).await {
                            error!("Failed to create directory {}: {}", parent.display(), err);
                            return Err(format!("Failed to create directory {}: {}", parent.display(), err));
                        }
                    }
                }
                
                // Append content to file
                let mut file = match tokio::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(file_path)
                    .await {
                    Ok(file) => file,
                    Err(err) => {
                        error!("Failed to open file for append {}: {}", file_path, err);
                        return Err(format!("Failed to open file for append {}: {}", file_path, err));
                    }
                };
                
                match tokio::io::AsyncWriteExt::write_all(&mut file, content.as_bytes()).await {
                    Ok(_) => {
                        let output = json!({
                            "file_path": file_path,
                            "operation": "append",
                            "bytes_written": content.len(),
                        });
                        
                        Ok((TaskStatus::Completed, Some(output), None))
                    },
                    Err(err) => {
                        error!("Failed to append to file {}: {}", file_path, err);
                        Err(format!("Failed to append to file {}: {}", file_path, err))
                    }
                }
            },
            "delete" => {
                // Delete file
                match tokio::fs::remove_file(file_path).await {
                    Ok(_) => {
                        let output = json!({
                            "file_path": file_path,
                            "operation": "delete",
                        });
                        
                        Ok((TaskStatus::Completed, Some(output), None))
                    },
                    Err(err) => {
                        error!("Failed to delete file {}: {}", file_path, err);
                        Err(format!("Failed to delete file {}: {}", file_path, err))
                    }
                }
            },
            _ => {
                error!("Unknown file operation: {}", operation);
                Err(format!("Unknown file operation: {}", operation))
            }
        }
    }
    
    /// Processes a data processing task
    async fn process_data_processing_task(
        task: TaskExecution,
        dependency_results: HashMap<String, TaskResult>,
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        info!("Processing data processing task: {}", task.task_id);
        
        // Get operation type from parameters
        let operation = task.parameters.as_ref()
            .and_then(|p| p.get("operation"))
            .and_then(|o| o.as_str())
            .ok_or_else(|| "No operation specified in task parameters".to_string())?;
        
        // Get input data from parameters or dependency results
        let input_data = if let Some(data) = task.parameters.as_ref().and_then(|p| p.get("input_data")) {
            data.clone()
        } else if let Some(dep_id) = task.parameters.as_ref().and_then(|p| p.get("input_from_dependency")).and_then(|d| d.as_str()) {
            // Get data from dependency result
            if let Some(dep_result) = dependency_results.get(dep_id) {
                if let Some(output) = &dep_result.output {
                    output.clone()
                } else {
                    return Err(format!("Dependency {} has no output data", dep_id));
                }
            } else {
                return Err(format!("Dependency {} not found in results", dep_id));
            }
        } else {
            return Err("No input data or input_from_dependency specified in task parameters".to_string());
        };
        
        match operation {
            "filter" => {
                // Get filter criteria from parameters
                let filter_key = task.parameters.as_ref()
                    .and_then(|p| p.get("filter_key"))
                    .and_then(|k| k.as_str())
                    .ok_or_else(|| "No filter_key specified for filter operation".to_string())?;
                
                let filter_value = task.parameters.as_ref()
                    .and_then(|p| p.get("filter_value"))
                    .ok_or_else(|| "No filter_value specified for filter operation".to_string())?;
                
                // Filter data
                if let Some(items) = input_data.as_array() {
                    let filtered: Vec<_> = items.iter()
                        .filter(|item| {
                            if let Some(obj) = item.as_object() {
                                if let Some(value) = obj.get(filter_key) {
                                    return value == filter_value;
                                }
                            }
                            false
                        })
                        .cloned()
                        .collect();
                    
                    let output = json!({
                        "operation": "filter",
                        "filter_key": filter_key,
                        "filter_value": filter_value,
                        "result_count": filtered.len(),
                        "filtered_data": filtered,
                    });
                    
                    Ok((TaskStatus::Completed, Some(output), None))
                } else {
                    Err("Input data is not an array".to_string())
                }
            },
            "map" => {
                // Get mapping logic from parameters (e.g., add a field, transform a field)
                // This is a placeholder - actual implementation would depend on specific mapping needs
                warn!("Map operation not fully implemented yet");
                let output = json!({
                    "operation": "map",
                    "message": "Map operation executed (placeholder)",
                    "processed_data": input_data, // Return input data for now
                });
                Ok((TaskStatus::Completed, Some(output), None))
            },
            "reduce" => {
                // Get reduction logic from parameters (e.g., sum, count, average)
                // This is a placeholder - actual implementation would depend on specific reduction needs
                warn!("Reduce operation not fully implemented yet");
                let output = json!({
                    "operation": "reduce",
                    "message": "Reduce operation executed (placeholder)",
                    "result": null, // Placeholder result
                });
                Ok((TaskStatus::Completed, Some(output), None))
            },
            _ => {
                error!("Unknown data processing operation: {}", operation);
                Err(format!("Unknown data processing operation: {}", operation))
            }
        }
    }
    
    /// Processes a system command task
    async fn process_system_command_task(
        task: TaskExecution,
        _dependency_results: HashMap<String, TaskResult>, // Mark as unused
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        info!("Processing system command task: {}", task.task_id);
        
        // Get command from parameters
        let command = task.parameters.as_ref()
            .and_then(|p| p.get("command"))
            .and_then(|c| c.as_str())
            .ok_or_else(|| "No command specified in task parameters".to_string())?;
        
        // Get arguments from parameters
        let args: Vec<String> = task.parameters.as_ref()
            .and_then(|p| p.get("args"))
            .and_then(|a| a.as_array())
            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
            .unwrap_or_else(Vec::new);
        
        // Execute command
        match tokio::process::Command::new(command)
            .args(&args)
            .output()
            .await {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                
                if output.status.success() {
                    let result_output = json!({
                        "command": command,
                        "args": args,
                        "exit_code": output.status.code(),
                        "stdout": stdout,
                        "stderr": stderr,
                    });
                    Ok((TaskStatus::Completed, Some(result_output), None))
                } else {
                    error!("System command failed: {} {:?}. Stderr: {}", command, args, stderr);
                    Err(format!("System command failed with exit code {:?}. Stderr: {}", output.status.code(), stderr))
                }
            },
            Err(err) => {
                error!("Failed to execute system command {}: {}", command, err);
                Err(format!("Failed to execute system command {}: {}", command, err))
            }
        }
    }
    
    /// Processes a generic task (placeholder)
    async fn process_generic_task(
        task: TaskExecution,
        _dependency_results: HashMap<String, TaskResult>, // Mark as unused
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        info!("Processing generic task: {}", task.task_id);
        // Placeholder implementation for generic tasks
        // You can add logic here based on task parameters or description
        
        let output = json!({
            "message": format!("Generic task {} executed successfully.", task.task_id),
            "parameters": task.parameters,
        });
        
        // Simulate some work
        tokio::time::sleep(Duration::from_millis(100)).await;
        
        Ok((TaskStatus::Completed, Some(output), None))
    }
}

