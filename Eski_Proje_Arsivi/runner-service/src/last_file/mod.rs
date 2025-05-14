pub mod models;
pub mod processor;

pub use models::{Artifact, LastFile, TaskResult};
pub use processor::{LastFileGenerator};

// Removed struct definitions and functions previously here
// Tests might need to be moved or adjusted

#[cfg(test)]
mod tests {
    use super::models::{Artifact, TaskResult, LastFile};
    use super::processor::LastFileGenerator;
    use crate::alt_file::models::{AltFile, Task, TaskStatus};
    use crate::alt_file::parser::create_sample_alt_file;
    use tempfile::TempDir;

    // Sample TaskResult creation needs to be adjusted or moved
    fn create_sample_task_result(task_id: &str, status: TaskStatus) -> TaskResult {
        TaskResult {
            task_id: task_id.to_string(),
            status: status.clone(),
            output: if status == TaskStatus::Completed {
                Some(serde_json::json!({
                    "message": "Task completed successfully",
                    "data": {
                        "value": 42,
                        "text": "Sample output"
                    }
                }))
            } else {
                None
            },
            error: if status == TaskStatus::Failed {
                Some("Task execution failed".to_string())
            } else {
                None
            },
            execution_time_ms: 1500,
            retry_count: 0,
            artifacts: Some(vec![
                Artifact {
                    id: format!("artifact_{}", uuid::Uuid::new_v4()),
                    artifact_type: "text".to_string(),
                    mime_type: "text/plain".to_string(),
                    size_bytes: 1024,
                    path: format!("artifacts/{}.txt", task_id),
                    description: Some("Sample artifact".to_string()),
                    metadata: None,
                }
            ]),
            metadata: None,
        }
    }

    #[test]
    fn test_create_last_file() {
        let alt_file = create_sample_alt_file();
        let last_file = LastFile::new(&alt_file, None);
        
        assert_eq!(last_file.alt_file_id, alt_file.id);
        assert!(last_file.title.contains(&alt_file.title));
        assert_eq!(last_file.task_results.len(), 0);
        assert_eq!(last_file.success_rate, 0.0);
    }
    
    #[test]
    fn test_add_task_result() {
        let alt_file = create_sample_alt_file();
        let mut last_file = LastFile::new(&alt_file, None);
        
        // Add a successful task result
        let result1 = create_sample_task_result("task1", TaskStatus::Completed);
        last_file.add_task_result(result1);
        
        // Add a failed task result
        let result2 = create_sample_task_result("task2", TaskStatus::Failed);
        last_file.add_task_result(result2);
        
        assert_eq!(last_file.task_results.len(), 2);
        assert_eq!(last_file.success_rate, 0.5); // 1 out of 2 tasks successful
        
        // Check task retrieval
        let task1 = last_file.get_task_result("task1").unwrap();
        assert_eq!(task1.status, TaskStatus::Completed);
        
        let task2 = last_file.get_task_result("task2").unwrap();
        assert_eq!(task2.status, TaskStatus::Failed);
        
        // Check successful/failed task lists
        let successful = last_file.get_successful_tasks();
        assert_eq!(successful.len(), 1);
        assert_eq!(successful[0].task_id, "task1");
        
        let failed = last_file.get_failed_tasks();
        assert_eq!(failed.len(), 1);
        assert_eq!(failed[0].task_id, "task2");
    }
    
    #[test]
    fn test_generate_last_file() {
        let temp_dir = TempDir::new().unwrap();
        let generator = LastFileGenerator::new(temp_dir.path())
            .with_graphs(false); // Disable graphs for testing
        
        let alt_file = create_sample_alt_file();
        
        // Create task results
        let mut results = Vec::new();
        for task in &alt_file.tasks {
            let status = if task.id == "task1" || task.id == "task2" {
                TaskStatus::Completed
            } else {
                TaskStatus::Failed
            };
            
            results.push(create_sample_task_result(&task.id, status));
        }
        
        // Generate LAST file
        let last_file = generator.generate(&alt_file, results).unwrap();
        
        // Check LAST file
        assert_eq!(last_file.alt_file_id, alt_file.id);
        assert_eq!(last_file.task_results.len(), alt_file.tasks.len());
        
        // Check success rate (2 out of 3 tasks successful)
        assert_eq!(last_file.success_rate, 2.0 / 3.0);
        
        // Check that files were created
        let last_dir = temp_dir.path().join(&last_file.id);
        assert!(last_dir.exists());
        
        let json_file = last_dir.join("result.last");
        assert!(json_file.exists());
        
        let html_file = last_dir.join("report.html");
        assert!(html_file.exists());
    }
    
    #[test]
    fn test_generate_summary() {
        let alt_file = create_sample_alt_file();
        let mut last_file = LastFile::new(&alt_file, None);
        
        // Add task results
        last_file.add_task_result(create_sample_task_result("task1", TaskStatus::Completed));
        last_file.add_task_result(create_sample_task_result("task2", TaskStatus::Completed));
        last_file.add_task_result(create_sample_task_result("task3", TaskStatus::Failed));
        
        // Complete execution
        last_file.complete_execution();
        
        // Generate summary
        let summary = last_file.generate_summary();
        
        // Check summary content
        assert!(summary.contains(&alt_file.id));
        assert!(summary.contains("Success Rate: 66.7%"));
        assert!(summary.contains("Tasks: 3 total, 2 successful, 1 failed"));
        assert!(summary.contains("Artifacts: 3 generated"));
    }
}

