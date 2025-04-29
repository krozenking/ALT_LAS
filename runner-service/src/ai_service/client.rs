use reqwest::{Client, ClientBuilder, Response, Error as ReqwestError};
use serde::{Serialize, Deserialize};
use std::time::Duration;
use log::{info, warn, debug, error};
use async_trait::async_trait;
use std::collections::HashMap;
use serde_json::Value;

/// Represents an AI service provider
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AiProvider {
    OpenAI,
    Anthropic,
    MistralAI,
    Local,
    Custom(String),
}

/// Configuration for AI service client
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiClientConfig {
    /// The AI service provider
    pub provider: AiProvider,
    /// Base URL for the API
    pub base_url: String,
    /// API key for authentication
    pub api_key: String,
    /// Organization ID (if applicable)
    pub org_id: Option<String>,
    /// Timeout in seconds
    pub timeout_seconds: u64,
    /// Maximum number of retries
    pub max_retries: u8,
    /// Rate limit (requests per minute)
    pub rate_limit: Option<u32>,
    /// Additional headers
    pub headers: Option<HashMap<String, String>>,
    /// Additional parameters
    pub parameters: Option<HashMap<String, Value>>,
}

impl Default for AiClientConfig {
    fn default() -> Self {
        Self {
            provider: AiProvider::OpenAI,
            base_url: "https://api.openai.com/v1".to_string(),
            api_key: "".to_string(),
            org_id: None,
            timeout_seconds: 30,
            max_retries: 3,
            rate_limit: Some(60),
            headers: None,
            parameters: None,
        }
    }
}

/// Request to an AI model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiRequest {
    /// The model to use
    pub model: String,
    /// The prompt or messages
    pub prompt: String,
    /// Maximum number of tokens to generate
    pub max_tokens: Option<u32>,
    /// Temperature (0.0 - 2.0)
    pub temperature: Option<f32>,
    /// Top-p sampling (0.0 - 1.0)
    pub top_p: Option<f32>,
    /// Frequency penalty (0.0 - 2.0)
    pub frequency_penalty: Option<f32>,
    /// Presence penalty (0.0 - 2.0)
    pub presence_penalty: Option<f32>,
    /// Stop sequences
    pub stop: Option<Vec<String>>,
    /// Additional parameters
    pub parameters: Option<HashMap<String, Value>>,
}

/// Response from an AI model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiResponse {
    /// The generated text
    pub text: String,
    /// The model used
    pub model: String,
    /// Usage information
    pub usage: Option<AiUsage>,
    /// Additional metadata
    pub metadata: Option<HashMap<String, Value>>,
}

/// Usage information for an AI response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiUsage {
    /// Number of prompt tokens
    pub prompt_tokens: u32,
    /// Number of completion tokens
    pub completion_tokens: u32,
    /// Total number of tokens
    pub total_tokens: u32,
}

/// Error from an AI service
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiError {
    /// Error code
    pub code: String,
    /// Error message
    pub message: String,
    /// HTTP status code
    pub status_code: Option<u16>,
    /// Additional details
    pub details: Option<HashMap<String, Value>>,
}

/// Trait for AI service clients
#[async_trait]
pub trait AiClient: Send + Sync {
    /// Sends a request to the AI service
    async fn send_request(&self, request: AiRequest) -> Result<AiResponse, AiError>;
    
    /// Gets the configuration for the client
    fn get_config(&self) -> &AiClientConfig;
    
    /// Sets the configuration for the client
    fn set_config(&mut self, config: AiClientConfig);
}

/// Implementation of AiClient for OpenAI
pub struct OpenAiClient {
    config: AiClientConfig,
    client: Client,
}

impl OpenAiClient {
    /// Creates a new OpenAI client
    pub fn new(config: AiClientConfig) -> Result<Self, ReqwestError> {
        let client = ClientBuilder::new()
            .timeout(Duration::from_secs(config.timeout_seconds))
            .build()?;
        
        Ok(Self {
            config,
            client,
        })
    }
    
    /// Converts an AiRequest to an OpenAI-specific request
    fn convert_request(&self, request: &AiRequest) -> Value {
        let mut openai_request = serde_json::Map::new();
        
        openai_request.insert("model".to_string(), Value::String(request.model.clone()));
        
        // For chat models
        if request.model.contains("gpt") {
            let mut messages = Vec::new();
            let mut message = serde_json::Map::new();
            message.insert("role".to_string(), Value::String("user".to_string()));
            message.insert("content".to_string(), Value::String(request.prompt.clone()));
            messages.push(Value::Object(message));
            
            openai_request.insert("messages".to_string(), Value::Array(messages));
        } else {
            // For completion models
            openai_request.insert("prompt".to_string(), Value::String(request.prompt.clone()));
        }
        
        if let Some(max_tokens) = request.max_tokens {
            openai_request.insert("max_tokens".to_string(), Value::Number(max_tokens.into()));
        }
        
        if let Some(temperature) = request.temperature {
            openai_request.insert("temperature".to_string(), Value::Number(serde_json::Number::from_f64(temperature as f64).unwrap()));
        }
        
        if let Some(top_p) = request.top_p {
            openai_request.insert("top_p".to_string(), Value::Number(serde_json::Number::from_f64(top_p as f64).unwrap()));
        }
        
        if let Some(frequency_penalty) = request.frequency_penalty {
            openai_request.insert("frequency_penalty".to_string(), Value::Number(serde_json::Number::from_f64(frequency_penalty as f64).unwrap()));
        }
        
        if let Some(presence_penalty) = request.presence_penalty {
            openai_request.insert("presence_penalty".to_string(), Value::Number(serde_json::Number::from_f64(presence_penalty as f64).unwrap()));
        }
        
        if let Some(stop) = &request.stop {
            let stop_values: Vec<Value> = stop.iter().map(|s| Value::String(s.clone())).collect();
            openai_request.insert("stop".to_string(), Value::Array(stop_values));
        }
        
        if let Some(parameters) = &request.parameters {
            for (key, value) in parameters {
                openai_request.insert(key.clone(), value.clone());
            }
        }
        
        Value::Object(openai_request)
    }
    
    /// Parses an OpenAI response into an AiResponse
    fn parse_response(&self, response: Value) -> Result<AiResponse, AiError> {
        // Check if the response contains an error
        if let Some(error) = response.get("error") {
            let code = error.get("code").and_then(|c| c.as_str()).unwrap_or("unknown_error").to_string();
            let message = error.get("message").and_then(|m| m.as_str()).unwrap_or("Unknown error").to_string();
            
            return Err(AiError {
                code,
                message,
                status_code: None,
                details: None,
            });
        }
        
        // Extract the generated text
        let text = if let Some(choices) = response.get("choices") {
            if let Some(choice) = choices.get(0) {
                if let Some(message) = choice.get("message") {
                    message.get("content").and_then(|c| c.as_str()).unwrap_or("").to_string()
                } else {
                    choice.get("text").and_then(|t| t.as_str()).unwrap_or("").to_string()
                }
            } else {
                return Err(AiError {
                    code: "no_choices".to_string(),
                    message: "No choices in response".to_string(),
                    status_code: None,
                    details: None,
                });
            }
        } else {
            return Err(AiError {
                code: "invalid_response".to_string(),
                message: "Invalid response format".to_string(),
                status_code: None,
                details: None,
            });
        };
        
        // Extract usage information
        let usage = if let Some(usage_obj) = response.get("usage") {
            let prompt_tokens = usage_obj.get("prompt_tokens").and_then(|t| t.as_u64()).unwrap_or(0) as u32;
            let completion_tokens = usage_obj.get("completion_tokens").and_then(|t| t.as_u64()).unwrap_or(0) as u32;
            let total_tokens = usage_obj.get("total_tokens").and_then(|t| t.as_u64()).unwrap_or(0) as u32;
            
            Some(AiUsage {
                prompt_tokens,
                completion_tokens,
                total_tokens,
            })
        } else {
            None
        };
        
        // Extract model information
        let model = response.get("model").and_then(|m| m.as_str()).unwrap_or("unknown").to_string();
        
        Ok(AiResponse {
            text,
            model,
            usage,
            metadata: None,
        })
    }
}

#[async_trait]
impl AiClient for OpenAiClient {
    async fn send_request(&self, request: AiRequest) -> Result<AiResponse, AiError> {
        let openai_request = self.convert_request(&request);
        
        let endpoint = if request.model.contains("gpt") {
            "/chat/completions"
        } else {
            "/completions"
        };
        
        let url = format!("{}{}", self.config.base_url, endpoint);
        
        debug!("Sending request to OpenAI: {}", url);
        
        let response_result = self.client.post(&url)
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .json(&openai_request)
            .send()
            .await;
        
        match response_result {
            Ok(response) => {
                let status = response.status();
                
                if !status.is_success() {
                    let error_text = response.text().await.unwrap_or_else(|_| "Failed to read error response".to_string());
                    
                    error!("OpenAI API error: {} - {}", status, error_text);
                    
                    return Err(AiError {
                        code: format!("http_error_{}", status.as_u16()),
                        message: error_text,
                        status_code: Some(status.as_u16()),
                        details: None,
                    });
                }
                
                let response_json: Value = response.json().await.map_err(|e| {
                    error!("Failed to parse OpenAI response: {}", e);
                    
                    AiError {
                        code: "parse_error".to_string(),
                        message: format!("Failed to parse response: {}", e),
                        status_code: None,
                        details: None,
                    }
                })?;
                
                self.parse_response(response_json)
            },
            Err(e) => {
                error!("OpenAI API request failed: {}", e);
                
                Err(AiError {
                    code: "request_error".to_string(),
                    message: format!("Request failed: {}", e),
                    status_code: None,
                    details: None,
                })
            }
        }
    }
    
    fn get_config(&self) -> &AiClientConfig {
        &self.config
    }
    
    fn set_config(&mut self, config: AiClientConfig) {
        self.config = config;
    }
}

/// Implementation of AiClient for Anthropic
pub struct AnthropicClient {
    config: AiClientConfig,
    client: Client,
}

impl AnthropicClient {
    /// Creates a new Anthropic client
    pub fn new(config: AiClientConfig) -> Result<Self, ReqwestError> {
        let client = ClientBuilder::new()
            .timeout(Duration::from_secs(config.timeout_seconds))
            .build()?;
        
        Ok(Self {
            config,
            client,
        })
    }
    
    /// Converts an AiRequest to an Anthropic-specific request
    fn convert_request(&self, request: &AiRequest) -> Value {
        let mut anthropic_request = serde_json::Map::new();
        
        anthropic_request.insert("model".to_string(), Value::String(request.model.clone()));
        anthropic_request.insert("prompt".to_string(), Value::String(format!("\n\nHuman: {}\n\nAssistant:", request.prompt)));
        
        if let Some(max_tokens) = request.max_tokens {
            anthropic_request.insert("max_tokens_to_sample".to_string(), Value::Number(max_tokens.into()));
        }
        
        if let Some(temperature) = request.temperature {
            anthropic_request.insert("temperature".to_string(), Value::Number(serde_json::Number::from_f64(temperature as f64).unwrap()));
        }
        
        if let Some(top_p) = request.top_p {
            anthropic_request.insert("top_p".to_string(), Value::Number(serde_json::Number::from_f64(top_p as f64).unwrap()));
        }
        
        if let Some(stop) = &request.stop {
            let stop_values: Vec<Value> = stop.iter().map(|s| Value::String(s.clone())).collect();
            anthropic_request.insert("stop_sequences".to_string(), Value::Array(stop_values));
        }
        
        if let Some(parameters) = &request.parameters {
            for (key, value) in parameters {
                anthropic_request.insert(key.clone(), value.clone());
            }
        }
        
        Value::Object(anthropic_request)
    }
    
    /// Parses an Anthropic response into an AiResponse
    fn parse_response(&self, response: Value) -> Result<AiResponse, AiError> {
        // Check if the response contains an error
        if let Some(error) = response.get("error") {
            let code = error.get("type").and_then(|c| c.as_str()).unwrap_or("unknown_error").to_string();
            let message = error.get("message").and_then(|m| m.as_str()).unwrap_or("Unknown error").to_string();
            
            return Err(AiError {
                code,
                message,
                status_code: None,
                details: None,
            });
        }
        
        // Extract the generated text
        let text = response.get("completion").and_then(|t| t.as_str()).unwrap_or("").to_string();
        
        // Extract model information
        let model = response.get("model").and_then(|m| m.as_str()).unwrap_or("unknown").to_string();
        
        // Anthropic doesn't provide token usage, so we'll estimate it
        let prompt_length = response.get("prompt").and_then(|p| p.as_str()).map(|p| p.len()).unwrap_or(0) as u32;
        let completion_length = text.len() as u32;
        
        // Rough estimate: 1 token ≈ 4 characters
        let prompt_tokens = prompt_length / 4;
        let completion_tokens = completion_length / 4;
        let total_tokens = prompt_tokens + completion_tokens;
        
        let usage = Some(AiUsage {
            prompt_tokens,
            completion_tokens,
            total_tokens,
        });
        
        Ok(AiResponse {
            text,
            model,
            usage,
            metadata: None,
        })
    }
}

#[async_trait]
impl AiClient for AnthropicClient {
    async fn send_request(&self, request: AiRequest) -> Result<AiResponse, AiError> {
        let anthropic_request = self.convert_request(&request);
        
        let url = format!("{}/v1/complete", self.config.base_url);
        
        debug!("Sending request to Anthropic: {}", url);
        
        let response_result = self.client.post(&url)
            .header("Content-Type", "application/json")
            .header("X-API-Key", &self.config.api_key)
            .json(&anthropic_request)
            .send()
            .await;
        
        match response_result {
            Ok(response) => {
                let status = response.status();
                
                if !status.is_success() {
                    let error_text = response.text().await.unwrap_or_else(|_| "Failed to read error response".to_string());
                    
                    error!("Anthropic API error: {} - {}", status, error_text);
                    
                    return Err(AiError {
                        code: format!("http_error_{}", status.as_u16()),
                        message: error_text,
                        status_code: Some(status.as_u16()),
                        details: None,
                    });
                }
                
                let response_json: Value = response.json().await.map_err(|e| {
                    error!("Failed to parse Anthropic response: {}", e);
                    
                    AiError {
                        code: "parse_error".to_string(),
                        message: format!("Failed to parse response: {}", e),
                        status_code: None,
                        details: None,
                    }
                })?;
                
                self.parse_response(response_json)
            },
            Err(e) => {
                error!("Anthropic API request failed: {}", e);
                
                Err(AiError {
                    code: "request_error".to_string(),
                    message: format!("Request failed: {}", e),
                    status_code: None,
                    details: None,
                })
            }
        }
    }
    
    fn get_config(&self) -> &AiClientConfig {
        &self.config
    }
    
    fn set_config(&mut self, config: AiClientConfig) {
        self.config = config;
    }
}

/// Implementation of AiClient for Mistral AI
pub struct MistralAiClient {
    config: AiClientConfig,
    client: Client,
}

impl MistralAiClient {
    /// Creates a new Mistral AI client
    pub fn new(config: AiClientConfig) -> Result<Self, ReqwestError> {
        let client = ClientBuilder::new()
            .timeout(Duration::from_secs(config.timeout_seconds))
            .build()?;
        
        Ok(Self {
            config,
            client,
        })
    }
    
    /// Converts an AiRequest to a Mistral AI-specific request
    fn convert_request(&self, request: &AiRequest) -> Value {
        let mut mistral_request = serde_json::Map::new();
        
        mistral_request.insert("model".to_string(), Value::String(request.model.clone()));
        
        // For chat models
        let mut messages = Vec::new();
        let mut message = serde_json::Map::new();
        message.insert("role".to_string(), Value::String("user".to_string()));
        message.insert("content".to_string(), Value::String(request.prompt.clone()));
        messages.push(Value::Object(message));
        
        mistral_request.insert("messages".to_string(), Value::Array(messages));
        
        if let Some(max_tokens) = request.max_tokens {
            mistral_request.insert("max_tokens".to_string(), Value::Number(max_tokens.into()));
        }
        
        if let Some(temperature) = request.temperature {
            mistral_request.insert("temperature".to_string(), Value::Number(serde_json::Number::from_f64(temperature as f64).unwrap()));
        }
        
        if let Some(top_p) = request.top_p {
            mistral_request.insert("top_p".to_string(), Value::Number(serde_json::Number::from_f64(top_p as f64).unwrap()));
        }
        
        if let Some(parameters) = &request.parameters {
            for (key, value) in parameters {
                mistral_request.insert(key.clone(), value.clone());
            }
        }
        
        Value::Object(mistral_request)
    }
    
    /// Parses a Mistral AI response into an AiResponse
    fn parse_response(&self, response: Value) -> Result<AiResponse, AiError> {
        // Check if the response contains an error
        if let Some(error) = response.get("error") {
            let code = error.get("type").and_then(|c| c.as_str()).unwrap_or("unknown_error").to_string();
            let message = error.get("message").and_then(|m| m.as_str()).unwrap_or("Unknown error").to_string();
            
            return Err(AiError {
                code,
                message,
                status_code: None,
                details: None,
            });
        }
        
        // Extract the generated text
        let text = if let Some(choices) = response.get("choices") {
            if let Some(choice) = choices.get(0) {
                if let Some(message) = choice.get("message") {
                    message.get("content").and_then(|c| c.as_str()).unwrap_or("").to_string()
                } else {
                    "".to_string()
                }
            } else {
                return Err(AiError {
                    code: "no_choices".to_string(),
                    message: "No choices in response".to_string(),
                    status_code: None,
                    details: None,
                });
            }
        } else {
            return Err(AiError {
                code: "invalid_response".to_string(),
                message: "Invalid response format".to_string(),
                status_code: None,
                details: None,
            });
        };
        
        // Extract usage information
        let usage = if let Some(usage_obj) = response.get("usage") {
            let prompt_tokens = usage_obj.get("prompt_tokens").and_then(|t| t.as_u64()).unwrap_or(0) as u32;
            let completion_tokens = usage_obj.get("completion_tokens").and_then(|t| t.as_u64()).unwrap_or(0) as u32;
            let total_tokens = usage_obj.get("total_tokens").and_then(|t| t.as_u64()).unwrap_or(0) as u32;
            
            Some(AiUsage {
                prompt_tokens,
                completion_tokens,
                total_tokens,
            })
        } else {
            None
        };
        
        // Extract model information
        let model = response.get("model").and_then(|m| m.as_str()).unwrap_or("unknown").to_string();
        
        Ok(AiResponse {
            text,
            model,
            usage,
            metadata: None,
        })
    }
}

#[async_trait]
impl AiClient for MistralAiClient {
    async fn send_request(&self, request: AiRequest) -> Result<AiResponse, AiError> {
        let mistral_request = self.convert_request(&request);
        
        let url = format!("{}/v1/chat/completions", self.config.base_url);
        
        debug!("Sending request to Mistral AI: {}", url);
        
        let response_result = self.client.post(&url)
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .json(&mistral_request)
            .send()
            .await;
        
        match response_result {
            Ok(response) => {
                let status = response.status();
                
                if !status.is_success() {
                    let error_text = response.text().await.unwrap_or_else(|_| "Failed to read error response".to_string());
                    
                    error!("Mistral AI API error: {} - {}", status, error_text);
                    
                    return Err(AiError {
                        code: format!("http_error_{}", status.as_u16()),
                        message: error_text,
                        status_code: Some(status.as_u16()),
                        details: None,
                    });
                }
                
                let response_json: Value = response.json().await.map_err(|e| {
                    error!("Failed to parse Mistral AI response: {}", e);
                    
                    AiError {
                        code: "parse_error".to_string(),
                        message: format!("Failed to parse response: {}", e),
                        status_code: None,
                        details: None,
                    }
                })?;
                
                self.parse_response(response_json)
            },
            Err(e) => {
                error!("Mistral AI API request failed: {}", e);
                
                Err(AiError {
                    code: "request_error".to_string(),
                    message: format!("Request failed: {}", e),
                    status_code: None,
                    details: None,
                })
            }
        }
    }
    
    fn get_config(&self) -> &AiClientConfig {
        &self.config
    }
    
    fn set_config(&mut self, config: AiClientConfig) {
        self.config = config;
    }
}

/// Factory for creating AI clients
pub struct AiClientFactory;

impl AiClientFactory {
    /// Creates a new AI client based on the provider
    pub fn create_client(config: AiClientConfig) -> Result<Box<dyn AiClient>, AiError> {
        match config.provider {
            AiProvider::OpenAI => {
                OpenAiClient::new(config)
                    .map(|client| Box::new(client) as Box<dyn AiClient>)
                    .map_err(|e| AiError {
                        code: "client_creation_error".to_string(),
                        message: format!("Failed to create OpenAI client: {}", e),
                        status_code: None,
                        details: None,
                    })
            },
            AiProvider::Anthropic => {
                AnthropicClient::new(config)
                    .map(|client| Box::new(client) as Box<dyn AiClient>)
                    .map_err(|e| AiError {
                        code: "client_creation_error".to_string(),
                        message: format!("Failed to create Anthropic client: {}", e),
                        status_code: None,
                        details: None,
                    })
            },
            AiProvider::MistralAI => {
                MistralAiClient::new(config)
                    .map(|client| Box::new(client) as Box<dyn AiClient>)
                    .map_err(|e| AiError {
                        code: "client_creation_error".to_string(),
                        message: format!("Failed to create Mistral AI client: {}", e),
                        status_code: None,
                        details: None,
                    })
            },
            AiProvider::Local => {
                Err(AiError {
                    code: "not_implemented".to_string(),
                    message: "Local AI provider is not implemented yet".to_string(),
                    status_code: None,
                    details: None,
                })
            },
            AiProvider::Custom(name) => {
                Err(AiError {
                    code: "not_implemented".to_string(),
                    message: format!("Custom AI provider '{}' is not implemented", name),
                    status_code: None,
                    details: None,
                })
            },
        }
    }
}
