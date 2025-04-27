#[cfg(test)]
mod tests {
    use super::*;
    use std::ffi::CString;
    use std::ptr;
    use crate::alt_file::models::{AltFile, AltMode, Task};
    use crate::task_manager::models::{TaskResult, TaskStatus};
    use tempfile::TempDir;
    use std::fs;

    // Helper function to create a test ALT file JSON
    fn create_test_alt_file_json() -> String {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        alt_file.mode = Some(AltMode::Normal);
        
        let task1 = Task {
            id: "task1".to_string(),
            description: "First task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        
        serde_json::to_string(&alt_file).unwrap()
    }
    
    // Helper function to create a test task result JSON
    fn create_test_task_result_json(task_id: &str, success: bool) -> String {
        let mut task_result = TaskResult::new(task_id.to_string());
        task_result.mark_running();
        
        if success {
            task_result.mark_completed(serde_json::json!({
                "output": format!("Task {} completed successfully", task_id),
                "text": format!("This is the output text from task {}", task_id)
            }));
        } else {
            task_result.mark_failed(format!("Task {} failed", task_id));
        }
        
        serde_json::to_string(&task_result).unwrap()
    }
    
    #[test]
    fn test_ffi_init_and_cleanup() {
        unsafe {
            // Initialize FFI
            let result = runner_init();
            assert_eq!(result, 1);
            
            // Clean up
            let result = runner_cleanup();
            assert_eq!(result, 1);
        }
    }
    
    #[test]
    fn test_ffi_parse_alt_file() {
        unsafe {
            // Initialize FFI
            runner_init();
            
            // Create test ALT file JSON
            let alt_file_json = create_test_alt_file_json();
            let c_json = CString::new(alt_file_json).unwrap();
            
            // Parse ALT file
            let result = runner_parse_alt_file(c_json.as_ptr());
            assert_eq!(result, 1);
            
            // Clean up
            runner_cleanup();
        }
    }
    
    #[test]
    fn test_ffi_add_task_result() {
        unsafe {
            // Initialize FFI
            runner_init();
            
            // Create test ALT file JSON
            let alt_file_json = create_test_alt_file_json();
            let c_json = CString::new(alt_file_json).unwrap();
            
            // Parse ALT file
            runner_parse_alt_file(c_json.as_ptr());
            
            // Add task result
            let alt_id = CString::new("test_alt_file").unwrap();
            let task_result_json = create_test_task_result_json("task1", true);
            let c_task_json = CString::new(task_result_json).unwrap();
            
            let result = runner_add_task_result(alt_id.as_ptr(), c_task_json.as_ptr());
            assert_eq!(result, 1);
            
            // Clean up
            runner_cleanup();
        }
    }
    
    #[test]
    fn test_ffi_generate_last_file() {
        unsafe {
            // Initialize FFI
            runner_init();
            
            // Create temporary directory
            let temp_dir = TempDir::new().unwrap();
            let output_dir = temp_dir.path().to_string_lossy().to_string();
            
            // Create test ALT file JSON
            let alt_file_json = create_test_alt_file_json();
            let c_json = CString::new(alt_file_json).unwrap();
            
            // Parse ALT file
            runner_parse_alt_file(c_json.as_ptr());
            
            // Add task results
            let alt_id = CString::new("test_alt_file").unwrap();
            
            let task1_result_json = create_test_task_result_json("task1", true);
            let c_task1_json = CString::new(task1_result_json).unwrap();
            runner_add_task_result(alt_id.as_ptr(), c_task1_json.as_ptr());
            
            let task2_result_json = create_test_task_result_json("task2", false);
            let c_task2_json = CString::new(task2_result_json).unwrap();
            runner_add_task_result(alt_id.as_ptr(), c_task2_json.as_ptr());
            
            // Generate LAST file
            let c_output_dir = CString::new(output_dir).unwrap();
            let last_id_ptr = runner_generate_last_file(alt_id.as_ptr(), c_output_dir.as_ptr());
            
            // Verify result
            assert!(!last_id_ptr.is_null());
            
            // Get LAST file ID
            let last_id = CStr::from_ptr(last_id_ptr).to_str().unwrap().to_string();
            
            // Free string
            runner_free_string(last_id_ptr);
            
            // Get LAST file JSON
            let c_last_id = CString::new(last_id).unwrap();
            let last_file_json_ptr = runner_get_last_file_json(c_last_id.as_ptr());
            
            // Verify result
            assert!(!last_file_json_ptr.is_null());
            
            // Free string
            runner_free_string(last_file_json_ptr);
            
            // Clean up
            runner_cleanup();
        }
    }
    
    #[test]
    fn test_ffi_batch_process() {
        unsafe {
            // Initialize FFI
            runner_init();
            
            // Create temporary directory
            let temp_dir = TempDir::new().unwrap();
            let output_dir = temp_dir.path().to_string_lossy().to_string();
            
            // Create test ALT file JSON
            let alt_file_json = create_test_alt_file_json();
            let c_json = CString::new(alt_file_json).unwrap();
            
            // Parse ALT file
            runner_parse_alt_file(c_json.as_ptr());
            
            // Add task results
            let alt_id = CString::new("test_alt_file").unwrap();
            
            let task1_result_json = create_test_task_result_json("task1", true);
            let c_task1_json = CString::new(task1_result_json).unwrap();
            runner_add_task_result(alt_id.as_ptr(), c_task1_json.as_ptr());
            
            let task2_result_json = create_test_task_result_json("task2", false);
            let c_task2_json = CString::new(task2_result_json).unwrap();
            runner_add_task_result(alt_id.as_ptr(), c_task2_json.as_ptr());
            
            // Create ALT IDs JSON
            let alt_ids_json = serde_json::to_string(&vec!["test_alt_file"]).unwrap();
            let c_alt_ids = CString::new(alt_ids_json).unwrap();
            
            // Batch process
            let c_output_dir = CString::new(output_dir).unwrap();
            let results_ptr = runner_batch_process(c_alt_ids.as_ptr(), c_output_dir.as_ptr());
            
            // Verify result
            assert!(!results_ptr.is_null());
            
            // Free string
            runner_free_string(results_ptr);
            
            // Clean up
            runner_cleanup();
        }
    }
    
    #[test]
    fn test_ffi_error_handling() {
        unsafe {
            // Initialize FFI
            runner_init();
            
            // Try to get a non-existent LAST file
            let c_last_id = CString::new("non_existent_id").unwrap();
            let result_ptr = runner_get_last_file_json(c_last_id.as_ptr());
            
            // Verify result is null
            assert!(result_ptr.is_null());
            
            // Get error message
            let error_ptr = runner_get_last_error();
            
            // Verify error message
            assert!(!error_ptr.is_null());
            let error = CStr::from_ptr(error_ptr).to_str().unwrap();
            assert!(error.contains("not found"));
            
            // Free string
            runner_free_string(error_ptr);
            
            // Clean up
            runner_cleanup();
        }
    }
    
    #[test]
    fn test_ffi_version() {
        unsafe {
            // Get version
            let version_ptr = runner_get_version();
            
            // Verify result
            assert!(!version_ptr.is_null());
            
            // Parse version JSON
            let version_str = CStr::from_ptr(version_ptr).to_str().unwrap();
            let version_json: serde_json::Value = serde_json::from_str(version_str).unwrap();
            
            // Verify version fields
            assert!(version_json.get("version").is_some());
            assert!(version_json.get("name").is_some());
            
            // Free string
            runner_free_string(version_ptr);
        }
    }
}
