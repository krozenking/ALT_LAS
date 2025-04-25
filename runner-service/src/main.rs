use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use log::{info, error, warn};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

// Import our modules
mod alt_file;
mod task_manager;
mod ai_service;
mod last_file;
mod tests;

use alt_file::{AltFile, parse_alt_file, validate_alt_file};
use task_manager::{TaskScheduler, TaskExecutor};
use ai_service::{AiServiceClient, AiTaskProcessor};
use last_file::{LastFile, generate_last_file, write_last_file};

// Configuration for the Runner Service
struct RunnerConfig {
    output_dir: PathBuf,
    ai_service_url: String,
    ai_timeout_seconds: u64,
    max_concurrent_tasks: usize,
    use_mock_ai: bool,
}

impl Default for RunnerConfig {
    fn default() -> Self {
        RunnerConfig {
            output_dir: PathBuf::from("/tmp/runner-service/output"),
            ai_service_url: "http://ai-orchestrator:8000".to_string(),
            ai_timeout_seconds: 60,
            max_concurrent_tasks: 4,
            use_mock_ai: false,
        }
    }
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
}

#[derive(Deserialize)]
struct RunnerRequest {
    alt_file: String,
    mode: Option<String>,
    persona: Option<String>,
    metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Serialize)]
struct RunnerResponse {
    id: String,
    status: String,
    alt_file: String,
    last_file: String,
    metadata: HashMap<String, serde_json::Value>,
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(HealthResponse {
        status: "UP".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn index() -> impl Responder {
    HttpResponse::Ok().body("ALT_LAS Runner Service")
}

async fn run_task(
    req: web::Json<RunnerRequest>,
    config: web::Data<RunnerConfig>,
) -> impl Responder {
    info!("Received request to run task from ALT file content");
    
    // Parse the ALT file content
    let alt_file_result = parse_alt_file(&req.alt_file);
    
    if let Err(err) = alt_file_result {
        error!("Failed to parse ALT file: {:?}", err);
        return HttpResponse::BadRequest().body(format!("Failed to parse ALT file: {:?}", err));
    }
    
    let mut alt_file = alt_file_result.unwrap();
    
    // Override mode and persona if provided
    if let Some(mode_str) = &req.mode {
        match mode_str.to_lowercase().as_str() {
            "normal" => alt_file.mode = Some(alt_file::models::AltMode::Normal),
            "dream" => alt_file.mode = Some(alt_file::models::AltMode::Dream),
            "explore" => alt_file.mode = Some(alt_file::models::AltMode::Explore),
            "chaos" => alt_file.mode = Some(alt_file::models::AltMode::Chaos),
            _ => warn!("Unknown mode: {}, using default", mode_str),
        }
    }
    
    if let Some(persona) = &req.persona {
        alt_file.persona = Some(persona.clone());
    }
    
    // Generate a unique ID for this task
    let task_id = Uuid::new_v4().to_string();
    
    // Clone config for async block
    let config_clone = config.clone();
    
    // Spawn a task to process the ALT file
    tokio::spawn(async move {
        info!("Processing ALT file: {}", alt_file.id);
        
        // Create AI processor
        let ai_processor = if config_clone.use_mock_ai {
            AiTaskProcessor::new_mock()
        } else {
            AiTaskProcessor::new(
                config_clone.ai_service_url.clone(),
                config_clone.ai_timeout_seconds,
            )
        };
        
        // Create task scheduler
        let mut scheduler = TaskScheduler::new(config_clone.max_concurrent_tasks);
        scheduler.initialize_from_alt_file(&alt_file);
        
        // Run all tasks
        let task_results = scheduler.run_all_tasks().await;
        
        // Generate LAST file
        let last_file = generate_last_file(&alt_file, task_results);
        
        // Write LAST file to disk
        match write_last_file(&last_file, &config_clone.output_dir) {
            Ok(file_path) => {
                info!("LAST file written to: {:?}", file_path);
            },
            Err(err) => {
                error!("Failed to write LAST file: {}", err);
            }
        }
    });
    
    // Create metadata
    let mut metadata = HashMap::new();
    metadata.insert("timestamp".to_string(), serde_json::to_value(Utc::now().to_rfc3339()).unwrap());
    metadata.insert("task_id".to_string(), serde_json::to_value(task_id.clone()).unwrap());
    metadata.insert("alt_file_id".to_string(), serde_json::to_value(alt_file.id.clone()).unwrap());
    
    // If additional metadata was provided, merge it
    if let Some(req_metadata) = &req.metadata {
        for (key, value) in req_metadata {
            metadata.insert(key.clone(), value.clone());
        }
    }
    
    // Create response
    let response = RunnerResponse {
        id: task_id.clone(),
        status: "processing".to_string(),
        alt_file: alt_file.id.clone(),
        last_file: format!("last_{}.last", task_id),
        metadata,
    };
    
    HttpResponse::Accepted().json(response)
}

async fn get_task_status(
    path: web::Path<String>,
    config: web::Data<RunnerConfig>,
) -> impl Responder {
    let task_id = path.into_inner();
    info!("Received request for task status: {}", task_id);
    
    // In a real implementation, this would check the status of a task
    // by looking for the LAST file in the output directory
    let last_file_path = config.output_dir.join(format!("last_{}.last", task_id));
    
    if last_file_path.exists() {
        // Read the LAST file
        match last_file::writer::read_last_file(&last_file_path) {
            Ok(last_file) => {
                // Create metadata
                let mut metadata = HashMap::new();
                metadata.insert("timestamp".to_string(), serde_json::to_value(Utc::now().to_rfc3339()).unwrap());
                metadata.insert("task_id".to_string(), serde_json::to_value(task_id.clone()).unwrap());
                metadata.insert("alt_file_id".to_string(), serde_json::to_value(last_file.alt_file_id.clone()).unwrap());
                metadata.insert("success_rate".to_string(), serde_json::to_value(last_file.success_rate).unwrap());
                metadata.insert("execution_time_ms".to_string(), serde_json::to_value(last_file.execution_time_ms).unwrap());
                
                // Add LAST file metadata if available
                if let Some(last_metadata) = last_file.metadata {
                    for (key, value) in last_metadata {
                        metadata.insert(key, value);
                    }
                }
                
                // Create response
                let response = RunnerResponse {
                    id: task_id.clone(),
                    status: match last_file.status {
                        last_file::models::LastFileStatus::Success => "completed".to_string(),
                        last_file::models::LastFileStatus::PartialSuccess => "partial_success".to_string(),
                        last_file::models::LastFileStatus::Failure => "failed".to_string(),
                    },
                    alt_file: last_file.alt_file_id,
                    last_file: format!("last_{}.last", task_id),
                    metadata,
                };
                
                HttpResponse::Ok().json(response)
            },
            Err(err) => {
                error!("Failed to read LAST file: {}", err);
                
                // Create error response
                let mut metadata = HashMap::new();
                metadata.insert("timestamp".to_string(), serde_json::to_value(Utc::now().to_rfc3339()).unwrap());
                metadata.insert("error".to_string(), serde_json::to_value(format!("Failed to read LAST file: {}", err)).unwrap());
                
                let response = RunnerResponse {
                    id: task_id.clone(),
                    status: "error".to_string(),
                    alt_file: "unknown".to_string(),
                    last_file: format!("last_{}.last", task_id),
                    metadata,
                };
                
                HttpResponse::InternalServerError().json(response)
            }
        }
    } else {
        // Task is still processing or doesn't exist
        let mut metadata = HashMap::new();
        metadata.insert("timestamp".to_string(), serde_json::to_value(Utc::now().to_rfc3339()).unwrap());
        
        let response = RunnerResponse {
            id: task_id.clone(),
            status: "processing".to_string(),
            alt_file: "unknown".to_string(),
            last_file: format!("last_{}.last", task_id),
            metadata,
        };
        
        HttpResponse::Ok().json(response)
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    info!("Starting Runner Service");
    
    // Load configuration from environment variables
    let config = RunnerConfig {
        output_dir: PathBuf::from(std::env::var("OUTPUT_DIR").unwrap_or_else(|_| "/tmp/runner-service/output".to_string())),
        ai_service_url: std::env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-orchestrator:8000".to_string()),
        ai_timeout_seconds: std::env::var("AI_TIMEOUT_SECONDS").unwrap_or_else(|_| "60".to_string()).parse().unwrap_or(60),
        max_concurrent_tasks: std::env::var("MAX_CONCURRENT_TASKS").unwrap_or_else(|_| "4".to_string()).parse().unwrap_or(4),
        use_mock_ai: std::env::var("USE_MOCK_AI").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
    };
    
    // Create output directory if it doesn't exist
    std::fs::create_dir_all(&config.output_dir).unwrap_or_else(|err| {
        error!("Failed to create output directory: {}", err);
    });
    
    info!("Configuration:");
    info!("  Output Directory: {:?}", config.output_dir);
    info!("  AI Service URL: {}", config.ai_service_url);
    info!("  AI Timeout: {} seconds", config.ai_timeout_seconds);
    info!("  Max Concurrent Tasks: {}", config.max_concurrent_tasks);
    info!("  Use Mock AI: {}", config.use_mock_ai);
    
    // Start HTTP server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(config.clone()))
            .route("/", web::get().to(index))
            .route("/health", web::get().to(health_check))
            .route("/run", web::post().to(run_task))
            .route("/task/{id}", web::get().to(get_task_status))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
