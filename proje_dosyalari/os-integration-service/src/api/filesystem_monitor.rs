use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use log::{info, error};
use std::sync::mpsc;
use crate::platform::{self, FileChangeEvent};
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};

#[derive(Debug, Deserialize)]
pub struct MonitorRequest {
    path: String,
}

#[derive(Debug, Serialize)]
pub struct MonitorResponse {
    watcher_id: String,
}

#[derive(Debug, Deserialize)]
pub struct StopMonitorRequest {
    watcher_id: String,
}

// Temporary in-memory store for events (Replace with a better mechanism like WebSockets)
lazy_static::lazy_static! {
    static ref EVENT_BUFFER: Mutex<VecDeque<FileChangeEvent>> = Mutex::new(VecDeque::new());
}

/// Starts monitoring a directory
pub async fn start_monitoring(req: web::Json<MonitorRequest>) -> impl Responder {
    info!("Starting directory monitoring for: {}", req.path);

    // Create a channel to receive events from the monitoring thread
    let (tx, rx) = mpsc::channel::<FileChangeEvent>();

    // Spawn a thread to collect events and put them in the global buffer
    // In a real app, you'd likely use WebSockets or SSE to push events to clients
    std::thread::spawn(move || {
        while let Ok(event) = rx.recv() {
            let mut buffer = EVENT_BUFFER.lock().unwrap();
            buffer.push_back(event);
            // Limit buffer size to avoid memory exhaustion
            if buffer.len() > 1000 {
                buffer.pop_front();
            }
        }
    });

    match platform::start_monitoring_directory(&req.path, tx) {
        Ok(watcher_id) => {
            info!("Started monitoring {} with ID: {}", req.path, watcher_id);
            HttpResponse::Ok().json(MonitorResponse { watcher_id })
        }
        Err(e) => {
            error!("Failed to start monitoring {}: {}", req.path, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to start monitoring: {}", e)
            }))
        }
    }
}

/// Stops monitoring a directory
pub async fn stop_monitoring(req: web::Json<StopMonitorRequest>) -> impl Responder {
    info!("Stopping directory monitoring for ID: {}", req.watcher_id);
    match platform::stop_monitoring_directory(&req.watcher_id) {
        Ok(()) => {
            info!("Successfully stopped watcher {}", req.watcher_id);
            HttpResponse::Ok().json(serde_json::json!({ "status": "stopped" }))
        }
        Err(e) => {
            error!("Failed to stop monitoring {}: {}", req.watcher_id, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to stop monitoring: {}", e)
            }))
        }
    }
}

/// Retrieves buffered file change events (simple polling mechanism)
pub async fn get_events() -> impl Responder {
    let mut buffer = EVENT_BUFFER.lock().unwrap();
    let events: Vec<FileChangeEvent> = buffer.drain(..).collect();
    HttpResponse::Ok().json(events)
}

