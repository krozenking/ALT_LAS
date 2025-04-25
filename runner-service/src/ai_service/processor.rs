use std::collections::HashMap;
use log::{info, error, warn};
use serde_json::json;

use crate::task_manager::models::{TaskExecution, TaskResult};
use super::client::{AiServiceClient, MockAiServiceClient};

/// Processor for AI tasks
pub struct AiTaskProcessor {
    client: AiServiceClient,
    mock_client: Option<MockAiServiceClient>,
    use_mock: bool,
}

impl AiTaskProcessor {
    /// Creates a new AI task processor with a real client
    pub fn new(base_url: String, timeout_seconds: u64) -> Self {
        AiTaskProcessor {
            client: AiServiceClient::new(base_url, timeout_seconds),
            mock_client: Some(MockAiServiceClient::new()),
            use_mock: false,
        }
    }
    
    /// Creates a new AI task processor with a mock client
    pub fn new_mock() -> Self {
        AiTaskProcessor {
            client: AiServiceClient::new("http://localhost:8000".to_string(), 30),
            mock_client: Some(MockAiServiceClient::new()),
            use_mock: true,
        }
    }
    
    /// Enables or disables the use of the mock client
    pub fn set_use_mock(&mut self, use_mock: bool) {
        self.use_mock = use_mock;
    }
    
    /// Processes an AI task
    pub async fn process_task(&self, task: &TaskExecution) -> Result<serde_json::Value, String> {
        info!("Processing AI task: {}", task.task_id);
        
        // Extract prompt from task parameters
        let prompt = match &task.parameters {
            Some(params) => {
                match params.get("prompt") {
                    Some(prompt_value) => {
                        match prompt_value.as_str() {
                            Some(prompt_str) => prompt_str.to_string(),
                            None => {
                                return Err("Prompt parameter is not a string".to_string());
                            }
                        }
                    },
                    None => {
                        return Err("Task parameters do not contain a prompt".to_string());
                    }
                }
            },
            None => {
                return Err("Task does not have parameters".to_string());
            }
        };
        
        // Extract mode and persona from parameters
        let mode = task.parameters.as_ref()
            .and_then(|params| params.get("mode"))
            .and_then(|mode| mode.as_str());
        
        let persona = task.parameters.as_ref()
            .and_then(|params| params.get("persona"))
            .and_then(|persona| persona.as_str());
        
        // Extract additional parameters
        let mut ai_params = HashMap::new();
        if let Some(params) = &task.parameters {
            for (key, value) in params {
                if key != "prompt" && key != "mode" && key != "persona" {
                    ai_params.insert(key.clone(), value.clone());
                }
            }
        }
        
        // Process with appropriate client
        if self.use_mock {
            match &self.mock_client {
                Some(mock_client) => {
                    mock_client.send_request(
                        &task.task_id,
                        &prompt,
                        mode,
                        persona,
                        if ai_params.is_empty() { None } else { Some(ai_params) }
                    ).await
                },
                None => {
                    Err("Mock client is not available".to_string())
                }
            }
        } else {
            // Check if AI service is healthy
            if !self.client.check_health().await {
                warn!("AI service is not healthy, falling back to mock client");
                
                // Fall back to mock client if available
                match &self.mock_client {
                    Some(mock_client) => {
                        mock_client.send_request(
                            &task.task_id,
                            &prompt,
                            mode,
                            persona,
                            if ai_params.is_empty() { None } else { Some(ai_params) }
                        ).await
                    },
                    None => {
                        Err("AI service is not healthy and mock client is not available".to_string())
                    }
                }
            } else {
                // Use real client
                self.client.send_request(
                    &task.task_id,
                    &prompt,
                    mode,
                    persona,
                    if ai_params.is_empty() { None } else { Some(ai_params) }
                ).await
            }
        }
    }
    
    /// Processes a batch of AI tasks
    pub async fn process_batch(&self, tasks: &[TaskExecution]) -> HashMap<String, Result<serde_json::Value, String>> {
        info!("Processing batch of {} AI tasks", tasks.len());
        
        let mut results = HashMap::new();
        
        // Process each task
        for task in tasks {
            let result = self.process_task(task).await;
            results.insert(task.task_id.clone(), result);
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::Task;
    
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
        };
        
        let task_execution = TaskExecution::from_alt_task(&alt_task);
        
        // Process the task
        let result = processor.process_task(&task_execution).await;
        
        // Verify result
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("do not contain a prompt"));
    }
}
