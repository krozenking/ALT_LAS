use std::collections::HashMap;
use tokio::time::{timeout, Duration};
use log::{info, warn, error};
use serde_json::json;

use super::models::{TaskExecution, TaskResult, TaskStatus};

/// Executor for running individual tasks
pub struct TaskExecutor {
    // Configuration options could be added here
}

impl TaskExecutor {
    /// Creates a new task executor
    pub fn new() -> Self {
        TaskExecutor {}
    }

    /// Executes a task and returns the result
    pub async fn execute_task(
        mut task: TaskExecution,
        dependency_results: HashMap<String, TaskResult>,
    ) -> TaskResult {
        info!("Executing task: {} - {}", task.task_id, task.description);
        
        // Update task result to running
        task.result.mark_running();
        
        // Get timeout duration
        let timeout_duration = task.timeout_seconds
            .map(|secs| Duration::from_secs(secs as u64))
            .unwrap_or(Duration::from_secs(300)); // Default 5 minutes
        
        // Execute task with timeout
        match timeout(timeout_duration, Self::execute_task_internal(task.clone(), dependency_results)).await {
            Ok(result) => {
                match result {
                    Ok(output) => {
                        info!("Task completed successfully: {}", task.task_id);
                        let mut task_result = task.result;
                        task_result.mark_completed(output);
                        task_result
                    },
                    Err(err) => {
                        error!("Task failed: {} - {}", task.task_id, err);
                        let mut task_result = task.result;
                        task_result.mark_failed(err);
                        task_result
                    }
                }
            },
            Err(_) => {
                warn!("Task timed out: {}", task.task_id);
                let mut task_result = task.result;
                task_result.mark_timeout();
                task_result
            }
        }
    }

    /// Internal implementation of task execution
    async fn execute_task_internal(
        task: TaskExecution,
        dependency_results: HashMap<String, TaskResult>,
    ) -> Result<serde_json::Value, String> {
        // In a real implementation, this would execute the actual task logic
        // For now, we'll simulate task execution with a delay
        
        // Simulate processing time based on task complexity
        let processing_time = match task.task_id.as_str() {
            id if id.contains("long") => 2000,
            id if id.contains("medium") => 1000,
            _ => 500,
        };
        
        // Simulate task execution
        tokio::time::sleep(Duration::from_millis(processing_time)).await;
        
        // Simulate failure for tasks with "fail" in their ID
        if task.task_id.contains("fail") {
            return Err(format!("Simulated failure for task: {}", task.task_id));
        }
        
        // Create result output
        let mut output = json!({
            "task_id": task.task_id,
            "description": task.description,
            "processing_time_ms": processing_time,
            "dependencies": task.dependencies,
        });
        
        // Add dependency outputs
        let mut dependency_outputs = HashMap::new();
        for (dep_id, dep_result) in dependency_results {
            if let Some(dep_output) = dep_result.output {
                dependency_outputs.insert(dep_id, dep_output);
            }
        }
        
        if !dependency_outputs.is_empty() {
            output["dependency_outputs"] = json!(dependency_outputs);
        }
        
        // Add parameters if available
        if let Some(params) = task.parameters {
            output["parameters"] = json!(params);
        }
        
        Ok(output)
    }
    
    /// Executes an AI-related task by calling the AI Orchestrator service
    pub async fn execute_ai_task(
        task: TaskExecution,
        ai_service_url: &str,
    ) -> Result<serde_json::Value, String> {
        info!("Executing AI task: {} via {}", task.task_id, ai_service_url);
        
        // In a real implementation, this would call the AI Orchestrator service
        // For now, we'll simulate the AI service call
        
        // Simulate processing time
        tokio::time::sleep(Duration::from_millis(1500)).await;
        
        // Create simulated AI response
        let ai_response = json!({
            "task_id": task.task_id,
            "ai_model": "simulated-model",
            "confidence": 0.95,
            "processing_time_ms": 1500,
            "result": {
                "text": format!("AI processed task: {}", task.description),
                "metadata": {
                    "tokens": 150,
                    "model_version": "1.0"
                }
            }
        });
        
        Ok(ai_response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::Task;
    
    #[tokio::test]
    async fn test_execute_simple_task() {
        // Create a simple task
        let alt_task = Task {
            id: "test_task".to_string(),
            description: "Test task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        let task_execution = TaskExecution::from_alt_task(&alt_task);
        let dependency_results = HashMap::new();
        
        // Execute task
        let result = TaskExecutor::execute_task(task_execution, dependency_results).await;
        
        // Verify result
        assert_eq!(result.status, TaskStatus::Completed);
        assert!(result.output.is_some());
        assert!(result.error.is_none());
        assert!(result.duration_ms.is_some());
    }
    
    #[tokio::test]
    async fn test_execute_failing_task() {
        // Create a failing task
        let alt_task = Task {
            id: "fail_task".to_string(),
            description: "Failing task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        let task_execution = TaskExecution::from_alt_task(&alt_task);
        let dependency_results = HashMap::new();
        
        // Execute task
        let result = TaskExecutor::execute_task(task_execution, dependency_results).await;
        
        // Verify result
        assert_eq!(result.status, TaskStatus::Failed);
        assert!(result.output.is_none());
        assert!(result.error.is_some());
        assert!(result.duration_ms.is_some());
    }
    
    #[tokio::test]
    async fn test_execute_timeout_task() {
        // Create a task with a very short timeout
        let alt_task = Task {
            id: "long_task".to_string(),
            description: "Long running task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: Some(1), // 1 second timeout
            retry_count: None,
        };
        
        let task_execution = TaskExecution::from_alt_task(&alt_task);
        let dependency_results = HashMap::new();
        
        // Execute task
        let result = TaskExecutor::execute_task(task_execution, dependency_results).await;
        
        // Verify result
        assert_eq!(result.status, TaskStatus::Timeout);
        assert!(result.output.is_none());
        assert!(result.error.is_some());
        assert!(result.duration_ms.is_some());
    }
}
