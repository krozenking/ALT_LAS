use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use log::{info, error};
use cfg_if::cfg_if;
use std::process::Command;
use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize)]
struct ScreenshotInfo {
    path: String,
    width: u32,
    height: u32,
    format: String,
    timestamp: u64,
    size: u64,
}

#[derive(Debug, Deserialize)]
pub struct ScreenshotQuery {
    output_dir: Option<String>,
    format: Option<String>,
}

/// Ekran görüntüsü alan API endpoint'i
pub async fn capture_screen(query: web::Query<ScreenshotQuery>) -> impl Responder {
    info!("Ekran görüntüsü alınıyor");
    
    let output_dir = query.output_dir.clone().unwrap_or_else(|| "/tmp".to_string());
    let format = query.format.clone().unwrap_or_else(|| "png".to_string());
    
    // Çıktı dizininin varlığını kontrol et
    let output_path = Path::new(&output_dir);
    if !output_path.exists() {
        if let Err(e) = fs::create_dir_all(output_path) {
            error!("Çıktı dizini oluşturulamadı: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Çıktı dizini oluşturulamadı: {}", e)
            }));
        }
    }
    
    // Zaman damgası oluştur
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    
    // Dosya adı oluştur
    let filename = format!("screenshot_{}.{}", timestamp, format);
    let filepath = output_path.join(filename);
    
    // Ekran görüntüsü al
    match capture_screenshot(&filepath.to_string_lossy(), &format) {
        Ok((width, height)) => {
            // Dosya boyutunu al
            let size = fs::metadata(&filepath)
                .map(|m| m.len())
                .unwrap_or(0);
            
            let screenshot_info = ScreenshotInfo {
                path: filepath.to_string_lossy().to_string(),
                width,
                height,
                format: format.clone(),
                timestamp,
                size,
            };
            
            HttpResponse::Ok().json(screenshot_info)
        },
        Err(e) => {
            error!("Ekran görüntüsü alınamadı: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Ekran görüntüsü alınamadı: {}", e)
            }))
        }
    }
}

/// Platform bağımsız ekran görüntüsü alma
fn capture_screenshot(filepath: &str, format: &str) -> Result<(u32, u32), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            capture_windows_screenshot(filepath, format)
        } else if #[cfg(target_os = "macos")] {
            capture_macos_screenshot(filepath, format)
        } else if #[cfg(target_os = "linux")] {
            capture_linux_screenshot(filepath, format)
        } else {
            Err("Desteklenmeyen işletim sistemi".to_string())
        }
    }
}

#[cfg(target_os = "windows")]
fn capture_windows_screenshot(filepath: &str, format: &str) -> Result<(u32, u32), String> {
    // Windows'ta PowerShell ile ekran görüntüsü alma
    // Not: Gerçek uygulamada Windows API kullanılacak
    let script = format!(
        "Add-Type -AssemblyName System.Windows.Forms,System.Drawing;
        $screens = [System.Windows.Forms.Screen]::AllScreens;
        $top = $left = [System.Int32]::MaxValue;
        $width = $height = 0;
        
        foreach ($screen in $screens) {{
            $top = [System.Math]::Min($top, $screen.Bounds.Top);
            $left = [System.Math]::Min($left, $screen.Bounds.Left);
            $width = [System.Math]::Max($width, $screen.Bounds.Right);
            $height = [System.Math]::Max($height, $screen.Bounds.Bottom);
        }}
        
        $width = $width - $left;
        $height = $height - $top;
        
        $bounds = [System.Drawing.Rectangle]::FromLTRB($left, $top, $left + $width, $top + $height);
        $bitmap = New-Object System.Drawing.Bitmap $width, $height;
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
        $graphics.CopyFromScreen($bounds.Left, $bounds.Top, 0, 0, $bounds.Size);
        $bitmap.Save('{}', [System.Drawing.Imaging.ImageFormat]::{});
        Write-Output \"$width,$height\";",
        filepath,
        format.to_uppercase()
    );
    
    let output = Command::new("powershell")
        .args(&["-Command", &script])
        .output()
        .map_err(|e| format!("PowerShell komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("PowerShell komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    let output_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let dimensions: Vec<&str> = output_str.split(',').collect();
    
    if dimensions.len() == 2 {
        let width = dimensions[0].parse::<u32>().unwrap_or(0);
        let height = dimensions[1].parse::<u32>().unwrap_or(0);
        Ok((width, height))
    } else {
        Err("Ekran boyutları alınamadı".to_string())
    }
}

#[cfg(target_os = "macos")]
fn capture_macos_screenshot(filepath: &str, format: &str) -> Result<(u32, u32), String> {
    // macOS'ta screencapture komutu ile ekran görüntüsü alma
    let format_flag = match format.to_lowercase().as_str() {
        "jpg" | "jpeg" => "-t jpg",
        "png" => "-t png",
        "pdf" => "-t pdf",
        "tiff" => "-t tiff",
        _ => "-t png", // Varsayılan olarak PNG
    };
    
    let output = Command::new("screencapture")
        .args(&[format_flag, "-x", filepath])
        .output()
        .map_err(|e| format!("screencapture komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("screencapture komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Görüntü boyutlarını almak için sips komutu kullan
    let output = Command::new("sips")
        .args(&["-g", "pixelWidth", "-g", "pixelHeight", filepath])
        .output()
        .map_err(|e| format!("sips komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("sips komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut width = 0;
    let mut height = 0;
    
    for line in output_str.lines() {
        if line.contains("pixelWidth") {
            if let Some(w) = line.split(':').last() {
                width = w.trim().parse::<u32>().unwrap_or(0);
            }
        } else if line.contains("pixelHeight") {
            if let Some(h) = line.split(':').last() {
                height = h.trim().parse::<u32>().unwrap_or(0);
            }
        }
    }
    
    Ok((width, height))
}

#[cfg(target_os = "linux")]
fn capture_linux_screenshot(filepath: &str, format: &str) -> Result<(u32, u32), String> {
    // Linux'ta import (ImageMagick) veya gnome-screenshot ile ekran görüntüsü alma
    let has_import = Command::new("which")
        .arg("import")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);
    
    let has_gnome_screenshot = Command::new("which")
        .arg("gnome-screenshot")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);
    
    let output = if has_import {
        Command::new("import")
            .args(&["-window", "root", filepath])
            .output()
            .map_err(|e| format!("import komutu çalıştırılamadı: {}", e))?
    } else if has_gnome_screenshot {
        Command::new("gnome-screenshot")
            .args(&["-f", filepath])
            .output()
            .map_err(|e| format!("gnome-screenshot komutu çalıştırılamadı: {}", e))?
    } else {
        return Err("Ekran görüntüsü alma aracı bulunamadı (import veya gnome-screenshot)".to_string());
    };
    
    if !output.status.success() {
        return Err(format!("Ekran görüntüsü alma komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Görüntü boyutlarını almak için identify (ImageMagick) kullan
    let output = Command::new("identify")
        .args(&["-format", "%w,%h", filepath])
        .output()
        .map_err(|e| format!("identify komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("identify komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    let output_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let dimensions: Vec<&str> = output_str.split(',').collect();
    
    if dimensions.len() == 2 {
        let width = dimensions[0].parse::<u32>().unwrap_or(0);
        let height = dimensions[1].parse::<u32>().unwrap_or(0);
        Ok((width, height))
    } else {
        Err("Ekran boyutları alınamadı".to_string())
    }
}
