#[cfg(target_os = "windows")]
use windows::Win32::System::SystemInformation;
#[cfg(target_os = "windows")]
use windows::Win32::Foundation::{HANDLE, HWND, CloseHandle};
#[cfg(target_os = "windows")]
use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
#[cfg(target_os = "windows")]
use windows::Win32::System::ProcessStatus::{GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS};
#[cfg(target_os = "windows")]
use windows::Win32::System::SystemInformation::{GetSystemInfo, SYSTEM_INFO};
#[cfg(target_os = "windows")]
use windows::Win32::System::Memory::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
use crate::platform::PlatformInfo;
use std::process::Command;

/// Windows sürüm bilgisini döndürür
pub fn get_windows_version() -> String {
    #[cfg(target_os = "windows")]
    {
        let mut os_info = windows::Win32::System::SystemInformation::OSVERSIONINFOW {
            dwOSVersionInfoSize: std::mem::size_of::<windows::Win32::System::SystemInformation::OSVERSIONINFOW>() as u32,
            dwMajorVersion: 0,
            dwMinorVersion: 0,
            dwBuildNumber: 0,
            dwPlatformId: 0,
            szCSDVersion: [0; 128],
        };
        
        unsafe {
            // Not recommended but for demonstration
            let result = windows::Win32::System::SystemInformation::GetVersionExW(&mut os_info);
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
                if let Some(product_name) = product_line.split_whitespace().last() {
                    return product_name.to_string();
                }
            }
        }
        
        "Windows (Unknown Version)".to_string()
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        "Windows 11".to_string() // Placeholder for non-Windows platforms
    }
}

/// Windows için detaylı platform bilgilerini döndürür
pub fn get_detailed_info() -> PlatformInfo {
    #[cfg(target_os = "windows")]
    {
        let mut memory_status = MEMORYSTATUSEX {
            dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32,
            dwMemoryLoad: 0,
            ullTotalPhys: 0,
            ullAvailPhys: 0,
            ullTotalPageFile: 0,
            ullAvailPageFile: 0,
            ullTotalVirtual: 0,
            ullAvailVirtual: 0,
            ullAvailExtendedVirtual: 0,
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
            os_type: "Windows".to_string(),
            os_version: get_windows_version(),
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
            let result = windows::Win32::System::SystemInformation::GetComputerNameW(
                &mut buffer,
                &mut size
            );
            
            if result.as_bool() {
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
            let result = windows::Win32::System::SystemInformation::GetUserNameW(
                &mut buffer,
                &mut size
            );
            
            if result.as_bool() {
                return String::from_utf16_lossy(&buffer[..size as usize]);
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
            dwMemoryLoad: 0,
            ullTotalPhys: 0,
            ullAvailPhys: 0,
            ullTotalPageFile: 0,
            ullAvailPageFile: 0,
            ullTotalVirtual: 0,
            ullAvailVirtual: 0,
            ullAvailExtendedVirtual: 0,
        };
        
        unsafe {
            if GlobalMemoryStatusEx(&mut memory_status).as_bool() {
                return memory_status.ullTotalPhys;
            }
        }
    }
    
    // Fallback or non-Windows platforms
    8 * 1024 * 1024 * 1024 // 8 GB
}

/// Windows'ta çalışan işlemleri listeler
pub fn list_processes() -> Vec<ProcessInfo> {
    #[cfg(target_os = "windows")]
    {
        let mut processes = Vec::new();
        
        // WMI veya CreateToolhelp32Snapshot kullanarak işlem listesi alınabilir
        // Basitleştirilmiş örnek için tasklist komutunu kullanıyoruz
        let output = Command::new("tasklist")
            .args(&["/FO", "CSV", "/NH"])
            .output();
            
        if let Ok(output) = output {
            let output_str = String::from_utf8_lossy(&output.stdout);
            
            for line in output_str.lines() {
                let parts: Vec<&str> = line.split(',').collect();
                if parts.len() >= 2 {
                    let name = parts[0].trim_matches('"').to_string();
                    let pid = parts[1].trim_matches('"').parse::<u32>().unwrap_or(0);
                    
                    if pid > 0 {
                        let memory = get_process_memory(pid);
                        let status = "Running".to_string(); // Basitleştirilmiş
                        
                        processes.push(ProcessInfo {
                            pid,
                            name,
                            memory_usage: memory,
                            status,
                        });
                    }
                }
            }
        }
        
        processes
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        Vec::new() // Non-Windows platformlar için boş liste
    }
}

#[cfg(target_os = "windows")]
fn get_process_memory(pid: u32) -> u64 {
    unsafe {
        let process_handle = OpenProcess(
            PROCESS_QUERY_INFORMATION | PROCESS_VM_READ,
            false,
            pid
        );
        
        if !process_handle.is_invalid() {
            let mut pmc = PROCESS_MEMORY_COUNTERS {
                cb: std::mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32,
                PageFaultCount: 0,
                PeakWorkingSetSize: 0,
                WorkingSetSize: 0,
                QuotaPeakPagedPoolUsage: 0,
                QuotaPagedPoolUsage: 0,
                QuotaPeakNonPagedPoolUsage: 0,
                QuotaNonPagedPoolUsage: 0,
                PagefileUsage: 0,
                PeakPagefileUsage: 0,
            };
            
            if GetProcessMemoryInfo(process_handle, &mut pmc, std::mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32).as_bool() {
                let memory = pmc.WorkingSetSize;
                CloseHandle(process_handle);
                return memory;
            }
            
            CloseHandle(process_handle);
        }
        
        0
    }
}

/// İşlem bilgilerini içeren yapı
#[derive(Debug, Clone, serde::Serialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory_usage: u64,
    pub status: String,
}
