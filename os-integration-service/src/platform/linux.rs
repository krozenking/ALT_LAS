use crate::platform::PlatformInfo;
use std::process::Command;
use std::fs;
use std::io::{self, Read};

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
    
    // Alternatif olarak free komutunu kullan
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
    4 * 1024 * 1024 * 1024 // 4 GB
}

/// Linux'ta çalışan işlemleri listeler
pub fn list_processes() -> Vec<ProcessInfo> {
    let mut processes = Vec::new();
    
    // /proc dizinini okuyarak işlemleri listele
    if let Ok(entries) = fs::read_dir("/proc") {
        for entry in entries.filter_map(Result::ok) {
            let file_name = entry.file_name();
            let file_name_str = file_name.to_string_lossy();
            
            // Sadece sayısal dizinleri işle (PID'ler)
            if let Ok(pid) = file_name_str.parse::<u32>() {
                if let Some(process_info) = get_process_info(pid) {
                    processes.push(process_info);
                }
            }
        }
    }
    
    // Alternatif olarak ps komutunu kullan
    if processes.is_empty() {
        let output = Command::new("ps")
            .args(&["-eo", "pid,rss,state,comm"])
            .output();
            
        if let Ok(output) = output {
            let output_str = String::from_utf8_lossy(&output.stdout);
            
            // İlk satırı atlayarak (başlık satırı) işlemleri işliyoruz
            for line in output_str.lines().skip(1) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 4 {
                    if let Ok(pid) = parts[0].parse::<u32>() {
                        let memory_kb = parts[1].parse::<u64>().unwrap_or(0) * 1024; // KB to bytes
                        let state = parts[2].to_string();
                        let name = parts[3..].join(" ");
                        
                        let status = match state.as_str() {
                            "R" => "Running".to_string(),
                            "S" => "Sleeping".to_string(),
                            "D" => "Disk Sleep".to_string(),
                            "T" => "Stopped".to_string(),
                            "Z" => "Zombie".to_string(),
                            _ => format!("Unknown ({})", state),
                        };
                        
                        processes.push(ProcessInfo {
                            pid,
                            name,
                            memory_usage: memory_kb,
                            status,
                        });
                    }
                }
            }
        }
    }
    
    processes
}

fn get_process_info(pid: u32) -> Option<ProcessInfo> {
    // /proc/{pid}/stat dosyasından işlem bilgilerini oku
    let stat_path = format!("/proc/{}/stat", pid);
    let cmdline_path = format!("/proc/{}/cmdline", pid);
    let status_path = format!("/proc/{}/status", pid);
    
    let mut name = String::new();
    let mut state = String::new();
    let mut memory_usage = 0u64;
    
    // İşlem adını oku
    if let Ok(content) = fs::read_to_string(&cmdline_path) {
        name = content.replace('\0', " ").trim().to_string();
    }
    
    // İşlem adı boşsa stat dosyasından oku
    if name.is_empty() {
        if let Ok(content) = fs::read_to_string(&stat_path) {
            let parts: Vec<&str> = content.split_whitespace().collect();
            if parts.len() > 1 {
                name = parts[1].trim_matches(|c| c == '(' || c == ')').to_string();
                
                if parts.len() > 2 {
                    state = match parts[2] {
                        "R" => "Running".to_string(),
                        "S" => "Sleeping".to_string(),
                        "D" => "Disk Sleep".to_string(),
                        "T" => "Stopped".to_string(),
                        "Z" => "Zombie".to_string(),
                        s => format!("Unknown ({})", s),
                    };
                }
            }
        }
    }
    
    // Bellek kullanımını oku
    if let Ok(content) = fs::read_to_string(&status_path) {
        for line in content.lines() {
            if line.starts_with("VmRSS:") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(kb) = parts[1].parse::<u64>() {
                        memory_usage = kb * 1024; // KB to bytes
                        break;
                    }
                }
            }
        }
    }
    
    if !name.is_empty() {
        Some(ProcessInfo {
            pid,
            name,
            memory_usage,
            status: state,
        })
    } else {
        None
    }
}

/// İşlem bilgilerini içeren yapı
#[derive(Debug, Clone, serde::Serialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory_usage: u64,
    pub status: String,
}
