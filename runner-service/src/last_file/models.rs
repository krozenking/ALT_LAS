use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::alt_file::models::{AltFile, AltMode, Priority}; // Removed unused Task as AltTask
use crate::task_manager::models::{TaskResult, TaskStatus};

/// Represents the overall status of the LAST file execution
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum LastFileStatus {
    Success,
    PartialSuccess,
    Failure,
}

impl Default for LastFileStatus {
    fn default() -> Self {
        LastFileStatus::Failure
    }
}

/// Represents the type of an artifact
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ArtifactType {
    File,
    Image,
    Text,
    Json,
    Log,
    Other,
}

/// Represents an artifact generated during task execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    pub id: String,
    pub name: String,
    pub artifact_type: ArtifactType,
    pub task_id: String,
    pub path: String,
    pub created_at: DateTime<Utc>,
    pub size_bytes: Option<u64>,
    pub mime_type: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// Represents a node in the execution graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionNode {
    pub id: String,
    pub task_id: String,
    pub status: TaskStatus,
    pub duration_ms: Option<u64>,
    pub start_time: Option<DateTime<Utc>>, // Changed to Option<DateTime<Utc>>
    pub end_time: Option<DateTime<Utc>>,
}

/// Represents the type of dependency between tasks
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum DependencyType {
    Required,
    Optional,
    Conditional,
}

/// Represents an edge in the execution graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionEdge {
    pub source: String, // Node ID
    pub target: String, // Node ID
    pub dependency_type: DependencyType,
}

/// Represents the execution graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionGraph {
    pub nodes: Vec<ExecutionNode>,
    pub edges: Vec<ExecutionEdge>,
}

/// Represents the main LAST file structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LastFile {
    pub id: String,
    pub execution_id: String,
    pub alt_file_id: String,
    pub title: String,
    pub mode: AltMode,
    pub persona: Option<String>,
    pub status: LastFileStatus,
    pub success_rate: f64,
    pub execution_time_ms: u64,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub task_results: HashMap<String, TaskResult>,
    pub artifacts: Option<Vec<Artifact>>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    pub tags: Option<Vec<String>>,
    pub priority: Option<Priority>,
    pub execution_graph: Option<ExecutionGraph>,
    pub summary: Option<String>,
    pub version: String,
}

impl LastFile {
    /// Creates a new LAST file with default values
    pub fn new(alt_file_id: String, title: String, mode: AltMode, persona: Option<String>) -> Self {
        let now = Utc::now();
        LastFile {
            id: Uuid::new_v4().to_string(),
            execution_id: Uuid::new_v4().to_string(),
            alt_file_id,
            title,
            mode,
            persona,
            status: LastFileStatus::default(),
            success_rate: 0.0,
            execution_time_ms: 0,
            start_time: now,
            end_time: now, // Will be updated later
            task_results: HashMap::new(),
            artifacts: Some(Vec::new()),
            metadata: Some(HashMap::new()),
            tags: Some(Vec::new()),
            priority: Some(Priority::default()),
            execution_graph: None,
            summary: None,
            version: "1.0".to_string(),
        }
    }

    /// Adds a task result to the LAST file
    #[allow(dead_code)]
    pub fn add_task_result(&mut self, task_id: String, result: TaskResult) {
        self.task_results.insert(task_id, result);
    }

    /// Adds multiple task results to the LAST file
    pub fn add_task_results(&mut self, results: HashMap<String, TaskResult>) {
        self.task_results.extend(results);
    }

    /// Calculates the success rate based on task results
    pub fn calculate_success_rate(&mut self) {
        if self.task_results.is_empty() {
            self.success_rate = 0.0;
            self.status = LastFileStatus::Failure; // No tasks means failure?
            return;
        }

        let total_tasks = self.task_results.len();
        let successful_tasks = self.task_results.values()
            .filter(|r| r.status == TaskStatus::Completed)
            .count();

        self.success_rate = successful_tasks as f64 / total_tasks as f64;

        // Update overall status based on success rate
        if self.success_rate == 1.0 {
            self.status = LastFileStatus::Success;
        } else if self.success_rate > 0.0 {
            self.status = LastFileStatus::PartialSuccess;
        } else {
            self.status = LastFileStatus::Failure;
        }
    }

    /// Calculates the total execution time based on task results
    pub fn calculate_execution_time(&mut self) {
        if self.task_results.is_empty() {
            self.execution_time_ms = 0;
            self.end_time = self.start_time;
            return;
        }

        // Find the earliest start time and latest end time among tasks
        let mut min_start_time = self.start_time;
        let mut max_end_time = self.start_time;
        let mut total_duration: u64 = 0;

        for result in self.task_results.values() {
            // Use start_time directly as it's DateTime<Utc>
            if result.start_time < min_start_time {
                min_start_time = result.start_time;
            }
            
            if let Some(end) = result.end_time {
                if end > max_end_time {
                    max_end_time = end;
                }
            }
            if let Some(duration) = result.duration_ms {
                total_duration += duration;
            }
        }

        self.start_time = min_start_time;
        self.end_time = max_end_time;
        self.execution_time_ms = max_end_time.signed_duration_since(min_start_time).num_milliseconds() as u64;
        
        // Add total task duration as metadata if needed
        self.add_metadata("total_task_duration_ms", serde_json::json!(total_duration));
    }

    /// Adds an artifact to the LAST file
    pub fn add_artifact(&mut self, artifact: Artifact) {
        if let Some(artifacts) = &mut self.artifacts {
            artifacts.push(artifact);
        } else {
            self.artifacts = Some(vec![artifact]);
        }
    }

    /// Adds metadata to the LAST file
    pub fn add_metadata(&mut self, key: &str, value: serde_json::Value) {
        if let Some(metadata) = &mut self.metadata {
            metadata.insert(key.to_string(), value);
        } else {
            let mut new_metadata = HashMap::new();
            new_metadata.insert(key.to_string(), value);
            self.metadata = Some(new_metadata);
        }
    }
    
    /// Adds a tag to the LAST file
    pub fn add_tag(&mut self, tag: &str) {
        if let Some(tags) = &mut self.tags {
            if !tags.contains(&tag.to_string()) {
                tags.push(tag.to_string());
            }
        } else {
            self.tags = Some(vec![tag.to_string()]);
        }
    }
    
    /// Sets the priority of the LAST file
    pub fn set_priority(&mut self, priority: Priority) {
        self.priority = Some(priority);
    }
    
    /// Creates the execution graph based on task results and ALT file dependencies
    pub fn create_execution_graph_from_alt(&mut self, alt_file: &AltFile) { // Renamed and added alt_file param
        let mut nodes = Vec::new();
        let mut edges = Vec::new();
        let mut node_map = HashMap::new(); // Map task_id to node_id

        // Create nodes from task results
        for (task_id, result) in &self.task_results {
            let node_id = Uuid::new_v4().to_string();
            nodes.push(ExecutionNode {
                id: node_id.clone(),
                task_id: task_id.clone(),
                status: result.status.clone(),
                duration_ms: result.duration_ms,
                start_time: Some(result.start_time), // Wrap in Some
                end_time: result.end_time,
            });
            node_map.insert(task_id.clone(), node_id);
        }
        
        // Add nodes for tasks that might not have results (e.g., if parsing failed early)
        // Or ensure all tasks from alt_file are represented
        for task in &alt_file.tasks {
            if !node_map.contains_key(&task.id) {
                let node_id = Uuid::new_v4().to_string();
                nodes.push(ExecutionNode {
                    id: node_id.clone(),
                    task_id: task.id.clone(),
                    status: TaskStatus::Pending, // Or determine status based on context
                    duration_ms: None,
                    start_time: None,
                    end_time: None,
                });
                node_map.insert(task.id.clone(), node_id);
            }
        }

        // Create edges using dependencies from ALT file
        for task in &alt_file.tasks {
            if let Some(deps) = &task.dependencies {
                for dep_id in deps {
                    if let (Some(source_node_id), Some(target_node_id)) = (node_map.get(dep_id), node_map.get(&task.id)) {
                        edges.push(ExecutionEdge {
                            source: source_node_id.clone(),
                            target: target_node_id.clone(),
                            dependency_type: DependencyType::Required, // Assuming required for now
                        });
                    }
                }
            }
        }

        self.execution_graph = Some(ExecutionGraph { nodes, edges });
    }
    
    /// Generates a summary string for the LAST file
    pub fn generate_summary(&mut self) {
        let total_tasks = self.task_results.len();
        let successful_tasks = self.task_results.values()
            .filter(|r| r.status == TaskStatus::Completed)
            .count();
        let failed_tasks = self.task_results.values()
            .filter(|r| r.status == TaskStatus::Failed)
            .count();
        let timeout_tasks = self.task_results.values()
            .filter(|r| r.status == TaskStatus::Timeout)
            .count();
        let cancelled_tasks = self.task_results.values()
            .filter(|r| r.status == TaskStatus::Cancelled)
            .count();
        let artifact_count = self.artifacts.as_ref().map_or(0, |a| a.len());

        let summary = format!(
            "Execution Summary:\n\
            - Title: {}\n\
            - Execution ID: {}\n\
            - ALT File ID: {}\n\
            - Status: {:?}\n\
            - Success Rate: {:.2}%\n\
            - Total Time: {} ms\n\
            - Total Tasks: {}\n\
            - Successful: {}\n\
            - Failed: {}\n\
            - Timed Out: {}\n\
            - Cancelled: {}\n\
            - Artifacts: {}\n\
            - Mode: {:?}\n\
            - Persona: {}",
            self.title,
            self.execution_id,
            self.alt_file_id,
            self.status,
            self.success_rate * 100.0,
            self.execution_time_ms,
            total_tasks,
            successful_tasks,
            failed_tasks,
            timeout_tasks,
            cancelled_tasks,
            artifact_count,
            self.mode,
            self.persona.clone().unwrap_or_else(|| "N/A".to_string())
        );

        self.summary = Some(summary);
    }
}

/// Creates a new artifact
pub fn create_artifact(name: String, artifact_type: ArtifactType, task_id: String, path: String) -> Artifact {
    Artifact {
        id: Uuid::new_v4().to_string(),
        name,
        artifact_type,
        task_id,
        path,
        created_at: Utc::now(),
        size_bytes: None,
        mime_type: None,
        metadata: None,
    }
}

