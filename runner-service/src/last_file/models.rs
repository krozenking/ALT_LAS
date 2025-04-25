use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::alt_file::models::AltMode;
use crate::task_manager::models::{TaskResult, TaskStatus};

/// Represents the main LAST file structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LastFile {
    pub id: String,
    pub version: String,
    pub created_at: DateTime<Utc>,
    pub alt_file_id: String,
    pub alt_file_title: String,
    pub execution_id: String,
    pub status: LastFileStatus,
    pub mode: AltMode,
    pub persona: Option<String>,
    pub task_results: HashMap<String, TaskResult>,
    pub summary: Option<String>,
    pub success_rate: f32,
    pub execution_time_ms: u64,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// Represents the status of a LAST file
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum LastFileStatus {
    Success,
    PartialSuccess,
    Failure,
}

impl LastFile {
    /// Creates a new LAST file from an ALT file
    pub fn new(
        alt_file_id: String,
        alt_file_title: String,
        mode: AltMode,
        persona: Option<String>,
    ) -> Self {
        LastFile {
            id: format!("last_{}", Uuid::new_v4().to_string()),
            version: "1.0".to_string(),
            created_at: Utc::now(),
            alt_file_id,
            alt_file_title,
            execution_id: Uuid::new_v4().to_string(),
            status: LastFileStatus::Success, // Default, will be updated based on task results
            mode,
            persona,
            task_results: HashMap::new(),
            summary: None,
            success_rate: 0.0,
            execution_time_ms: 0,
            metadata: Some(HashMap::new()),
        }
    }

    /// Adds a task result to the LAST file
    pub fn add_task_result(&mut self, task_result: TaskResult) {
        self.task_results.insert(task_result.task_id.clone(), task_result);
    }

    /// Adds multiple task results to the LAST file
    pub fn add_task_results(&mut self, task_results: HashMap<String, TaskResult>) {
        for (_, result) in task_results {
            self.add_task_result(result);
        }
    }

    /// Calculates the success rate and updates the status
    pub fn calculate_success_rate(&mut self) {
        if self.task_results.is_empty() {
            self.success_rate = 0.0;
            self.status = LastFileStatus::Failure;
            return;
        }

        let total_tasks = self.task_results.len() as f32;
        let successful_tasks = self.task_results.values()
            .filter(|result| result.status == TaskStatus::Completed)
            .count() as f32;

        self.success_rate = successful_tasks / total_tasks;

        // Update status based on success rate
        if self.success_rate >= 0.9 {
            self.status = LastFileStatus::Success;
        } else if self.success_rate > 0.0 {
            self.status = LastFileStatus::PartialSuccess;
        } else {
            self.status = LastFileStatus::Failure;
        }
    }

    /// Calculates the total execution time
    pub fn calculate_execution_time(&mut self) {
        let mut total_time: u64 = 0;

        for result in self.task_results.values() {
            if let Some(duration) = result.duration_ms {
                total_time += duration;
            }
        }

        self.execution_time_ms = total_time;
    }

    /// Adds metadata to the LAST file
    pub fn add_metadata(&mut self, key: &str, value: serde_json::Value) {
        if let Some(metadata) = &mut self.metadata {
            metadata.insert(key.to_string(), value);
        } else {
            let mut metadata = HashMap::new();
            metadata.insert(key.to_string(), value);
            self.metadata = Some(metadata);
        }
    }

    /// Generates a summary of the LAST file
    pub fn generate_summary(&mut self) {
        let total_tasks = self.task_results.len();
        let successful_tasks = self.task_results.values()
            .filter(|result| result.status == TaskStatus::Completed)
            .count();
        let failed_tasks = self.task_results.values()
            .filter(|result| result.status == TaskStatus::Failed)
            .count();
        let cancelled_tasks = self.task_results.values()
            .filter(|result| result.status == TaskStatus::Cancelled)
            .count();
        let timeout_tasks = self.task_results.values()
            .filter(|result| result.status == TaskStatus::Timeout)
            .count();

        let summary = format!(
            "Execution Summary:\n\
            - ALT File: {}\n\
            - Execution ID: {}\n\
            - Mode: {:?}\n\
            - Total Tasks: {}\n\
            - Successful Tasks: {}\n\
            - Failed Tasks: {}\n\
            - Cancelled Tasks: {}\n\
            - Timeout Tasks: {}\n\
            - Success Rate: {:.2}%\n\
            - Total Execution Time: {}ms",
            self.alt_file_title,
            self.execution_id,
            self.mode,
            total_tasks,
            successful_tasks,
            failed_tasks,
            cancelled_tasks,
            timeout_tasks,
            self.success_rate * 100.0,
            self.execution_time_ms
        );

        self.summary = Some(summary);
    }
}
