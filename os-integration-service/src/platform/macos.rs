#[cfg(target_os = "macos")]
use cocoa::base::{id, nil, NO, YES};
#[cfg(target_os = "macos")]
use cocoa::foundation::{NSArray, NSAutoreleasePool, NSProcessInfo, NSString};
#[cfg(target_os = "macos")]
use core_foundation::base::TCFType;
#[cfg(target_os = "macos")]
use core_foundation::string::{CFString, CFStringRef};
#[cfg(target_os = "macos")]
use core_foundation::dictionary::CFDictionary;
#[cfg(target_os = "macos")]
use objc::{class, msg_send, sel, sel_impl};
use crate::platform::PlatformInfo;
use std::process::Command;

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
        "macOS 14.0 Sequoia".to_string() // Placeholder for non-macOS platforms
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
            os_type: "macOS".to_string(),
            os_version: get_macos_version(),
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
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let pool = NSAutoreleasePool::new(nil);
            
            let process_info: id = msg_send![class!(NSProcessInfo), processInfo];
            let ns_username: id = msg_send![process_info, userName];
            
            let bytes: *const std::os::raw::c_char = msg_send![ns_username, UTF8String];
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
    16 * 1024 * 1024 * 1024 // 16 GB
}

/// macOS'ta çalışan işlemleri listeler
pub fn list_processes() -> Vec<ProcessInfo> {
    #[cfg(target_os = "macos")]
    {
        let mut processes = Vec::new();
        
        // ps komutunu kullanarak işlem listesi alıyoruz
        let output = Command::new("ps")
            .args(&["-eo", "pid,rss,state,comm"])
            .output();
            
        if let Ok(output) = output {
            let output_str = String::from_utf8_lossy(&output.stdout);
            
            // İlk satırı atlayarak (başlık satırı) işlemleri işliyoruz
            for line in output_str.lines().skip(1) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 4 {
                    if let Ok(pid) = parts[0].parse::<u32>() {
                        let memory_kb = parts[1].parse::<u64>().unwrap_or(0) * 1024; // KB to bytes
                        let state = parts[2].to_string();
                        let name = parts[3..].join(" ");
                        
                        let status = match state.as_str() {
                            "R" => "Running".to_string(),
                            "S" => "Sleeping".to_string(),
                            "I" => "Idle".to_string(),
                            "T" => "Stopped".to_string(),
                            "Z" => "Zombie".to_string(),
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
        }
        
        processes
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Vec::new() // Non-macOS platformlar için boş liste
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
