#[macro_use]
extern crate log;

use std::env;
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;

use actix_web::{web, App, HttpServer, middleware, HttpResponse, Responder};
use tokio::sync::Mutex;
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

mod alt_file;
mod task_manager;
mod ai_service;
mod last_file;

use alt_file::parser::parse_alt_file;
use task_manager::scheduler::TaskScheduler;
use ai_service::AiTaskProcessor;

#[derive(Debug, Clone)]
struct RunnerConfig {
    alt_files_dir: String,
    last_files_dir: String,
    artifacts_dir: String,
    ai_service_url: String,
    ai_timeout_seconds: u64,
    max_concurrent_tasks: usize,
    max_concurrent_ai_tasks: Option<usize>, // Added optional field for AI concurrency
}

#[derive(Debug, Serialize, Deserialize)]
struct RunnerStatus {
    status: String,
    version: String,
    uptime_seconds: u64,
    processed_files: u64,
    success_rate: f64,
    active_tasks: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProcessAltRequest {
    file_path: String,
    priority: Option<String>,
    mode: Option<String>,
    persona: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProcessAltResponse {
    request_id: String,
    alt_file_id: String,
    status: String,
    last_file_path: Option<String>,
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "runner-service",
        "version": env!("CARGO_PKG_VERSION"),
    }))
}

async fn get_status(data: web::Data<Arc<Mutex<RunnerStatus>>>) -> impl Responder {
    let status = data.lock().await;
    HttpResponse::Ok().json(&*status) // Dereference and borrow the status inside the guard
}

async fn process_alt_file(
    req: web::Json<ProcessAltRequest>,
    config: web::Data<RunnerConfig>,
    status: web::Data<Arc<Mutex<RunnerStatus>>>,
) -> impl Responder {
    let file_path_str = &req.file_path;
    let file_path = Path::new(file_path_str);
    
    // Validate file path
    if !file_path.exists() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "File not found",
            "file_path": file_path_str,
        }));
    }
    
    // Read file content
    let file_content = match tokio::fs::read_to_string(file_path).await {
        Ok(content) => content,
        Err(err) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to read ALT file",
                "details": err.to_string(),
            }));
        }
    };
    
    // Parse ALT file content
    let alt_file = match parse_alt_file(&file_content) { // Pass file content string
        Ok(file) => file,
        Err(err) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Failed to parse ALT file",
                "details": err.to_string(),
            }));
        }
    };
    
    // Override ALT file properties if provided in request
    let mut alt_file = alt_file;
    if let Some(mode_str) = &req.mode {
        alt_file.mode = Some(match mode_str.as_str() {
            "normal" => alt_file::models::AltMode::Normal,
            "dream" => alt_file::models::AltMode::Dream,
            "explore" => alt_file::models::AltMode::Explore,
            "chaos" => alt_file::models::AltMode::Chaos,
            _ => alt_file::models::AltMode::Normal,
        });
    }
    
    if let Some(persona) = &req.persona {
        alt_file.persona = Some(persona.clone());
    }
    
    if let Some(priority_str) = &req.priority {
        alt_file.priority = Some(match priority_str.as_str() {
            "high" => alt_file::models::Priority::High,
            "medium" => alt_file::models::Priority::Medium,
            "low" => alt_file::models::Priority::Low,
            _ => alt_file::models::Priority::Medium,
        });
    }
    
    // Generate request ID
    let request_id = Uuid::new_v4().to_string();
    
    // Create AI processor
    let ai_processor = AiTaskProcessor::new(
        config.ai_service_url.clone(),
        config.ai_timeout_seconds,
        config.max_concurrent_ai_tasks.unwrap_or(4), // Add concurrency limit from config or default
    );
    
    // Create task scheduler
    let scheduler = TaskScheduler::new(
        Some(ai_processor),
        config.max_concurrent_tasks,
    );
    
    // Update status
    {
        let mut status_lock = status.lock().await;
        status_lock.active_tasks += 1;
    }
    
    // Spawn task to process ALT file
    let config_clone = config.clone();
    let status_clone = status.clone();
    let alt_file_id = alt_file.id.clone();
    
    tokio::spawn(async move {
        // Execute tasks
        let task_results = scheduler.schedule_tasks(&alt_file).await;
        
        // Generate LAST file
        let last_file = last_file::generator::generate_last_file(&alt_file, task_results);
        
        // Extract artifacts
        let artifacts_dir = Path::new(&config_clone.artifacts_dir);
        let last_file = last_file::generator::extract_artifacts_from_results(last_file, artifacts_dir);
        
        // Write LAST file
        let last_files_dir = Path::new(&config_clone.last_files_dir);
        if let Ok(last_file_path) = last_file::writer::write_last_file(&last_file, last_files_dir) {
            info!("LAST file written to: {:?}", last_file_path);
            
            // Generate visualization
            if let Some(graph_path) = last_file::generator::generate_execution_graph_visualization(&last_file, artifacts_dir) {
                info!("Execution graph visualization generated: {:?}", graph_path);
            }
            
            // Export to HTML
            if let Ok(html_path) = last_file::writer::export_last_file_to_html(&last_file, last_files_dir) {
                info!("LAST file exported to HTML: {:?}", html_path);
            }
            
            // Create archive
            if let Ok(archive_path) = last_file::writer::create_last_file_archive(&last_file, last_files_dir) {
                info!("LAST file archive created: {:?}", archive_path);
            }
        }
        
        // Update status
        {
            let mut status_lock = status_clone.lock().await;
            status_lock.active_tasks -= 1;
            status_lock.processed_files += 1;
            
            // Update success rate
            if last_file.status == last_file::models::LastFileStatus::Success {
                let current_success = status_lock.success_rate * (status_lock.processed_files - 1) as f64;
                status_lock.success_rate = (current_success + 1.0) / status_lock.processed_files as f64;
            } else {
                let current_success = status_lock.success_rate * (status_lock.processed_files - 1) as f64;
                status_lock.success_rate = current_success / status_lock.processed_files as f64;
            }
        }
    });
    
    // Return response
    HttpResponse::Accepted().json(ProcessAltResponse {
        request_id,
        alt_file_id,
        status: "processing".to_string(),
        last_file_path: None,
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables
    dotenv().ok();
    
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));
    
    // Get configuration from environment
    let alt_files_dir = env::var("ALT_FILES_DIR").unwrap_or_else(|_| "./alt_files".to_string());
    let last_files_dir = env::var("LAST_FILES_DIR").unwrap_or_else(|_| "./last_files".to_string());
    let artifacts_dir = env::var("ARTIFACTS_DIR").unwrap_or_else(|_| "./artifacts".to_string());
    let ai_service_url = env::var("AI_SERVICE_URL").unwrap_or_else(|_| "http://ai-orchestrator:8000".to_string());
    let ai_timeout_seconds = env::var("AI_TIMEOUT_SECONDS").unwrap_or_else(|_| "60".to_string())
        .parse::<u64>().unwrap_or(60);
    let max_concurrent_tasks = env::var("MAX_CONCURRENT_TASKS").unwrap_or_else(|_| "4".to_string())
        .parse::<usize>().unwrap_or(4);
    let max_concurrent_ai_tasks = env::var("MAX_CONCURRENT_AI_TASKS").ok()
        .and_then(|s| s.parse::<usize>().ok()); // Parse optional AI concurrency limit
    let bind_address = env::var("BIND_ADDRESS").unwrap_or_else(|_| "0.0.0.0:8080".to_string());
    
    // Create directories if they don't exist
    for dir in [&alt_files_dir, &last_files_dir, &artifacts_dir] {
        std::fs::create_dir_all(dir)?;
    }
    
    // Create configuration
    let config = RunnerConfig {
        alt_files_dir,
        last_files_dir,
        artifacts_dir,
        ai_service_url,
        ai_timeout_seconds,
        max_concurrent_tasks,
        max_concurrent_ai_tasks, // Store optional value
    };
    
    // Create status
    let status = Arc::new(Mutex::new(RunnerStatus {
        status: "running".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime_seconds: 0,
        processed_files: 0,
        success_rate: 0.0,
        active_tasks: 0,
    }));
    
    // Start uptime counter
    let status_clone = status.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(1));
        loop {
            interval.tick().await;
            let mut status = status_clone.lock().await;
            status.uptime_seconds += 1;
        }
    });
    
    info!("Starting Runner Service on {}", bind_address);
    
    // Start HTTP server
    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default())
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(status.clone()))
            .app_data(web::JsonConfig::default().limit(10 * 1024 * 1024)) // 10MB JSON payload limit
            .service(
                web::scope("/api/v1")
                    .route("/health", web::get().to(health_check))
                    .route("/status", web::get().to(get_status))
                    .route("/process", web::post().to(process_alt_file))
            )
    })
    .bind(bind_address)?
    .run()
    .await
}

