#[cfg(target_os = "windows")]
use windows::{
    core::{PCWSTR, PWSTR, HSTRING},
    Win32::{
        Foundation::{CloseHandle, GetLastError, BOOL, HANDLE, HWND, LPARAM, MAX_PATH, RECT, GENERIC_READ, ERROR_ACCESS_DENIED, ERROR_FILE_NOT_FOUND, ERROR_OPERATION_ABORTED, WAIT_TIMEOUT, WAIT_OBJECT_0},
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
            ReadDirectoryChangesW, // Added for monitoring
            FILE_LIST_DIRECTORY, // Added for monitoring
            FILE_NOTIFY_CHANGE_FILE_NAME, // Added for monitoring
            FILE_NOTIFY_CHANGE_DIR_NAME, // Added for monitoring
            FILE_NOTIFY_CHANGE_ATTRIBUTES, // Added for monitoring
            FILE_NOTIFY_CHANGE_SIZE, // Added for monitoring
            FILE_NOTIFY_CHANGE_LAST_WRITE, // Added for monitoring
            FILE_NOTIFY_CHANGE_SECURITY, // Added for monitoring
            FILE_ACTION_ADDED,
            FILE_ACTION_REMOVED,
            FILE_ACTION_MODIFIED,
            FILE_ACTION_RENAMED_OLD_NAME,
            FILE_ACTION_RENAMED_NEW_NAME,
            FILE_NOTIFY_INFORMATION,
        },
        System::{
            Diagnostics::Debug::{FormatMessageW, FORMAT_MESSAGE_ALLOCATE_BUFFER, FORMAT_MESSAGE_FROM_SYSTEM, FORMAT_MESSAGE_IGNORE_INSERTS},
            IO::DeviceIoControl,
            Memory::{GlobalMemoryStatusEx, MEMORYSTATUSEX, LocalFree},
            ProcessStatus::{GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS},
            SystemInformation::{GetComputerNameW, GetSystemInfo, GetUserNameW, OSVERSIONINFOW, SYSTEM_INFO, GetVersionExW},
            Threading::{
                OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ, CreateProcessW, TerminateProcess, PROCESS_TERMINATE, STARTUPINFOW, PROCESS_INFORMATION,
                CreateEventW, // Added for monitoring
                WaitForSingleObject, // Added for monitoring
                INFINITE, // Added for monitoring
            },
            Pipes::{CreatePipe, ReadFile as ReadPipe, WriteFile as WritePipe},
            Registry::{RegOpenKeyExW, RegQueryValueExW, RegSetValueExW, RegDeleteValueW, RegCloseKey, HKEY, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, KEY_READ, KEY_WRITE, REG_SZ, REG_DWORD}, // Added for registry access
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
            SendMessageW, // Added for app control
            PostMessageW, // Added for app control
            WM_CLOSE, // Added for app control
            EnumChildWindows, // Added for app control
            GetClassNameW, // Added for app control
        },
    },
};

use crate::platform::{PlatformInfo, ProcessInfo, FileInfo, DiskInfo, WindowInfo};
use std::{
    collections::HashMap,
    ffi::{OsStr, OsString},
    mem,
    os::windows::ffi::{OsStrExt, OsStringExt},
    path::{Path, PathBuf},
    process::Command,
    ptr,
    sync::{Arc, Mutex, mpsc::{self, Sender, Receiver}},
    thread,
    time::{SystemTime, Duration},
};

// --- Helper for Error Messages --- (Existing code)
#[cfg(target_os = "windows")]
fn get_last_error_string() -> String {
    let error_code = unsafe { GetLastError() };
    if error_code.0 == 0 {
        return "No error".to_string();
    }

    let mut message_buffer: PWSTR = PWSTR::null();
    let message_length = unsafe {
        FormatMessageW(
            FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
            None,
            error_code.0,
            0,
            PWSTR(&mut message_buffer.0 as *mut _ as *mut u16),
            0,
            None,
        )
    };

    if message_length == 0 {
        return format!("Windows Error Code: {}", error_code.0);
    }

    let message = unsafe {
        let slice = std::slice::from_raw_parts(message_buffer.0, message_length as usize);
        String::from_utf16_lossy(slice)
    };

    unsafe {
        LocalFree(message_buffer.0 as isize);
    }

    message.trim().to_string()
}

// --- Platform Info --- (Existing code - no changes needed for now)

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

// --- Process Management --- (Existing code - no changes needed for now)

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
            if GetLastError().0 == ERROR_ACCESS_DENIED.0 { // ERROR_ACCESS_DENIED
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


// --- Filesystem Access --- (Existing code - minor adjustments)

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
                if GetLastError().0 == ERROR_FILE_NOT_FOUND.0 { // ERROR_FILE_NOT_FOUND (can mean empty dir)
                    return Ok(Vec::new());
                }
                return Err(format!("Failed to find first file in \"{}\": {}", path_str, get_last_error_string()));
            }

            loop {
                let file_name_wide = &find_data.cFileName;
                // Ensure null termination before converting
                let null_pos = file_name_wide.iter().position(|&c| c == 0).unwrap_or(file_name_wide.len());
                let file_name_os = OsString::from_wide(&file_name_wide[..null_pos]);
                let file_name = file_name_os.to_string_lossy().into_owned();

                // Skip "." and ".."
                if file_name == "." || file_name == ".." {
                    if !FindNextFileW(find_handle, &mut find_data).as_bool() {
                        break;
                    }
                    continue;
                }

                let full_path = path.join(&file_name_os);
                let is_directory = (find_data.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY.0) != 0;
                let size = ((find_data.nFileSizeHigh as u64) << 32) | (find_data.nFileSizeLow as u64);
                let last_modified = filetime_to_systemtime(find_data.ftLastWriteTime);

                result.push(FileInfo {
                    name: file_name,
                    path: full_path.to_string_lossy().into_owned(),
                    is_directory,
                    size,
                    last_modified: Some(last_modified),
                });

                if !FindNextFileW(find_handle, &mut find_data).as_bool() {
                    break;
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
fn filetime_to_systemtime(filetime: windows::Win32::Foundation::FILETIME) -> SystemTime {
    // FILETIME is 100-nanosecond intervals since January 1, 1601 (UTC)
    // SystemTime is based on UNIX_EPOCH (January 1, 1970 UTC)
    const HECTONANOSECONDS_IN_SECOND: u64 = 10_000_000;
    const SECONDS_BETWEEN_EPOCHS: u64 = 11_644_473_600; // Seconds between 1601 and 1970

    let timestamp = ((filetime.dwHighDateTime as u64) << 32) | (filetime.dwLowDateTime as u64);
    let seconds_since_1601 = timestamp / HECTONANOSECONDS_IN_SECOND;
    let nanos_since_1601 = (timestamp % HECTONANOSECONDS_IN_SECOND) * 100;

    if seconds_since_1601 < SECONDS_BETWEEN_EPOCHS {
        // Handle dates before 1970 if necessary, though SystemTime might panic
        // For simplicity, return UNIX_EPOCH for very old dates
        return UNIX_EPOCH;
    }

    let seconds_since_unix_epoch = seconds_since_1601 - SECONDS_BETWEEN_EPOCHS;
    UNIX_EPOCH + Duration::new(seconds_since_unix_epoch, nanos_since_1601 as u32)
}

/// Bir dosyanın içeriğini okur
pub fn read_file(path_str: &str) -> Result<Vec<u8>, String> {
    #[cfg(target_os = "windows")]
    {
        let wide_path: Vec<u16> = OsStr::new(path_str).encode_wide().chain(Some(0)).collect();
        unsafe {
            let file_handle = CreateFileW(
                PCWSTR(wide_path.as_ptr()),
                FILE_GENERIC_READ.0,
                FILE_SHARE_READ,
                None,
                OPEN_EXISTING,
                FILE_FLAG_OVERLAPPED, // Use overlapped for potential async later
                HANDLE::default(),
            );

            if file_handle.is_invalid() {
                return Err(format!("Failed to open file \"{}\": {}", path_str, get_last_error_string()));
            }

            let mut buffer = Vec::new();
            let mut bytes_read = 0u32;
            let mut temp_buffer = [0u8; 4096];
            let mut overlapped = OVERLAPPED::default();
            overlapped.hEvent = CreateEventW(None, true, false, PCWSTR::null())?;

            loop {
                let read_result = ReadFile(
                    file_handle,
                    Some(temp_buffer.as_mut_ptr() as *mut _),
                    temp_buffer.len() as u32,
                    None, // Bytes read is handled by GetOverlappedResult
                    Some(&mut overlapped as *mut _),
                );

                if !read_result.as_bool() {
                    let error = GetLastError();
                    if error != windows::Win32::Foundation::ERROR_IO_PENDING {
                        CloseHandle(overlapped.hEvent);
                        CloseHandle(file_handle);
                        return Err(format!("ReadFile failed: {}", get_last_error_string()));
                    }
                    // Wait for the operation to complete
                    let wait_result = WaitForSingleObject(overlapped.hEvent, INFINITE);
                    if wait_result != WAIT_OBJECT_0 {
                        CloseHandle(overlapped.hEvent);
                        CloseHandle(file_handle);
                        return Err(format!("WaitForSingleObject failed: {}", get_last_error_string()));
                    }
                }

                let get_overlapped_result = GetOverlappedResult(file_handle, &overlapped, &mut bytes_read, true);
                if !get_overlapped_result.as_bool() {
                     CloseHandle(overlapped.hEvent);
                     CloseHandle(file_handle);
                     return Err(format!("GetOverlappedResult failed: {}", get_last_error_string()));
                }

                if bytes_read == 0 {
                    break; // End of file
                }

                buffer.extend_from_slice(&temp_buffer[..bytes_read as usize]);
                overlapped.Offset += bytes_read;
            }

            CloseHandle(overlapped.hEvent);
            CloseHandle(file_handle);
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
            let file_handle = CreateFileW(
                PCWSTR(wide_path.as_ptr()),
                FILE_GENERIC_WRITE.0,
                FILE_SHARE_READ, // Allow reading while writing
                None,
                CREATE_NEW, // Creates a new file, fails if it exists
                FILE_FLAG_OVERLAPPED,
                HANDLE::default(),
            );

            // If CREATE_NEW fails because file exists, try OPEN_EXISTING to overwrite
            let file_handle = if file_handle.is_invalid() && GetLastError() == windows::Win32::Foundation::ERROR_FILE_EXISTS {
                 CreateFileW(
                    PCWSTR(wide_path.as_ptr()),
                    FILE_GENERIC_WRITE.0,
                    FILE_SHARE_READ,
                    None,
                    OPEN_EXISTING, // Open existing file
                    FILE_FLAG_OVERLAPPED,
                    HANDLE::default(),
                )
            } else {
                file_handle
            };

            if file_handle.is_invalid() {
                return Err(format!("Failed to create/open file \"{}\": {}", path_str, get_last_error_string()));
            }

            // Truncate the file if opened existing
            if SetFilePointer(file_handle, 0, None, FILE_BEGIN) == u32::MAX {
                 CloseHandle(file_handle);
                 return Err(format!("Failed to set file pointer: {}", get_last_error_string()));
            }
            if !windows::Win32::Storage::FileSystem::SetEndOfFile(file_handle).as_bool() {
                 CloseHandle(file_handle);
                 return Err(format!("Failed to truncate file: {}", get_last_error_string()));
            }

            let mut bytes_written_total = 0u32;
            let mut overlapped = OVERLAPPED::default();
            overlapped.hEvent = CreateEventW(None, true, false, PCWSTR::null())?;

            while bytes_written_total < content.len() as u32 {
                let mut bytes_written = 0u32;
                let chunk = &content[bytes_written_total as usize..];

                let write_result = WriteFile(
                    file_handle,
                    Some(chunk.as_ptr() as *const _),
                    chunk.len() as u32,
                    None,
                    Some(&mut overlapped as *mut _),
                );

                if !write_result.as_bool() {
                    let error = GetLastError();
                    if error != windows::Win32::Foundation::ERROR_IO_PENDING {
                        CloseHandle(overlapped.hEvent);
                        CloseHandle(file_handle);
                        return Err(format!("WriteFile failed: {}", get_last_error_string()));
                    }
                    // Wait for the operation to complete
                    let wait_result = WaitForSingleObject(overlapped.hEvent, INFINITE);
                    if wait_result != WAIT_OBJECT_0 {
                        CloseHandle(overlapped.hEvent);
                        CloseHandle(file_handle);
                        return Err(format!("WaitForSingleObject failed: {}", get_last_error_string()));
                    }
                }

                let get_overlapped_result = GetOverlappedResult(file_handle, &overlapped, &mut bytes_written, true);
                if !get_overlapped_result.as_bool() {
                     CloseHandle(overlapped.hEvent);
                     CloseHandle(file_handle);
                     return Err(format!("GetOverlappedResult failed: {}", get_last_error_string()));
                }

                if bytes_written == 0 {
                    // Should not happen unless disk full or other error
                    CloseHandle(overlapped.hEvent);
                    CloseHandle(file_handle);
                    return Err("WriteFile wrote 0 bytes".to_string());
                }

                bytes_written_total += bytes_written;
                overlapped.Offset += bytes_written;
            }

            CloseHandle(overlapped.hEvent);
            CloseHandle(file_handle);
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
            let attrs = windows::Win32::Storage::FileSystem::GetFileAttributesW(PCWSTR(wide_path.as_ptr()));
            if attrs == u32::MAX {
                // File not found is OK
                if GetLastError() == ERROR_FILE_NOT_FOUND {
                    return Ok(());
                }
                return Err(format!("Failed to get attributes for \"{}\": {}", path_str, get_last_error_string()));
            }

            let result = if (attrs & FILE_ATTRIBUTE_DIRECTORY.0) != 0 {
                // It s a directory
                RemoveDirectoryW(PCWSTR(wide_path.as_ptr()))
            } else {
                // It s a file
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
        let wide_destination: Vec<u16> = OsStr::new(destination_str).encode_wide().chain(Some(0)).collect();
        unsafe {
            if MoveFileW(PCWSTR(wide_source.as_ptr()), PCWSTR(wide_destination.as_ptr())).as_bool() {
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
        let wide_destination: Vec<u16> = OsStr::new(destination_str).encode_wide().chain(Some(0)).collect();
        let flags = if overwrite { COPY_FILE_FLAGS(0) } else { COPY_FILE_FAIL_IF_EXISTS };

        // Note: CopyFileExW is complex for directories. SHFileOperation is simpler but deprecated.
        // For simplicity, we ll use std::fs for directory copy if needed, or implement recursive copy.
        let source_path = Path::new(source_str);
        if source_path.is_dir() {
            // Use recursive copy helper (similar to macOS implementation)
            copy_directory_recursive(source_path, Path::new(destination_str), overwrite)
        } else {
            // Use CopyFileExW for files
            unsafe {
                // CopyFileExW requires a callback, even if null
                extern "system" fn copy_progress_routine(
                    _totalsize: i64,
                    _totalbytescopied: i64,
                    _streamsize: i64,
                    _streambytescopied: i64,
                    _dwstreamnumber: u32,
                    _dwcallbackreason: u32,
                    _hsourcefile: HANDLE,
                    _hdestinationfile: HANDLE,
                    _lpdata: *mut std::ffi::c_void,
                ) -> u32 {
                    0 // PROGRESS_CONTINUE
                }

                let mut cancel = BOOL::from(false);
                if CopyFileExW(
                    PCWSTR(wide_source.as_ptr()),
                    PCWSTR(wide_destination.as_ptr()),
                    Some(copy_progress_routine),
                    None,
                    Some(&mut cancel as *mut _),
                    flags,
                ).as_bool() {
                    Ok(())
                } else {
                    Err(format!("Failed to copy file \"{}\" to \"{}\": {}", source_str, destination_str, get_last_error_string()))
                }
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

// Recursive copy helper for Windows (similar to macOS one)
#[cfg(target_os = "windows")]
fn copy_directory_recursive(source: &Path, destination: &Path, overwrite: bool) -> Result<(), String> {
    if !destination.exists() {
        let wide_dest: Vec<u16> = OsStr::new(destination).encode_wide().chain(Some(0)).collect();
        unsafe {
            if !CreateDirectoryW(PCWSTR(wide_dest.as_ptr()), None).as_bool() {
                 return Err(format!("Failed to create destination directory \"{}\": {}", destination.display(), get_last_error_string()));
            }
        }
    }

    for entry_result in fs::read_dir(source).map_err(|e| format!("Failed to read source directory \"{}\": {}", source.display(), e))? {
        let entry = entry_result.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let entry_path = entry.path();
        let dest_path = destination.join(entry.file_name());

        if entry_path.is_dir() {
            copy_directory_recursive(&entry_path, &dest_path, overwrite)?;
        } else {
            copy_path(&entry_path.to_string_lossy(), &dest_path.to_string_lossy(), overwrite)?;
        }
    }
    Ok(())
}

/// Yeni bir dizin oluşturur
pub fn create_directory(path_str: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let wide_path: Vec<u16> = OsStr::new(path_str).encode_wide().chain(Some(0)).collect();
        unsafe {
            // CreateDirectoryW creates intermediate directories if they don t exist
            if CreateDirectoryW(PCWSTR(wide_path.as_ptr()), None).as_bool() {
                Ok(())
            } else {
                // Check if directory already exists
                if GetLastError() == windows::Win32::Foundation::ERROR_ALREADY_EXISTS {
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
            let drives = GetLogicalDrives();
            for i in 0..26 {
                if (drives >> i) & 1 == 1 {
                    let drive_letter = (b'A' + i as u8) as char;
                    let root_path_str = format!("{}:\\", drive_letter);
                    let wide_root_path: Vec<u16> = OsStr::new(&root_path_str).encode_wide().chain(Some(0)).collect();

                    let mut total_bytes = 0u64;
                    let mut free_bytes = 0u64;
                    let mut total_free_bytes = 0u64;

                    if GetDiskFreeSpaceExW(
                        PCWSTR(wide_root_path.as_ptr()),
                        Some(&mut free_bytes as *mut _),
                        Some(&mut total_bytes as *mut _),
                        Some(&mut total_free_bytes as *mut _),
                    ).as_bool() {
                        // Get volume name
                        let mut volume_name_buffer = [0u16; MAX_PATH as usize];
                        let mut serial_number = 0u32;
                        let mut max_component_length = 0u32;
                        let mut file_system_flags = 0u32;
                        let mut file_system_name_buffer = [0u16; MAX_PATH as usize];

                        GetVolumeInformationW(
                            PCWSTR(wide_root_path.as_ptr()),
                            Some(&mut volume_name_buffer),
                            None, // Serial number not needed here
                            None, // Max component length not needed here
                            None, // File system flags not needed here
                            Some(&mut file_system_name_buffer),
                        );

                        let volume_name = OsString::from_wide(&volume_name_buffer)
                            .to_string_lossy()
                            .split(\'\0\').next().unwrap_or("").to_string();
                        let file_system = OsString::from_wide(&file_system_name_buffer)
                            .to_string_lossy()
                            .split(\'\0\').next().unwrap_or("").to_string();

                        disks.push(DiskInfo {
                            name: volume_name,
                            mount_point: root_path_str,
                            total_space: total_bytes,
                            available_space: free_bytes,
                            file_system,
                        });
                    }
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

// --- Filesystem Monitoring --- (New Implementation)

#[derive(Debug, Clone, Serialize)]
pub enum FileChangeEvent {
    Created(String),
    Deleted(String),
    Modified(String),
    Renamed { from: String, to: String },
}

// Global state for watchers (simple example, needs better management for multiple watchers)
lazy_static::lazy_static! {
    static ref WATCHERS: Mutex<HashMap<String, (thread::JoinHandle<()>, Sender<()>)>> = Mutex::new(HashMap::new());
}

/// Starts monitoring a directory for changes.
/// Returns a unique ID for the watcher.
pub fn start_monitoring_directory(path_str: &str, event_sender: Sender<FileChangeEvent>) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let path = PathBuf::from(path_str);
        if !path.is_dir() {
            return Err(format!("Path is not a directory: {}", path_str));
        }

        let wide_path: Vec<u16> = OsStr::new(&path).encode_wide().chain(Some(0)).collect();
        let watcher_id = uuid::Uuid::new_v4().to_string();
        let (stop_tx, stop_rx) = mpsc::channel::<()>();

        let handle = thread::spawn(move || {
            unsafe {
                let dir_handle = CreateFileW(
                    PCWSTR(wide_path.as_ptr()),
                    FILE_LIST_DIRECTORY,
                    FILE_SHARE_READ | FILE_SHARE_WRITE | windows::Win32::Storage::FileSystem::FILE_SHARE_DELETE,
                    None,
                    OPEN_EXISTING,
                    FILE_FLAG_BACKUP_SEMANTICS | FILE_FLAG_OVERLAPPED,
                    HANDLE::default(),
                );

                if dir_handle.is_invalid() {
                    error!("Failed to open directory for monitoring {}: {}", path.display(), get_last_error_string());
                    return;
                }

                let mut buffer = [0u8; 8192]; // Buffer for notifications
                let mut overlapped = OVERLAPPED::default();
                overlapped.hEvent = match CreateEventW(None, true, false, PCWSTR::null()) {
                    Ok(handle) => handle,
                    Err(e) => {
                        error!("Failed to create event for monitoring: {}", e);
                        CloseHandle(dir_handle);
                        return;
                    }
                };

                loop {
                    // Check if stop signal received
                    if stop_rx.try_recv().is_ok() {
                        info!("Stopping directory monitor for {}", path.display());
                        break;
                    }

                    let mut bytes_returned = 0u32;
                    let result = ReadDirectoryChangesW(
                        dir_handle,
                        buffer.as_mut_ptr() as *mut _,
                        buffer.len() as u32,
                        true, // Watch subtree
                        FILE_NOTIFY_CHANGE_FILE_NAME
                            | FILE_NOTIFY_CHANGE_DIR_NAME
                            | FILE_NOTIFY_CHANGE_ATTRIBUTES
                            | FILE_NOTIFY_CHANGE_SIZE
                            | FILE_NOTIFY_CHANGE_LAST_WRITE,
                            // | FILE_NOTIFY_CHANGE_SECURITY, // Often requires admin
                        Some(&mut bytes_returned as *mut _),
                        Some(&mut overlapped as *mut _),
                        None, // Completion routine not used here
                    );

                    if !result.as_bool() {
                        error!("ReadDirectoryChangesW failed for {}: {}", path.display(), get_last_error_string());
                        // Consider breaking or retrying after a delay
                        thread::sleep(Duration::from_secs(5));
                        continue;
                    }

                    // Wait for changes or stop signal
                    let wait_handles = [overlapped.hEvent]; // Add stop event handle if needed
                    let wait_result = WaitForSingleObject(overlapped.hEvent, 1000); // Wait 1 second

                    match wait_result {
                        WAIT_OBJECT_0 => {
                            // Changes occurred
                            let get_overlapped_result = GetOverlappedResult(dir_handle, &overlapped, &mut bytes_returned, false);
                            if !get_overlapped_result.as_bool() {
                                error!("GetOverlappedResult failed for {}: {}", path.display(), get_last_error_string());
                                continue;
                            }

                            if bytes_returned == 0 {
                                // Buffer might be too small, though unlikely with 8k
                                warn!("ReadDirectoryChangesW returned 0 bytes, potential buffer overflow?");
                                continue;
                            }

                            // Process the notification buffer
                            let mut current_ptr = buffer.as_ptr() as *const FILE_NOTIFY_INFORMATION;
                            loop {
                                let info = &*current_ptr;
                                let file_name_slice = std::slice::from_raw_parts(
                                    info.FileName.as_ptr(),
                                    (info.FileNameLength / 2) as usize, // Length is in bytes, Wide chars are 2 bytes
                                );
                                let file_name = OsString::from_wide(file_name_slice).to_string_lossy().into_owned();
                                let full_path = path.join(&file_name).to_string_lossy().into_owned();

                                let event = match info.Action {
                                    FILE_ACTION_ADDED => FileChangeEvent::Created(full_path),
                                    FILE_ACTION_REMOVED => FileChangeEvent::Deleted(full_path),
                                    FILE_ACTION_MODIFIED => FileChangeEvent::Modified(full_path),
                                    FILE_ACTION_RENAMED_OLD_NAME => {
                                        // Need to get the new name from the next entry
                                        if info.NextEntryOffset == 0 {
                                            error!("Missing new name for rename event: {}", file_name);
                                            continue; // Skip this event
                                        }
                                        let next_ptr = (current_ptr as *const u8).add(info.NextEntryOffset as usize) as *const FILE_NOTIFY_INFORMATION;
                                        let next_info = &*next_ptr;
                                        if next_info.Action == FILE_ACTION_RENAMED_NEW_NAME {
                                            let new_name_slice = std::slice::from_raw_parts(
                                                next_info.FileName.as_ptr(),
                                                (next_info.FileNameLength / 2) as usize,
                                            );
                                            let new_name = OsString::from_wide(new_name_slice).to_string_lossy().into_owned();
                                            let new_full_path = path.join(&new_name).to_string_lossy().into_owned();
                                            FileChangeEvent::Renamed { from: full_path, to: new_full_path }
                                        } else {
                                            error!("Expected RENAMED_NEW_NAME after RENAMED_OLD_NAME, got action {}", next_info.Action);
                                            continue; // Skip this event
                                        }
                                    }
                                    FILE_ACTION_RENAMED_NEW_NAME => {
                                        // This should have been handled by RENAMED_OLD_NAME
                                        // If we see it alone, something is wrong, skip it.
                                        warn!("Orphan RENAMED_NEW_NAME event: {}", file_name);
                                        if info.NextEntryOffset == 0 { break; } // Move to next if possible
                                        current_ptr = (current_ptr as *const u8).add(info.NextEntryOffset as usize) as *const FILE_NOTIFY_INFORMATION;
                                        continue;
                                    }
                                    _ => {
                                        warn!("Unknown file action: {}", info.Action);
                                        if info.NextEntryOffset == 0 { break; } // Move to next if possible
                                        current_ptr = (current_ptr as *const u8).add(info.NextEntryOffset as usize) as *const FILE_NOTIFY_INFORMATION;
                                        continue;
                                    }
                                };

                                if let Err(e) = event_sender.send(event) {
                                    error!("Failed to send file change event: {}", e);
                                    // If receiver is dropped, stop monitoring
                                    break;
                                }

                                // Move to the next entry
                                if info.NextEntryOffset == 0 {
                                    break;
                                }
                                current_ptr = (current_ptr as *const u8).add(info.NextEntryOffset as usize) as *const FILE_NOTIFY_INFORMATION;

                                // If the event was a rename, we already processed the next entry
                                if matches!(event_sender.try_recv(), Ok(FileChangeEvent::Renamed { .. })) {
                                     if info.NextEntryOffset == 0 { break; }
                                     current_ptr = (current_ptr as *const u8).add(info.NextEntryOffset as usize) as *const FILE_NOTIFY_INFORMATION;
                                }
                            }
                        }
                        WAIT_TIMEOUT => {
                            // Timeout, check stop signal again
                            continue;
                        }
                        _ => {
                            // Error waiting
                            error!("WaitForSingleObject failed during monitoring: {}", get_last_error_string());
                            break;
                        }
                    }
                }

                // Cleanup
                CloseHandle(overlapped.hEvent);
                CloseHandle(dir_handle);
            }
        });

        let mut watchers = WATCHERS.lock().unwrap();
        watchers.insert(watcher_id.clone(), (handle, stop_tx));

        Ok(watcher_id)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Stops monitoring a directory.
pub fn stop_monitoring_directory(watcher_id: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let mut watchers = WATCHERS.lock().unwrap();
        if let Some((handle, stop_tx)) = watchers.remove(watcher_id) {
            // Send stop signal
            let _ = stop_tx.send(()); // Ignore error if receiver already dropped

            // Wait for the thread to finish
            // Consider adding a timeout here
            if let Err(e) = handle.join() {
                error!("Error joining watcher thread {}: {:?}", watcher_id, e);
            }
            info!("Successfully stopped watcher {}", watcher_id);
            Ok(())
        } else {
            Err(format!("Watcher with ID {} not found", watcher_id))
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}


// --- Application Control --- (New Implementation)

/// Finds a window by title (exact match)
pub fn find_window_by_title(title: &str) -> Result<isize, String> {
    #[cfg(target_os = "windows")]
    {
        let wide_title: Vec<u16> = OsStr::new(title).encode_wide().chain(Some(0)).collect();
        unsafe {
            let hwnd = FindWindowW(PCWSTR::null(), PCWSTR(wide_title.as_ptr()));
            if hwnd.0 == 0 {
                Err(format!("Window with title \"{}\" not found: {}", title, get_last_error_string()))
            } else {
                Ok(hwnd.0)
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Sends a message to a window
pub fn send_window_message(hwnd_val: isize, message: u32, wparam: usize, lparam: isize) -> Result<isize, String> {
    #[cfg(target_os = "windows")]
    {
        let hwnd = HWND(hwnd_val);
        if hwnd.0 == 0 {
            return Err("Invalid window handle (0)".to_string());
        }
        unsafe {
            // Use SendMessageW for synchronous messages
            let result = SendMessageW(hwnd, message, wparam, lparam);
            Ok(result.0)
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Posts a message to a window (asynchronous)
pub fn post_window_message(hwnd_val: isize, message: u32, wparam: usize, lparam: isize) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let hwnd = HWND(hwnd_val);
        if hwnd.0 == 0 {
            return Err("Invalid window handle (0)".to_string());
        }
        unsafe {
            if PostMessageW(hwnd, message, wparam, lparam).as_bool() {
                Ok(())
            } else {
                Err(format!("PostMessageW failed: {}", get_last_error_string()))
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Closes a window gracefully by sending WM_CLOSE
pub fn close_window(hwnd_val: isize) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        // PostMessage is generally preferred for WM_CLOSE
        post_window_message(hwnd_val, WM_CLOSE, 0, 0)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Lists all top-level visible windows
pub fn list_windows() -> Result<Vec<WindowInfo>, String> {
    #[cfg(target_os = "windows")]
    {
        let windows = Arc::new(Mutex::new(Vec::new()));

        extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
            let windows_arc = unsafe { Arc::from_raw(lparam.0 as *const Mutex<Vec<WindowInfo>>) };
            unsafe {
                if IsWindowVisible(hwnd).as_bool() {
                    let mut text: [u16; 512] = [0; 512];
                    let len = GetWindowTextW(hwnd, &mut text);
                    if len > 0 {
                        let title = String::from_utf16_lossy(&text[..len as usize]);
                        let mut process_id: u32 = 0;
                        GetWindowThreadProcessId(hwnd, Some(&mut process_id as *mut _));

                        let mut windows = windows_arc.lock().unwrap();
                        windows.push(WindowInfo {
                            id: hwnd.0,
                            title,
                            process_id,
                        });
                    }
                }
            }
            // Increment Arc ref count before giving it back to EnumWindows
            mem::forget(windows_arc.clone());
            BOOL::from(true) // Continue enumeration
        }

        let windows_ptr = Arc::into_raw(windows.clone()) as isize;

        unsafe {
            EnumWindows(Some(enum_windows_proc), LPARAM(windows_ptr));
        }

        // Clean up the Arc reference count from the last callback
        let _ = unsafe { Arc::from_raw(windows_ptr as *const Mutex<Vec<WindowInfo>>) };

        let result = windows.lock().unwrap().clone();
        Ok(result)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

// --- Registry Access --- (New Implementation)

#[cfg(target_os = "windows")]
fn open_registry_key(root_key_str: &str, sub_key: &str, access: u32) -> Result<HKEY, String> {
    let root_key = match root_key_str.to_uppercase().as_str() {
        "HKCU" | "HKEY_CURRENT_USER" => HKEY_CURRENT_USER,
        "HKLM" | "HKEY_LOCAL_MACHINE" => HKEY_LOCAL_MACHINE,
        // Add other root keys like HKEY_CLASSES_ROOT, HKEY_USERS, HKEY_CURRENT_CONFIG if needed
        _ => return Err(format!("Invalid root key: {}", root_key_str)),
    };

    let wide_sub_key: Vec<u16> = OsStr::new(sub_key).encode_wide().chain(Some(0)).collect();
    let mut hkey = HKEY::default();

    unsafe {
        let result = RegOpenKeyExW(
            root_key,
            PCWSTR(wide_sub_key.as_ptr()),
            0,
            access,
            &mut hkey,
        );

        if result.0 != 0 { // ERROR_SUCCESS is 0
            Err(format!("Failed to open registry key \"{}\\{}\": Error code {}", root_key_str, sub_key, result.0))
        } else {
            Ok(hkey)
        }
    }
}

/// Reads a string value from the registry
pub fn read_registry_string(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let hkey = open_registry_key(root_key_str, sub_key, KEY_READ.0)?;
        let wide_value_name: Vec<u16> = OsStr::new(value_name).encode_wide().chain(Some(0)).collect();
        let mut data_type: u32 = 0;
        let mut buffer_size: u32 = 0;

        unsafe {
            // First call to get the buffer size
            let result = RegQueryValueExW(
                hkey,
                PCWSTR(wide_value_name.as_ptr()),
                None,
                Some(&mut data_type as *mut _),
                None, // No data buffer yet
                Some(&mut buffer_size as *mut _),
            );

            if result.0 != 0 {
                RegCloseKey(hkey);
                return Err(format!("Failed to query registry value size: Error code {}", result.0));
            }

            if data_type != REG_SZ.0 {
                RegCloseKey(hkey);
                return Err("Registry value is not a string (REG_SZ)".to_string());
            }

            // Allocate buffer (size is in bytes, need wide chars)
            let mut buffer: Vec<u16> = vec![0; (buffer_size / 2) as usize];

            // Second call to get the data
            let result = RegQueryValueExW(
                hkey,
                PCWSTR(wide_value_name.as_ptr()),
                None,
                None, // Type already checked
                Some(buffer.as_mut_ptr() as *mut _),
                Some(&mut buffer_size as *mut _),
            );

            RegCloseKey(hkey);

            if result.0 != 0 {
                return Err(format!("Failed to query registry value data: Error code {}", result.0));
            }

            // Convert wide char buffer to String, handling potential null terminator
            let len_with_null = (buffer_size / 2) as usize;
            let len = if len_with_null > 0 && buffer[len_with_null - 1] == 0 {
                len_with_null - 1
            } else {
                len_with_null
            };

            Ok(String::from_utf16_lossy(&buffer[..len]))
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Reads a DWORD (u32) value from the registry
pub fn read_registry_dword(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<u32, String> {
    #[cfg(target_os = "windows")]
    {
        let hkey = open_registry_key(root_key_str, sub_key, KEY_READ.0)?;
        let wide_value_name: Vec<u16> = OsStr::new(value_name).encode_wide().chain(Some(0)).collect();
        let mut data_type: u32 = 0;
        let mut data: u32 = 0;
        let mut data_size: u32 = mem::size_of::<u32>() as u32;

        unsafe {
            let result = RegQueryValueExW(
                hkey,
                PCWSTR(wide_value_name.as_ptr()),
                None,
                Some(&mut data_type as *mut _),
                Some(&mut data as *mut u32 as *mut _),
                Some(&mut data_size as *mut _),
            );

            RegCloseKey(hkey);

            if result.0 != 0 {
                return Err(format!("Failed to query registry value: Error code {}", result.0));
            }

            if data_type != REG_DWORD.0 {
                return Err("Registry value is not a DWORD (REG_DWORD)".to_string());
            }

            if data_size != mem::size_of::<u32>() as u32 {
                return Err("Incorrect data size for DWORD value".to_string());
            }

            Ok(data)
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Writes a string value to the registry
pub fn write_registry_string(root_key_str: &str, sub_key: &str, value_name: &str, data: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let hkey = open_registry_key(root_key_str, sub_key, KEY_WRITE.0)?;
        let wide_value_name: Vec<u16> = OsStr::new(value_name).encode_wide().chain(Some(0)).collect();
        let wide_data: Vec<u16> = OsStr::new(data).encode_wide().chain(Some(0)).collect(); // Ensure null termination

        unsafe {
            let result = RegSetValueExW(
                hkey,
                PCWSTR(wide_value_name.as_ptr()),
                0,
                REG_SZ,
                Some(wide_data.as_ptr() as *const _),
                (wide_data.len() * mem::size_of::<u16>()) as u32, // Size in bytes
            );

            RegCloseKey(hkey);

            if result.0 != 0 {
                Err(format!("Failed to write registry string value: Error code {}", result.0))
            } else {
                Ok(())
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Writes a DWORD (u32) value to the registry
pub fn write_registry_dword(root_key_str: &str, sub_key: &str, value_name: &str, data: u32) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let hkey = open_registry_key(root_key_str, sub_key, KEY_WRITE.0)?;
        let wide_value_name: Vec<u16> = OsStr::new(value_name).encode_wide().chain(Some(0)).collect();

        unsafe {
            let result = RegSetValueExW(
                hkey,
                PCWSTR(wide_value_name.as_ptr()),
                0,
                REG_DWORD,
                Some(&data as *const u32 as *const _),
                mem::size_of::<u32>() as u32,
            );

            RegCloseKey(hkey);

            if result.0 != 0 {
                Err(format!("Failed to write registry DWORD value: Error code {}", result.0))
            } else {
                Ok(())
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Deletes a value from the registry
pub fn delete_registry_value(root_key_str: &str, sub_key: &str, value_name: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let hkey = open_registry_key(root_key_str, sub_key, KEY_WRITE.0)?;
        let wide_value_name: Vec<u16> = OsStr::new(value_name).encode_wide().chain(Some(0)).collect();

        unsafe {
            let result = RegDeleteValueW(
                hkey,
                PCWSTR(wide_value_name.as_ptr()),
            );

            RegCloseKey(hkey);

            if result.0 != 0 {
                // Ignore ERROR_FILE_NOT_FOUND
                if result.0 == ERROR_FILE_NOT_FOUND.0 {
                    Ok(())
                } else {
                    Err(format!("Failed to delete registry value: Error code {}", result.0))
                }
            } else {
                Ok(())
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not supported on this platform".to_string())
    }
}

// --- Screen Capture --- (Existing code - no changes needed for now)
// ... (keep existing screenshot functions)

// --- CUDA Screenshot --- (Placeholder/Existing)
pub fn capture_screen_cuda(filepath: &str, format: &str) -> Result<(u32, u32), String> {
    // Placeholder - Actual CUDA implementation needed
    warn!("CUDA screenshot capture is not fully implemented yet.");
    // Fallback to standard capture for now
    capture_windows_screenshot(filepath, format, -1)
}

