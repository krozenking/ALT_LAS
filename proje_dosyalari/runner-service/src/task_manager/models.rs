use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Represents the status of a task execution
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
    Timeout,
}

impl Default for TaskStatus {
    fn default() -> Self {
        TaskStatus::Pending
    }
}

/// Represents the result of a task execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResult {
    pub task_id: String,
    pub execution_id: String,
    pub status: TaskStatus,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_ms: Option<u64>,
    pub output: Option<serde_json::Value>,
    pub error: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

impl TaskResult {
    /// Creates a new task result with pending status
    pub fn new(task_id: String) -> Self {
        TaskResult {
            task_id,
            execution_id: Uuid::new_v4().to_string(),
            status: TaskStatus::Pending,
            start_time: Utc::now(),
            end_time: None,
            duration_ms: None,
            output: None,
            error: None,
            metadata: Some(HashMap::new()),
        }
    }

    /// Marks the task as running
    pub fn mark_running(&mut self) {
        self.status = TaskStatus::Running;
    }

    /// Marks the task as completed with output
    pub fn mark_completed(&mut self, output: serde_json::Value) {
        self.status = TaskStatus::Completed;
        self.end_time = Some(Utc::now());
        self.duration_ms = Some(self.calculate_duration());
        self.output = Some(output);
    }

    /// Marks the task as failed with error
    pub fn mark_failed(&mut self, error: String) {
        self.status = TaskStatus::Failed;
        self.end_time = Some(Utc::now());
        self.duration_ms = Some(self.calculate_duration());
        self.error = Some(error);
    }

    /// Marks the task as cancelled
    pub fn mark_cancelled(&mut self, error: String) {
        self.status = TaskStatus::Cancelled;
        self.end_time = Some(Utc::now());
        self.duration_ms = Some(self.calculate_duration());
        self.error = Some(error);
    }

    /// Marks the task as timed out
    pub fn mark_timeout(&mut self, error: String) {
        self.status = TaskStatus::Timeout;
        self.end_time = Some(Utc::now());
        self.duration_ms = Some(self.calculate_duration());
        self.error = Some(error);
    }

    /// Calculates the duration of the task execution in milliseconds
    fn calculate_duration(&self) -> u64 {
        let end = self.end_time.unwrap_or_else(Utc::now);
        let duration = end.signed_duration_since(self.start_time);
        duration.num_milliseconds() as u64
    }

    /// Adds metadata to the task result
    pub fn add_metadata(&mut self, key: &str, value: serde_json::Value) {
        if let Some(metadata) = &mut self.metadata {
            metadata.insert(key.to_string(), value);
        } else {
            let mut metadata = HashMap::new();
            metadata.insert(key.to_string(), value);
            self.metadata = Some(metadata);
        }
    }
}

/// Represents a task execution with its dependencies
#[derive(Debug, Clone)]
pub struct TaskExecution {
    pub task_id: String,
    pub description: String,
    pub dependencies: Vec<String>,
    pub parameters: Option<HashMap<String, serde_json::Value>>,
    pub timeout_seconds: Option<u32>,
    pub retry_count: Option<u8>,
    pub current_retry: u8,
    pub result: TaskResult,
}

impl TaskExecution {
    /// Creates a new task execution from an alt_file::Task
    pub fn from_alt_task(task: &crate::alt_file::models::Task) -> Self {
        let dependencies = task.dependencies.clone().unwrap_or_else(Vec::new);
        
        TaskExecution {
            task_id: task.id.clone(),
            description: task.description.clone(),
            dependencies,
            parameters: task.parameters.clone(),
            timeout_seconds: task.timeout_seconds,
            retry_count: task.retry_count,
            current_retry: 0,
            result: TaskResult::new(task.id.clone()),
        }
    }

    /// Checks if all dependencies are completed
    pub fn are_dependencies_completed(&self, results: &HashMap<String, TaskResult>) -> bool {
        for dep_id in &self.dependencies {
            if let Some(result) = results.get(dep_id) {
                if result.status != TaskStatus::Completed {
                    return false;
                }
            } else {
                return false;
            }
        }
        true
    }

    /// Checks if the task should be retried
    pub fn should_retry(&self) -> bool {
        if let Some(retry_count) = self.retry_count {
            self.current_retry < retry_count && 
            (self.result.status == TaskStatus::Failed || self.result.status == TaskStatus::Timeout)
        } else {
            false
        }
    }
}
