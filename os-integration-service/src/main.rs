use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use log::{info, error, warn, debug};
use std::io;

mod platform;
mod api;
mod utils;
mod error;

#[actix_web::main]
async fn main() -> io::Result<()> {
    // Loglama sistemini başlat
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    info!("ALT_LAS OS Integration Service başlatılıyor...");
    
    // Platform bilgisini logla
    let platform_info = platform::get_platform_info();
    info!("Platform: {}", platform_info);
    
    // HTTP sunucusunu başlat
    let server = HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(index))
            .route("/health", web::get().to(health_check))
            .service(
                web::scope("/api")
                    .route("/platform", web::get().to(api::platform::get_platform_info))
                    .route("/filesystem", web::get().to(api::filesystem::list_directory))
                    .route("/process", web::get().to(api::process::list_processes))
                    .route("/screenshot", web::get().to(api::screenshot::capture_screen))
            )
    })
    .bind("0.0.0.0:8080")?;
    
    info!("HTTP sunucusu 0.0.0.0:8080 adresinde başlatıldı");
    server.run().await
}

async fn index() -> impl Responder {
    HttpResponse::Ok().body("ALT_LAS OS Integration Service")
}

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "up",
        "version": env!("CARGO_PKG_VERSION"),
        "platform": platform::get_platform_info()
    }))
}
