use actix_web::{web, App, HttpServer, middleware::Logger};
use log::{info, error, LevelFilter};
use std::io::Write;
use env_logger::Builder;
use std::env;
use std::path::Path;
use std::fs;

mod platform;
mod api;
mod error;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Loglama yapılandırması
    setup_logging();
    
    // Ortam değişkenlerini yükle
    dotenv::dotenv().ok();
    
    // Sunucu adresini ve portunu al
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let server_url = format!("{}:{}", host, port);
    
    // Geçici dizini oluştur
    let temp_dir = env::var("TEMP_DIR").unwrap_or_else(|_| "/tmp/os_integration_service".to_string());
    if !Path::new(&temp_dir).exists() {
        fs::create_dir_all(&temp_dir).expect("Geçici dizin oluşturulamadı");
    }
    
    // Platform bilgilerini göster
    let platform_info = platform::get_platform_info();
    info!("OS Integration Service başlatılıyor");
    info!("Platform: {} {}", platform_info.os_type, platform_info.os_version);
    info!("Mimari: {}", platform_info.architecture);
    info!("Sunucu adresi: {}", server_url);
    
    // HTTP sunucusunu başlat
    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            // Platform API'leri
            .route("/api/platform/info", web::get().to(api::platform::get_platform_info))
            .route("/api/platform/processes", web::get().to(api::process::list_processes))
            .route("/api/platform/run", web::post().to(api::process::run_process))
            .route("/api/platform/kill", web::post().to(api::process::kill_process))
            .route("/api/platform/input", web::post().to(api::process::send_input_to_process))
            .route("/api/platform/output/{id}", web::get().to(api::process::get_process_output))
            .route("/api/platform/running", web::get().to(api::process::get_running_processes))
            
            // Dosya sistemi API'leri
            .route("/api/fs/list", web::get().to(api::filesystem::list_directory))
            .route("/api/fs/read", web::get().to(api::filesystem::read_file))
            .route("/api/fs/write", web::post().to(api::filesystem::write_file))
            .route("/api/fs/delete", web::post().to(api::filesystem::delete_file))
            .route("/api/fs/move", web::post().to(api::filesystem::move_file))
            .route("/api/fs/copy", web::post().to(api::filesystem::copy_file))
            .route("/api/fs/mkdir", web::post().to(api::filesystem::create_directory))
            .route("/api/fs/disks", web::get().to(api::filesystem::get_disk_info))
            
            // Ekran görüntüsü API'leri
            .route("/api/screenshot", web::get().to(api::screenshot::capture_screen))
            .route("/api/screenshot/region", web::post().to(api::screenshot::capture_region))
            .route("/api/screenshot/cuda", web::get().to(api::screenshot::capture_screen_cuda))
    })
    .bind(&server_url)?
    .run()
    .await
}

fn setup_logging() {
    let mut builder = Builder::new();
    
    builder.format(|buf, record| {
        writeln!(
            buf,
            "{} [{}] - {}",
            chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
            record.level(),
            record.args()
        )
    });
    
    // Log seviyesini ortam değişkeninden al veya INFO olarak ayarla
    let log_level = env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string());
    
    match log_level.to_lowercase().as_str() {
        "trace" => builder.filter(None, LevelFilter::Trace),
        "debug" => builder.filter(None, LevelFilter::Debug),
        "info" => builder.filter(None, LevelFilter::Info),
        "warn" => builder.filter(None, LevelFilter::Warn),
        "error" => builder.filter(None, LevelFilter::Error),
        _ => builder.filter(None, LevelFilter::Info),
    };
    
    builder.init();
}
