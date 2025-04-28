use std::collections::HashMap;
use std::sync::Arc;
use log::{info, error, warn, debug};
use tokio::sync::{Mutex, mpsc};
use tokio::time::{timeout, Duration};
use futures::future::{join_all, select_all};
use uuid::Uuid;
use chrono::Utc;

use crate::alt_file::models::{AltFile, Task as AltTask};
use crate::task_manager::models::{TaskExecution, TaskResult, TaskStatus};
use crate::task_manager::executor::TaskExecutor;
use crate::ai_service::AiTaskProcessor;

/// Task scheduler for managing task execution
pub struct TaskScheduler {
    executor: TaskExecutor,
    max_concurrent_tasks: usize,
    results: Arc<Mutex<HashMap<String, TaskResult>>>,
}

impl TaskScheduler {
    /// Creates a new task scheduler
    pub fn new(ai_processor: Option<AiTaskProcessor>, max_concurrent_tasks: usize) -> Self {
        TaskScheduler {
            executor: TaskExecutor::new(ai_processor),
            max_concurrent_tasks,
            results: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    
    /// Schedules and executes tasks from an ALT file
    pub async fn schedule_tasks(&self, alt_file: &AltFile) -> HashMap<String, TaskResult> {
        info!("Scheduling tasks for ALT file: {}", alt_file.id);
        
        if alt_file.tasks.is_empty() {
            warn!("No tasks found in ALT file: {}", alt_file.id);
            return HashMap::new();
        }
        
        // Create task executions from ALT tasks
        let task_executions = self.create_task_executions(alt_file);
        
        // Build dependency graph
        let dependency_graph = self.build_dependency_graph(&task_executions);
        
        // Execute tasks
        self.execute_tasks(task_executions, dependency_graph).await;
        
        // Return results
        let results = self.results.lock().await.clone();
        info!("Task execution completed for ALT file: {}. Total tasks: {}, Completed: {}", 
            alt_file.id, 
            results.len(),
            results.values().filter(|r| r.status == TaskStatus::Completed).count()
        );
        
        results
    }
    
    /// Creates task executions from ALT tasks
    fn create_task_executions(&self, alt_file: &AltFile) -> HashMap<String, TaskExecution> {
        let mut task_executions = HashMap::new();
        
        for task in &alt_file.tasks {
            let task_execution = TaskExecution {
                task_id: task.id.clone(),
                description: task.description.clone(),
                dependencies: task.dependencies.clone().unwrap_or_else(Vec::new),
                parameters: task.parameters.clone(),
            };
            
            task_executions.insert(task.id.clone(), task_execution);
        }
        
        task_executions
    }
    
    /// Builds a dependency graph for tasks
    fn build_dependency_graph(&self, task_executions: &HashMap<String, TaskExecution>) -> HashMap<String, Vec<String>> {
        let mut dependency_graph = HashMap::new();
        
        // For each task, find tasks that depend on it
        for (task_id, task) in task_executions {
            // Initialize empty dependents list for this task
            dependency_graph.entry(task_id.clone()).or_insert_with(Vec::new);
            
            // For each dependency of this task, add this task as a dependent
            for dep_id in &task.dependencies {
                dependency_graph.entry(dep_id.clone())
                    .or_insert_with(Vec::new)
                    .push(task_id.clone());
            }
        }
        
        dependency_graph
    }
    
    /// Executes tasks according to dependencies
    async fn execute_tasks(&self, 
                          task_executions: HashMap<String, TaskExecution>, 
                          dependency_graph: HashMap<String, Vec<String>>) {
        // Track tasks that are ready to execute (no dependencies or all dependencies completed)
        let mut ready_tasks = Vec::new();
        
        // Track remaining dependencies for each task
        let mut remaining_deps = HashMap::new();
        
        // Initialize remaining dependencies
        for (task_id, task) in &task_executions {
            let deps = task.dependencies.clone();
            if deps.is_empty() {
                // No dependencies, task is ready
                ready_tasks.push(task_id.clone());
            } else {
                // Store remaining dependencies
                remaining_deps.insert(task_id.clone(), deps);
            }
        }
        
        // Create channel for task completion notifications
        let (tx, mut rx) = mpsc::channel(100);
        
        // Track active tasks
        let mut active_tasks = 0;
        
        // Execute tasks until all are completed
        while !ready_tasks.is_empty() || active_tasks > 0 {
            // Execute ready tasks up to max_concurrent_tasks
            while !ready_tasks.is_empty() && active_tasks < self.max_concurrent_tasks {
                let task_id = ready_tasks.remove(0);
                
                if let Some(task) = task_executions.get(&task_id) {
                    // Clone task for execution
                    let task_clone = task.clone();
                    
                    // Clone results for task
                    let results = self.results.clone();
                    
                    // Clone tx for task
                    let tx_clone = tx.clone();
                    
                    // Increment active tasks
                    active_tasks += 1;
                    
                    // Execute task in separate task
                    tokio::spawn(async move {
                        // Get dependency results
                        let mut dependency_results = HashMap::new();
                        let results_lock = results.lock().await;
                        
                        for dep_id in &task_clone.dependencies {
                            if let Some(result) = results_lock.get(dep_id) {
                                dependency_results.insert(dep_id.clone(), result.clone());
                            }
                        }
                        
                        drop(results_lock); // Release lock before execution
                        
                        // Execute task
                        let executor = TaskExecutor::new(None); // Create new executor for this task
                        let result = executor.execute_task(task_clone.clone(), dependency_results).await;
                        
                        // Store result
                        {
                            let mut results_lock = results.lock().await;
                            results_lock.insert(task_clone.task_id.clone(), result.clone());
                        }
                        
                        // Notify completion
                        let _ = tx_clone.send((task_clone.task_id.clone(), result.status.clone())).await;
                    });
                }
            }
            
            // Wait for a task to complete
            if active_tasks > 0 {
                if let Some((completed_task_id, status)) = rx.recv().await {
                    // Decrement active tasks
                    active_tasks -= 1;
                    
                    // If task failed, cancel dependent tasks
                    if status != TaskStatus::Completed {
                        self.cancel_dependent_tasks(&completed_task_id, &dependency_graph).await;
                    } else {
                        // Update remaining dependencies for dependent tasks
                        if let Some(dependents) = dependency_graph.get(&completed_task_id) {
                            for dependent_id in dependents {
                                if let Some(deps) = remaining_deps.get_mut(dependent_id) {
                                    // Remove completed dependency
                                    if let Some(pos) = deps.iter().position(|d| d == &completed_task_id) {
                                        deps.remove(pos);
                                    }
                                    
                                    // If no more dependencies, add to ready tasks
                                    if deps.is_empty() {
                                        ready_tasks.push(dependent_id.clone());
                                        remaining_deps.remove(dependent_id);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    /// Cancels tasks that depend on a failed task
    async fn cancel_dependent_tasks(&self, failed_task_id: &str, dependency_graph: &HashMap<String, Vec<String>>) {
        let mut to_cancel = Vec::new();
        
        // Find direct dependents
        if let Some(dependents) = dependency_graph.get(failed_task_id) {
            to_cancel.extend(dependents.clone());
        }
        
        // Process all dependents recursively
        let mut i = 0;
        while i < to_cancel.len() {
            let task_id = &to_cancel[i];
            
            // Find dependents of this task
            if let Some(dependents) = dependency_graph.get(task_id) {
                for dependent in dependents {
                    if !to_cancel.contains(dependent) {
                        to_cancel.push(dependent.clone());
                    }
                }
            }
            
            i += 1;
        }
        
        // Cancel all dependent tasks
        let mut results = self.results.lock().await;
        for task_id in to_cancel {
            let mut result = TaskResult::new(task_id.clone());
            result.mark_cancelled(format!("Cancelled due to dependency failure: {}", failed_task_id));
            results.insert(task_id, result);
        }
    }
    
    /// Executes a single task with its dependencies
    pub async fn execute_single_task(&self, 
                                    alt_file: &AltFile, 
                                    task_id: &str) -> Option<TaskResult> {
        info!("Executing single task: {} from ALT file: {}", task_id, alt_file.id);
        
        // Find the task
        let task = alt_file.tasks.iter().find(|t| t.id == task_id);
        if task.is_none() {
            error!("Task not found: {}", task_id);
            return None;
        }
        
        let task = task.unwrap();
        
        // Create task execution
        let task_execution = TaskExecution {
            task_id: task.id.clone(),
            description: task.description.clone(),
            dependencies: task.dependencies.clone().unwrap_or_else(Vec::new),
            parameters: task.parameters.clone(),
        };
        
        // Execute dependencies first if any
        let mut dependency_results = HashMap::new();
        if let Some(deps) = &task.dependencies {
            for dep_id in deps {
                if let Some(dep_result) = self.execute_single_task(alt_file, dep_id).await {
                    dependency_results.insert(dep_id.clone(), dep_result);
                } else {
                    // Dependency failed or not found
                    let mut result = TaskResult::new(task_id.to_string());
                    result.mark_failed(format!("Dependency not found or failed: {}", dep_id));
                    return Some(result);
                }
            }
        }
        
        // Execute the task
        let result = self.executor.execute_task(task_execution, dependency_results).await;
        
        // Store result
        {
            let mut results = self.results.lock().await;
            results.insert(task_id.to_string(), result.clone());
        }
        
        Some(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::{AltFile, Task as AltTask};
    use serde_json::json;
    
    fn create_test_alt_file() -> AltFile {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
        // Task 1: No dependencies
        let task1 = AltTask {
            id: "task1".to_string(),
            description: "Task 1".to_string(),
            dependencies: None,
            parameters: Some(json!({
                "task_type": "generic",
                "test_param": "test_value"
            }).as_object().unwrap().clone()),
            timeout_seconds: Some(5),
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        // Task 2: Depends on Task 1
        let task2 = AltTask {
            id: "task2".to_string(),
            description: "Task 2".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: Some(json!({
                "task_type": "generic",
                "test_param": "test_value2"
            }).as_object().unwrap().clone()),
            timeout_seconds: Some(5),
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        // Task 3: Depends on Task 1
        let task3 = AltTask {
            id: "task3".to_string(),
            description: "Task 3".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: Some(json!({
                "task_type": "generic",
                "test_param": "test_value3"
            }).as_object().unwrap().clone()),
            timeout_seconds: Some(5),
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        // Task 4: Depends on Task 2 and Task 3
        let task4 = AltTask {
            id: "task4".to_string(),
            description: "Task 4".to_string(),
            dependencies: Some(vec!["task2".to_string(), "task3".to_string()]),
            parameters: Some(json!({
                "task_type": "generic",
                "test_param": "test_value4"
            }).as_object().unwrap().clone()),
            timeout_seconds: Some(5),
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        alt_file.add_task(task3);
        alt_file.add_task(task4);
        
        alt_file
    }
    
    #[tokio::test]
    async fn test_schedule_tasks() {
        let alt_file = create_test_alt_file();
        let scheduler = TaskScheduler::new(None, 4);
        
        let results = scheduler.schedule_tasks(&alt_file).await;
        
        assert_eq!(results.len(), 4);
        assert!(results.contains_key("task1"));
        assert!(results.contains_key("task2"));
        assert!(results.contains_key("task3"));
        assert!(results.contains_key("task4"));
        
        // Check task statuses
        assert_eq!(results.get("task1").unwrap().status, TaskStatus::Completed);
        assert_eq!(results.get("task2").unwrap().status, TaskStatus::Completed);
        assert_eq!(results.get("task3").unwrap().status, TaskStatus::Completed);
        assert_eq!(results.get("task4").unwrap().status, TaskStatus::Completed);
    }
    
    #[tokio::test]
    async fn test_dependency_failure() {
        let mut alt_file = create_test_alt_file();
        
        // Modify task1 to fail
        let task1 = alt_file.tasks.iter_mut().find(|t| t.id == "task1").unwrap();
        task1.parameters = Some(json!({
            "task_type": "system_command",
            "command": "non_existent_command",
            "args": []
        }).as_object().unwrap().clone());
        
        let scheduler = TaskScheduler::new(None, 4);
        let results = scheduler.schedule_tasks(&alt_file).await;
        
        assert_eq!(results.len(), 4);
        
        // Check task statuses
        assert_eq!(results.get("task1").unwrap().status, TaskStatus::Failed);
        assert_eq!(results.get("task2").unwrap().status, TaskStatus::Cancelled);
        assert_eq!(results.get("task3").unwrap().status, TaskStatus::Cancelled);
        assert_eq!(results.get("task4").unwrap().status, TaskStatus::Cancelled);
    }
    
    #[tokio::test]
    async fn test_execute_single_task() {
        let alt_file = create_test_alt_file();
        let scheduler = TaskScheduler::new(None, 4);
        
        // Execute task4 (should execute all dependencies)
        let result = scheduler.execute_single_task(&alt_file, "task4").await;
        
        assert!(result.is_some());
        let result = result.unwrap();
        assert_eq!(result.status, TaskStatus::Completed);
        
        // Check that all dependencies were executed
        let results = scheduler.results.lock().await;
        assert_eq!(results.len(), 4);
        assert!(results.contains_key("task1"));
        assert!(results.contains_key("task2"));
        assert!(results.contains_key("task3"));
        assert!(results.contains_key("task4"));
    }
}
