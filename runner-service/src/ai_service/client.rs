use std::collections::HashMap;
use std::sync::Arc;
use tokio::time::{timeout, Duration};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use log::{info, error, warn, debug};

/// AI service request structure
#[derive(Debug, Serialize)]
pub struct AiRequest {
    pub task_id: String,
    pub prompt: String,
    pub mode: Option<String>,
    pub persona: Option<String>,
    pub parameters: Option<HashMap<String, serde_json::Value>>,
    pub model: Option<String>,
    pub stream: Option<bool>,
}

/// AI service response structure
#[derive(Debug, Deserialize)]
pub struct AiResponse {
    pub task_id: String,
    pub result: serde_json::Value,
    pub processing_time_ms: Option<u64>,
    pub model_used: Option<String>,
    pub tokens_used: Option<u32>,
}

/// AI service client
pub struct AiServiceClient {
    base_url: String,
    client: Client,
    timeout_seconds: u64,
}

impl AiServiceClient {
    /// Creates a new AI service client
    pub fn new(base_url: &str, timeout_seconds: u64) -> Self {
        AiServiceClient {
            base_url: base_url.to_string(),
            client: Client::new(),
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
        debug!("Prompt: {}", prompt);
        debug!("Mode: {:?}, Persona: {:?}", mode, persona);
        
        let request = AiRequest {
            task_id: task_id.to_string(),
            prompt: prompt.to_string(),
            mode: mode.map(|s| s.to_string()),
            persona: persona.map(|s| s.to_string()),
            parameters: parameters.clone(),
            model: parameters.as_ref().and_then(|p| 
                p.get("model").and_then(|m| m.as_str()).map(|s| s.to_string())
            ),
            stream: None,
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
                                    if let Some(tokens) = ai_response.tokens_used {
                                        debug!("Tokens used: {}", tokens);
                                    }
                                    if let Some(model) = &ai_response.model_used {
                                        debug!("Model used: {}", model);
                                    }
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
    
    /// Sends a streaming request to the AI service
    pub async fn send_streaming_request(
        &self,
        task_id: &str,
        prompt: &str,
        mode: Option<&str>,
        persona: Option<&str>,
        parameters: Option<HashMap<String, serde_json::Value>>,
        callback: impl Fn(&str) + Send + Sync + 'static,
    ) -> Result<serde_json::Value, String> {
        info!("Sending streaming AI request for task: {}", task_id);
        debug!("Prompt: {}", prompt);
        
        let request = AiRequest {
            task_id: task_id.to_string(),
            prompt: prompt.to_string(),
            mode: mode.map(|s| s.to_string()),
            persona: persona.map(|s| s.to_string()),
            parameters: parameters.clone(),
            model: parameters.as_ref().and_then(|p| 
                p.get("model").and_then(|m| m.as_str()).map(|s| s.to_string())
            ),
            stream: Some(true),
        };
        
        let url = format!("{}/stream", self.base_url);
        
        // Set timeout for the request
        let timeout_duration = Duration::from_secs(self.timeout_seconds);
        
        // Create a callback Arc for sharing with the async block
        let callback = Arc::new(callback);
        
        // Send request with timeout
        match timeout(timeout_duration, self.client.post(&url).json(&request).send()).await {
            Ok(result) => {
                match result {
                    Ok(response) => {
                        if response.status().is_success() {
                            let mut stream = response.bytes_stream();
                            let mut full_response = String::new();
                            
                            // Process the stream
                            while let Some(chunk_result) = stream.next().await {
                                match chunk_result {
                                    Ok(chunk) => {
                                        if let Ok(text) = String::from_utf8(chunk.to_vec()) {
                                            full_response.push_str(&text);
                                            callback(&text);
                                        }
                                    },
                                    Err(err) => {
                                        error!("Error reading stream chunk: {}", err);
                                        return Err(format!("Error reading stream: {}", err));
                                    }
                                }
                            }
                            
                            // Create a final response
                            let final_response = serde_json::json!({
                                "text": full_response,
                                "task_id": task_id,
                                "streaming": true
                            });
                            
                            Ok(final_response)
                        } else {
                            let status = response.status();
                            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                            error!("AI service returned error status {}: {}", status, error_text);
                            Err(format!("AI service returned error status {}: {}", status, error_text))
                        }
                    },
                    Err(err) => {
                        error!("Failed to send streaming request to AI service: {}", err);
                        Err(format!("Failed to send streaming request to AI service: {}", err))
                    }
                }
            },
            Err(_) => {
                error!("Streaming request to AI service timed out after {} seconds", self.timeout_seconds);
                Err(format!("Streaming request to AI service timed out after {} seconds", self.timeout_seconds))
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
    
    /// Gets available models from the AI service
    pub async fn get_available_models(&self) -> Result<Vec<String>, String> {
        info!("Getting available AI models");
        
        let url = format!("{}/models", self.base_url);
        
        match self.client.get(&url).send().await {
            Ok(response) => {
                if response.status().is_success() {
                    match response.json::<serde_json::Value>().await {
                        Ok(models_json) => {
                            if let Some(models_array) = models_json.get("models").and_then(|m| m.as_array()) {
                                let models: Vec<String> = models_array
                                    .iter()
                                    .filter_map(|m| m.as_str().map(|s| s.to_string()))
                                    .collect();
                                
                                info!("Retrieved {} available models", models.len());
                                Ok(models)
                            } else {
                                error!("Invalid models response format");
                                Err("Invalid models response format".to_string())
                            }
                        },
                        Err(err) => {
                            error!("Failed to parse models response: {}", err);
                            Err(format!("Failed to parse models response: {}", err))
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
                error!("Failed to get available models: {}", err);
                Err(format!("Failed to get available models: {}", err))
            }
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
        debug!("Prompt: {}", prompt);
        
        // Simulate processing delay
        tokio::time::sleep(Duration::from_millis(500)).await;
        
        // Extract model from parameters if available
        let model = parameters.as_ref()
            .and_then(|p| p.get("model"))
            .and_then(|m| m.as_str())
            .unwrap_or("default-mock-model");
        
        // Create mock response
        let response = serde_json::json!({
            "text": format!("Mock AI response for prompt: {}", prompt),
            "confidence": 0.95,
            "task_id": task_id,
            "mode": mode.unwrap_or("Normal"),
            "persona": persona.unwrap_or("technical_expert"),
            "parameters": parameters,
            "model_used": model,
            "tokens_used": prompt.len() / 4, // Simulate token count
        });
        
        Ok(response)
    }
    
    /// Sends a streaming request to the mock AI service
    pub async fn send_streaming_request(
        &self,
        task_id: &str,
        prompt: &str,
        mode: Option<&str>,
        persona: Option<&str>,
        parameters: Option<HashMap<String, serde_json::Value>>,
        callback: impl Fn(&str) + Send + Sync + 'static,
    ) -> Result<serde_json::Value, String> {
        info!("Sending mock streaming AI request for task: {}", task_id);
        
        // Split the prompt into words to simulate streaming
        let words: Vec<&str> = prompt.split_whitespace().collect();
        
        // Stream each word with a delay
        for word in words {
            // Simulate processing delay
            tokio::time::sleep(Duration::from_millis(100)).await;
            
            // Call the callback with the word
            callback(&format!("{} ", word));
        }
        
        // Create final response
        let response = serde_json::json!({
            "text": prompt,
            "task_id": task_id,
            "streaming": true,
            "mode": mode.unwrap_or("Normal"),
            "persona": persona.unwrap_or("technical_expert"),
        });
        
        Ok(response)
    }
    
    /// Checks the health of the mock AI service
    pub async fn check_health(&self) -> bool {
        true
    }
    
    /// Gets available models from the mock AI service
    pub async fn get_available_models(&self) -> Result<Vec<String>, String> {
        Ok(vec![
            "mock-gpt-3".to_string(),
            "mock-gpt-4".to_string(),
            "mock-llama-3".to_string(),
            "mock-claude-3".to_string(),
        ])
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
        parameters.insert("model".to_string(), serde_json::json!("mock-gpt-4"));
        
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
        assert_eq!(response["model_used"], "mock-gpt-4");
    }
    
    #[tokio::test]
    async fn test_mock_streaming() {
        let client = MockAiServiceClient::new();
        
        let mut received_chunks = Vec::new();
        let callback = |chunk: &str| {
            received_chunks.push(chunk.to_string());
        };
        
        let result = client.send_streaming_request(
            "test_streaming",
            "This is a test streaming prompt",
            None,
            None,
            None,
            callback,
        ).await;
        
        assert!(result.is_ok());
        assert!(!received_chunks.is_empty());
        
        // Join all chunks and compare with original prompt
        let joined = received_chunks.join("");
        assert_eq!(joined.trim(), "This is a test streaming prompt");
    }
    
    #[tokio::test]
    async fn test_mock_models() {
        let client = MockAiServiceClient::new();
        let models = client.get_available_models().await.unwrap();
        
        assert_eq!(models.len(), 4);
        assert!(models.contains(&"mock-gpt-4".to_string()));
    }
}
