use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use log::{info, warn, error};

use crate::alt_file::AltFile;
use super::models::{TaskExecution, TaskResult, TaskStatus};
use super::executor::TaskExecutor;

/// Scheduler for managing parallel task execution
pub struct TaskScheduler {
    /// Map of task ID to task execution
    tasks: HashMap<String, TaskExecution>,
    /// Map of task ID to task result
    results: Arc<Mutex<HashMap<String, TaskResult>>>,
    /// Set of task IDs that are ready to be executed
    ready_tasks: HashSet<String>,
    /// Set of task IDs that are currently running
    running_tasks: HashSet<String>,
    /// Set of task IDs that have completed execution
    completed_tasks: HashSet<String>,
    /// Maximum number of concurrent tasks
    max_concurrent_tasks: usize,
    /// Task executor for running tasks
    executor: TaskExecutor,
}

impl TaskScheduler {
    /// Creates a new task scheduler
    pub fn new(max_concurrent_tasks: usize) -> Self {
        TaskScheduler {
            tasks: HashMap::new(),
            results: Arc::new(Mutex::new(HashMap::new())),
            ready_tasks: HashSet::new(),
            running_tasks: HashSet::new(),
            completed_tasks: HashSet::new(),
            max_concurrent_tasks,
            executor: TaskExecutor::new(),
        }
    }

    /// Initializes the scheduler with tasks from an ALT file
    pub fn initialize_from_alt_file(&mut self, alt_file: &AltFile) {
        info!("Initializing scheduler with {} tasks from ALT file", alt_file.tasks.len());
        
        // Clear existing state
        self.tasks.clear();
        self.results.lock().unwrap().clear();
        self.ready_tasks.clear();
        self.running_tasks.clear();
        self.completed_tasks.clear();
        
        // Create task executions from ALT file tasks
        for task in &alt_file.tasks {
            let task_execution = TaskExecution::from_alt_task(task);
            self.tasks.insert(task.id.clone(), task_execution);
            
            // Initialize task result
            let task_result = TaskResult::new(task.id.clone());
            self.results.lock().unwrap().insert(task.id.clone(), task_result);
        }
        
        // Identify initial ready tasks (those with no dependencies)
        for task in &alt_file.tasks {
            if task.dependencies.is_none() || task.dependencies.as_ref().unwrap().is_empty() {
                self.ready_tasks.insert(task.id.clone());
            }
        }
        
        info!("Scheduler initialized with {} ready tasks", self.ready_tasks.len());
    }

    /// Runs all tasks in the scheduler
    pub async fn run_all_tasks(&mut self) -> HashMap<String, TaskResult> {
        info!("Starting execution of all tasks");
        
        // Create channels for task completion notifications
        let (tx, mut rx) = mpsc::channel(100);
        
        // Clone results for async access
        let results_clone = Arc::clone(&self.results);
        
        // Main execution loop
        while !self.is_execution_complete() {
            // Start ready tasks up to max_concurrent_tasks
            self.start_ready_tasks(tx.clone()).await;
            
            // Wait for task completion
            if let Some((task_id, result)) = rx.recv().await {
                // Update task result
                self.update_task_result(&task_id, result);
                
                // Mark task as completed
                self.running_tasks.remove(&task_id);
                self.completed_tasks.insert(task_id.clone());
                
                // Update ready tasks
                self.update_ready_tasks();
            }
        }
        
        info!("All tasks completed");
        
        // Return final results
        results_clone.lock().unwrap().clone()
    }

    /// Starts ready tasks up to max_concurrent_tasks
    async fn start_ready_tasks(&mut self, tx: mpsc::Sender<(String, TaskResult)>) {
        // Calculate how many new tasks we can start
        let available_slots = self.max_concurrent_tasks.saturating_sub(self.running_tasks.len());
        
        if available_slots == 0 {
            return;
        }
        
        // Get ready tasks to start
        let tasks_to_start: Vec<String> = self.ready_tasks.iter()
            .take(available_slots)
            .cloned()
            .collect();
        
        // Start each task
        for task_id in tasks_to_start {
            if let Some(task) = self.tasks.get(&task_id) {
                info!("Starting task: {}", task_id);
                
                // Clone task for execution
                let task_clone = task.clone();
                
                // Get dependency results
                let dependency_results = self.get_dependency_results(&task.dependencies);
                
                // Update task status to running
                if let Some(result) = self.results.lock().unwrap().get_mut(&task_id) {
                    result.mark_running();
                }
                
                // Move task from ready to running
                self.ready_tasks.remove(&task_id);
                self.running_tasks.insert(task_id.clone());
                
                // Clone sender for task
                let tx_clone = tx.clone();
                let task_id_clone = task_id.clone();
                
                // Execute task asynchronously
                tokio::spawn(async move {
                    let result = TaskExecutor::execute_task(task_clone, dependency_results).await;
                    let _ = tx_clone.send((task_id_clone, result)).await;
                });
            }
        }
    }

    /// Updates the task result
    fn update_task_result(&mut self, task_id: &str, result: TaskResult) {
        if let Some(mut task_execution) = self.tasks.get_mut(task_id) {
            // Check if we need to retry the task
            task_execution.result = result.clone();
            
            if task_execution.should_retry() {
                warn!("Retrying task: {} (attempt {})", task_id, task_execution.current_retry + 1);
                task_execution.current_retry += 1;
                
                // Reset result for retry
                task_execution.result = TaskResult::new(task_id.to_string());
                
                // Move task back to ready
                self.ready_tasks.insert(task_id.to_string());
                self.running_tasks.remove(task_id);
            } else {
                // Update final result
                self.results.lock().unwrap().insert(task_id.to_string(), result);
            }
        }
    }

    /// Updates the set of ready tasks based on completed tasks
    fn update_ready_tasks(&mut self) {
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
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: None,
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
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
        };
        
        let task2 = Task {
            id: "task2".to_string(),
            description: "Second task".to_string(),
            dependencies: Some(vec!["task1".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
        };
        
        let task3 = Task {
            id: "task3".to_string(),
            description: "Third task".to_string(),
            dependencies: Some(vec!["task2".to_string()]),
            parameters: None,
            timeout_seconds: None,
            retry_count: None,
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
}
