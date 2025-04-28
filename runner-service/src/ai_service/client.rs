use std::collections::HashMap;
use std::sync::Arc;
use log::{info, error, warn, debug};
use reqwest::{Client, StatusCode};
use serde_json::{json, Value};
use tokio::time::{timeout, Duration};
use serde::{Serialize, Deserialize};

/// AI Service client for interacting with the AI Orchestrator
#[derive(Clone)] // Added Clone trait
pub struct AiServiceClient {
    pub base_url: String, // Made public
    client: Client,
    pub timeout_seconds: u64, // Made public
}

/// AI Task Processor for processing AI tasks
#[derive(Clone)] // Added Clone trait
pub struct AiTaskProcessor {
    client: AiServiceClient,
}

impl AiServiceClient {
    /// Creates a new AI Service client
    pub fn new(base_url: String, timeout_seconds: u64) -> Self {
        AiServiceClient {
            base_url,
            client: Client::new(),
            timeout_seconds,
        }
    }
    
    /// Sends a request to the AI Service
    pub async fn send_request(
        &self,
        request_id: &str,
        prompt: &str,
        mode: Option<&str>,
        persona: Option<&str>,
        parameters: Option<HashMap<String, Value>>,
    ) -> Result<Value, String> {
        info!("Sending request to AI Service: {}", request_id);
        
        // Build request body
        let mut body = json!({
            "request_id": request_id,
            "prompt": prompt,
        });
        
        // Add optional fields
        if let Some(mode_str) = mode {
            body["mode"] = json!(mode_str);
        }
        
        if let Some(persona_str) = persona {
            body["persona"] = json!(persona_str);
        }
        
        if let Some(params) = parameters {
            body["parameters"] = json!(params);
        }
        
        // Send request with timeout
        match timeout(
            Duration::from_secs(self.timeout_seconds),
            self.client.post(&format!("{}/api/v1/generate", self.base_url))
                .json(&body)
                .send()
        ).await {
            Ok(result) => {
                match result {
                    Ok(response) => {
                        let status = response.status();
                        
                        if status.is_success() {
                            match response.json::<Value>().await {
                                Ok(json_response) => {
                                    info!("Received successful response from AI Service for request: {}", request_id);
                                    Ok(json_response)
                                },
                                Err(err) => {
                                    error!("Failed to parse JSON response from AI Service: {}", err);
                                    Err(format!("Failed to parse JSON response: {}", err))
                                }
                            }
                        } else {
                            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                            error!("AI Service returned error status {}: {}", status, error_text);
                            Err(format!("AI Service returned error status {}: {}", status, error_text))
                        }
                    },
                    Err(err) => {
                        error!("Failed to send request to AI Service: {}", err);
                        Err(format!("Failed to send request to AI Service: {}", err))
                    }
                }
            },
            Err(_) => {
                error!("Request to AI Service timed out after {} seconds", self.timeout_seconds);
                Err(format!("Request timed out after {} seconds", self.timeout_seconds))
            }
        }
    }
    
    /// Checks the health of the AI Service
    pub async fn check_health(&self) -> Result<bool, String> {
        info!("Checking AI Service health");
        
        match timeout(
            Duration::from_secs(5),
            self.client.get(&format!("{}/health", self.base_url)).send()
        ).await {
            Ok(result) => {
                match result {
                    Ok(response) => {
                        let status = response.status();
                        
                        if status.is_success() {
                            info!("AI Service is healthy");
                            Ok(true)
                        } else {
                            warn!("AI Service health check failed with status: {}", status);
                            Ok(false)
                        }
                    },
                    Err(err) => {
                        error!("Failed to send health check request: {}", err);
                        Err(format!("Failed to send health check request: {}", err))
                    }
                }
            },
            Err(_) => {
                error!("Health check request timed out");
                Err("Health check request timed out".to_string())
            }
        }
    }
    
    /// Gets available models from the AI Service
    pub async fn get_available_models(&self) -> Result<Vec<String>, String> {
        info!("Getting available models from AI Service");
        
        match timeout(
            Duration::from_secs(5),
            self.client.get(&format!("{}/api/v1/models", self.base_url)).send()
        ).await {
            Ok(result) => {
                match result {
                    Ok(response) => {
                        let status = response.status();
                        
                        if status.is_success() {
                            match response.json::<Value>().await {
                                Ok(json_response) => {
                                    if let Some(models) = json_response.get("models").and_then(|m| m.as_array()) {
                                        let model_names: Vec<String> = models.iter()
                                            .filter_map(|m| m.as_str().map(|s| s.to_string()))
                                            .collect();
                                        
                                        info!("Received {} available models from AI Service", model_names.len());
                                        Ok(model_names)
                                    } else {
                                        error!("Invalid response format from AI Service: models field not found or not an array");
                                        Err("Invalid response format: models field not found or not an array".to_string())
                                    }
                                },
                                Err(err) => {
                                    error!("Failed to parse JSON response from AI Service: {}", err);
                                    Err(format!("Failed to parse JSON response: {}", err))
                                }
                            }
                        } else {
                            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                            error!("AI Service returned error status {}: {}", status, error_text);
                            Err(format!("AI Service returned error status {}: {}", status, error_text))
                        }
                    },
                    Err(err) => {
                        error!("Failed to send request to AI Service: {}", err);
                        Err(format!("Failed to send request to AI Service: {}", err))
                    }
                }
            },
            Err(_) => {
                error!("Request to AI Service timed out");
                Err("Request timed out".to_string())
            }
        }
    }
}

impl AiTaskProcessor {
    /// Creates a new AI Task Processor
    pub fn new(base_url: String, timeout_seconds: u64) -> Self {
        AiTaskProcessor {
            client: AiServiceClient::new(base_url, timeout_seconds),
        }
    }
    
    /// Processes an AI task
    pub async fn process_task(
        &self,
        task_id: &str,
        prompt: &str,
        mode: Option<&str>,
        persona: Option<&str>,
        parameters: Option<serde_json::Map<String, Value>>,
    ) -> Result<Value, String> {
        info!("Processing AI task: {}", task_id);
        
        // Convert parameters to HashMap if provided
        let params = parameters.map(|p| {
            let mut map = HashMap::new();
            for (k, v) in p {
                map.insert(k, v);
            }
            map
        });
        
        // Send request to AI Service
        self.client.send_request(task_id, prompt, mode, persona, params).await
    }
    
    /// Checks if the AI Service is available
    pub async fn is_available(&self) -> bool {
        match self.client.check_health().await {
            Ok(healthy) => healthy,
            Err(_) => false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockito::{mock, server_url};
    use tokio;
    
    #[tokio::test]
    async fn test_send_request_success() {
        let mock_server = mock("POST", "/api/v1/generate")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"text": "AI generated response", "model_used": "test-model", "tokens_used": 10}"#)
            .create();
        
        let client = AiServiceClient::new(server_url(), 5);
        
        let result = client.send_request(
            "test-request",
            "Test prompt",
            Some("Normal"),
            Some("tester"),
            None,
        ).await;
        
        mock_server.assert();
        
        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response["text"], "AI generated response");
        assert_eq!(response["model_used"], "test-model");
        assert_eq!(response["tokens_used"], 10);
    }
    
    #[tokio::test]
    async fn test_send_request_error() {
        let mock_server = mock("POST", "/api/v1/generate")
            .with_status(400)
            .with_header("content-type", "application/json")
            .with_body(r#"{"error": "Invalid request"}"#)
            .create();
        
        let client = AiServiceClient::new(server_url(), 5);
        
        let result = client.send_request(
            "test-request",
            "Test prompt",
            None,
            None,
            None,
        ).await;
        
        mock_server.assert();
        
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("400"));
    }
    
    #[tokio::test]
    async fn test_check_health() {
        let mock_server = mock("GET", "/health")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"status": "ok"}"#)
            .create();
        
        let client = AiServiceClient::new(server_url(), 5);
        
        let result = client.check_health().await;
        
        mock_server.assert();
        
        assert!(result.is_ok());
        assert!(result.unwrap());
    }
    
    #[tokio::test]
    async fn test_get_available_models() {
        let mock_server = mock("GET", "/api/v1/models")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"models": ["model1", "model2", "model3"]}"#)
            .create();
        
        let client = AiServiceClient::new(server_url(), 5);
        
        let result = client.get_available_models().await;
        
        mock_server.assert();
        
        assert!(result.is_ok());
        let models = result.unwrap();
        assert_eq!(models.len(), 3);
        assert!(models.contains(&"model1".to_string()));
        assert!(models.contains(&"model2".to_string()));
        assert!(models.contains(&"model3".to_string()));
    }
}
