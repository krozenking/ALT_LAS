use actix_web::{web, HttpResponse, Responder, Error};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};
use log::{info, error, warn};
use tokio::fs as tokio_fs;
use tokio::io::AsyncWriteExt;
use std::time::{SystemTime, UNIX_EPOCH};
use cfg_if::cfg_if;

#[derive(Debug, Serialize)]
struct FileInfo {
    name: String,
    path: String,
    is_dir: bool,
    size: u64,
    modified: Option<String>,
    created: Option<String>,
    permissions: String,
    owner: Option<String>,
}

#[derive(Debug, Serialize)]
struct DiskInfo {
    path: String,
    total_space: u64,
    available_space: u64,
    is_removable: bool,
    file_system_type: String,
}

#[derive(Debug, Deserialize)]
pub struct DirectoryQuery {
    path: String,
}

#[derive(Debug, Deserialize)]
pub struct FileQuery {
    path: String,
}

#[derive(Debug, Deserialize)]
pub struct FileOperationRequest {
    path: String,
    new_path: Option<String>,
    content: Option<String>,
    mode: Option<String>, // "append" veya "overwrite"
}

/// Belirtilen dizindeki dosya ve klasörleri listeleyen API endpoint'i
pub async fn list_directory(query: web::Query<DirectoryQuery>) -> impl Responder {
    let path = &query.path;
    info!("Dizin listeleniyor: {}", path);
    
    let path_obj = Path::new(path);
    if !path_obj.exists() {
        error!("Dizin bulunamadı: {}", path);
        return HttpResponse::NotFound().json(serde_json::json!({
            "error": "Dizin bulunamadı"
        }));
    }
    
    if !path_obj.is_dir() {
        error!("Belirtilen yol bir dizin değil: {}", path);
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Belirtilen yol bir dizin değil"
        }));
    }
    
    match fs::read_dir(path) {
        Ok(entries) => {
            let mut files = Vec::new();
            
            for entry in entries {
                if let Ok(entry) = entry {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let file_path = entry.path().to_string_lossy().to_string();
                    let metadata = entry.metadata();
                    
                    if let Ok(metadata) = metadata {
                        let is_dir = metadata.is_dir();
                        let size = if is_dir { 0 } else { metadata.len() };
                        
                        let modified = metadata.modified()
                            .map(|time| time.duration_since(UNIX_EPOCH)
                                .map(|d| d.as_secs().to_string())
                                .unwrap_or_else(|_| "unknown".to_string()))
                            .ok();
                        
                        let created = metadata.created()
                            .map(|time| time.duration_since(UNIX_EPOCH)
                                .map(|d| d.as_secs().to_string())
                                .unwrap_or_else(|_| "unknown".to_string()))
                            .ok();
                        
                        let permissions = format_permissions(&metadata);
                        let owner = get_file_owner(&entry.path());
                        
                        files.push(FileInfo {
                            name: file_name,
                            path: file_path,
                            is_dir,
                            size,
                            modified,
                            created,
                            permissions,
                            owner,
                        });
                    }
                }
            }
            
            // Dosyaları ve dizinleri sırala (önce dizinler, sonra dosyalar)
            files.sort_by(|a, b| {
                if a.is_dir && !b.is_dir {
                    std::cmp::Ordering::Less
                } else if !a.is_dir && b.is_dir {
                    std::cmp::Ordering::Greater
                } else {
                    a.name.to_lowercase().cmp(&b.name.to_lowercase())
                }
            });
            
            HttpResponse::Ok().json(files)
        },
        Err(e) => {
            error!("Dizin okunamadı: {} - Hata: {}", path, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Dizin okunamadı: {}", e)
            }))
        }
    }
}

/// Dosya içeriğini okuyan API endpoint'i
pub async fn read_file(query: web::Query<FileQuery>) -> impl Responder {
    let path = &query.path;
    info!("Dosya okunuyor: {}", path);
    
    let path_obj = Path::new(path);
    if !path_obj.exists() {
        error!("Dosya bulunamadı: {}", path);
        return HttpResponse::NotFound().json(serde_json::json!({
            "error": "Dosya bulunamadı"
        }));
    }
    
    if !path_obj.is_file() {
        error!("Belirtilen yol bir dosya değil: {}", path);
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Belirtilen yol bir dosya değil"
        }));
    }
    
    match fs::read_to_string(path) {
        Ok(content) => {
            let metadata = fs::metadata(path).ok();
            let file_info = metadata.map(|m| {
                let modified = m.modified()
                    .map(|time| time.duration_since(UNIX_EPOCH)
                        .map(|d| d.as_secs().to_string())
                        .unwrap_or_else(|_| "unknown".to_string()))
                    .ok();
                
                let created = m.created()
                    .map(|time| time.duration_since(UNIX_EPOCH)
                        .map(|d| d.as_secs().to_string())
                        .unwrap_or_else(|_| "unknown".to_string()))
                    .ok();
                
                serde_json::json!({
                    "size": m.len(),
                    "modified": modified,
                    "created": created,
                    "permissions": format_permissions(&m),
                    "owner": get_file_owner(path_obj)
                })
            });
            
            HttpResponse::Ok().json(serde_json::json!({
                "path": path,
                "content": content,
                "info": file_info
            }))
        },
        Err(e) => {
            // Metin dosyası olarak okunamadıysa, binary dosya olabilir
            match fs::read(path) {
                Ok(binary_content) => {
                    let metadata = fs::metadata(path).ok();
                    let file_info = metadata.map(|m| {
                        let modified = m.modified()
                            .map(|time| time.duration_since(UNIX_EPOCH)
                                .map(|d| d.as_secs().to_string())
                                .unwrap_or_else(|_| "unknown".to_string()))
                            .ok();
                        
                        let created = m.created()
                            .map(|time| time.duration_since(UNIX_EPOCH)
                                .map(|d| d.as_secs().to_string())
                                .unwrap_or_else(|_| "unknown".to_string()))
                            .ok();
                        
                        serde_json::json!({
                            "size": m.len(),
                            "modified": modified,
                            "created": created,
                            "permissions": format_permissions(&m),
                            "owner": get_file_owner(path_obj),
                            "is_binary": true
                        })
                    });
                    
                    // Binary içeriği base64 olarak kodla
                    let base64_content = base64::encode(&binary_content);
                    
                    HttpResponse::Ok().json(serde_json::json!({
                        "path": path,
                        "content": base64_content,
                        "is_binary": true,
                        "info": file_info
                    }))
                },
                Err(e) => {
                    error!("Dosya okunamadı: {} - Hata: {}", path, e);
                    HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": format!("Dosya okunamadı: {}", e)
                    }))
                }
            }
        }
    }
}

/// Dosya oluşturan veya güncelleyen API endpoint'i
pub async fn write_file(data: web::Json<FileOperationRequest>) -> impl Responder {
    let path = &data.path;
    let content = match &data.content {
        Some(c) => c,
        None => {
            error!("Dosya içeriği belirtilmedi: {}", path);
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Dosya içeriği belirtilmedi"
            }));
        }
    };
    
    let mode = data.mode.as_deref().unwrap_or("overwrite");
    
    info!("Dosya yazılıyor: {} (mod: {})", path, mode);
    
    let path_obj = Path::new(path);
    
    // Eğer dizin yoksa oluştur
    if let Some(parent) = path_obj.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                error!("Dizin oluşturulamadı: {} - Hata: {}", parent.display(), e);
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": format!("Dizin oluşturulamadı: {}", e)
                }));
            }
        }
    }
    
    let result = match mode {
        "append" => {
            let mut file = match fs::OpenOptions::new()
                .create(true)
                .append(true)
                .open(path) {
                Ok(f) => f,
                Err(e) => {
                    error!("Dosya açılamadı (append): {} - Hata: {}", path, e);
                    return HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": format!("Dosya açılamadı: {}", e)
                    }));
                }
            };
            
            file.write_all(content.as_bytes())
        },
        _ => { // "overwrite" veya diğer değerler
            fs::write(path, content)
        }
    };
    
    match result {
        Ok(_) => {
            info!("Dosya başarıyla yazıldı: {}", path);
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "path": path
            }))
        },
        Err(e) => {
            error!("Dosya yazılamadı: {} - Hata: {}", path, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Dosya yazılamadı: {}", e)
            }))
        }
    }
}

/// Dosya veya dizin silen API endpoint'i
pub async fn delete_file(data: web::Json<FileOperationRequest>) -> impl Responder {
    let path = &data.path;
    info!("Dosya/dizin siliniyor: {}", path);
    
    let path_obj = Path::new(path);
    if !path_obj.exists() {
        error!("Dosya/dizin bulunamadı: {}", path);
        return HttpResponse::NotFound().json(serde_json::json!({
            "error": "Dosya/dizin bulunamadı"
        }));
    }
    
    let result = if path_obj.is_dir() {
        fs::remove_dir_all(path)
    } else {
        fs::remove_file(path)
    };
    
    match result {
        Ok(_) => {
            info!("Dosya/dizin başarıyla silindi: {}", path);
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "path": path
            }))
        },
        Err(e) => {
            error!("Dosya/dizin silinemedi: {} - Hata: {}", path, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Dosya/dizin silinemedi: {}", e)
            }))
        }
    }
}

/// Dosya veya dizin taşıyan/yeniden adlandıran API endpoint'i
pub async fn move_file(data: web::Json<FileOperationRequest>) -> impl Responder {
    let path = &data.path;
    let new_path = match &data.new_path {
        Some(p) => p,
        None => {
            error!("Yeni dosya yolu belirtilmedi");
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Yeni dosya yolu belirtilmedi"
            }));
        }
    };
    
    info!("Dosya/dizin taşınıyor: {} -> {}", path, new_path);
    
    let path_obj = Path::new(path);
    if !path_obj.exists() {
        error!("Kaynak dosya/dizin bulunamadı: {}", path);
        return HttpResponse::NotFound().json(serde_json::json!({
            "error": "Kaynak dosya/dizin bulunamadı"
        }));
    }
    
    // Eğer hedef dizin yoksa oluştur
    if let Some(parent) = Path::new(new_path).parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                error!("Hedef dizin oluşturulamadı: {} - Hata: {}", parent.display(), e);
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": format!("Hedef dizin oluşturulamadı: {}", e)
                }));
            }
        }
    }
    
    match fs::rename(path, new_path) {
        Ok(_) => {
            info!("Dosya/dizin başarıyla taşındı: {} -> {}", path, new_path);
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "old_path": path,
                "new_path": new_path
            }))
        },
        Err(e) => {
            error!("Dosya/dizin taşınamadı: {} -> {} - Hata: {}", path, new_path, e);
            
            // Farklı dosya sistemleri arasında taşıma yapılamıyorsa, kopyala-sil yöntemini dene
            if e.kind() == io::ErrorKind::CrossesDevices {
                warn!("Farklı dosya sistemleri arası taşıma, kopyala-sil yöntemi deneniyor");
                
                let copy_result = if path_obj.is_dir() {
                    copy_dir_all(path, new_path)
                } else {
                    fs::copy(path, new_path).map(|_| ())
                };
                
                match copy_result {
                    Ok(_) => {
                        // Kopyalama başarılı, şimdi kaynağı sil
                        let delete_result = if path_obj.is_dir() {
                            fs::remove_dir_all(path)
                        } else {
                            fs::remove_file(path)
                        };
                        
                        match delete_result {
                            Ok(_) => {
                                info!("Dosya/dizin başarıyla kopyalandı ve silindi: {} -> {}", path, new_path);
                                HttpResponse::Ok().json(serde_json::json!({
                                    "success": true,
                                    "old_path": path,
                                    "new_path": new_path,
                                    "method": "copy_and_delete"
                                }))
                            },
                            Err(e) => {
                                warn!("Dosya/dizin kopyalandı ama silinemedi: {} - Hata: {}", path, e);
                                HttpResponse::Ok().json(serde_json::json!({
                                    "success": true,
                                    "warning": format!("Kaynak dosya/dizin silinemedi: {}", e),
                                    "old_path": path,
                                    "new_path": new_path,
                                    "method": "copy_only"
                                }))
                            }
                        }
                    },
                    Err(e) => {
                        error!("Dosya/dizin kopyalanamadı: {} -> {} - Hata: {}", path, new_path, e);
                        HttpResponse::InternalServerError().json(serde_json::json!({
                            "error": format!("Dosya/dizin taşınamadı ve kopyalanamadı: {}", e)
                        }))
                    }
                }
            } else {
                HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": format!("Dosya/dizin taşınamadı: {}", e)
                }))
            }
        }
    }
}

/// Dizin oluşturan API endpoint'i
pub async fn create_directory(data: web::Json<FileOperationRequest>) -> impl Responder {
    let path = &data.path;
    info!("Dizin oluşturuluyor: {}", path);
    
    let path_obj = Path::new(path);
    if path_obj.exists() {
        if path_obj.is_dir() {
            warn!("Dizin zaten mevcut: {}", path);
            return HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "path": path,
                "already_exists": true
            }));
        } else {
            error!("Belirtilen yolda bir dosya mevcut: {}", path);
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Belirtilen yolda bir dosya mevcut"
            }));
        }
    }
    
    match fs::create_dir_all(path) {
        Ok(_) => {
            info!("Dizin başarıyla oluşturuldu: {}", path);
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "path": path
            }))
        },
        Err(e) => {
            error!("Dizin oluşturulamadı: {} - Hata: {}", path, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Dizin oluşturulamadı: {}", e)
            }))
        }
    }
}

/// Dosya veya dizin kopyalayan API endpoint'i
pub async fn copy_file(data: web::Json<FileOperationRequest>) -> impl Responder {
    let path = &data.path;
    let new_path = match &data.new_path {
        Some(p) => p,
        None => {
            error!("Hedef dosya yolu belirtilmedi");
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Hedef dosya yolu belirtilmedi"
            }));
        }
    };
    
    info!("Dosya/dizin kopyalanıyor: {} -> {}", path, new_path);
    
    let path_obj = Path::new(path);
    if !path_obj.exists() {
        error!("Kaynak dosya/dizin bulunamadı: {}", path);
        return HttpResponse::NotFound().json(serde_json::json!({
            "error": "Kaynak dosya/dizin bulunamadı"
        }));
    }
    
    // Eğer hedef dizin yoksa oluştur
    if let Some(parent) = Path::new(new_path).parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                error!("Hedef dizin oluşturulamadı: {} - Hata: {}", parent.display(), e);
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": format!("Hedef dizin oluşturulamadı: {}", e)
                }));
            }
        }
    }
    
    let result = if path_obj.is_dir() {
        copy_dir_all(path, new_path)
    } else {
        fs::copy(path, new_path).map(|_| ())
    };
    
    match result {
        Ok(_) => {
            info!("Dosya/dizin başarıyla kopyalandı: {} -> {}", path, new_path);
            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "source_path": path,
                "destination_path": new_path
            }))
        },
        Err(e) => {
            error!("Dosya/dizin kopyalanamadı: {} -> {} - Hata: {}", path, new_path, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Dosya/dizin kopyalanamadı: {}", e)
            }))
        }
    }
}

/// Disk bilgilerini döndüren API endpoint'i
pub async fn get_disk_info() -> impl Responder {
    info!("Disk bilgileri alınıyor");
    
    let disks = get_available_disks();
    
    HttpResponse::Ok().json(disks)
}

/// Dosya izinlerini formatlar
fn format_permissions(metadata: &fs::Metadata) -> String {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mode = metadata.permissions().mode();
        let user = (mode >> 6) & 0o7;
        let group = (mode >> 3) & 0o7;
        let other = mode & 0o7;
        
        let user_str = format_permission_bits(user);
        let group_str = format_permission_bits(group);
        let other_str = format_permission_bits(other);
        
        format!("{}{}{}", user_str, group_str, other_str)
    }
    
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        let attrs = metadata.file_attributes();
        
        let mut result = String::new();
        
        if attrs & 0x1 != 0 { result.push('R'); } else { result.push('-'); } // READ_ONLY
        if attrs & 0x2 != 0 { result.push('H'); } else { result.push('-'); } // HIDDEN
        if attrs & 0x4 != 0 { result.push('S'); } else { result.push('-'); } // SYSTEM
        if attrs & 0x10 != 0 { result.push('D'); } else { result.push('-'); } // DIRECTORY
        if attrs & 0x20 != 0 { result.push('A'); } else { result.push('-'); } // ARCHIVE
        
        result
    }
    
    #[cfg(not(any(unix, windows)))]
    {
        let readonly = metadata.permissions().readonly();
        if readonly { "r--".to_string() } else { "rw-".to_string() }
    }
}

#[cfg(unix)]
fn format_permission_bits(bits: u32) -> String {
    let r = if bits & 0o4 != 0 { 'r' } else { '-' };
    let w = if bits & 0o2 != 0 { 'w' } else { '-' };
    let x = if bits & 0o1 != 0 { 'x' } else { '-' };
    format!("{}{}{}", r, w, x)
}

/// Dosya sahibini döndürür
fn get_file_owner(path: &Path) -> Option<String> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::MetadataExt;
        if let Ok(metadata) = fs::metadata(path) {
            let uid = metadata.uid();
            let gid = metadata.gid();
            
            // /etc/passwd ve /etc/group dosyalarından kullanıcı ve grup adlarını almak için
            // libc kullanılabilir, ancak basitlik için sadece ID'leri döndürüyoruz
            Some(format!("{}:{}", uid, gid))
        } else {
            None
        }
    }
    
    #[cfg(windows)]
    {
        // Windows'ta dosya sahibini almak için daha karmaşık API çağrıları gerekir
        // Basitlik için şimdilik None döndürüyoruz
        None
    }
    
    #[cfg(not(any(unix, windows)))]
    {
        None
    }
}

/// Dizini tüm içeriğiyle birlikte kopyalar
fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

/// Kullanılabilir diskleri döndürür
fn get_available_disks() -> Vec<DiskInfo> {
    let mut disks = Vec::new();
    
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            // Windows'ta kullanılabilir sürücüleri bul
            for drive_letter in b'A'..=b'Z' {
                let drive = format!("{}:\\", drive_letter as char);
                let path = Path::new(&drive);
                
                if path.exists() {
                    if let Ok(available) = fs::metadata(path) {
                        if available.is_dir() {
                            // Disk bilgilerini al
                            if let Some(disk_info) = get_windows_disk_info(path) {
                                disks.push(disk_info);
                            }
                        }
                    }
                }
            }
        } else if #[cfg(target_os = "macos")] {
            // macOS'ta /Volumes dizinindeki bağlı diskleri bul
            if let Ok(entries) = fs::read_dir("/Volumes") {
                for entry in entries.filter_map(Result::ok) {
                    let path = entry.path();
                    if path.is_dir() {
                        if let Some(disk_info) = get_unix_disk_info(&path) {
                            disks.push(disk_info);
                        }
                    }
                }
            }
            
            // Kök dizini de ekle
            if let Some(disk_info) = get_unix_disk_info(Path::new("/")) {
                disks.push(disk_info);
            }
        } else if #[cfg(target_os = "linux")] {
            // Linux'ta /proc/mounts dosyasını okuyarak bağlı diskleri bul
            if let Ok(content) = fs::read_to_string("/proc/mounts") {
                for line in content.lines() {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 2 {
                        let mount_point = parts[1];
                        let path = Path::new(mount_point);
                        
                        // Gerçek dosya sistemlerini filtrele
                        if !mount_point.starts_with("/proc") && 
                           !mount_point.starts_with("/sys") && 
                           !mount_point.starts_with("/dev") &&
                           path.exists() {
                            if let Some(disk_info) = get_unix_disk_info(path) {
                                disks.push(disk_info);
                            }
                        }
                    }
                }
            }
        }
    }
    
    disks
}

#[cfg(target_os = "windows")]
fn get_windows_disk_info(path: &Path) -> Option<DiskInfo> {
    use std::os::windows::ffi::OsStrExt;
    use windows::Win32::Storage::FileSystem::{GetDiskFreeSpaceExW, GetVolumeInformationW};
    use windows::Win32::Foundation::PWSTR;
    
    let path_str = path.to_string_lossy().to_string();
    
    unsafe {
        // Disk alanı bilgilerini al
        let mut total_bytes = 0;
        let mut free_bytes = 0;
        let mut available_bytes = 0;
        
        // Windows API'si için geniş karakter dizisi oluştur
        let wide_path: Vec<u16> = path.as_os_str().encode_wide().chain(std::iter::once(0)).collect();
        
        let result = GetDiskFreeSpaceExW(
            PWSTR(wide_path.as_ptr() as *mut _),
            &mut available_bytes,
            &mut total_bytes,
            &mut free_bytes
        );
        
        if !result.as_bool() {
            return None;
        }
        
        // Disk tipi ve etiket bilgilerini al
        let mut volume_name_buffer = [0u16; 256];
        let mut fs_name_buffer = [0u16; 256];
        let mut volume_serial_number = 0;
        let mut max_component_length = 0;
        let mut fs_flags = 0;
        
        let result = GetVolumeInformationW(
            PWSTR(wide_path.as_ptr() as *mut _),
            PWSTR(volume_name_buffer.as_mut_ptr()),
            volume_name_buffer.len() as u32,
            &mut volume_serial_number,
            &mut max_component_length,
            &mut fs_flags,
            PWSTR(fs_name_buffer.as_mut_ptr()),
            fs_name_buffer.len() as u32
        );
        
        if !result.as_bool() {
            return None;
        }
        
        // Dosya sistemi adını al
        let fs_name_end = fs_name_buffer.iter().position(|&c| c == 0).unwrap_or(fs_name_buffer.len());
        let fs_name = String::from_utf16_lossy(&fs_name_buffer[..fs_name_end]);
        
        // Çıkarılabilir disk mi kontrol et (A: ve B: disketler, diğerleri için daha karmaşık kontrol gerekir)
        let is_removable = path_str.starts_with("A:") || path_str.starts_with("B:");
        
        Some(DiskInfo {
            path: path_str,
            total_space: total_bytes,
            available_space: available_bytes,
            is_removable,
            file_system_type: fs_name,
        })
    }
}

#[cfg(any(target_os = "linux", target_os = "macos"))]
fn get_unix_disk_info(path: &Path) -> Option<DiskInfo> {
    use std::mem::MaybeUninit;
    use std::ffi::CString;
    
    let path_str = path.to_string_lossy().to_string();
    
    // statvfs kullanarak disk bilgilerini al
    let path_cstr = match CString::new(path_str.clone()) {
        Ok(s) => s,
        Err(_) => return None,
    };
    
    unsafe {
        let mut stat = MaybeUninit::uninit();
        if libc::statvfs(path_cstr.as_ptr(), stat.as_mut_ptr()) != 0 {
            return None;
        }
        
        let stat = stat.assume_init();
        
        // Toplam ve kullanılabilir alanı hesapla
        let block_size = stat.f_frsize as u64;
        let total_blocks = stat.f_blocks as u64;
        let free_blocks = stat.f_bavail as u64;
        
        let total_space = block_size * total_blocks;
        let available_space = block_size * free_blocks;
        
        // Dosya sistemi tipini al
        let fs_type = get_fs_type(path);
        
        // Çıkarılabilir disk mi kontrol et
        let is_removable = is_removable_disk(path);
        
        Some(DiskInfo {
            path: path_str,
            total_space,
            available_space,
            is_removable,
            file_system_type: fs_type,
        })
    }
}

#[cfg(target_os = "linux")]
fn get_fs_type(path: &Path) -> String {
    // /proc/mounts dosyasından dosya sistemi tipini bul
    if let Ok(content) = fs::read_to_string("/proc/mounts") {
        let path_str = path.to_string_lossy();
        for line in content.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 && parts[1] == path_str {
                return parts[2].to_string();
            }
        }
    }
    
    "unknown".to_string()
}

#[cfg(target_os = "macos")]
fn get_fs_type(path: &Path) -> String {
    // macOS'ta mount komutunu kullanarak dosya sistemi tipini bul
    let output = Command::new("mount")
        .output();
        
    if let Ok(output) = output {
        let output_str = String::from_utf8_lossy(&output.stdout);
        let path_str = path.to_string_lossy();
        
        for line in output_str.lines() {
            if line.contains(&path_str) {
                if let Some(fs_type) = line.split('(').nth(1) {
                    if let Some(fs_type) = fs_type.split(',').next() {
                        return fs_type.to_string();
                    }
                }
            }
        }
    }
    
    "unknown".to_string()
}

#[cfg(target_os = "linux")]
fn is_removable_disk(path: &Path) -> bool {
    // /sys/block altındaki removable bayrağını kontrol et
    let path_str = path.to_string_lossy();
    
    // /dev/sdX formatındaki diskleri kontrol et
    if let Ok(content) = fs::read_to_string("/proc/mounts") {
        for line in content.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 && parts[1] == path_str {
                let device = parts[0];
                if device.starts_with("/dev/sd") {
                    let device_name = device.trim_start_matches("/dev/");
                    let removable_path = format!("/sys/block/{}/removable", device_name);
                    
                    if let Ok(content) = fs::read_to_string(removable_path) {
                        return content.trim() == "1";
                    }
                }
            }
        }
    }
    
    // USB veya SD kart gibi tipik çıkarılabilir disk yollarını kontrol et
    path_str.contains("/media/") || path_str.contains("/mnt/")
}

#[cfg(target_os = "macos")]
fn is_removable_disk(path: &Path) -> bool {
    // macOS'ta tipik olarak çıkarılabilir diskler /Volumes altında bulunur
    // ve kök dizin değildir
    let path_str = path.to_string_lossy();
    path_str.starts_with("/Volumes/") && path_str != "/Volumes"
}
