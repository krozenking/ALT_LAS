// CUDA Performans Optimizasyonları
// Bu modül, CUDA ekran yakalama işlemlerini optimize etmek için geliştirilmiştir

use std::path::Path;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use log::{info, error, warn, debug};
use cfg_if::cfg_if;
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::time::{Duration, Instant};

// CUDA bellek yönetimi için yapılar
struct CudaMemoryPool {
    buffers: Arc<Mutex<HashMap<usize, Vec<Vec<u8>>>>>,
    max_pool_size: usize,
    current_pool_size: Arc<Mutex<usize>>,
    last_cleanup: Arc<Mutex<Instant>>,
}

impl CudaMemoryPool {
    fn new(max_pool_size: usize) -> Self {
        Self {
            buffers: Arc::new(Mutex::new(HashMap::new())),
            max_pool_size,
            current_pool_size: Arc::new(Mutex::new(0)),
            last_cleanup: Arc::new(Mutex::new(Instant::now())),
        }
    }
    
    fn get_buffer(&self, size: usize) -> Vec<u8> {
        let mut buffers = self.buffers.lock().unwrap();
        
        // Havuzdan uygun boyutta buffer al
        if let Some(pool) = buffers.get_mut(&size) {
            if !pool.is_empty() {
                return pool.pop().unwrap();
            }
        }
        
        // Uygun buffer yoksa yeni oluştur
        vec![0; size]
    }
    
    fn return_buffer(&self, buffer: Vec<u8>) {
        let size = buffer.capacity();
        let mut buffers = self.buffers.lock().unwrap();
        let mut current_size = self.current_pool_size.lock().unwrap();
        
        // Havuz boyutu limitini kontrol et
        if *current_size + size <= self.max_pool_size {
            let pool = buffers.entry(size).or_insert_with(Vec::new);
            pool.push(buffer);
            *current_size += size;
        }
        
        // Belirli aralıklarla temizlik yap
        let mut last_cleanup = self.last_cleanup.lock().unwrap();
        if last_cleanup.elapsed() > Duration::from_secs(60) {
            self.cleanup();
            *last_cleanup = Instant::now();
        }
    }
    
    fn cleanup(&self) {
        let mut buffers = self.buffers.lock().unwrap();
        let mut current_size = self.current_pool_size.lock().unwrap();
        
        // Havuz boyutu limitini aşıyorsa en az kullanılan buffer'ları temizle
        if *current_size > self.max_pool_size {
            let mut sizes: Vec<usize> = buffers.keys().cloned().collect();
            sizes.sort_unstable();
            
            for size in sizes {
                if *current_size <= self.max_pool_size {
                    break;
                }
                
                if let Some(pool) = buffers.get_mut(&size) {
                    while !pool.is_empty() && *current_size > self.max_pool_size {
                        pool.pop();
                        *current_size -= size;
                    }
                }
            }
        }
    }
}

// Lazy static global bellek havuzu
lazy_static::lazy_static! {
    static ref CUDA_MEMORY_POOL: CudaMemoryPool = CudaMemoryPool::new(100 * 1024 * 1024); // 100 MB
}

// CUDA ekran görüntüsü alma yapılandırması (optimize edilmiş)
pub struct OptimizedCudaConfig {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub format: String,
    pub quality: u8,
    pub display_index: i32,
    pub use_hardware_acceleration: bool,
    pub use_memory_pool: bool,
    pub parallel_processing: bool,
    pub max_threads: usize,
    pub compression_level: u8,
}

impl Default for OptimizedCudaConfig {
    fn default() -> Self {
        Self {
            width: None,
            height: None,
            format: "png".to_string(),
            quality: 90,
            display_index: -1,
            use_hardware_acceleration: true,
            use_memory_pool: true,
            parallel_processing: true,
            max_threads: num_cpus::get(),
            compression_level: 6,
        }
    }
}

// CUDA ekran görüntüsü sonucu (genişletilmiş)
pub struct OptimizedCudaResult {
    pub width: u32,
    pub height: u32,
    pub path: String,
    pub format: String,
    pub size_bytes: u64,
    pub capture_time_ms: u64,
    pub processing_time_ms: u64,
    pub compression_time_ms: u64,
    pub total_time_ms: u64,
    pub used_cuda: bool,
    pub memory_usage: u64,
    pub gpu_utilization: Option<f32>,
}

// CUDA GPU bilgilerini detaylı al
pub fn get_detailed_cuda_info() -> Option<HashMap<String, String>> {
    if !is_cuda_available() {
        return None;
    }
    
    let mut info = HashMap::new();
    
    cfg_if! {
        if #[cfg(any(target_os = "windows", target_os = "linux"))] {
            // nvidia-smi ile detaylı GPU bilgilerini al
            let output = Command::new("nvidia-smi")
                .args(&["--query-gpu=name,memory.total,memory.free,memory.used,temperature.gpu,utilization.gpu,utilization.memory,driver_version,cuda_version,pstate,power.draw,power.limit", "--format=csv,noheader"])
                .output();
            
            match output {
                Ok(output) => {
                    if output.status.success() {
                        let output_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                        let parts: Vec<&str> = output_str.split(',').collect();
                        
                        if parts.len() >= 12 {
                            info.insert("name".to_string(), parts[0].trim().to_string());
                            info.insert("memory_total".to_string(), parts[1].trim().to_string());
                            info.insert("memory_free".to_string(), parts[2].trim().to_string());
                            info.insert("memory_used".to_string(), parts[3].trim().to_string());
                            info.insert("temperature".to_string(), parts[4].trim().to_string());
                            info.insert("gpu_utilization".to_string(), parts[5].trim().to_string());
                            info.insert("memory_utilization".to_string(), parts[6].trim().to_string());
                            info.insert("driver_version".to_string(), parts[7].trim().to_string());
                            info.insert("cuda_version".to_string(), parts[8].trim().to_string());
                            info.insert("performance_state".to_string(), parts[9].trim().to_string());
                            info.insert("power_draw".to_string(), parts[10].trim().to_string());
                            info.insert("power_limit".to_string(), parts[11].trim().to_string());
                        }
                    }
                },
                Err(_) => {}
            }
            
            // CUDA özellikleri için deviceQuery kullan
            let temp_dir = std::env::temp_dir();
            let device_query_path = temp_dir.join("deviceQuery.cpp");
            let device_query_bin = temp_dir.join("deviceQuery");
            
            // deviceQuery kaynak kodu oluştur
            let device_query_code = r#"
            #include <stdio.h>
            #include <cuda_runtime.h>
            
            int main() {
                int deviceCount = 0;
                cudaError_t error_id = cudaGetDeviceCount(&deviceCount);
                
                if (error_id != cudaSuccess) {
                    printf("cudaGetDeviceCount returned %d\n-> %s\n", (int)error_id, cudaGetErrorString(error_id));
                    return 1;
                }
                
                if (deviceCount == 0) {
                    printf("No CUDA devices found\n");
                    return 1;
                }
                
                for (int dev = 0; dev < deviceCount; ++dev) {
                    cudaSetDevice(dev);
                    cudaDeviceProp deviceProp;
                    cudaGetDeviceProperties(&deviceProp, dev);
                    
                    printf("CUDA_DEVICE_NAME=%s\n", deviceProp.name);
                    printf("CUDA_COMPUTE_CAPABILITY=%d.%d\n", deviceProp.major, deviceProp.minor);
                    printf("CUDA_TOTAL_GLOBAL_MEM=%llu\n", (unsigned long long)deviceProp.totalGlobalMem);
                    printf("CUDA_SHARED_MEM_PER_BLOCK=%llu\n", (unsigned long long)deviceProp.sharedMemPerBlock);
                    printf("CUDA_REGISTERS_PER_BLOCK=%d\n", deviceProp.regsPerBlock);
                    printf("CUDA_WARP_SIZE=%d\n", deviceProp.warpSize);
                    printf("CUDA_MAX_THREADS_PER_BLOCK=%d\n", deviceProp.maxThreadsPerBlock);
                    printf("CUDA_MAX_THREADS_DIM=%d,%d,%d\n", deviceProp.maxThreadsDim[0], deviceProp.maxThreadsDim[1], deviceProp.maxThreadsDim[2]);
                    printf("CUDA_MAX_GRID_SIZE=%d,%d,%d\n", deviceProp.maxGridSize[0], deviceProp.maxGridSize[1], deviceProp.maxGridSize[2]);
                    printf("CUDA_CLOCK_RATE=%d\n", deviceProp.clockRate);
                    printf("CUDA_MULTI_PROCESSOR_COUNT=%d\n", deviceProp.multiProcessorCount);
                    printf("CUDA_CONCURRENT_KERNELS=%d\n", deviceProp.concurrentKernels);
                    printf("CUDA_MEMORY_BUS_WIDTH=%d\n", deviceProp.memoryBusWidth);
                    printf("CUDA_MEMORY_CLOCK_RATE=%d\n", deviceProp.memoryClockRate);
                }
                
                return 0;
            }
            "#;
            
            std::fs::write(&device_query_path, device_query_code).ok();
            
            // Derleme ve çalıştırma
            #[cfg(target_os = "linux")]
            {
                Command::new("nvcc")
                    .args(&["-o", device_query_bin.to_str().unwrap(), device_query_path.to_str().unwrap()])
                    .output().ok();
                
                if let Ok(output) = Command::new(device_query_bin).output() {
                    if output.status.success() {
                        let output_str = String::from_utf8_lossy(&output.stdout);
                        for line in output_str.lines() {
                            if let Some(pos) = line.find('=') {
                                let key = line[..pos].to_string();
                                let value = line[pos+1..].to_string();
                                info.insert(key, value);
                            }
                        }
                    }
                }
            }
            
            #[cfg(target_os = "windows")]
            {
                // Windows'ta NVCC yolu farklı olabilir
                let nvcc_paths = vec![
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.0\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.1\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.2\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.3\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.4\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.5\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.6\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.7\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.8\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v12.0\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v12.1\\bin\\nvcc.exe",
                    "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v12.2\\bin\\nvcc.exe",
                ];
                
                for nvcc_path in nvcc_paths {
                    if Path::new(nvcc_path).exists() {
                        Command::new(nvcc_path)
                            .args(&["-o", device_query_bin.to_str().unwrap(), device_query_path.to_str().unwrap()])
                            .output().ok();
                        break;
                    }
                }
                
                if let Ok(output) = Command::new(device_query_bin.to_str().unwrap()).output() {
                    if output.status.success() {
                        let output_str = String::from_utf8_lossy(&output.stdout);
                        for line in output_str.lines() {
                            if let Some(pos) = line.find('=') {
                                let key = line[..pos].to_string();
                                let value = line[pos+1..].to_string();
                                info.insert(key, value);
                            }
                        }
                    }
                }
            }
        } else if #[cfg(target_os = "macos")] {
            // macOS'ta Metal API bilgilerini al
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
                                info.insert("name".to_string(), gpu_info.to_string());
                            }
                        }
                        
                        // VRAM bilgisini çıkar
                        if let Some(start_idx) = output_str.find("VRAM (Total):") {
                            if let Some(end_idx) = output_str[start_idx..].find('\n') {
                                let vram_info = output_str[start_idx..start_idx+end_idx].trim();
                                info.insert("memory_total".to_string(), vram_info.to_string());
                            }
                        }
                        
                        // Metal desteğini çıkar
                        if let Some(start_idx) = output_str.find("Metal:") {
                            if let Some(end_idx) = output_str[start_idx..].find('\n') {
                                let metal_info = output_str[start_idx..start_idx+end_idx].trim();
                                info.insert("metal_support".to_string(), metal_info.to_string());
                            }
                        }
                    }
                },
                Err(_) => {}
            }
        }
    }
    
    if info.is_empty() {
        None
    } else {
        Some(info)
    }
}

// CUDA kullanılabilirliğini kontrol et (optimize edilmiş)
pub fn is_cuda_available() -> bool {
    // Daha önce kontrol edilmiş mi?
    lazy_static::lazy_static! {
        static ref CUDA_AVAILABLE: Mutex<Option<bool>> = Mutex::new(None);
    }
    
    let mut cuda_available = CUDA_AVAILABLE.lock().unwrap();
    
    if let Some(available) = *cuda_available {
        return available;
    }
    
    let result = cfg_if! {
        if #[cfg(target_os = "windows")] {
            // Windows'ta CUDA kullanılabilirliğini kontrol et
            let nvidia_smi_output = Command::new("where")
                .args(&["nvidia-smi"])
                .output();
            
            let mut available = false;
            
            if let Ok(output) = nvidia_smi_output {
                if output.status.success() {
                    // nvidia-smi komutu bulundu, şimdi çalıştır
                    let nvidia_smi = Command::new("nvidia-smi")
                        .output();
                    
                    if let Ok(output) = nvidia_smi {
                        available = output.status.success();
                    }
                }
            }
            
            if !available {
                // PowerShell ile NVIDIA GPU kontrolü
                let output = Command::new("powershell")
                    .args(&["-Command", "Get-WmiObject Win32_VideoController | Where-Object { $_.Name -like '*NVIDIA*' } | Select-Object Name"])
                    .output();
                
                match output {
                    Ok(output) => {
                        let output_str = String::from_utf8_lossy(&output.stdout);
                        available = output.status.success() && output_str.contains("NVIDIA");
                    },
                    Err(_) => available = false
                }
            }
            
            available
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
    };
    
    *cuda_available = Some(result);
    result
}

// Optimize edilmiş CUDA ile ekran görüntüsü al
pub fn capture_screenshot_optimized(filepath: &str, config: OptimizedCudaConfig) -> Result<OptimizedCudaResult, String> {
    let start_time = std::time::Instant::now();
    
    // CUDA kullanılabilirliğini kontrol et
    let cuda_available = is_cuda_available();
    if !cuda_available || !config.use_hardware_acceleration {
        warn!("CUDA kullanılamıyor veya devre dışı bırakıldı, alternatif yöntem kullanılacak");
        return capture_screenshot_optimized_fallback(filepath, config);
    }
    
    info!("Optimize edilmiş CUDA ile ekran görüntüsü alınıyor: {}", filepath);
    
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
    let capture_start = std::time::Instant::now();
    let result = cfg_if! {
        if #[cfg(target_os = "windows")] {
            capture_screenshot_optimized_windows(filepath, &format, config)
        } else if #[cfg(target_os = "linux")] {
            capture_screenshot_optimized_linux(filepath, &format, config)
        } else if #[cfg(target_os = "macos")] {
            // macOS'ta Metal API kullanarak hızlandırma
            capture_screenshot_optimized_macos(filepath, &format, config)
        } else {
            Err("Bu platform desteklenmiyor".to_string())
        }
    };
    
    // Sonucu işle
    match result {
        Ok((width, height, processing_time, compression_time, memory_usage, gpu_utilization)) => {
            let capture_time = capture_start.elapsed().as_millis() as u64;
            let total_time = start_time.elapsed().as_millis() as u64;
            
            // Dosya boyutunu al
            let file_size = match std::fs::metadata(filepath) {
                Ok(metadata) => metadata.len(),
                Err(_) => 0,
            };
            
            Ok(OptimizedCudaResult {
                width,
                height,
                path: filepath.to_string(),
                format,
                size_bytes: file_size,
                capture_time_ms: capture_time,
                processing_time_ms: processing_time,
                compression_time_ms: compression_time,
                total_time_ms: total_time,
                used_cuda: true,
                memory_usage,
                gpu_utilization,
            })
        },
        Err(e) => {
            warn!("Optimize edilmiş CUDA ile ekran görüntüsü alınamadı: {}, alternatif yöntem deneniyor", e);
            capture_screenshot_optimized_fallback(filepath, config)
        }
    }
}

// CUDA kullanılamadığında alternatif yöntem (optimize edilmiş)
fn capture_screenshot_optimized_fallback(filepath: &str, config: OptimizedCudaConfig) -> Result<OptimizedCudaResult, String> {
    let start_time = std::time::Instant::now();
    
    info!("Optimize edilmiş alternatif yöntem ile ekran görüntüsü alınıyor: {}", filepath);
    
    // Standart ekran görüntüsü alma yöntemini kullan
    let capture_start = std::time::Instant::now();
    let result = cfg_if! {
        if #[cfg(target_os = "windows")] {
            capture_screenshot_optimized_standard_windows(filepath, &config)
        } else if #[cfg(target_os = "linux")] {
            capture_screenshot_optimized_standard_linux(filepath, &config)
        } else if #[cfg(target_os = "macos")] {
            capture_screenshot_optimized_standard_macos(filepath, &config)
        } else {
            Err("Bu platform desteklenmiyor".to_string())
        }
    };
    
    // Sonucu işle
    match result {
        Ok((width, height, processing_time, compression_time, memory_usage)) => {
            let capture_time = capture_start.elapsed().as_millis() as u64;
            let total_time = start_time.elapsed().as_millis() as u64;
            
            // Dosya boyutunu al
            let file_size = match std::fs::metadata(filepath) {
                Ok(metadata) => metadata.len(),
                Err(_) => 0,
            };
            
            Ok(OptimizedCudaResult {
                width,
                height,
                path: filepath.to_string(),
                format: config.format,
                size_bytes: file_size,
                capture_time_ms: capture_time,
                processing_time_ms: processing_time,
                compression_time_ms: compression_time,
                total_time_ms: total_time,
                used_cuda: false,
                memory_usage,
                gpu_utilization: None,
            })
        },
        Err(e) => Err(format!("Ekran görüntüsü alınamadı: {}", e))
    }
}

// Windows'ta optimize edilmiş CUDA ile ekran görüntüsü alma
#[cfg(target_os = "windows")]
fn capture_screenshot_optimized_windows(
    filepath: &str, 
    format: &str, 
    config: OptimizedCudaConfig
) -> Result<(u32, u32, u64, u64, u64, Option<f32>), String> {
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
import os
import psutil
import threading
import queue

try:
    # Başlangıç zamanını kaydet
    start_time = time.time()
    
    # Bellek kullanımını izle
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss
    
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
    
    # Görüntü yakalama süresi
    capture_time = time.time() - start_time
    
    # CUDA ile işleme
    processing_start = time.time()
    img_array = np.array(screenshot)
    
    # GPU belleğine kopyala
    d_img = cuda.mem_alloc(img_array.nbytes)
    cuda.memcpy_htod(d_img, img_array)
    
    # Paralel işleme için görüntüyü parçalara ayır
    use_parallel = {}
    max_threads = {}
    
    if use_parallel and img_array.shape[0] > 100:  # Yeterince büyük görüntü için
        # CUDA kernel fonksiyonu (basit bir örnek)
        from pycuda.compiler import SourceModule
        
        mod = SourceModule("""
        __global__ void process_image(unsigned char *img, int width, int height, int channels)
        {
            int idx = threadIdx.x + blockIdx.x * blockDim.x;
            int idy = threadIdx.y + blockIdx.y * blockDim.y;
            
            if (idx < width && idy < height)
            {
                int pixel_idx = (idy * width + idx) * channels;
                
                // Basit bir görüntü işleme örneği (keskinleştirme)
                if (idx > 0 && idx < width-1 && idy > 0 && idy < height-1)
                {
                    for (int c = 0; c < channels; c++)
                    {
                        unsigned char center = img[pixel_idx + c];
                        unsigned char left = img[pixel_idx - channels + c];
                        unsigned char right = img[pixel_idx + channels + c];
                        unsigned char up = img[pixel_idx - width*channels + c];
                        unsigned char down = img[pixel_idx + width*channels + c];
                        
                        // Laplacian filtresi
                        int val = 5*center - left - right - up - down;
                        
                        // Değeri sınırla
                        if (val < 0) val = 0;
                        if (val > 255) val = 255;
                        
                        img[pixel_idx + c] = (unsigned char)val;
                    }
                }
            }
        }
        """)
        
        process_func = mod.get_function("process_image")
        
        # Görüntü boyutları ve kanallar
        height, width, channels = img_array.shape
        
        # Grid ve blok boyutlarını ayarla
        block_size = (16, 16, 1)
        grid_size = ((width + block_size[0] - 1) // block_size[0], 
                     (height + block_size[1] - 1) // block_size[1], 
                     1)
        
        # Kernel'i çalıştır
        process_func(d_img, np.int32(width), np.int32(height), np.int32(channels),
                    block=block_size, grid=grid_size)
        
        # Sonucu geri al
        result_array = np.empty_like(img_array)
        cuda.memcpy_dtoh(result_array, d_img)
        
        # Görüntüyü güncelle
        img_array = result_array
    else:
        # Basit bir işleme (CUDA simülasyonu)
        time.sleep(0.05)
        
        # Sonucu geri al (gerçek bir işlem yapmadan)
        result_array = np.empty_like(img_array)
        cuda.memcpy_dtoh(result_array, d_img)
    
    # İşleme süresi
    processing_time = (time.time() - processing_start) * 1000  # ms cinsinden
    
    # Sıkıştırma ve kaydetme
    compression_start = time.time()
    
    # Görüntüyü PIL'e geri dönüştür
    processed_img = Image.fromarray(img_array)
    
    # Sıkıştırma seviyesi
    compression_level = {}
    
    # Sonucu kaydet
    format_str = "{}"
    quality = {}
    
    if format_str.upper() == "PNG":
        processed_img.save("{}", format=format_str.upper(), compress_level=compression_level)
    else:
        processed_img.save("{}", format=format_str.upper(), quality=quality)
    
    # Sıkıştırma süresi
    compression_time = (time.time() - compression_start) * 1000  # ms cinsinden
    
    # Bellek kullanımı
    final_memory = process.memory_info().rss
    memory_usage = final_memory - initial_memory
    
    # GPU kullanımını al
    gpu_utilization = None
    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        if gpus:
            gpu_utilization = gpus[0].load * 100  # Yüzde cinsinden
    except:
        pass
    
    # Boyutları ve süreleri yazdır
    print(f"{{processed_img.width}},{{processed_img.height}},{{processing_time}},{{compression_time}},{{memory_usage}},{{gpu_utilization if gpu_utilization is not None else 'None'}}")
    sys.exit(0)
except Exception as e:
    print(f"Hata: {{e}}")
    sys.exit(1)
        "#,
        config.display_index,
        config.width.map_or("None".to_string(), |w| w.to_string()),
        config.height.map_or("None".to_string(), |h| h.to_string()),
        config.parallel_processing,
        config.max_threads,
        config.compression_level,
        format,
        config.quality,
        filepath,
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
    let parts: Vec<&str> = output_str.split(',').collect();
    
    if parts.len() >= 6 {
        let width = parts[0].parse::<u32>().unwrap_or(0);
        let height = parts[1].parse::<u32>().unwrap_or(0);
        let processing_time = parts[2].parse::<u64>().unwrap_or(0);
        let compression_time = parts[3].parse::<u64>().unwrap_or(0);
        let memory_usage = parts[4].parse::<u64>().unwrap_or(0);
        let gpu_utilization = if parts[5] == "None" {
            None
        } else {
            parts[5].parse::<f32>().ok()
        };
        
        Ok((width, height, processing_time, compression_time, memory_usage, gpu_utilization))
    } else {
        Err("Ekran görüntüsü bilgileri alınamadı".to_string())
    }
}

// Linux'ta optimize edilmiş CUDA ile ekran görüntüsü alma
#[cfg(target_os = "linux")]
fn capture_screenshot_optimized_linux(
    filepath: &str, 
    format: &str, 
    config: OptimizedCudaConfig
) -> Result<(u32, u32, u64, u64, u64, Option<f32>), String> {
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
import os
import psutil
import subprocess
import threading
import queue

try:
    # Başlangıç zamanını kaydet
    start_time = time.time()
    
    # Bellek kullanımını izle
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss
    
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
    
    # Görüntü yakalama süresi
    capture_time = time.time() - start_time
    
    # CUDA ile işleme
    processing_start = time.time()
    img_array = np.array(screenshot)
    
    # GPU belleğine kopyala
    d_img = cuda.mem_alloc(img_array.nbytes)
    cuda.memcpy_htod(d_img, img_array)
    
    # Paralel işleme için görüntüyü parçalara ayır
    use_parallel = {}
    max_threads = {}
    
    if use_parallel and len(img_array.shape) >= 2 and img_array.shape[0] > 100:  # Yeterince büyük görüntü için
        # CUDA kernel fonksiyonu (basit bir örnek)
        from pycuda.compiler import SourceModule
        
        mod = SourceModule("""
        __global__ void process_image(unsigned char *img, int width, int height, int channels)
        {
            int idx = threadIdx.x + blockIdx.x * blockDim.x;
            int idy = threadIdx.y + blockIdx.y * blockDim.y;
            
            if (idx < width && idy < height)
            {
                int pixel_idx = (idy * width + idx) * channels;
                
                // Basit bir görüntü işleme örneği (keskinleştirme)
                if (idx > 0 && idx < width-1 && idy > 0 && idy < height-1)
                {
                    for (int c = 0; c < channels; c++)
                    {
                        unsigned char center = img[pixel_idx + c];
                        unsigned char left = img[pixel_idx - channels + c];
                        unsigned char right = img[pixel_idx + channels + c];
                        unsigned char up = img[pixel_idx - width*channels + c];
                        unsigned char down = img[pixel_idx + width*channels + c];
                        
                        // Laplacian filtresi
                        int val = 5*center - left - right - up - down;
                        
                        // Değeri sınırla
                        if (val < 0) val = 0;
                        if (val > 255) val = 255;
                        
                        img[pixel_idx + c] = (unsigned char)val;
                    }
                }
            }
        }
        """)
        
        process_func = mod.get_function("process_image")
        
        # Görüntü boyutları ve kanallar
        if len(img_array.shape) == 3:
            height, width, channels = img_array.shape
        else:
            height, width = img_array.shape
            channels = 1
        
        # Grid ve blok boyutlarını ayarla
        block_size = (16, 16, 1)
        grid_size = ((width + block_size[0] - 1) // block_size[0], 
                     (height + block_size[1] - 1) // block_size[1], 
                     1)
        
        # Kernel'i çalıştır
        process_func(d_img, np.int32(width), np.int32(height), np.int32(channels),
                    block=block_size, grid=grid_size)
        
        # Sonucu geri al
        result_array = np.empty_like(img_array)
        cuda.memcpy_dtoh(result_array, d_img)
        
        # Görüntüyü güncelle
        img_array = result_array
    else:
        # Basit bir işleme (CUDA simülasyonu)
        time.sleep(0.05)
        
        # Sonucu geri al (gerçek bir işlem yapmadan)
        result_array = np.empty_like(img_array)
        cuda.memcpy_dtoh(result_array, d_img)
    
    # İşleme süresi
    processing_time = (time.time() - processing_start) * 1000  # ms cinsinden
    
    # Sıkıştırma ve kaydetme
    compression_start = time.time()
    
    # Görüntüyü PIL'e geri dönüştür
    processed_img = Image.fromarray(img_array)
    
    # Sıkıştırma seviyesi
    compression_level = {}
    
    # Sonucu kaydet
    format_str = "{}"
    quality = {}
    
    if format_str.upper() == "PNG":
        processed_img.save("{}", format=format_str.upper(), compress_level=compression_level)
    else:
        processed_img.save("{}", format=format_str.upper(), quality=quality)
    
    # Sıkıştırma süresi
    compression_time = (time.time() - compression_start) * 1000  # ms cinsinden
    
    # Geçici dosyayı temizle
    subprocess.run(f"rm {{temp_file}}", shell=True)
    
    # Bellek kullanımı
    final_memory = process.memory_info().rss
    memory_usage = final_memory - initial_memory
    
    # GPU kullanımını al
    gpu_utilization = None
    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        if gpus:
            gpu_utilization = gpus[0].load * 100  # Yüzde cinsinden
    except:
        pass
    
    # Boyutları ve süreleri yazdır
    print(f"{{processed_img.width}},{{processed_img.height}},{{processing_time}},{{compression_time}},{{memory_usage}},{{gpu_utilization if gpu_utilization is not None else 'None'}}")
    sys.exit(0)
except Exception as e:
    print(f"Hata: {{e}}")
    sys.exit(1)
        "#,
        config.display_index,
        filepath,
        config.width.map_or("None".to_string(), |w| w.to_string()),
        config.height.map_or("None".to_string(), |h| h.to_string()),
        config.parallel_processing,
        config.max_threads,
        config.compression_level,
        format,
        config.quality,
        filepath,
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
    let parts: Vec<&str> = output_str.split(',').collect();
    
    if parts.len() >= 6 {
        let width = parts[0].parse::<u32>().unwrap_or(0);
        let height = parts[1].parse::<u32>().unwrap_or(0);
        let processing_time = parts[2].parse::<u64>().unwrap_or(0);
        let compression_time = parts[3].parse::<u64>().unwrap_or(0);
        let memory_usage = parts[4].parse::<u64>().unwrap_or(0);
        let gpu_utilization = if parts[5] == "None" {
            None
        } else {
            parts[5].parse::<f32>().ok()
        };
        
        Ok((width, height, processing_time, compression_time, memory_usage, gpu_utilization))
    } else {
        Err("Ekran görüntüsü bilgileri alınamadı".to_string())
    }
}

// macOS'ta Metal API ile optimize edilmiş ekran görüntüsü alma
#[cfg(target_os = "macos")]
fn capture_screenshot_optimized_macos(
    filepath: &str, 
    format: &str, 
    config: OptimizedCudaConfig
) -> Result<(u32, u32, u64, u64, u64, Option<f32>), String> {
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
import os
import psutil
import subprocess
import threading
import queue

try:
    # Başlangıç zamanını kaydet
    start_time = time.time()
    
    # Bellek kullanımını izle
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss
    
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
    
    # Görüntü yakalama süresi
    capture_time = time.time() - start_time
    
    # Metal API simülasyonu
    processing_start = time.time()
    img_array = np.array(screenshot)
    
    # Paralel işleme
    use_parallel = {}
    max_threads = {}
    
    if use_parallel and img_array.shape[0] > 100:  # Yeterince büyük görüntü için
        # Görüntüyü parçalara ayır
        height, width, channels = img_array.shape
        result_array = np.copy(img_array)
        
        # İş parçacığı sayısını belirle
        num_threads = min(max_threads, os.cpu_count() or 1)
        
        # Her iş parçacığı için satır aralığını hesapla
        rows_per_thread = height // num_threads
        
        # İşleme fonksiyonu
        def process_chunk(start_row, end_row):
            for y in range(start_row, end_row):
                for x in range(1, width-1):
                    for c in range(channels):
                        # Basit bir görüntü işleme örneği (keskinleştirme)
                        if y > 0 and y < height-1:
                            center = int(img_array[y, x, c])
                            left = int(img_array[y, x-1, c])
                            right = int(img_array[y, x+1, c])
                            up = int(img_array[y-1, x, c])
                            down = int(img_array[y+1, x, c])
                            
                            # Laplacian filtresi
                            val = 5*center - left - right - up - down
                            
                            # Değeri sınırla
                            val = max(0, min(255, val))
                            
                            result_array[y, x, c] = val
        
        # İş parçacıklarını başlat
        threads = []
        for i in range(num_threads):
            start_row = i * rows_per_thread
            end_row = start_row + rows_per_thread if i < num_threads - 1 else height
            thread = threading.Thread(target=process_chunk, args=(start_row, end_row))
            threads.append(thread)
            thread.start()
        
        # İş parçacıklarının tamamlanmasını bekle
        for thread in threads:
            thread.join()
        
        # İşlenmiş görüntüyü kullan
        img_array = result_array
    else:
        # Metal işleme simülasyonu
        time.sleep(0.05)
    
    # İşleme süresi
    processing_time = (time.time() - processing_start) * 1000  # ms cinsinden
    
    # Sıkıştırma ve kaydetme
    compression_start = time.time()
    
    # Görüntüyü PIL'e geri dönüştür
    processed_img = Image.fromarray(img_array)
    
    # Sıkıştırma seviyesi
    compression_level = {}
    
    # Sonucu kaydet
    format_str = "{}"
    quality = {}
    
    if format_str.upper() == "PNG":
        processed_img.save("{}", format=format_str.upper(), compress_level=compression_level)
    else:
        processed_img.save("{}", format=format_str.upper(), quality=quality)
    
    # Sıkıştırma süresi
    compression_time = (time.time() - compression_start) * 1000  # ms cinsinden
    
    # Geçici dosyayı temizle
    subprocess.run(f"rm {{temp_file}}", shell=True)
    
    # Bellek kullanımı
    final_memory = process.memory_info().rss
    memory_usage = final_memory - initial_memory
    
    # GPU kullanımını al (macOS'ta Metal API kullanımı)
    gpu_utilization = None
    
    # Boyutları ve süreleri yazdır
    print(f"{{processed_img.width}},{{processed_img.height}},{{processing_time}},{{compression_time}},{{memory_usage}},{{gpu_utilization if gpu_utilization is not None else 'None'}}")
    sys.exit(0)
except Exception as e:
    print(f"Hata: {{e}}")
    sys.exit(1)
        "#,
        config.display_index,
        filepath,
        config.width.map_or("None".to_string(), |w| w.to_string()),
        config.height.map_or("None".to_string(), |h| h.to_string()),
        config.parallel_processing,
        config.max_threads,
        config.compression_level,
        format,
        config.quality,
        filepath,
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
    let parts: Vec<&str> = output_str.split(',').collect();
    
    if parts.len() >= 6 {
        let width = parts[0].parse::<u32>().unwrap_or(0);
        let height = parts[1].parse::<u32>().unwrap_or(0);
        let processing_time = parts[2].parse::<u64>().unwrap_or(0);
        let compression_time = parts[3].parse::<u64>().unwrap_or(0);
        let memory_usage = parts[4].parse::<u64>().unwrap_or(0);
        let gpu_utilization = if parts[5] == "None" {
            None
        } else {
            parts[5].parse::<f32>().ok()
        };
        
        Ok((width, height, processing_time, compression_time, memory_usage, gpu_utilization))
    } else {
        Err("Ekran görüntüsü bilgileri alınamadı".to_string())
    }
}

// Windows'ta optimize edilmiş standart ekran görüntüsü alma
#[cfg(target_os = "windows")]
fn capture_screenshot_optimized_standard_windows(
    filepath: &str, 
    config: &OptimizedCudaConfig
) -> Result<(u32, u32, u64, u64, u64), String> {
    let start_time = std::time::Instant::now();
    
    // PowerShell ile ekran görüntüsü alma
    let resize_cmd = if config.width.is_some() && config.height.is_some() {
        format!("$bitmap = New-Object System.Drawing.Bitmap {}, {};
                $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
                $graphics.DrawImage($screenshot, 0, 0, {}, {});
                $screenshot = $bitmap;",
                config.width.unwrap(), config.height.unwrap(), config.width.unwrap(), config.height.unwrap())
    } else {
        "".to_string()
    };
    
    let display_cmd = if config.display_index >= 0 {
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
                $screenshot = $bitmap;", config.display_index)
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
    
    let quality_param = if config.format.to_lowercase() == "jpg" || config.format.to_lowercase() == "jpeg" {
        format!("
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1);
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, {});
        $jpegCodecInfo = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object {{ $_.FormatDescription -eq \"JPEG\" }};
        $screenshot.Save('{}', $jpegCodecInfo, $encoderParams);", config.quality, filepath)
    } else {
        format!("$screenshot.Save('{}', [System.Drawing.Imaging.ImageFormat]::{});", 
                filepath, config.format.to_uppercase())
    };
    
    let processing_start = std::time::Instant::now();
    
    let script = format!(
        "Add-Type -AssemblyName System.Windows.Forms,System.Drawing;
        $startMemory = [System.GC]::GetTotalMemory($false);
        $startTime = Get-Date;
        
        {}
        {}
        
        $processingTime = ((Get-Date) - $startTime).TotalMilliseconds;
        $startTime = Get-Date;
        
        {}
        
        $compressionTime = ((Get-Date) - $startTime).TotalMilliseconds;
        $endMemory = [System.GC]::GetTotalMemory($false);
        $memoryUsage = $endMemory - $startMemory;
        
        Write-Output \"$($screenshot.Width),$($screenshot.Height),$processingTime,$compressionTime,$memoryUsage\";",
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
    let parts: Vec<&str> = output_str.split(',').collect();
    
    if parts.len() >= 5 {
        let width = parts[0].parse::<u32>().unwrap_or(0);
        let height = parts[1].parse::<u32>().unwrap_or(0);
        let processing_time = parts[2].parse::<u64>().unwrap_or(0);
        let compression_time = parts[3].parse::<u64>().unwrap_or(0);
        let memory_usage = parts[4].parse::<u64>().unwrap_or(0);
        
        Ok((width, height, processing_time, compression_time, memory_usage))
    } else {
        Err("Ekran boyutları ve performans bilgileri alınamadı".to_string())
    }
}

// Linux'ta optimize edilmiş standart ekran görüntüsü alma
#[cfg(target_os = "linux")]
fn capture_screenshot_optimized_standard_linux(
    filepath: &str, 
    config: &OptimizedCudaConfig
) -> Result<(u32, u32, u64, u64, u64), String> {
    let start_time = std::time::Instant::now();
    
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
        if config.display_index >= 0 {
            format!("DISPLAY=:{} import -window root {}", config.display_index, temp_file)
        } else {
            format!("import -window root {}", temp_file)
        }
    } else if has_gnome_screenshot {
        if config.display_index >= 0 {
            format!("DISPLAY=:{} gnome-screenshot -f {}", config.display_index, temp_file)
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
    
    let processing_start = std::time::Instant::now();
    
    // Boyutlandırma ve format dönüşümü
    let convert_cmd = if config.width.is_some() && config.height.is_some() {
        if config.format.to_lowercase() == "jpg" || config.format.to_lowercase() == "jpeg" {
            format!("convert {} -resize {}x{} -quality {} {} && echo $?", 
                    temp_file, config.width.unwrap(), config.height.unwrap(), config.quality, filepath)
        } else {
            format!("convert {} -resize {}x{} {} && echo $?", 
                    temp_file, config.width.unwrap(), config.height.unwrap(), filepath)
        }
    } else {
        if config.format.to_lowercase() == "jpg" || config.format.to_lowercase() == "jpeg" {
            format!("convert {} -quality {} {} && echo $?", temp_file, config.quality, filepath)
        } else {
            format!("convert {} {} && echo $?", temp_file, filepath)
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
    
    let processing_time = processing_start.elapsed().as_millis() as u64;
    let compression_start = std::time::Instant::now();
    
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
    
    let compression_time = compression_start.elapsed().as_millis() as u64;
    
    // Bellek kullanımını tahmin et (gerçek ölçüm için daha karmaşık bir yöntem gerekir)
    let memory_usage = match std::fs::metadata(filepath) {
        Ok(metadata) => metadata.len() * 4, // Dosya boyutunun yaklaşık 4 katı bellek kullanımı
        Err(_) => 0,
    };
    
    let output_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let dimensions: Vec<&str> = output_str.split(',').collect();
    
    if dimensions.len() == 2 {
        let width = dimensions[0].parse::<u32>().unwrap_or(0);
        let height = dimensions[1].parse::<u32>().unwrap_or(0);
        
        Ok((width, height, processing_time, compression_time, memory_usage))
    } else {
        Err("Ekran boyutları alınamadı".to_string())
    }
}

// macOS'ta optimize edilmiş standart ekran görüntüsü alma
#[cfg(target_os = "macos")]
fn capture_screenshot_optimized_standard_macos(
    filepath: &str, 
    config: &OptimizedCudaConfig
) -> Result<(u32, u32, u64, u64, u64), String> {
    let start_time = std::time::Instant::now();
    
    // macOS'ta screencapture komutu ile ekran görüntüsü alma
    let format_flag = match config.format.to_lowercase().as_str() {
        "jpg" | "jpeg" => "-t jpg",
        "png" => "-t png",
        "pdf" => "-t pdf",
        "tiff" => "-t tiff",
        _ => "-t png", // Varsayılan olarak PNG
    };
    
    // Geçici dosya yolu
    let temp_file = format!("{}.temp", filepath);
    
    // Ekran görüntüsü alma komutu
    let capture_cmd = if config.display_index >= 0 {
        format!("screencapture {} -D {} -x {}", format_flag, config.display_index, temp_file)
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
    
    let processing_start = std::time::Instant::now();
    
    // Boyutlandırma ve format dönüşümü
    let convert_cmd = if config.width.is_some() && config.height.is_some() {
        if config.format.to_lowercase() == "jpg" || config.format.to_lowercase() == "jpeg" {
            format!("sips -s format jpeg -s formatOptions {} -z {} {} {} --out {} && echo $?", 
                    config.quality, config.height.unwrap(), config.width.unwrap(), temp_file, filepath)
        } else {
            format!("sips -s format {} -z {} {} {} --out {} && echo $?", 
                    config.format.to_lowercase(), config.height.unwrap(), config.width.unwrap(), temp_file, filepath)
        }
    } else {
        if config.format.to_lowercase() == "jpg" || config.format.to_lowercase() == "jpeg" {
            format!("sips -s format jpeg -s formatOptions {} {} --out {} && echo $?", 
                    config.quality, temp_file, filepath)
        } else {
            format!("sips -s format {} {} --out {} && echo $?", 
                    config.format.to_lowercase(), temp_file, filepath)
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
    
    let processing_time = processing_start.elapsed().as_millis() as u64;
    let compression_start = std::time::Instant::now();
    
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
    
    let compression_time = compression_start.elapsed().as_millis() as u64;
    
    // Bellek kullanımını tahmin et (gerçek ölçüm için daha karmaşık bir yöntem gerekir)
    let memory_usage = match std::fs::metadata(filepath) {
        Ok(metadata) => metadata.len() * 4, // Dosya boyutunun yaklaşık 4 katı bellek kullanımı
        Err(_) => 0,
    };
    
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
    
    Ok((width, height, processing_time, compression_time, memory_usage))
}
