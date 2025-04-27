use std::collections::HashMap;
use serde_json::json;
use log::{info, error, warn, debug};
use tokio::sync::Semaphore;
use std::sync::Arc;

use crate::alt_file::models::{AltMode, Task};
use crate::task_manager::models::{TaskExecution, TaskResult};
use super::client::{AiServiceClient, MockAiServiceClient};

/// AI task processor
pub struct AiTaskProcessor {
    client: AiServiceClient,
    mock_client: Option<MockAiServiceClient>,
    use_mock: bool,
    concurrency_limit: usize,
    semaphore: Arc<Semaphore>,
}

impl AiTaskProcessor {
    /// Creates a new AI task processor
    pub fn new(base_url: &str, timeout_seconds: u64, concurrency_limit: usize) -> Self {
        let client = AiServiceClient::new(base_url, timeout_seconds);
        let semaphore = Arc::new(Semaphore::new(concurrency_limit));
        
        AiTaskProcessor {
            client,
            mock_client: None,
            use_mock: false,
            concurrency_limit,
            semaphore,
        }
    }
    
    /// Creates a new AI task processor with mock client
    pub fn new_mock() -> Self {
        let client = AiServiceClient::new("http://localhost:8000", 30);
        let mock_client = Some(MockAiServiceClient::new());
        let semaphore = Arc::new(Semaphore::new(4));
        
        AiTaskProcessor {
            client,
            mock_client,
            use_mock: true,
            concurrency_limit: 4,
            semaphore,
        }
    }
    
    /// Creates a new AI task processor with both real and mock clients
    pub fn new_with_fallback(base_url: &str, timeout_seconds: u64, concurrency_limit: usize) -> Self {
        let client = AiServiceClient::new(base_url, timeout_seconds);
        let mock_client = Some(MockAiServiceClient::new());
        let semaphore = Arc::new(Semaphore::new(concurrency_limit));
        
        AiTaskProcessor {
            client,
            mock_client,
            use_mock: false,
            concurrency_limit,
            semaphore,
        }
    }
    
    /// Sets whether to use the mock client
    pub fn set_use_mock(&mut self, use_mock: bool) {
        self.use_mock = use_mock;
    }
    
    /// Checks if the AI service is healthy
    pub async fn is_healthy(&self) -> bool {
        if self.use_mock {
            if let Some(mock_client) = &self.mock_client {
                return mock_client.check_health().await;
            }
            return false;
        }
        
        self.client.check_health().await
    }
    
    /// Gets available AI models
    pub async fn get_available_models(&self) -> Result<Vec<String>, String> {
        if self.use_mock {
            if let Some(mock_client) = &self.mock_client {
                return mock_client.get_available_models().await;
            }
            return Err("Mock client not available".to_string());
        }
        
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
        
        // Extract streaming flag
        let streaming = parameters.and_then(|p| p.get("streaming").and_then(|s| s.as_bool())).unwrap_or(false);
        
        // Create AI parameters
        let mut ai_params = HashMap::new();
        if let Some(params) = parameters {
            for (key, value) in params {
                if key != "prompt" && key != "mode" && key != "persona" && key != "streaming" {
                    ai_params.insert(key.clone(), value.clone());
                }
            }
        }
        
        // Check if we should use mock client
        if self.use_mock {
            if let Some(mock_client) = &self.mock_client {
                if streaming {
                    // Create a callback for streaming
                    let task_id = task.task_id.clone();
                    let callback = move |chunk: &str| {
                        debug!("Received streaming chunk for task {}: {}", task_id, chunk);
                    };
                    
                    return mock_client.send_streaming_request(
                        &task.task_id,
                        prompt,
                        mode,
                        persona,
                        if ai_params.is_empty() { None } else { Some(ai_params) },
                        callback,
                    ).await;
                } else {
                    return mock_client.send_request(
                        &task.task_id,
                        prompt,
                        mode,
                        persona,
                        if ai_params.is_empty() { None } else { Some(ai_params) },
                    ).await;
                }
            }
            return Err("Mock client not available".to_string());
        }
        
        // Check if AI service is healthy
        if !self.client.check_health().await {
            warn!("AI service is not healthy");
            
            // Fall back to mock client if available
            match &self.mock_client {
                Some(mock_client) => {
                    warn!("Falling back to mock client for task: {}", task.task_id);
                    
                    if streaming {
                        // Create a callback for streaming
                        let task_id = task.task_id.clone();
                        let callback = move |chunk: &str| {
                            debug!("Received streaming chunk for task {}: {}", task_id, chunk);
                        };
                        
                        return mock_client.send_streaming_request(
                            &task.task_id,
                            prompt,
                            mode,
                            persona,
                            if ai_params.is_empty() { None } else { Some(ai_params) },
                            callback,
                        ).await;
                    } else {
                        return mock_client.send_request(
                            &task.task_id,
                            prompt,
                            mode,
                            persona,
                            if ai_params.is_empty() { None } else { Some(ai_params) },
                        ).await;
                    }
                },
                None => {
                    return Err("AI service is not healthy and mock client is not available".to_string());
                }
            }
        } else {
            // Use real client
            if streaming {
                // Create a callback for streaming
                let task_id = task.task_id.clone();
                let callback = move |chunk: &str| {
                    debug!("Received streaming chunk for task {}: {}", task_id, chunk);
                };
                
                return self.client.send_streaming_request(
                    &task.task_id,
                    prompt,
                    mode,
                    persona,
                    if ai_params.is_empty() { None } else { Some(ai_params) },
                    callback,
                ).await;
            } else {
                return self.client.send_request(
                    &task.task_id,
                    prompt,
                    mode,
                    persona,
                    if ai_params.is_empty() { None } else { Some(ai_params) },
                ).await;
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
            client: AiServiceClient::new(&self.client.base_url, self.client.timeout_seconds),
            mock_client: self.mock_client.as_ref().map(|_| MockAiServiceClient::new()),
            use_mock: self.use_mock,
            concurrency_limit: self.concurrency_limit,
            semaphore: self.semaphore.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::{Task, TaskStatus, Priority};
    
    #[tokio::test]
    async fn test_process_ai_task() {
        // Create a processor with mock client
        let processor = AiTaskProcessor::new_mock();
        
        // Create a task with parameters
        let mut params = HashMap::new();
        params.insert("prompt".to_string(), json!("This is a test prompt"));
        params.insert("temperature".to_string(), json!(0.7));
        
        let alt_task = Task {
            id: "ai_task".to_string(),
            description: "AI processing task".to_string(),
            dependencies: None,
            parameters: Some(params),
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
        };
        
        let task_execution = TaskExecution::from_alt_task(&alt_task);
        
        // Process the task
        let result = processor.process_task(&task_execution).await;
        
        // Verify result
        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.get("text").is_some());
    }
    
    #[tokio::test]
    async fn test_process_ai_task_missing_prompt() {
        // Create a processor with mock client
        let processor = AiTaskProcessor::new_mock();
        
        // Create a task without a prompt
        let mut params = HashMap::new();
        params.insert("temperature".to_string(), json!(0.7));
        
        let alt_task = Task {
            id: "ai_task_no_prompt".to_string(),
            description: "AI processing task without prompt".to_string(),
            dependencies: None,
            parameters: Some(params),
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
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
        // Create a processor with mock client
        let processor = AiTaskProcessor::new_mock();
        
        // Create multiple tasks
        let mut tasks = Vec::new();
        
        for i in 0..3 {
            let mut params = HashMap::new();
            params.insert("prompt".to_string(), json!(format!("Test prompt {}", i)));
            
            let alt_task = Task {
                id: format!("batch_task_{}", i),
                description: format!("Batch task {}", i),
                dependencies: None,
                parameters: Some(params),
                timeout_seconds: None,
                retry_count: None,
                status: Some(TaskStatus::Pending),
                priority: Some(Priority::Medium),
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
            assert!(results[&task_id].is_ok());
        }
    }
    
    #[tokio::test]
    async fn test_streaming_task() {
        // Create a processor with mock client
        let processor = AiTaskProcessor::new_mock();
        
        // Create a task with streaming parameter
        let mut params = HashMap::new();
        params.insert("prompt".to_string(), json!("This is a streaming test prompt"));
        params.insert("streaming".to_string(), json!(true));
        
        let alt_task = Task {
            id: "streaming_task".to_string(),
            description: "Streaming AI task".to_string(),
            dependencies: None,
            parameters: Some(params),
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
        };
        
        let task_execution = TaskExecution::from_alt_task(&alt_task);
        
        // Process the task
        let result = processor.process_task(&task_execution).await;
        
        // Verify result
        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.get("streaming").is_some());
        assert_eq!(response["streaming"], true);
    }
}
