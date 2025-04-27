#[cfg(target_os = "macos")]
use cocoa::base::{id, nil, NO, YES};
#[cfg(target_os = "macos")]
use cocoa::foundation::{NSArray, NSAutoreleasePool, NSProcessInfo, NSString, NSPoint, NSRect, NSSize, NSUInteger};
#[cfg(target_os = "macos")]
use core_foundation::{
    base::{CFRelease, TCFType},
    string::{CFString, CFStringRef},
    dictionary::{CFDictionary, CFDictionaryRef, CFDictionaryGetValue},
    number::{CFNumber, CFNumberRef, CFNumberGetValue, kCFNumberSInt64Type},
    array::{CFArray, CFArrayRef, CFArrayGetValueAtIndex},
    url::{CFURLRef, CFURLCopyFileSystemPath, kCFURLPOSIXPathStyle},
};
#[cfg(target_os = "macos")]
use objc::{class, msg_send, sel, sel_impl};
#[cfg(target_os = "macos")]
use std::ffi::CStr;
#[cfg(target_os = "macos")]
use std::os::unix::ffi::OsStrExt;
#[cfg(target_os = "macos")]
use std::mem::MaybeUninit;

use crate::platform::{PlatformInfo, ProcessInfo, FileInfo, DiskInfo, WindowInfo};
use std::{
    fs,
    io,
    os::unix::fs::MetadataExt, // For macOS specific metadata like device ID
    path::{Path, PathBuf},
    process::Command,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

// --- Platform Info --- (Existing code)

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
                14 => "Sequoia",
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
            let architecture = std::env::consts::ARCH.to_string();

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

// --- Process Management --- (Existing code + Enhancements)

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


// --- Filesystem Access --- (New Implementation using std::fs)

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

/// Yeni bir dizin oluşturur
pub fn create_directory(path_str: &str) -> Result<(), String> {
    fs::create_dir_all(path_str).map_err(|e| format!("Failed to create directory \"{}\": {}", path_str, e))
}

/// Disk bilgilerini döndürür (Using statvfs)
pub fn get_disk_info() -> Result<Vec<DiskInfo>, String> {
    #[cfg(target_os = "macos")]
    {
        let mut disks = Vec::new();
        unsafe {
            let mut mntbuf: *mut libc::statfs = std::ptr::null_mut();
            let count = libc::getmntinfo(&mut mntbuf, libc::MNT_WAIT);

            if count < 0 {
                return Err(format!("Failed to get mount info: {}", io::Error::last_os_error()));
            }

            for i in 0..count {
                let mnt = *(mntbuf.add(i as usize));
                let mount_point = CStr::from_ptr(mnt.f_mntonname.as_ptr()).to_string_lossy().into_owned();
                let filesystem = CStr::from_ptr(mnt.f_fstypename.as_ptr()).to_string_lossy().into_owned();
                let name = CStr::from_ptr(mnt.f_mntfromname.as_ptr()).to_string_lossy().into_owned(); // Device name

                // Use statvfs to get space info
                let mut stat: libc::statvfs = MaybeUninit::zeroed().assume_init();
                let path_cstr = std::ffi::CString::new(mount_point.as_bytes()).map_err(|e| format!("Invalid path string: {}", e))?;
                if libc::statvfs(path_cstr.as_ptr(), &mut stat) == 0 {
                    let total_space = stat.f_blocks * stat.f_frsize;
                    let available_space = stat.f_bavail * stat.f_frsize; // Space available to non-superuser

                    disks.push(DiskInfo {
                        name: format!("{} ({})", mount_point, name),
                        mount_point,
                        total_space,
                        available_space,
                        filesystem,
                    });
                } else {
                    eprintln!("Warning: Failed to get statvfs for {}: {}", mount_point, io::Error::last_os_error());
                }
            }
            // Note: getmntinfo allocates memory that might need freeing depending on the libc implementation.
            // However, standard practice on macOS/BSD seems to be that the system manages this buffer.
        }
        Ok(disks)
    }
    #[cfg(not(target_os = "macos"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

// --- Application Control --- (New Implementation using CoreGraphics/AppKit via FFI or osascript)

// Using osascript for simplicity, direct API calls are more complex

/// List visible windows using AppleScript
pub fn list_windows() -> Result<Vec<WindowInfo>, String> {
    let script = r#"
        set windowList to {}
        tell application "System Events"
            set procs to processes whose background only is false
            repeat with proc in procs
                try
                    set procName to name of proc
                    set procId to unix id of proc
                    repeat with win in windows of proc
                        try
                            set winTitle to name of win
                            -- Attempt to get window ID (might not always work)
                            set winId to id of win
                            set end of windowList to {id:winId as string, pid:procId, title:winTitle}
                        on error errMsg number errNum
                            -- Ignore windows we can t get info for
                        end try
                    end repeat
                on error errMsg number errNum
                    -- Ignore processes we can t access
                end try
            end repeat
        end tell
        return windowList
    "#;

    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                let output_str = String::from_utf8_lossy(&output.stdout);
                parse_osascript_window_list(&output_str)
            } else {
                Err(format!("osascript failed: {}", String::from_utf8_lossy(&output.stderr)))
            }
        }
        Err(e) => Err(format!("Failed to execute osascript: {}", e)),
    }
}

// Helper to parse the osascript output
fn parse_osascript_window_list(output: &str) -> Result<Vec<WindowInfo>, String> {
    let mut windows = Vec::new();
    // Example output: "{id:"123", pid:456, title:"Window Title"}, {id:"789", pid:101, title:"Another Window"}"
    // This parsing is basic and might break with complex titles containing commas or braces.
    // A more robust parser (e.g., using a proper AppleScript result format like JSON) is recommended.
    for item in output.trim().split("}, {") {
        let clean_item = item.trim_matches(|c| c == \'{\' || c == \'}\' );
        let mut id: u64 = 0;
        let mut pid: u32 = 0;
        let mut title = "".to_string();

        for part in clean_item.split(", ") {
            let kv: Vec<&str> = part.splitn(2, ":").collect();
            if kv.len() == 2 {
                let key = kv[0].trim();
                let value = kv[1].trim().trim_matches(\'"\');
                match key {
                    "id" => id = value.parse().unwrap_or(0),
                    "pid" => pid = value.parse().unwrap_or(0),
                    "title" => title = value.to_string(),
                    _ => {}
                }
            }
        }
        if id != 0 || !title.is_empty() { // Use title presence as fallback if ID is missing
             windows.push(WindowInfo { id, pid, title });
        }
    }
    Ok(windows)
}

/// Bring a window to the foreground by its PID and Title (using AppleScript)
pub fn focus_window(pid: u32, title: &str) -> Result<(), String> {
    // It s hard to reliably use window ID across different methods (osascript vs CG).
    // Focusing via PID and Title using AppleScript is often more practical.
    let script = format!(r#"
        tell application "System Events"
            try
                set procs to processes whose unix id is {}
                if count of procs is greater than 0 then
                    set proc to item 1 of procs
                    set wins to windows of proc whose name is "{}"
                    if count of wins is greater than 0 then
                        set win to item 1 of wins
                        perform action "AXRaise" of win
                        set frontmost of proc to true
                        return "OK"
                    else
                        return "Window not found"
                    end if
                else
                    return "Process not found"
                end if
            on error errMsg
                return "Error: " & errMsg
            end try
        end tell
    "#, pid, title.replace(\'"\', "\\\"")); // Escape double quotes in title

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output();

    match output {
        Ok(output) => {
            let result_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if result_str == "OK" {
                Ok(())
            } else {
                Err(format!("Failed to focus window (PID: {}, Title: \"{}\"): {}", pid, title, result_str))
            }
        }
        Err(e) => Err(format!("Failed to execute osascript: {}", e)),
    }
}

/// Find a window by its title (using AppleScript, returns first match)
pub fn find_window_by_title(title: &str) -> Result<WindowInfo, String> {
    // This will find the first window matching the title across all apps
    let script = format!(r#"
        set foundWindow to null
        tell application "System Events"
            set procs to processes whose background only is false
            repeat with proc in procs
                try
                    set procId to unix id of proc
                    set wins to windows of proc whose name is "{}"
                    if count of wins is greater than 0 then
                        set win to item 1 of wins
                        set winId to id of win
                        set foundWindow to {{id:winId as string, pid:procId, title:name of win}}
                        exit repeat
                    end if
                on error
                    -- ignore errors
                end try
            end repeat
        end tell
        return foundWindow
    "#, title.replace(\'"\', "\\\""));

    let output = Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                let output_str = String::from_utf8_lossy(&output.stdout);
                if output_str.trim() == "null" {
                    Err(format!("Window with title \"{}\" not found", title))
                } else {
                    // Parse the single result
                    let mut windows = parse_osascript_window_list(&output_str)?;
                    if windows.is_empty() {
                         Err(format!("Failed to parse osascript result for title \"{}\"", title))
                    } else {
                         Ok(windows.remove(0))
                    }
                }
            } else {
                Err(format!("osascript failed for find_window: {}", String::from_utf8_lossy(&output.stderr)))
            }
        }
        Err(e) => Err(format!("Failed to execute osascript: {}", e)),
    }
}

