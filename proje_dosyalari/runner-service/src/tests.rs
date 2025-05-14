#[cfg(test)]
mod integration_tests {
    use crate::alt_file::{AltFile, parse_alt_file};
    use crate::alt_file::models::{Task, AltMode};
    use crate::task_manager::{TaskScheduler, TaskExecutor};
    use crate::ai_service::{MockAiServiceClient, AiTaskProcessor};
    use crate::last_file::{generate_last_file, write_last_file};
    use std::collections::HashMap;
    use tempfile::TempDir;
    use serde_json::json;

    #[tokio::test]
    async fn test_complete_workflow() {
        // Create a sample ALT file
        let mut alt_file = AltFile::new("Integration Test ALT File".to_string());
        alt_file.mode = Some(AltMode::Normal);
        alt_file.persona = Some("technical_expert".to_string());
        
        // Add tasks
        let task1 = Task {
            id: "task1".to_string(),
            description: "First task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: Some(30),
            retry_count: Some(1),
        };
        
        let mut task2_params = HashMap::new();
        task2_params.insert("prompt".to_string(), json!("This is a test prompt"));
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "AI task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: Some(task2_params),
            timeout_seconds: Some(30),
            retry_count: Some(1),
        };
        
        let task3 = Task {
            id: "task3".to_string(),
            description: "Final task".to_string(),
            dependencies: Some(vec!["task2".to_string()]),
            parameters: None,
            timeout_seconds: Some(30),
            retry_count: Some(1),
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        alt_file.add_task(task3);
        
        // Initialize task scheduler
        let mut scheduler = TaskScheduler::new(2);
        scheduler.initialize_from_alt_file(&alt_file);
        
        // Run all tasks
        let task_results = scheduler.run_all_tasks().await;
        
        // Verify task results
        assert_eq!(task_results.len(), 3);
        assert!(task_results.contains_key("task1"));
        assert!(task_results.contains_key("task2"));
        assert!(task_results.contains_key("task3"));
        
        // Generate LAST file
        let last_file = generate_last_file(&alt_file, task_results);
        
        // Verify LAST file
        assert_eq!(last_file.alt_file_id, alt_file.id);
        assert_eq!(last_file.alt_file_title, "Integration Test ALT File");
        assert!(last_file.summary.is_some());
        
        // Write LAST file to disk
        let temp_dir = TempDir::new().unwrap();
        let file_path = write_last_file(&last_file, temp_dir.path()).unwrap();
        
        // Verify file was written
        assert!(file_path.exists());
    }
    
    #[tokio::test]
    async fn test_ai_integration_workflow() {
        // Create a mock AI processor
        let ai_processor = AiTaskProcessor::new_mock();
        
        // Create a task with AI parameters
        let mut params = HashMap::new();
        params.insert("prompt".to_string(), json!("This is a test prompt"));
        params.insert("temperature".to_string(), json!(0.7));
        
        let task = Task {
            id: "ai_task".to_string(),
            description: "AI processing task".to_string(),
            dependencies: None,
            parameters: Some(params),
            timeout_seconds: None,
            retry_count: None,
        };
        
        // Convert to task execution
        let task_execution = crate::task_manager::models::TaskExecution::from_alt_task(&task);
        
        // Process the task
        let result = ai_processor.process_task(&task_execution).await;
        
        // Verify result
        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.get("text").is_some());
    }
    
    #[test]
    fn test_alt_file_parsing() {
        // Create a sample ALT file JSON
        let alt_json = r#"
        {
            "id": "test_alt_123",
            "version": "1.0",
            "created_at": "2025-04-25T00:00:00Z",
            "title": "Test ALT File",
            "description": "This is a test ALT file",
            "mode": "normal",
            "persona": "technical_expert",
            "tasks": [
                {
                    "id": "task1",
                    "description": "First task",
                    "dependencies": null,
                    "parameters": null,
                    "timeout_seconds": 30,
                    "retry_count": 1
                },
                {
                    "id": "task2",
                    "description": "Second task",
                    "dependencies": ["task1"],
                    "parameters": null,
                    "timeout_seconds": 30,
                    "retry_count": 1
                }
            ],
            "metadata": {
                "author": "Test User",
                "priority": "high"
            }
        }
        "#;
        
        // Parse ALT file
        let alt_file = parse_alt_file(alt_json).unwrap();
        
        // Verify parsed ALT file
        assert_eq!(alt_file.id, "test_alt_123");
        assert_eq!(alt_file.title, "Test ALT File");
        assert_eq!(alt_file.tasks.len(), 2);
        assert_eq!(alt_file.tasks[0].id, "task1");
        assert_eq!(alt_file.tasks[1].id, "task2");
        assert!(alt_file.metadata.is_some());
    }
}
