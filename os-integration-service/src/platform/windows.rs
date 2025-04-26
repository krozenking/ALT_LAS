#[cfg(target_os = "windows")]
use windows::{
    core::{PCWSTR, PWSTR},
    Win32::{
        Foundation::{CloseHandle, GetLastError, BOOL, HANDLE, HWND, LPARAM, MAX_PATH, RECT},
        Storage::FileSystem::{
            CreateDirectoryW,
            DeleteFileW,
            FindFirstFileW,
            FindNextFileW,
            GetDiskFreeSpaceExW,
            GetLogicalDrives,
            GetVolumeInformationW,
            MoveFileW,
            ReadFile,
            SetFilePointer,
            WriteFile,
            COPY_FILE_FLAGS,
            COPY_FILE_FAIL_IF_EXISTS,
            CopyFileExW,
            CREATE_NEW,
            FILE_ATTRIBUTE_DIRECTORY,
            FILE_BEGIN,
            FILE_GENERIC_READ,
            FILE_GENERIC_WRITE,
            FILE_SHARE_READ,
            FILE_SHARE_WRITE,
            FIND_FIRST_EX_INFO_LEVELS,
            FIND_FIRST_EX_LARGE_FETCH,
            FIND_FILE_INFO_LEVELS,
            OPEN_EXISTING,
            WIN32_FIND_DATAW,
            CreateFileW,
            FindClose,
            RemoveDirectoryW,
            FILE_FLAG_BACKUP_SEMANTICS,
            FILE_FLAG_OVERLAPPED,
            OVERLAPPED,
            GetOverlappedResult,
            CancelIoEx,
            CopyProgressRoutine,
        },
        System::{
            Diagnostics::Debug::FormatMessageW,
            IO::DeviceIoControl,
            Memory::{GlobalMemoryStatusEx, MEMORYSTATUSEX},
            ProcessStatus::{GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS},
            SystemInformation::{GetComputerNameW, GetSystemInfo, GetUserNameW, OSVERSIONINFOW, SYSTEM_INFO, GetVersionExW},
            Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ, CreateProcessW, TerminateProcess, PROCESS_TERMINATE, STARTUPINFOW, PROCESS_INFORMATION},
            Pipes::{CreatePipe, ReadFile as ReadPipe, WriteFile as WritePipe},
        },
        Security::SECURITY_ATTRIBUTES,
        UI::WindowsAndMessaging::{
            EnumWindows,
            GetWindowTextW,
            GetWindowThreadProcessId,
            IsWindowVisible,
            SetForegroundWindow,
            ShowWindow,
            FindWindowW,
            SW_RESTORE,
            SW_SHOW,
        },
    },
};

use crate::platform::{PlatformInfo, ProcessInfo, FileInfo, DiskInfo, WindowInfo};
use std::{
    ffi::{OsStr, OsString},
    mem,
    os::windows::ffi::{OsStrExt, OsStringExt},
    path::{Path, PathBuf},
    process::Command,
    ptr,
    sync::{Arc, Mutex},
    time::SystemTime,
};

// --- Platform Info --- (Existing code)

/// Windows sürüm bilgisini döndürür
pub fn get_windows_version() -> String {
    #[cfg(target_os = "windows")]
    {
        let mut os_info = OSVERSIONINFOW {
            dwOSVersionInfoSize: std::mem::size_of::<OSVERSIONINFOW>() as u32,
            ..Default::default()
        };

        unsafe {
            // Not recommended but for demonstration
            let result = GetVersionExW(&mut os_info);
            if result.as_bool() {
                let major = os_info.dwMajorVersion;
                let minor = os_info.dwMinorVersion;
                let build = os_info.dwBuildNumber;

                // Windows 10/11 detection
                if major == 10 {
                    if build >= 22000 {
                        return format!("Windows 11 (Build {})", build);
                    } else {
                        return format!("Windows 10 (Build {})", build);
                    }
                } else if major == 6 {
                    match minor {
                        3 => return format!("Windows 8.1 (Build {})", build),
                        2 => return format!("Windows 8 (Build {})", build),
                        1 => return format!("Windows 7 (Build {})", build),
                        0 => return format!("Windows Vista (Build {})", build),
                        _ => {}
                    }
                }

                return format!("Windows {}.{} (Build {})", major, minor, build);
            }
        }

        // Fallback to reg query
        let output = Command::new("reg")
            .args(&["query", "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", "/v", "ProductName"])
            .output();

        if let Ok(output) = output {
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Some(product_line) = output_str.lines().find(|line| line.contains("ProductName")) {
                // Find the last part after REG_SZ
                if let Some(index) = product_line.find("REG_SZ") {
                    let value_part = product_line[index + "REG_SZ".len()..].trim();
                    if !value_part.is_empty() {
                         return value_part.to_string();
                    }
                }
            }
        }

        "Windows (Unknown Version)".to_string()
    }

    #[cfg(not(target_os = "windows"))]
    {
        "Windows (Not Applicable)".to_string()
    }
}

/// Windows için detaylı platform bilgilerini döndürür
pub fn get_detailed_info() -> PlatformInfo {
    #[cfg(target_os = "windows")]
    {
        let mut memory_status = MEMORYSTATUSEX {
            dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32,
            ..Default::default()
        };

        let mut system_info = SYSTEM_INFO::default();

        unsafe {
            GlobalMemoryStatusEx(&mut memory_status);
            GetSystemInfo(&mut system_info);
        }

        PlatformInfo {
            os_type: "Windows".to_string(),
            os_version: get_windows_version(),
            architecture: get_architecture(&system_info),
            hostname: get_hostname(),
            username: get_username(),
            cpu_cores: system_info.dwNumberOfProcessors as usize,
            memory_total: memory_status.ullTotalPhys,
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // Placeholder for non-Windows platforms
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

#[cfg(target_os = "windows")]
fn get_architecture(system_info: &SYSTEM_INFO) -> String {
    match system_info.Anonymous.Anonymous.wProcessorArchitecture {
        9 => "x64".to_string(),
        5 => "ARM".to_string(),
        12 => "ARM64".to_string(),
        0 => "x86".to_string(),
        _ => format!("Unknown ({})", system_info.Anonymous.Anonymous.wProcessorArchitecture),
    }
}

fn get_hostname() -> String {
    #[cfg(target_os = "windows")]
    {
        let mut buffer = [0u16; 256];
        let mut size = buffer.len() as u32;

        unsafe {
            if GetComputerNameW(&mut buffer, &mut size).as_bool() {
                return String::from_utf16_lossy(&buffer[..size as usize]);
            }
        }
    }

    std::env::var("COMPUTERNAME").unwrap_or_else(|_| "unknown".to_string())
}

fn get_username() -> String {
    #[cfg(target_os = "windows")]
    {
        let mut buffer = [0u16; 256];
        let mut size = buffer.len() as u32;

        unsafe {
            if GetUserNameW(&mut buffer, &mut size).as_bool() {
                // Size includes null terminator, remove it
                return String::from_utf16_lossy(&buffer[..(size - 1) as usize]);
            }
        }
    }

    std::env::var("USERNAME").unwrap_or_else(|_| "unknown".to_string())
}

fn get_cpu_cores() -> usize {
    #[cfg(target_os = "windows")]
    {
        let mut system_info = SYSTEM_INFO::default();
        unsafe {
            GetSystemInfo(&mut system_info);
            return system_info.dwNumberOfProcessors as usize;
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        std::thread::available_parallelism().map_or(1, |p| p.get())
    }
}

fn get_memory_total() -> u64 {
    #[cfg(target_os = "windows")]
    {
        let mut memory_status = MEMORYSTATUSEX {
            dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32,
            ..Default::default()
        };

        unsafe {
            if GlobalMemoryStatusEx(&mut memory_status).as_bool() {
                return memory_status.ullTotalPhys;
            }
        }
    }

    // Fallback or non-Windows platforms
    0 // Return 0 if not on Windows or failed
}

// --- Process Management --- (Existing code + Enhancements)

/// Windows ta çalışan işlemleri listeler (Enhanced using CreateToolhelp32Snapshot)
pub fn list_processes() -> Result<Vec<ProcessInfo>, String> {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::System::Diagnostics::ToolHelp::{
            CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
        };

        let mut processes = Vec::new();
        unsafe {
            let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
            if snapshot.is_invalid() {
                return Err(format!("Failed to create process snapshot: {}", get_last_error_string()));
            }

            let mut pe32 = PROCESSENTRY32W {
                dwSize: mem::size_of::<PROCESSENTRY32W>() as u32,
                ..Default::default()
            };

            if !Process32FirstW(snapshot, &mut pe32).as_bool() {
                CloseHandle(snapshot);
                return Err(format!("Failed to get first process: {}", get_last_error_string()));
            }

            loop {
                let pid = pe32.th32ProcessID;
                let name = OsString::from_wide(&pe32.szExeFile)
                    .to_string_lossy()
                    .into_owned();
                // Find the position of the first null character
                let name = name.split(\'\0\').next().unwrap_or("").to_string();

                if pid > 0 && !name.is_empty() {
                    let memory = get_process_memory(pid).unwrap_or(0);
                    let status = "Running".to_string(); // Simplified status

                    processes.push(ProcessInfo {
                        pid,
                        name,
                        memory_usage: memory,
                        status,
                    });
                }

                if !Process32NextW(snapshot, &mut pe32).as_bool() {
                    break;
                }
            }

            CloseHandle(snapshot);
        }
        Ok(processes)
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(Vec::new()) // Non-Windows platformlar için boş liste
    }
}

#[cfg(target_os = "windows")]
fn get_process_memory(pid: u32) -> Result<u64, String> {
    unsafe {
        let process_handle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid);

        if process_handle.is_invalid() {
            // Skip processes we don t have access to (like System Idle Process)
            if GetLastError().0 == 5 { // ERROR_ACCESS_DENIED
                return Ok(0);
            }
            return Err(format!("Failed to open process {}: {}", pid, get_last_error_string()));
        }

        let mut pmc = PROCESS_MEMORY_COUNTERS {
            cb: mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32,
            ..Default::default()
        };

        let result = GetProcessMemoryInfo(
            process_handle,
            &mut pmc,
            mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32,
        );

        CloseHandle(process_handle);

        if result.as_bool() {
            Ok(pmc.WorkingSetSize)
        } else {
            Err(format!("Failed to get memory info for process {}: {}", pid, get_last_error_string()))
        }
    }
}

/// Bir işlemi PID ile sonlandırır
pub fn kill_process(pid: u32) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        unsafe {
            let handle = OpenProcess(PROCESS_TERMINATE, false, pid);
            if handle.is_invalid() {
                return Err(format!("Failed to open process {}: {}", pid, get_last_error_string()));
            }

            if !TerminateProcess(handle, 1).as_bool() {
                CloseHandle(handle);
                return Err(format!("Failed to terminate process {}: {}", pid, get_last_error_string()));
            }

            CloseHandle(handle);
            Ok(())
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Yeni bir işlem başlatır
pub fn run_process(command: &str, args: &[String]) -> Result<ProcessInfo, String> {
    #[cfg(target_os = "windows")]
    {
        let mut command_line = format!("\"{}\"", command);
        for arg in args {
            command_line.push_str(&format!(" \"{}\"", arg));
        }
        let mut command_line_utf16: Vec<u16> = OsStr::new(&command_line).encode_wide().chain(Some(0)).collect();

        let mut startup_info = STARTUPINFOW::default();
        startup_info.cb = mem::size_of::<STARTUPINFOW>() as u32;
        let mut process_info = PROCESS_INFORMATION::default();

        unsafe {
            if !CreateProcessW(
                PCWSTR::null(), // Application name (use command line)
                PWSTR(command_line_utf16.as_mut_ptr()), // Command line
                None, // Process attributes
                None, // Thread attributes
                false, // Inherit handles
                0, // Creation flags
                None, // Environment
                PCWSTR::null(), // Current directory
                &startup_info,
                &mut process_info,
            ).as_bool() {
                return Err(format!("Failed to create process: {}", get_last_error_string()));
            }

            // Close thread handle immediately as we don t need it
            CloseHandle(process_info.hThread);

            let pid = process_info.dwProcessId;
            // Get initial info (memory might be 0 initially)
            let name = Path::new(command).file_name().unwrap_or_default().to_string_lossy().into_owned();
            let memory = get_process_memory(pid).unwrap_or(0);

            // Important: Close the process handle if you don t need to wait for it
            // or manage it further. If managing, store the handle.
            CloseHandle(process_info.hProcess);

            Ok(ProcessInfo {
                pid,
                name,
                memory_usage: memory,
                status: "Running".to_string(),
            })
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}


// --- Filesystem Access --- (Existing code)

/// Belirtilen yoldaki dosya ve dizinleri listeler
pub fn list_directory(path_str: &str) -> Result<Vec<FileInfo>, String> {
    #[cfg(target_os = "windows")]
    {
        let path = Path::new(path_str);
        let mut find_data = WIN32_FIND_DATAW::default();
        let mut result = Vec::new();

        // Append \* to search directory contents
        let search_path = path.join("*");
        let wide_path: Vec<u16> = OsStr::new(&search_path).encode_wide().chain(Some(0)).collect();

        unsafe {
            let find_handle = FindFirstFileW(PCWSTR(wide_path.as_ptr()), &mut find_data);

            if find_handle.is_invalid() {
                // Handle case where directory might be empty or access denied
                if GetLastError().0 == 2 { // ERROR_FILE_NOT_FOUND (can mean empty dir)
                    return Ok(Vec::new());
                }
                return Err(format!("Failed to find first file in \"{}\": {}", path_str, get_last_error_string()));
            }

            loop {
                let file_name_wide = &find_data.cFileName;
                // Ensure null termination before converting
                let null_pos = file_name_wide.iter().position(|&c| c == 0).unwrap_or(file_name_wide.len());
                let file_name_os = OsString::from_wide(&file_name_wide[..null_pos]);
                let name = file_name_os.to_string_lossy().into_owned();

                // Skip . and .. entries
                if name != "." && name != ".." {
                    let is_directory = (find_data.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY.0) != 0;
                    let size = ((find_data.nFileSizeHigh as u64) << 32) | find_data.nFileSizeLow as u64;
                    let last_modified_filetime = find_data.ftLastWriteTime;
                    let last_modified = filetime_to_systemtime(last_modified_filetime);

                    result.push(FileInfo {
                        name,
                        path: path.join(&file_name_os).to_string_lossy().into_owned(),
                        is_directory,
                        size,
                        last_modified,
                    });
                }

                if !FindNextFileW(find_handle, &mut find_data).as_bool() {
                    let error_code = GetLastError().0;
                    if error_code == 18 { // ERROR_NO_MORE_FILES
                        break;
                    } else {
                        FindClose(find_handle);
                        return Err(format!("Failed to find next file: {}", get_last_error_string()));
                    }
                }
            }

            FindClose(find_handle);
        }
        Ok(result)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

#[cfg(target_os = "windows")]
fn filetime_to_systemtime(ft: windows::Win32::Foundation::FILETIME) -> Option<SystemTime> {
    // FILETIME is 100-nanosecond intervals since January 1, 1601 (UTC)
    // SystemTime is based on UNIX_EPOCH (January 1, 1970 UTC)
    const WINDOWS_TICK: u64 = 10_000_000; // 100 nanoseconds
    const SEC_TO_UNIX_EPOCH: u64 = 11_644_473_600; // Seconds between 1601-01-01 and 1970-01-01

    let ticks = ((ft.dwHighDateTime as u64) << 32) | ft.dwLowDateTime as u64;
    let secs = ticks / WINDOWS_TICK;
    let nanos = (ticks % WINDOWS_TICK) * 100; // Convert 100ns ticks to nanoseconds

    if secs < SEC_TO_UNIX_EPOCH {
        return None; // Before Unix epoch
    }

    let unix_secs = secs - SEC_TO_UNIX_EPOCH;
    UNIX_EPOCH.checked_add(Duration::new(unix_secs, nanos as u32))
}

/// Bir dosyanın içeriğini okur
pub fn read_file(path_str: &str) -> Result<Vec<u8>, String> {
    #[cfg(target_os = "windows")]
    {
        let wide_path: Vec<u16> = OsStr::new(path_str).encode_wide().chain(Some(0)).collect();
        unsafe {
            let handle = CreateFileW(
                PCWSTR(wide_path.as_ptr()),
                FILE_GENERIC_READ.0,
                FILE_SHARE_READ,
                None,
                OPEN_EXISTING,
                FILE_FLAG_OVERLAPPED, // Use overlapped for potential async later
                HANDLE::default(),
            );

            if handle.is_invalid() {
                return Err(format!("Failed to open file \"{}\": {}", path_str, get_last_error_string()));
            }

            let mut buffer = Vec::new();
            let mut bytes_read = 0u32;
            let mut temp_buffer = [0u8; 4096];
            let mut overlapped = OVERLAPPED::default();
            let mut offset = 0u64;

            loop {
                overlapped.Anonymous.Anonymous.Offset = (offset & 0xFFFFFFFF) as u32;
                overlapped.Anonymous.Anonymous.OffsetHigh = (offset >> 32) as u32;

                let read_result = ReadFile(
                    handle,
                    Some(temp_buffer.as_mut_ptr() as *mut _),
                    temp_buffer.len() as u32,
                    None, // Bytes read is handled by GetOverlappedResult
                    Some(&mut overlapped as *mut _),
                );

                if !read_result.as_bool() {
                    let error_code = GetLastError().0;
                    if error_code != 997 { // ERROR_IO_PENDING
                        CloseHandle(handle);
                        return Err(format!("ReadFile failed: {}", get_last_error_string()));
                    }
                    // Wait for the overlapped operation
                    if !GetOverlappedResult(handle, &overlapped, &mut bytes_read, true).as_bool() {
                        CloseHandle(handle);
                        return Err(format!("GetOverlappedResult failed: {}", get_last_error_string()));
                    }
                } else {
                    // Operation completed synchronously
                    if !GetOverlappedResult(handle, &overlapped, &mut bytes_read, false).as_bool() {
                         CloseHandle(handle);
                         return Err(format!("GetOverlappedResult failed after sync read: {}", get_last_error_string()));
                    }
                }

                if bytes_read == 0 {
                    break; // End of file
                }

                buffer.extend_from_slice(&temp_buffer[..bytes_read as usize]);
                offset += bytes_read as u64;
            }

            CloseHandle(handle);
            Ok(buffer)
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Bir dosyaya içerik yazar (dosya varsa üzerine yazar)
pub fn write_file(path_str: &str, content: &[u8]) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let wide_path: Vec<u16> = OsStr::new(path_str).encode_wide().chain(Some(0)).collect();
        unsafe {
            let handle = CreateFileW(
                PCWSTR(wide_path.as_ptr()),
                FILE_GENERIC_WRITE.0,
                FILE_SHARE_READ, // Allow reading while writing
                None,
                CREATE_NEW, // Creates a new file, fails if exists
                FILE_FLAG_OVERLAPPED,
                HANDLE::default(),
            );

            let (handle, existed) = if handle.is_invalid() && GetLastError().0 == 80 { // ERROR_FILE_EXISTS
                 // Try opening existing file for overwrite
                 let existing_handle = CreateFileW(
                    PCWSTR(wide_path.as_ptr()),
                    FILE_GENERIC_WRITE.0,
                    FILE_SHARE_READ,
                    None,
                    OPEN_EXISTING, // Open existing
                    FILE_FLAG_OVERLAPPED,
                    HANDLE::default(),
                 );
                 (existing_handle, true)
            } else {
                (handle, false)
            };

            if handle.is_invalid() {
                return Err(format!("Failed to create/open file \"{}\": {}", path_str, get_last_error_string()));
            }

            // Truncate file if opened existing
            if existed {
                 if SetFilePointer(handle, 0, None, FILE_BEGIN) == u32::MAX {
                    let err = GetLastError().0;
                    CloseHandle(handle);
                    return Err(format!("Failed to set file pointer: {}", get_last_error_string()));
                 }
                 // SetEndOfFile is needed here for proper truncation, but requires another API call
                 // For simplicity, we rely on overwriting. Be careful with partial writes.
            }

            let mut bytes_written_total = 0u32;
            let mut overlapped = OVERLAPPED::default();
            let mut offset = 0u64;

            while bytes_written_total < content.len() as u32 {
                overlapped.Anonymous.Anonymous.Offset = (offset & 0xFFFFFFFF) as u32;
                overlapped.Anonymous.Anonymous.OffsetHigh = (offset >> 32) as u32;

                let bytes_to_write = (content.len() - bytes_written_total as usize).min(4096);
                let mut bytes_written_op = 0u32;

                let write_result = WriteFile(
                    handle,
                    Some(&content[bytes_written_total as usize..bytes_written_total as usize + bytes_to_write]),
                    None, // Bytes written handled by GetOverlappedResult
                    Some(&mut overlapped as *mut _),
                );

                if !write_result.as_bool() {
                    let error_code = GetLastError().0;
                    if error_code != 997 { // ERROR_IO_PENDING
                        CloseHandle(handle);
                        return Err(format!("WriteFile failed: {}", get_last_error_string()));
                    }
                    // Wait for the overlapped operation
                    if !GetOverlappedResult(handle, &overlapped, &mut bytes_written_op, true).as_bool() {
                        CloseHandle(handle);
                        return Err(format!("GetOverlappedResult failed: {}", get_last_error_string()));
                    }
                } else {
                     // Operation completed synchronously
                    if !GetOverlappedResult(handle, &overlapped, &mut bytes_written_op, false).as_bool() {
                         CloseHandle(handle);
                         return Err(format!("GetOverlappedResult failed after sync write: {}", get_last_error_string()));
                    }
                }

                if bytes_written_op == 0 {
                    // Should not happen unless disk full or error
                    CloseHandle(handle);
                    return Err("WriteFile wrote 0 bytes".to_string());
                }

                bytes_written_total += bytes_written_op;
                offset += bytes_written_op as u64;
            }

            CloseHandle(handle);
            Ok(())
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Bir dosya veya dizini siler
pub fn delete_path(path_str: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let wide_path: Vec<u16> = OsStr::new(path_str).encode_wide().chain(Some(0)).collect();
        unsafe {
            // Check if it s a directory first
            let attrs = windows::Win32::Storage::FileSystem::GetFileAttributesW(PCWSTR(wide_path.as_ptr()));
            if attrs == u32::MAX {
                // Check if error is file not found, which is okay for delete
                if GetLastError().0 == 2 { // ERROR_FILE_NOT_FOUND
                    return Ok(());
                }
                return Err(format!("Failed to get attributes for \"{}\": {}", path_str, get_last_error_string()));
            }

            let result = if (attrs & FILE_ATTRIBUTE_DIRECTORY.0) != 0 {
                RemoveDirectoryW(PCWSTR(wide_path.as_ptr()))
            } else {
                DeleteFileW(PCWSTR(wide_path.as_ptr()))
            };

            if result.as_bool() {
                Ok(())
            } else {
                Err(format!("Failed to delete \"{}\": {}", path_str, get_last_error_string()))
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Bir dosya veya dizini taşır/yeniden adlandırır
pub fn move_path(source_str: &str, destination_str: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let wide_source: Vec<u16> = OsStr::new(source_str).encode_wide().chain(Some(0)).collect();
        let wide_dest: Vec<u16> = OsStr::new(destination_str).encode_wide().chain(Some(0)).collect();
        unsafe {
            if MoveFileW(PCWSTR(wide_source.as_ptr()), PCWSTR(wide_dest.as_ptr())).as_bool() {
                Ok(())
            } else {
                Err(format!("Failed to move \"{}\" to \"{}\": {}", source_str, destination_str, get_last_error_string()))
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Bir dosya veya dizini kopyalar
pub fn copy_path(source_str: &str, destination_str: &str, overwrite: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let wide_source: Vec<u16> = OsStr::new(source_str).encode_wide().chain(Some(0)).collect();
        let wide_dest: Vec<u16> = OsStr::new(destination_str).encode_wide().chain(Some(0)).collect();
        let flags = if overwrite { COPY_FILE_FLAGS(0) } else { COPY_FILE_FAIL_IF_EXISTS };

        unsafe {
            // CopyFileExW provides progress callback option, CopyFileW is simpler
            if CopyFileExW(PCWSTR(wide_source.as_ptr()), PCWSTR(wide_dest.as_ptr()), None, None, None, flags).as_bool() {
                Ok(())
            } else {
                Err(format!("Failed to copy \"{}\" to \"{}\": {}", source_str, destination_str, get_last_error_string()))
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Yeni bir dizin oluşturur
pub fn create_directory(path_str: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let wide_path: Vec<u16> = OsStr::new(path_str).encode_wide().chain(Some(0)).collect();
        unsafe {
            if CreateDirectoryW(PCWSTR(wide_path.as_ptr()), None).as_bool() {
                Ok(())
            } else {
                // Ignore error if directory already exists
                if GetLastError().0 == 183 { // ERROR_ALREADY_EXISTS
                    Ok(())
                } else {
                    Err(format!("Failed to create directory \"{}\": {}", path_str, get_last_error_string()))
                }
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Disk bilgilerini döndürür
pub fn get_disk_info() -> Result<Vec<DiskInfo>, String> {
    #[cfg(target_os = "windows")]
    {
        let mut disks = Vec::new();
        unsafe {
            let drive_mask = GetLogicalDrives();
            if drive_mask == 0 {
                return Err(format!("Failed to get logical drives: {}", get_last_error_string()));
            }

            for i in 0..26 {
                if (drive_mask >> i) & 1 == 1 {
                    let drive_letter = (b'A' + i as u8) as char;
                    let root_path_str = format!("{}:\\", drive_letter);
                    let wide_root_path: Vec<u16> = OsStr::new(&root_path_str).encode_wide().chain(Some(0)).collect();

                    let mut total_bytes = 0u64;
                    let mut free_bytes = 0u64;
                    let mut total_free_bytes = 0u64; // Includes free space available to user

                    if GetDiskFreeSpaceExW(
                        PCWSTR(wide_root_path.as_ptr()),
                        Some(&mut free_bytes as *mut _),
                        Some(&mut total_bytes as *mut _),
                        Some(&mut total_free_bytes as *mut _),
                    ).as_bool() {
                        // Get Volume Name
                        let mut volume_name_buffer = [0u16; MAX_PATH as usize];
                        let mut serial_number = 0u32;
                        let mut max_component_len = 0u32;
                        let mut fs_flags = 0u32;
                        let mut fs_name_buffer = [0u16; MAX_PATH as usize];

                        GetVolumeInformationW(
                            PCWSTR(wide_root_path.as_ptr()),
                            Some(&mut volume_name_buffer),
                            None, // Serial number not needed here
                            None, // Max component length not needed
                            None, // FS flags not needed
                            Some(&mut fs_name_buffer),
                        );
                        let volume_name = OsString::from_wide(&volume_name_buffer).to_string_lossy().into_owned().split(\'\0\').next().unwrap_or("").to_string();
                        let filesystem = OsString::from_wide(&fs_name_buffer).to_string_lossy().into_owned().split(\'\0\').next().unwrap_or("").to_string();

                        disks.push(DiskInfo {
                            name: format!("{} ({})", root_path_str, volume_name),
                            mount_point: root_path_str,
                            total_space: total_bytes,
                            available_space: total_free_bytes,
                            filesystem,
                        });
                    }
                    // Ignore errors for specific drives (like floppy or CD-ROM)
                }
            }
        }
        Ok(disks)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

// --- Application Control --- (New Implementation)

/// Callback function for EnumWindows
#[cfg(target_os = "windows")]
unsafe extern "system" fn enum_windows_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let windows = &mut *(lparam.0 as *mut Vec<WindowInfo>);
    let mut text: [u16; 512] = [0; 512];
    let len = GetWindowTextW(hwnd, &mut text);

    if len > 0 && IsWindowVisible(hwnd).as_bool() {
        let title = String::from_utf16_lossy(&text[..len as usize]);
        let mut process_id: u32 = 0;
        GetWindowThreadProcessId(hwnd, Some(&mut process_id as *mut u32));

        windows.push(WindowInfo {
            id: hwnd.0 as u64, // Use HWND value as ID
            pid: process_id,
            title,
            // Position/Size require GetWindowRect, omitted for simplicity
        });
    }
    BOOL(1) // Continue enumeration
}

/// List visible windows
pub fn list_windows() -> Result<Vec<WindowInfo>, String> {
    #[cfg(target_os = "windows")]
    {
        let mut windows: Vec<WindowInfo> = Vec::new();
        unsafe {
            EnumWindows(Some(enum_windows_callback), LPARAM(&mut windows as *mut _ as isize));
        }
        Ok(windows)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Bring a window to the foreground by its handle (HWND)
pub fn focus_window(window_id: u64) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let hwnd = HWND(window_id as isize);
        unsafe {
            // Restore if minimized
            ShowWindow(hwnd, SW_RESTORE);
            // Bring to foreground
            if SetForegroundWindow(hwnd).as_bool() {
                Ok(())
            } else {
                Err(format!("Failed to set foreground window (HWND: {}): {}", window_id, get_last_error_string()))
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Find a window by its title (exact match)
pub fn find_window_by_title(title: &str) -> Result<WindowInfo, String> {
    #[cfg(target_os = "windows")]
    {
        let wide_title: Vec<u16> = OsStr::new(title).encode_wide().chain(Some(0)).collect();
        unsafe {
            let hwnd = FindWindowW(PCWSTR::null(), PCWSTR(wide_title.as_ptr()));
            if hwnd.0 == 0 {
                return Err(format!("Window with title \"{}\" not found: {}", title, get_last_error_string()));
            }

            let mut text: [u16; 512] = [0; 512];
            let len = GetWindowTextW(hwnd, &mut text);
            let actual_title = if len > 0 { String::from_utf16_lossy(&text[..len as usize]) } else { "".to_string() };
            let mut process_id: u32 = 0;
            GetWindowThreadProcessId(hwnd, Some(&mut process_id as *mut u32));

            Ok(WindowInfo {
                id: hwnd.0 as u64,
                pid: process_id,
                title: actual_title,
            })
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}


// --- Helper for converting OsStr to Vec<u16> for Windows API ---
#[cfg(target_os = "windows")]
fn to_wide_null(s: &OsStr) -> Vec<u16> {
    s.encode_wide().chain(std::iter::once(0)).collect()
}

// --- Helper for getting last error string ---
#[cfg(target_os = "windows")]
fn get_last_error_string() -> String {
    unsafe {
        let error_code = GetLastError().0;
        if error_code == 0 {
            return "No error".to_string();
        }
        let mut buffer: [u16; 256] = [0; 256];
        let len = FormatMessageW(
            windows::Win32::System::Diagnostics::Debug::FORMAT_MESSAGE_FROM_SYSTEM |
            windows::Win32::System::Diagnostics::Debug::FORMAT_MESSAGE_IGNORE_INSERTS,
            None,
            error_code,
            0,
            &mut buffer,
            None,
        );
        if len == 0 {
            format!("Windows Error Code {}", error_code)
        } else {
            // Remove trailing newline characters
            let mut actual_len = len as usize;
            while actual_len > 0 && (buffer[actual_len - 1] == L'\n' as u16 || buffer[actual_len - 1] == L'\r' as u16) {
                actual_len -= 1;
            }
            String::from_utf16_lossy(&buffer[..actual_len])
        }
    }
}

