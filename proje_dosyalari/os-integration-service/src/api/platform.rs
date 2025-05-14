use actix_web::{web, HttpResponse, Responder};
use crate::platform;

/// Platform bilgilerini döndüren API endpoint'i
pub async fn get_platform_info() -> impl Responder {
    let platform_info = platform::get_detailed_platform_info();
    HttpResponse::Ok().json(platform_info)
}
