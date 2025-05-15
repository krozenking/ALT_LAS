use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio, Child};
use std::io::{BufReader, BufRead, Write};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use std::thread;
use log::{info, error, warn, debug};
use cfg_if::cfg_if;
use tokio::sync::mpsc;
use tokio::time::sleep;
use std::path::Path;

#[derive(Debug, Serialize)]
struct ProcessInfo {
    pid: u32,
    name: String,
    cpu_usage: f32,
    memory_usage: u64,
    status: String,
    command_line: Option<String>,
    user: Option<String>,
    start_time: Option<String>,
}

#[derive(Debug, Serialize)]
struct RunningProcess {
    id: String,
    pid: u32,
    name: String,
    status: String,
    start_time: String,
    output: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct ProcessQuery {
    pid: Option<u32>,
    name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RunProcessRequest {
    command: String,
    args: Option<Vec<String>>,
    working_dir: Option<String>,
    environment: Option<HashMap<String, String>>,
    timeout_seconds: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct ProcessControlRequest {
    pid: u32,
}

#[derive(Debug, Deserialize)]
pub struct ProcessInputRequest {
    id: String,
    input: String,
}

// Çalışan işlemleri takip etmek için global depo
lazy_static::lazy_static! {
    static ref RUNNING_PROCESSES: Arc<Mutex<HashMap<String, RunningProcessInfo>>> = Arc::new(Mutex::new(HashMap::new()));
}

struct RunningProcessInfo {
    pid: u32,
    name: String,
    status: String,
    start_time: Instant,
    output: Arc<Mutex<Vec<String>>>,
    child: Option<Child>,
    stdin: Option<std::process::ChildStdin>,
}

/// Çalışan işlemleri listeleyen API endpoint'i
pub async fn list_processes(query: web::Query<ProcessQuery>) -> impl Responder {
    info!("Çalışan işlemler listeleniyor");
    
    match get_processes() {
        Ok(mut processes) => {
            // Filtreleme
            if let Some(pid) = query.pid {
                processes.retain(|p| p.pid == pid);
            }
            
            if let Some(name) = &query.name {
                let name_lower = name.to_lowercase();
                processes.retain(|p| p.name.to_lowercase().contains(&name_lower));
            }
            
            HttpResponse::Ok().json(processes)
        },
        Err(e) => {
            error!("İşlemler listelenirken hata oluştu: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("İşlemler listelenirken hata oluştu: {}", e)
            }))
        }
    }
}

/// İşlem başlatan API endpoint'i
pub async fn run_process(data: web::Json<RunProcessRequest>) -> impl Responder {
    let command = &data.command;
    let args = data.args.clone().unwrap_or_vec();
    let working_dir = data.working_dir.clone().unwrap_or_else(|| std::env::current_dir().unwrap_or_default().to_string_lossy().to_string());
    
    info!("İşlem başlatılıyor: {} {:?} (çalışma dizini: {})", command, args, working_dir);
    
    // Çalışma dizininin varlığını kontrol et
    if !Path::new(&working_dir).exists() {
        error!("Çalışma dizini bulunamadı: {}", working_dir);
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Çalışma dizini bulunamadı: {}", working_dir)
        }));
    }
    
    // Komutun varlığını kontrol et
    let command_exists = if command.contains('/') || command.contains('\\') {
        // Tam yol belirtilmiş
        Path::new(command).exists()
    } else {
        // PATH'de ara
        which::which(command).is_ok()
    };
    
    if !command_exists {
        error!("Komut bulunamadı: {}", command);
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Komut bulunamadı: {}", command)
        }));
    }
    
    // Komut çalıştırma
    let mut cmd = Command::new(command);
    cmd.args(&args)
       .current_dir(&working_dir)
       .stdout(Stdio::piped())
       .stderr(Stdio::piped())
       .stdin(Stdio::piped());
    
    // Çevre değişkenlerini ayarla
    if let Some(env_vars) = &data.environment {
        for (key, value) in env_vars {
            cmd.env(key, value);
        }
    }
    
    // İşlemi başlat
    match cmd.spawn() {
        Ok(mut child) => {
            let pid = child.id();
            let process_id = uuid::Uuid::new_v4().to_string();
            let start_time = Instant::now();
            
            // Stdout ve stderr için kanallar
            let output = Arc::new(Mutex::new(Vec::new()));
            let output_clone = Arc::clone(&output);
            
            let stdout = child.stdout.take();
            let stderr = child.stderr.take();
            let stdin = child.stdin.take();
            
            // Çıktıları toplamak için arka plan görevi
            if let Some(stdout) = stdout {
                let output_clone = Arc::clone(&output);
                thread::spawn(move || {
                    let reader = BufReader::new(stdout);
                    for line in reader.lines() {
                        if let Ok(line) = line {
                            let mut output = output_clone.lock().unwrap();
                            output.push(format!("stdout: {}", line));
                            if output.len() > 1000 {
                                output.remove(0); // Çok büyümesini önle
                            }
                        }
                    }
                });
            }
            
            if let Some(stderr) = stderr {
                let output_clone = Arc::clone(&output);
                thread::spawn(move || {
                    let reader = BufReader::new(stderr);
                    for line in reader.lines() {
                        if let Ok(line) = line {
                            let mut output = output_clone.lock().unwrap();
                            output.push(format!("stderr: {}", line));
                            if output.len() > 1000 {
                                output.remove(0); // Çok büyümesini önle
                            }
                        }
                    }
                });
            }
            
            // İşlemi kaydet
            {
                let mut processes = RUNNING_PROCESSES.lock().unwrap();
                processes.insert(process_id.clone(), RunningProcessInfo {
                    pid,
                    name: command.clone(),
                    status: "Running".to_string(),
                    start_time,
                    output: output_clone,
                    child: Some(child),
                    stdin,
                });
            }
            
            // Zaman aşımı varsa, işlemi sonlandırmak için zamanlayıcı başlat
            if let Some(timeout_seconds) = data.timeout_seconds {
                let process_id_clone = process_id.clone();
                tokio::spawn(async move {
                    sleep(Duration::from_secs(timeout_seconds)).await;
                    
                    let mut processes = RUNNING_PROCESSES.lock().unwrap();
                    if let Some(process_info) = processes.get_mut(&process_id_clone) {
                        if process_info.status == "Running" {
                            warn!("İşlem zaman aşımına uğradı, sonlandırılıyor: {} (PID: {})", process_info.name, process_info.pid);
                            
                            if let Some(child) = &mut process_info.child {
                                let _ = child.kill();
                            }
                            
                            process_info.status = "Timeout".to_string();
                            process_info.child = None;
                            process_info.stdin = None;
                        }
                    }
                });
            }
            
            // Başarılı yanıt
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "id": process_id,
                "pid": pid,
                "command": command,
                "args": args,
                "working_dir": working_dir
            }))
        },
        Err(e) => {
            error!("İşlem başlatılamadı: {} - Hata: {}", command, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("İşlem başlatılamadı: {}", e)
            }))
        }
    }
}

/// Çalışan işlemi sonlandıran API endpoint'i
pub async fn kill_process(data: web::Json<ProcessControlRequest>) -> impl Responder {
    let pid = data.pid;
    info!("İşlem sonlandırılıyor: PID {}", pid);
    
    // Önce kendi yönettiğimiz işlemlerde ara
    {
        let mut processes = RUNNING_PROCESSES.lock().unwrap();
        let mut process_id_to_remove = None;
        
        for (id, process_info) in processes.iter_mut() {
            if process_info.pid == pid {
                if let Some(child) = &mut process_info.child {
                    let kill_result = child.kill();
                    if kill_result.is_ok() {
                        process_info.status = "Terminated".to_string();
                        process_info.child = None;
                        process_info.stdin = None;
                        process_id_to_remove = Some(id.clone());
                        
                        return HttpResponse::Ok().json(serde_json::json!({
                            "success": true,
                            "pid": pid,
                            "status": "Terminated"
                        }));
                    }
                }
            }
        }
        
        // İşlemi listeden kaldır
        if let Some(id) = process_id_to_remove {
            processes.remove(&id);
        }
    }
    
    // Kendi yönettiğimiz işlemlerde bulunamadıysa, sistem çapında sonlandırmayı dene
    let result = kill_system_process(pid);
    
    match result {
        Ok(_) => {
            info!("İşlem başarıyla sonlandırıldı: PID {}", pid);
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "pid": pid,
                "status": "Terminated"
            }))
        },
        Err(e) => {
            error!("İşlem sonlandırılamadı: PID {} - Hata: {}", pid, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("İşlem sonlandırılamadı: {}", e)
            }))
        }
    }
}

/// Çalışan işleme girdi gönderen API endpoint'i
pub async fn send_input_to_process(data: web::Json<ProcessInputRequest>) -> impl Responder {
    let id = &data.id;
    let input = &data.input;
    
    info!("İşleme girdi gönderiliyor: ID {}", id);
    
    let mut processes = RUNNING_PROCESSES.lock().unwrap();
    
    if let Some(process_info) = processes.get_mut(id) {
        if process_info.status != "Running" {
            error!("İşlem çalışmıyor: ID {}, durum: {}", id, process_info.status);
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": format!("İşlem çalışmıyor: {}", process_info.status)
            }));
        }
        
        if let Some(stdin) = &mut process_info.stdin {
            match stdin.write_all(format!("{}\n", input).as_bytes()) {
                Ok(_) => {
                    info!("Girdi başarıyla gönderildi: ID {}", id);
                    
                    // Girdiyi çıktı listesine ekle
                    let mut output = process_info.output.lock().unwrap();
                    output.push(format!("stdin: {}", input));
                    
                    HttpResponse::Ok().json(serde_json::json!({
                        "success": true,
                        "id": id
                    }))
                },
                Err(e) => {
                    error!("Girdi gönderilemedi: ID {} - Hata: {}", id, e);
                    HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": format!("Girdi gönderilemedi: {}", e)
                    }))
                }
            }
        } else {
            error!("İşlemin stdin akışı yok: ID {}", id);
            HttpResponse::BadRequest().json(serde_json::json!({
                "error": "İşlemin stdin akışı yok"
            }))
        }
    } else {
        error!("İşlem bulunamadı: ID {}", id);
        HttpResponse::NotFound().json(serde_json::json!({
            "error": "İşlem bulunamadı"
        }))
    }
}

/// Çalışan işlemin çıktısını getiren API endpoint'i
pub async fn get_process_output(req: web::Path<String>) -> impl Responder {
    let id = req.into_inner();
    
    debug!("İşlem çıktısı alınıyor: ID {}", id);
    
    let processes = RUNNING_PROCESSES.lock().unwrap();
    
    if let Some(process_info) = processes.get(&id) {
        let output = process_info.output.lock().unwrap();
        let elapsed = process_info.start_time.elapsed();
        
        HttpResponse::Ok().json(serde_json::json!({
            "id": id,
            "pid": process_info.pid,
            "name": process_info.name,
            "status": process_info.status,
            "start_time": format!("{:?}", process_info.start_time),
            "elapsed_seconds": elapsed.as_secs(),
            "output": output.clone()
        }))
    } else {
        error!("İşlem bulunamadı: ID {}", id);
        HttpResponse::NotFound().json(serde_json::json!({
            "error": "İşlem bulunamadı"
        }))
    }
}

/// Çalışan işlemleri getiren API endpoint'i
pub async fn get_running_processes() -> impl Responder {
    debug!("Çalışan işlemler alınıyor");
    
    let processes = RUNNING_PROCESSES.lock().unwrap();
    let mut result = Vec::new();
    
    for (id, process_info) in processes.iter() {
        let output = process_info.output.lock().unwrap();
        
        result.push(RunningProcess {
            id: id.clone(),
            pid: process_info.pid,
            name: process_info.name.clone(),
            status: process_info.status.clone(),
            start_time: format!("{:?}", process_info.start_time),
            output: output.clone(),
        });
    }
    
    HttpResponse::Ok().json(result)
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
        .args(&["-Command", "Get-Process | Select-Object Id, ProcessName, CPU, WorkingSet, StartTime, Path | ConvertTo-Csv -NoTypeInformation"])
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
        if parts.len() >= 6 {
            let pid = parts[0].trim_matches('"').parse::<u32>().unwrap_or(0);
            let name = parts[1].trim_matches('"').to_string();
            let cpu = parts[2].trim_matches('"').parse::<f32>().unwrap_or(0.0);
            let memory = parts[3].trim_matches('"').parse::<u64>().unwrap_or(0);
            let start_time = if parts[4].trim_matches('"').is_empty() { None } else { Some(parts[4].trim_matches('"').to_string()) };
            let command_line = if parts[5].trim_matches('"').is_empty() { None } else { Some(parts[5].trim_matches('"').to_string()) };
            
            // Kullanıcı bilgisini al
            let user = get_windows_process_user(pid);
            
            processes.push(ProcessInfo {
                pid,
                name,
                cpu_usage: cpu,
                memory_usage: memory,
                status: "Running".to_string(),
                command_line,
                user,
                start_time,
            });
        }
    }
    
    Ok(processes)
}

#[cfg(target_os = "windows")]
fn get_windows_process_user(pid: u32) -> Option<String> {
    let output = Command::new("powershell")
        .args(&["-Command", &format!("(Get-Process -Id {} -IncludeUserName -ErrorAction SilentlyContinue).UserName", pid)])
        .output()
        .ok()?;
    
    if output.status.success() {
        let user = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !user.is_empty() {
            return Some(user);
        }
    }
    
    None
}

#[cfg(target_os = "macos")]
fn get_macos_processes() -> Result<Vec<ProcessInfo>, String> {
    // macOS'ta ps komutu ile işlem listesi alma
    let output = Command::new("ps")
        .args(&["-eo", "pid,comm,%cpu,rss,state,user,lstart,command"])
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
        if parts.len() >= 12 {
            let pid = parts[0].parse::<u32>().unwrap_or(0);
            let name = parts[1].to_string();
            let cpu = parts[2].parse::<f32>().unwrap_or(0.0);
            let memory = parts[3].parse::<u64>().unwrap_or(0) * 1024; // KB to bytes
            let status = parts[4].to_string();
            let user = Some(parts[5].to_string());
            
            // Başlangıç zamanı (lstart formatı: Wdy Mmm DD HH:MM:SS YYYY)
            let start_time = if parts.len() >= 11 {
                Some(format!("{} {} {} {} {}", parts[6], parts[7], parts[8], parts[9], parts[10]))
            } else {
                None
            };
            
            // Komut satırı
            let command_line = if parts.len() >= 12 {
                Some(parts[11..].join(" "))
            } else {
                None
            };
            
            processes.push(ProcessInfo {
                pid,
                name,
                cpu_usage: cpu,
                memory_usage: memory,
                status,
                command_line,
                user,
                start_time,
            });
        }
    }
    
    Ok(processes)
}

#[cfg(target_os = "linux")]
fn get_linux_processes() -> Result<Vec<ProcessInfo>, String> {
    // Linux'ta ps komutu ile işlem listesi alma
    let output = Command::new("ps")
        .args(&["-eo", "pid,comm,%cpu,rss,state,user,lstart,cmd"])
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
        if parts.len() >= 12 {
            let pid = parts[0].parse::<u32>().unwrap_or(0);
            let name = parts[1].to_string();
            let cpu = parts[2].parse::<f32>().unwrap_or(0.0);
            let memory = parts[3].parse::<u64>().unwrap_or(0) * 1024; // KB to bytes
            
            // Linux'ta durum kodları
            let status = match parts[4] {
                "R" => "Running".to_string(),
                "S" => "Sleeping".to_string(),
                "D" => "Disk Sleep".to_string(),
                "T" => "Stopped".to_string(),
                "Z" => "Zombie".to_string(),
                s => format!("Unknown ({})", s),
            };
            
            let user = Some(parts[5].to_string());
            
            // Başlangıç zamanı (lstart formatı: Wdy Mmm DD HH:MM:SS YYYY)
            let start_time = if parts.len() >= 11 {
                Some(format!("{} {} {} {} {}", parts[6], parts[7], parts[8], parts[9], parts[10]))
            } else {
                None
            };
            
            // Komut satırı
            let command_line = if parts.len() >= 12 {
                Some(parts[11..].join(" "))
            } else {
                None
            };
            
            processes.push(ProcessInfo {
                pid,
                name,
                cpu_usage: cpu,
                memory_usage: memory,
                status,
                command_line,
                user,
                start_time,
            });
        }
    }
    
    Ok(processes)
}

/// Sistem çapında işlem sonlandırma
fn kill_system_process(pid: u32) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            // Windows'ta taskkill komutu kullan
            let output = Command::new("taskkill")
                .args(&["/F", "/PID", &pid.to_string()])
                .output()
                .map_err(|e| format!("taskkill komutu çalıştırılamadı: {}", e))?;
            
            if !output.status.success() {
                return Err(format!("taskkill komutu başarısız oldu: {}", 
                    String::from_utf8_lossy(&output.stderr)));
            }
        } else {
            // Unix sistemlerde kill komutu kullan
            let output = Command::new("kill")
                .args(&["-9", &pid.to_string()])
                .output()
                .map_err(|e| format!("kill komutu çalıştırılamadı: {}", e))?;
            
            if !output.status.success() {
                return Err(format!("kill komutu başarısız oldu: {}", 
                    String::from_utf8_lossy(&output.stderr)));
            }
        }
    }
    
    Ok(())
}

// Vec için unwrap_or_vec yardımcı metodu
trait UnwrapOrVec<T> {
    fn unwrap_or_vec(self) -> Vec<T>;
}

impl<T> UnwrapOrVec<T> for Option<Vec<T>> {
    fn unwrap_or_vec(self) -> Vec<T> {
        self.unwrap_or_else(Vec::new)
    }
}
