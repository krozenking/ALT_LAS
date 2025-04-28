use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use log::{info, error};
use crate::platform;

#[derive(Debug, Deserialize)]
pub struct ReadRegistryStringRequest {
    root_key: String,
    sub_key: String,
    value_name: String,
}

#[derive(Debug, Deserialize)]
pub struct ReadRegistryDwordRequest {
    root_key: String,
    sub_key: String,
    value_name: String,
}

#[derive(Debug, Deserialize)]
pub struct WriteRegistryStringRequest {
    root_key: String,
    sub_key: String,
    value_name: String,
    data: String,
}

#[derive(Debug, Deserialize)]
pub struct WriteRegistryDwordRequest {
    root_key: String,
    sub_key: String,
    value_name: String,
    data: u32,
}

#[derive(Debug, Deserialize)]
pub struct DeleteRegistryValueRequest {
    root_key: String,
    sub_key: String,
    value_name: String,
}

/// Reads a string value from the registry
pub async fn read_registry_string(req: web::Json<ReadRegistryStringRequest>) -> impl Responder {
    info!("Reading registry string value: {}\\{}\\{}", req.root_key, req.sub_key, req.value_name);
    match platform::read_registry_string(&req.root_key, &req.sub_key, &req.value_name) {
        Ok(value) => {
            info!("Successfully read registry string value: {}", value);
            HttpResponse::Ok().json(serde_json::json!({ "value": value }))
        }
        Err(e) => {
            error!("Failed to read registry string value: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to read registry value: {}", e)
            }))
        }
    }
}

/// Reads a DWORD value from the registry
pub async fn read_registry_dword(req: web::Json<ReadRegistryDwordRequest>) -> impl Responder {
    info!("Reading registry DWORD value: {}\\{}\\{}", req.root_key, req.sub_key, req.value_name);
    match platform::read_registry_dword(&req.root_key, &req.sub_key, &req.value_name) {
        Ok(value) => {
            info!("Successfully read registry DWORD value: {}", value);
            HttpResponse::Ok().json(serde_json::json!({ "value": value }))
        }
        Err(e) => {
            error!("Failed to read registry DWORD value: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to read registry value: {}", e)
            }))
        }
    }
}

/// Writes a string value to the registry
pub async fn write_registry_string(req: web::Json<WriteRegistryStringRequest>) -> impl Responder {
    info!("Writing registry string value: {}\\{}\\{}", req.root_key, req.sub_key, req.value_name);
    match platform::write_registry_string(&req.root_key, &req.sub_key, &req.value_name, &req.data) {
        Ok(()) => {
            info!("Successfully wrote registry string value");
            HttpResponse::Ok().json(serde_json::json!({ "status": "success" }))
        }
        Err(e) => {
            error!("Failed to write registry string value: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to write registry value: {}", e)
            }))
        }
    }
}

/// Writes a DWORD value to the registry
pub async fn write_registry_dword(req: web::Json<WriteRegistryDwordRequest>) -> impl Responder {
    info!("Writing registry DWORD value: {}\\{}\\{}", req.root_key, req.sub_key, req.value_name);
    match platform::write_registry_dword(&req.root_key, &req.sub_key, &req.value_name, req.data) {
        Ok(()) => {
            info!("Successfully wrote registry DWORD value");
            HttpResponse::Ok().json(serde_json::json!({ "status": "success" }))
        }
        Err(e) => {
            error!("Failed to write registry DWORD value: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to write registry value: {}", e)
            }))
        }
    }
}

/// Deletes a value from the registry
pub async fn delete_registry_value(req: web::Json<DeleteRegistryValueRequest>) -> impl Responder {
    info!("Deleting registry value: {}\\{}\\{}", req.root_key, req.sub_key, req.value_name);
    match platform::delete_registry_value(&req.root_key, &req.sub_key, &req.value_name) {
        Ok(()) => {
            info!("Successfully deleted registry value");
            HttpResponse::Ok().json(serde_json::json!({ "status": "success" }))
        }
        Err(e) => {
            error!("Failed to delete registry value: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to delete registry value: {}", e)
            }))
        }
    }
}
