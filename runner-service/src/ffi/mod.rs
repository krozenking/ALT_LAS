use std::os::raw::{c_char, c_int};
use std::ffi::{CStr, CString};
use std::ptr;
use std::path::Path;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use log::{info, error, warn, debug};

use crate::alt_file::models::{AltFile, AltMode};
use crate::task_manager::models::TaskResult;
use crate::last_file::{LastFile, LastFileProcessor, LastFileProcessorConfig};

// Global state for FFI operations
lazy_static::lazy_static! {
    static ref FFI_STATE: Arc<Mutex<FfiState>> = Arc::new(Mutex::new(FfiState::new()));
}

// Structure to hold FFI state
struct FfiState {
    alt_files: HashMap<String, AltFile>,
    last_files: HashMap<String, LastFile>,
    task_results: HashMap<String, HashMap<String, TaskResult>>,
    error_message: Option<String>,
}

impl FfiState {
    fn new() -> Self {
        FfiState {
            alt_files: HashMap::new(),
            last_files: HashMap::new(),
            task_results: HashMap::new(),
            error_message: None,
        }
    }

    fn set_error(&mut self, error: String) {
        self.error_message = Some(error);
    }

    fn get_error(&self) -> Option<String> {
        self.error_message.clone()
    }

    fn clear_error(&mut self) {
        self.error_message = None;
    }
}

// Helper function to convert C string to Rust string
fn c_str_to_string(c_str: *const c_char) -> Result<String, String> {
    if c_str.is_null() {
        return Err("Null pointer provided for string".to_string());
    }

    unsafe {
        match CStr::from_ptr(c_str).to_str() {
            Ok(s) => Ok(s.to_string()),
            Err(e) => Err(format!("Invalid UTF-8 string: {}", e)),
        }
    }
}

// Helper function to convert Rust string to C string
fn string_to_c_str(s: String) -> *mut c_char {
    match CString::new(s) {
        Ok(c_string) => c_string.into_raw(),
        Err(_) => ptr::null_mut(),
    }
}

/// Initialize the FFI layer
/// 
/// # Safety
/// This function must be called before any other FFI functions
#[no_mangle]
pub unsafe extern "C" fn runner_init() -> c_int {
    // Initialize logger if needed
    if let Err(e) = env_logger::try_init() {
        eprintln!("Failed to initialize logger: {}", e);
    }

    info!("Initializing Runner Service FFI layer");
    
    // Clear any existing state
    let mut state = FFI_STATE.lock().unwrap();
    *state = FfiState::new();
    
    info!("Runner Service FFI layer initialized successfully");
    1 // Success
}

/// Get the last error message
/// 
/// # Safety
/// The returned pointer is owned by the caller and must be freed with runner_free_string
#[no_mangle]
pub unsafe extern "C" fn runner_get_last_error() -> *mut c_char {
    let state = FFI_STATE.lock().unwrap();
    
    match state.get_error() {
        Some(error) => string_to_c_str(error),
        None => string_to_c_str("No error".to_string()),
    }
}

/// Free a string allocated by the FFI layer
/// 
/// # Safety
/// The pointer must have been returned by a function in this module
#[no_mangle]
pub unsafe extern "C" fn runner_free_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        let _ = CString::from_raw(ptr);
    }
}

/// Parse an ALT file from JSON string
/// 
/// # Safety
/// The json_str must be a valid null-terminated C string
#[no_mangle]
pub unsafe extern "C" fn runner_parse_alt_file(json_str: *const c_char) -> c_int {
    let mut state = FFI_STATE.lock().unwrap();
    state.clear_error();
    
    // Convert C string to Rust string
    let json = match c_str_to_string(json_str) {
        Ok(s) => s,
        Err(e) => {
            state.set_error(e);
            return 0; // Failure
        }
    };
    
    // Parse JSON to AltFile
    match serde_json::from_str::<AltFile>(&json) {
        Ok(alt_file) => {
            info!("Successfully parsed ALT file: {}", alt_file.id);
            state.alt_files.insert(alt_file.id.clone(), alt_file);
            1 // Success
        },
        Err(e) => {
            let error = format!("Failed to parse ALT file: {}", e);
            error!("{}", error);
            state.set_error(error);
            0 // Failure
        }
    }
}

/// Add task result to an ALT file
/// 
/// # Safety
/// The alt_id and json_str must be valid null-terminated C strings
#[no_mangle]
pub unsafe extern "C" fn runner_add_task_result(alt_id: *const c_char, json_str: *const c_char) -> c_int {
    let mut state = FFI_STATE.lock().unwrap();
    state.clear_error();
    
    // Convert C strings to Rust strings
    let alt_id_str = match c_str_to_string(alt_id) {
        Ok(s) => s,
        Err(e) => {
            state.set_error(e);
            return 0; // Failure
        }
    };
    
    let json = match c_str_to_string(json_str) {
        Ok(s) => s,
        Err(e) => {
            state.set_error(e);
            return 0; // Failure
        }
    };
    
    // Parse JSON to TaskResult
    match serde_json::from_str::<TaskResult>(&json) {
        Ok(task_result) => {
            info!("Adding task result for task: {} to ALT file: {}", task_result.task_id, alt_id_str);
            
            // Get or create task results map for this ALT file
            let task_results = state.task_results
                .entry(alt_id_str.clone())
                .or_insert_with(HashMap::new);
            
            // Add task result
            task_results.insert(task_result.task_id.clone(), task_result);
            1 // Success
        },
        Err(e) => {
            let error = format!("Failed to parse task result: {}", e);
            error!("{}", error);
            state.set_error(error);
            0 // Failure
        }
    }
}

/// Generate a LAST file from an ALT file and its task results
/// 
/// # Safety
/// The alt_id and output_dir must be valid null-terminated C strings
#[no_mangle]
pub unsafe extern "C" fn runner_generate_last_file(alt_id: *const c_char, output_dir: *const c_char) -> *mut c_char {
    let mut state = FFI_STATE.lock().unwrap();
    state.clear_error();
    
    // Convert C strings to Rust strings
    let alt_id_str = match c_str_to_string(alt_id) {
        Ok(s) => s,
        Err(e) => {
            state.set_error(e);
            return ptr::null_mut();
        }
    };
    
    let output_dir_str = match c_str_to_string(output_dir) {
        Ok(s) => s,
        Err(e) => {
            state.set_error(e);
            return ptr::null_mut();
        }
    };
    
    // Get ALT file
    let alt_file = match state.alt_files.get(&alt_id_str) {
        Some(alt_file) => alt_file.clone(),
        None => {
            let error = format!("ALT file not found: {}", alt_id_str);
            error!("{}", error);
            state.set_error(error);
            return ptr::null_mut();
        }
    };
    
    // Get task results
    let task_results = state.task_results
        .get(&alt_id_str)
        .cloned()
        .unwrap_or_else(HashMap::new);
    
    // Create processor config
    let mut config = LastFileProcessorConfig::default();
    config.output_dir = Path::new(&output_dir_str).to_path_buf();
    
    // Create processor
    let processor = LastFileProcessor::with_config(config);
    
    // Create a runtime for blocking FFI context
    let runtime = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build() {
            Ok(rt) => rt,
            Err(e) => {
                let error = format!("Failed to create runtime: {}", e);
                error!("{}", error);
                state.set_error(error);
                return ptr::null_mut();
            }
        };
    
    // Process ALT file
    match runtime.block_on(processor.process(&alt_file, task_results)) {
        Ok(last_file) => {
            info!("Successfully generated LAST file: {}", last_file.id);
            
            // Store LAST file
            let last_id = last_file.id.clone();
            state.last_files.insert(last_id.clone(), last_file);
            
            // Return LAST file ID
            string_to_c_str(last_id)
        },
        Err(e) => {
            let error = format!("Failed to generate LAST file: {}", e);
            error!("{}", error);
            state.set_error(error);
            ptr::null_mut()
        }
    }
}

/// Get a LAST file as JSON string
/// 
/// # Safety
/// The last_id must be a valid null-terminated C string
/// The returned pointer is owned by the caller and must be freed with runner_free_string
#[no_mangle]
pub unsafe extern "C" fn runner_get_last_file_json(last_id: *const c_char) -> *mut c_char {
    let mut state = FFI_STATE.lock().unwrap();
    state.clear_error();
    
    // Convert C string to Rust string
    let last_id_str = match c_str_to_string(last_id) {
        Ok(s) => s,
        Err(e) => {
            state.set_error(e);
            return ptr::null_mut();
        }
    };
    
    // Get LAST file
    let last_file = match state.last_files.get(&last_id_str) {
        Some(last_file) => last_file,
        None => {
            let error = format!("LAST file not found: {}", last_id_str);
            error!("{}", error);
            state.set_error(error);
            return ptr::null_mut();
        }
    };
    
    // Serialize LAST file to JSON
    match serde_json::to_string(last_file) {
        Ok(json) => {
            string_to_c_str(json)
        },
        Err(e) => {
            let error = format!("Failed to serialize LAST file: {}", e);
            error!("{}", error);
            state.set_error(error);
            ptr::null_mut()
        }
    }
}

/// Batch process multiple ALT files
/// 
/// # Safety
/// The alt_ids and output_dir must be valid null-terminated C strings
/// The returned pointer is owned by the caller and must be freed with runner_free_string
#[no_mangle]
pub unsafe extern "C" fn runner_batch_process(alt_ids_json: *const c_char, output_dir: *const c_char) -> *mut c_char {
    let mut state = FFI_STATE.lock().unwrap();
    state.clear_error();
    
    // Convert C strings to Rust strings
    let alt_ids_str = match c_str_to_string(alt_ids_json) {
        Ok(s) => s,
        Err(e) => {
            state.set_error(e);
            return ptr::null_mut();
        }
    };
    
    let output_dir_str = match c_str_to_string(output_dir) {
        Ok(s) => s,
        Err(e) => {
            state.set_error(e);
            return ptr::null_mut();
        }
    };
    
    // Parse JSON to array of ALT IDs
    let alt_ids: Vec<String> = match serde_json::from_str(&alt_ids_str) {
        Ok(ids) => ids,
        Err(e) => {
            let error = format!("Failed to parse ALT IDs: {}", e);
            error!("{}", error);
            state.set_error(error);
            return ptr::null_mut();
        }
    };
    
    // Collect ALT files and task results
    let mut alt_files = Vec::new();
    let mut task_results_map = HashMap::new();
    
    for alt_id in &alt_ids {
        // Get ALT file
        match state.alt_files.get(alt_id) {
            Some(alt_file) => {
                alt_files.push(alt_file.clone());
                
                // Get task results
                let results = state.task_results
                    .get(alt_id)
                    .cloned()
                    .unwrap_or_else(HashMap::new);
                
                task_results_map.insert(alt_id.clone(), results);
            },
            None => {
                let error = format!("ALT file not found: {}", alt_id);
                error!("{}", error);
                state.set_error(error);
                return ptr::null_mut();
            }
        }
    }
    
    // Create processor config
    let mut config = LastFileProcessorConfig::default();
    config.output_dir = Path::new(&output_dir_str).to_path_buf();
    
    // Create processor
    let processor = LastFileProcessor::with_config(config);
    
    // Create a runtime for blocking FFI context
    let runtime = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build() {
            Ok(rt) => rt,
            Err(e) => {
                let error = format!("Failed to create runtime: {}", e);
                error!("{}", error);
                state.set_error(error);
                return ptr::null_mut();
            }
        };
    
    // Batch process ALT files
    let results = runtime.block_on(processor.batch_process(alt_files, task_results_map));
    
    // Collect results
    let mut result_map = HashMap::new();
    
    for (alt_id, result) in results {
        match result {
            Ok(last_file) => {
                info!("Successfully generated LAST file: {} for ALT file: {}", last_file.id, alt_id);
                
                // Store LAST file
                let last_id = last_file.id.clone();
                state.last_files.insert(last_id.clone(), last_file.clone());
                
                // Add to result map
                result_map.insert(alt_id, last_id);
            },
            Err(e) => {
                let error = format!("Failed to generate LAST file for ALT file {}: {}", alt_id, e);
                error!("{}", error);
                result_map.insert(alt_id, format!("ERROR: {}", e));
            }
        }
    }
    
    // Serialize result map to JSON
    match serde_json::to_string(&result_map) {
        Ok(json) => {
            string_to_c_str(json)
        },
        Err(e) => {
            let error = format!("Failed to serialize results: {}", e);
            error!("{}", error);
            state.set_error(error);
            ptr::null_mut()
        }
    }
}

/// Clean up resources
/// 
/// # Safety
/// This function should be called when the FFI layer is no longer needed
#[no_mangle]
pub unsafe extern "C" fn runner_cleanup() -> c_int {
    info!("Cleaning up Runner Service FFI layer");
    
    // Clear state
    let mut state = FFI_STATE.lock().unwrap();
    *state = FfiState::new();
    
    info!("Runner Service FFI layer cleaned up successfully");
    1 // Success
}

/// Get version information
/// 
/// # Safety
/// The returned pointer is owned by the caller and must be freed with runner_free_string
#[no_mangle]
pub unsafe extern "C" fn runner_get_version() -> *mut c_char {
    let version_info = serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "name": env!("CARGO_PKG_NAME"),
        "authors": env!("CARGO_PKG_AUTHORS"),
        "description": env!("CARGO_PKG_DESCRIPTION"),
    });
    
    match serde_json::to_string(&version_info) {
        Ok(json) => string_to_c_str(json),
        Err(_) => ptr::null_mut(),
    }
}
