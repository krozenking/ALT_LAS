use cfg_if::cfg_if;

mod windows;
mod macos;
mod linux;

/// Platform bilgilerini içeren yapı
#[derive(Debug, Clone, serde::Serialize)]
pub struct PlatformInfo {
    pub os_type: String,
    pub os_version: String,
    pub architecture: String,
    pub hostname: String,
    pub username: String,
    pub cpu_cores: usize,
    pub memory_total: u64,
}

/// Mevcut platformun bilgilerini döndürür
pub fn get_platform_info() -> String {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            format!("Windows - {}", windows::get_windows_version())
        } else if #[cfg(target_os = "macos")] {
            format!("macOS - {}", macos::get_macos_version())
        } else if #[cfg(target_os = "linux")] {
            format!("Linux - {}", linux::get_linux_version())
        } else {
            "Bilinmeyen İşletim Sistemi".to_string()
        }
    }
}

/// Detaylı platform bilgilerini döndürür
pub fn get_detailed_platform_info() -> PlatformInfo {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::get_detailed_info()
        } else if #[cfg(target_os = "macos")] {
            macos::get_detailed_info()
        } else if #[cfg(target_os = "linux")] {
            linux::get_detailed_info()
        } else {
            PlatformInfo {
                os_type: "Unknown".to_string(),
                os_version: "Unknown".to_string(),
                architecture: std::env::consts::ARCH.to_string(),
                hostname: "unknown".to_string(),
                username: "unknown".to_string(),
                cpu_cores: 1,
                memory_total: 0,
            }
        }
    }
}
