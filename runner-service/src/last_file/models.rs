use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::alt_file::models::{AltMode, Priority};
use crate::task_manager::models::{TaskResult, TaskStatus};

/// Represents a LAST file
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
    pub tags: Option<Vec<String>>,
    pub priority: Option<Priority>,
    pub artifacts: Option<Vec<Artifact>>,
    pub execution_graph: Option<ExecutionGraph>,
}

/// Represents the status of a LAST file
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum LastFileStatus {
    Success,
    PartialSuccess,
    Failure,
}

/// Represents an artifact produced during task execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    pub id: String,
    pub name: String,
    pub artifact_type: ArtifactType,
    pub task_id: String,
    pub path: String,
    pub size_bytes: Option<u64>,
    pub mime_type: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    pub created_at: DateTime<Utc>,
}

/// Represents the type of artifact
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ArtifactType {
    File,
    Image,
    Text,
    Json,
    Binary,
    Other,
}

/// Represents the execution graph of tasks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionGraph {
    pub nodes: Vec<ExecutionNode>,
    pub edges: Vec<ExecutionEdge>,
}

/// Represents a node in the execution graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionNode {
    pub id: String,
    pub task_id: String,
    pub status: TaskStatus,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_ms: Option<u64>,
}

/// Represents an edge in the execution graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionEdge {
    pub source: String,
    pub target: String,
    pub dependency_type: DependencyType,
}

/// Represents the type of dependency between tasks
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum DependencyType {
    Required,
    Optional,
    Conditional,
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
            tags: None,
            priority: None,
            artifacts: Some(Vec::new()),
            execution_graph: None,
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

    /// Adds a tag to the LAST file
    pub fn add_tag(&mut self, tag: &str) {
        if let Some(tags) = &mut self.tags {
            if !tags.contains(&tag.to_string()) {
                tags.push(tag.to_string());
            }
        } else {
            let mut tags = Vec::new();
            tags.push(tag.to_string());
            self.tags = Some(tags);
        }
    }

    /// Adds an artifact to the LAST file
    pub fn add_artifact(&mut self, artifact: Artifact) {
        if let Some(artifacts) = &mut self.artifacts {
            artifacts.push(artifact);
        } else {
            let mut artifacts = Vec::new();
            artifacts.push(artifact);
            self.artifacts = Some(artifacts);
        }
    }

    /// Sets the priority of the LAST file
    pub fn set_priority(&mut self, priority: Priority) {
        self.priority = Some(priority);
    }

    /// Creates an execution graph from task results
    pub fn create_execution_graph(&mut self) {
        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        // Create nodes for each task
        for (task_id, result) in &self.task_results {
            let node = ExecutionNode {
                id: format!("node_{}", task_id),
                task_id: task_id.clone(),
                status: result.status.clone(),
                start_time: result.start_time,
                end_time: result.end_time,
                duration_ms: result.duration_ms,
            };
            nodes.push(node);
        }

        // Create edges based on task dependencies
        for (task_id, result) in &self.task_results {
            if let Some(metadata) = &result.metadata {
                if let Some(dependencies) = metadata.get("dependencies").and_then(|d| d.as_array()) {
                    for dep in dependencies {
                        if let Some(dep_id) = dep.as_str() {
                            let edge = ExecutionEdge {
                                source: format!("node_{}", dep_id),
                                target: format!("node_{}", task_id),
                                dependency_type: DependencyType::Required,
                            };
                            edges.push(edge);
                        }
                    }
                }
            }
        }

        self.execution_graph = Some(ExecutionGraph { nodes, edges });
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
        
        // Count artifacts
        let artifact_count = self.artifacts.as_ref().map_or(0, |a| a.len());
        
        // Get tags as string
        let tags_str = self.tags.as_ref().map_or(String::from("None"), |t| {
            if t.is_empty() {
                String::from("None")
            } else {
                t.join(", ")
            }
        });
        
        // Get priority as string
        let priority_str = self.priority.as_ref().map_or(String::from("None"), |p| {
            format!("{:?}", p)
        });

        let summary = format!(
            "Execution Summary:\n\
            - ALT File: {}\n\
            - Execution ID: {}\n\
            - Mode: {:?}\n\
            - Persona: {}\n\
            - Priority: {}\n\
            - Tags: {}\n\
            - Total Tasks: {}\n\
            - Successful Tasks: {}\n\
            - Failed Tasks: {}\n\
            - Cancelled Tasks: {}\n\
            - Timeout Tasks: {}\n\
            - Success Rate: {:.2}%\n\
            - Total Execution Time: {}ms\n\
            - Artifacts Generated: {}\n\
            - Created At: {}",
            self.alt_file_title,
            self.execution_id,
            self.mode,
            self.persona.as_ref().unwrap_or(&String::from("None")),
            priority_str,
            tags_str,
            total_tasks,
            successful_tasks,
            failed_tasks,
            cancelled_tasks,
            timeout_tasks,
            self.success_rate * 100.0,
            self.execution_time_ms,
            artifact_count,
            self.created_at.to_rfc3339()
        );
        self.summary = Some(summary);
    }
    
    /// Gets artifacts of a specific type
    pub fn get_artifacts_by_type(&self, artifact_type: &ArtifactType) -> Vec<&Artifact> {
        if let Some(artifacts) = &self.artifacts {
            artifacts.iter()
                .filter(|a| &a.artifact_type == artifact_type)
                .collect()
        } else {
            Vec::new()
        }
    }
    
    /// Gets artifacts for a specific task
    pub fn get_artifacts_by_task(&self, task_id: &str) -> Vec<&Artifact> {
        if let Some(artifacts) = &self.artifacts {
            artifacts.iter()
                .filter(|a| a.task_id == task_id)
                .collect()
        } else {
            Vec::new()
        }
    }
}

/// Creates a new artifact
pub fn create_artifact(
    name: String,
    artifact_type: ArtifactType,
    task_id: String,
    path: String,
) -> Artifact {
    Artifact {
        id: Uuid::new_v4().to_string(),
        name,
        artifact_type,
        task_id,
        path,
        size_bytes: None,
        mime_type: None,
        metadata: Some(HashMap::new()),
        created_at: Utc::now(),
    }
}
