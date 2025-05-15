use log::{info, debug};
use std::path::{PathBuf};
use std::fs;
use std::io;
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::alt_file::models::{AltFile, TaskStatus};
use crate::ai_service::AiClient;

// /// Configuration for the LastFileProcessor
// #[derive(Debug, Clone, Serialize, Deserialize)]
// pub struct LastFileProcessorConfig {
//     /// Directory to output LAST files
//     pub output_dir: PathBuf,
//     /// Whether to enable compression for LAST files
//     pub enable_compression: bool,
//     /// Whether to enable HTML export
//     pub enable_html_export: bool,
//     /// Whether to enable graph visualization
//     pub enable_graph_visualization: bool,
//     /// Whether to enable artifact extraction
//     pub enable_artifact_extraction: bool,
//     /// Whether to enable AI enhancement
//     pub enable_ai_enhancement: bool,
//     /// Whether to use parallel processing
//     pub parallel_processing: bool,
//     /// Maximum number of worker threads
//     pub max_workers: usize,
// }
// 
// impl Default for LastFileProcessorConfig {
//     fn default() -> Self {
//         Self {
//             output_dir: PathBuf::from("./output"),
//             enable_compression: true,
//             enable_html_export: true,
//             enable_graph_visualization: true,
//             enable_artifact_extraction: true,
//             enable_ai_enhancement: false,
//             parallel_processing: true,
//             max_workers: 4,
//         }
//     }
// }

/// Represents a task result in the LAST file
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TaskResult {
    /// ID of the task
    pub task_id: String,
    /// Status of the task
    pub status: TaskStatus,
    /// Output of the task
    pub output: Option<String>,
    /// Error message if the task failed
    pub error: Option<String>,
    /// Start time of the task
    pub start_time: Option<DateTime<Utc>>,
    /// End time of the task
    pub end_time: Option<DateTime<Utc>>,
    /// Duration of the task in milliseconds
    pub duration_ms: Option<u64>,
    /// Metadata for the task
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// Represents a LAST file
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LastFile {
    /// ID of the LAST file
    pub id: String,
    /// Version of the LAST file format
    pub version: String,
    /// Creation time of the LAST file
    pub created_at: DateTime<Utc>,
    /// ID of the ALT file that was processed
    pub alt_file_id: String,
    /// Title of the LAST file
    pub title: String,
    /// Description of the LAST file
    pub description: Option<String>,
    /// Results of the tasks
    pub task_results: Vec<TaskResult>,
    /// Overall success rate (0.0 - 1.0)
    pub success_rate: f32,
    /// Total processing time in milliseconds
    pub total_processing_time_ms: u64,
    /// Metadata for the LAST file
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

impl LastFile {
    /// Creates a new LAST file from an ALT file
    pub fn new(alt_file: &AltFile) -> Self {
        LastFile {
            id: Uuid::new_v4().to_string(),
            version: "1.0".to_string(),
            created_at: Utc::now(),
            alt_file_id: alt_file.id.clone(),
            title: format!("LAST for: {}", alt_file.title),
            description: alt_file.description.clone(),
            task_results: Vec::new(),
            success_rate: 0.0,
            total_processing_time_ms: 0,
            metadata: Some(HashMap::new()),
        }
    }

    /// Adds a task result to the LAST file
    pub fn add_task_result(&mut self, task_result: TaskResult) {
        self.task_results.push(task_result);
        self.update_success_rate();
    }

    /// Updates the success rate based on task results
    pub fn update_success_rate(&mut self) {
        if self.task_results.is_empty() {
            self.success_rate = 0.0;
            return;
        }

        let successful_tasks = self.task_results.iter()
            .filter(|r| r.status == TaskStatus::Completed)
            .count();

        self.success_rate = successful_tasks as f32 / self.task_results.len() as f32;
    }

    /// Updates the total processing time
    pub fn update_total_processing_time(&mut self) {
        self.total_processing_time_ms = self.task_results.iter()
            .filter_map(|r| r.duration_ms)
            .sum();
    }

    /// Gets a task result by task ID
    pub fn get_task_result(&self, task_id: &str) -> Option<&TaskResult> {
        self.task_results.iter().find(|r| r.task_id == task_id)
    }

    /// Gets all successful task results
    pub fn get_successful_tasks(&self) -> Vec<&TaskResult> {
        self.task_results.iter()
            .filter(|r| r.status == TaskStatus::Completed)
            .collect()
    }

    /// Gets all failed task results
    pub fn get_failed_tasks(&self) -> Vec<&TaskResult> {
        self.task_results.iter()
            .filter(|r| r.status == TaskStatus::Failed)
            .collect()
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
}

// /// Processor for generating LAST files
// pub struct LastFileProcessor {
//     config: LastFileProcessorConfig,
//     ai_client: Option<Box<dyn AiClient>>,
// }
// 
// impl LastFileProcessor {
//     /// Creates a new LastFileProcessor with default configuration
//     pub fn new() -> Self {
//         Self {
//             config: LastFileProcessorConfig::default(),
//             ai_client: None,
//         }
//     }
// 
//     /// Creates a new LastFileProcessor with custom configuration
//     pub fn with_config(config: LastFileProcessorConfig) -> Self {
//         Self {
//             config,
//             ai_client: None,
//         }
//     }
// 
//     /// Sets the AI client for the processor
//     pub fn with_ai_client(mut self, ai_client: Box<dyn AiClient>) -> Self {
//         self.ai_client = Some(ai_client);
//         self
//     }
// 
//     /// Processes an ALT file and generates a LAST file
//     pub fn process(&self, alt_file: &AltFile) -> io::Result<LastFile> {
//         info!("Processing ALT file: {}", alt_file.id);
//         
//         if self.config.parallel_processing {
//             self.process_parallel(alt_file)
//         } else {
//             self.process_sequential(alt_file)
//         }
//     }
// 
//     /// Processes an ALT file in parallel
//     fn process_parallel(&self, alt_file: &AltFile) -> io::Result<LastFile> {
//         debug!("Processing ALT file in parallel mode");
//         
//         let mut last_file = LastFile::new(alt_file);
//         
//         // In a real implementation, this would use tokio or rayon for parallel processing
//         // For now, we'll just call the sequential implementation
//         
//         // Create a dependency graph
//         let dependency_graph = self.create_dependency_graph(alt_file);
//         
//         // Process tasks in parallel based on dependencies
//         // This is a simplified implementation
//         
//         // Update success rate and processing time
//         last_file.update_success_rate();
//         last_file.update_total_processing_time();
//         
//         // Save the LAST file
//         self.save_last_file(&last_file)?;
//         
//         Ok(last_file)
//     }
// 
//     /// Processes an ALT file sequentially
//     fn process_sequential(&self, alt_file: &AltFile) -> io::Result<LastFile> {
//         debug!("Processing ALT file in sequential mode");
//         
//         let mut last_file = LastFile::new(alt_file);
//         
//         // Process each task in sequence
//         for task in &alt_file.tasks {
//             let start_time = Utc::now();
//             
//             // Process the task
//             // In a real implementation, this would call the appropriate handler
//             
//             let end_time = Utc::now();
//             let duration = (end_time.timestamp_millis() - start_time.timestamp_millis()) as u64;
//             
//             // Create a task result
//             let task_result = TaskResult {
//                 task_id: task.id.clone(),
//                 status: TaskStatus::Completed, // Assume success for now
//                 output: Some("Task completed successfully".to_string()),
//                 error: None,
//                 start_time: Some(start_time),
//                 end_time: Some(end_time),
//                 duration_ms: Some(duration),
//                 metadata: None,
//             };
//             
//             // Add the task result to the LAST file
//             last_file.add_task_result(task_result);
//         }
//         
//         // Update success rate and processing time
//         last_file.update_success_rate();
//         last_file.update_total_processing_time();
//         
//         // Save the LAST file
//         self.save_last_file(&last_file)?;
//         
//         Ok(last_file)
//     }
// 
//     /// Creates a dependency graph for the tasks
//     fn create_dependency_graph(&self, alt_file: &AltFile) -> HashMap<String, Vec<String>> {
//         let mut graph = HashMap::new();
//         
//         for task in &alt_file.tasks {
//             let dependencies = task.dependencies.clone().unwrap_or_else(Vec::new);
//             graph.insert(task.id.clone(), dependencies);
//         }
//         
//         graph
//     }
// 
//     /// Saves a LAST file to disk
//     fn save_last_file(&self, last_file: &LastFile) -> io::Result<PathBuf> {
//         // Create the output directory if it doesn't exist
//         fs::create_dir_all(&self.config.output_dir)?;
//         
//         // Generate the file path
//         let file_name = format!("{}.last.json", last_file.id);
//         let file_path = self.config.output_dir.join(file_name);
//         
//         // Serialize the LAST file to JSON
//         let json = serde_json::to_string_pretty(last_file)
//             .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
//         
//         // Write the JSON to disk
//         fs::write(&file_path, json)?;
//         
//         info!("LAST file saved to: {:?}", file_path);
//         
//         Ok(file_path)
//     }
// }
// 
// /// Generator for LAST files
// pub struct LastFileGenerator {
//     processor: LastFileProcessor,
// }
// 
// impl LastFileGenerator {
//     /// Creates a new LastFileGenerator
//     pub fn new(processor: LastFileProcessor) -> Self {
//         Self { processor }
//     }
//     
//     /// Generates a LAST file from an ALT file
//     pub fn generate(&self, alt_file: &AltFile) -> io::Result<LastFile> {
//         self.processor.process(alt_file)
//     }
// }
