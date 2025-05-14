use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use log::{info, error};
use crate::platform;

#[derive(Debug, Deserialize)]
pub struct FindWindowRequest {
    title: String,
}

#[derive(Debug, Serialize)]
pub struct FindWindowResponse {
    hwnd: isize,
}

#[derive(Debug, Deserialize)]
pub struct WindowMessageRequest {
    hwnd: isize,
    message: u32,
    wparam: usize,
    lparam: isize,
}

#[derive(Debug, Serialize)]
pub struct SendMessageResponse {
    result: isize,
}

#[derive(Debug, Deserialize)]
pub struct CloseWindowRequest {
    hwnd: isize,
}

/// Finds a window by its title
pub async fn find_window(req: web::Json<FindWindowRequest>) -> impl Responder {
    info!("Finding window with title: {}", req.title);
    match platform::find_window_by_title(&req.title) {
        Ok(hwnd) => {
            info!("Found window {} for title \"{}\"", hwnd, req.title);
            HttpResponse::Ok().json(FindWindowResponse { hwnd })
        }
        Err(e) => {
            error!("Failed to find window with title \"{}\": {}", req.title, e);
            HttpResponse::NotFound().json(serde_json::json!({
                "error": format!("Window not found: {}", e)
            }))
        }
    }
}

/// Sends a synchronous message to a window
pub async fn send_message(req: web::Json<WindowMessageRequest>) -> impl Responder {
    info!("Sending message {} to window {}", req.message, req.hwnd);
    match platform::send_window_message(req.hwnd, req.message, req.wparam, req.lparam) {
        Ok(result) => {
            info!("SendMessage result for window {}: {}", req.hwnd, result);
            HttpResponse::Ok().json(SendMessageResponse { result })
        }
        Err(e) => {
            error!("Failed to send message to window {}: {}", req.hwnd, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to send message: {}", e)
            }))
        }
    }
}

/// Posts an asynchronous message to a window
pub async fn post_message(req: web::Json<WindowMessageRequest>) -> impl Responder {
    info!("Posting message {} to window {}", req.message, req.hwnd);
    match platform::post_window_message(req.hwnd, req.message, req.wparam, req.lparam) {
        Ok(()) => {
            info!("Successfully posted message to window {}", req.hwnd);
            HttpResponse::Ok().json(serde_json::json!({ "status": "posted" }))
        }
        Err(e) => {
            error!("Failed to post message to window {}: {}", req.hwnd, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to post message: {}", e)
            }))
        }
    }
}

/// Closes a window gracefully
pub async fn close_window(req: web::Json<CloseWindowRequest>) -> impl Responder {
    info!("Attempting to close window {}", req.hwnd);
    match platform::close_window(req.hwnd) {
        Ok(()) => {
            info!("Sent close message to window {}", req.hwnd);
            HttpResponse::Ok().json(serde_json::json!({ "status": "close message sent" }))
        }
        Err(e) => {
            error!("Failed to send close message to window {}: {}", req.hwnd, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to close window: {}", e)
            }))
        }
    }
}

/// Lists all top-level visible windows
pub async fn list_windows() -> impl Responder {
    info!("Listing top-level visible windows");
    match platform::list_windows() {
        Ok(windows) => {
            HttpResponse::Ok().json(windows)
        }
        Err(e) => {
            error!("Failed to list windows: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to list windows: {}", e)
            }))
        }
    }
}

