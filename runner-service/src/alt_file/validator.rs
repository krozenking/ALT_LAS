use log::{info, warn, debug, error};
use super::models::{AltFile, Task, TaskStatus, Priority};
use std::collections::{HashMap, HashSet};

/// Validates an ALT file structure and logic
pub fn validate_alt_file(alt_file: &AltFile) -> Result<(), String> {
    info!("Validating ALT file with ID: {}", alt_file.id);

    // --- Basic File Structure Checks ---
    if alt_file.id.trim().is_empty() {
        return Err("ALT file ID cannot be empty".to_string());
    }
    if alt_file.title.trim().is_empty() {
        return Err("ALT file title cannot be empty".to_string());
    }
    if alt_file.version.trim().is_empty() {
        return Err("ALT file version cannot be empty".to_string());
    }
    if alt_file.tasks.is_empty() {
        warn!("ALT file ID: {} has no tasks.", alt_file.id);
        // Allow empty task lists for now, but warn
    }

    // --- Task Validation --- 
    let mut task_ids = HashSet::new();
    for task in &alt_file.tasks {
        validate_single_task(task, alt_file, &mut task_ids)?;
    }

    // --- Dependency Graph Validation ---
    validate_dependency_graph(alt_file)?;

    // --- Metadata and Timing Checks ---
    validate_timing_and_metadata(alt_file)?;

    info!("ALT file validation successful for ID: {}", alt_file.id);
    Ok(())
}

/// Validates a single task within the context of an ALT file
fn validate_single_task(task: &Task, alt_file: &AltFile, task_ids: &mut HashSet<String>) -> Result<(), String> {
    debug!("Validating task ID: {}", task.id);

    // Check task ID validity and uniqueness
    if task.id.trim().is_empty() {
        return Err("Task ID cannot be empty".to_string());
    }
    if !task_ids.insert(task.id.clone()) {
        return Err(format!("Duplicate task ID found: {}", task.id));
    }

    // Check task description
    if task.description.trim().is_empty() {
        return Err(format!("Task description cannot be empty for task ID: {}", task.id));
    }

    // Check if dependencies exist in the task list
    if let Some(dependencies) = &task.dependencies {
        for dep_id in dependencies {
            if dep_id.trim().is_empty() {
                 return Err(format!("Empty dependency ID found for task ID: {}", task.id));
            }
            if !alt_file.tasks.iter().any(|t| t.id == *dep_id) {
                return Err(format!("Dependency '{}' not found for task ID: {}", dep_id, task.id));
            }
            if *dep_id == task.id {
                 return Err(format!("Task {} cannot depend on itself.", task.id));
            }
        }
    }

    // Validate timeout if specified
    if let Some(timeout) = task.timeout_seconds {
        if timeout == 0 {
            warn!("Task {} has a timeout of 0 seconds, which may cause immediate timeout.", task.id);
        } else if timeout > 7200 { // Increased warning threshold to 2 hours
            warn!("Task {} has a long timeout of {} seconds (> 2 hours).", task.id, timeout);
        }
    }

    // Validate retry count if specified
    if let Some(retry) = task.retry_count {
        if retry > 20 { // Increased warning threshold
            warn!("Task {} has a high retry count of {}.", task.id, retry);
        }
    }
    
    // Validate parameters (basic check for now)
    if let Some(params) = &task.parameters {
        if params.is_empty() {
            warn!("Task {} has an empty parameters map.", task.id);
        }
        // Future: Add more specific parameter validation based on task type/action
    }

    Ok(())
}

/// Validates the overall dependency graph for circular dependencies and isolated tasks
fn validate_dependency_graph(alt_file: &AltFile) -> Result<(), String> {
    let mut visited = HashSet::new();
    let mut recursion_stack = HashSet::new();
    let mut all_dependent_tasks = HashSet::new();
    let mut all_dependency_tasks = HashSet::new();

    for task in &alt_file.tasks {
        if has_circular_dependency_dfs(alt_file, &task.id, &mut visited, &mut recursion_stack)? {
            return Err(format!("Circular dependency detected involving task ID: {}", task.id));
        }
        
        // Collect tasks involved in dependencies
        if let Some(deps) = &task.dependencies {
            if !deps.is_empty() {
                all_dependent_tasks.insert(task.id.clone());
                for dep_id in deps {
                    all_dependency_tasks.insert(dep_id.clone());
                }
            }
        }
    }
    
    // Check for isolated tasks (tasks that are neither dependencies nor dependents, in a multi-task file)
    if alt_file.tasks.len() > 1 {
        for task in &alt_file.tasks {
            if !all_dependent_tasks.contains(&task.id) && !all_dependency_tasks.contains(&task.id) {
                 warn!("Task {} appears isolated (not part of any dependency chain).", task.id);
            }
        }
    }

    Ok(())
}

/// Depth-first search helper to detect circular dependencies
fn has_circular_dependency_dfs(alt_file: &AltFile, task_id: &str, visited: &mut HashSet<String>, recursion_stack: &mut HashSet<String>) -> Result<bool, String> {
    // If task not found (should have been caught earlier, but check defensively)
    let task = match alt_file.get_task(task_id) {
        Some(t) => t,
        None => return Err(format!("Task {} referenced in dependency check not found.", task_id))
    };

    // Mark current node as visited and add to recursion stack
    visited.insert(task_id.to_string());
    recursion_stack.insert(task_id.to_string());

    // Recur for all dependencies
    if let Some(dependencies) = &task.dependencies {
        for dep_id in dependencies {
            // If the dependency hasn't been visited yet, recurse
            if !visited.contains(dep_id) {
                if has_circular_dependency_dfs(alt_file, dep_id, visited, recursion_stack)? {
                    return Ok(true);
                }
            // If the dependency is in the current recursion stack, cycle detected
            } else if recursion_stack.contains(dep_id) {
                return Ok(true);
            }
        }
    }

    // Remove the node from the recursion stack before returning
    recursion_stack.remove(task_id);
    Ok(false)
}

/// Validates timing estimates and metadata
fn validate_timing_and_metadata(alt_file: &AltFile) -> Result<(), String> {
    // Validate expected completion time if specified
    if let Some(completion_time) = alt_file.expected_completion_time {
        if completion_time == 0 {
             warn!("ALT file {} has an expected completion time of 0.", alt_file.id);
        }
        // Optional: Compare with sum of task timeouts, but this is often inaccurate
        // let total_task_timeout_sum: u32 = alt_file.tasks.iter()
        //     .filter_map(|t| t.timeout_seconds)
        //     .sum();
        // if completion_time < total_task_timeout_sum {
        //     warn!("Expected completion time ({} seconds) is less than the sum of task timeouts ({} seconds).",
        //           completion_time, total_task_timeout_sum);
        // }
    }
    
    // Validate metadata (basic check)
    if let Some(metadata) = &alt_file.metadata {
        if metadata.is_empty() {
            warn!("ALT file {} has an empty metadata map.", alt_file.id);
        }
        // Future: Add schema validation for metadata if a schema is defined
    }

    Ok(())
}

/// Validates a task execution sequence based on dependencies
/// (This function seems less related to validating the ALT file itself, 
/// but more for validating a proposed execution plan. Keeping it for now.)
pub fn validate_execution_sequence(alt_file: &AltFile, sequence: &[String]) -> Result<(), String> {
    debug!("Validating execution sequence with {} tasks", sequence.len());

    let sequence_set: HashSet<&String> = sequence.iter().collect();
    let task_id_set: HashSet<String> = alt_file.tasks.iter().map(|t| t.id.clone()).collect();

    // Check if all tasks in the sequence exist in the ALT file
    for task_id in sequence {
        if !task_id_set.contains(task_id) {
            return Err(format!("Task {} in sequence not found in ALT file", task_id));
        }
    }

    // Check if all tasks from ALT file are in the sequence
    if sequence_set.len() != task_id_set.len() {
         let missing_tasks: Vec<String> = task_id_set.iter()
             .filter(|id| !sequence_set.contains(id))
             .cloned()
             .collect();
         let extra_tasks: Vec<String> = sequence.iter()
             .filter(|id| !task_id_set.contains(&**id))
             .cloned()
             .collect();
         return Err(format!(
             "Sequence task count mismatch. Missing from sequence: {:?}. Extra in sequence: {:?}",
             missing_tasks, extra_tasks
         ));
    }

    // Check if dependencies are satisfied in the sequence
    let mut executed_tasks = HashSet::new();
    for task_id in sequence {
        let task = alt_file.get_task(task_id).unwrap(); // Safe unwrap due to earlier check

        if let Some(dependencies) = &task.dependencies {
            for dep_id in dependencies {
                // Check if dependency has been executed (i.e., appeared earlier in the sequence)
                if !executed_tasks.contains(dep_id) {
                    return Err(format!(
                        "Dependency violation: Task {} depends on {}, but {} is not executed before {} in the sequence.",
                        task_id, dep_id, dep_id, task_id
                    ));
                }
            }
        }
        executed_tasks.insert(task_id.clone());
    }

    debug!("Execution sequence validation successful");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::models::{AltFile, Task, TaskStatus, Priority};
    use chrono::Utc;
    use std::collections::HashMap;

    // Helper to create a basic valid task
    fn create_basic_task(id: &str, deps: Option<Vec<&str>>) -> Task {
        Task {
            id: id.to_string(),
            description: format!("Task {}", id),
            dependencies: deps.map(|d| d.iter().map(|s| s.to_string()).collect()),
            parameters: None,
            timeout_seconds: Some(60),
            retry_count: Some(1),
            status: Some(TaskStatus::Pending),
            priority: Some(Priority::Medium),
            tags: None,
        }
    }

    // Helper to create a basic valid ALT file
    fn create_basic_alt_file() -> AltFile {
        AltFile {
            id: "test-alt-123".to_string(),
            version: "1.0".to_string(),
            created_at: Utc::now(),
            title: "Test ALT File".to_string(),
            description: None,
            mode: None,
            persona: None,
            tasks: vec![],
            metadata: None,
            priority: None,
            tags: None,
            expected_completion_time: None,
        }
    }

    #[test]
    fn test_validate_valid_alt_file() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", None));
        alt_file.add_task(create_basic_task("task2", Some(vec!["task1"])) );
        assert!(validate_alt_file(&alt_file).is_ok());
    }

    #[test]
    fn test_validate_empty_title() {
        let mut alt_file = create_basic_alt_file();
        alt_file.title = "".to_string();
        alt_file.add_task(create_basic_task("task1", None));
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "ALT file title cannot be empty");
    }
    
    #[test]
    fn test_validate_empty_version() {
        let mut alt_file = create_basic_alt_file();
        alt_file.version = "".to_string();
        alt_file.add_task(create_basic_task("task1", None));
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "ALT file version cannot be empty");
    }
    
    #[test]
    fn test_validate_empty_task_id() {
        let mut alt_file = create_basic_alt_file();
        let mut task = create_basic_task("task1", None);
        task.id = "".to_string();
        alt_file.add_task(task);
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Task ID cannot be empty");
    }
    
    #[test]
    fn test_validate_duplicate_task_id() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", None));
        alt_file.add_task(create_basic_task("task1", None)); // Duplicate ID
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Duplicate task ID found: task1");
    }

    #[test]
    fn test_validate_missing_dependency() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", Some(vec!["non_existent"])) );
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Dependency 'non_existent' not found"));
    }
    
    #[test]
    fn test_validate_self_dependency() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", Some(vec!["task1"])) );
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Task task1 cannot depend on itself"));
    }

    #[test]
    fn test_validate_circular_dependency_direct() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", Some(vec!["task2"])) );
        alt_file.add_task(create_basic_task("task2", Some(vec!["task1"])) );
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Circular dependency detected"));
    }
    
    #[test]
    fn test_validate_circular_dependency_indirect() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", Some(vec!["task3"])) );
        alt_file.add_task(create_basic_task("task2", Some(vec!["task1"])) );
        alt_file.add_task(create_basic_task("task3", Some(vec!["task2"])) );
        let result = validate_alt_file(&alt_file);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Circular dependency detected"));
    }
    
    #[test]
    fn test_validate_no_circular_dependency_complex() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", None));
        alt_file.add_task(create_basic_task("task2", Some(vec!["task1"])) );
        alt_file.add_task(create_basic_task("task3", Some(vec!["task1"])) );
        alt_file.add_task(create_basic_task("task4", Some(vec!["task2", "task3"])) );
        alt_file.add_task(create_basic_task("task5", Some(vec!["task4"])) );
        assert!(validate_alt_file(&alt_file).is_ok());
    }

    #[test]
    fn test_validate_valid_execution_sequence() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", None));
        alt_file.add_task(create_basic_task("task2", Some(vec!["task1"])) );
        alt_file.add_task(create_basic_task("task3", Some(vec!["task2"])) );
        
        let valid_sequence = vec!["task1".to_string(), "task2".to_string(), "task3".to_string()];
        assert!(validate_execution_sequence(&alt_file, &valid_sequence).is_ok());
    }

    #[test]
    fn test_validate_invalid_execution_sequence_order() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", None));
        alt_file.add_task(create_basic_task("task2", Some(vec!["task1"])) );
        
        let invalid_sequence = vec!["task2".to_string(), "task1".to_string()];
        let result = validate_execution_sequence(&alt_file, &invalid_sequence);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Dependency violation"));
    }
    
    #[test]
    fn test_validate_invalid_execution_sequence_missing_task() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", None));
        alt_file.add_task(create_basic_task("task2", Some(vec!["task1"])) );
        
        let invalid_sequence = vec!["task1".to_string()]; // Missing task2
        let result = validate_execution_sequence(&alt_file, &invalid_sequence);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Sequence task count mismatch"));
    }
    
    #[test]
    fn test_validate_invalid_execution_sequence_extra_task() {
        let mut alt_file = create_basic_alt_file();
        alt_file.add_task(create_basic_task("task1", None));
        
        let invalid_sequence = vec!["task1".to_string(), "task_extra".to_string()]; // Extra task
        let result = validate_execution_sequence(&alt_file, &invalid_sequence);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Task task_extra in sequence not found in ALT file"));
    }
}

