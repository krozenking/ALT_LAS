use std::collections::HashMap;
use std::sync::Arc;
use log::{info, error, warn, debug};
use tokio::sync::{Mutex, mpsc};
// use tokio::time::{timeout, Duration}; // Removed unused imports
// use uuid::Uuid; // Removed unused import
// use chrono::Utc; // Removed unused import

use crate::alt_file::models::AltFile; // Removed unused Task as AltTask
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
            // Use the from_alt_task constructor which initializes all fields
            let task_execution = TaskExecution::from_alt_task(task);
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
                    let task_clone = task.clone(); // Removed mut
                    
                    // Clone results for task
                    let results = self.results.clone();
                    
                    // Clone tx for task
                    let tx_clone = tx.clone();
                    
                    // Clone executor for the spawned task
                    let _executor_clone = self.executor.clone(); // Mark as unused
                    
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
                            } else {
                                // Handle missing dependency result (should not happen if logic is correct)
                                error!("Missing dependency result for task {} dependency {}", task_clone.task_id, dep_id);
                                let mut failed_result = TaskResult::new(task_clone.task_id.clone());
                                failed_result.mark_failed(format!("Missing dependency result: {}", dep_id));
                                // Store result
                                {
                                    let mut results_lock_inner = results.lock().await;
                                    results_lock_inner.insert(task_clone.task_id.clone(), failed_result.clone());
                                }
                                // Notify completion
                                let _ = tx_clone.send((task_clone.task_id.clone(), failed_result.status.clone())).await;
                                return; // Stop execution for this task
                            }
                        }
                        
                        drop(results_lock); // Release lock before execution
                        
                        // Execute task using associated function syntax
                        let result = TaskExecutor::execute_task(task_clone.clone(), dependency_results).await;
                        
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
                        // Check for retry logic here if needed before cancelling
                        warn!("Task {} failed or timed out, cancelling dependents.", completed_task_id);
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
                                        // Check if task was already cancelled
                                        let results_lock = self.results.lock().await;
                                        let is_cancelled = results_lock.get(dependent_id)
                                            .map_or(false, |r| r.status == TaskStatus::Cancelled);
                                        drop(results_lock);
                                        
                                        if !is_cancelled {
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
    }
    
    /// Cancels tasks that depend on a failed task
    async fn cancel_dependent_tasks(&self, failed_task_id: &str, dependency_graph: &HashMap<String, Vec<String>>) {
        let mut to_cancel = Vec::new();
        let mut queue = Vec::new();
        
        // Find direct dependents
        if let Some(dependents) = dependency_graph.get(failed_task_id) {
            queue.extend(dependents.clone());
        }
        
        // Process all dependents recursively using BFS
        while let Some(task_id) = queue.pop() {
            if !to_cancel.contains(&task_id) {
                to_cancel.push(task_id.clone());
                if let Some(dependents) = dependency_graph.get(&task_id) {
                    queue.extend(dependents.clone());
                }
            }
        }
        
        // Cancel all dependent tasks
        let mut results = self.results.lock().await;
        for task_id in to_cancel {
            // Only cancel if not already completed or failed
            if !results.contains_key(&task_id) || 
               (results.get(&task_id).unwrap().status != TaskStatus::Completed && 
                results.get(&task_id).unwrap().status != TaskStatus::Failed &&
                results.get(&task_id).unwrap().status != TaskStatus::Cancelled) {
                
                let task_id_clone = task_id.clone(); // Clone task_id before moving it
                let mut result = TaskResult::new(task_id_clone.clone());
                let error_msg = format!("Cancelled due to dependency failure: {}", failed_task_id);
                result.mark_cancelled(error_msg.clone());
                results.insert(task_id_clone, result);
                info!("Cancelled task {} due to dependency failure: {}", task_id, failed_task_id);
            }
        }
    }
    
    /// Executes a single task with its dependencies (Recursive approach)
    pub async fn execute_single_task(&self, 
                                    alt_file: &AltFile, 
                                    task_id: &str) -> Option<TaskResult> {
        info!("Executing single task (recursive): {} from ALT file: {}", task_id, alt_file.id);
        
        // Check if result already exists
        {
            let results_lock = self.results.lock().await;
            if let Some(existing_result) = results_lock.get(task_id) {
                debug!("Task {} already executed with status {:?}", task_id, existing_result.status);
                return Some(existing_result.clone());
            }
        }
        
        // Find the task
        let task = match alt_file.tasks.iter().find(|t| t.id == task_id) {
            Some(t) => t,
            None => {
                error!("Task not found: {}", task_id);
                return None;
            }
        };
        
        // Create task execution
        let task_execution = TaskExecution::from_alt_task(task);
        
        // Execute dependencies first if any
        let mut dependency_results = HashMap::new();
        
        // Use Box::pin to handle recursion in async function
        if let Some(deps) = &task.dependencies {
            for dep_id in deps {
                let dep_result = Box::pin(self.execute_single_task(alt_file, dep_id)).await;
                match dep_result {
                    Some(dep_result) => {
                        if dep_result.status != TaskStatus::Completed {
                            // Dependency failed or was cancelled
                            let mut result = TaskResult::new(task_id.to_string());
                            result.mark_failed(format!("Dependency {} failed or cancelled ({:?})", dep_id, dep_result.status));
                            // Store the failure result for this task
                            {
                                let mut results = self.results.lock().await;
                                results.insert(task_id.to_string(), result.clone());
                            }
                            return Some(result);
                        }
                        dependency_results.insert(dep_id.clone(), dep_result);
                    },
                    None => {
                        // Dependency not found (should not happen if ALT file is valid)
                        let mut result = TaskResult::new(task_id.to_string());
                        result.mark_failed(format!("Dependency {} not found", dep_id));
                        // Store the failure result for this task
                        {
                            let mut results = self.results.lock().await;
                            results.insert(task_id.to_string(), result.clone());
                        }
                        return Some(result);
                    }
                }
            }
        }
        
        // Execute the task using associated function syntax
        let result = TaskExecutor::execute_task(task_execution, dependency_results).await;
        
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
    use crate::alt_file::models::{AltFile, Task, Priority};
    use serde_json::json;
    
    fn create_test_alt_file() -> AltFile {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
        // Task 1: No dependencies
        let task1 = Task {
            id: "task1".to_string(),
            name: "Task 1".to_string(),
            description: "First task".to_string(),
            task_type: "test".to_string(),
            parameters: json!({"param1": "value1"}),
            dependencies: None,
            priority: Priority::Normal,
            timeout_seconds: Some(10),
            retry_count: Some(0),
            retry_delay_seconds: Some(0),
        };
        
        // Task 2: Depends on Task 1
        let task2 = Task {
            id: "task2".to_string(),
            name: "Task 2".to_string(),
            description: "Second task".to_string(),
            task_type: "test".to_string(),
            parameters: json!({"param2": "value2"}),
            dependencies: Some(vec!["task1".to_string()]),
            priority: Priority::Normal,
            timeout_seconds: Some(10),
            retry_count: Some(0),
            retry_delay_seconds: Some(0),
        };
        
        // Task 3: Depends on Task 2
        let task3 = Task {
            id: "task3".to_string(),
            name: "Task 3".to_string(),
            description: "Third task".to_string(),
            task_type: "test".to_string(),
            parameters: json!({"param3": "value3"}),
            dependencies: Some(vec!["task2".to_string()]),
            priority: Priority::Normal,
            timeout_seconds: Some(10),
            retry_count: Some(0),
            retry_delay_seconds: Some(0),
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        alt_file.add_task(task3);
        
        alt_file
    }
    
    // Add tests here
}
