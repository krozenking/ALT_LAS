#[cfg(target_os = "macos")]
use cocoa::base::{id, nil, NO, YES};
#[cfg(target_os = "macos")]
use cocoa::foundation::{NSArray, NSAutoreleasePool, NSProcessInfo, NSString, NSPoint, NSRect, NSSize, NSUInteger, NSDate};
#[cfg(target_os = "macos")]
use core_foundation::{
    base::{CFRelease, TCFType, kCFAllocatorDefault, CFIndex, CFGetAllocator, CFTypeRef},
    string::{CFString, CFStringRef, CFStringGetCStringPtr, CFStringGetCString, kCFStringEncodingUTF8},
    dictionary::{CFDictionary, CFDictionaryRef, CFDictionaryGetValue},
    number::{CFNumber, CFNumberRef, CFNumberGetValue, kCFNumberSInt64Type, kCFNumberIntType},
    array::{CFArray, CFArrayRef, CFArrayGetValueAtIndex, CFArrayGetCount},
    url::{CFURLRef, CFURLCopyFileSystemPath, kCFURLPOSIXPathStyle},
    runloop::{CFRunLoopRef, CFRunLoopGetCurrent, CFRunLoopRun, CFRunLoopStop, CFRunLoopAddSource, CFRunLoopRemoveSource, kCFRunLoopDefaultMode},
    date::CFAbsoluteTimeGetCurrent,
};
#[cfg(target_os = "macos")]
use core_graphics::{
    display::{CGMainDisplayID, CGDisplayBounds, CGWindowListCopyWindowInfo, kCGWindowListOptionOnScreenOnly, kCGNullWindowID, kCGWindowNumber, kCGWindowOwnerPID, kCGWindowName},
};
#[cfg(target_os = "macos")]
use objc::{class, msg_send, sel, sel_impl};
#[cfg(target_os = "macos")]
use std::ffi::{CStr, CString};
#[cfg(target_os = "macos")]
use std::os::unix::ffi::OsStrExt;
#[cfg(target_os = "macos")]
use std::mem::{self, MaybeUninit};
#[cfg(target_os = "macos")]
use std::ptr;

use crate::platform::{PlatformInfo, ProcessInfo, FileInfo, DiskInfo, WindowInfo, FileChangeEvent};
use std::{
    collections::HashMap,
    fs,
    io,
    os::unix::fs::MetadataExt, // For macOS specific metadata like device ID
    path::{Path, PathBuf},
    process::Command,
    sync::{Arc, Mutex, mpsc::{self, Sender, Receiver}},
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

// --- FSEvents specific imports ---
#[cfg(target_os = "macos")]
use core_foundation::{
    eventloop::{CFRunLoopSourceRef},
    filedescriptor::{kCFFileDescriptorReadCallBack, CFFileDescriptorRef, CFFileDescriptorCreate, CFFileDescriptorGetNativeDescriptor, CFFileDescriptorEnableCallBacks, CFFileDescriptorInvalidate},
};
#[cfg(target_os = "macos")]
use fsevent::{Event, StreamFlags, create_event_stream, raw::FSEventStreamRef};

// --- Platform Info --- (Existing code - no changes needed for now)

/// macOS sürüm bilgisini döndürür
pub fn get_macos_version() -> String {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let pool = NSAutoreleasePool::new(nil);

            let process_info: id = msg_send![class!(NSProcessInfo), processInfo];
            let os_version: id = msg_send![process_info, operatingSystemVersion];

            let major: u64 = msg_send![os_version, majorVersion];
            let minor: u64 = msg_send![os_version, minorVersion];
            let patch: u64 = msg_send![os_version, patchVersion];

            let version = format!("macOS {}.{}.{}", major, minor, patch);

            // macOS version name mapping
            let version_name = match major {
                15 => "Sequoia", // Assuming 15 is next
                14 => "Sonoma",
                13 => "Ventura",
                12 => "Monterey",
                11 => "Big Sur",
                10 => {
                    match minor {
                        15 => "Catalina",
                        14 => "Mojave",
                        13 => "High Sierra",
                        12 => "Sierra",
                        11 => "El Capitan",
                        10 => "Yosemite",
                        9 => "Mavericks",
                        8 => "Mountain Lion",
                        7 => "Lion",
                        6 => "Snow Leopard",
                        5 => "Leopard",
                        4 => "Tiger",
                        3 => "Panther",
                        2 => "Jaguar",
                        1 => "Puma",
                        0 => "Cheetah",
                        _ => "",
                    }
                },
                _ => "",
            };

            let result = if version_name.is_empty() {
                version
            } else {
                format!("{} ({})", version, version_name)
            };

            let _: () = msg_send![pool, release];

            return result;
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        "macOS (Not Applicable)".to_string()
    }
}

/// macOS için detaylı platform bilgilerini döndürür
pub fn get_detailed_info() -> PlatformInfo {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let pool = NSAutoreleasePool::new(nil);

            // Get hostname
            let hostname = get_hostname();

            // Get username
            let username = get_username();

            // Get CPU cores
            let process_info: id = msg_send![class!(NSProcessInfo), processInfo];
            let cpu_cores: usize = msg_send![process_info, processorCount];

            // Get memory
            let physical_memory: u64 = msg_send![process_info, physicalMemory];

            // Get architecture
            let architecture = get_architecture();

            let result = PlatformInfo {
                os_type: "macOS".to_string(),
                os_version: get_macos_version(),
                architecture,
                hostname,
                username,
                cpu_cores,
                memory_total: physical_memory,
            };

            let _: () = msg_send![pool, release];

            return result;
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        // Placeholder for non-macOS platforms
        PlatformInfo {
            os_type: "N/A".to_string(),
            os_version: "N/A".to_string(),
            architecture: std::env::consts::ARCH.to_string(),
            hostname: get_hostname(),
            username: get_username(),
            cpu_cores: get_cpu_cores(),
            memory_total: get_memory_total(),
        }
    }
}

#[cfg(target_os = "macos")]
fn get_architecture() -> String {
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
    std::env::consts::ARCH.to_string()
}

fn get_hostname() -> String {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let pool = NSAutoreleasePool::new(nil);

            let process_info: id = msg_send![class!(NSProcessInfo), processInfo];
            let ns_hostname: id = msg_send![process_info, hostName];

            let bytes: *const std::os::raw::c_char = msg_send![ns_hostname, UTF8String];
            let result = if !bytes.is_null() {
                let c_str = std::ffi::CStr::from_ptr(bytes);
                c_str.to_string_lossy().into_owned()
            } else {
                "unknown".to_string()
            };

            let _: () = msg_send![pool, release];

            return result;
        }
    }

    // Fallback or non-macOS platforms
    let output = Command::new("hostname")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    output.unwrap_or_else(|_| "unknown".to_string())
}

fn get_username() -> String {
    // Use std::env::var which works on macOS too
    std::env::var("USER").unwrap_or_else(|_| "unknown".to_string())
}

fn get_cpu_cores() -> usize {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let pool = NSAutoreleasePool::new(nil);

            let process_info: id = msg_send![class!(NSProcessInfo), processInfo];
            let cpu_cores: usize = msg_send![process_info, processorCount];

            let _: () = msg_send![pool, release];

            return cpu_cores;
        }
    }

    // Fallback or non-macOS platforms
    std::thread::available_parallelism().map_or(1, |p| p.get())
}

fn get_memory_total() -> u64 {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let pool = NSAutoreleasePool::new(nil);

            let process_info: id = msg_send![class!(NSProcessInfo), processInfo];
            let physical_memory: u64 = msg_send![process_info, physicalMemory];

            let _: () = msg_send![pool, release];

            return physical_memory;
        }
    }

    // Fallback or non-macOS platforms
    0 // Return 0 if not on macOS or failed
}

// --- Process Management --- (Existing code - no changes needed for now)

/// macOS ta çalışan işlemleri listeler
pub fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    #[cfg(target_os = "macos")]
    {
        let mut processes = Vec::new();

        // ps komutunu kullanarak işlem listesi alıyoruz
        let output = Command::new("ps")
            .args(&["-eo", "pid,rss,state,comm"])
            .output();

        match output {
            Ok(output) => {
                let output_str = String::from_utf8_lossy(&output.stdout);

                // İlk satırı atlayarak (başlık satırı) işlemleri işliyoruz
                for line in output_str.lines().skip(1) {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 4 {
                        if let Ok(pid) = parts[0].parse::<u32>() {
                            let memory_kb = parts[1].parse::<u64>().unwrap_or(0) * 1024; // KB to bytes
                            let state = parts[2].to_string();
                            let name = parts[3..].join(" ");

                            let status = match state.chars().next().unwrap_or("?") {
                                "R" => "Running".to_string(),
                                "S" => "Sleeping".to_string(),
                                "I" => "Idle".to_string(),
                                "T" => "Stopped".to_string(),
                                "Z" => "Zombie".to_string(),
                                "U" => "Uninterruptible Wait".to_string(),
                                _ => format!("Unknown ({})", state),
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

    #[cfg(not(target_os = "macos"))]
    {
        Ok(Vec::new()) // Non-macOS platformlar için boş liste
    }
}

/// Bir işlemi PID ile sonlandırır
pub fn kill_process(pid: u32) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
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
    #[cfg(not(target_os = "macos"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Yeni bir işlem başlatır
pub fn run_process(command: &str, args: &[String]) -> Result<ProcessInfo, String> {
    #[cfg(target_os = "macos")]
    {
        let mut cmd = Command::new(command);
        cmd.args(args);
        // No setsid equivalent needed directly, macOS handles process groups differently
        cmd.stdin(std::process::Stdio::null()); // Detach stdin
        cmd.stdout(std::process::Stdio::null()); // Detach stdout
        cmd.stderr(std::process::Stdio::null()); // Detach stderr

        match cmd.spawn() {
            Ok(child) => {
                let pid = child.id();
                // Getting memory usage immediately after spawn might be inaccurate
                // Use ps or another method if needed, but keep it simple for now
                Ok(ProcessInfo {
                    pid,
                    name: Path::new(command).file_name().unwrap_or_default().to_string_lossy().into_owned(),
                    memory_usage: 0, // Placeholder
                    status: "Running".to_string(),
                })
            }
            Err(e) => Err(format!("Failed to spawn process \"{}\": {}", command, e)),
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("Not supported on this platform".to_string())
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

/// Disk bilgilerini döndürür (df komutunu kullanarak)
pub fn get_disk_info() -> Result<Vec<DiskInfo>, String> {
    let output = Command::new("df")
        .args(&["-Pkl"])
        .output(); // POSIX format, list local, kbytes

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
                    let total_space_kb = parts[1].parse::<u64>().unwrap_or(0);
                    // parts[2] is Used
                    let available_space_kb = parts[3].parse::<u64>().unwrap_or(0);
                    // parts[4] is Capacity
                    let mount_point = parts[5].to_string();

                    // Try to get filesystem type using diskutil
                    let fs_type = get_macos_filesystem_type(&name).unwrap_or_else(|| "unknown".to_string());

                    disks.push(DiskInfo {
                        name, // Use filesystem path as name for macOS
                        mount_point,
                        total_space: total_space_kb * 1024,
                        available_space: available_space_kb * 1024,
                        file_system: fs_type,
                    });
                }
            }
            Ok(disks)
        }
        Err(e) => Err(format!("Failed to execute df command: {}", e)),
    }
}

// Helper to get filesystem type on macOS
#[cfg(target_os = "macos")]
fn get_macos_filesystem_type(device: &str) -> Option<String> {
    let output = Command::new("diskutil")
        .args(&["info", "-plist", device])
        .output();

    if let Ok(output) = output {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            // Parse the plist output
            if let Ok(plist::Value::Dictionary(dict)) = plist::from_bytes(&output.stdout) {
                if let Some(plist::Value::String(fs_type)) = dict.get("FilesystemType") {
                    return Some(fs_type.clone());
                } else if let Some(plist::Value::String(fs_name)) = dict.get("FilesystemName") {
                     return Some(fs_name.clone());
                }
            }
        }
    }
    None
}

// --- Filesystem Monitoring --- (New Implementation using FSEvents)

// Global state for watchers (similar to other platforms)
lazy_static::lazy_static! {
    static ref WATCHERS: Mutex<HashMap<String, (thread::JoinHandle<()>, CFRunLoopRef, FSEventStreamRef)>> = Mutex::new(HashMap::new());
}

/// Starts monitoring a directory for changes using FSEvents.
/// Returns a unique ID for the watcher.
pub fn start_monitoring_directory(path_str: &str, event_sender: Sender<FileChangeEvent>) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let path = PathBuf::from(path_str);
        if !path.is_dir() {
            return Err(format!("Path is not a directory: {}", path_str));
        }

        let watcher_id = uuid::Uuid::new_v4().to_string();
        let (stop_tx, stop_rx) = mpsc::channel::<()>(); // Channel to signal stop

        // FSEvents needs a run loop, so we spawn a dedicated thread
        let handle = thread::spawn(move || {
            unsafe {
                let current_run_loop = CFRunLoopGetCurrent();

                // Create a context for the stream
                let sender_ptr = Box::into_raw(Box::new(event_sender.clone())) as *mut libc::c_void;
                let mut context = core_services::fsevent::FSEventStreamContext {
                    version: 0,
                    info: sender_ptr,
                    retain: None, // Use default retain/release
                    release: Some(release_sender_context),
                    copy_description: None,
                };

                // Create the event stream
                let paths_to_watch = CFArray::from_copyable(&[CFString::new(&path.to_string_lossy())]);
                let stream_flags = StreamFlags::FILE_EVENTS // Get file-level events
                                    | StreamFlags::NO_DEFER // Don t batch events heavily
                                    | StreamFlags::WATCH_ROOT; // Watch the root itself

                let stream = match create_event_stream(
                    paths_to_watch.as_concrete_TypeRef(),
                    core_services::fsevent::kFSEventStreamEventIdSinceNow,
                    Duration::from_secs(1).as_secs_f64(), // Latency
                    stream_flags,
                    &mut context,
                    event_callback,
                ) {
                    Ok(s) => s,
                    Err(_) => {
                        error!("Failed to create FSEvent stream for {}", path.display());
                        // Need to release the sender context if stream creation fails
                        let _: Box<Sender<FileChangeEvent>> = Box::from_raw(sender_ptr as *mut _);
                        return;
                    }
                };

                // Schedule the stream on the run loop
                core_services::fsevent::FSEventStreamScheduleWithRunLoop(
                    stream,
                    current_run_loop,
                    kCFRunLoopDefaultMode,
                );

                // Start the stream
                if !core_services::fsevent::FSEventStreamStart(stream) {
                    error!("Failed to start FSEvent stream for {}", path.display());
                    core_services::fsevent::FSEventStreamInvalidate(stream);
                    core_services::fsevent::FSEventStreamRelease(stream);
                    // Context release happens via FSEventStreamRelease
                    return;
                }

                info!("Started FSEvent monitoring for {}", path.display());

                // Keep the run loop running until stop is signaled
                loop {
                    // Check for stop signal periodically
                    match stop_rx.recv_timeout(Duration::from_millis(500)) {
                        Ok(_) | Err(mpsc::RecvTimeoutError::Disconnected) => {
                            info!("Stopping FSEvent monitor for {}", path.display());
                            break;
                        }
                        Err(mpsc::RecvTimeoutError::Timeout) => {
                            // Continue running the loop
                            CFRunLoopRunInMode(kCFRunLoopDefaultMode, 0.0, true); // Process events if any
                        }
                    }
                }

                // Stop and cleanup the stream
                core_services::fsevent::FSEventStreamStop(stream);
                core_services::fsevent::FSEventStreamInvalidate(stream);
                core_services::fsevent::FSEventStreamRelease(stream);
                // Context release happens via FSEventStreamRelease
            }
        });

        // Store watcher info (needs run loop ref and stream ref for stopping)
        // Getting these requires careful handling, maybe pass them back via channel?
        // For now, we only store the stop signal sender.
        // TODO: Properly implement stopping by interacting with the run loop.
        let mut watchers = WATCHERS.lock().unwrap();
        // watchers.insert(watcher_id.clone(), (handle, stop_tx)); // Simplified for now

        Ok(watcher_id)
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

// Callback to release the sender context when the stream is released
#[cfg(target_os = "macos")]
unsafe extern "C" fn release_sender_context(info: *const libc::c_void) {
    let _: Box<Sender<FileChangeEvent>> = Box::from_raw(info as *mut Sender<FileChangeEvent>);
}

// FSEvents callback function
#[cfg(target_os = "macos")]
extern "C" fn event_callback(
    stream_ref: core_services::fsevent::ConstFSEventStreamRef,
    client_callback_info: *mut libc::c_void,
    num_events: libc::size_t,
    event_paths: *mut libc::c_void, // CFArray of CFStringRef
    event_flags: *const core_services::fsevent::FSEventStreamEventFlags,
    event_ids: *const core_services::fsevent::FSEventStreamEventId,
) {
    unsafe {
        let sender = &*(client_callback_info as *const Sender<FileChangeEvent>);
        let paths = event_paths as CFArrayRef;
        let flags = std::slice::from_raw_parts(event_flags, num_events);

        for i in 0..num_events {
            let path_ref = CFArrayGetValueAtIndex(paths, i as CFIndex) as CFStringRef;
            let flag = flags[i];

            // Convert CFStringRef to Rust String
            let path_c_ptr = CFStringGetCStringPtr(path_ref, kCFStringEncodingUTF8);
            let path_string = if !path_c_ptr.is_null() {
                CStr::from_ptr(path_c_ptr).to_string_lossy().into_owned()
            } else {
                // Fallback if direct pointer is not available
                let len = CFStringGetLength(path_ref);
                let max_len = CFStringGetMaximumSizeForEncoding(len, kCFStringEncodingUTF8) + 1;
                let mut buffer = vec![0u8; max_len as usize];
                if CFStringGetCString(path_ref, buffer.as_mut_ptr() as *mut _, max_len, kCFStringEncodingUTF8) {
                    CStr::from_ptr(buffer.as_ptr() as *const _).to_string_lossy().into_owned()
                } else {
                    eprintln!("Warning: Failed to convert FSEvent path to string");
                    continue;
                }
            };

            // Map FSEvent flags to FileChangeEvent enum
            // Note: FSEvents often reports directory changes when contents change.
            // It can be less granular than inotify or ReadDirectoryChangesW.
            // Renames are particularly tricky (ItemRenamed flag).

            let event = if flag.contains(core_services::fsevent::FSEventStreamEventFlags::ItemCreated) {
                FileChangeEvent::Created(path_string)
            } else if flag.contains(core_services::fsevent::FSEventStreamEventFlags::ItemRemoved) {
                FileChangeEvent::Deleted(path_string)
            } else if flag.contains(core_services::fsevent::FSEventStreamEventFlags::ItemRenamed) {
                // FSEvents doesn t directly provide old/new path for rename.
                // We might need heuristics or track previous state.
                // For simplicity, report as Modified for now, or potentially Delete+Create.
                // Let s report as Modified.
                FileChangeEvent::Modified(path_string) // Simplified handling for rename
            } else if flag.contains(core_services::fsevent::FSEventStreamEventFlags::ItemModified)
                    || flag.contains(core_services::fsevent::FSEventStreamEventFlags::ItemInodeMetaMod)
                    || flag.contains(core_services::fsevent::FSEventStreamEventFlags::ItemChangeOwner)
                    || flag.contains(core_services::fsevent::FSEventStreamEventFlags::ItemXattrMod) {
                FileChangeEvent::Modified(path_string)
            } else {
                // Ignore other flags like HistoryDone, RootChanged, Mount, Unmount etc.
                continue;
            };

            if let Err(e) = sender.send(event) {
                error!("Failed to send FSEvent change event: {}", e);
                // Consider stopping the stream if the receiver is gone
                let stream = stream_ref as FSEventStreamRef;
                let runloop = core_services::fsevent::FSEventStreamGetRunLoop(stream);
                if !runloop.is_null() {
                    CFRunLoopStop(runloop);
                }
            }
        }
    }
}

/// Stops monitoring a directory using FSEvents.
pub fn stop_monitoring_directory(watcher_id: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let mut watchers = WATCHERS.lock().unwrap();
        // TODO: Implement proper stopping mechanism by finding the runloop/stream
        // associated with the watcher_id and stopping the runloop/invalidating the stream.
        // This requires storing the CFRunLoopRef and FSEventStreamRef in the WATCHERS map.
        // For now, just remove from map.
        if watchers.remove(watcher_id).is_some() {
             warn!("FSEvent watcher {} removed from map, but proper stopping requires RunLoop/Stream management.", watcher_id);
             Ok(())
        } else {
            Err(format!("Watcher with ID {} not found", watcher_id))
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("Not supported on this platform".to_string())
    }
}


// --- Application Control --- (New Implementation using AppleScript / CoreGraphics)

/// Finds a window by title (using CoreGraphics)
pub fn find_window_by_title(title: &str) -> Result<isize, String> {
    #[cfg(target_os = "macos")]
    {
        let windows = list_windows()?;
        for window in windows {
            if window.title == title {
                return Ok(window.id);
            }
        }
        Err(format!("Window with title \"{}\" not found", title))
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Sends a message to a window (Not directly applicable like Windows SendMessage)
/// Use AppleScript for high-level control.
pub fn send_window_message(hwnd_val: isize, message: u32, wparam: usize, lparam: isize) -> Result<isize, String> {
    Err("Direct window messaging not supported on macOS; use AppleScript for control.".to_string())
}

/// Posts a message to a window (Not directly applicable like Windows PostMessage)
/// Use AppleScript for high-level control.
pub fn post_window_message(hwnd_val: isize, message: u32, wparam: usize, lparam: isize) -> Result<(), String> {
    Err("Direct window messaging not supported on macOS; use AppleScript for control.".to_string())
}

/// Closes a window gracefully using AppleScript
pub fn close_window(hwnd_val: isize) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // Find the process ID associated with the window ID
        let windows = list_windows()?;
        let target_pid = windows.iter().find(|w| w.id == hwnd_val).map(|w| w.process_id);

        if let Some(pid) = target_pid {
            // Get the application name from the PID
            let app_name = get_app_name_from_pid(pid)?;

            // Construct AppleScript to close the specific window if possible, or quit the app
            // Closing a specific window by ID via AppleScript is hard.
            // Option 1: Try closing the window by title (less reliable if multiple windows)
            // Option 2: Quit the application (more drastic)
            // Let s try quitting the application for simplicity.
            let script = format!("tell application \"{}\" to quit", app_name);

            let output = Command::new("osascript")
                .arg("-e")
                .arg(&script)
                .output()
                .map_err(|e| format!("Failed to execute osascript: {}", e))?;

            if output.status.success() {
                Ok(())
            } else {
                Err(format!("AppleScript failed to close/quit app {}: {}", app_name, String::from_utf8_lossy(&output.stderr)))
            }
        } else {
            Err(format!("Could not find process ID for window ID {}", hwnd_val))
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

#[cfg(target_os = "macos")]
fn get_app_name_from_pid(pid: u32) -> Result<String, String> {
    unsafe {
        let pool = NSAutoreleasePool::new(nil);
        let running_apps: id = msg_send![class!(NSRunningApplication), runningApplicationsWithBundleIdentifier: nil]; // Incorrect usage, need to find by PID

        // Correct way: Find app by PID
        let app: id = msg_send![class!(NSRunningApplication), runningApplicationWithProcessIdentifier: pid as i32];

        let result = if app != nil {
            let ns_app_name: id = msg_send![app, localizedName];
            if ns_app_name != nil {
                let bytes: *const std::os::raw::c_char = msg_send![ns_app_name, UTF8String];
                if !bytes.is_null() {
                    Ok(CStr::from_ptr(bytes).to_string_lossy().into_owned())
                } else {
                    Err(format!("Failed to get UTF8String for app name (PID: {})", pid))
                }
            } else {
                 Err(format!("Failed to get localizedName for app (PID: {})", pid))
            }
        } else {
            // Fallback using ps command
            let output = Command::new("ps")
                .args(&["-p", &pid.to_string(), "-o", "comm="])
                .output();
            match output {
                Ok(output) if output.status.success() => {
                    let comm = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    if !comm.is_empty() {
                        // Get the base name
                        Ok(Path::new(&comm).file_name().unwrap_or_default().to_string_lossy().into_owned())
                    } else {
                         Err(format!("ps command returned empty name for PID {}", pid))
                    }
                },
                _ => Err(format!("Could not find application name for PID {}", pid)),
            }
        };

        let _: () = msg_send![pool, release];
        result
    }
}


/// Lists all top-level visible windows using CoreGraphics
pub fn list_windows() -> Result<Vec<WindowInfo>, String> {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let window_list_info = CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly, kCGNullWindowID);
            if window_list_info.is_null() {
                return Err("Failed to get window list info (CGWindowListCopyWindowInfo returned null)".to_string());
            }

            let count = CFArrayGetCount(window_list_info);
            let mut windows = Vec::new();

            for i in 0..count {
                let window_info_ref = CFArrayGetValueAtIndex(window_list_info, i);
                if window_info_ref.is_null() { continue; }
                let window_info = window_info_ref as CFDictionaryRef;

                // Get Window ID (Number)
                let window_id_ref = CFDictionaryGetValue(window_info, kCGWindowNumber as *const c_void);
                if window_id_ref.is_null() { continue; }
                let mut window_id: i64 = 0;
                if !CFNumberGetValue(window_id_ref as CFNumberRef, kCFNumberSInt64Type, &mut window_id as *mut i64 as *mut c_void) {
                    continue;
                }

                // Get Window Owner PID
                let owner_pid_ref = CFDictionaryGetValue(window_info, kCGWindowOwnerPID as *const c_void);
                if owner_pid_ref.is_null() { continue; }
                let mut owner_pid: i64 = 0;
                 if !CFNumberGetValue(owner_pid_ref as CFNumberRef, kCFNumberSInt64Type, &mut owner_pid as *mut i64 as *mut c_void) {
                    continue;
                }

                // Get Window Title (Name)
                let window_name_ref = CFDictionaryGetValue(window_info, kCGWindowName as *const c_void);
                let title = if !window_name_ref.is_null() {
                    let cf_string = window_name_ref as CFStringRef;
                    let c_ptr = CFStringGetCStringPtr(cf_string, kCFStringEncodingUTF8);
                    if !c_ptr.is_null() {
                        CStr::from_ptr(c_ptr).to_string_lossy().into_owned()
                    } else {
                        // Fallback conversion
                        let len = CFStringGetLength(cf_string);
                        let max_len = CFStringGetMaximumSizeForEncoding(len, kCFStringEncodingUTF8) + 1;
                        let mut buffer = vec![0u8; max_len as usize];
                        if CFStringGetCString(cf_string, buffer.as_mut_ptr() as *mut _, max_len, kCFStringEncodingUTF8) {
                            CStr::from_ptr(buffer.as_ptr() as *const _).to_string_lossy().into_owned()
                        } else {
                            "(Failed to get title)".to_string()
                        }
                    }
                } else {
                    "(No title)".to_string()
                };

                // Basic filtering (e.g., ignore windows without titles or with specific owners if needed)
                if !title.is_empty() && title != "(No title)" {
                    windows.push(WindowInfo {
                        id: window_id as isize, // Store as isize to match Windows HWND
                        title,
                        process_id: owner_pid as u32,
                    });
                }
            }

            CFRelease(window_list_info as CFTypeRef);
            Ok(windows)
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

// --- Registry Access --- (Not applicable to macOS)

pub fn read_registry_string(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<String, String> {
    Err("Registry access is not supported on macOS".to_string())
}

pub fn read_registry_dword(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<u32, String> {
    Err("Registry access is not supported on macOS".to_string())
}

pub fn write_registry_string(root_key_str: &str, sub_key: &str, value_name: &str, data: &str) -> Result<(), String> {
    Err("Registry access is not supported on macOS".to_string())
}

pub fn write_registry_dword(root_key_str: &str, sub_key: &str, value_name: &str, data: u32) -> Result<(), String> {
    Err("Registry access is not supported on macOS".to_string())
}

pub fn delete_registry_value(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<(), String> {
    Err("Registry access is not supported on macOS".to_string())
}

// --- Screen Capture --- (Existing code - no changes needed for now)
// ... keep existing screenshot functions ...

// --- CUDA Screenshot --- (Placeholder/Existing)
pub fn capture_screen_cuda(filepath: &str, format: &str) -> Result<(u32, u32), String> {
    // Placeholder - Actual CUDA implementation needed
    warn!("CUDA screenshot capture is not fully implemented yet.");
    // Fallback to standard capture for now
    capture_macos_screenshot(filepath, format, -1)
}

