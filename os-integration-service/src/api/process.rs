use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::process::Command;
use log::{info, error};
use cfg_if::cfg_if;

#[derive(Debug, Serialize)]
struct ProcessInfo {
    pid: u32,
    name: String,
    cpu_usage: f32,
    memory_usage: u64,
    status: String,
}

/// Çalışan işlemleri listeleyen API endpoint'i
pub async fn list_processes() -> impl Responder {
    info!("Çalışan işlemler listeleniyor");
    
    match get_processes() {
        Ok(processes) => HttpResponse::Ok().json(processes),
        Err(e) => {
            error!("İşlemler listelenirken hata oluştu: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("İşlemler listelenirken hata oluştu: {}", e)
            }))
        }
    }
}

/// Platform bağımsız işlem listesi alma
fn get_processes() -> Result<Vec<ProcessInfo>, String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            get_windows_processes()
        } else if #[cfg(target_os = "macos")] {
            get_macos_processes()
        } else if #[cfg(target_os = "linux")] {
            get_linux_processes()
        } else {
            Err("Desteklenmeyen işletim sistemi".to_string())
        }
    }
}

#[cfg(target_os = "windows")]
fn get_windows_processes() -> Result<Vec<ProcessInfo>, String> {
    // Windows'ta PowerShell ile işlem listesi alma
    let output = Command::new("powershell")
        .args(&["-Command", "Get-Process | Select-Object Id, ProcessName, CPU, WorkingSet | ConvertTo-Csv -NoTypeInformation"])
        .output()
        .map_err(|e| format!("PowerShell komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("PowerShell komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut processes = Vec::new();
    
    // CSV çıktısını işleme
    for (i, line) in output_str.lines().enumerate() {
        if i == 0 { continue; } // Başlık satırını atla
        
        let parts: Vec<&str> = line.split(',').collect();
        if parts.len() >= 4 {
            let pid = parts[0].trim_matches('"').parse::<u32>().unwrap_or(0);
            let name = parts[1].trim_matches('"').to_string();
            let cpu = parts[2].trim_matches('"').parse::<f32>().unwrap_or(0.0);
            let memory = parts[3].trim_matches('"').parse::<u64>().unwrap_or(0);
            
            processes.push(ProcessInfo {
                pid,
                name,
                cpu_usage: cpu,
                memory_usage: memory,
                status: "Running".to_string(),
            });
        }
    }
    
    Ok(processes)
}

#[cfg(target_os = "macos")]
fn get_macos_processes() -> Result<Vec<ProcessInfo>, String> {
    // macOS'ta ps komutu ile işlem listesi alma
    let output = Command::new("ps")
        .args(&["-eo", "pid,comm,%cpu,rss,state"])
        .output()
        .map_err(|e| format!("ps komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("ps komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut processes = Vec::new();
    
    // Çıktıyı işleme
    for (i, line) in output_str.lines().enumerate() {
        if i == 0 { continue; } // Başlık satırını atla
        
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 5 {
            let pid = parts[0].parse::<u32>().unwrap_or(0);
            let name = parts[1].to_string();
            let cpu = parts[2].parse::<f32>().unwrap_or(0.0);
            let memory = parts[3].parse::<u64>().unwrap_or(0) * 1024; // KB to bytes
            let status = parts[4].to_string();
            
            processes.push(ProcessInfo {
                pid,
                name,
                cpu_usage: cpu,
                memory_usage: memory,
                status,
            });
        }
    }
    
    Ok(processes)
}

#[cfg(target_os = "linux")]
fn get_linux_processes() -> Result<Vec<ProcessInfo>, String> {
    // Linux'ta ps komutu ile işlem listesi alma
    let output = Command::new("ps")
        .args(&["-eo", "pid,comm,%cpu,rss,state"])
        .output()
        .map_err(|e| format!("ps komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("ps komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut processes = Vec::new();
    
    // Çıktıyı işleme
    for (i, line) in output_str.lines().enumerate() {
        if i == 0 { continue; } // Başlık satırını atla
        
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 5 {
            let pid = parts[0].parse::<u32>().unwrap_or(0);
            let name = parts[1].to_string();
            let cpu = parts[2].parse::<f32>().unwrap_or(0.0);
            let memory = parts[3].parse::<u64>().unwrap_or(0) * 1024; // KB to bytes
            let status = parts[4].to_string();
            
            processes.push(ProcessInfo {
                pid,
                name,
                cpu_usage: cpu,
                memory_usage: memory,
                status,
            });
        }
    }
    
    Ok(processes)
}
