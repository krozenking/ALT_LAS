use super::models::AltFile;
use log::{info, warn};

/// Validates an ALT file structure
pub fn validate_alt_file(alt_file: &AltFile) -> Result<(), String> {
    info!("Validating ALT file with ID: {}", alt_file.id);
    
    // Check if title is empty
    if alt_file.title.trim().is_empty() {
        return Err("ALT file title cannot be empty".to_string());
    }
    
    // Check if version is valid
    if alt_file.version.trim().is_empty() {
        return Err("ALT file version cannot be empty".to_string());
    }
    
    // Check if there are any tasks
    if alt_file.tasks.is_empty() {
        warn!("ALT file has no tasks");
    }
    
    // Validate each task
    for task in &alt_file.tasks {
        // Check if task ID is empty
        if task.id.trim().is_empty() {
            return Err("Task ID cannot be empty".to_string());
        }
        
        // Check if task description is empty
        if task.description.trim().is_empty() {
            return Err(format!("Task description cannot be empty for task ID: {}", task.id));
        }
        
        // Check if dependencies exist in the task list
        if let Some(dependencies) = &task.dependencies {
            for dep_id in dependencies {
                if !alt_file.tasks.iter().any(|t| t.id == *dep_id) {
                    return Err(format!("Dependency {} not found for task ID: {}", dep_id, task.id));
                }
            }
        }
        
        // Check for circular dependencies
        if has_circular_dependency(alt_file, &task.id, &mut Vec::new()) {
            return Err(format!("Circular dependency detected for task ID: {}", task.id));
        }
    }
    
    info!("ALT file validation successful");
    Ok(())
}

/// Checks if a task has circular dependencies
fn has_circular_dependency(alt_file: &AltFile, task_id: &str, visited: &mut Vec<String>) -> bool {
    // If we've already visited this task in this path, we have a circular dependency
    if visited.contains(&task_id.to_string()) {
        return true;
    }
    
    // Mark this task as visited
    visited.push(task_id.to_string());
    
    // Get the task
    let task = match alt_file.get_task(task_id) {
        Some(t) => t,
        None => return false, // Task not found, no circular dependency
    };
    
    // Check each dependency
    if let Some(dependencies) = &task.dependencies {
        for dep_id in dependencies {
            // Create a new visited list for each dependency path
            let mut new_visited = visited.clone();
            if has_circular_dependency(alt_file, dep_id, &mut new_visited) {
                return true;
            }
        }
    }
    
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::models::{AltFile, Task};
    
    #[test]
    fn test_validate_valid_alt_file() {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
        let task1 = Task {
            id: "task1".to_string(),
            description: "First task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        
        let result = validate_alt_file(&alt_file);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_validate_empty_title() {
        let mut alt_file = AltFile::new("".to_string());
        
        let task = Task {
            id: "task1".to_string(),
            description: "First task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        alt_file.add_task(task);
        
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "ALT file title cannot be empty");
    }
    
    #[test]
    fn test_validate_missing_dependency() {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
        let task = Task {
            id: "task1".to_string(),
            description: "First task".to_string(),
            dependencies: Some(vec!["non_existent_task".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        alt_file.add_task(task);
        
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Dependency non_existent_task not found"));
    }
    
    #[test]
    fn test_validate_circular_dependency() {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
        let task1 = Task {
            id: "task1".to_string(),
            description: "First task".to_string(),
            dependencies: Some(vec!["task2".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Circular dependency detected"));
    }
}
