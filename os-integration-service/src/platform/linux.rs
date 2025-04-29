#[cfg(target_os = "linux")]
use crate::platform::{PlatformInfo, ProcessInfo, FileInfo, DiskInfo, WindowInfo, FileChangeEvent};
use std::{
    collections::HashMap,
    fs,
    io::{self, Read},
    os::unix::{
        fs::MetadataExt, // For Linux specific metadata
        process::CommandExt, // For pre_exec
        ffi::OsStrExt,
    },
    path::{Path, PathBuf},
    process::{Command, Stdio},
    time::{Duration, SystemTime, UNIX_EPOCH},
    ffi::{CString, CStr, OsStr},
    mem::MaybeUninit,
    sync::{Arc, Mutex, mpsc::{self, Sender, Receiver}},
    thread,
};

// --- Inotify specific imports ---
#[cfg(target_os = "linux")]
use libc::{self, c_int, c_void, size_t, ssize_t};
#[cfg(target_os = "linux")]
use std::os::unix::io::{AsRawFd, RawFd};

// --- Platform Info --- (Existing code - minor improvements)

/// Linux sürüm bilgisini döndürür
pub fn get_linux_version() -> String {
    // /etc/os-release dosyasından dağıtım bilgisini okuma (Prefer this)
    if let Ok(content) = fs::read_to_string("/etc/os-release") {
        let mut pretty_name = None;
        let mut name = None;
        let mut version = None;
        for line in content.lines() {
            if line.starts_with("PRETTY_NAME=") {
                pretty_name = Some(line.trim_start_matches("PRETTY_NAME=").trim_matches(\'"\').to_string());
            } else if line.starts_with("NAME=") {
                name = Some(line.trim_start_matches("NAME=").trim_matches(\'"\').to_string());
            } else if line.starts_with("VERSION=") {
                version = Some(line.trim_start_matches("VERSION=").trim_matches(\'"\').to_string());
            }
        }
        if let Some(pn) = pretty_name {
            return pn;
        }
        if let (Some(n), Some(v)) = (name, version) {
            return format!("{} {}", n, v);
        }
    }

    // Alternatif olarak lsb_release komutunu kullan
    let output = Command::new("lsb_release")
        .arg("-d")
        .output();

    if let Ok(output) = output {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Some(description) = output_str.strip_prefix("Description:") {
                return description.trim().to_string();
            }
        }
    }

    // Son çare olarak uname komutunu kullan
    let output = Command::new("uname")
        .args(&["-s", "-r", "-o"]) // Kernel name, release, OS
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().replace("\n", " "));

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
        if output.status.success() {
            let arch = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !arch.is_empty() {
                return arch;
            }
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
    if let Ok(user) = std::env::var("LOGNAME") {
        if !user.is_empty() {
            return user;
        }
    }

    // Alternatif olarak whoami komutunu kullan
    let output = Command::new("whoami")
        .output()
        .map(|o| String::from_utf8_lossy(&output.stdout).trim().to_string());

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
        if output.status.success() {
            if let Ok(cores) = String::from_utf8_lossy(&output.stdout).trim().parse::<usize>() {
                return cores;
            }
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

    // Alternatif olarak free komutunu kullan (daha az güvenilir parse etme)
    let output = Command::new("free")
        .arg("-b") // bytes cinsinden
        .output();

    if let Ok(output) = output {
        if output.status.success() {
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
    }

    // Varsayılan değer
    0 // Return 0 if failed
}

// --- Process Management --- (Existing code + Enhancements)

/// Linux ta çalışan işlemleri listeler
pub fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    let mut processes = Vec::new();

    // /proc dizinini okuyarak işlemleri listele (Prefer this method)
    match fs::read_dir("/proc") {
        Ok(entries) => {
            for entry in entries.filter_map(Result::ok) {
                let file_name = entry.file_name();
                let file_name_str = file_name.to_string_lossy();

                // Sadece sayısal dizinleri işle (PID ler)
                if let Ok(pid) = file_name_str.parse::<u32>() {
                    if let Some(process_info) = get_process_info_from_proc(pid) {
                        processes.push(process_info);
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("Warning: Failed to read /proc directory: {}. Falling back to ps.", e);
            // Fallback to ps if /proc is unavailable
            return list_processes_ps();
        }
    }

    Ok(processes)
}

// Helper function using /proc
fn get_process_info_from_proc(pid: u32) -> Option<ProcessInfo> {
    let stat_path = format!("/proc/{}/stat", pid);
    let cmdline_path = format!("/proc/{}/cmdline", pid);
    let status_path = format!("/proc/{}/status", pid);

    let mut name = String::new();
    let mut state_char = \'?\";
    let mut memory_usage = 0u64;

    // İşlem adını oku (cmdline daha güvenilir, null ile ayrılmış argümanlar içerir)
    if let Ok(mut file) = fs::File::open(&cmdline_path) {
        let mut cmdline_content = Vec::new();
        if file.read_to_end(&mut cmdline_content).is_ok() {
            // İlk null byte a kadar olan kısmı al (genellikle komutun kendisi)
            if let Some(first_arg) = cmdline_content.split(|&b| b == 0).next() {
                name = String::from_utf8_lossy(first_arg).trim().to_string();
                // Bazen sadece path olur, dosya adını al
                if let Some(file_name) = Path::new(&name).file_name() {
                    name = file_name.to_string_lossy().into_owned();
                }
            }
        }
    }

    // İşlem adı boşsa veya garipse stat dosyasından oku (parantez içinde)
    if name.is_empty() || name.contains(\'\n
') {
        if let Ok(stat_content) = fs::read_to_string(&stat_path) {
            if let Some(start) = stat_content.find(\'(\
') {
                if let Some(end) = stat_content.rfind(\")\"
) {
                    name = stat_content[start + 1..end].to_string();
                }
            }
        }
    }

    // İşlem durumu ve bellek kullanımı
    if let Ok(status_content) = fs::read_to_string(&status_path) {
        for line in status_content.lines() {
            if line.starts_with("State:") {
                if let Some(state_part) = line.split_whitespace().nth(1) {
                    state_char = state_part.chars().next().unwrap_or(\'?\");
                }
            } else if line.starts_with("VmRSS:") { // Resident Set Size
                if let Some(mem_part) = line.split_whitespace().nth(1) {
                    if let Ok(kb) = mem_part.parse::<u64>() {
                        memory_usage = kb * 1024; // KB to Bytes
                    }
                }
            }
        }
    }

    // Statü karakterini okunabilir bir stringe çevir
    let status = match state_char {
        "R" => "Running".to_string(),
        "S" => "Sleeping".to_string(),
        "D" => "Disk Sleep".to_string(),
        "Z" => "Zombie".to_string(),
        "T" => "Stopped".to_string(),
        "t" => "Tracing stop".to_string(),
        "X" | "x" => "Dead".to_string(),
        "K" => "Wakekill".to_string(),
        "W" => "Waking".to_string(),
        "P" => "Parked".to_string(),
        "I" => "Idle".to_string(),
        _ => format!("Unknown ({})", state_char),
    };

    // Eğer isim hala boşsa, stat dosyasından tekrar dene (fallback)
    if name.is_empty() {
        if let Ok(stat_content) = fs::read_to_string(&stat_path) {
            let parts: Vec<&str> = stat_content.split_whitespace().collect();
            if parts.len() > 1 {
                name = parts[1].trim_matches(|c| c == \'(\' || c == \')\').to_string();
            }
        }
    }

    // Eğer hala isim yoksa, pid yi kullan
    if name.is_empty() {
        name = format!("pid_{}", pid);
    }

    Some(ProcessInfo {
        pid,
        name,
        memory_usage,
        status,
    })
}

// Fallback function using ps
fn list_processes_ps() -> Result<Vec<ProcessInfo>, String> {
    let output = Command::new("ps")
        .args(&["-eo", "pid,rss,stat,comm"])
        .output();

    match output {
        Ok(output) => {
            if !output.status.success() {
                return Err(format!("ps command failed: {}", String::from_utf8_lossy(&output.stderr)));
            }
            let output_str = String::from_utf8_lossy(&output.stdout);
            let mut processes = Vec::new();

            for line in output_str.lines().skip(1) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 4 {
                    if let Ok(pid) = parts[0].parse::<u32>() {
                        let memory_kb = parts[1].parse::<u64>().unwrap_or(0) * 1024; // KB to bytes
                        let state_str = parts[2];
                        let name = parts[3..].join(" ");

                        let state_char = state_str.chars().next().unwrap_or(\'?\");
                        let status = match state_char {
                            "R" => "Running".to_string(),
                            "S" => "Sleeping".to_string(),
                            "D" => "Disk Sleep".to_string(),
                            "Z" => "Zombie".to_string(),
                            "T" => "Stopped".to_string(),
                            _ => format!("Unknown ({})", state_char),
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
            Ok(processes)
        }
        Err(e) => Err(format!("Failed to execute ps command: {}", e)),
    }
}

/// Bir işlemi PID ile sonlandırır
pub fn kill_process(pid: u32) -> Result<(), String> {
    let output = Command::new("kill")
        .arg(pid.to_string())
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                Ok(())
            } else {
                Err(format!("Failed to kill process {}: {}", pid, String::from_utf8_lossy(&output.stderr)))
            }
        }
        Err(e) => Err(format!("Failed to execute kill command: {}", e)),
    }
}

/// Yeni bir işlem başlatır (setsid ile)
pub fn run_process(command: &str, args: &[String]) -> Result<ProcessInfo, String> {
    let mut cmd = Command::new(command);
    cmd.args(args);
    // Run in a new session to detach from the current terminal
    unsafe {
        cmd.pre_exec(|| {
            libc::setsid();
            Ok(())
        });
    }
    cmd.stdin(Stdio::null()); // Detach stdin
    cmd.stdout(Stdio::null()); // Detach stdout
    cmd.stderr(Stdio::null()); // Detach stderr

    match cmd.spawn() {
        Ok(child) => {
            let pid = child.id();
            // Getting memory usage immediately after spawn might be inaccurate
            let process_info = get_process_info_from_proc(pid).unwrap_or_else(|| ProcessInfo {
                pid,
                name: Path::new(command).file_name().unwrap_or_default().to_string_lossy().into_owned(),
                memory_usage: 0, // Placeholder
                status: "Running".to_string(),
            });
            Ok(process_info)
        }
        Err(e) => Err(format!("Failed to spawn process \"{}\": {}", command, e)),
    }
}

// --- Filesystem Access --- (Using std::fs - generally preferred)

/// Belirtilen yoldaki dosya ve dizinleri listeler
pub fn list_directory(path_str: &str) -> Result<Vec<FileInfo>, String> {
    let path = Path::new(path_str);
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", path_str));
    }

    let mut result = Vec::new();
    match fs::read_dir(path) {
        Ok(entries) => {
            for entry_result in entries {
                match entry_result {
                    Ok(entry) => {
                        let entry_path = entry.path();
                        match entry.metadata() {
                            Ok(metadata) => {
                                let name = entry.file_name().to_string_lossy().into_owned();
                                let is_directory = metadata.is_dir();
                                let size = metadata.len();
                                let last_modified = metadata.modified().ok();

                                result.push(FileInfo {
                                    name,
                                    path: entry_path.to_string_lossy().into_owned(),
                                    is_directory,
                                    size,
                                    last_modified,
                                });
                            }
                            Err(e) => eprintln!("Warning: Failed to get metadata for {:?}: {}", entry.path(), e),
                        }
                    }
                    Err(e) => eprintln!("Warning: Failed to read directory entry: {}", e),
                }
            }
            Ok(result)
        }
        Err(e) => Err(format!("Failed to read directory \"{}\": {}", path_str, e)),
    }
}

/// Bir dosyanın içeriğini okur
pub fn read_file(path_str: &str) -> Result<Vec<u8>, String> {
    fs::read(path_str).map_err(|e| format!("Failed to read file \"{}\": {}", path_str, e))
}

/// Bir dosyaya içerik yazar (dosya varsa üzerine yazar)
pub fn write_file(path_str: &str, content: &[u8]) -> Result<(), String> {
    fs::write(path_str, content).map_err(|e| format!("Failed to write file \"{}\": {}", path_str, e))
}

/// Bir dosya veya dizini siler
pub fn delete_path(path_str: &str) -> Result<(), String> {
    let path = Path::new(path_str);
    if !path.exists() {
        return Ok(()); // Already deleted
    }
    if path.is_dir() {
        fs::remove_dir_all(path).map_err(|e| format!("Failed to remove directory \"{}\": {}", path_str, e))
    } else {
        fs::remove_file(path).map_err(|e| format!("Failed to remove file \"{}\": {}", path_str, e))
    }
}

/// Bir dosya veya dizini taşır/yeniden adlandırır
pub fn move_path(source_str: &str, destination_str: &str) -> Result<(), String> {
    fs::rename(source_str, destination_str)
        .map_err(|e| format!("Failed to move \"{}\" to \"{}\": {}", source_str, destination_str, e))
}

/// Bir dosya veya dizini kopyalar (overwrite not directly supported by std::fs::copy for dirs)
pub fn copy_path(source_str: &str, destination_str: &str, overwrite: bool) -> Result<(), String> {
    let source = Path::new(source_str);
    let destination = Path::new(destination_str);

    if !source.exists() {
        return Err(format!("Source path does not exist: {}", source_str));
    }

    if destination.exists() && !overwrite {
        return Err(format!("Destination path already exists: {}", destination_str));
    }

    if source.is_dir() {
        // Recursive directory copy
        copy_directory_recursive(source, destination, overwrite)
    } else {
        // File copy
        if destination.exists() && overwrite {
            fs::remove_file(destination).map_err(|e| format!("Failed to remove existing destination file: {}", e))?;
        }
        fs::copy(source, destination)
            .map(|_| ()) // Discard the number of bytes copied
            .map_err(|e| format!("Failed to copy file: {}", e))
    }
}

fn copy_directory_recursive(source: &Path, destination: &Path, overwrite: bool) -> Result<(), String> {
    if !destination.exists() {
        fs::create_dir(destination).map_err(|e| format!("Failed to create destination directory: {}", e))?;
    }

    for entry_result in fs::read_dir(source).map_err(|e| format!("Failed to read source directory: {}", e))? {
        let entry = entry_result.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let entry_path = entry.path();
        let dest_path = destination.join(entry.file_name());

        if entry_path.is_dir() {
            copy_directory_recursive(&entry_path, &dest_path, overwrite)?;
        } else {
            if dest_path.exists() {
                if overwrite {
                    fs::remove_file(&dest_path).map_err(|e| format!("Failed to remove existing destination file: {}", e))?;
                } else {
                    // Skip if not overwriting and file exists
                    continue;
                }
            }
            fs::copy(&entry_path, &dest_path)
                .map_err(|e| format!("Failed to copy file {:?} to {:?}: {}", entry_path, dest_path, e))?;
        }
    }
    Ok(())
}

/// Yeni bir dizin oluşturur (gerekirse ara dizinlerle birlikte)
pub fn create_directory(path_str: &str) -> Result<(), String> {
    fs::create_dir_all(path_str).map_err(|e| format!("Failed to create directory \"{}\": {}", path_str, e))
}

/// Disk bilgilerini döndürür (mount komutunu kullanarak)
pub fn get_disk_info() -> Result<Vec<DiskInfo>, String> {
    let output = Command::new("df")
        .args(&["-P", "-B1"])
        .output(); // POSIX format, 1-byte blocks

    match output {
        Ok(output) => {
            if !output.status.success() {
                return Err(format!("df command failed: {}", String::from_utf8_lossy(&output.stderr)));
            }
            let output_str = String::from_utf8_lossy(&output.stdout);
            let mut disks = Vec::new();

            for line in output_str.lines().skip(1) { // Skip header
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 6 {
                    let name = parts[0].to_string(); // Filesystem path
                    let total_space = parts[1].parse::<u64>().unwrap_or(0);
                    // parts[2] is Used
                    let available_space = parts[3].parse::<u64>().unwrap_or(0);
                    // parts[4] is Capacity
                    let mount_point = parts[5].to_string();

                    // Try to get filesystem type using findmnt or mount
                    let fs_type = get_filesystem_type(&name).unwrap_or_else(|| "unknown".to_string());

                    disks.push(DiskInfo {
                        name, // Use filesystem path as name for Linux
                        mount_point,
                        total_space,
                        available_space,
                        file_system: fs_type,
                    });
                }
            }
            Ok(disks)
        }
        Err(e) => Err(format!("Failed to execute df command: {}", e)),
    }
}

// Helper to get filesystem type
fn get_filesystem_type(device: &str) -> Option<String> {
    // Try findmnt first
    let output = Command::new("findmnt")
        .args(&["-n", "-o", "FSTYPE", device])
        .output();
    if let Ok(ref output) = output {
        if output.status.success() {
            let fs_type = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !fs_type.is_empty() {
                return Some(fs_type);
            }
        }
    }

    // Fallback to parsing /etc/mtab or mount output (less reliable)
    let mount_output = Command::new("mount").output();
    if let Ok(mount_output) = mount_output {
        if mount_output.status.success() {
            let mount_str = String::from_utf8_lossy(&mount_output.stdout);
            for line in mount_str.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 5 && parts[0] == device {
                    return Some(parts[4].to_string());
                }
            }
        }
    }
    None
}

// --- Filesystem Monitoring --- (New Implementation using inotify)

// Global state for watchers (similar to Windows)
lazy_static::lazy_static! {
    static ref WATCHERS: Mutex<HashMap<String, (thread::JoinHandle<()>, Sender<()>)>> = Mutex::new(HashMap::new());
}

// Inotify event structure (simplified)
#[repr(C)]
struct InotifyEvent {
    wd: c_int,
    mask: u32,
    cookie: u32,
    len: u32,
    // name: [u8; NAME_MAX + 1], // Variable length name follows
}

const IN_ACCESS: u32 = 0x00000001; // File was accessed
const IN_MODIFY: u32 = 0x00000002; // File was modified
const IN_ATTRIB: u32 = 0x00000004; // Metadata changed
const IN_CLOSE_WRITE: u32 = 0x00000008; // Writtable file was closed
const IN_CLOSE_NOWRITE: u32 = 0x00000010; // Unwrittable file closed
const IN_OPEN: u32 = 0x00000020; // File was opened
const IN_MOVED_FROM: u32 = 0x00000040; // File was moved from X
const IN_MOVED_TO: u32 = 0x00000080; // File was moved to Y
const IN_CREATE: u32 = 0x00000100; // Subfile was created
const IN_DELETE: u32 = 0x00000200; // Subfile was deleted
const IN_DELETE_SELF: u32 = 0x00000400; // Self was deleted
const IN_MOVE_SELF: u32 = 0x00000800; // Self was moved
const IN_ISDIR: u32 = 0x40000000; // Event occurred against dir

/// Starts monitoring a directory for changes using inotify.
/// Returns a unique ID for the watcher.
pub fn start_monitoring_directory(path_str: &str, event_sender: Sender<FileChangeEvent>) -> Result<String, String> {
    let path = PathBuf::from(path_str);
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", path_str));
    }

    let watcher_id = uuid::Uuid::new_v4().to_string();
    let (stop_tx, stop_rx) = mpsc::channel::<()>();

    let handle = thread::spawn(move || {
        unsafe {
            // 1. Create inotify instance
            let fd = libc::inotify_init1(libc::IN_NONBLOCK | libc::IN_CLOEXEC);
            if fd < 0 {
                error!("inotify_init1 failed: {}", io::Error::last_os_error());
                return;
            }

            // Keep track of watch descriptors and paths
            let mut wd_map: HashMap<c_int, PathBuf> = HashMap::new();

            // Function to add watches recursively
            fn add_watch_recursive(fd: RawFd, path: &Path, wd_map: &mut HashMap<c_int, PathBuf>) -> io::Result<()> {
                let path_cstring = CString::new(path.as_os_str().as_bytes())?;
                let mask = IN_MODIFY | IN_MOVED_FROM | IN_MOVED_TO | IN_CREATE | IN_DELETE | IN_DELETE_SELF | IN_MOVE_SELF;
                let wd = libc::inotify_add_watch(fd, path_cstring.as_ptr(), mask);
                if wd < 0 {
                    return Err(io::Error::last_os_error());
                }
                wd_map.insert(wd, path.to_path_buf());

                // Recursively add watches for subdirectories
                for entry_res in fs::read_dir(path)? {
                    if let Ok(entry) = entry_res {
                        let entry_path = entry.path();
                        if entry_path.is_dir() {
                            if let Err(e) = add_watch_recursive(fd, &entry_path, wd_map) {
                                // Log error but continue trying to watch other dirs
                                eprintln!("Warning: Failed to add recursive watch for {:?}: {}", entry_path, e);
                            }
                        }
                    }
                }
                Ok(())
            }

            // Add initial watch
            if let Err(e) = add_watch_recursive(fd, &path, &mut wd_map) {
                error!("Failed to add initial watch for {}: {}", path.display(), e);
                libc::close(fd);
                return;
            }

            let event_size = mem::size_of::<InotifyEvent>();
            let mut buffer = [0u8; 4096]; // Buffer for reading events
            let mut rename_from: Option<(c_int, String)> = None; // Store MOVED_FROM event info

            loop {
                // Check for stop signal without blocking
                if stop_rx.try_recv().is_ok() {
                    info!("Stopping inotify monitor for {}", path.display());
                    break;
                }

                // Read events (non-blocking)
                let len = libc::read(fd, buffer.as_mut_ptr() as *mut c_void, buffer.len());

                if len < 0 {
                    let err = io::Error::last_os_error();
                    if err.kind() == io::ErrorKind::WouldBlock {
                        // No events available, wait briefly
                        thread::sleep(Duration::from_millis(100));
                        continue;
                    } else {
                        error!("inotify read failed: {}", err);
                        break; // Exit on other errors
                    }
                }

                if len == 0 {
                    // Should not happen unless fd closed?
                    warn!("inotify read returned 0");
                    break;
                }

                let mut offset = 0;
                while offset < len as usize {
                    let event_ptr = buffer.as_ptr().add(offset) as *const InotifyEvent;
                    let event = &*event_ptr;
                    let name_len = event.len as usize;
                    let name_ptr = (event_ptr as *const u8).add(event_size) as *const libc::c_char;
                    let name_bytes = std::slice::from_raw_parts(name_ptr as *const u8, name_len);
                    // Remove trailing null bytes if any
                    let name_os = OsStr::from_bytes(name_bytes.split(|&b| b == 0).next().unwrap_or(&[]));

                    if let Some(parent_path) = wd_map.get(&event.wd) {
                        let full_path = parent_path.join(name_os).to_string_lossy().into_owned();

                        let change_event = if (event.mask & IN_CREATE) != 0 {
                            if (event.mask & IN_ISDIR) != 0 {
                                // New directory created, add watch for it
                                let new_dir_path = parent_path.join(name_os);
                                if let Err(e) = add_watch_recursive(fd, &new_dir_path, &mut wd_map) {
                                    eprintln!("Warning: Failed to add watch for new directory {:?}: {}", new_dir_path, e);
                                }
                            }
                            Some(FileChangeEvent::Created(full_path))
                        } else if (event.mask & IN_DELETE) != 0 {
                            // If it was a directory, we don t need to explicitly remove watch, IN_DELETE_SELF handles it
                            Some(FileChangeEvent::Deleted(full_path))
                        } else if (event.mask & IN_MODIFY) != 0 || (event.mask & IN_CLOSE_WRITE) != 0 {
                            Some(FileChangeEvent::Modified(full_path))
                        } else if (event.mask & IN_MOVED_FROM) != 0 {
                            rename_from = Some((event.cookie, full_path));
                            None // Wait for MOVED_TO
                        } else if (event.mask & IN_MOVED_TO) != 0 {
                            if let Some((cookie, from_path)) = rename_from.take() {
                                if cookie == event.cookie {
                                    // This is the second part of a rename
                                    if (event.mask & IN_ISDIR) != 0 {
                                        // Update wd_map for the moved directory
                                        let new_dir_path = parent_path.join(name_os);
                                        // Find old wd and update path
                                        let mut old_wd = -1;
                                        for (wd, p) in wd_map.iter() {
                                            if *p == PathBuf::from(&from_path) {
                                                old_wd = *wd;
                                                break;
                                            }
                                        }
                                        if old_wd != -1 {
                                            wd_map.insert(old_wd, new_dir_path.clone());
                                            // Ideally, re-watch children, but complex. Rely on parent watch for now.
                                        } else {
                                             // If old watch not found, add new watch
                                             if let Err(e) = add_watch_recursive(fd, &new_dir_path, &mut wd_map) {
                                                eprintln!("Warning: Failed to add watch for moved directory {:?}: {}", new_dir_path, e);
                                            }
                                        }
                                    }
                                    Some(FileChangeEvent::Renamed { from: from_path, to: full_path })
                                } else {
                                    // Cookie mismatch, treat as separate delete and create
                                    let delete_event = FileChangeEvent::Deleted(from_path);
                                    let create_event = FileChangeEvent::Created(full_path);
                                    if let Err(e) = event_sender.send(delete_event) {
                                        error!("Failed to send file delete event (rename mismatch): {}", e);
                                        break; // Stop if channel closed
                                    }
                                    Some(create_event)
                                }
                            } else {
                                // MOVED_TO without MOVED_FROM, treat as create
                                Some(FileChangeEvent::Created(full_path))
                            }
                        } else if (event.mask & IN_DELETE_SELF) != 0 || (event.mask & IN_MOVE_SELF) != 0 {
                            // Watched directory itself deleted or moved, remove watch
                            if let Some(removed_path) = wd_map.remove(&event.wd) {
                                libc::inotify_rm_watch(fd, event.wd);
                                // Send delete event for the directory itself
                                Some(FileChangeEvent::Deleted(removed_path.to_string_lossy().into_owned()))
                            } else {
                                None
                            }
                        } else {
                            None // Ignore other events like IN_OPEN, IN_ACCESS, IN_ATTRIB etc.
                        };

                        if let Some(event) = change_event {
                            if let Err(e) = event_sender.send(event) {
                                error!("Failed to send file change event: {}", e);
                                break; // Stop if channel closed
                            }
                        }
                    } else {
                        warn!("Received event for unknown watch descriptor: {}", event.wd);
                    }

                    // Move to the next event in the buffer
                    let event_total_size = event_size + name_len;
                    // Align to event size boundary if needed (though usually not necessary)
                    // let aligned_size = (event_total_size + event_size - 1) / event_size * event_size;
                    offset += event_total_size;
                }
            }

            // Cleanup: Remove all watches and close fd
            for wd in wd_map.keys() {
                libc::inotify_rm_watch(fd, *wd);
            }
            libc::close(fd);
        }
    });

    let mut watchers = WATCHERS.lock().unwrap();
    watchers.insert(watcher_id.clone(), (handle, stop_tx));

    Ok(watcher_id)
}

/// Stops monitoring a directory using inotify.
pub fn stop_monitoring_directory(watcher_id: &str) -> Result<(), String> {
    let mut watchers = WATCHERS.lock().unwrap();
    if let Some((handle, stop_tx)) = watchers.remove(watcher_id) {
        // Send stop signal
        let _ = stop_tx.send(()); // Ignore error if receiver already dropped

        // Wait for the thread to finish
        if let Err(e) = handle.join() {
            error!("Error joining inotify watcher thread {}: {:?}", watcher_id, e);
        }
        info!("Successfully stopped inotify watcher {}", watcher_id);
        Ok(())
    } else {
        Err(format!("Watcher with ID {} not found", watcher_id))
    }
}

// --- Application Control --- (Placeholders - Requires X11 or Wayland specific libs)

pub fn find_window_by_title(title: &str) -> Result<isize, String> {
    Err("Linux window control not implemented yet".to_string())
}

pub fn send_window_message(hwnd_val: isize, message: u32, wparam: usize, lparam: isize) -> Result<isize, String> {
    Err("Linux window control not implemented yet".to_string())
}

pub fn post_window_message(hwnd_val: isize, message: u32, wparam: usize, lparam: isize) -> Result<(), String> {
    Err("Linux window control not implemented yet".to_string())
}

pub fn close_window(hwnd_val: isize) -> Result<(), String> {
    Err("Linux window control not implemented yet".to_string())
}

pub fn list_windows() -> Result<Vec<WindowInfo>, String> {
    // Try using `wmctrl -lG` or similar commands as a fallback
    let output = Command::new("wmctrl")
        .args(&["-l", "-G", "-p", "-x"]) // List, Geometry, PID, WM_CLASS
        .output();

    match output {
        Ok(output) => {
            if !output.status.success() {
                return Err(format!("wmctrl command failed: {}. Is wmctrl installed?", String::from_utf8_lossy(&output.stderr)));
            }
            let output_str = String::from_utf8_lossy(&output.stdout);
            let mut windows = Vec::new();

            for line in output_str.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 7 {
                    let id_str = parts[0];
                    // let desktop = parts[1];
                    let pid_str = parts[2];
                    // let x = parts[3];
                    // let y = parts[4];
                    // let width = parts[5];
                    // let height = parts[6];
                    // let wm_class = parts[7]; // May contain spaces
                    let hostname = parts[parts.len()-2]; // Second to last is usually hostname
                    let title = parts[parts.len()-1]; // Last part is usually title start
                    // Reconstruct title if it was split
                    let title_start_index = line.find(hostname).map(|i| i + hostname.len()).unwrap_or(0);
                    let title = line[title_start_index..].trim().to_string();

                    if let (Ok(id), Ok(pid)) = (isize::from_str_radix(&id_str[2..], 16), pid_str.parse::<u32>()) {
                        windows.push(WindowInfo {
                            id, // Store as isize (like HWND)
                            title,
                            process_id: pid,
                        });
                    }
                }
            }
            Ok(windows)
        }
        Err(e) => Err(format!("Failed to execute wmctrl command: {}. Is wmctrl installed?", e)),
    }
}

// --- Registry Access --- (Not applicable to Linux)

pub fn read_registry_string(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<String, String> {
    Err("Registry access is not supported on Linux".to_string())
}

pub fn read_registry_dword(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<u32, String> {
    Err("Registry access is not supported on Linux".to_string())
}

pub fn write_registry_string(root_key_str: &str, sub_key: &str, value_name: &str, data: &str) -> Result<(), String> {
    Err("Registry access is not supported on Linux".to_string())
}

pub fn write_registry_dword(root_key_str: &str, sub_key: &str, value_name: &str, data: u32) -> Result<(), String> {
    Err("Registry access is not supported on Linux".to_string())
}

pub fn delete_registry_value(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<(), String> {
    Err("Registry access is not supported on Linux".to_string())
}

// --- Screen Capture --- (Existing code - no changes needed for now)
// ... keep existing screenshot functions ...

// --- CUDA Screenshot --- (Placeholder/Existing)
pub fn capture_screen_cuda(filepath: &str, format: &str) -> Result<(u32, u32), String> {
    // Placeholder - Actual CUDA implementation needed
    warn!("CUDA screenshot capture is not fully implemented yet.");
    // Fallback to standard capture for now
    capture_linux_screenshot(filepath, format, -1)
}

