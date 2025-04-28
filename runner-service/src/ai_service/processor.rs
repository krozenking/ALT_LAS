use std::collections::HashMap;
use serde_json::json;
use log::{info, error, warn, debug};
use tokio::sync::Semaphore;
use std::sync::Arc;

// Removed unused AltMode, Task
// Removed unused empty import: crate::alt_file::models::{}
use crate::task_manager::models::{TaskExecution, TaskResult};
use super::client::{AiServiceClient};
// Removed MockAiServiceClient import as it's not defined in client.rs

/// AI task processor
pub struct AiTaskProcessor {
    client: AiServiceClient,
    // mock_client: Option<MockAiServiceClient>, // Removed mock client fields
    // use_mock: bool,
    concurrency_limit: usize,
    semaphore: Arc<Semaphore>,
}

#[allow(dead_code)] // Allow dead code for the entire impl block
impl AiTaskProcessor {
    /// Creates a new AI task processor
    pub fn new(base_url: String, timeout_seconds: u64, concurrency_limit: usize) -> Self { // Changed base_url to String
        let client = AiServiceClient::new(base_url, timeout_seconds);
        let semaphore = Arc::new(Semaphore::new(concurrency_limit));
        
        AiTaskProcessor {
            client,
            // mock_client: None,
            // use_mock: false,
            concurrency_limit,
            semaphore,
        }
    }
    
    // Removed mock-related methods: new_mock, new_with_fallback, set_use_mock
    
    /// Checks if the AI service is healthy
    pub async fn is_healthy(&self) -> Result<bool, String> { // Changed return type to Result
        self.client.check_health().await
    }
    
    /// Gets available AI models
    pub async fn get_available_models(&self) -> Result<Vec<String>, String> {
        self.client.get_available_models().await
    }
    
    /// Processes an AI task
    pub async fn process_task(&self, task: &TaskExecution) -> Result<serde_json::Value, String> {
        info!("Processing AI task: {}", task.task_id);
        
        // Acquire a permit from the semaphore to limit concurrency
        let _permit = self.semaphore.clone().acquire_owned().await.map_err(|e| {
            error!("Failed to acquire semaphore permit: {}", e);
            format!("Failed to acquire semaphore permit: {}", e)
        })?;
        
        debug!("Acquired semaphore permit for task: {}", task.task_id);
        
        // Extract parameters
        let parameters = task.parameters.as_ref();
        
        // Extract prompt
        let prompt = match parameters {
            Some(params) => {
                match params.get("prompt") {
                    Some(prompt_value) => {
                        match prompt_value.as_str() {
                            Some(prompt_str) => prompt_str,
                            None => {
                                error!("Task parameters do not contain a valid prompt string: {}", task.task_id);
                                return Err("Task parameters do not contain a valid prompt string".to_string());
                            }
                        }
                    },
                    None => {
                        error!("Task parameters do not contain a prompt: {}", task.task_id);
                        return Err("Task parameters do not contain a prompt".to_string());
                    }
                }
            },
            None => {
                error!("Task has no parameters: {}", task.task_id);
                return Err("Task has no parameters".to_string());
            }
        };
        
        // Extract mode and persona
        let mode = parameters.and_then(|p| p.get("mode").and_then(|m| m.as_str()));
        let persona = parameters.and_then(|p| p.get("persona").and_then(|m| m.as_str()));
        
        // Extract streaming flag - Assuming streaming is not supported by the current client.rs
        // let streaming = parameters.and_then(|p| p.get("streaming").and_then(|s| s.as_bool())).unwrap_or(false);
        
        // Create AI parameters
        let mut ai_params = HashMap::new();
        if let Some(params) = parameters {
            for (key, value) in params {
                if key != "prompt" && key != "mode" && key != "persona" { // Removed streaming check
                    ai_params.insert(key.clone(), value.clone());
                }
            }
        }
        
        // Removed mock client logic
        
        // Check if AI service is healthy
        match self.client.check_health().await {
            Ok(true) => {
                // Use real client
                // Removed streaming logic
                self.client.send_request(
                    &task.task_id,
                    prompt,
                    mode,
                    persona,
                    if ai_params.is_empty() { None } else { Some(ai_params) },
                ).await
            },
            Ok(false) => {
                 warn!("AI service is not healthy for task: {}", task.task_id);
                 Err("AI service is not healthy".to_string())
            },
            Err(e) => {
                 error!("Failed to check AI service health: {}", e);
                 Err(format!("Failed to check AI service health: {}", e))
            }
        }
    }
    
    /// Processes a batch of AI tasks
    pub async fn process_batch(&self, tasks: &[TaskExecution]) -> HashMap<String, Result<serde_json::Value, String>> {
        info!("Processing batch of {} AI tasks", tasks.len());
        
        let mut results = HashMap::new();
        let mut handles = Vec::new();
        
        // Process each task concurrently
        for task in tasks {
            let task_clone = task.clone();
            let self_clone = self.clone();
            
            // Spawn a task for each execution
            let handle = tokio::spawn(async move {
                let task_id = task_clone.task_id.clone();
                let result = self_clone.process_task(&task_clone).await;
                (task_id, result)
            });
            
            handles.push(handle);
        }
        
        // Wait for all tasks to complete
        for handle in handles {
            match handle.await {
                Ok((task_id, result)) => {
                    results.insert(task_id, result);
                },
                Err(e) => {
                    error!("Task join error: {}", e);
                    // Optionally insert an error result for the task
                    // results.insert(task_id, Err(format!("Task join error: {}", e)));
                }
            }
        }
        
        results
    }
    
    /// Enhances a task result with AI processing
    pub async fn enhance_task_result(&self, task: &TaskExecution, result: &TaskResult) -> Result<serde_json::Value, String> {
        info!("Enhancing task result with AI: {}", task.task_id);
        
        // Create a prompt for enhancement
        let prompt = format!(
            "Enhance the following task result:\nTask: {}\nDescription: {}\nResult: {}",
            task.task_id,
            task.description,
            serde_json::to_string(result).unwrap_or_else(|_| "{}".to_string())
        );
        
        // Create parameters
        let mut params = HashMap::new();
        params.insert("prompt".to_string(), json!(prompt));
        params.insert("operation".to_string(), json!("enhance"));
        
        // Create a new task for enhancement
        let enhance_task = TaskExecution {
            task_id: format!("{}_enhance", task.task_id),
            description: format!("Enhance result for task {}", task.task_id),
            dependencies: vec![task.task_id.clone()],
            parameters: Some(params),
            timeout_seconds: Some(30),
            retry_count: Some(1),
            current_retry: 0,
            result: TaskResult::new(format!("{}_enhance", task.task_id)),
        };
        
        // Process the enhancement task
        self.process_task(&enhance_task).await
    }
}

// Implement Clone for AiTaskProcessor
impl Clone for AiTaskProcessor {
    fn clone(&self) -> Self {
        AiTaskProcessor {
            client: self.client.clone(), // Clone the existing client
            // mock_client: self.mock_client.clone(), // Removed mock client
            // use_mock: self.use_mock,
            concurrency_limit: self.concurrency_limit,
            semaphore: self.semaphore.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::{Task, Priority}; // Corrected import path
    use crate::task_manager::models::TaskStatus; // Corrected import
    use mockito::{mock, server_url};
    
    #[tokio::test]
    async fn test_process_ai_task() {
        // Mock the AI service endpoints
        let _m_health = mock("GET", "/health").with_status(200).create();
        let _m_generate = mock("POST", "/api/v1/generate")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"text": "Mock AI response"}"#)
            .create();
            
        // Create a processor pointing to the mock server
        let processor = AiTaskProcessor::new(server_url(), 30, 4);
        
        // Create a task with parameters
        let mut params = HashMap::new();
        params.insert("prompt".to_string(), json!("This is a test prompt"));
        params.insert("temperature".to_string(), json!(0.7));
        
        let alt_task = Task {
            id: "ai_task".to_string(),
            name: "AI Task".to_string(), // Added name field
            description: "AI processing task".to_string(),
            task_type: "ai".to_string(), // Added task_type field
            dependencies: None,
            parameters: Some(params),
            timeout_seconds: None,
            retry_count: None,
            retry_delay_seconds: None, // Added retry_delay_seconds field
            // status: None, // Removed status field, not part of AltTask
            priority: Priority::Medium, // Changed to Priority enum
            tags: None,
        };
        
        let task_execution = TaskExecution::from_alt_task(&alt_task);
        
        // Process the task
        let result = processor.process_task(&task_execution).await;
        
        // Verify result
        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.get("text").unwrap().as_str().unwrap(), "Mock AI response");
    }
    
    #[tokio::test]
    async fn test_process_ai_task_missing_prompt() {
        // Mock the AI service health endpoint
        let _m_health = mock("GET", "/health").with_status(200).create();
        
        // Create a processor pointing to the mock server
        let processor = AiTaskProcessor::new(server_url(), 30, 4);
        
        // Create a task without a prompt
        let mut params = HashMap::new();
        params.insert("temperature".to_string(), json!(0.7));
        
        let alt_task = Task {
            id: "ai_task_no_prompt".to_string(),
            name: "AI Task No Prompt".to_string(), // Added name field
            description: "AI processing task without prompt".to_string(),
            task_type: "ai".to_string(), // Added task_type field
            dependencies: None,
            parameters: Some(params),
            timeout_seconds: None,
            retry_count: None,
            retry_delay_seconds: None, // Added retry_delay_seconds field
            // status: None,
            priority: Priority::Medium,
            tags: None,
        };
        
        let task_execution = TaskExecution::from_alt_task(&alt_task);
        
        // Process the task
        let result = processor.process_task(&task_execution).await;
        
        // Verify result
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("do not contain a prompt"));
    }
    
    #[tokio::test]
    async fn test_process_batch() {
        // Mock the AI service endpoints
        let _m_health = mock("GET", "/health").with_status(200).create();
        let _m_generate = mock("POST", "/api/v1/generate")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"text": "Mock AI response"}"#)
            .create(); // Mock generate endpoint for all batch tasks
            
        // Create a processor pointing to the mock server
        let processor = AiTaskProcessor::new(server_url(), 30, 4);
        
        // Create multiple tasks
        let mut tasks = Vec::new();
        
        for i in 0..3 {
            let mut params = HashMap::new();
            params.insert("prompt".to_string(), json!(format!("Test prompt {}", i)));
            
            let alt_task = Task {
                id: format!("batch_task_{}", i),
                name: format!("Batch Task {}", i), // Added name field
                description: format!("Batch task {}", i),
                task_type: "ai".to_string(), // Added task_type field
                dependencies: None,
                parameters: Some(params),
                timeout_seconds: None,
                retry_count: None,
                retry_delay_seconds: None, // Added retry_delay_seconds field
                // status: None,
                priority: Priority::Medium,
                tags: None,
            };
            
            tasks.push(TaskExecution::from_alt_task(&alt_task));
        }
        
        // Process the batch
        let results = processor.process_batch(&tasks).await;
        
        // Verify results
        assert_eq!(results.len(), 3);
        for i in 0..3 {
            let task_id = format!("batch_task_{}", i);
            assert!(results.contains_key(&task_id));
            let result = results.get(&task_id).unwrap();
            assert!(result.is_ok());
            assert_eq!(result.as_ref().unwrap().get("text").unwrap().as_str().unwrap(), "Mock AI response");
        }
    }
}

