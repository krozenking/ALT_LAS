#[cfg(target_os = "linux")]
use crate::platform::{PlatformInfo, ProcessInfo, FileInfo, DiskInfo, WindowInfo};
use std::{
    fs,
    io::{self, Read},
    os::unix::{
        fs::MetadataExt, // For Linux specific metadata
        process::CommandExt, // For pre_exec
    },
    path::{Path, PathBuf},
    process::{Command, Stdio},
    time::{Duration, SystemTime, UNIX_EPOCH},
    ffi::CString,
    mem::MaybeUninit,
};

// --- Platform Info --- (Existing code)

/// Linux sürüm bilgisini döndürür
pub fn get_linux_version() -> String {
    // /etc/os-release dosyasından dağıtım bilgisini okuma
    if let Ok(content) = fs::read_to_string("/etc/os-release") {
        for line in content.lines() {
            if line.starts_with("PRETTY_NAME=") {
                return line.trim_start_matches("PRETTY_NAME=")
                    .trim_matches(\'"\')
                    .to_string();
            }
        }
    }

    // Alternatif olarak lsb_release komutunu kullan
    let output = Command::new("lsb_release")
        .arg("-d")
        .output();

    if let Ok(output) = output {
        let output_str = String::from_utf8_lossy(&output.stdout);
        if let Some(description) = output_str.strip_prefix("Description:") {
            return description.trim().to_string();
        }
    }

    // Son çare olarak uname komutunu kullan
    let output = Command::new("uname")
        .arg("-o") // Operating system
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    output.unwrap_or_else(|_| "Linux (Unknown Version)".to_string())
}

/// Linux için detaylı platform bilgilerini döndürür
pub fn get_detailed_info() -> PlatformInfo {
    PlatformInfo {
        os_type: "Linux".to_string(),
        os_version: get_linux_version(),
        architecture: get_architecture(),
        hostname: get_hostname(),
        username: get_username(),
        cpu_cores: get_cpu_cores(),
        memory_total: get_memory_total(),
    }
}

fn get_architecture() -> String {
    // Doğrudan uname -m komutunu kullan
    let output = Command::new("uname")
        .arg("-m")
        .output();

    if let Ok(output) = output {
        let arch = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !arch.is_empty() {
            return arch;
        }
    }

    // Alternatif olarak std kütüphanesini kullan
    std::env::consts::ARCH.to_string()
}

fn get_hostname() -> String {
    // /etc/hostname dosyasını okuma
    if let Ok(hostname) = fs::read_to_string("/etc/hostname") {
        let hostname = hostname.trim();
        if !hostname.is_empty() {
            return hostname.to_string();
        }
    }

    // Alternatif olarak hostname komutunu kullan
    let output = Command::new("hostname")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    output.unwrap_or_else(|_| "unknown".to_string())
}

fn get_username() -> String {
    // Önce çevre değişkenlerini kontrol et
    if let Ok(user) = std::env::var("USER") {
        if !user.is_empty() {
            return user;
        }
    }

    // Alternatif olarak whoami komutunu kullan
    let output = Command::new("whoami")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    output.unwrap_or_else(|_| "unknown".to_string())
}

fn get_cpu_cores() -> usize {
    // /proc/cpuinfo dosyasından CPU çekirdek sayısını okuma
    if let Ok(content) = fs::read_to_string("/proc/cpuinfo") {
        let cores = content.lines()
            .filter(|line| line.starts_with("processor"))
            .count();
        if cores > 0 {
            return cores;
        }
    }

    // Alternatif olarak nproc komutunu kullan
    let output = Command::new("nproc")
        .output();

    if let Ok(output) = output {
        if let Ok(cores) = String::from_utf8_lossy(&output.stdout).trim().parse::<usize>() {
            return cores;
        }
    }

    // Son çare olarak std kütüphanesini kullan
    std::thread::available_parallelism().map_or(1, |p| p.get())
}

fn get_memory_total() -> u64 {
    // /proc/meminfo dosyasından toplam bellek miktarını okuma
    if let Ok(content) = fs::read_to_string("/proc/meminfo") {
        for line in content.lines() {
            if line.starts_with("MemTotal:") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(kb) = parts[1].parse::<u64>() {
                        return kb * 1024; // KB to bytes
                    }
                }
            }
        }
    }

    // Alternatif olarak free komutunu kullan (daha az güvenilir parse etme)
    let output = Command::new("free")
        .arg("-b") // bytes cinsinden
        .output();

    if let Ok(output) = output {
        let output_str = String::from_utf8_lossy(&output.stdout);
        let lines: Vec<&str> = output_str.lines().collect();
        if lines.len() >= 2 {
            let parts: Vec<&str> = lines[1].split_whitespace().collect();
            if parts.len() >= 2 {
                if let Ok(bytes) = parts[1].parse::<u64>() {
                    return bytes;
                }
            }
        }
    }

    // Varsayılan değer
    0 // Return 0 if failed
}

// --- Process Management --- (Existing code + Enhancements)

/// Linux ta çalışan işlemleri listeler
pub fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    let mut processes = Vec::new();

    // /proc dizinini okuyarak işlemleri listele (Prefer this method)
    match fs::read_dir("/proc") {
        Ok(entries) => {
            for entry in entries.filter_map(Result::ok) {
                let file_name = entry.file_name();
                let file_name_str = file_name.to_string_lossy();

                // Sadece sayısal dizinleri işle (PID ler)
                if let Ok(pid) = file_name_str.parse::<u32>() {
                    if let Some(process_info) = get_process_info_from_proc(pid) {
                        processes.push(process_info);
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("Warning: Failed to read /proc directory: {}. Falling back to ps.", e);
            // Fallback to ps if /proc is unavailable
            return list_processes_ps();
        }
    }

    Ok(processes)
}

// Helper function using /proc
fn get_process_info_from_proc(pid: u32) -> Option<ProcessInfo> {
    let stat_path = format!("/proc/{}/stat", pid);
    let cmdline_path = format!("/proc/{}/cmdline", pid);
    let status_path = format!("/proc/{}/status", pid);

    let mut name = String::new();
    let mut state_char = \'?\";
    let mut memory_usage = 0u64;

    // İşlem adını oku (cmdline daha güvenilir)
    if let Ok(content) = fs::read_to_string(&cmdline_path) {
        // cmdline null karakterlerle ayrılır
        name = content.split(\'\0\').next().unwrap_or("").trim().to_string();
        // Bazen sadece path olur, dosya adını al
        if let Some(file_name) = Path::new(&name).file_name() {
            name = file_name.to_string_lossy().into_owned();
        }
    }

    // İşlem adı boşsa veya garipse stat dosyasından oku
    if name.is_empty() || name.contains(\
