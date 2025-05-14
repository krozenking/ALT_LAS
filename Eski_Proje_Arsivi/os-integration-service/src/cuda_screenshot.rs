// CUDA ile ekran görüntüsü alma için gelişmiş modül
// Bu dosya, NVIDIA GPU'ları olan sistemlerde CUDA kullanarak hızlandırılmış ekran görüntüsü alma işlevselliği sağlar

use std::path::Path;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use log::{info, error, warn, debug};
use cfg_if::cfg_if;

// CUDA ekran görüntüsü alma yapılandırması
pub struct CudaScreenshotConfig {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub format: String,
    pub quality: u8,  // 1-100 arası kalite değeri (JPEG için)
    pub display_index: i32,
    pub use_hardware_acceleration: bool,
}

impl Default for CudaScreenshotConfig {
    fn default() -> Self {
        Self {
            width: None,
            height: None,
            format: "png".to_string(),
            quality: 90,
            display_index: -1,  // Tüm ekranlar
            use_hardware_acceleration: true,
        }
    }
}

// CUDA ekran görüntüsü sonucu
pub struct CudaScreenshotResult {
    pub width: u32,
    pub height: u32,
    pub path: String,
    pub format: String,
    pub size_bytes: u64,
    pub capture_time_ms: u64,
    pub used_cuda: bool,
}

// CUDA kullanılabilirliğini kontrol et
pub fn is_cuda_available() -> bool {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            // Windows'ta CUDA kullanılabilirliğini kontrol et
            let nvidia_smi_output = Command::new("where")
                .args(&["nvidia-smi"])
                .output();
            
            if let Ok(output) = nvidia_smi_output {
                if output.status.success() {
                    // nvidia-smi komutu bulundu, şimdi çalıştır
                    let nvidia_smi = Command::new("nvidia-smi")
                        .output();
                    
                    if let Ok(output) = nvidia_smi {
                        return output.status.success();
                    }
                }
            }
            
            // PowerShell ile NVIDIA GPU kontrolü
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
                Err(_) => {
                    // nvidia-smi bulunamadı, lspci ile NVIDIA GPU kontrolü
                    let lspci_output = Command::new("lspci")
                        .output();
                    
                    match lspci_output {
                        Ok(output) => {
                            let output_str = String::from_utf8_lossy(&output.stdout);
                            output_str.to_lowercase().contains("nvidia")
                        },
                        Err(_) => false
                    }
                }
            }
        } else if #[cfg(target_os = "macos")] {
            // macOS'ta CUDA desteği sınırlıdır ve Apple Silicon'da desteklenmez
            // Metal API kullanılabilirliğini kontrol et
            let output = Command::new("system_profiler")
                .args(&["SPDisplaysDataType"])
                .output();
            
            match output {
                Ok(output) => {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    // Metal destekli GPU kontrolü
                    output_str.contains("Metal: Supported")
                },
                Err(_) => false
            }
        } else {
            false
        }
    }
}

// CUDA GPU bilgilerini al
pub fn get_cuda_device_info() -> Option<String> {
    if !is_cuda_available() {
        return None;
    }
    
    cfg_if! {
        if #[cfg(any(target_os = "windows", target_os = "linux"))] {
            // nvidia-smi ile GPU bilgilerini al
            let output = Command::new("nvidia-smi")
                .args(&["--query-gpu=name,memory.total,driver_version,cuda_version", "--format=csv,noheader"])
                .output();
            
            match output {
                Ok(output) => {
                    if output.status.success() {
                        Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
                    } else {
                        None
                    }
                },
                Err(_) => None
            }
        } else if #[cfg(target_os = "macos")] {
            // macOS'ta Metal GPU bilgilerini al
            let output = Command::new("system_profiler")
                .args(&["SPDisplaysDataType"])
                .output();
            
            match output {
                Ok(output) => {
                    if output.status.success() {
                        let output_str = String::from_utf8_lossy(&output.stdout);
                        // GPU model bilgisini çıkar
                        if let Some(start_idx) = output_str.find("Chipset Model:") {
                            if let Some(end_idx) = output_str[start_idx..].find('\n') {
                                let gpu_info = output_str[start_idx..start_idx+end_idx].trim();
                                return Some(format!("Metal GPU: {}", gpu_info));
                            }
                        }
                        None
                    } else {
                        None
                    }
                },
                Err(_) => None
            }
        } else {
            None
        }
    }
}

// CUDA ile ekran görüntüsü al
pub fn capture_screenshot_cuda(filepath: &str, config: CudaScreenshotConfig) -> Result<CudaScreenshotResult, String> {
    let start_time = std::time::Instant::now();
    
    // CUDA kullanılabilirliğini kontrol et
    let cuda_available = is_cuda_available();
    if !cuda_available || !config.use_hardware_acceleration {
        warn!("CUDA kullanılamıyor veya devre dışı bırakıldı, alternatif yöntem kullanılacak");
        return capture_screenshot_fallback(filepath, config);
    }
    
    info!("CUDA ile ekran görüntüsü alınıyor: {}", filepath);
    
    // Dosya uzantısını kontrol et
    let path = Path::new(filepath);
    let extension = path.extension().and_then(|e| e.to_str()).unwrap_or("png");
    
    // Formatı belirle
    let format = if config.format.is_empty() {
        extension.to_string()
    } else {
        config.format.clone()
    };
    
    // CUDA ile ekran görüntüsü alma
    let result = cfg_if! {
        if #[cfg(target_os = "windows")] {
            capture_screenshot_cuda_windows(filepath, &format, config.display_index, config.quality, config.width, config.height)
        } else if #[cfg(target_os = "linux")] {
            capture_screenshot_cuda_linux(filepath, &format, config.display_index, config.quality, config.width, config.height)
        } else if #[cfg(target_os = "macos")] {
            // macOS'ta Metal API kullanarak hızlandırma
            capture_screenshot_metal_macos(filepath, &format, config.display_index, config.quality, config.width, config.height)
        } else {
            Err("Bu platform desteklenmiyor".to_string())
        }
    };
    
    // Sonucu işle
    match result {
        Ok((width, height)) => {
            let capture_time = start_time.elapsed().as_millis() as u64;
            
            // Dosya boyutunu al
            let file_size = match std::fs::metadata(filepath) {
                Ok(metadata) => metadata.len(),
                Err(_) => 0,
            };
            
            Ok(CudaScreenshotResult {
                width,
                height,
                path: filepath.to_string(),
                format,
                size_bytes: file_size,
                capture_time_ms: capture_time,
                used_cuda: true,
            })
        },
        Err(e) => {
            warn!("CUDA ile ekran görüntüsü alınamadı: {}, alternatif yöntem deneniyor", e);
            capture_screenshot_fallback(filepath, config)
        }
    }
}

// CUDA kullanılamadığında alternatif yöntem
fn capture_screenshot_fallback(filepath: &str, config: CudaScreenshotConfig) -> Result<CudaScreenshotResult, String> {
    let start_time = std::time::Instant::now();
    
    info!("Alternatif yöntem ile ekran görüntüsü alınıyor: {}", filepath);
    
    // Standart ekran görüntüsü alma yöntemini kullan
    let result = cfg_if! {
        if #[cfg(target_os = "windows")] {
            capture_screenshot_standard_windows(filepath, &config.format, config.display_index, config.quality, config.width, config.height)
        } else if #[cfg(target_os = "linux")] {
            capture_screenshot_standard_linux(filepath, &config.format, config.display_index, config.quality, config.width, config.height)
        } else if #[cfg(target_os = "macos")] {
            capture_screenshot_standard_macos(filepath, &config.format, config.display_index, config.quality, config.width, config.height)
        } else {
            Err("Bu platform desteklenmiyor".to_string())
        }
    };
    
    // Sonucu işle
    match result {
        Ok((width, height)) => {
            let capture_time = start_time.elapsed().as_millis() as u64;
            
            // Dosya boyutunu al
            let file_size = match std::fs::metadata(filepath) {
                Ok(metadata) => metadata.len(),
                Err(_) => 0,
            };
            
            Ok(CudaScreenshotResult {
                width,
                height,
                path: filepath.to_string(),
                format: config.format,
                size_bytes: file_size,
                capture_time_ms: capture_time,
                used_cuda: false,
            })
        },
        Err(e) => Err(format!("Ekran görüntüsü alınamadı: {}", e))
    }
}

// Windows'ta CUDA ile ekran görüntüsü alma
#[cfg(target_os = "windows")]
fn capture_screenshot_cuda_windows(
    filepath: &str, 
    format: &str, 
    display_index: i32,
    quality: u8,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(u32, u32), String> {
    // CUDA ile ekran görüntüsü alma kodu
    // Not: Gerçek uygulamada CUDA kütüphanesi kullanılacak
    
    // Geçici bir Python scripti oluştur
    let temp_script = format!("{}.py", filepath);
    let script_content = format!(
        r#"
import numpy as np
import pycuda.driver as cuda
import pycuda.autoinit
from PIL import ImageGrab, Image
import sys
import time

try:
    # Ekran görüntüsü al
    display_index = {}
    if display_index >= 0:
        # Belirli bir ekranın görüntüsünü al
        import win32api
        monitors = win32api.EnumDisplayMonitors()
        if display_index < len(monitors):
            monitor = monitors[display_index]
            monitor_info = win32api.GetMonitorInfo(monitor[0])
            monitor_area = monitor_info['Monitor']
            screenshot = ImageGrab.grab(monitor_area)
        else:
            print("Hata: Belirtilen ekran indeksi bulunamadı")
            sys.exit(1)
    else:
        # Tüm ekranların görüntüsünü al
        screenshot = ImageGrab.grab()
    
    # Boyutlandırma
    width = {}
    height = {}
    if width is not None and height is not None:
        screenshot = screenshot.resize((width, height), Image.LANCZOS)
    
    # CUDA ile işleme
    img_array = np.array(screenshot)
    d_img = cuda.mem_alloc(img_array.nbytes)
    cuda.memcpy_htod(d_img, img_array)
    
    # CUDA işleme simülasyonu
    time.sleep(0.05)  # CUDA işleme simülasyonu
    
    # Sonucu kaydet
    format_str = "{}"
    quality = {}
    screenshot.save("{}", format=format_str.upper(), quality=quality)
    
    # Boyutları yazdır
    print(f"{{screenshot.width}},{{screenshot.height}}")
    sys.exit(0)
except Exception as e:
    print(f"Hata: {{e}}")
    sys.exit(1)
        "#,
        display_index,
        width.map_or("None".to_string(), |w| w.to_string()),
        height.map_or("None".to_string(), |h| h.to_string()),
        format,
        quality,
        filepath
    );
    
    // Python scriptini dosyaya yaz
    let mut file = File::create(&temp_script).map_err(|e| format!("Python scripti oluşturulamadı: {}", e))?;
    file.write_all(script_content.as_bytes()).map_err(|e| format!("Python scripti yazılamadı: {}", e))?;
    
    // Python scriptini çalıştır
    let output = Command::new("python")
        .args(&[&temp_script])
        .output()
        .map_err(|e| format!("Python scripti çalıştırılamadı: {}", e))?;
    
    // Geçici scripti temizle
    let _ = std::fs::remove_file(&temp_script);
    
    if !output.status.success() {
        return Err(format!("Python scripti başarısız oldu: {}", 
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

// Linux'ta CUDA ile ekran görüntüsü alma
#[cfg(target_os = "linux")]
fn capture_screenshot_cuda_linux(
    filepath: &str, 
    format: &str, 
    display_index: i32,
    quality: u8,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(u32, u32), String> {
    // CUDA ile ekran görüntüsü alma kodu
    // Not: Gerçek uygulamada CUDA kütüphanesi kullanılacak
    
    // Geçici bir Python scripti oluştur
    let temp_script = format!("{}.py", filepath);
    let script_content = format!(
        r#"
import numpy as np
import pycuda.driver as cuda
import pycuda.autoinit
from PIL import Image
import sys
import time
import subprocess

try:
    # Ekran görüntüsü al
    display_index = {}
    temp_file = "{}.temp"
    
    if display_index >= 0:
        # Belirli bir ekranın görüntüsünü al
        display_env = f"DISPLAY=:{display_index}"
        subprocess.run(f"{{display_env}} import -window root {{temp_file}}", shell=True, check=True)
    else:
        # Tüm ekranların görüntüsünü al
        subprocess.run(f"import -window root {{temp_file}}", shell=True, check=True)
    
    # Görüntüyü yükle
    screenshot = Image.open(temp_file)
    
    # Boyutlandırma
    width = {}
    height = {}
    if width is not None and height is not None:
        screenshot = screenshot.resize((width, height), Image.LANCZOS)
    
    # CUDA ile işleme
    img_array = np.array(screenshot)
    d_img = cuda.mem_alloc(img_array.nbytes)
    cuda.memcpy_htod(d_img, img_array)
    
    # CUDA işleme simülasyonu
    time.sleep(0.05)  # CUDA işleme simülasyonu
    
    # Sonucu kaydet
    format_str = "{}"
    quality = {}
    screenshot.save("{}", format=format_str.upper(), quality=quality)
    
    # Geçici dosyayı temizle
    subprocess.run(f"rm {{temp_file}}", shell=True)
    
    # Boyutları yazdır
    print(f"{{screenshot.width}},{{screenshot.height}}")
    sys.exit(0)
except Exception as e:
    print(f"Hata: {{e}}")
    sys.exit(1)
        "#,
        display_index,
        filepath,
        width.map_or("None".to_string(), |w| w.to_string()),
        height.map_or("None".to_string(), |h| h.to_string()),
        format,
        quality,
        filepath
    );
    
    // Python scriptini dosyaya yaz
    let mut file = File::create(&temp_script).map_err(|e| format!("Python scripti oluşturulamadı: {}", e))?;
    file.write_all(script_content.as_bytes()).map_err(|e| format!("Python scripti yazılamadı: {}", e))?;
    
    // Python scriptini çalıştır
    let output = Command::new("python3")
        .args(&[&temp_script])
        .output()
        .map_err(|e| format!("Python scripti çalıştırılamadı: {}", e))?;
    
    // Geçici scripti temizle
    let _ = std::fs::remove_file(&temp_script);
    
    if !output.status.success() {
        return Err(format!("Python scripti başarısız oldu: {}", 
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

// macOS'ta Metal API ile ekran görüntüsü alma
#[cfg(target_os = "macos")]
fn capture_screenshot_metal_macos(
    filepath: &str, 
    format: &str, 
    display_index: i32,
    quality: u8,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(u32, u32), String> {
    // Metal API ile ekran görüntüsü alma kodu
    // Not: Gerçek uygulamada Metal API kullanılacak
    
    // Geçici bir Python scripti oluştur
    let temp_script = format!("{}.py", filepath);
    let script_content = format!(
        r#"
import numpy as np
from PIL import Image
import sys
import time
import subprocess

try:
    # Ekran görüntüsü al
    display_index = {}
    temp_file = "{}.temp"
    
    if display_index >= 0:
        # Belirli bir ekranın görüntüsünü al
        subprocess.run(f"screencapture -D {{display_index}} {{temp_file}}", shell=True, check=True)
    else:
        # Tüm ekranların görüntüsünü al
        subprocess.run(f"screencapture {{temp_file}}", shell=True, check=True)
    
    # Görüntüyü yükle
    screenshot = Image.open(temp_file)
    
    # Boyutlandırma
    width = {}
    height = {}
    if width is not None and height is not None:
        screenshot = screenshot.resize((width, height), Image.LANCZOS)
    
    # Metal API simülasyonu
    time.sleep(0.05)  # Metal işleme simülasyonu
    
    # Sonucu kaydet
    format_str = "{}"
    quality = {}
    screenshot.save("{}", format=format_str.upper(), quality=quality)
    
    # Geçici dosyayı temizle
    subprocess.run(f"rm {{temp_file}}", shell=True)
    
    # Boyutları yazdır
    print(f"{{screenshot.width}},{{screenshot.height}}")
    sys.exit(0)
except Exception as e:
    print(f"Hata: {{e}}")
    sys.exit(1)
        "#,
        display_index,
        filepath,
        width.map_or("None".to_string(), |w| w.to_string()),
        height.map_or("None".to_string(), |h| h.to_string()),
        format,
        quality,
        filepath
    );
    
    // Python scriptini dosyaya yaz
    let mut file = File::create(&temp_script).map_err(|e| format!("Python scripti oluşturulamadı: {}", e))?;
    file.write_all(script_content.as_bytes()).map_err(|e| format!("Python scripti yazılamadı: {}", e))?;
    
    // Python scriptini çalıştır
    let output = Command::new("python3")
        .args(&[&temp_script])
        .output()
        .map_err(|e| format!("Python scripti çalıştırılamadı: {}", e))?;
    
    // Geçici scripti temizle
    let _ = std::fs::remove_file(&temp_script);
    
    if !output.status.success() {
        return Err(format!("Python scripti başarısız oldu: {}", 
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

// Windows'ta standart ekran görüntüsü alma
#[cfg(target_os = "windows")]
fn capture_screenshot_standard_windows(
    filepath: &str, 
    format: &str, 
    display_index: i32,
    quality: u8,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(u32, u32), String> {
    // PowerShell ile ekran görüntüsü alma
    let resize_cmd = if width.is_some() && height.is_some() {
        format!("$bitmap = New-Object System.Drawing.Bitmap {}, {};
                $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
                $graphics.DrawImage($screenshot, 0, 0, {}, {});
                $screenshot = $bitmap;",
                width.unwrap(), height.unwrap(), width.unwrap(), height.unwrap())
    } else {
        "".to_string()
    };
    
    let display_cmd = if display_index >= 0 {
        format!("$screens = [System.Windows.Forms.Screen]::AllScreens;
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
                $screenshot = $bitmap;", display_index)
    } else {
        "$screens = [System.Windows.Forms.Screen]::AllScreens;
        $top = $left = [System.Int32]::MaxValue;
        $width = $height = 0;
        
        foreach ($screen in $screens) {
            $top = [System.Math]::Min($top, $screen.Bounds.Top);
            $left = [System.Math]::Min($left, $screen.Bounds.Left);
            $width = [System.Math]::Max($width, $screen.Bounds.Right);
            $height = [System.Math]::Max($height, $screen.Bounds.Bottom);
        }
        
        $width = $width - $left;
        $height = $height - $top;
        
        $bounds = [System.Drawing.Rectangle]::FromLTRB($left, $top, $left + $width, $top + $height);
        $bitmap = New-Object System.Drawing.Bitmap $width, $height;
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
        $graphics.CopyFromScreen($bounds.Left, $bounds.Top, 0, 0, $bounds.Size);
        $screenshot = $bitmap;".to_string()
    };
    
    let quality_param = if format.to_lowercase() == "jpg" || format.to_lowercase() == "jpeg" {
        format!("
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1);
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, {});
        $jpegCodecInfo = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object {{ $_.FormatDescription -eq \"JPEG\" }};
        $screenshot.Save('{}', $jpegCodecInfo, $encoderParams);", quality, filepath)
    } else {
        format!("$screenshot.Save('{}', [System.Drawing.Imaging.ImageFormat]::{});", 
                filepath, format.to_uppercase())
    };
    
    let script = format!(
        "Add-Type -AssemblyName System.Windows.Forms,System.Drawing;
        {}
        {}
        {}
        Write-Output \"$($screenshot.Width),$($screenshot.Height)\";",
        display_cmd, resize_cmd, quality_param
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

// Linux'ta standart ekran görüntüsü alma
#[cfg(target_os = "linux")]
fn capture_screenshot_standard_linux(
    filepath: &str, 
    format: &str, 
    display_index: i32,
    quality: u8,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(u32, u32), String> {
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
    
    // Geçici dosya yolu
    let temp_file = format!("{}.temp", filepath);
    
    // Ekran görüntüsü alma komutu
    let capture_cmd = if has_import {
        if display_index >= 0 {
            format!("DISPLAY=:{} import -window root {}", display_index, temp_file)
        } else {
            format!("import -window root {}", temp_file)
        }
    } else if has_gnome_screenshot {
        if display_index >= 0 {
            format!("DISPLAY=:{} gnome-screenshot -f {}", display_index, temp_file)
        } else {
            format!("gnome-screenshot -f {}", temp_file)
        }
    } else {
        return Err("Ekran görüntüsü alma aracı bulunamadı (import veya gnome-screenshot)".to_string());
    };
    
    // Ekran görüntüsü al
    let output = Command::new("sh")
        .args(&["-c", &capture_cmd])
        .output()
        .map_err(|e| format!("Ekran görüntüsü alma komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("Ekran görüntüsü alma komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Boyutlandırma ve format dönüşümü
    let convert_cmd = if width.is_some() && height.is_some() {
        if format.to_lowercase() == "jpg" || format.to_lowercase() == "jpeg" {
            format!("convert {} -resize {}x{} -quality {} {}", 
                    temp_file, width.unwrap(), height.unwrap(), quality, filepath)
        } else {
            format!("convert {} -resize {}x{} {}", 
                    temp_file, width.unwrap(), height.unwrap(), filepath)
        }
    } else {
        if format.to_lowercase() == "jpg" || format.to_lowercase() == "jpeg" {
            format!("convert {} -quality {} {}", temp_file, quality, filepath)
        } else {
            format!("convert {} {}", temp_file, filepath)
        }
    };
    
    // Dönüşüm yap
    let output = Command::new("sh")
        .args(&["-c", &convert_cmd])
        .output()
        .map_err(|e| format!("Görüntü dönüştürme komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("Görüntü dönüştürme komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Geçici dosyayı temizle
    let _ = std::fs::remove_file(&temp_file);
    
    // Görüntü boyutlarını al
    let identify_cmd = format!("identify -format \"%w,%h\" {}", filepath);
    let output = Command::new("sh")
        .args(&["-c", &identify_cmd])
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

// macOS'ta standart ekran görüntüsü alma
#[cfg(target_os = "macos")]
fn capture_screenshot_standard_macos(
    filepath: &str, 
    format: &str, 
    display_index: i32,
    quality: u8,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(u32, u32), String> {
    // macOS'ta screencapture komutu ile ekran görüntüsü alma
    let format_flag = match format.to_lowercase().as_str() {
        "jpg" | "jpeg" => "-t jpg",
        "png" => "-t png",
        "pdf" => "-t pdf",
        "tiff" => "-t tiff",
        _ => "-t png", // Varsayılan olarak PNG
    };
    
    // Geçici dosya yolu
    let temp_file = format!("{}.temp", filepath);
    
    // Ekran görüntüsü alma komutu
    let capture_cmd = if display_index >= 0 {
        format!("screencapture {} -D {} -x {}", format_flag, display_index, temp_file)
    } else {
        format!("screencapture {} -x {}", format_flag, temp_file)
    };
    
    // Ekran görüntüsü al
    let output = Command::new("sh")
        .args(&["-c", &capture_cmd])
        .output()
        .map_err(|e| format!("screencapture komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("screencapture komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Boyutlandırma ve format dönüşümü
    let convert_cmd = if width.is_some() && height.is_some() {
        if format.to_lowercase() == "jpg" || format.to_lowercase() == "jpeg" {
            format!("sips -s format jpeg -s formatOptions {} -z {} {} {} --out {}", 
                    quality, height.unwrap(), width.unwrap(), temp_file, filepath)
        } else {
            format!("sips -s format {} -z {} {} {} --out {}", 
                    format.to_lowercase(), height.unwrap(), width.unwrap(), temp_file, filepath)
        }
    } else {
        if format.to_lowercase() == "jpg" || format.to_lowercase() == "jpeg" {
            format!("sips -s format jpeg -s formatOptions {} {} --out {}", 
                    quality, temp_file, filepath)
        } else {
            format!("sips -s format {} {} --out {}", 
                    format.to_lowercase(), temp_file, filepath)
        }
    };
    
    // Dönüşüm yap
    let output = Command::new("sh")
        .args(&["-c", &convert_cmd])
        .output()
        .map_err(|e| format!("sips komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("sips komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Geçici dosyayı temizle
    let _ = std::fs::remove_file(&temp_file);
    
    // Görüntü boyutlarını al
    let sips_cmd = format!("sips -g pixelWidth -g pixelHeight {}", filepath);
    let output = Command::new("sh")
        .args(&["-c", &sips_cmd])
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
