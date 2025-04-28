use std::collections::HashMap;
use tokio::time::{timeout, Duration};
use log::{info, error, warn, debug};
use serde_json::json;
use chrono::Utc;

use super::models::{TaskExecution, TaskResult, TaskStatus};
use crate::ai_service::AiTaskProcessor;

/// Task executor for running individual tasks
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
                result.mark_timeout(format!("Task execution timed out after {} seconds", timeout_seconds));
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
        dependency_results: HashMap<String, TaskResult>,
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        info!("Processing AI prompt task: {}", task.task_id);
        
        // Get prompt from parameters
        let prompt = task.parameters.as_ref()
            .and_then(|p| p.get("prompt"))
            .and_then(|p| p.as_str())
            .ok_or_else(|| "No prompt found in task parameters".to_string())?;
        
        // Get mode and persona from parameters
        let mode = task.parameters.as_ref()
            .and_then(|p| p.get("mode"))
            .and_then(|m| m.as_str());
        
        let persona = task.parameters.as_ref()
            .and_then(|p| p.get("persona"))
            .and_then(|p| p.as_str());
        
        // Create AI processor if not provided
        let ai_processor = AiTaskProcessor::new(
            "http://ai-orchestrator:8000".to_string(),
            60,
        );
        
        // Send prompt to AI service
        match ai_processor.process_task(
            &task.task_id,
            prompt,
            mode,
            persona,
            task.parameters.clone(),
        ).await {
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
        dependency_results: HashMap<String, TaskResult>,
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
                        "input_count": items.len(),
                        "output_count": filtered.len(),
                        "result": filtered,
                    });
                    
                    Ok((TaskStatus::Completed, Some(output), None))
                } else {
                    Err("Input data is not an array".to_string())
                }
            },
            "transform" => {
                // Get transform function from parameters
                let transform_type = task.parameters.as_ref()
                    .and_then(|p| p.get("transform_type"))
                    .and_then(|t| t.as_str())
                    .ok_or_else(|| "No transform_type specified for transform operation".to_string())?;
                
                match transform_type {
                    "map" => {
                        // Get map key from parameters
                        let map_key = task.parameters.as_ref()
                            .and_then(|p| p.get("map_key"))
                            .and_then(|k| k.as_str())
                            .ok_or_else(|| "No map_key specified for map transform".to_string())?;
                        
                        // Map data
                        if let Some(items) = input_data.as_array() {
                            let mapped: Vec<_> = items.iter()
                                .filter_map(|item| {
                                    if let Some(obj) = item.as_object() {
                                        obj.get(map_key).cloned()
                                    } else {
                                        None
                                    }
                                })
                                .collect();
                            
                            let output = json!({
                                "operation": "transform",
                                "transform_type": "map",
                                "map_key": map_key,
                                "input_count": items.len(),
                                "output_count": mapped.len(),
                                "result": mapped,
                            });
                            
                            Ok((TaskStatus::Completed, Some(output), None))
                        } else {
                            Err("Input data is not an array".to_string())
                        }
                    },
                    "aggregate" => {
                        // Get aggregate function from parameters
                        let aggregate_function = task.parameters.as_ref()
                            .and_then(|p| p.get("aggregate_function"))
                            .and_then(|f| f.as_str())
                            .ok_or_else(|| "No aggregate_function specified for aggregate transform".to_string())?;
                        
                        // Get aggregate key from parameters
                        let aggregate_key = task.parameters.as_ref()
                            .and_then(|p| p.get("aggregate_key"))
                            .and_then(|k| k.as_str())
                            .ok_or_else(|| "No aggregate_key specified for aggregate transform".to_string())?;
                        
                        // Aggregate data
                        if let Some(items) = input_data.as_array() {
                            match aggregate_function {
                                "sum" => {
                                    let sum: f64 = items.iter()
                                        .filter_map(|item| {
                                            if let Some(obj) = item.as_object() {
                                                if let Some(value) = obj.get(aggregate_key) {
                                                    value.as_f64()
                                                } else {
                                                    None
                                                }
                                            } else {
                                                None
                                            }
                                        })
                                        .sum();
                                    
                                    let output = json!({
                                        "operation": "transform",
                                        "transform_type": "aggregate",
                                        "aggregate_function": "sum",
                                        "aggregate_key": aggregate_key,
                                        "input_count": items.len(),
                                        "result": sum,
                                    });
                                    
                                    Ok((TaskStatus::Completed, Some(output), None))
                                },
                                "average" => {
                                    let values: Vec<f64> = items.iter()
                                        .filter_map(|item| {
                                            if let Some(obj) = item.as_object() {
                                                if let Some(value) = obj.get(aggregate_key) {
                                                    value.as_f64()
                                                } else {
                                                    None
                                                }
                                            } else {
                                                None
                                            }
                                        })
                                        .collect();
                                    
                                    let average = if !values.is_empty() {
                                        values.iter().sum::<f64>() / values.len() as f64
                                    } else {
                                        0.0
                                    };
                                    
                                    let output = json!({
                                        "operation": "transform",
                                        "transform_type": "aggregate",
                                        "aggregate_function": "average",
                                        "aggregate_key": aggregate_key,
                                        "input_count": items.len(),
                                        "values_count": values.len(),
                                        "result": average,
                                    });
                                    
                                    Ok((TaskStatus::Completed, Some(output), None))
                                },
                                "count" => {
                                    let count = items.len();
                                    
                                    let output = json!({
                                        "operation": "transform",
                                        "transform_type": "aggregate",
                                        "aggregate_function": "count",
                                        "input_count": items.len(),
                                        "result": count,
                                    });
                                    
                                    Ok((TaskStatus::Completed, Some(output), None))
                                },
                                _ => {
                                    Err(format!("Unknown aggregate function: {}", aggregate_function))
                                }
                            }
                        } else {
                            Err("Input data is not an array".to_string())
                        }
                    },
                    _ => {
                        Err(format!("Unknown transform type: {}", transform_type))
                    }
                }
            },
            "merge" => {
                // Get merge sources from parameters
                let merge_sources = task.parameters.as_ref()
                    .and_then(|p| p.get("merge_sources"))
                    .and_then(|s| s.as_array())
                    .ok_or_else(|| "No merge_sources specified for merge operation".to_string())?;
                
                // Collect data from all sources
                let mut merged_data = Vec::new();
                
                // Add input data if it's an array
                if let Some(items) = input_data.as_array() {
                    merged_data.extend(items.clone());
                } else {
                    merged_data.push(input_data.clone());
                }
                
                // Add data from dependency results
                for source in merge_sources {
                    if let Some(source_id) = source.as_str() {
                        if let Some(dep_result) = dependency_results.get(source_id) {
                            if let Some(output) = &dep_result.output {
                                if let Some(items) = output.as_array() {
                                    merged_data.extend(items.clone());
                                } else {
                                    merged_data.push(output.clone());
                                }
                            }
                        }
                    }
                }
                
                let output = json!({
                    "operation": "merge",
                    "source_count": merge_sources.len() + 1,
                    "result_count": merged_data.len(),
                    "result": merged_data,
                });
                
                Ok((TaskStatus::Completed, Some(output), None))
            },
            _ => {
                Err(format!("Unknown data processing operation: {}", operation))
            }
        }
    }
    
    /// Processes a system command task
    async fn process_system_command_task(
        task: TaskExecution,
        dependency_results: HashMap<String, TaskResult>,
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        info!("Processing system command task: {}", task.task_id);
        
        // Get command from parameters
        let command = task.parameters.as_ref()
            .and_then(|p| p.get("command"))
            .and_then(|c| c.as_str())
            .ok_or_else(|| "No command specified in task parameters".to_string())?;
        
        // Get arguments from parameters
        let args = task.parameters.as_ref()
            .and_then(|p| p.get("args"))
            .and_then(|a| a.as_array())
            .map(|a| {
                a.iter()
                    .filter_map(|arg| arg.as_str())
                    .collect::<Vec<_>>()
            })
            .unwrap_or_else(Vec::new);
        
        // Execute command
        let mut cmd = tokio::process::Command::new(command);
        cmd.args(&args);
        
        // Set working directory if specified
        if let Some(working_dir) = task.parameters.as_ref()
            .and_then(|p| p.get("working_dir"))
            .and_then(|w| w.as_str()) {
            cmd.current_dir(working_dir);
        }
        
        match cmd.output().await {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                let status = output.status.code().unwrap_or(-1);
                
                let result = json!({
                    "command": command,
                    "args": args,
                    "exit_code": status,
                    "stdout": stdout,
                    "stderr": stderr,
                });
                
                if output.status.success() {
                    Ok((TaskStatus::Completed, Some(result), None))
                } else {
                    let error_message = format!("Command failed with exit code {}: {}", status, stderr);
                    Ok((TaskStatus::Failed, Some(result), Some(error_message)))
                }
            },
            Err(err) => {
                error!("Failed to execute command {}: {}", command, err);
                Err(format!("Failed to execute command {}: {}", command, err))
            }
        }
    }
    
    /// Processes a generic task
    async fn process_generic_task(
        task: TaskExecution,
        dependency_results: HashMap<String, TaskResult>,
    ) -> Result<(TaskStatus, Option<serde_json::Value>, Option<String>), String> {
        info!("Processing generic task: {}", task.task_id);
        
        // For generic tasks, we just return success with the task parameters
        let output = json!({
            "task_id": task.task_id,
            "description": task.description,
            "parameters": task.parameters,
            "dependencies": task.dependencies,
            "dependency_results": dependency_results.keys().collect::<Vec<_>>(),
        });
        
        Ok((TaskStatus::Completed, Some(output), None))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::task_manager::models::TaskExecution;
    
    #[tokio::test]
    async fn test_generic_task_execution() {
        // Create a task
        let task = TaskExecution {
            task_id: "test_task".to_string(),
            description: "Test task".to_string(),
            dependencies: Vec::new(),
            parameters: Some(serde_json::json!({
                "test_param": "test_value"
            }).as_object().unwrap().clone()),
        };
        
        // Execute task
        let result = TaskExecutor::execute_task(task, HashMap::new()).await;
        
        // Check result
        assert_eq!(result.status, TaskStatus::Completed);
        assert!(result.output.is_some());
        assert!(result.error.is_none());
    }
    
    #[tokio::test]
    async fn test_task_with_failed_dependency() {
        // Create a task with a dependency
        let task = TaskExecution {
            task_id: "test_task".to_string(),
            description: "Test task".to_string(),
            dependencies: vec!["dep_task".to_string()],
            parameters: None,
        };
        
        // Create a failed dependency result
        let mut dependency_results = HashMap::new();
        let mut dep_result = TaskResult::new("dep_task".to_string());
        dep_result.mark_failed("Dependency failed".to_string());
        dependency_results.insert("dep_task".to_string(), dep_result);
        
        // Execute task
        let result = TaskExecutor::execute_task(task, dependency_results).await;
        
        // Check result
        assert_eq!(result.status, TaskStatus::Failed);
        assert!(result.error.is_some());
    }
    
    #[tokio::test]
    async fn test_task_timeout() {
        // Create a task that will timeout
        let task = TaskExecution {
            task_id: "timeout_task".to_string(),
            description: "Timeout task".to_string(),
            dependencies: Vec::new(),
            parameters: Some(serde_json::json!({
                "timeout_seconds": 1,
                "task_type": "system_command",
                "command": "sleep",
                "args": ["10"]
            }).as_object().unwrap().clone()),
        };
        
        // Execute task
        let result = TaskExecutor::execute_task(task, HashMap::new()).await;
        
        // Check result
        assert_eq!(result.status, TaskStatus::Timeout);
        assert!(result.error.is_some());
    }
}
