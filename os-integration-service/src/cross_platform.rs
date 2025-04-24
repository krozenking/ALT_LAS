// Cross-platform integration utilities for OS Integration Service
// This module provides enhanced cross-platform functionality and abstractions

use std::path::Path;
use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::process::{Command, Stdio};
use log::{info, error, warn, debug};
use cfg_if::cfg_if;

// Platform detection
pub enum PlatformType {
    Windows,
    MacOS,
    Linux,
    Unknown
}

// Get current platform
pub fn get_current_platform() -> PlatformType {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            PlatformType::Windows
        } else if #[cfg(target_os = "macos")] {
            PlatformType::MacOS
        } else if #[cfg(target_os = "linux")] {
            PlatformType::Linux
        } else {
            PlatformType::Unknown
        }
    }
}

// Platform-specific path separator
pub fn path_separator() -> &'static str {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            "\\"
        } else {
            "/"
        }
    }
}

// Convert path to platform-specific format
pub fn normalize_path(path: &str) -> String {
    let platform = get_current_platform();
    match platform {
        PlatformType::Windows => path.replace("/", "\\"),
        _ => path.replace("\\", "/"),
    }
}

// Get platform-specific temporary directory
pub fn get_temp_dir() -> String {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            std::env::var("TEMP").unwrap_or_else(|_| "C:\\Windows\\Temp".to_string())
        } else if #[cfg(target_os = "macos")] {
            "/tmp".to_string()
        } else if #[cfg(target_os = "linux")] {
            "/tmp".to_string()
        } else {
            "/tmp".to_string()
        }
    }
}

// Get platform-specific home directory
pub fn get_home_dir() -> Option<String> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            let userprofile = std::env::var("USERPROFILE").ok();
            if userprofile.is_some() {
                userprofile
            } else {
                let homedrive = std::env::var("HOMEDRIVE").ok()?;
                let homepath = std::env::var("HOMEPATH").ok()?;
                Some(format!("{}{}", homedrive, homepath))
            }
        } else {
            std::env::var("HOME").ok()
        }
    }
}

// Cross-platform file operations

// Check if file exists with platform-specific handling
pub fn file_exists(path: &str) -> bool {
    let normalized_path = normalize_path(path);
    Path::new(&normalized_path).exists()
}

// Create directory with platform-specific handling
pub fn create_directory(path: &str) -> io::Result<()> {
    let normalized_path = normalize_path(path);
    fs::create_dir_all(&normalized_path)
}

// Read file with platform-specific handling
pub fn read_file(path: &str) -> io::Result<String> {
    let normalized_path = normalize_path(path);
    let mut file = File::open(&normalized_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// Write file with platform-specific handling
pub fn write_file(path: &str, contents: &str) -> io::Result<()> {
    let normalized_path = normalize_path(path);
    let mut file = File::create(&normalized_path)?;
    file.write_all(contents.as_bytes())?;
    Ok(())
}

// Cross-platform process execution

// Process execution result
pub struct ProcessResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

// Execute command with platform-specific handling
pub fn execute_command(command: &str, args: &[&str], working_dir: Option<&str>) -> io::Result<ProcessResult> {
    let mut cmd = Command::new(command);
    cmd.args(args);
    
    if let Some(dir) = working_dir {
        cmd.current_dir(normalize_path(dir));
    }
    
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());
    
    let output = cmd.output()?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let exit_code = output.status.code().unwrap_or(-1);
    
    Ok(ProcessResult {
        success: output.status.success(),
        stdout,
        stderr,
        exit_code,
    })
}

// Execute shell command with platform-specific handling
pub fn execute_shell_command(command: &str, working_dir: Option<&str>) -> io::Result<ProcessResult> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            let mut cmd = Command::new("cmd");
            cmd.args(&["/C", command]);
        } else {
            let mut cmd = Command::new("sh");
            cmd.args(&["-c", command]);
        }
    }
    
    let mut cmd = if cfg!(target_os = "windows") {
        let mut c = Command::new("cmd");
        c.args(&["/C", command]);
        c
    } else {
        let mut c = Command::new("sh");
        c.args(&["-c", command]);
        c
    };
    
    if let Some(dir) = working_dir {
        cmd.current_dir(normalize_path(dir));
    }
    
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());
    
    let output = cmd.output()?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let exit_code = output.status.code().unwrap_or(-1);
    
    Ok(ProcessResult {
        success: output.status.success(),
        stdout,
        stderr,
        exit_code,
    })
}

// Cross-platform system information

// System information structure
pub struct SystemInfo {
    pub platform: PlatformType,
    pub os_name: String,
    pub os_version: String,
    pub hostname: String,
    pub username: String,
    pub cpu_cores: u32,
    pub memory_total: u64,
    pub memory_available: u64,
}

// Get system information with platform-specific handling
pub fn get_system_info() -> io::Result<SystemInfo> {
    let platform = get_current_platform();
    
    // Get OS name and version
    let (os_name, os_version) = cfg_if! {
        if #[cfg(target_os = "windows")] {
            let output = execute_command("wmic", &["os", "get", "Caption,Version"], None)?;
            let lines: Vec<&str> = output.stdout.lines().collect();
            if lines.len() >= 2 {
                let parts: Vec<&str> = lines[1].split_whitespace().collect();
                if parts.len() >= 2 {
                    (parts[0].to_string(), parts[parts.len() - 1].to_string())
                } else {
                    ("Windows".to_string(), "Unknown".to_string())
                }
            } else {
                ("Windows".to_string(), "Unknown".to_string())
            }
        } else if #[cfg(target_os = "macos")] {
            let output = execute_command("sw_vers", &["-productName"], None)?;
            let os_name = output.stdout.trim().to_string();
            
            let output = execute_command("sw_vers", &["-productVersion"], None)?;
            let os_version = output.stdout.trim().to_string();
            
            (os_name, os_version)
        } else if #[cfg(target_os = "linux")] {
            let output = execute_shell_command("cat /etc/os-release | grep PRETTY_NAME", None)?;
            let os_info = output.stdout.trim().to_string();
            
            if let Some(start) = os_info.find('"') {
                if let Some(end) = os_info[start+1..].find('"') {
                    let full_name = &os_info[start+1..start+1+end];
                    if let Some(version_idx) = full_name.find(' ') {
                        (full_name[0..version_idx].to_string(), full_name[version_idx+1..].to_string())
                    } else {
                        (full_name.to_string(), "Unknown".to_string())
                    }
                } else {
                    ("Linux".to_string(), "Unknown".to_string())
                }
            } else {
                ("Linux".to_string(), "Unknown".to_string())
            }
        } else {
            ("Unknown".to_string(), "Unknown".to_string())
        }
    };
    
    // Get hostname
    let hostname = cfg_if! {
        if #[cfg(target_os = "windows")] {
            let output = execute_command("hostname", &[], None)?;
            output.stdout.trim().to_string()
        } else {
            let output = execute_command("hostname", &[], None)?;
            output.stdout.trim().to_string()
        }
    };
    
    // Get username
    let username = cfg_if! {
        if #[cfg(target_os = "windows")] {
            std::env::var("USERNAME").unwrap_or_else(|_| "unknown".to_string())
        } else {
            std::env::var("USER").unwrap_or_else(|_| "unknown".to_string())
        }
    };
    
    // Get CPU cores
    let cpu_cores = cfg_if! {
        if #[cfg(target_os = "windows")] {
            let output = execute_command("wmic", &["cpu", "get", "NumberOfCores"], None)?;
            let lines: Vec<&str> = output.stdout.lines().collect();
            if lines.len() >= 2 {
                lines[1].trim().parse::<u32>().unwrap_or(1)
            } else {
                1
            }
        } else if #[cfg(target_os = "macos")] {
            let output = execute_command("sysctl", &["-n", "hw.ncpu"], None)?;
            output.stdout.trim().parse::<u32>().unwrap_or(1)
        } else if #[cfg(target_os = "linux")] {
            let output = execute_command("nproc", &[], None)?;
            output.stdout.trim().parse::<u32>().unwrap_or(1)
        } else {
            1
        }
    };
    
    // Get memory information
    let (memory_total, memory_available) = cfg_if! {
        if #[cfg(target_os = "windows")] {
            let output = execute_command("wmic", &["OS", "get", "TotalVisibleMemorySize,FreePhysicalMemory"], None)?;
            let lines: Vec<&str> = output.stdout.lines().collect();
            if lines.len() >= 2 {
                let parts: Vec<&str> = lines[1].split_whitespace().collect();
                if parts.len() >= 2 {
                    let total = parts[0].parse::<u64>().unwrap_or(0) * 1024;
                    let free = parts[1].parse::<u64>().unwrap_or(0) * 1024;
                    (total, free)
                } else {
                    (0, 0)
                }
            } else {
                (0, 0)
            }
        } else if #[cfg(target_os = "macos")] {
            let output = execute_command("sysctl", &["-n", "hw.memsize"], None)?;
            let total = output.stdout.trim().parse::<u64>().unwrap_or(0);
            
            let output = execute_command("vm_stat", &[], None)?;
            let lines: Vec<&str> = output.stdout.lines().collect();
            let mut page_size = 4096;
            let mut free_pages = 0;
            
            for line in lines {
                if line.contains("page size of") {
                    if let Some(size_str) = line.split(' ').last() {
                        page_size = size_str.trim().parse::<u64>().unwrap_or(4096);
                    }
                } else if line.contains("Pages free:") {
                    if let Some(pages_str) = line.split(':').last() {
                        free_pages = pages_str.trim().replace(".", "").parse::<u64>().unwrap_or(0);
                    }
                }
            }
            
            let free = free_pages * page_size;
            (total, free)
        } else if #[cfg(target_os = "linux")] {
            let output = execute_command("free", &["-b"], None)?;
            let lines: Vec<&str> = output.stdout.lines().collect();
            if lines.len() >= 2 {
                let parts: Vec<&str> = lines[1].split_whitespace().collect();
                if parts.len() >= 4 {
                    let total = parts[1].parse::<u64>().unwrap_or(0);
                    let free = parts[3].parse::<u64>().unwrap_or(0);
                    (total, free)
                } else {
                    (0, 0)
                }
            } else {
                (0, 0)
            }
        } else {
            (0, 0)
        }
    };
    
    Ok(SystemInfo {
        platform,
        os_name,
        os_version,
        hostname,
        username,
        cpu_cores,
        memory_total,
        memory_available,
    })
}

// Cross-platform display information

// Display information structure
pub struct DisplayInfo {
    pub index: u32,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub is_primary: bool,
    pub color_depth: u32,
    pub refresh_rate: f32,
}

// Get display information with platform-specific handling
pub fn get_display_info() -> io::Result<Vec<DisplayInfo>> {
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            // Windows implementation using PowerShell
            let script = r#"
            Add-Type -AssemblyName System.Windows.Forms;
            $displays = [System.Windows.Forms.Screen]::AllScreens;
            $index = 0;
            foreach ($display in $displays) {
                $bounds = $display.Bounds;
                $isPrimary = $display.Primary;
                $bitsPerPixel = $display.BitsPerPixel;
                
                # Get refresh rate using WMI
                $refreshRate = 60.0;  # Default value
                try {
                    $monitors = Get-WmiObject WmiMonitorRefreshRate -Namespace root\wmi;
                    if ($monitors -ne $null -and $monitors.Length -gt $index) {
                        $refreshRate = $monitors[$index].CurrentRefreshRate;
                    }
                } catch {}
                
                Write-Output "$index|$($display.DeviceName)|$($bounds.Width)|$($bounds.Height)|$isPrimary|$bitsPerPixel|$refreshRate";
                $index++;
            }
            "#;
            
            let output = execute_shell_command(&format!("powershell -Command \"{}\"", script), None)?;
            let mut displays = Vec::new();
            
            for line in output.stdout.lines() {
                let parts: Vec<&str> = line.split('|').collect();
                if parts.len() >= 7 {
                    displays.push(DisplayInfo {
                        index: parts[0].parse::<u32>().unwrap_or(0),
                        name: parts[1].to_string(),
                        width: parts[2].parse::<u32>().unwrap_or(0),
                        height: parts[3].parse::<u32>().unwrap_or(0),
                        is_primary: parts[4].parse::<bool>().unwrap_or(false),
                        color_depth: parts[5].parse::<u32>().unwrap_or(0),
                        refresh_rate: parts[6].parse::<f32>().unwrap_or(60.0),
                    });
                }
            }
            
            Ok(displays)
        } else if #[cfg(target_os = "macos")] {
            // macOS implementation using system_profiler
            let output = execute_command("system_profiler", &["SPDisplaysDataType"], None)?;
            let mut displays = Vec::new();
            let mut current_display: Option<DisplayInfo> = None;
            let mut index = 0;
            
            for line in output.stdout.lines() {
                let trimmed = line.trim();
                
                if trimmed.contains("Display Type:") {
                    // New display found, save the previous one if exists
                    if let Some(display) = current_display.take() {
                        displays.push(display);
                    }
                    
                    // Create new display info
                    current_display = Some(DisplayInfo {
                        index,
                        name: "Unknown".to_string(),
                        width: 0,
                        height: 0,
                        is_primary: index == 0,  // Assume first display is primary
                        color_depth: 32,  // Assume 32-bit color depth
                        refresh_rate: 60.0,  // Default refresh rate
                    });
                    
                    index += 1;
                } else if let Some(ref mut display) = current_display {
                    if trimmed.contains("Display Type:") {
                        display.name = trimmed.split(':').nth(1).unwrap_or("Unknown").trim().to_string();
                    } else if trimmed.contains("Resolution:") {
                        let res_str = trimmed.split(':').nth(1).unwrap_or("").trim();
                        let res_parts: Vec<&str> = res_str.split(" x ").collect();
                        if res_parts.len() >= 2 {
                            display.width = res_parts[0].parse::<u32>().unwrap_or(0);
                            display.height = res_parts[1].parse::<u32>().unwrap_or(0);
                        }
                    } else if trimmed.contains("UI Looks like:") {
                        // Check if this is a Retina display
                        let looks_like = trimmed.split(':').nth(1).unwrap_or("").trim();
                        if looks_like.contains("@2x") {
                            display.width *= 2;
                            display.height *= 2;
                        }
                    } else if trimmed.contains("Refresh Rate:") {
                        let rate_str = trimmed.split(':').nth(1).unwrap_or("").trim();
                        if rate_str.ends_with(" Hz") {
                            let rate = rate_str.trim_end_matches(" Hz").parse::<f32>().unwrap_or(60.0);
                            display.refresh_rate = rate;
                        }
                    }
                }
            }
            
            // Add the last display if exists
            if let Some(display) = current_display {
                displays.push(display);
            }
            
            Ok(displays)
        } else if #[cfg(target_os = "linux")] {
            // Linux implementation using xrandr
            let output = execute_command("xrandr", &["--query"], None)?;
            let mut displays = Vec::new();
            let mut index = 0;
            
            let mut current_line = String::new();
            for line in output.stdout.lines() {
                if line.contains(" connected ") {
                    // This is a connected display
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    let name = parts[0].to_string();
                    let is_primary = line.contains("primary");
                    
                    // Find resolution
                    let mut width = 0;
                    let mut height = 0;
                    let mut refresh_rate = 60.0;
                    
                    if parts.len() >= 3 {
                        let res_part = if is_primary { parts[3] } else { parts[2] };
                        if res_part.contains("x") {
                            let res_parts: Vec<&str> = res_part.split('x').collect();
                            if res_parts.len() >= 2 {
                                width = res_parts[0].parse::<u32>().unwrap_or(0);
                                
                                // Height might have refresh rate appended
                                let height_parts: Vec<&str> = res_parts[1].split('+').collect();
                                height = height_parts[0].parse::<u32>().unwrap_or(0);
                                
                                // Try to find refresh rate
                                for part in parts {
                                    if part.ends_with("Hz") {
                                        let rate_str = part.trim_end_matches("Hz").trim();
                                        refresh_rate = rate_str.parse::<f32>().unwrap_or(60.0);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                    displays.push(DisplayInfo {
                        index,
                        name,
                        width,
                        height,
                        is_primary,
                        color_depth: 24,  // Assume 24-bit color depth
                        refresh_rate,
                    });
                    
                    index += 1;
                }
            }
            
            Ok(displays)
        } else {
            // Fallback for unsupported platforms
            Ok(vec![DisplayInfo {
                index: 0,
                name: "Default Display".to_string(),
                width: 1920,
                height: 1080,
                is_primary: true,
                color_depth: 32,
                refresh_rate: 60.0,
            }])
        }
    }
}
