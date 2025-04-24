// Gerçek Zamanlı Ekran Yakalama Modülü
// Bu modül, düşük gecikme süreli sürekli ekran görüntüsü alma ve işleme yeteneği sağlar

use std::path::Path;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use log::{info, error, warn, debug};
use std::sync::{Arc, Mutex, mpsc};
use std::collections::{HashMap, VecDeque};
use std::time::{Duration, Instant};
use std::thread;
use std::sync::atomic::{AtomicBool, Ordering};

// Rust-CUDA köprüsünü kullan
use crate::rust_cuda_bridge::{
    CudaSystem, CudaDevice, CudaDeviceInfo, CudaScreenshot,
    RustCudaConfig, capture_screenshot_with_rust_cuda_config
};

// Kare yapısı
pub struct Frame {
    pub width: u32,
    pub height: u32,
    pub data: Vec<u8>,
    pub timestamp: Instant,
    pub frame_number: u64,
    pub processed: bool,
}

impl Frame {
    pub fn new(width: u32, height: u32, data: Vec<u8>, frame_number: u64) -> Self {
        Self {
            width,
            height,
            data,
            timestamp: Instant::now(),
            frame_number,
            processed: false,
        }
    }
    
    pub fn size_bytes(&self) -> usize {
        self.data.len()
    }
    
    pub fn age_ms(&self) -> u64 {
        self.timestamp.elapsed().as_millis() as u64
    }
}

// Kare işleme sonucu
pub struct ProcessedFrame {
    pub width: u32,
    pub height: u32,
    pub data: Vec<u8>,
    pub original_frame_number: u64,
    pub processing_time_ms: u64,
    pub timestamp: Instant,
}

// Kare yakalama yapılandırması
pub struct FrameCaptureConfig {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub fps: f32,
    pub display_index: i32,
    pub max_queue_size: usize,
    pub use_cuda: bool,
    pub device_id: i32,
    pub format: String,
    pub quality: u8,
    pub save_frames: bool,
    pub save_directory: Option<String>,
    pub save_format: String,
    pub save_interval: u32,  // Her kaç karede bir kaydetsin
}

impl Default for FrameCaptureConfig {
    fn default() -> Self {
        Self {
            width: None,
            height: None,
            fps: 30.0,
            display_index: -1,
            max_queue_size: 30,
            use_cuda: true,
            device_id: 0,
            format: "png".to_string(),
            quality: 90,
            save_frames: false,
            save_directory: None,
            save_format: "png".to_string(),
            save_interval: 30,
        }
    }
}

// Gerçek zamanlı ekran yakalama yöneticisi
pub struct RealtimeScreenCapture {
    config: FrameCaptureConfig,
    running: Arc<AtomicBool>,
    frame_queue: Arc<Mutex<VecDeque<Frame>>>,
    processed_queue: Arc<Mutex<VecDeque<ProcessedFrame>>>,
    capture_thread: Option<thread::JoinHandle<()>>,
    processing_thread: Option<thread::JoinHandle<()>>,
    frame_count: Arc<Mutex<u64>>,
    processed_count: Arc<Mutex<u64>>,
    dropped_count: Arc<Mutex<u64>>,
    last_fps_update: Arc<Mutex<Instant>>,
    current_fps: Arc<Mutex<f32>>,
    cuda_system: Option<Arc<Mutex<CudaSystem>>>,
}

impl RealtimeScreenCapture {
    pub fn new(config: FrameCaptureConfig) -> Result<Self, String> {
        let cuda_system = if config.use_cuda {
            match CudaSystem::new() {
                Ok(system) => Some(Arc::new(Mutex::new(system))),
                Err(e) => {
                    warn!("CUDA sistemi başlatılamadı: {}, CUDA kullanılmadan devam ediliyor", e);
                    None
                }
            }
        } else {
            None
        };
        
        Ok(Self {
            config,
            running: Arc::new(AtomicBool::new(false)),
            frame_queue: Arc::new(Mutex::new(VecDeque::new())),
            processed_queue: Arc::new(Mutex::new(VecDeque::new())),
            capture_thread: None,
            processing_thread: None,
            frame_count: Arc::new(Mutex::new(0)),
            processed_count: Arc::new(Mutex::new(0)),
            dropped_count: Arc::new(Mutex::new(0)),
            last_fps_update: Arc::new(Mutex::new(Instant::now())),
            current_fps: Arc::new(Mutex::new(0.0)),
            cuda_system,
        })
    }
    
    pub fn start(&mut self) -> Result<(), String> {
        if self.running.load(Ordering::SeqCst) {
            return Err("Ekran yakalama zaten çalışıyor".to_string());
        }
        
        self.running.store(true, Ordering::SeqCst);
        
        // CUDA sistemini başlat
        if let Some(cuda_system) = &self.cuda_system {
            let mut system = cuda_system.lock().unwrap();
            if system.device_count() > 0 {
                let device_id = if self.config.device_id >= 0 && self.config.device_id < system.device_count() as i32 {
                    self.config.device_id
                } else {
                    0 // Varsayılan olarak ilk cihazı kullan
                };
                
                if let Err(e) = system.select_device(device_id) {
                    warn!("CUDA cihazı seçilemedi: {}, CUDA kullanılmadan devam ediliyor", e);
                    self.cuda_system = None;
                }
            } else {
                warn!("CUDA destekli cihaz bulunamadı, CUDA kullanılmadan devam ediliyor");
                self.cuda_system = None;
            }
        }
        
        // Yakalama iş parçacığını başlat
        let running = self.running.clone();
        let frame_queue = self.frame_queue.clone();
        let config = self.config.clone();
        let frame_count = self.frame_count.clone();
        let last_fps_update = self.last_fps_update.clone();
        let current_fps = self.current_fps.clone();
        let max_queue_size = self.config.max_queue_size;
        let dropped_count = self.dropped_count.clone();
        
        self.capture_thread = Some(thread::spawn(move || {
            let frame_interval = Duration::from_secs_f32(1.0 / config.fps);
            let mut last_capture = Instant::now();
            let mut frames_since_update = 0;
            let fps_update_interval = Duration::from_secs(1);
            
            while running.load(Ordering::SeqCst) {
                let now = Instant::now();
                let elapsed = now.duration_since(last_capture);
                
                if elapsed >= frame_interval {
                    // Ekran görüntüsü al
                    match capture_raw_screenshot(config.display_index, config.width, config.height) {
                        Ok((data, width, height)) => {
                            // Kare sayacını artır
                            let frame_number = {
                                let mut count = frame_count.lock().unwrap();
                                *count += 1;
                                *count
                            };
                            
                            // Yeni kare oluştur
                            let frame = Frame::new(width, height, data, frame_number);
                            
                            // Kare kuyruğuna ekle
                            {
                                let mut queue = frame_queue.lock().unwrap();
                                
                                // Kuyruk doluysa, en eski kareyi çıkar
                                if queue.len() >= max_queue_size {
                                    queue.pop_front();
                                    
                                    // Düşürülen kare sayacını artır
                                    let mut dropped = dropped_count.lock().unwrap();
                                    *dropped += 1;
                                }
                                
                                queue.push_back(frame);
                            }
                            
                            // FPS hesapla
                            frames_since_update += 1;
                            let mut last_update = last_fps_update.lock().unwrap();
                            if now.duration_since(*last_update) >= fps_update_interval {
                                let fps = frames_since_update as f32 / now.duration_since(*last_update).as_secs_f32();
                                *current_fps.lock().unwrap() = fps;
                                *last_update = now;
                                frames_since_update = 0;
                            }
                            
                            last_capture = now;
                        },
                        Err(e) => {
                            error!("Ekran görüntüsü alınamadı: {}", e);
                            thread::sleep(Duration::from_millis(100));
                        }
                    }
                } else {
                    // Bir sonraki kareye kadar bekle
                    let wait_time = frame_interval.checked_sub(elapsed).unwrap_or_default();
                    thread::sleep(wait_time);
                }
            }
        }));
        
        // İşleme iş parçacığını başlat
        let running = self.running.clone();
        let frame_queue = self.frame_queue.clone();
        let processed_queue = self.processed_queue.clone();
        let config = self.config.clone();
        let processed_count = self.processed_count.clone();
        let cuda_system = self.cuda_system.clone();
        let max_queue_size = self.config.max_queue_size;
        
        self.processing_thread = Some(thread::spawn(move || {
            // CUDA ekran görüntüsü işleyicisini başlat
            let mut cuda_screenshot = if let Some(cuda_system) = &cuda_system {
                let system = cuda_system.lock().unwrap();
                if let Some(device_info) = system.current_device() {
                    match CudaScreenshot::new(device_info.device_id) {
                        Ok(screenshot) => Some(screenshot),
                        Err(e) => {
                            warn!("CUDA ekran görüntüsü işleyicisi başlatılamadı: {}", e);
                            None
                        }
                    }
                } else {
                    None
                }
            } else {
                None
            };
            
            while running.load(Ordering::SeqCst) {
                // Kare kuyruğundan bir kare al
                let frame = {
                    let mut queue = frame_queue.lock().unwrap();
                    queue.pop_front()
                };
                
                if let Some(frame) = frame {
                    let start_time = Instant::now();
                    
                    // Kareyi işle
                    let processed_data = if let Some(cuda_screenshot) = &mut cuda_screenshot {
                        // CUDA ile işle
                        match cuda_screenshot.process_image(&frame.data, frame.width, frame.height) {
                            Ok(data) => data,
                            Err(e) => {
                                warn!("CUDA ile kare işlenemedi: {}, işlenmemiş kare kullanılıyor", e);
                                frame.data.clone()
                            }
                        }
                    } else {
                        // CPU ile işle (basit bir örnek)
                        process_frame_cpu(&frame.data, frame.width, frame.height)
                    };
                    
                    let processing_time = start_time.elapsed().as_millis() as u64;
                    
                    // İşlenmiş kareyi oluştur
                    let processed_frame = ProcessedFrame {
                        width: frame.width,
                        height: frame.height,
                        data: processed_data,
                        original_frame_number: frame.frame_number,
                        processing_time_ms: processing_time,
                        timestamp: Instant::now(),
                    };
                    
                    // İşlenmiş kare kuyruğuna ekle
                    {
                        let mut queue = processed_queue.lock().unwrap();
                        
                        // Kuyruk doluysa, en eski kareyi çıkar
                        if queue.len() >= max_queue_size {
                            queue.pop_front();
                        }
                        
                        queue.push_back(processed_frame);
                    }
                    
                    // İşlenen kare sayacını artır
                    {
                        let mut count = processed_count.lock().unwrap();
                        *count += 1;
                    }
                    
                    // Kareyi kaydet (yapılandırma ayarlarına göre)
                    if config.save_frames && config.frame_number % config.save_interval == 0 {
                        if let Some(save_dir) = &config.save_directory {
                            let dir = Path::new(save_dir);
                            if !dir.exists() {
                                if let Err(e) = std::fs::create_dir_all(dir) {
                                    error!("Kayıt dizini oluşturulamadı: {}", e);
                                }
                            }
                            
                            let filepath = dir.join(format!("frame_{:08}.{}", frame.frame_number, config.save_format));
                            
                            if let Err(e) = save_frame(&processed_data, frame.width, frame.height, 
                                                      filepath.to_str().unwrap_or(""), 
                                                      &config.save_format, config.quality) {
                                error!("Kare kaydedilemedi: {}", e);
                            }
                        }
                    }
                } else {
                    // Kare yoksa kısa bir süre bekle
                    thread::sleep(Duration::from_millis(1));
                }
            }
        }));
        
        Ok(())
    }
    
    pub fn stop(&mut self) -> Result<(), String> {
        if !self.running.load(Ordering::SeqCst) {
            return Err("Ekran yakalama zaten durdurulmuş".to_string());
        }
        
        self.running.store(false, Ordering::SeqCst);
        
        // İş parçacıklarının tamamlanmasını bekle
        if let Some(handle) = self.capture_thread.take() {
            if let Err(e) = handle.join() {
                error!("Yakalama iş parçacığı beklenirken hata oluştu: {:?}", e);
            }
        }
        
        if let Some(handle) = self.processing_thread.take() {
            if let Err(e) = handle.join() {
                error!("İşleme iş parçacığı beklenirken hata oluştu: {:?}", e);
            }
        }
        
        Ok(())
    }
    
    pub fn is_running(&self) -> bool {
        self.running.load(Ordering::SeqCst)
    }
    
    pub fn get_latest_frame(&self) -> Option<ProcessedFrame> {
        let queue = self.processed_queue.lock().unwrap();
        queue.back().cloned()
    }
    
    pub fn get_frame_by_number(&self, frame_number: u64) -> Option<ProcessedFrame> {
        let queue = self.processed_queue.lock().unwrap();
        queue.iter()
            .find(|frame| frame.original_frame_number == frame_number)
            .cloned()
    }
    
    pub fn get_stats(&self) -> ScreenCaptureStats {
        let frame_count = *self.frame_count.lock().unwrap();
        let processed_count = *self.processed_count.lock().unwrap();
        let dropped_count = *self.dropped_count.lock().unwrap();
        let current_fps = *self.current_fps.lock().unwrap();
        
        let frame_queue_size = self.frame_queue.lock().unwrap().len();
        let processed_queue_size = self.processed_queue.lock().unwrap().len();
        
        ScreenCaptureStats {
            frame_count,
            processed_count,
            dropped_count,
            current_fps,
            frame_queue_size,
            processed_queue_size,
            running: self.running.load(Ordering::SeqCst),
            cuda_available: self.cuda_system.is_some(),
        }
    }
    
    pub fn clear_queues(&self) {
        let mut frame_queue = self.frame_queue.lock().unwrap();
        frame_queue.clear();
        
        let mut processed_queue = self.processed_queue.lock().unwrap();
        processed_queue.clear();
    }
    
    pub fn update_config(&mut self, config: FrameCaptureConfig) -> Result<(), String> {
        if self.running.load(Ordering::SeqCst) {
            return Err("Yapılandırma güncellemesi için önce ekran yakalamayı durdurun".to_string());
        }
        
        self.config = config;
        Ok(())
    }
}

// Ekran yakalama istatistikleri
pub struct ScreenCaptureStats {
    pub frame_count: u64,
    pub processed_count: u64,
    pub dropped_count: u64,
    pub current_fps: f32,
    pub frame_queue_size: usize,
    pub processed_queue_size: usize,
    pub running: bool,
    pub cuda_available: bool,
}

// CPU ile kare işleme (basit bir örnek)
fn process_frame_cpu(data: &[u8], width: u32, height: u32) -> Vec<u8> {
    // Basit bir işleme örneği (gri tonlama)
    let mut result = Vec::with_capacity(data.len());
    
    for y in 0..height {
        for x in 0..width {
            let pos = ((y * width + x) * 4) as usize;
            
            if pos + 2 < data.len() {
                let r = data[pos] as u32;
                let g = data[pos + 1] as u32;
                let b = data[pos + 2] as u32;
                
                // Gri tonlama (basit bir örnek)
                let gray = ((r * 299 + g * 587 + b * 114) / 1000) as u8;
                
                result.push(gray);
                result.push(gray);
                result.push(gray);
                
                // Alpha kanalını kopyala
                if pos + 3 < data.len() {
                    result.push(data[pos + 3]);
                } else {
                    result.push(255);
                }
            }
        }
    }
    
    result
}

// Kareyi kaydet
fn save_frame(
    data: &[u8],
    width: u32,
    height: u32,
    filepath: &str,
    format: &str,
    quality: u8
) -> Result<(), String> {
    // Geçici bir raw dosyası oluştur
    let temp_raw = format!("{}.raw", filepath);
    std::fs::write(&temp_raw, data)
        .map_err(|e| format!("Raw görüntü dosyası yazılamadı: {}", e))?;
    
    // ImageMagick ile dönüştür
    let convert_cmd = match format.to_lowercase().as_str() {
        "jpg" | "jpeg" => {
            format!("convert -size {}x{} -depth 8 rgba:{} -quality {} {}", 
                    width, height, temp_raw, quality, filepath)
        },
        "png" => {
            format!("convert -size {}x{} -depth 8 rgba:{} {}", 
                    width, height, temp_raw, filepath)
        },
        _ => {
            format!("convert -size {}x{} -depth 8 rgba:{} {}", 
                    width, height, temp_raw, filepath)
        }
    };
    
    let output = Command::new("sh")
        .args(&["-c", &convert_cmd])
        .output()
        .map_err(|e| format!("convert komutu çalıştırılamadı: {}", e))?;
    
    // Geçici dosyayı temizle
    let _ = std::fs::remove_file(&temp_raw);
    
    if !output.status.success() {
        return Err(format!("convert komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    Ok(())
}

// Platform-spesifik ham ekran görüntüsü alma
#[cfg(target_os = "windows")]
fn capture_raw_screenshot(
    display_index: i32,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(Vec<u8>, u32, u32), String> {
    // Windows'ta ekran görüntüsü alma kodu
    // Bu örnek için basitleştirilmiş
    
    // Windows API'lerini kullanarak ekran görüntüsü alma
    // Gerçek uygulamada Windows API çağrıları yapılacak
    
    // Geçici bir çözüm olarak, PowerShell ile ekran görüntüsü alıyoruz
    let temp_file = format!("temp_screenshot_{}.bmp", std::process::id());
    
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
                $bitmap.Save('{1}', [System.Drawing.Imaging.ImageFormat]::Bmp);
                Write-Output \"$($bitmap.Width),$($bitmap.Height)\"", display_index, temp_file)
    } else {
        format!("Add-Type -AssemblyName System.Windows.Forms,System.Drawing;
                $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds;
                $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height;
                $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
                $graphics.CopyFromScreen($bounds.Left, $bounds.Top, 0, 0, $bounds.Size);
                $bitmap.Save('{0}', [System.Drawing.Imaging.ImageFormat]::Bmp);
                Write-Output \"$($bitmap.Width),$($bitmap.Height)\"", temp_file)
    };
    
    let output = Command::new("powershell")
        .args(&["-Command", &display_cmd])
        .output()
        .map_err(|e| format!("PowerShell komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("PowerShell komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Boyutları al
    let output_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let dimensions: Vec<&str> = output_str.split(',').collect();
    
    if dimensions.len() != 2 {
        return Err("Ekran boyutları alınamadı".to_string());
    }
    
    let raw_width = dimensions[0].parse::<u32>().unwrap_or(0);
    let raw_height = dimensions[1].parse::<u32>().unwrap_or(0);
    
    // BMP dosyasını oku
    let image_data = std::fs::read(&temp_file)
        .map_err(|e| format!("Ekran görüntüsü dosyası okunamadı: {}", e))?;
    
    // Geçici dosyayı temizle
    let _ = std::fs::remove_file(&temp_file);
    
    // BMP başlığını atla ve RGBA formatına dönüştür
    // Basitleştirilmiş bir örnek
    let header_size = 54; // BMP başlık boyutu
    if image_data.len() <= header_size {
        return Err("Geçersiz BMP dosyası".to_string());
    }
    
    // BMP, BGR formatında depolanır, RGBA'ya dönüştür
    let mut rgba_data = Vec::with_capacity((raw_width * raw_height * 4) as usize);
    
    for y in 0..raw_height {
        let row_start = header_size + (raw_height - 1 - y) as usize * (raw_width as usize * 3 + (raw_width as usize * 3) % 4);
        
        for x in 0..raw_width {
            let pixel_start = row_start + (x as usize * 3);
            
            if pixel_start + 2 < image_data.len() {
                let b = image_data[pixel_start];
                let g = image_data[pixel_start + 1];
                let r = image_data[pixel_start + 2];
                
                rgba_data.push(r);
                rgba_data.push(g);
                rgba_data.push(b);
                rgba_data.push(255); // Alpha
            }
        }
    }
    
    // Boyutlandırma
    let (final_data, final_width, final_height) = if let (Some(w), Some(h)) = (width, height) {
        resize_image(&rgba_data, raw_width, raw_height, w, h)?
    } else {
        (rgba_data, raw_width, raw_height)
    };
    
    Ok((final_data, final_width, final_height))
}

#[cfg(target_os = "linux")]
fn capture_raw_screenshot(
    display_index: i32,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(Vec<u8>, u32, u32), String> {
    // Linux'ta ekran görüntüsü alma kodu
    // Bu örnek için basitleştirilmiş
    
    // Geçici dosya yolu
    let temp_file = format!("/tmp/temp_screenshot_{}.png", std::process::id());
    
    // Ekran görüntüsü alma komutu
    let capture_cmd = if display_index >= 0 {
        format!("DISPLAY=:{} import -window root {}", display_index, temp_file)
    } else {
        format!("import -window root {}", temp_file)
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
    
    // Görüntü boyutlarını al
    let identify_cmd = format!("identify -format \"%w,%h\" {}", temp_file);
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
    
    if dimensions.len() != 2 {
        return Err("Ekran boyutları alınamadı".to_string());
    }
    
    let raw_width = dimensions[0].parse::<u32>().unwrap_or(0);
    let raw_height = dimensions[1].parse::<u32>().unwrap_or(0);
    
    // PNG dosyasını RGBA formatına dönüştür
    let convert_cmd = format!("convert {} -depth 8 rgba:{}.raw", temp_file, temp_file);
    let output = Command::new("sh")
        .args(&["-c", &convert_cmd])
        .output()
        .map_err(|e| format!("convert komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("convert komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Raw RGBA dosyasını oku
    let raw_file = format!("{}.raw", temp_file);
    let image_data = std::fs::read(&raw_file)
        .map_err(|e| format!("RGBA dosyası okunamadı: {}", e))?;
    
    // Geçici dosyaları temizle
    let _ = std::fs::remove_file(&temp_file);
    let _ = std::fs::remove_file(&raw_file);
    
    // Boyutlandırma
    let (final_data, final_width, final_height) = if let (Some(w), Some(h)) = (width, height) {
        resize_image(&image_data, raw_width, raw_height, w, h)?
    } else {
        (image_data, raw_width, raw_height)
    };
    
    Ok((final_data, final_width, final_height))
}

#[cfg(target_os = "macos")]
fn capture_raw_screenshot(
    display_index: i32,
    width: Option<u32>,
    height: Option<u32>
) -> Result<(Vec<u8>, u32, u32), String> {
    // macOS'ta ekran görüntüsü alma kodu
    // Bu örnek için basitleştirilmiş
    
    // Geçici dosya yolu
    let temp_file = format!("/tmp/temp_screenshot_{}.png", std::process::id());
    
    // Ekran görüntüsü alma komutu
    let capture_cmd = if display_index >= 0 {
        format!("screencapture -D {} {}", display_index, temp_file)
    } else {
        format!("screencapture {}", temp_file)
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
    
    // Görüntü boyutlarını al
    let sips_cmd = format!("sips -g pixelWidth -g pixelHeight {}", temp_file);
    let output = Command::new("sh")
        .args(&["-c", &sips_cmd])
        .output()
        .map_err(|e| format!("sips komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("sips komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut raw_width = 0;
    let mut raw_height = 0;
    
    for line in output_str.lines() {
        if line.contains("pixelWidth") {
            if let Some(w) = line.split(':').last() {
                raw_width = w.trim().parse::<u32>().unwrap_or(0);
            }
        } else if line.contains("pixelHeight") {
            if let Some(h) = line.split(':').last() {
                raw_height = h.trim().parse::<u32>().unwrap_or(0);
            }
        }
    }
    
    if raw_width == 0 || raw_height == 0 {
        return Err("Ekran boyutları alınamadı".to_string());
    }
    
    // PNG dosyasını RGBA formatına dönüştür
    let convert_cmd = format!("sips -s format rgba --out {}.raw {}", temp_file, temp_file);
    let output = Command::new("sh")
        .args(&["-c", &convert_cmd])
        .output()
        .map_err(|e| format!("sips komutu çalıştırılamadı: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("sips komutu başarısız oldu: {}", 
            String::from_utf8_lossy(&output.stderr)));
    }
    
    // Raw RGBA dosyasını oku
    let raw_file = format!("{}.raw", temp_file);
    let image_data = std::fs::read(&raw_file)
        .map_err(|e| format!("RGBA dosyası okunamadı: {}", e))?;
    
    // Geçici dosyaları temizle
    let _ = std::fs::remove_file(&temp_file);
    let _ = std::fs::remove_file(&raw_file);
    
    // Boyutlandırma
    let (final_data, final_width, final_height) = if let (Some(w), Some(h)) = (width, height) {
        resize_image(&image_data, raw_width, raw_height, w, h)?
    } else {
        (image_data, raw_width, raw_height)
    };
    
    Ok((final_data, final_width, final_height))
}

// Görüntü boyutlandırma
fn resize_image(
    image_data: &[u8],
    width: u32,
    height: u32,
    new_width: u32,
    new_height: u32
) -> Result<(Vec<u8>, u32, u32), String> {
    // Basit bir bilinear interpolasyon örneği
    // Gerçek uygulamada daha gelişmiş bir kütüphane kullanılabilir
    
    if width == 0 || height == 0 || new_width == 0 || new_height == 0 {
        return Err("Geçersiz görüntü boyutları".to_string());
    }
    
    if width == new_width && height == new_height {
        return Ok((image_data.to_vec(), width, height));
    }
    
    let channels = 4; // RGBA
    let mut resized_data = vec![0u8; (new_width * new_height * channels) as usize];
    
    let x_ratio = width as f32 / new_width as f32;
    let y_ratio = height as f32 / new_height as f32;
    
    for y in 0..new_height {
        for x in 0..new_width {
            let px = (x as f32 * x_ratio).floor() as u32;
            let py = (y as f32 * y_ratio).floor() as u32;
            
            let src_pos = ((py * width + px) * channels) as usize;
            let dst_pos = ((y * new_width + x) * channels) as usize;
            
            if src_pos + 3 < image_data.len() && dst_pos + 3 < resized_data.len() {
                resized_data[dst_pos] = image_data[src_pos];
                resized_data[dst_pos + 1] = image_data[src_pos + 1];
                resized_data[dst_pos + 2] = image_data[src_pos + 2];
                resized_data[dst_pos + 3] = image_data[src_pos + 3];
            }
        }
    }
    
    Ok((resized_data, new_width, new_height))
}

// Gerçek zamanlı ekran yakalama API'si
pub struct RealtimeScreenCaptureAPI {
    capture: Option<RealtimeScreenCapture>,
    config: FrameCaptureConfig,
}

impl RealtimeScreenCaptureAPI {
    pub fn new() -> Self {
        Self {
            capture: None,
            config: FrameCaptureConfig::default(),
        }
    }
    
    pub fn start(&mut self) -> Result<(), String> {
        if self.capture.is_some() && self.capture.as_ref().unwrap().is_running() {
            return Err("Ekran yakalama zaten çalışıyor".to_string());
        }
        
        let mut capture = RealtimeScreenCapture::new(self.config.clone())?;
        capture.start()?;
        
        self.capture = Some(capture);
        Ok(())
    }
    
    pub fn stop(&mut self) -> Result<(), String> {
        if let Some(capture) = &mut self.capture {
            capture.stop()?;
        }
        
        self.capture = None;
        Ok(())
    }
    
    pub fn is_running(&self) -> bool {
        self.capture.as_ref().map_or(false, |c| c.is_running())
    }
    
    pub fn get_latest_frame(&self) -> Option<ProcessedFrame> {
        self.capture.as_ref().and_then(|c| c.get_latest_frame())
    }
    
    pub fn get_stats(&self) -> Option<ScreenCaptureStats> {
        self.capture.as_ref().map(|c| c.get_stats())
    }
    
    pub fn update_config(&mut self, config: FrameCaptureConfig) -> Result<(), String> {
        self.config = config.clone();
        
        if let Some(capture) = &mut self.capture {
            if capture.is_running() {
                capture.stop()?;
            }
            
            *capture = RealtimeScreenCapture::new(config)?;
            capture.start()?;
        }
        
        Ok(())
    }
    
    pub fn save_frame(&self, filepath: &str, format: &str, quality: u8) -> Result<(), String> {
        if let Some(frame) = self.get_latest_frame() {
            save_frame(&frame.data, frame.width, frame.height, filepath, format, quality)
        } else {
            Err("Kaydedilecek kare bulunamadı".to_string())
        }
    }
}

impl Clone for FrameCaptureConfig {
    fn clone(&self) -> Self {
        Self {
            width: self.width,
            height: self.height,
            fps: self.fps,
            display_index: self.display_index,
            max_queue_size: self.max_queue_size,
            use_cuda: self.use_cuda,
            device_id: self.device_id,
            format: self.format.clone(),
            quality: self.quality,
            save_frames: self.save_frames,
            save_directory: self.save_directory.clone(),
            save_format: self.save_format.clone(),
            save_interval: self.save_interval,
        }
    }
}

// Gerçek zamanlı ekran yakalama örneği
pub fn realtime_screen_capture_example() -> Result<(), String> {
    // Yapılandırma
    let config = FrameCaptureConfig {
        width: Some(1280),
        height: Some(720),
        fps: 30.0,
        display_index: -1,
        max_queue_size: 30,
        use_cuda: true,
        device_id: 0,
        format: "png".to_string(),
        quality: 90,
        save_frames: true,
        save_directory: Some("/tmp/screen_capture".to_string()),
        save_format: "jpg".to_string(),
        save_interval: 30,
    };
    
    // API'yi başlat
    let mut api = RealtimeScreenCaptureAPI::new();
    api.update_config(config)?;
    api.start()?;
    
    // 10 saniye çalıştır
    println!("Gerçek zamanlı ekran yakalama başlatıldı, 10 saniye çalışacak...");
    thread::sleep(Duration::from_secs(10));
    
    // İstatistikleri göster
    if let Some(stats) = api.get_stats() {
        println!("Toplam kare sayısı: {}", stats.frame_count);
        println!("İşlenen kare sayısı: {}", stats.processed_count);
        println!("Düşürülen kare sayısı: {}", stats.dropped_count);
        println!("Mevcut FPS: {:.2}", stats.current_fps);
        println!("Kare kuyruğu boyutu: {}", stats.frame_queue_size);
        println!("İşlenmiş kare kuyruğu boyutu: {}", stats.processed_queue_size);
        println!("CUDA kullanılabilir: {}", stats.cuda_available);
    }
    
    // Son kareyi kaydet
    api.save_frame("/tmp/last_frame.png", "png", 100)?;
    
    // Durdur
    api.stop()?;
    println!("Gerçek zamanlı ekran yakalama durduruldu");
    
    Ok(())
}
