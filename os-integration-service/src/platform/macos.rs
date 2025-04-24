use crate::platform::PlatformInfo;
use std::process::Command;

/// macOS sürüm bilgisini döndürür
pub fn get_macos_version() -> String {
    // Bu fonksiyon gerçek bir macOS sisteminde çalıştırılacak
    // Şimdilik basit bir sürüm bilgisi döndürelim
    "macOS 15.0 Sequoia".to_string()
}

/// macOS için detaylı platform bilgilerini döndürür
pub fn get_detailed_info() -> PlatformInfo {
    // Gerçek bir macOS sisteminde Cocoa API kullanılacak
    // Şimdilik örnek veriler döndürelim
    PlatformInfo {
        os_type: "macOS".to_string(),
        os_version: get_macos_version(),
        architecture: std::env::consts::ARCH.to_string(),
        hostname: get_hostname(),
        username: get_username(),
        cpu_cores: get_cpu_cores(),
        memory_total: get_memory_total(),
    }
}

fn get_hostname() -> String {
    let output = Command::new("hostname")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());
    
    output.unwrap_or_else(|_| "unknown".to_string())
}

fn get_username() -> String {
    std::env::var("USER").unwrap_or_else(|_| "unknown".to_string())
}

fn get_cpu_cores() -> usize {
    std::thread::available_parallelism().map_or(1, |p| p.get())
}

fn get_memory_total() -> u64 {
    // Gerçek bir macOS sisteminde sysctl API kullanılacak
    // Şimdilik örnek bir değer döndürelim
    16 * 1024 * 1024 * 1024 // 16 GB
}
