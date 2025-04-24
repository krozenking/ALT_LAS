use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use log::{info, error};

#[derive(Debug, Serialize)]
struct FileInfo {
    name: String,
    path: String,
    is_dir: bool,
    size: u64,
    modified: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct DirectoryQuery {
    path: String,
}

/// Belirtilen dizindeki dosya ve klasörleri listeleyen API endpoint'i
pub async fn list_directory(query: web::Query<DirectoryQuery>) -> impl Responder {
    let path = &query.path;
    info!("Dizin listeleniyor: {}", path);
    
    let path_obj = Path::new(path);
    if !path_obj.exists() {
        error!("Dizin bulunamadı: {}", path);
        return HttpResponse::NotFound().json(serde_json::json!({
            "error": "Dizin bulunamadı"
        }));
    }
    
    if !path_obj.is_dir() {
        error!("Belirtilen yol bir dizin değil: {}", path);
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Belirtilen yol bir dizin değil"
        }));
    }
    
    match fs::read_dir(path) {
        Ok(entries) => {
            let mut files = Vec::new();
            
            for entry in entries {
                if let Ok(entry) = entry {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let file_path = entry.path().to_string_lossy().to_string();
                    let metadata = entry.metadata();
                    
                    if let Ok(metadata) = metadata {
                        let is_dir = metadata.is_dir();
                        let size = if is_dir { 0 } else { metadata.len() };
                        let modified = metadata.modified()
                            .map(|time| time.duration_since(std::time::UNIX_EPOCH)
                                .map(|d| d.as_secs().to_string())
                                .unwrap_or_else(|_| "unknown".to_string()))
                            .ok();
                        
                        files.push(FileInfo {
                            name: file_name,
                            path: file_path,
                            is_dir,
                            size,
                            modified,
                        });
                    }
                }
            }
            
            HttpResponse::Ok().json(files)
        },
        Err(e) => {
            error!("Dizin okunamadı: {} - Hata: {}", path, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Dizin okunamadı: {}", e)
            }))
        }
    }
}
