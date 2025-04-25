use std::collections::HashMap;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use log::{info, error};
use tokio::time::timeout;
use std::time::Duration;

/// AI service client for interacting with the AI Orchestrator
pub struct AiServiceClient {
    client: Client,
    base_url: String,
    timeout_seconds: u64,
}

#[derive(Debug, Serialize)]
struct AiRequest {
    task_id: String,
    prompt: String,
    mode: Option<String>,
    persona: Option<String>,
    parameters: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Deserialize)]
struct AiResponse {
    task_id: String,
    model: String,
    result: serde_json::Value,
    metadata: Option<HashMap<String, serde_json::Value>>,
}

impl AiServiceClient {
    /// Creates a new AI service client
    pub fn new(base_url: String, timeout_seconds: u64) -> Self {
        AiServiceClient {
            client: Client::new(),
            base_url,
            timeout_seconds,
        }
    }
    
    /// Sends a request to the AI service
    pub async fn send_request(
        &self,
        task_id: &str,
        prompt: &str,
        mode: Option<&str>,
        persona: Option<&str>,
        parameters: Option<HashMap<String, serde_json::Value>>,
    ) -> Result<serde_json::Value, String> {
        info!("Sending AI request for task: {}", task_id);
        
        let request = AiRequest {
            task_id: task_id.to_string(),
            prompt: prompt.to_string(),
            mode: mode.map(|s| s.to_string()),
            persona: persona.map(|s| s.to_string()),
            parameters,
        };
        
        let url = format!("{}/process", self.base_url);
        
        // Set timeout for the request
        let timeout_duration = Duration::from_secs(self.timeout_seconds);
        
        // Send request with timeout
        match timeout(timeout_duration, self.client.post(&url).json(&request).send()).await {
            Ok(result) => {
                match result {
                    Ok(response) => {
                        if response.status().is_success() {
                            match response.json::<AiResponse>().await {
                                Ok(ai_response) => {
                                    info!("Received AI response for task: {}", task_id);
                                    Ok(ai_response.result)
                                },
                                Err(err) => {
                                    error!("Failed to parse AI response: {}", err);
                                    Err(format!("Failed to parse AI response: {}", err))
                                }
                            }
                        } else {
                            let status = response.status();
                            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                            error!("AI service returned error status {}: {}", status, error_text);
                            Err(format!("AI service returned error status {}: {}", status, error_text))
                        }
                    },
                    Err(err) => {
                        error!("Failed to send request to AI service: {}", err);
                        Err(format!("Failed to send request to AI service: {}", err))
                    }
                }
            },
            Err(_) => {
                error!("Request to AI service timed out after {} seconds", self.timeout_seconds);
                Err(format!("Request to AI service timed out after {} seconds", self.timeout_seconds))
            }
        }
    }
    
    /// Checks the health of the AI service
    pub async fn check_health(&self) -> bool {
        info!("Checking AI service health");
        
        let url = format!("{}/health", self.base_url);
        
        match self.client.get(&url).send().await {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    }
}

/// Mock AI service client for testing
pub struct MockAiServiceClient {}

impl MockAiServiceClient {
    /// Creates a new mock AI service client
    pub fn new() -> Self {
        MockAiServiceClient {}
    }
    
    /// Sends a request to the mock AI service
    pub async fn send_request(
        &self,
        task_id: &str,
        prompt: &str,
        mode: Option<&str>,
        persona: Option<&str>,
        parameters: Option<HashMap<String, serde_json::Value>>,
    ) -> Result<serde_json::Value, String> {
        info!("Sending mock AI request for task: {}", task_id);
        
        // Simulate processing delay
        tokio::time::sleep(Duration::from_millis(500)).await;
        
        // Create mock response
        let response = serde_json::json!({
            "text": format!("Mock AI response for prompt: {}", prompt),
            "confidence": 0.95,
            "task_id": task_id,
            "mode": mode.unwrap_or("Normal"),
            "persona": persona.unwrap_or("technical_expert"),
            "parameters": parameters,
        });
        
        Ok(response)
    }
    
    /// Checks the health of the mock AI service
    pub async fn check_health(&self) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_mock_ai_service() {
        let client = MockAiServiceClient::new();
        
        let mut parameters = HashMap::new();
        parameters.insert("temperature".to_string(), serde_json::json!(0.7));
        
        let result = client.send_request(
            "test_task",
            "This is a test prompt",
            Some("Dream"),
            Some("creative"),
            Some(parameters),
        ).await;
        
        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.get("text").is_some());
        assert_eq!(response["mode"], "Dream");
        assert_eq!(response["persona"], "creative");
    }
}
