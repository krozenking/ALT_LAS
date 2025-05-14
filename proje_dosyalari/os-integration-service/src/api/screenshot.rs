use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use log::{info, error, warn, debug};
use cfg_if::cfg_if;
use std::process::Command;
use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use std::io::Write;
use base64;

#[derive(Debug, Serialize)]
struct ScreenshotInfo {
    path: String,
    width: u32,
    height: u32,
    format: String,
    timestamp: u64,
    size: u64,
    base64_data: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ScreenshotQuery {
    output_dir: Option<String>,
    format: Option<String>,
    include_base64: Option<bool>,
    display: Option<i32>,
}

/// Ekran görüntüsü alan API endpoint'i
pub async fn capture_screen(query: web::Query<ScreenshotQuery>) -> impl Responder {
    info!("Ekran görüntüsü alınıyor");
    
    let output_dir = query.output_dir.clone().unwrap_or_else(|| "/tmp".to_string());
    let format = query.format.clone().unwrap_or_else(|| "png".to_string());
    let include_base64 = query.include_base64.unwrap_or(false);
    let display = query.display.unwrap_or(-1); // -1 tüm ekranlar, 0+ belirli ekran
    
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
    match capture_screenshot(&filepath.to_string_lossy(), &format, display) {
        Ok((width, height)) => {
            // Dosya boyutunu al
            let size = fs::metadata(&filepath)
                .map(|m| m.len())
                .unwrap_or(0);
            
            // Base64 kodlaması isteniyorsa
            let base64_data = if include_base64 {
                match fs::read(&filepath) {
                    Ok(data) => {
                        let encoded = base64::encode(&data);
                        Some(encoded)
                    },
                    Err(e) => {
                        warn!("Dosya base64 kodlaması için okunamadı: {}", e);
                        None
                    }
                }
            } else {
                None
            };
            
            let screenshot_info = ScreenshotInfo {
                path: filepath.to_string_lossy().to_string(),
                width,
                height,
                format: format.clone(),
                timestamp,
                size,
                base64_data,
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

/// Belirli bir bölgenin ekran görüntüsünü alan API endpoint'i
pub async fn capture_region(data: web::Json<RegionCaptureRequest>) -> impl Responder {
    info!("Belirli bölgenin ekran görüntüsü alınıyor: x={}, y={}, width={}, height={}", 
          data.x, data.y, data.width, data.height);
    
    let output_dir = data.output_dir.clone().unwrap_or_else(|| "/tmp".to_string());
    let format = data.format.clone().unwrap_or_else(|| "png".to_string());
    let include_base64 = data.include_base64.unwrap_or(false);
    
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
    let filename = format!("region_{}_{}_{}_{}.{}", data.x, data.y, data.width, data.height, format);
    let filepath = output_path.join(filename);
    
    // Bölge ekran görüntüsü al
    match capture_region_screenshot(
        &filepath.to_string_lossy(), 
        &format, 
        data.x, 
        data.y, 
        data.width, 
        data.height
    ) {
        Ok(()) => {
            // Dosya boyutunu al
            let size = fs::metadata(&filepath)
                .map(|m| m.len())
                .unwrap_or(0);
            
            // Base64 kodlaması isteniyorsa
            let base64_data = if include_base64 {
                match fs::read(&filepath) {
                    Ok(data) => {
                        let encoded = base64::encode(&data);
                        Some(encoded)
                    },
                    Err(e) => {
                        warn!("Dosya base64 kodlaması için okunamadı: {}", e);
                        None
                    }
                }
            } else {
                None
            };
            
            let screenshot_info = ScreenshotInfo {
                path: filepath.to_string_lossy().to_string(),
                width: data.width,
                height: data.height,
                format: format.clone(),
                timestamp,
                size,
                base64_data,
            };
            
            HttpResponse::Ok().json(screenshot_info)
        },
        Err(e) => {
            error!("Bölge ekran görüntüsü alınamadı: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Bölge ekran görüntüsü alınamadı: {}", e)
            }))
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct RegionCaptureRequest {
    x: u32,
    y: u32,
    width: u32,
    height: u32,
    output_dir: Option<String>,
    format: Option<String>,
    include_base64: Option<bool>,
}

/// Platform bağımsız ekran görüntüsü alma
fn capture_screenshot(filepath: &str, format: &str, display: i32) -> Result<(u32, u32), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            capture_windows_screenshot(filepath, format, display)
        } else if #[cfg(target_os = "macos")] {
            capture_macos_screenshot(filepath, format, display)
        } else if #[cfg(target_os = "linux")] {
            capture_linux_screenshot(filepath, format, display)
        } else {
            Err("Desteklenmeyen işletim sistemi".to_string())
        }
    }
}

/// Platform bağımsız bölge ekran görüntüsü alma
fn capture_region_screenshot(filepath: &str, format: &str, x: u32, y: u32, width: u32, height: u32) -> Result<(), String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            capture_windows_region_screenshot(filepath, format, x, y, width, height)
        } else if #[cfg(target_os = "macos")] {
            capture_macos_region_screenshot(filepath, format, x, y, width, height)
        } else if #[cfg(target_os = "linux")] {
            capture_linux_region_screenshot(filepath, format, x, y, width, height)
        } else {
            Err("Desteklenmeyen işletim sistemi".to_string())
        }
    }
}

#[cfg(target_os = "windows")]
fn capture_windows_screenshot(filepath: &str, format: &str, display: i32) -> Result<(u32, u32), String> {
    // Windows'ta PowerShell ile ekran görüntüsü alma
    // Not: Gerçek uygulamada Windows API kullanılacak
    let script = if display < 0 {
        // Tüm ekranlar
        format!(
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
        )
    } else {
        // Belirli ekran
        format!(
            "Add-Type -AssemblyName System.Windows.Forms,System.Drawing;
            $screens = [System.Windows.Forms.Screen]::AllScreens;
            if ({0} -ge $screens.Length) {{
                Write-Error \"Display index out of range\";
                exit 1;
            }}
            
            $screen = $screens[{0}];
            $bounds = $screen.Bounds;
            $width = $bounds.Width;
            $height = $bounds.Height;
            
            $bitmap = New-Object System.Drawing.Bitmap $width, $height;
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
            $graphics.CopyFromScreen($bounds.Left, $bounds.Top, 0, 0, $bounds.Size);
            $bitmap.Save('{1}', [System.Drawing.Imaging.ImageFormat]::{2});
            Write-Output \"$width,$height\";",
            display,
            filepath,
            format.to_uppercase()
        )
    };
    
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

#[cfg(target_os = "windows")]
fn capture_windows_region_screenshot(filepath: &str, format: &str, x: u32, y: u32, width: u32, height: u32) -> Result<(), String> {
    // Windows'ta PowerShell ile bölge ekran görüntüsü alma
    let script = format!(
        "Add-Type -AssemblyName System.Windows.Forms,System.Drawing;
        $bounds = [System.Drawing.Rectangle]::FromLTRB({0}, {1}, {0} + {2}, {1} + {3});
        $bitmap = New-Object System.Drawing.Bitmap {2}, {3};
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
        $graphics.CopyFromScreen($bounds.Left, $bounds.Top, 0, 0, $bounds.Size);
        $bitmap.Save('{4}', [System.Drawing.Imaging.ImageFormat]::{5});",
        x, y, width, height, filepath, format.to_uppercase()
    );
    
    let output = Command::new("powershell")
        .args(&["-Command", &script])
        .output()
        .map_err(|e| format!("PowerShell komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("PowerShell komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    Ok(())
}

#[cfg(target_os = "macos")]
fn capture_macos_screenshot(filepath: &str, format: &str, display: i32) -> Result<(u32, u32), String> {
    // macOS'ta screencapture komutu ile ekran görüntüsü alma
    let format_flag = match format.to_lowercase().as_str() {
        "jpg" | "jpeg" => "-t jpg",
        "png" => "-t png",
        "pdf" => "-t pdf",
        "tiff" => "-t tiff",
        _ => "-t png", // Varsayılan olarak PNG
    };
    
    let mut args = vec![format_flag, "-x"];
    
    // Belirli bir ekran için
    if display >= 0 {
        args.push("-D");
        args.push(&display.to_string());
    }
    
    args.push(filepath);
    
    let output = Command::new("screencapture")
        .args(&args)
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

#[cfg(target_os = "macos")]
fn capture_macos_region_screenshot(filepath: &str, format: &str, x: u32, y: u32, width: u32, height: u32) -> Result<(), String> {
    // macOS'ta screencapture komutu ile bölge ekran görüntüsü alma
    let format_flag = match format.to_lowercase().as_str() {
        "jpg" | "jpeg" => "-t jpg",
        "png" => "-t png",
        "pdf" => "-t pdf",
        "tiff" => "-t tiff",
        _ => "-t png", // Varsayılan olarak PNG
    };
    
    // Bölge koordinatlarını belirt
    let region = format!("{},{},{},{}", x, y, width, height);
    
    let output = Command::new("screencapture")
        .args(&[format_flag, "-x", "-R", &region, filepath])
        .output()
        .map_err(|e| format!("screencapture komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("screencapture komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    Ok(())
}

#[cfg(target_os = "linux")]
fn capture_linux_screenshot(filepath: &str, format: &str, display: i32) -> Result<(u32, u32), String> {
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
    
    let has_xrandr = Command::new("which")
        .arg("xrandr")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);
    
    // Belirli bir ekran için
    let display_env = if display >= 0 && has_xrandr {
        // xrandr ile ekran bilgilerini al
        let output = Command::new("xrandr")
            .output()
            .map_err(|e| format!("xrandr komutu çalıştırılamadı: {}", e))?;
        
        if !output.status.success() {
            return Err(format!("xrandr komutu başarısız oldu: {}", 
                String::from_utf8_lossy(&output.stderr)));
        }
        
        let output_str = String::from_utf8_lossy(&output.stdout);
        let mut displays = Vec::new();
        
        for line in output_str.lines() {
            if line.contains(" connected ") {
                displays.push(line.split_whitespace().next().unwrap_or(""));
            }
        }
        
        if display as usize >= displays.len() {
            return Err(format!("Belirtilen ekran indeksi geçersiz: {}", display));
        }
        
        format!("DISPLAY=:{}", display)
    } else {
        "".to_string()
    };
    
    let output = if has_import {
        if display_env.is_empty() {
            Command::new("import")
                .args(&["-window", "root", filepath])
                .output()
                .map_err(|e| format!("import komutu çalıştırılamadı: {}", e))?
        } else {
            Command::new("sh")
                .args(&["-c", &format!("{} import -window root {}", display_env, filepath)])
                .output()
                .map_err(|e| format!("import komutu çalıştırılamadı: {}", e))?
        }
    } else if has_gnome_screenshot {
        if display_env.is_empty() {
            Command::new("gnome-screenshot")
                .args(&["-f", filepath])
                .output()
                .map_err(|e| format!("gnome-screenshot komutu çalıştırılamadı: {}", e))?
        } else {
            Command::new("sh")
                .args(&["-c", &format!("{} gnome-screenshot -f {}", display_env, filepath)])
                .output()
                .map_err(|e| format!("gnome-screenshot komutu çalıştırılamadı: {}", e))?
        }
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

#[cfg(target_os = "linux")]
fn capture_linux_region_screenshot(filepath: &str, format: &str, x: u32, y: u32, width: u32, height: u32) -> Result<(), String> {
    // Linux'ta import (ImageMagick) ile bölge ekran görüntüsü alma
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
        // ImageMagick import komutu ile bölge ekran görüntüsü al
        let geometry = format!("{}x{}+{}+{}", width, height, x, y);
        Command::new("import")
            .args(&["-window", "root", "-crop", &geometry, filepath])
            .output()
            .map_err(|e| format!("import komutu çalıştırılamadı: {}", e))?
    } else if has_gnome_screenshot {
        // gnome-screenshot ile bölge ekran görüntüsü al (tam bölge desteği sınırlı)
        // Önce tam ekran görüntüsü al, sonra kırp
        let temp_file = format!("{}.temp", filepath);
        let result = Command::new("gnome-screenshot")
            .args(&["-f", &temp_file])
            .output()
            .map_err(|e| format!("gnome-screenshot komutu çalıştırılamadı: {}", e))?;
        
        if !result.status.success() {
            return Err(format!("gnome-screenshot komutu başarısız oldu: {}", 
                String::from_utf8_lossy(&result.stderr)));
        }
        
        // ImageMagick convert ile kırp
        let geometry = format!("{}x{}+{}+{}", width, height, x, y);
        let crop_result = Command::new("convert")
            .args(&[&temp_file, "-crop", &geometry, filepath])
            .output()
            .map_err(|e| format!("convert komutu çalıştırılamadı: {}", e))?;
        
        // Geçici dosyayı temizle
        let _ = fs::remove_file(&temp_file);
        
        crop_result
    } else {
        return Err("Ekran görüntüsü alma aracı bulunamadı (import veya gnome-screenshot)".to_string());
    };
    
    if !output.status.success() {
        return Err(format!("Bölge ekran görüntüsü alma komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    Ok(())
}

/// CUDA hızlandırmalı ekran yakalama (GPU kullanarak)
pub async fn capture_screen_cuda(query: web::Query<ScreenshotQuery>) -> impl Responder {
    info!("CUDA hızlandırmalı ekran görüntüsü alınıyor");
    
    let output_dir = query.output_dir.clone().unwrap_or_else(|| "/tmp".to_string());
    let format = query.format.clone().unwrap_or_else(|| "png".to_string());
    let include_base64 = query.include_base64.unwrap_or(false);
    
    // CUDA kullanılabilirliğini kontrol et
    if !is_cuda_available() {
        warn!("CUDA kullanılamıyor, standart ekran görüntüsü alma yöntemine geçiliyor");
        return capture_screen(query).await;
    }
    
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
    let filename = format!("screenshot_cuda_{}.{}", timestamp, format);
    let filepath = output_path.join(filename);
    
    // CUDA ile ekran görüntüsü al
    match capture_screenshot_cuda(&filepath.to_string_lossy(), &format) {
        Ok((width, height)) => {
            // Dosya boyutunu al
            let size = fs::metadata(&filepath)
                .map(|m| m.len())
                .unwrap_or(0);
            
            // Base64 kodlaması isteniyorsa
            let base64_data = if include_base64 {
                match fs::read(&filepath) {
                    Ok(data) => {
                        let encoded = base64::encode(&data);
                        Some(encoded)
                    },
                    Err(e) => {
                        warn!("Dosya base64 kodlaması için okunamadı: {}", e);
                        None
                    }
                }
            } else {
                None
            };
            
            let screenshot_info = ScreenshotInfo {
                path: filepath.to_string_lossy().to_string(),
                width,
                height,
                format: format.clone(),
                timestamp,
                size,
                base64_data,
            };
            
            HttpResponse::Ok().json(screenshot_info)
        },
        Err(e) => {
            warn!("CUDA ile ekran görüntüsü alınamadı: {}, standart yönteme geçiliyor", e);
            capture_screen(query).await
        }
    }
}

/// CUDA kullanılabilirliğini kontrol et
fn is_cuda_available() -> bool {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            // Windows'ta CUDA kullanılabilirliğini kontrol et
            let output = Command::new("powershell")
                .args(&["-Command", "Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like '*NVIDIA*' } | Select-Object Name"])
                .output();
            
            match output {
                Ok(output) => {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    output.status.success() && output_str.contains("NVIDIA")
                },
                Err(_) => false
            }
        } else if #[cfg(target_os = "linux")] {
            // Linux'ta CUDA kullanılabilirliğini kontrol et
            let output = Command::new("nvidia-smi")
                .output();
            
            match output {
                Ok(output) => output.status.success(),
                Err(_) => false
            }
        } else {
            // Diğer platformlarda CUDA desteği yok
            false
        }
    }
}

/// CUDA ile ekran görüntüsü al
fn capture_screenshot_cuda(filepath: &str, format: &str) -> Result<(u32, u32), String> {
    // Bu fonksiyon gerçek bir CUDA uygulaması olacak
    // Şimdilik sadece standart ekran görüntüsü alma yöntemini kullanıyoruz
    
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            // Windows'ta CUDA ile ekran görüntüsü alma
            // Gerçek uygulamada CUDA kütüphanesi kullanılacak
            let script = format!(
                "Write-Output \"CUDA ekran görüntüsü alınıyor...\";
                Add-Type -AssemblyName System.Windows.Forms,System.Drawing;
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
            let dimensions: Vec<&str> = output_str.lines().last().unwrap_or("0,0").split(',').collect();
            
            if dimensions.len() == 2 {
                let width = dimensions[0].parse::<u32>().unwrap_or(0);
                let height = dimensions[1].parse::<u32>().unwrap_or(0);
                Ok((width, height))
            } else {
                Err("Ekran boyutları alınamadı".to_string())
            }
        } else if #[cfg(target_os = "linux")] {
            // Linux'ta CUDA ile ekran görüntüsü alma
            // Gerçek uygulamada CUDA kütüphanesi kullanılacak
            
            // Şimdilik standart yöntemi kullanıyoruz
            capture_linux_screenshot(filepath, format, -1)
        } else {
            Err("Bu platformda CUDA desteği bulunmuyor".to_string())
        }
    }
}
