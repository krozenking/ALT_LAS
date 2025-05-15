use tokio::task;
use tokio::sync::{mpsc, Mutex};
use std::collections::{HashMap, HashSet, VecDeque};
use std::sync::Arc;
use log::{info, warn};
use async_trait::async_trait;
use std::time::{Duration};
use chrono::{DateTime, Utc};
use futures::{StreamExt};
use std::future::Future;
use std::pin::Pin;
use uuid::Uuid;
use serde_json;

use crate::alt_file::models::{AltFile, Task}; // Removed TaskStatus
use crate::task_manager::models::TaskStatus; // Import TaskStatus from task_manager::models
use crate::ai_service::AiClient;
use crate::last_file::LastFile;
use crate::task_manager::models::{TaskResult, TaskStatus as TaskManagerStatus}; // Alias TaskStatus

/// Configuration for the task manager
#[derive(Debug, Clone)]
pub struct TaskManagerConfig {
    /// Maximum number of concurrent tasks
    pub max_concurrent_tasks: usize,
    /// Default task timeout in seconds
    pub default_timeout_seconds: u64,
    /// Default number of retries for failed tasks
    pub default_retry_count: u8,
    /// Whether to enable backpressure
    pub enable_backpressure: bool,
    /// Maximum queue size for backpressure
    pub max_queue_size: usize,
    /// Whether to prioritize tasks
    pub enable_prioritization: bool,
    /// Whether to enable deadline-aware scheduling
    pub enable_deadline_scheduling: bool,
    /// Whether to enable resource-based scheduling
    pub enable_resource_scheduling: bool,
}

impl Default for TaskManagerConfig {
    fn default() -> Self {
        Self {
            max_concurrent_tasks: 4,
            default_timeout_seconds: 60,
            default_retry_count: 3,
            enable_backpressure: true,
            max_queue_size: 100,
            enable_prioritization: true,
            enable_deadline_scheduling: false,
            enable_resource_scheduling: false,
        }
    }
}

/// Status of a task execution
#[derive(Debug, Clone, PartialEq)]
pub enum TaskExecutionStatus {
    /// Task is queued
    Queued,
    /// Task is running
    Running,
    /// Task completed successfully
    Completed,
    /// Task failed
    Failed(String),
    /// Task was cancelled
    Cancelled,
    /// Task timed out
    TimedOut,
}

/// Information about a task execution
#[derive(Debug, Clone)]
pub struct TaskExecutionInfo {
    /// ID of the task
    pub task_id: String,
    /// Status of the task execution
    pub status: TaskExecutionStatus,
    /// Start time of the task execution
    pub start_time: Option<DateTime<Utc>>,
    /// End time of the task execution
    pub end_time: Option<DateTime<Utc>>,
    /// Duration of the task execution in milliseconds
    pub duration_ms: Option<u64>,
    /// Number of retries
    pub retry_count: u8,
    /// Output of the task
    pub output: Option<String>,
    /// Error message if the task failed
    pub error: Option<String>,
}

impl TaskExecutionInfo {
    /// Creates a new TaskExecutionInfo
    pub fn new(task_id: String) -> Self {
        Self {
            task_id,
            status: TaskExecutionStatus::Queued,
            start_time: None,
            end_time: None,
            duration_ms: None,
            retry_count: 0,
            output: None,
            error: None,
        }
    }
    
    /// Updates the status of the task execution
    pub fn update_status(&mut self, status: TaskExecutionStatus) {
        self.status = status;
    }
    
    /// Marks the task as started
    pub fn mark_started(&mut self) {
        self.start_time = Some(Utc::now());
        self.status = TaskExecutionStatus::Running;
    }
    
    /// Marks the task as completed
    pub fn mark_completed(&mut self, output: Option<String>) {
        self.end_time = Some(Utc::now());
        self.status = TaskExecutionStatus::Completed;
        self.output = output;

        if let (Some(start), Some(end)) = (self.start_time, self.end_time) {
            self.duration_ms = Some(end.signed_duration_since(start).num_milliseconds() as u64);
        }
    }
    
    /// Marks the task as failed
    pub fn mark_failed(&mut self, error: String) {
        self.end_time = Some(Utc::now());
        self.status = TaskExecutionStatus::Failed(error.clone());
        self.error = Some(error);

        if let (Some(start), Some(end)) = (self.start_time, self.end_time) {
            self.duration_ms = Some(end.signed_duration_since(start).num_milliseconds() as u64);
        }
    }
    
    /// Marks the task as cancelled
    pub fn mark_cancelled(&mut self) {
        self.end_time = Some(Utc::now());
        self.status = TaskExecutionStatus::Cancelled;

        if let (Some(start), Some(end)) = (self.start_time, self.end_time) {
            self.duration_ms = Some(end.signed_duration_since(start).num_milliseconds() as u64);
        }
    }
    
    /// Marks the task as timed out
    pub fn mark_timed_out(&mut self) {
        self.end_time = Some(Utc::now());
        self.status = TaskExecutionStatus::TimedOut;
        self.error = Some("Task timed out".to_string());

        if let (Some(start), Some(end)) = (self.start_time, self.end_time) {
            self.duration_ms = Some(end.signed_duration_since(start).num_milliseconds() as u64);
        }
    }
    
    /// Converts the TaskExecutionInfo to a TaskResult
    pub fn to_task_result(&self) -> TaskResult {
        let status = match &self.status {
            TaskExecutionStatus::Completed => TaskManagerStatus::Completed,
            TaskExecutionStatus::Failed(_) => TaskManagerStatus::Failed,
            TaskExecutionStatus::Cancelled => TaskManagerStatus::Cancelled,
            TaskExecutionStatus::TimedOut => TaskManagerStatus::Timeout, // Corrected mapping
            _ => TaskManagerStatus::Pending,
        };

        // Attempt to parse output string as JSON
        let output_json: Option<serde_json::Value> = self.output.as_ref().and_then(|s| {
            serde_json::from_str(s).map_err(|e| {
                warn!("Failed to parse task output as JSON for task {}: {}", self.task_id, e);
                e
            }).ok()
        });

        TaskResult {
            task_id: self.task_id.clone(),
            execution_id: Uuid::new_v4().to_string(), // Generate a new execution_id
            status,
            start_time: self.start_time.unwrap_or_else(Utc::now), // Use start_time or default
            end_time: self.end_time, // Use end_time from TaskExecutionInfo
            duration_ms: self.duration_ms,
            output: output_json, // Use parsed JSON output
            error: self.error.clone(),
            metadata: Some(HashMap::new()), // Initialize metadata
        }
    }
}

/// Trait for task handlers
#[async_trait]
pub trait TaskHandler: Send + Sync {
    /// Handles a task
    async fn handle_task(&self, task: &Task) -> Result<String, String>;
    
    /// Gets the task types that this handler can handle
    fn get_supported_task_types(&self) -> Vec<String>;
}

/// Task manager for executing tasks
pub struct TaskManager {
    config: TaskManagerConfig,
    task_handlers: HashMap<String, Box<dyn TaskHandler>>,
    task_queue: Arc<Mutex<VecDeque<Task>>>,
    task_executions: Arc<Mutex<HashMap<String, TaskExecutionInfo>>>,
    running_tasks: Arc<Mutex<HashSet<String>>>,
    task_dependencies: Arc<Mutex<HashMap<String, Vec<String>>>>,
    task_dependents: Arc<Mutex<HashMap<String, Vec<String>>>>,
    cancel_tx: mpsc::Sender<String>,
    cancel_rx: Arc<Mutex<mpsc::Receiver<String>>>,
}

impl TaskManager {
    /// Creates a new TaskManager with default configuration
    pub fn new() -> Self {
        let (cancel_tx, cancel_rx) = mpsc::channel(100);
        
        Self {
            config: TaskManagerConfig::default(),
            task_handlers: HashMap::new(),
            task_queue: Arc::new(Mutex::new(VecDeque::new())),
            task_executions: Arc::new(Mutex::new(HashMap::new())),
            running_tasks: Arc::new(Mutex::new(HashSet::new())),
            task_dependencies: Arc::new(Mutex::new(HashMap::new())),
            task_dependents: Arc::new(Mutex::new(HashMap::new())),
            cancel_tx,
            cancel_rx: Arc::new(Mutex::new(cancel_rx)),
        }
    }
    
    /// Creates a new TaskManager with custom configuration
    pub fn with_config(config: TaskManagerConfig) -> Self {
        let (cancel_tx, cancel_rx) = mpsc::channel(100);
        
        Self {
            config,
            task_handlers: HashMap::new(),
            task_queue: Arc::new(Mutex::new(VecDeque::new())),
            task_executions: Arc::new(Mutex::new(HashMap::new())),
            running_tasks: Arc::new(Mutex::new(HashSet::new())),
            task_dependencies: Arc::new(Mutex::new(HashMap::new())),
            task_dependents: Arc::new(Mutex::new(HashMap::new())),
            cancel_tx,
            cancel_rx: Arc::new(Mutex::new(cancel_rx)),
        }
    }
    
    /// Registers a task handler
    pub fn register_handler(&mut self, task_type: String, handler: Box<dyn TaskHandler>) {
        self.task_handlers.insert(task_type, handler);
    }
    
    /// Processes an ALT file
    pub async fn process_alt_file(&self, alt_file: &AltFile) -> Result<LastFile, String> {
        info!("Processing ALT file: {}", alt_file.id);
        
        // Create a new LAST file
        let mut last_file = LastFile::new(alt_file.id.clone(), alt_file.title.clone(), alt_file.mode.clone().unwrap_or_default(), alt_file.persona.clone());
        
        // Build dependency graph
        self.build_dependency_graph(alt_file).await?;
        
        // Queue all tasks
        self.queue_tasks(alt_file).await?;
        
        // Process tasks
        self.process_tasks().await?;
        
        // Collect results
        let task_executions = self.task_executions.lock().await;
        for (task_id, execution_info) in task_executions.iter() {
            let task_result = execution_info.to_task_result();
            last_file.add_task_result(task_id.clone(), task_result);
        }
        
        // Update success rate and processing time
        last_file.calculate_success_rate();
        last_file.calculate_execution_time();
        
        Ok(last_file)
    }
    
    /// Builds the dependency graph for an ALT file
    async fn build_dependency_graph(&self, alt_file: &AltFile) -> Result<(), String> {
        let mut dependencies = HashMap::new();
        let mut dependents = HashMap::new();
        
        for task in &alt_file.tasks {
            let task_id = task.id.clone();
            
            // Initialize empty vectors for this task
            dependencies.insert(task_id.clone(), Vec::new());
            dependents.insert(task_id.clone(), Vec::new());
            
            // Add dependencies
            if let Some(deps) = &task.dependencies {
                for dep_id in deps {
                    dependencies.get_mut(&task_id).unwrap().push(dep_id.clone());
                    
                    // Add this task as a dependent of its dependency
                    if !dependents.contains_key(dep_id) {
                        dependents.insert(dep_id.clone(), Vec::new());
                    }
                    dependents.get_mut(dep_id).unwrap().push(task_id.clone());
                }
            }
        }
        
        // Store the dependency graph
        *self.task_dependencies.lock().await = dependencies;
        *self.task_dependents.lock().await = dependents;
        
        Ok(())
    }
    
    /// Queues all tasks from an ALT file
    async fn queue_tasks(&self, alt_file: &AltFile) -> Result<(), String> {
        let mut task_queue = self.task_queue.lock().await;
        let mut task_executions = self.task_executions.lock().await;
        
        // Clear existing queue and executions
        task_queue.clear();
        task_executions.clear();
        
        // Add all tasks to the queue
        for task in &alt_file.tasks {
            // Create execution info
            let execution_info = TaskExecutionInfo::new(task.id.clone());
            task_executions.insert(task.id.clone(), execution_info);
            
            // Add to queue if it has no dependencies
            if task.dependencies.is_none() || task.dependencies.as_ref().unwrap().is_empty() {
                task_queue.push_back(task.clone());
            }
        }
        
        Ok(())
    }
    
    /// Processes all queued tasks
    async fn process_tasks(&self) -> Result<(), String> {
        let mut futures: Vec<Pin<Box<dyn Future<Output = Result<(), String>> + Send>>> = Vec::new();
        
        // Start worker tasks
        for _ in 0..self.config.max_concurrent_tasks {
            let worker_future = self.worker_loop();
            futures.push(Box::pin(worker_future));
        }
        
        // Start cancel listener
        let cancel_future = self.cancel_listener();
        futures.push(Box::pin(cancel_future));
        
        // Wait for all tasks to complete
        futures::future::join_all(futures).await;
        
        Ok(())
    }
    
    /// Worker loop for processing tasks
    async fn worker_loop(&self) -> Result<(), String> {
        loop {
            // Check if there are any tasks in the queue
            let task_opt = {
                let mut task_queue = self.task_queue.lock().await;
                task_queue.pop_front()
            };
            
            if let Some(task) = task_opt {
                // Process the task
                self.process_task(task).await?;
            } else {
                // Check if there are any running tasks
                let running_tasks = self.running_tasks.lock().await;
                if running_tasks.is_empty() {
                    // No more tasks to process
                    break;
                }
                
                // Wait for a short time before checking again
                tokio::time::sleep(Duration::from_millis(100)).await;
            }
        }
        
        Ok(())
    }
    
    /// Processes a single task
    async fn process_task(&self, task: Task) -> Result<(), String> {
        let task_id = task.id.clone();
        
        // Mark task as running
        {
            let mut running_tasks = self.running_tasks.lock().await;
            running_tasks.insert(task_id.clone());
            
            let mut task_executions = self.task_executions.lock().await;
            if let Some(execution_info) = task_executions.get_mut(&task_id) {
                execution_info.mark_started();
            }
        }
        
        // Get the appropriate handler for this task
        let handler_opt = {
            let task_type = task.parameters.as_ref()
                .and_then(|params| params.get("type"))
                .and_then(|value| value.as_str())
                .unwrap_or("default");
            
            self.task_handlers.get(task_type)
        };
        
        let result = if let Some(handler) = handler_opt {
            // Execute the task with timeout
            let timeout_seconds = task.timeout_seconds.unwrap_or(self.config.default_timeout_seconds as u32);
            let timeout_duration = Duration::from_secs(timeout_seconds.into());
            
            match tokio::time::timeout(timeout_duration, handler.handle_task(&task)).await {
                Ok(Ok(output)) => {
                    // Task completed successfully
                    let mut task_executions = self.task_executions.lock().await;
                    if let Some(execution_info) = task_executions.get_mut(&task_id) {
                        execution_info.mark_completed(Some(output));
                    }
                    Ok(())
                },
                Ok(Err(error)) => {
                    // Task failed
                    let retry_count = task.retry_count.unwrap_or(self.config.default_retry_count);
                    let mut task_executions = self.task_executions.lock().await;
                    
                    if let Some(execution_info) = task_executions.get_mut(&task_id) {
                        if execution_info.retry_count < retry_count {
                            // Retry the task
                            execution_info.retry_count += 1;
                            
                            // Re-queue the task
                            let mut task_queue = self.task_queue.lock().await;
                            task_queue.push_back(task);
                            
                            Ok(())
                        } else {
                            // Max retries reached, mark as failed
                            execution_info.mark_failed(error);
                            Ok(())
                        }
                    } else {
                        Err(format!("Task execution info not found for task {}", task_id))
                    }
                },
                Err(_) => {
                    // Task timed out
                    let mut task_executions = self.task_executions.lock().await;
                    if let Some(execution_info) = task_executions.get_mut(&task_id) {
                        execution_info.mark_timed_out();
                    }
                    Ok(())
                }
            }
        } else {
            // No handler found for this task
            let mut task_executions = self.task_executions.lock().await;
            if let Some(execution_info) = task_executions.get_mut(&task_id) {
                execution_info.mark_failed(format!("No handler found for task type"));
            }
            Ok(())
        };
        
        // Mark task as not running
        {
            let mut running_tasks = self.running_tasks.lock().await;
            running_tasks.remove(&task_id);
        }
        
        // Queue dependent tasks if this task completed successfully
        {
            let task_executions = self.task_executions.lock().await;
            let execution_info = task_executions.get(&task_id).unwrap();
            
            if let TaskExecutionStatus::Completed = execution_info.status {
                self.queue_dependent_tasks(&task_id).await?;
            }
        }
        
        result
    }
    
    /// Queues tasks that depend on the given task
    async fn queue_dependent_tasks(&self, task_id: &str) -> Result<(), String> {
        let dependents = {
            let task_dependents = self.task_dependents.lock().await;
            task_dependents.get(task_id).cloned().unwrap_or_default()
        };
        
        for dependent_id in dependents {
            // Check if all dependencies of this dependent are completed
            let all_dependencies_completed = {
                let task_dependencies = self.task_dependencies.lock().await;
                let task_executions = self.task_executions.lock().await;
                
                let dependencies = task_dependencies.get(&dependent_id).cloned().unwrap_or_default();
                
                dependencies.iter().all(|dep_id| {
                    if let Some(execution_info) = task_executions.get(dep_id) {
                        matches!(execution_info.status, TaskExecutionStatus::Completed)
                    } else {
                        false
                    }
                })
            };
            
            if all_dependencies_completed {
                // Get the task
                let alt_file = {
                    // In a real implementation, we would get the task from the ALT file
                    // For now, we'll create a dummy task
                    let mut task = Task {
                        id: dependent_id.clone(),
                        description: format!("Dependent task {}", dependent_id),
                        dependencies: Some(vec![task_id.to_string()]),
                        parameters: None,
                        timeout_seconds: None,
                        retry_count: None,
                        status: None,
                        priority: None,
                        tags: None,
                    };
                    
                    task
                };
                
                // Queue the task
                let mut task_queue = self.task_queue.lock().await;
                task_queue.push_back(alt_file);
            }
        }
        
        Ok(())
    }
    
    /// Cancels a task
    pub async fn cancel_task(&self, task_id: &str) -> Result<(), String> {
        // Send cancel request
        self.cancel_tx.send(task_id.to_string()).await
            .map_err(|e| format!("Failed to send cancel request: {}", e))?;
        
        Ok(())
    }
    
    /// Listener for cancel requests
    async fn cancel_listener(&self) -> Result<(), String> {
        let mut cancel_rx = self.cancel_rx.lock().await;
        
        while let Some(task_id) = cancel_rx.recv().await {
            // Mark task as cancelled
            let mut task_executions = self.task_executions.lock().await;
            if let Some(execution_info) = task_executions.get_mut(&task_id) {
                execution_info.mark_cancelled();
            }
            
            // Remove task from running tasks
            let mut running_tasks = self.running_tasks.lock().await;
            running_tasks.remove(&task_id);
        }
        
        Ok(())
    }
    
    /// Gets the status of a task
    pub async fn get_task_status(&self, task_id: &str) -> Option<TaskExecutionStatus> {
        let task_executions = self.task_executions.lock().await;
        task_executions.get(task_id).map(|info| info.status.clone())
    }
    
    /// Gets the execution info for a task
    pub async fn get_task_execution_info(&self, task_id: &str) -> Option<TaskExecutionInfo> {
        let task_executions = self.task_executions.lock().await;
        task_executions.get(task_id).cloned()
    }
    
    /// Gets all task execution infos
    pub async fn get_all_task_execution_infos(&self) -> HashMap<String, TaskExecutionInfo> {
        let task_executions = self.task_executions.lock().await;
        task_executions.clone()
    }
}
