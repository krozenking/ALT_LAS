use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};
use tokio::sync::Semaphore;
use tokio::time::{timeout, Duration};
use log::{info, error, warn, debug};
use serde_json::json;

use crate::alt_file::models::{AltFile, Task, Priority};
use super::models::{TaskExecution, TaskResult, TaskStatus};
use super::executor::TaskExecutor;

/// Task scheduler for managing parallel task execution
pub struct TaskScheduler {
    tasks: HashMap<String, TaskExecution>,
    ready_tasks: HashSet<String>,
    running_tasks: HashSet<String>,
    completed_tasks: HashSet<String>,
    failed_tasks: HashSet<String>,
    results: Arc<Mutex<HashMap<String, TaskResult>>>,
    max_concurrent_tasks: usize,
    semaphore: Arc<Semaphore>,
    priority_queue: bool,
}

impl TaskScheduler {
    /// Creates a new task scheduler with the specified concurrency limit
    pub fn new(max_concurrent_tasks: usize) -> Self {
        TaskScheduler {
            tasks: HashMap::new(),
            ready_tasks: HashSet::new(),
            running_tasks: HashSet::new(),
            completed_tasks: HashSet::new(),
            failed_tasks: HashSet::new(),
            results: Arc::new(Mutex::new(HashMap::new())),
            max_concurrent_tasks,
            semaphore: Arc::new(Semaphore::new(max_concurrent_tasks)),
            priority_queue: false,
        }
    }
    
    /// Creates a new task scheduler with priority-based scheduling
    pub fn new_with_priority(max_concurrent_tasks: usize) -> Self {
        let mut scheduler = Self::new(max_concurrent_tasks);
        scheduler.priority_queue = true;
        scheduler
    }
    
    /// Initializes the scheduler with tasks from an ALT file
    pub fn initialize_from_alt_file(&mut self, alt_file: &AltFile) {
        info!("Initializing scheduler with {} tasks from ALT file", alt_file.tasks.len());
        
        // Clear existing state
        self.tasks.clear();
        self.ready_tasks.clear();
        self.running_tasks.clear();
        self.completed_tasks.clear();
        self.failed_tasks.clear();
        self.results.lock().unwrap().clear();
        
        // Add tasks from ALT file
        for task in &alt_file.tasks {
            let task_execution = TaskExecution::from_alt_task(task);
            self.tasks.insert(task.id.clone(), task_execution);
        }
        
        // Initialize ready tasks (those with no dependencies)
        for task in &alt_file.tasks {
            if task.dependencies.is_none() || task.dependencies.as_ref().unwrap().is_empty() {
                self.ready_tasks.insert(task.id.clone());
            }
        }
        
        info!("Scheduler initialized with {} ready tasks", self.ready_tasks.len());
    }
    
    /// Adds a single task to the scheduler
    pub fn add_task(&mut self, task: TaskExecution) {
        info!("Adding task to scheduler: {}", task.task_id);
        
        // Check if task has no dependencies
        if task.dependencies.is_empty() {
            self.ready_tasks.insert(task.task_id.clone());
        }
        
        // Add task to tasks map
        self.tasks.insert(task.task_id.clone(), task);
    }
    
    /// Gets the next ready task based on scheduling policy
    fn get_next_ready_task(&self) -> Option<String> {
        if self.ready_tasks.is_empty() {
            return None;
        }
        
        if !self.priority_queue {
            // Simple FIFO scheduling
            return self.ready_tasks.iter().next().cloned();
        } else {
            // Priority-based scheduling
            let mut highest_priority_task: Option<(String, Priority)> = None;
            
            for task_id in &self.ready_tasks {
                if let Some(task) = self.tasks.get(task_id) {
                    // Get task priority from parameters
                    let priority = task.parameters.as_ref()
                        .and_then(|p| p.get("priority"))
                        .and_then(|p| {
                            if let Some(p_str) = p.as_str() {
                                match p_str {
                                    "critical" => Some(Priority::Critical),
                                    "high" => Some(Priority::High),
                                    "medium" => Some(Priority::Medium),
                                    "low" => Some(Priority::Low),
                                    _ => Some(Priority::Medium),
                                }
                            } else {
                                None
                            }
                        })
                        .unwrap_or(Priority::Medium);
                    
                    // Update highest priority task
                    if let Some((_, current_highest)) = &highest_priority_task {
                        if priority > *current_highest {
                            highest_priority_task = Some((task_id.clone(), priority));
                        }
                    } else {
                        highest_priority_task = Some((task_id.clone(), priority));
                    }
                }
            }
            
            highest_priority_task.map(|(task_id, _)| task_id)
        }
    }
    
    /// Runs all tasks in the scheduler
    pub async fn run_all_tasks(&mut self) -> HashMap<String, TaskResult> {
        info!("Running all tasks with max concurrency: {}", self.max_concurrent_tasks);
        
        // Process tasks until all are completed or failed
        while !self.is_execution_complete() {
            // Update ready tasks based on completed dependencies
            self.update_ready_tasks();
            
            // Start as many tasks as possible up to concurrency limit
            self.start_ready_tasks().await;
            
            // Wait a bit before checking again
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        
        info!("All tasks completed. Successful: {}, Failed: {}", 
              self.completed_tasks.len() - self.failed_tasks.len(), 
              self.failed_tasks.len());
        
        // Return all results
        self.results.lock().unwrap().clone()
    }
    
    /// Runs a specific task and its dependencies
    pub async fn run_task(&mut self, task_id: &str) -> Option<TaskResult> {
        info!("Running task {} and its dependencies", task_id);
        
        // Check if task exists
        if !self.tasks.contains_key(task_id) {
            error!("Task not found: {}", task_id);
            return None;
        }
        
        // Build dependency graph
        let mut dependencies = HashSet::new();
        self.collect_dependencies(task_id, &mut dependencies);
        
        // Add the task itself
        dependencies.insert(task_id.to_string());
        
        info!("Task {} requires {} tasks (including dependencies)", task_id, dependencies.len());
        
        // Run only the required tasks
        while !self.is_task_complete(task_id) {
            // Update ready tasks based on completed dependencies
            self.update_ready_tasks();
            
            // Start only tasks that are in our dependency graph
            let ready_tasks: Vec<String> = self.ready_tasks.iter()
                .filter(|id| dependencies.contains(*id))
                .cloned()
                .collect();
            
            for ready_task_id in ready_tasks {
                if self.running_tasks.len() < self.max_concurrent_tasks {
                    self.start_task(&ready_task_id).await;
                } else {
                    break;
                }
            }
            
            // Wait a bit before checking again
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        
        // Return the result for the requested task
        self.results.lock().unwrap().get(task_id).cloned()
    }
    
    /// Collects all dependencies for a task recursively
    fn collect_dependencies(&self, task_id: &str, dependencies: &mut HashSet<String>) {
        if let Some(task) = self.tasks.get(task_id) {
            for dep_id in &task.dependencies {
                if dependencies.insert(dep_id.clone()) {
                    // Recursively collect dependencies of this dependency
                    self.collect_dependencies(dep_id, dependencies);
                }
            }
        }
    }
    
    /// Checks if a specific task is complete
    fn is_task_complete(&self, task_id: &str) -> bool {
        self.completed_tasks.contains(task_id)
    }
    
    /// Starts as many ready tasks as possible up to the concurrency limit
    async fn start_ready_tasks(&mut self) {
        while self.running_tasks.len() < self.max_concurrent_tasks && !self.ready_tasks.is_empty() {
            // Get next task based on scheduling policy
            if let Some(task_id) = self.get_next_ready_task() {
                self.start_task(&task_id).await;
            } else {
                break;
            }
        }
    }
    
    /// Starts a specific task
    async fn start_task(&mut self, task_id: &str) {
        // Move task from ready to running
        self.ready_tasks.remove(task_id);
        self.running_tasks.insert(task_id.clone());
        
        // Clone task for execution
        let task = self.tasks.get(task_id).unwrap().clone();
        
        // Get dependency results
        let dependency_results = self.get_dependency_results(&task.dependencies);
        
        // Clone results Arc for the task
        let results = self.results.clone();
        
        // Clone semaphore for the task
        let semaphore = self.semaphore.clone();
        
        info!("Starting task: {}", task_id);
        
        // Spawn task execution
        tokio::spawn(async move {
            // Acquire a permit from the semaphore
            let _permit = semaphore.acquire_owned().await.unwrap();
            
            // Execute the task
            let task_result = TaskExecutor::execute_task(task, dependency_results).await;
            
            // Update results
            results.lock().unwrap().insert(task_id.clone(), task_result);
        });
    }
    
    /// Updates the list of ready tasks based on completed tasks
    fn update_ready_tasks(&mut self) {
        // Update completed and failed tasks based on results
        let results = self.results.lock().unwrap();
        for (task_id, result) in results.iter() {
            if self.running_tasks.contains(task_id) {
                if result.status == TaskStatus::Completed || 
                   result.status == TaskStatus::Failed || 
                   result.status == TaskStatus::Timeout || 
                   result.status == TaskStatus::Cancelled {
                    
                    // Move from running to completed
                    self.running_tasks.remove(task_id);
                    self.completed_tasks.insert(task_id.clone());
                    
                    // Track failed tasks separately
                    if result.status != TaskStatus::Completed {
                        self.failed_tasks.insert(task_id.clone());
                    }
                    
                    info!("Task completed: {} with status: {:?}", task_id, result.status);
                }
            }
        }
        drop(results);
        
        // Find tasks that are now ready
        let mut new_ready_tasks = Vec::new();
        
        for (task_id, task) in &self.tasks {
            // Skip tasks that are already ready, running, or completed
            if self.ready_tasks.contains(task_id) || 
               self.running_tasks.contains(task_id) || 
               self.completed_tasks.contains(task_id) {
                continue;
            }
            
            // Check if all dependencies are completed
            if task.are_dependencies_completed(&self.results.lock().unwrap()) {
                new_ready_tasks.push(task_id.clone());
            }
        }
        
        // Add new ready tasks
        for task_id in new_ready_tasks {
            info!("Task is now ready: {}", task_id);
            self.ready_tasks.insert(task_id);
        }
    }
    
    /// Gets the results of dependency tasks
    fn get_dependency_results(&self, dependencies: &[String]) -> HashMap<String, TaskResult> {
        let mut results = HashMap::new();
        let all_results = self.results.lock().unwrap();
        
        for dep_id in dependencies {
            if let Some(result) = all_results.get(dep_id) {
                results.insert(dep_id.clone(), result.clone());
            }
        }
        
        results
    }
    
    /// Checks if all tasks have completed execution
    fn is_execution_complete(&self) -> bool {
        // If there are no ready or running tasks, and we have at least one task,
        // then all tasks must be completed
        self.ready_tasks.is_empty() && 
        self.running_tasks.is_empty() && 
        !self.tasks.is_empty() && 
        self.completed_tasks.len() == self.tasks.len()
    }
    
    /// Gets the current execution status
    pub fn get_execution_status(&self) -> serde_json::Value {
        json!({
            "total_tasks": self.tasks.len(),
            "ready_tasks": self.ready_tasks.len(),
            "running_tasks": self.running_tasks.len(),
            "completed_tasks": self.completed_tasks.len(),
            "failed_tasks": self.failed_tasks.len(),
            "max_concurrent_tasks": self.max_concurrent_tasks,
            "priority_queue": self.priority_queue
        })
    }
    
    /// Gets the list of completed tasks
    pub fn get_completed_tasks(&self) -> Vec<String> {
        self.completed_tasks.iter().cloned().collect()
    }
    
    /// Gets the list of failed tasks
    pub fn get_failed_tasks(&self) -> Vec<String> {
        self.failed_tasks.iter().cloned().collect()
    }
    
    /// Gets the list of running tasks
    pub fn get_running_tasks(&self) -> Vec<String> {
        self.running_tasks.iter().cloned().collect()
    }
    
    /// Gets the list of ready tasks
    pub fn get_ready_tasks(&self) -> Vec<String> {
        self.ready_tasks.iter().cloned().collect()
    }
    
    /// Cancels a running task
    pub async fn cancel_task(&mut self, task_id: &str) -> bool {
        if !self.running_tasks.contains(task_id) {
            return false;
        }
        
        info!("Cancelling task: {}", task_id);
        
        // Mark task as cancelled in results
        let mut results = self.results.lock().unwrap();
        if let Some(result) = results.get_mut(task_id) {
            result.mark_cancelled();
        }
        
        // Move task from running to completed
        self.running_tasks.remove(task_id);
        self.completed_tasks.insert(task_id.to_string());
        self.failed_tasks.insert(task_id.to_string());
        
        true
    }
    
    /// Cancels all running tasks
    pub async fn cancel_all_tasks(&mut self) -> usize {
        let running_tasks = self.running_tasks.clone();
        let mut cancelled_count = 0;
        
        for task_id in running_tasks {
            if self.cancel_task(&task_id).await {
                cancelled_count += 1;
            }
        }
        
        info!("Cancelled {} running tasks", cancelled_count);
        cancelled_count
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::{AltFile, Task};
    
    #[tokio::test]
    async fn test_scheduler_with_simple_tasks() {
        // Create a simple ALT file with two independent tasks
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
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
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        
        // Create scheduler and run tasks
        let mut scheduler = TaskScheduler::new(2);
        scheduler.initialize_from_alt_file(&alt_file);
        
        let results = scheduler.run_all_tasks().await;
        
        // Verify results
        assert_eq!(results.len(), 2);
        assert!(results.contains_key("task1"));
        assert!(results.contains_key("task2"));
        assert_eq!(results.get("task1").unwrap().status, TaskStatus::Completed);
        assert_eq!(results.get("task2").unwrap().status, TaskStatus::Completed);
    }
    
    #[tokio::test]
    async fn test_scheduler_with_dependent_tasks() {
        // Create an ALT file with dependent tasks
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
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
        
        let task3 = Task {
            id: "task3".to_string(),
            description: "Third task".to_string(),
            dependencies: Some(vec!["task2".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        alt_file.add_task(task3);
        
        // Create scheduler and run tasks
        let mut scheduler = TaskScheduler::new(1); // Only 1 concurrent task
        scheduler.initialize_from_alt_file(&alt_file);
        
        let results = scheduler.run_all_tasks().await;
        
        // Verify results
        assert_eq!(results.len(), 3);
        assert_eq!(results.get("task1").unwrap().status, TaskStatus::Completed);
        assert_eq!(results.get("task2").unwrap().status, TaskStatus::Completed);
        assert_eq!(results.get("task3").unwrap().status, TaskStatus::Completed);
    }
    
    #[tokio::test]
    async fn test_priority_scheduler() {
        // Create an ALT file with tasks of different priorities
        let mut alt_file = AltFile::new("Priority Test ALT File".to_string());
        
        // Create tasks with different priorities
        let mut task1 = Task {
            id: "low_priority".to_string(),
            description: "Low priority task".to_string(),
            dependencies: None,
            parameters: Some(HashMap::new()),
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: Some(Priority::Low),
            tags: None,
        };
        task1.parameters.as_mut().unwrap().insert("priority".to_string(), json!("low"));
        
        let mut task2 = Task {
            id: "high_priority".to_string(),
            description: "High priority task".to_string(),
            dependencies: None,
            parameters: Some(HashMap::new()),
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: Some(Priority::High),
            tags: None,
        };
        task2.parameters.as_mut().unwrap().insert("priority".to_string(), json!("high"));
        
        let mut task3 = Task {
            id: "medium_priority".to_string(),
            description: "Medium priority task".to_string(),
            dependencies: None,
            parameters: Some(HashMap::new()),
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: Some(Priority::Medium),
            tags: None,
        };
        task3.parameters.as_mut().unwrap().insert("priority".to_string(), json!("medium"));
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        alt_file.add_task(task3);
        
        // Create priority scheduler with only 1 concurrent task
        let mut scheduler = TaskScheduler::new_with_priority(1);
        scheduler.initialize_from_alt_file(&alt_file);
        
        // The high priority task should be selected first
        let next_task = scheduler.get_next_ready_task();
        assert_eq!(next_task, Some("high_priority".to_string()));
    }
    
    #[tokio::test]
    async fn test_run_specific_task() {
        // Create an ALT file with dependent tasks
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        
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
        
        let task3 = Task {
            id: "task3".to_string(),
            description: "Third task".to_string(),
            dependencies: Some(vec!["task2".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        let task4 = Task {
            id: "task4".to_string(),
            description: "Fourth task (independent)".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
            status: None,
            priority: None,
            tags: None,
        };
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        alt_file.add_task(task3);
        alt_file.add_task(task4);
        
        // Create scheduler and run specific task
        let mut scheduler = TaskScheduler::new(2);
        scheduler.initialize_from_alt_file(&alt_file);
        
        // Run only task3 (which requires task1 and task2)
        let result = scheduler.run_task("task3").await;
        
        // Verify results
        assert!(result.is_some());
        assert_eq!(result.unwrap().status, TaskStatus::Completed);
        
        // Check that task4 was not executed
        let all_results = scheduler.results.lock().unwrap();
        assert!(!all_results.contains_key("task4"));
    }
}
