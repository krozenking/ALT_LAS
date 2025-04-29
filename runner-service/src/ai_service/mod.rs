use actix_web::{web, HttpResponse, Responder};
use log::{info, error, debug};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::alt_file::{models::AltFile, parser::AltParser};
use crate::last_file::{LastFile, LastFileGenerator, TaskResult, TaskStatus};

/// Configuration for the AI service
#[derive(Clone, Debug)]
pub struct AiServiceConfig {
    /// Base URL for the AI service
    pub base_url: String,
    /// API key for authentication
    pub api_key: Option<String>,
    /// Timeout in seconds
    pub timeout_seconds: u32,
    /// Maximum number of retries
    pub max_retries: u8,
    /// Whether to use streaming mode
    pub use_streaming: bool,
    /// Model to use
    pub model: String,
    /// Temperature parameter
    pub temperature: f32,
    /// Maximum tokens to generate
    pub max_tokens: Option<u32>,
}

impl Default for AiServiceConfig {
    fn default() -> Self {
        AiServiceConfig {
            base_url: "http://localhost:8000".to_string(),
            api_key: None,
            timeout_seconds: 60,
            max_retries: 3,
            use_streaming: false,
            model: "default".to_string(),
            temperature: 0.7,
            max_tokens: None,
        }
    }
}

/// AI service client
#[derive(Clone)]
pub struct AiServiceClient {
    /// HTTP client
    client: reqwest::Client,
    /// Configuration
    config: AiServiceConfig,
}

impl AiServiceClient {
    /// Creates a new AI service client
    pub fn new(config: AiServiceConfig) -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds as u64))
            .build()
            .unwrap_or_default();
            
        AiServiceClient {
            client,
            config,
        }
    }
    
    /// Executes a task using the AI service
    pub async fn execute_task(&self, task: &crate::alt_file::models::Task) -> Result<TaskResult, String> {
        debug!("Executing task {} with AI service", task.id);
        
        // Create request payload
        let payload = serde_json::json!({
            "task_id": task.id,
            "description": task.description,
            "parameters": task.parameters,
            "model": self.config.model,
            "temperature": self.config.temperature,
            "max_tokens": self.config.max_tokens,
            "stream": self.config.use_streaming,
        });
        
        // Start timing
        let start_time = std::time::Instant::now();
        
        // Initialize retry counter
        let mut retry_count = 0;
        let mut last_error = String::new();
        
        // Retry loop
        while retry_count <= self.config.max_retries {
            if retry_count > 0 {
                debug!("Retrying task {} (attempt {}/{})", task.id, retry_count, self.config.max_retries);
            }
            
            // Build request
            let mut request_builder = self.client.post(format!("{}/execute", self.config.base_url))
                .json(&payload);
                
            // Add API key if available
            if let Some(api_key) = &self.config.api_key {
                request_builder = request_builder.header("Authorization", format!("Bearer {}", api_key));
            }
            
            // Send request
            match request_builder.send().await {
                Ok(response) => {
                    // Check status code
                    if response.status().is_success() {
                        // Parse response
                        match response.json::<serde_json::Value>().await {
                            Ok(json) => {
                                // Calculate execution time
                                let execution_time = start_time.elapsed().as_millis() as u64;
                                
                                // Create task result
                                let result = TaskResult {
                                    task_id: task.id.clone(),
                                    status: TaskStatus::Completed,
                                    output: Some(json),
                                    error: None,
                                    execution_time_ms: execution_time,
                                    retry_count,
                                    artifacts: None,
                                    metadata: None,
                                };
                                
                                debug!("Task {} completed successfully in {}ms", task.id, execution_time);
                                return Ok(result);
                            }
                            Err(e) => {
                                last_error = format!("Failed to parse response: {}", e);
                                error!("{}", last_error);
                            }
                        }
                    } else {
                        // Handle error response
                        let status = response.status();
                        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                        last_error = format!("API error ({}): {}", status, error_text);
                        error!("{}", last_error);
                    }
                }
                Err(e) => {
                    last_error = format!("Request error: {}", e);
                    error!("{}", last_error);
                }
            }
            
            // Increment retry counter
            retry_count += 1;
            
            // Wait before retrying (exponential backoff)
            if retry_count <= self.config.max_retries {
                let backoff_ms = 1000 * (2_u64.pow(retry_count as u32 - 1));
                debug!("Waiting {}ms before retry", backoff_ms);
                tokio::time::sleep(std::time::Duration::from_millis(backoff_ms)).await;
            }
        }
        
        // All retries failed
        let execution_time = start_time.elapsed().as_millis() as u64;
        
        // Create failed task result
        let result = TaskResult {
            task_id: task.id.clone(),
            status: TaskStatus::Failed,
            output: None,
            error: Some(last_error),
            execution_time_ms: execution_time,
            retry_count,
            artifacts: None,
            metadata: None,
        };
        
        error!("Task {} failed after {} retries in {}ms", task.id, retry_count, execution_time);
        Ok(result)
    }
}

/// Request for executing an ALT file
#[derive(Debug, Deserialize)]
pub struct ExecuteAltRequest {
    /// Path to the ALT file
    pub alt_file_path: Option<String>,
    /// ALT file content (alternative to path)
    pub alt_file_content: Option<String>,
    /// AI model to use
    pub model: Option<String>,
    /// Temperature parameter
    pub temperature: Option<f32>,
    /// Maximum tokens to generate
    pub max_tokens: Option<u32>,
    /// Whether to use streaming mode
    pub stream: Option<bool>,
}

/// Response for ALT file execution
#[derive(Debug, Serialize)]
pub struct ExecuteAltResponse {
    /// ID of the LAST file
    pub last_file_id: String,
    /// Path to the LAST file
    pub last_file_path: String,
    /// Path to the HTML report
    pub report_path: String,
    /// Success rate (0.0 to 1.0)
    pub success_rate: f64,
    /// Total execution time in milliseconds
    pub execution_time_ms: u64,
    /// Number of tasks executed
    pub task_count: usize,
    /// Number of successful tasks
    pub successful_tasks: usize,
    /// Number of failed tasks
    pub failed_tasks: usize,
}

/// AI service state
pub struct AiServiceState {
    /// AI service client
    pub client: AiServiceClient,
    /// ALT parser
    pub alt_parser: AltParser,
    /// LAST file generator
    pub last_generator: LastFileGenerator,
    /// Output directory for LAST files
    pub output_dir: PathBuf,
}

/// Initializes the AI service routes
pub fn init_routes(cfg: &mut web::ServiceConfig, state: Arc<Mutex<AiServiceState>>) {
    cfg.app_data(web::Data::new(state.clone()))
        .route("/execute", web::post().to(execute_alt_file));
}

/// Handler for executing an ALT file
async fn execute_alt_file(
    req: web::Json<ExecuteAltRequest>,
    state: web::Data<Arc<Mutex<AiServiceState>>>,
) -> impl Responder {
    info!("Received request to execute ALT file");
    
    // Get state
    let state_guard = state.lock().await;
    
    // Parse ALT file
    let alt_file = match parse_alt_file_from_request(&req, &state_guard.alt_parser).await {
        Ok(file) => file,
        Err(e) => {
            error!("Failed to parse ALT file: {}", e);
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": format!("Failed to parse ALT file: {}", e)
            }));
        }
    };
    
    info!("Executing ALT file with ID: {}", alt_file.id);
    
    // Create AI service client with custom configuration
    let client = create_client_from_request(&req, &state_guard.client);
    
    // Execute tasks
    let task_results = execute_tasks(&alt_file, &client).await;
    
    // Generate LAST file
    match state_guard.last_generator.generate(&alt_file, task_results) {
        Ok(last_file) => {
            // Create response
            let successful_tasks = last_file.get_successful_tasks().len();
            let failed_tasks = last_file.get_failed_tasks().len();
            
            let response = ExecuteAltResponse {
                last_file_id: last_file.id.clone(),
                last_file_path: format!("{}/{}/result.last", state_guard.output_dir.display(), last_file.id),
                report_path: format!("{}/{}/report.html", state_guard.output_dir.display(), last_file.id),
                success_rate: last_file.success_rate,
                execution_time_ms: last_file.total_execution_time_ms,
                task_count: last_file.task_results.len(),
                successful_tasks,
                failed_tasks,
            };
            
            info!("ALT file execution completed: {} tasks, {}% success rate", 
                  response.task_count, response.success_rate * 100.0);
                  
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            error!("Failed to generate LAST file: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to generate LAST file: {}", e)
            }))
        }
    }
}

/// Parses an ALT file from the request
async fn parse_alt_file_from_request(
    req: &ExecuteAltRequest,
    parser: &AltParser,
) -> Result<AltFile, String> {
    // Check if we have a path or content
    if let Some(path) = &req.alt_file_path {
        // Parse from path
        parser.parse_from_path(path)
            .map_err(|e| format!("Failed to parse ALT file from path: {}", e))
    } else if let Some(content) = &req.alt_file_content {
        // Parse from content
        parser.parse_from_string(content)
            .map_err(|e| format!("Failed to parse ALT file from content: {}", e))
    } else {
        Err("Either alt_file_path or alt_file_content must be provided".to_string())
    }
}

/// Creates an AI service client from the request
fn create_client_from_request(
    req: &ExecuteAltRequest,
    default_client: &AiServiceClient,
) -> AiServiceClient {
    // Start with the default configuration
    let mut config = default_client.config.clone();
    
    // Update with request parameters
    if let Some(model) = &req.model {
        config.model = model.clone();
    }
    
    if let Some(temperature) = req.temperature {
        config.temperature = temperature;
    }
    
    if let Some(max_tokens) = req.max_tokens {
        config.max_tokens = Some(max_tokens);
    }
    
    if let Some(stream) = req.stream {
        config.use_streaming = stream;
    }
    
    // Create new client
    AiServiceClient::new(config)
}

/// Executes all tasks in an ALT file
async fn execute_tasks(
    alt_file: &AltFile,
    client: &AiServiceClient,
) -> Vec<TaskResult> {
    info!("Executing {} tasks from ALT file {}", alt_file.tasks.len(), alt_file.id);
    
    let mut results = Vec::new();
    
    // Get root tasks (tasks with no dependencies)
    let root_tasks = alt_file.get_root_tasks();
    
    // Execute tasks in dependency order
    let mut executed_tasks = std::collections::HashSet::new();
    
    // Start with root tasks
    let mut task_queue: Vec<&crate::alt_file::models::Task> = root_tasks;
    
    while !task_queue.is_empty() {
        // Get next task
        let task = task_queue.remove(0);
        
        // Skip if already executed
        if executed_tasks.contains(&task.id) {
            continue;
        }
        
        // Check if all dependencies are executed
        if let Some(deps) = &task.dependencies {
            let all_deps_executed = deps.iter().all(|dep| executed_tasks.contains(dep));
            
            if !all_deps_executed {
                // Put back in queue and continue
                task_queue.push(task);
                continue;
            }
        }
        
        // Execute task
        info!("Executing task: {}", task.id);
        let result = client.execute_task(task).await.unwrap_or_else(|e| {
            error!("Failed to execute task {}: {}", task.id, e);
            
            // Create failed task result
            TaskResult {
                task_id: task.id.clone(),
                status: TaskStatus::Failed,
                output: None,
                error: Some(e),
                execution_time_ms: 0,
                retry_count: 0,
                artifacts: None,
                metadata: None,
            }
        });
        
        // Add to results
        results.push(result);
        
        // Mark as executed
        executed_tasks.insert(task.id.clone());
        
        // Add dependent tasks to queue
        let dependent_tasks = alt_file.get_dependent_tasks(&task.id);
        for dep_task in dependent_tasks {
            if !task_queue.contains(&dep_task) {
                task_queue.push(dep_task);
            }
        }
    }
    
    info!("Completed execution of {} tasks from ALT file {}", results.len(), alt_file.id);
    results
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::parser::create_sample_alt_file;
    use mockito::{mock, server_url};
    use tempfile::TempDir;
    
    #[tokio::test]
    async fn test_execute_task_success() {
        // Setup mock server
        let _m = mock("POST", "/execute")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"result": "Task executed successfully"}"#)
            .create();
            
        // Create AI service client
        let config = AiServiceConfig {
            base_url: server_url(),
            ..Default::default()
        };
        let client = AiServiceClient::new(config);
        
        // Create task
        let task = crate::alt_file::models::Task {
            id: "test_task".to_string(),
            description: "Test task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        // Execute task
        let result = client.execute_task(&task).await.unwrap();
        
        // Check result
        assert_eq!(result.task_id, "test_task");
        assert_eq!(result.status, TaskStatus::Completed);
        assert!(result.output.is_some());
        assert!(result.error.is_none());
    }
    
    #[tokio::test]
    async fn test_execute_task_failure() {
        // Setup mock server
        let _m = mock("POST", "/execute")
            .with_status(500)
            .with_header("content-type", "application/json")
            .with_body(r#"{"error": "Internal server error"}"#)
            .create();
            
        // Create AI service client
        let config = AiServiceConfig {
            base_url: server_url(),
            max_retries: 1, // Set low for testing
            ..Default::default()
        };
        let client = AiServiceClient::new(config);
        
        // Create task
        let task = crate::alt_file::models::Task {
            id: "test_task".to_string(),
            description: "Test task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        // Execute task
        let result = client.execute_task(&task).await.unwrap();
        
        // Check result
        assert_eq!(result.task_id, "test_task");
        assert_eq!(result.status, TaskStatus::Failed);
        assert!(result.output.is_none());
        assert!(result.error.is_some());
        assert_eq!(result.retry_count, 2); // Initial attempt + 1 retry
    }
    
    #[tokio::test]
    async fn test_execute_tasks_dependency_order() {
        // Setup mock server for all tasks
        let _m1 = mock("POST", "/execute")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(r#"{"result": "Task executed successfully"}"#)
            .expect(3) // Expect 3 calls (one for each task)
            .create();
            
        // Create AI service client
        let config = AiServiceConfig {
            base_url: server_url(),
            ..Default::default()
        };
        let client = AiServiceClient::new(config);
        
        // Create ALT file with dependencies
        let alt_file = create_sample_alt_file();
        
        // Execute tasks
        let results = execute_tasks(&alt_file, &client).await;
        
        // Check results
        assert_eq!(results.len(), 3);
        
        // Check execution order via task IDs
        assert_eq!(results[0].task_id, "task1");
        assert_eq!(results[1].task_id, "task2");
        assert_eq!(results[2].task_id, "task3");
    }
    
    #[tokio::test]
    async fn test_parse_alt_file_from_request() {
        // Create temp file
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.alt");
        
        // Create sample ALT file
        let alt_file = create_sample_alt_file();
        let json = serde_json::to_string(&alt_file).unwrap();
        std::fs::write(&file_path, &json).unwrap();
        
        // Create parser
        let parser = AltParser::new();
        
        // Test parsing from path
        let req = ExecuteAltRequest {
            alt_file_path: Some(file_path.to_string_lossy().to_string()),
            alt_file_content: None,
            model: None,
            temperature: None,
            max_tokens: None,
            stream: None,
        };
        
        let parsed = parse_alt_file_from_request(&req, &parser).await.unwrap();
        assert_eq!(parsed.id, alt_file.id);
        
        // Test parsing from content
        let req = ExecuteAltRequest {
            alt_file_path: None,
            alt_file_content: Some(json),
            model: None,
            temperature: None,
            max_tokens: None,
            stream: None,
        };
        
        let parsed = parse_alt_file_from_request(&req, &parser).await.unwrap();
        assert_eq!(parsed.id, alt_file.id);
        
        // Test error when neither path nor content is provided
        let req = ExecuteAltRequest {
            alt_file_path: None,
            alt_file_content: None,
            model: None,
            temperature: None,
            max_tokens: None,
            stream: None,
        };
        
        let result = parse_alt_file_from_request(&req, &parser).await;
        assert!(result.is_err());
    }
}
