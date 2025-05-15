use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Represents the mode in which the ALT file should be processed
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AltMode {
    Normal,
    Dream,
    Explore,
    Chaos,
}

impl Default for AltMode {
    fn default() -> Self {
        AltMode::Normal
    }
}

/// Represents the priority level of an ALT file or task
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

impl Default for Priority {
    fn default() -> Self {
        Priority::Medium
    }
}

/// Represents the status of a task
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

impl Default for TaskStatus {
    fn default() -> Self {
        TaskStatus::Pending
    }
}

/// Represents a task to be executed
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Task {
    pub id: String,
    pub description: String,
    pub dependencies: Option<Vec<String>>,
    pub parameters: Option<HashMap<String, serde_json::Value>>,
    pub timeout_seconds: Option<u32>,
    pub retry_count: Option<u8>,
    pub status: Option<TaskStatus>,
    pub priority: Option<Priority>,
    pub tags: Option<Vec<String>>,
}

/// Represents the main ALT file structure
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AltFile {
    pub id: String,
    pub version: String,
    pub created_at: DateTime<Utc>,
    pub title: String,
    pub description: Option<String>,
    pub mode: Option<AltMode>,
    pub persona: Option<String>,
    pub tasks: Vec<Task>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    pub priority: Option<Priority>,
    pub tags: Option<Vec<String>>,
    pub expected_completion_time: Option<u32>,
}

impl AltFile {
    /// Creates a new ALT file with default values
    pub fn new(title: String) -> Self {
        AltFile {
            id: Uuid::new_v4().to_string(),
            version: "1.0".to_string(),
            created_at: Utc::now(),
            title,
            description: None,
            mode: Some(AltMode::default()),
            persona: Some("technical_expert".to_string()),
            tasks: Vec::new(),
            metadata: Some(HashMap::new()),
            priority: Some(Priority::default()),
            tags: None,
            expected_completion_time: None,
        }
    }

    /// Adds a task to the ALT file
    pub fn add_task(&mut self, task: Task) {
        self.tasks.push(task);
    }

    /// Gets a task by ID
    pub fn get_task(&self, task_id: &str) -> Option<&Task> {
        self.tasks.iter().find(|task| task.id == task_id)
    }

    /// Gets all tasks that have no dependencies
    pub fn get_root_tasks(&self) -> Vec<&Task> {
        self.tasks
            .iter()
            .filter(|task| task.dependencies.is_none() || task.dependencies.as_ref().unwrap().is_empty())
            .collect()
    }

    /// Gets all tasks that depend on a specific task
    pub fn get_dependent_tasks(&self, task_id: &str) -> Vec<&Task> {
        self.tasks
            .iter()
            .filter(|task| {
                if let Some(deps) = &task.dependencies {
                    deps.contains(&task_id.to_string())
                } else {
                    false
                }
            })
            .collect()
    }
    
    /// Gets all tasks with a specific tag
    pub fn get_tasks_by_tag(&self, tag: &str) -> Vec<&Task> {
        self.tasks
            .iter()
            .filter(|task| {
                if let Some(tags) = &task.tags {
                    tags.contains(&tag.to_string())
                } else {
                    false
                }
            })
            .collect()
    }
    
    /// Gets all tasks with a specific priority
    pub fn get_tasks_by_priority(&self, priority: &Priority) -> Vec<&Task> {
        self.tasks
            .iter()
            .filter(|task| {
                if let Some(task_priority) = &task.priority {
                    task_priority == priority
                } else {
                    false
                }
            })
            .collect()
    }
    
    /// Gets all tasks with a specific status
    pub fn get_tasks_by_status(&self, status: &TaskStatus) -> Vec<&Task> {
        self.tasks
            .iter()
            .filter(|task| {
                if let Some(task_status) = &task.status {
                    task_status == status
                } else {
                    false
                }
            })
            .collect()
    }
    
    /// Updates the status of a task
    pub fn update_task_status(&mut self, task_id: &str, status: TaskStatus) -> bool {
        if let Some(task) = self.tasks.iter_mut().find(|t| t.id == task_id) {
            task.status = Some(status);
            true
        } else {
            false
        }
    }
}

/// Creates a new task with the given description
pub fn create_task(description: String) -> Task {
    Task {
        id: Uuid::new_v4().to_string(),
        description,
        dependencies: None,
        parameters: None,
        timeout_seconds: None,
        retry_count: None,
        status: Some(TaskStatus::default()),
        priority: Some(Priority::default()),
        tags: None,
    }
}
