use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use log::{info, error};

#[derive(Serialize)]
struct HealthResponse {
    status: String,
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
    })
}

async fn index() -> impl Responder {
    HttpResponse::Ok().body("ALT_LAS Runner Service")
}

async fn run_task(req: web::Json<RunnerRequest>) -> impl Responder {
    info!("Received request to run task from ALT file: {}", req.alt_file);
    
    // Generate a unique ID for this task
    let task_id = Uuid::new_v4().to_string();
    
    // In a real implementation, this would process the ALT file and create a LAST file
    // For now, we'll just create a mock response
    
    // Create metadata
    let mut metadata = HashMap::new();
    metadata.insert("timestamp".to_string(), serde_json::to_value(Utc::now().to_rfc3339()).unwrap());
    metadata.insert("mode".to_string(), serde_json::to_value(req.mode.clone().unwrap_or_else(|| "Normal".to_string())).unwrap());
    metadata.insert("persona".to_string(), serde_json::to_value(req.persona.clone().unwrap_or_else(|| "technical_expert".to_string())).unwrap());
    metadata.insert("execution_time".to_string(), serde_json::to_value(1.5).unwrap());
    
    // If additional metadata was provided, merge it
    if let Some(req_metadata) = &req.metadata {
        for (key, value) in req_metadata {
            metadata.insert(key.clone(), value.clone());
        }
    }
    
    // Create response
    let response = RunnerResponse {
        id: task_id.clone(),
        status: "completed".to_string(),
        alt_file: req.alt_file.clone(),
        last_file: format!("result_{}.last", task_id),
        metadata,
    };
    
    HttpResponse::Ok().json(response)
}

async fn get_task_status(path: web::Path<String>) -> impl Responder {
    let task_id = path.into_inner();
    info!("Received request for task status: {}", task_id);
    
    // In a real implementation, this would check the status of a task
    // For now, we'll just return a mock response
    
    // Create metadata
    let mut metadata = HashMap::new();
    metadata.insert("timestamp".to_string(), serde_json::to_value(Utc::now().to_rfc3339()).unwrap());
    metadata.insert("mode".to_string(), serde_json::to_value("Normal").unwrap());
    metadata.insert("persona".to_string(), serde_json::to_value("technical_expert").unwrap());
    metadata.insert("execution_time".to_string(), serde_json::to_value(1.5).unwrap());
    
    // Create response
    let response = RunnerResponse {
        id: task_id.clone(),
        status: "completed".to_string(),
        alt_file: format!("task_{}.alt", task_id),
        last_file: format!("result_{}.last", task_id),
        metadata,
    };
    
    HttpResponse::Ok().json(response)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    info!("Starting Runner Service");
    
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(index))
            .route("/health", web::get().to(health_check))
            .route("/run", web::post().to(run_task))
            .route("/task/{id}", web::get().to(get_task_status))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
