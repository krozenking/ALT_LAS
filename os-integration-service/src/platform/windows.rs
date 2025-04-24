#[cfg(target_os = "windows")]
use windows::Win32::System::SystemInformation;
use crate::platform::PlatformInfo;
use std::process::Command;

/// Windows sürüm bilgisini döndürür
pub fn get_windows_version() -> String {
    // Bu fonksiyon gerçek bir Windows sisteminde çalıştırılacak
    // Şimdilik basit bir sürüm bilgisi döndürelim
    "Windows 11".to_string()
}

/// Windows için detaylı platform bilgilerini döndürür
pub fn get_detailed_info() -> PlatformInfo {
    // Gerçek bir Windows sisteminde Windows API kullanılacak
    // Şimdilik örnek veriler döndürelim
    PlatformInfo {
        os_type: "Windows".to_string(),
        os_version: get_windows_version(),
        architecture: std::env::consts::ARCH.to_string(),
        hostname: get_hostname(),
        username: get_username(),
        cpu_cores: get_cpu_cores(),
        memory_total: get_memory_total(),
    }
}

fn get_hostname() -> String {
    std::env::var("COMPUTERNAME").unwrap_or_else(|_| "unknown".to_string())
}

fn get_username() -> String {
    std::env::var("USERNAME").unwrap_or_else(|_| "unknown".to_string())
}

fn get_cpu_cores() -> usize {
    std::thread::available_parallelism().map_or(1, |p| p.get())
}

fn get_memory_total() -> u64 {
    // Gerçek bir Windows sisteminde GlobalMemoryStatusEx API kullanılacak
    // Şimdilik örnek bir değer döndürelim
    8 * 1024 * 1024 * 1024 // 8 GB
}
