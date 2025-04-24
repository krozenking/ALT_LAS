// Doğrudan Rust-CUDA Entegrasyonu
// Bu modül, Python köprüsü olmadan doğrudan Rust'tan CUDA'ya erişim sağlar

use std::path::Path;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use log::{info, error, warn, debug};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use std::ffi::{CString, c_void};
use std::os::raw::{c_char, c_int, c_uint, c_float};

// CUDA FFI (Foreign Function Interface) tanımlamaları
#[allow(non_camel_case_types)]
type cudaError_t = c_int;
#[allow(non_camel_case_types)]
type CUdevice = c_int;
#[allow(non_camel_case_types)]
type CUcontext = *mut c_void;
#[allow(non_camel_case_types)]
type CUmodule = *mut c_void;
#[allow(non_camel_case_types)]
type CUfunction = *mut c_void;
#[allow(non_camel_case_types)]
type CUdeviceptr = usize;

// CUDA hata kodları
const CUDA_SUCCESS: cudaError_t = 0;

// CUDA FFI fonksiyonları
#[link(name = "cuda")]
extern "C" {
    fn cudaGetErrorString(error: cudaError_t) -> *const c_char;
    fn cudaGetDeviceCount(count: *mut c_int) -> cudaError_t;
    fn cudaSetDevice(device: c_int) -> cudaError_t;
    fn cudaGetDeviceProperties(prop: *mut CudaDeviceProp, device: c_int) -> cudaError_t;
    fn cudaMalloc(devPtr: *mut CUdeviceptr, size: usize) -> cudaError_t;
    fn cudaFree(devPtr: CUdeviceptr) -> cudaError_t;
    fn cudaMemcpy(dst: *mut c_void, src: *const c_void, count: usize, kind: c_int) -> cudaError_t;
    fn cudaDeviceSynchronize() -> cudaError_t;
}

// CUDA bellek kopyalama türleri
const CUDA_MEMCPY_HOST_TO_DEVICE: c_int = 1;
const CUDA_MEMCPY_DEVICE_TO_HOST: c_int = 2;

// CUDA cihaz özellikleri yapısı
#[repr(C)]
struct CudaDeviceProp {
    name: [c_char; 256],
    total_global_mem: usize,
    shared_mem_per_block: usize,
    regs_per_block: c_int,
    warp_size: c_int,
    max_threads_per_block: c_int,
    max_threads_dim: [c_int; 3],
    max_grid_size: [c_int; 3],
    clock_rate: c_int,
    total_const_mem: usize,
    major: c_int,
    minor: c_int,
    texture_alignment: usize,
    device_overlap: c_int,
    multi_processor_count: c_int,
    kernel_exec_timeout_enabled: c_int,
    integrated: c_int,
    can_map_host_memory: c_int,
    compute_mode: c_int,
    max_texture_1d: c_int,
    max_texture_2d: [c_int; 2],
    max_texture_3d: [c_int; 3],
    max_texture_1d_layered: [c_int; 2],
    surface_alignment: usize,
    concurrent_kernels: c_int,
    ecc_enabled: c_int,
    pci_bus_id: c_int,
    pci_device_id: c_int,
    pci_domain_id: c_int,
    tcc_driver: c_int,
    async_engine_count: c_int,
    unified_addressing: c_int,
    memory_clock_rate: c_int,
    memory_bus_width: c_int,
    l2_cache_size: c_int,
    max_threads_per_multi_processor: c_int,
    stream_priorities_supported: c_int,
    global_l1_cache_supported: c_int,
    local_l1_cache_supported: c_int,
    shared_mem_per_multiprocessor: usize,
    regs_per_multiprocessor: c_int,
    managed_memory: c_int,
    is_multi_gpu_board: c_int,
    multi_gpu_board_group_id: c_int,
    // Diğer özellikler için yer tutucu (padding)
    reserved: [c_int; 16],
}

// CUDA cihaz bilgisi
#[derive(Debug, Clone)]
pub struct CudaDeviceInfo {
    pub device_id: i32,
    pub name: String,
    pub total_memory: usize,
    pub compute_capability: (i32, i32),
    pub clock_rate: i32,
    pub multi_processor_count: i32,
    pub memory_clock_rate: i32,
    pub memory_bus_width: i32,
    pub l2_cache_size: i32,
}

// CUDA bellek yönetimi için güvenli sarmalayıcı
pub struct CudaMemory {
    ptr: CUdeviceptr,
    size: usize,
}

impl CudaMemory {
    pub fn new(size: usize) -> Result<Self, String> {
        let mut ptr: CUdeviceptr = 0;
        let result = unsafe { cudaMalloc(&mut ptr as *mut CUdeviceptr, size) };
        
        if result != CUDA_SUCCESS {
            let error_msg = unsafe { 
                std::ffi::CStr::from_ptr(cudaGetErrorString(result))
                    .to_string_lossy()
                    .into_owned() 
            };
            return Err(format!("CUDA bellek ayırma hatası: {}", error_msg));
        }
        
        Ok(Self { ptr, size })
    }
    
    pub fn as_ptr(&self) -> CUdeviceptr {
        self.ptr
    }
    
    pub fn size(&self) -> usize {
        self.size
    }
    
    pub fn copy_from_host(&self, data: &[u8]) -> Result<(), String> {
        if data.len() > self.size {
            return Err(format!("Veri boyutu ({}) ayrılan bellek boyutundan ({}) büyük", data.len(), self.size));
        }
        
        let result = unsafe { 
            cudaMemcpy(
                self.ptr as *mut c_void, 
                data.as_ptr() as *const c_void, 
                data.len(), 
                CUDA_MEMCPY_HOST_TO_DEVICE
            ) 
        };
        
        if result != CUDA_SUCCESS {
            let error_msg = unsafe { 
                std::ffi::CStr::from_ptr(cudaGetErrorString(result))
                    .to_string_lossy()
                    .into_owned() 
            };
            return Err(format!("Host'tan cihaza bellek kopyalama hatası: {}", error_msg));
        }
        
        Ok(())
    }
    
    pub fn copy_to_host(&self, data: &mut [u8]) -> Result<(), String> {
        if data.len() > self.size {
            return Err(format!("Hedef veri boyutu ({}) ayrılan bellek boyutundan ({}) büyük", data.len(), self.size));
        }
        
        let result = unsafe { 
            cudaMemcpy(
                data.as_mut_ptr() as *mut c_void, 
                self.ptr as *const c_void, 
                data.len(), 
                CUDA_MEMCPY_DEVICE_TO_HOST
            ) 
        };
        
        if result != CUDA_SUCCESS {
            let error_msg = unsafe { 
                std::ffi::CStr::from_ptr(cudaGetErrorString(result))
                    .to_string_lossy()
                    .into_owned() 
            };
            return Err(format!("Cihazdan host'a bellek kopyalama hatası: {}", error_msg));
        }
        
        Ok(())
    }
}

impl Drop for CudaMemory {
    fn drop(&mut self) {
        if self.ptr != 0 {
            unsafe { cudaFree(self.ptr) };
        }
    }
}

// CUDA cihaz yönetimi
pub struct CudaDevice {
    device_id: i32,
    info: CudaDeviceInfo,
}

impl CudaDevice {
    pub fn new(device_id: i32) -> Result<Self, String> {
        let result = unsafe { cudaSetDevice(device_id) };
        
        if result != CUDA_SUCCESS {
            let error_msg = unsafe { 
                std::ffi::CStr::from_ptr(cudaGetErrorString(result))
                    .to_string_lossy()
                    .into_owned() 
            };
            return Err(format!("CUDA cihazı ayarlama hatası: {}", error_msg));
        }
        
        let info = Self::get_device_info(device_id)?;
        
        Ok(Self { device_id, info })
    }
    
    pub fn get_device_info(device_id: i32) -> Result<CudaDeviceInfo, String> {
        let mut prop = unsafe { std::mem::zeroed::<CudaDeviceProp>() };
        
        let result = unsafe { cudaGetDeviceProperties(&mut prop, device_id) };
        
        if result != CUDA_SUCCESS {
            let error_msg = unsafe { 
                std::ffi::CStr::from_ptr(cudaGetErrorString(result))
                    .to_string_lossy()
                    .into_owned() 
            };
            return Err(format!("CUDA cihaz özelliklerini alma hatası: {}", error_msg));
        }
        
        let name = unsafe {
            std::ffi::CStr::from_ptr(prop.name.as_ptr())
                .to_string_lossy()
                .into_owned()
        };
        
        Ok(CudaDeviceInfo {
            device_id,
            name,
            total_memory: prop.total_global_mem,
            compute_capability: (prop.major, prop.minor),
            clock_rate: prop.clock_rate,
            multi_processor_count: prop.multi_processor_count,
            memory_clock_rate: prop.memory_clock_rate,
            memory_bus_width: prop.memory_bus_width,
            l2_cache_size: prop.l2_cache_size,
        })
    }
    
    pub fn synchronize(&self) -> Result<(), String> {
        let result = unsafe { cudaDeviceSynchronize() };
        
        if result != CUDA_SUCCESS {
            let error_msg = unsafe { 
                std::ffi::CStr::from_ptr(cudaGetErrorString(result))
                    .to_string_lossy()
                    .into_owned() 
            };
            return Err(format!("CUDA cihaz senkronizasyon hatası: {}", error_msg));
        }
        
        Ok(())
    }
    
    pub fn info(&self) -> &CudaDeviceInfo {
        &self.info
    }
}

// CUDA sistem yönetimi
pub struct CudaSystem {
    devices: Vec<CudaDeviceInfo>,
    current_device: Option<i32>,
}

impl CudaSystem {
    pub fn new() -> Result<Self, String> {
        let mut count: c_int = 0;
        let result = unsafe { cudaGetDeviceCount(&mut count) };
        
        if result != CUDA_SUCCESS {
            let error_msg = unsafe { 
                std::ffi::CStr::from_ptr(cudaGetErrorString(result))
                    .to_string_lossy()
                    .into_owned() 
            };
            return Err(format!("CUDA cihaz sayısını alma hatası: {}", error_msg));
        }
        
        if count == 0 {
            return Err("CUDA destekli cihaz bulunamadı".to_string());
        }
        
        let mut devices = Vec::with_capacity(count as usize);
        
        for i in 0..count {
            match CudaDevice::get_device_info(i) {
                Ok(info) => devices.push(info),
                Err(e) => warn!("Cihaz {} bilgisi alınamadı: {}", i, e),
            }
        }
        
        Ok(Self {
            devices,
            current_device: None,
        })
    }
    
    pub fn device_count(&self) -> usize {
        self.devices.len()
    }
    
    pub fn devices(&self) -> &[CudaDeviceInfo] {
        &self.devices
    }
    
    pub fn select_device(&mut self, device_id: i32) -> Result<(), String> {
        if device_id as usize >= self.devices.len() {
            return Err(format!("Geçersiz cihaz ID: {}", device_id));
        }
        
        let result = unsafe { cudaSetDevice(device_id) };
        
        if result != CUDA_SUCCESS {
            let error_msg = unsafe { 
                std::ffi::CStr::from_ptr(cudaGetErrorString(result))
                    .to_string_lossy()
                    .into_owned() 
            };
            return Err(format!("CUDA cihazı ayarlama hatası: {}", error_msg));
        }
        
        self.current_device = Some(device_id);
        Ok(())
    }
    
    pub fn current_device(&self) -> Option<&CudaDeviceInfo> {
        self.current_device.map(|id| &self.devices[id as usize])
    }
    
    pub fn is_available() -> bool {
        let mut count: c_int = 0;
        let result = unsafe { cudaGetDeviceCount(&mut count) };
        
        result == CUDA_SUCCESS && count > 0
    }
}

// CUDA ile ekran görüntüsü işleme
pub struct CudaScreenshot {
    width: u32,
    height: u32,
    channels: u32,
    device: CudaDevice,
    d_image: Option<CudaMemory>,
}

impl CudaScreenshot {
    pub fn new(device_id: i32) -> Result<Self, String> {
        let device = CudaDevice::new(device_id)?;
        
        Ok(Self {
            width: 0,
            height: 0,
            channels: 4, // RGBA
            device,
            d_image: None,
        })
    }
    
    pub fn process_image(&mut self, image_data: &[u8], width: u32, height: u32) -> Result<Vec<u8>, String> {
        self.width = width;
        self.height = height;
        
        let image_size = (width * height * self.channels) as usize;
        
        // GPU belleği ayır veya yeniden kullan
        if self.d_image.is_none() || self.d_image.as_ref().unwrap().size() < image_size {
            self.d_image = Some(CudaMemory::new(image_size)?);
        }
        
        let d_image = self.d_image.as_ref().unwrap();
        
        // Görüntüyü GPU'ya kopyala
        d_image.copy_from_host(image_data)?;
        
        // GPU'da görüntü işleme (burada basit bir örnek)
        // Gerçek uygulamada CUDA kernel'leri çağrılacak
        
        // İşlenmiş görüntüyü geri al
        let mut result_data = vec![0u8; image_size];
        d_image.copy_to_host(&mut result_data)?;
        
        // Cihazı senkronize et
        self.device.synchronize()?;
        
        Ok(result_data)
    }
    
    pub fn device_info(&self) -> &CudaDeviceInfo {
        self.device.info()
    }
}

// CUDA kernel yükleme ve çalıştırma
pub struct CudaKernel {
    module: CUmodule,
    function: CUfunction,
    name: String,
}

// CUDA kernel kodu (PTX formatında)
const SHARPEN_KERNEL_PTX: &str = r#"
.version 7.0
.target sm_50
.address_size 64

.visible .entry sharpen_kernel(
    .param .u64 image,
    .param .u32 width,
    .param .u32 height,
    .param .u32 channels
)
{
    .reg .b32 	    %r<16>;
    .reg .b64 	    %rd<8>;

    ld.param.u64 	%rd1, [image];
    ld.param.u32 	%r1, [width];
    ld.param.u32 	%r2, [height];
    ld.param.u32 	%r3, [channels];
    
    .reg .b32 	    %idx;
    .reg .b32 	    %idy;
    
    // Thread indeksleri
    mov.u32         %idx, %ctaid.x;
    mov.u32         %idy, %ctaid.y;
    
    // Görüntü sınırlarını kontrol et
    setp.ge.u32	    %p1, %idx, %r1;
    setp.ge.u32	    %p2, %idy, %r2;
    or.pred         %p3, %p1, %p2;
    @%p3 bra        END;
    
    // Kenar kontrolü
    setp.eq.u32	    %p4, %idx, 0;
    setp.eq.u32	    %p5, %idy, 0;
    setp.eq.u32	    %p6, %idx, %r1;
    setp.eq.u32	    %p7, %idy, %r2;
    or.pred         %p8, %p4, %p5;
    or.pred         %p9, %p6, %p7;
    or.pred         %p10, %p8, %p9;
    @%p10 bra       END;
    
    // Piksel indeksi hesapla
    mul.lo.u32      %r4, %idy, %r1;
    add.u32         %r5, %r4, %idx;
    mul.lo.u32      %r6, %r5, %r3;
    cvt.u64.u32     %rd2, %r6;
    add.u64         %rd3, %rd1, %rd2;
    
    // Komşu piksellerin indekslerini hesapla
    sub.u32         %r7, %idx, 1;
    mul.lo.u32      %r8, %idy, %r1;
    add.u32         %r9, %r8, %r7;
    mul.lo.u32      %r10, %r9, %r3;
    cvt.u64.u32     %rd4, %r10;
    add.u64         %rd5, %rd1, %rd4;
    
    // Her kanal için işlem yap
    mov.u32         %r11, 0;
CHANNEL_LOOP:
    ld.global.u8    %r12, [%rd3];
    
    // Keskinleştirme işlemi (basit bir örnek)
    mul.lo.u32      %r13, %r12, 5;
    ld.global.u8    %r14, [%rd5];
    sub.u32         %r13, %r13, %r14;
    
    // Değeri sınırla
    max.u32         %r13, %r13, 0;
    min.u32         %r13, %r13, 255;
    
    // Sonucu yaz
    st.global.u8    [%rd3], %r13;
    
    // Sonraki kanala geç
    add.u32         %r11, %r11, 1;
    add.u64         %rd3, %rd3, 1;
    add.u64         %rd5, %rd5, 1;
    setp.lt.u32     %p11, %r11, %r3;
    @%p11 bra       CHANNEL_LOOP;
    
END:
    ret;
}
"#;

// Rust-CUDA entegrasyonu için yardımcı fonksiyonlar
pub fn capture_screenshot_with_rust_cuda(
    filepath: &str,
    width: Option<u32>,
    height: Option<u32>,
    format: &str,
    quality: u8,
    display_index: i32
) -> Result<(u32, u32, u64, u64, u64, Option<f32>), String> {
    // CUDA kullanılabilirliğini kontrol et
    if !CudaSystem::is_available() {
        return Err("CUDA kullanılamıyor".to_string());
    }
    
    // CUDA sistemini başlat
    let mut cuda_system = CudaSystem::new()?;
    
    // En iyi cihazı seç (basit bir örnek olarak ilk cihazı kullanıyoruz)
    if cuda_system.device_count() == 0 {
        return Err("CUDA destekli cihaz bulunamadı".to_string());
    }
    
    let device_id = 0; // İlk cihazı kullan
    cuda_system.select_device(device_id)?;
    
    // Ekran görüntüsü al (platform-spesifik)
    let (raw_image, raw_width, raw_height) = capture_raw_screenshot(display_index)?;
    
    // Boyutlandırma
    let (image_data, final_width, final_height) = if let (Some(w), Some(h)) = (width, height) {
        resize_image(&raw_image, raw_width, raw_height, w, h)?
    } else {
        (raw_image, raw_width, raw_height)
    };
    
    // CUDA ile görüntü işleme
    let start_time = Instant::now();
    let mut cuda_screenshot = CudaScreenshot::new(device_id)?;
    let processed_image = cuda_screenshot.process_image(&image_data, final_width, final_height)?;
    let processing_time = start_time.elapsed().as_millis() as u64;
    
    // Görüntüyü kaydet
    let compression_start = Instant::now();
    save_image(&processed_image, final_width, final_height, filepath, format, quality)?;
    let compression_time = compression_start.elapsed().as_millis() as u64;
    
    // GPU kullanımını tahmin et (gerçek ölçüm için daha karmaşık bir yöntem gerekir)
    let gpu_utilization = Some(75.0); // Örnek değer
    
    // Bellek kullanımını tahmin et
    let memory_usage = (final_width * final_height * 4) as u64; // RGBA için 4 byte
    
    Ok((final_width, final_height, processing_time, compression_time, memory_usage, gpu_utilization))
}

// Platform-spesifik ekran görüntüsü alma
#[cfg(target_os = "windows")]
fn capture_raw_screenshot(display_index: i32) -> Result<(Vec<u8>, u32, u32), String> {
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
    
    let width = dimensions[0].parse::<u32>().unwrap_or(0);
    let height = dimensions[1].parse::<u32>().unwrap_or(0);
    
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
    let mut rgba_data = Vec::with_capacity((width * height * 4) as usize);
    
    for y in 0..height {
        let row_start = header_size + (height - 1 - y) as usize * (width as usize * 3 + (width as usize * 3) % 4);
        
        for x in 0..width {
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
    
    Ok((rgba_data, width, height))
}

#[cfg(target_os = "linux")]
fn capture_raw_screenshot(display_index: i32) -> Result<(Vec<u8>, u32, u32), String> {
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
    
    let width = dimensions[0].parse::<u32>().unwrap_or(0);
    let height = dimensions[1].parse::<u32>().unwrap_or(0);
    
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
    
    Ok((image_data, width, height))
}

#[cfg(target_os = "macos")]
fn capture_raw_screenshot(display_index: i32) -> Result<(Vec<u8>, u32, u32), String> {
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
    
    if width == 0 || height == 0 {
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
    
    Ok((image_data, width, height))
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

// Görüntüyü kaydet
fn save_image(
    image_data: &[u8],
    width: u32,
    height: u32,
    filepath: &str,
    format: &str,
    quality: u8
) -> Result<(), String> {
    // Basit bir örnek
    // Gerçek uygulamada bir görüntü işleme kütüphanesi kullanılabilir
    
    // Geçici bir raw dosyası oluştur
    let temp_raw = format!("{}.raw", filepath);
    std::fs::write(&temp_raw, image_data)
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

// Rust-CUDA entegrasyonu için yapılandırma
pub struct RustCudaConfig {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub format: String,
    pub quality: u8,
    pub display_index: i32,
    pub device_id: i32,
    pub use_hardware_acceleration: bool,
}

impl Default for RustCudaConfig {
    fn default() -> Self {
        Self {
            width: None,
            height: None,
            format: "png".to_string(),
            quality: 90,
            display_index: -1,
            device_id: 0,
            use_hardware_acceleration: true,
        }
    }
}

// Rust-CUDA entegrasyonu ile ekran görüntüsü alma
pub fn capture_screenshot_with_rust_cuda_config(
    filepath: &str,
    config: &RustCudaConfig
) -> Result<(u32, u32, u64, u64, u64, Option<f32>), String> {
    if !config.use_hardware_acceleration || !CudaSystem::is_available() {
        // Alternatif yöntem kullan
        return Err("CUDA kullanılamıyor, alternatif yöntem kullanılmalı".to_string());
    }
    
    capture_screenshot_with_rust_cuda(
        filepath,
        config.width,
        config.height,
        &config.format,
        config.quality,
        config.display_index
    )
}
