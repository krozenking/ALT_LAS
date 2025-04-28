use log::{info, warn, debug};
use super::models::{AltFile};

/// Validates an ALT file
pub fn validate_alt_file(alt_file: &AltFile) -> Result<(), String> {
    info!("Validating ALT file with ID: {}", alt_file.id);
    
    // Check title
    if alt_file.title.trim().is_empty() {
        return Err("ALT file title cannot be empty".to_string());
    }
    
    // Check version
    if alt_file.version.trim().is_empty() {
        return Err("ALT file version cannot be empty".to_string());
    }
    
    // Check if there are any tasks
    if alt_file.tasks.is_empty() {
        warn!("ALT file has no tasks");
    }
    
    // Validate each task
    for task in &alt_file.tasks {
        // Check task ID
        if task.id.trim().is_empty() {
            return Err("Task ID cannot be empty".to_string());
        }
        
        // Check for duplicate task IDs
        let duplicate_count = alt_file.tasks.iter().filter(|t| t.id == task.id).count();
        if duplicate_count > 1 {
            return Err(format!("Duplicate task ID found: {}", task.id));
        }
        
        // Check task description
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
        
        // Validate timeout if specified
        if let Some(timeout) = task.timeout_seconds {
            if timeout == 0 {
                warn!("Task {} has a timeout of 0 seconds, which may cause immediate timeout", task.id);
            } else if timeout > 3600 {
                warn!("Task {} has a long timeout of {} seconds (> 1 hour)", task.id, timeout);
            }
        }
        
        // Validate retry count if specified
        if let Some(retry) = task.retry_count {
            if retry > 10 {
                warn!("Task {} has a high retry count of {}", task.id, retry);
            }
        }
    }
    
    // Validate expected completion time if specified
    if let Some(completion_time) = alt_file.expected_completion_time {
        let total_task_time: u32 = alt_file.tasks.iter()
            .filter_map(|t| t.timeout_seconds)
            .sum();
            
        if completion_time < total_task_time {
            warn!("Expected completion time ({} seconds) is less than the sum of task timeouts ({} seconds)",
                  completion_time, total_task_time);
        }
    }
    
    // Check for isolated tasks (not in dependency chain)
    let all_dependencies: Vec<String> = alt_file.tasks.iter()
        .filter_map(|t| t.dependencies.clone())
        .flatten()
        .collect();
        
    for task in &alt_file.tasks {
        if !all_dependencies.contains(&task.id) && 
           task.dependencies.is_none() && 
           alt_file.tasks.len() > 1 {
            warn!("Task {} is isolated (not in any dependency chain)", task.id);
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

/// Validates a task execution sequence based on dependencies
pub fn validate_execution_sequence(alt_file: &AltFile, sequence: &[String]) -> Result<(), String> {
    debug!("Validating execution sequence with {} tasks", sequence.len());
    
    // Check if all tasks in the sequence exist in the ALT file
    for task_id in sequence {
        if alt_file.get_task(task_id).is_none() {
            return Err(format!("Task {} not found in ALT file", task_id));
        }
    }
    
    // Check if all tasks from ALT file are in the sequence
    for task in &alt_file.tasks {
        if !sequence.contains(&task.id) {
            return Err(format!("Task {} from ALT file is missing in the execution sequence", task.id));
        }
    }
    
    // Check if dependencies are satisfied in the sequence
    for (i, task_id) in sequence.iter().enumerate() {
        let task = alt_file.get_task(task_id).unwrap();
        
        if let Some(dependencies) = &task.dependencies {
            for dep_id in dependencies {
                // Find the position of the dependency in the sequence
                if let Some(dep_pos) = sequence.iter().position(|id| id == dep_id) {
                    // Check if dependency comes before the current task
                    if dep_pos >= i {
                        return Err(format!(
                            "Dependency violation: Task {} depends on {}, but {} is not executed before {}",
                            task_id, dep_id, dep_id, task_id
                        ));
                    }
                }
            }
        }
    }
    
    debug!("Execution sequence validation successful");
    Ok(())
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
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
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
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
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
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
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
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Circular dependency detected"));
    }
    
    #[test]
    fn test_validate_execution_sequence() {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
        let task1 = Task {
            id: "task1".to_string(),
            description: "First task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        
        // Valid sequence
        let valid_sequence = vec!["task1".to_string(), "task2".to_string()];
        let result = validate_execution_sequence(&alt_file, &valid_sequence);
        assert!(result.is_ok());
        
        // Invalid sequence (dependency violation)
        let invalid_sequence = vec!["task2".to_string(), "task1".to_string()];
        let result = validate_execution_sequence(&alt_file, &invalid_sequence);
        assert!(result.is_err());
    }
}
