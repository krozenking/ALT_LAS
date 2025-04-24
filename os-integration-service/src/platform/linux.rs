use crate::platform::PlatformInfo;
use std::process::Command;
use std::fs;

/// Linux sürüm bilgisini döndürür
pub fn get_linux_version() -> String {
    // /etc/os-release dosyasından dağıtım bilgisini okuma
    if let Ok(content) = fs::read_to_string("/etc/os-release") {
        for line in content.lines() {
            if line.starts_with("PRETTY_NAME=") {
                return line.trim_start_matches("PRETTY_NAME=")
                    .trim_matches('"')
                    .to_string();
            }
        }
    }
    
    // Alternatif olarak uname komutunu kullan
    let output = Command::new("uname")
        .arg("-a")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());
    
    output.unwrap_or_else(|_| "Linux (Unknown Version)".to_string())
}

/// Linux için detaylı platform bilgilerini döndürür
pub fn get_detailed_info() -> PlatformInfo {
    PlatformInfo {
        os_type: "Linux".to_string(),
        os_version: get_linux_version(),
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
    // /proc/cpuinfo dosyasından CPU çekirdek sayısını okuma
    if let Ok(content) = fs::read_to_string("/proc/cpuinfo") {
        let cores = content.lines()
            .filter(|line| line.starts_with("processor"))
            .count();
        if cores > 0 {
            return cores;
        }
    }
    
    // Alternatif olarak std kütüphanesini kullan
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
    
    // Varsayılan değer
    4 * 1024 * 1024 * 1024 // 4 GB
}
