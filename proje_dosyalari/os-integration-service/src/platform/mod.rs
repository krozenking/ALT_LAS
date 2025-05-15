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

/// İşlem bilgilerini içeren yapı
#[derive(Debug, Clone, serde::Serialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory_usage: u64,
    pub status: String,
}

/// Dosya bilgilerini içeren yapı
#[derive(Debug, Clone, serde::Serialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub size: u64,
    pub last_modified: Option<std::time::SystemTime>,
}

/// Disk bilgilerini içeren yapı
#[derive(Debug, Clone, serde::Serialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_space: u64,
    pub available_space: u64,
    pub file_system: String,
}

/// Pencere bilgilerini içeren yapı
#[derive(Debug, Clone, serde::Serialize)]
pub struct WindowInfo {
    pub id: isize,
    pub title: String,
    pub process_id: u32,
}

/// Dosya değişiklik olayları
#[derive(Debug, Clone, serde::Serialize)]
pub enum FileChangeEvent {
    Created(String),
    Modified(String),
    Deleted(String),
    Renamed { from: String, to: String },
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

/// Çalışan işlemleri listeler
pub fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::list_processes()
        } else if #[cfg(target_os = "macos")] {
            macos::list_processes()
        } else if #[cfg(target_os = "linux")] {
            linux::list_processes()
        } else {
            Err("İşlem listesi bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir işlemi sonlandırır
pub fn kill_process(pid: u32) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::kill_process(pid)
        } else if #[cfg(target_os = "macos")] {
            macos::kill_process(pid)
        } else if #[cfg(target_os = "linux")] {
            linux::kill_process(pid)
        } else {
            Err("İşlem sonlandırma bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Yeni bir işlem başlatır
pub fn run_process(command: &str, args: &[String]) -> Result<ProcessInfo, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::run_process(command, args)
        } else if #[cfg(target_os = "macos")] {
            macos::run_process(command, args)
        } else if #[cfg(target_os = "linux")] {
            linux::run_process(command, args)
        } else {
            Err("İşlem başlatma bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir dizindeki dosya ve klasörleri listeler
pub fn list_directory(path: &str) -> Result<Vec<FileInfo>, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::list_directory(path)
        } else if #[cfg(target_os = "macos")] {
            macos::list_directory(path)
        } else if #[cfg(target_os = "linux")] {
            linux::list_directory(path)
        } else {
            Err("Dizin listeleme bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir dosyanın içeriğini okur
pub fn read_file(path: &str) -> Result<Vec<u8>, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::read_file(path)
        } else if #[cfg(target_os = "macos")] {
            macos::read_file(path)
        } else if #[cfg(target_os = "linux")] {
            linux::read_file(path)
        } else {
            Err("Dosya okuma bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir dosyaya içerik yazar
pub fn write_file(path: &str, content: &[u8]) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::write_file(path, content)
        } else if #[cfg(target_os = "macos")] {
            macos::write_file(path, content)
        } else if #[cfg(target_os = "linux")] {
            linux::write_file(path, content)
        } else {
            Err("Dosya yazma bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir dosya veya dizini siler
pub fn delete_path(path: &str) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::delete_path(path)
        } else if #[cfg(target_os = "macos")] {
            macos::delete_path(path)
        } else if #[cfg(target_os = "linux")] {
            linux::delete_path(path)
        } else {
            Err("Dosya/dizin silme bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir dosya veya dizini taşır/yeniden adlandırır
pub fn move_path(source: &str, destination: &str) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::move_path(source, destination)
        } else if #[cfg(target_os = "macos")] {
            macos::move_path(source, destination)
        } else if #[cfg(target_os = "linux")] {
            linux::move_path(source, destination)
        } else {
            Err("Dosya/dizin taşıma bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir dosya veya dizini kopyalar
pub fn copy_path(source: &str, destination: &str, overwrite: bool) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::copy_path(source, destination, overwrite)
        } else if #[cfg(target_os = "macos")] {
            macos::copy_path(source, destination, overwrite)
        } else if #[cfg(target_os = "linux")] {
            linux::copy_path(source, destination, overwrite)
        } else {
            Err("Dosya/dizin kopyalama bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Yeni bir dizin oluşturur
pub fn create_directory(path: &str) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::create_directory(path)
        } else if #[cfg(target_os = "macos")] {
            macos::create_directory(path)
        } else if #[cfg(target_os = "linux")] {
            linux::create_directory(path)
        } else {
            Err("Dizin oluşturma bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Disk bilgilerini döndürür
pub fn get_disk_info() -> Result<Vec<DiskInfo>, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::get_disk_info()
        } else if #[cfg(target_os = "macos")] {
            macos::get_disk_info()
        } else if #[cfg(target_os = "linux")] {
            linux::get_disk_info()
        } else {
            Err("Disk bilgisi bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir dizini değişiklikler için izlemeye başlar
pub fn start_monitoring_directory(path: &str, event_sender: std::sync::mpsc::Sender<FileChangeEvent>) -> Result<String, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::start_monitoring_directory(path, event_sender)
        } else if #[cfg(target_os = "macos")] {
            macos::start_monitoring_directory(path, event_sender)
        } else if #[cfg(target_os = "linux")] {
            linux::start_monitoring_directory(path, event_sender)
        } else {
            Err("Dizin izleme bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir dizini izlemeyi durdurur
pub fn stop_monitoring_directory(watcher_id: &str) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::stop_monitoring_directory(watcher_id)
        } else if #[cfg(target_os = "macos")] {
            macos::stop_monitoring_directory(watcher_id)
        } else if #[cfg(target_os = "linux")] {
            linux::stop_monitoring_directory(watcher_id)
        } else {
            Err("Dizin izleme bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Başlığa göre pencere bulur
pub fn find_window_by_title(title: &str) -> Result<isize, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::find_window_by_title(title)
        } else if #[cfg(target_os = "macos")] {
            macos::find_window_by_title(title)
        } else if #[cfg(target_os = "linux")] {
            linux::find_window_by_title(title)
        } else {
            Err("Pencere bulma bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir pencereye mesaj gönderir
pub fn send_window_message(hwnd: isize, message: u32, wparam: usize, lparam: isize) -> Result<isize, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::send_window_message(hwnd, message, wparam, lparam)
        } else if #[cfg(target_os = "macos")] {
            macos::send_window_message(hwnd, message, wparam, lparam)
        } else if #[cfg(target_os = "linux")] {
            linux::send_window_message(hwnd, message, wparam, lparam)
        } else {
            Err("Pencere mesajı gönderme bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir pencereye asenkron mesaj gönderir
pub fn post_window_message(hwnd: isize, message: u32, wparam: usize, lparam: isize) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::post_window_message(hwnd, message, wparam, lparam)
        } else if #[cfg(target_os = "macos")] {
            macos::post_window_message(hwnd, message, wparam, lparam)
        } else if #[cfg(target_os = "linux")] {
            linux::post_window_message(hwnd, message, wparam, lparam)
        } else {
            Err("Pencere mesajı gönderme bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Bir pencereyi kapatır
pub fn close_window(hwnd: isize) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::close_window(hwnd)
        } else if #[cfg(target_os = "macos")] {
            macos::close_window(hwnd)
        } else if #[cfg(target_os = "linux")] {
            linux::close_window(hwnd)
        } else {
            Err("Pencere kapatma bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Tüm pencereleri listeler
pub fn list_windows() -> Result<Vec<WindowInfo>, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::list_windows()
        } else if #[cfg(target_os = "macos")] {
            macos::list_windows()
        } else if #[cfg(target_os = "linux")] {
            linux::list_windows()
        } else {
            Err("Pencere listeleme bu platformda desteklenmiyor".to_string())
        }
    }
}

/// Registry'den string değer okur (Windows'a özgü)
pub fn read_registry_string(root_key: &str, sub_key: &str, value_name: &str) -> Result<String, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::read_registry_string(root_key, sub_key, value_name)
        } else {
            Err("Registry erişimi sadece Windows'ta desteklenmektedir".to_string())
        }
    }
}

/// Registry'den DWORD değer okur (Windows'a özgü)
pub fn read_registry_dword(root_key: &str, sub_key: &str, value_name: &str) -> Result<u32, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::read_registry_dword(root_key, sub_key, value_name)
        } else {
            Err("Registry erişimi sadece Windows'ta desteklenmektedir".to_string())
        }
    }
}

/// Registry'ye string değer yazar (Windows'a özgü)
pub fn write_registry_string(root_key: &str, sub_key: &str, value_name: &str, data: &str) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::write_registry_string(root_key, sub_key, value_name, data)
        } else {
            Err("Registry erişimi sadece Windows'ta desteklenmektedir".to_string())
        }
    }
}

/// Registry'ye DWORD değer yazar (Windows'a özgü)
pub fn write_registry_dword(root_key: &str, sub_key: &str, value_name: &str, data: u32) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::write_registry_dword(root_key, sub_key, value_name, data)
        } else {
            Err("Registry erişimi sadece Windows'ta desteklenmektedir".to_string())
        }
    }
}

/// Registry'den değer siler (Windows'a özgü)
pub fn delete_registry_value(root_key: &str, sub_key: &str, value_name: &str) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            windows::delete_registry_value(root_key, sub_key, value_name)
        } else {
            Err("Registry erişimi sadece Windows'ta desteklenmektedir".to_string())
        }
    }
}
