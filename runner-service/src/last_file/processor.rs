use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use tokio::sync::mpsc;
use tokio::task;
use log::{info, error, warn, debug};
use std::path::{Path, PathBuf};
use std::time::Instant;
use rayon::prelude::*;

use crate::alt_file::models::{AltFile, AltMode};
use crate::task_manager::models::{TaskResult, TaskStatus};
use super::models::{LastFile, LastFileStatus, Artifact, ArtifactType, create_artifact};
use super::generator::{generate_last_file, extract_artifacts_from_results, generate_execution_graph_visualization};
use super::writer::{write_last_file, write_last_file_summary, export_last_file_to_html};

/// Configuration for the LAST file processor
pub struct LastFileProcessorConfig {
    pub output_dir: PathBuf,
    pub enable_compression: bool,
    pub enable_html_export: bool,
    pub enable_graph_visualization: bool,
    pub enable_artifact_extraction: bool,
    pub enable_ai_enhancement: bool,
    pub parallel_processing: bool,
    pub max_workers: usize,
}

impl Default for LastFileProcessorConfig {
    fn default() -> Self {
        LastFileProcessorConfig {
            output_dir: PathBuf::from("/tmp/last_files"),
            enable_compression: false,
            enable_html_export: true,
            enable_graph_visualization: true,
            enable_artifact_extraction: true,
            enable_ai_enhancement: false,
            parallel_processing: true,
            max_workers: num_cpus::get(),
        }
    }
}

/// Processor for optimized LAST file generation and processing
pub struct LastFileProcessor {
    config: LastFileProcessorConfig,
    ai_client: Option<Arc<crate::ai_service::AiServiceClient>>,
}

impl LastFileProcessor {
    /// Creates a new LAST file processor with default configuration
    pub fn new() -> Self {
        LastFileProcessor {
            config: LastFileProcessorConfig::default(),
            ai_client: None,
        }
    }
    
    /// Creates a new LAST file processor with custom configuration
    pub fn with_config(config: LastFileProcessorConfig) -> Self {
        LastFileProcessor {
            config,
            ai_client: None,
        }
    }
    
    /// Sets the AI client for AI enhancements
    pub fn with_ai_client(mut self, ai_client: Arc<crate::ai_service::AiServiceClient>) -> Self {
        self.ai_client = Some(ai_client);
        self
    }
    
    /// Processes an ALT file and task results to generate a LAST file with optimized performance
    pub async fn process(&self, alt_file: &AltFile, task_results: HashMap<String, TaskResult>) -> Result<LastFile, String> {
        let start_time = Instant::now();
        info!("Processing ALT file to generate LAST file: {}", alt_file.id);
        
        // Generate basic LAST file
        let mut last_file = generate_last_file(alt_file, task_results);
        
        // Process the LAST file based on configuration
        if self.config.parallel_processing {
            self.process_parallel(&mut last_file, alt_file).await?;
        } else {
            self.process_sequential(&mut last_file, alt_file).await?;
        }
        
        let duration = start_time.elapsed();
        info!("LAST file processing completed in {:?}: {}", duration, last_file.id);
        
        Ok(last_file)
    }
    
    /// Processes a LAST file using parallel execution for better performance
    async fn process_parallel(&self, last_file: &mut LastFile, alt_file: &AltFile) -> Result<(), String> {
        info!("Processing LAST file in parallel mode: {}", last_file.id);
        
        // Create a channel for task results
        let (tx, mut rx) = mpsc::channel(self.config.max_workers);
        
        // Clone necessary data for tasks
        let last_file_id = last_file.id.clone();
        let output_dir = self.config.output_dir.clone();
        let enable_artifact_extraction = self.config.enable_artifact_extraction;
        let enable_graph_visualization = self.config.enable_graph_visualization;
        let enable_html_export = self.config.enable_html_export;
        let last_file_clone = last_file.clone();
        
        // Spawn artifact extraction task if enabled
        if enable_artifact_extraction {
            let tx_clone = tx.clone();
            let output_dir_clone = output_dir.clone();
            let last_file_clone = last_file_clone.clone();
            
            task::spawn(async move {
                let result = task::spawn_blocking(move || {
                    extract_artifacts_from_results(last_file_clone, &output_dir_clone)
                }).await;
                
                match result {
                    Ok(enhanced_last_file) => {
                        let _ = tx_clone.send(("artifacts", enhanced_last_file)).await;
                    },
                    Err(e) => {
                        error!("Failed to extract artifacts: {}", e);
                    }
                }
            });
        }
        
        // Spawn graph visualization task if enabled
        if enable_graph_visualization {
            let tx_clone = tx.clone();
            let output_dir_clone = output_dir.clone();
            let last_file_clone = last_file_clone.clone();
            
            task::spawn(async move {
                let result = task::spawn_blocking(move || {
                    let mut last_file_copy = last_file_clone.clone();
                    if last_file_copy.execution_graph.is_none() {
                        last_file_copy.create_execution_graph();
                    }
                    
                    if let Some(graph_path) = generate_execution_graph_visualization(&last_file_copy, &output_dir_clone) {
                        if let Some(artifacts) = &mut last_file_copy.artifacts {
                            let artifact = create_artifact(
                                "Execution Graph".to_string(),
                                ArtifactType::Image,
                                "graph_visualization".to_string(),
                                graph_path.to_string_lossy().to_string()
                            );
                            artifacts.push(artifact);
                        }
                    }
                    
                    last_file_copy
                }).await;
                
                match result {
                    Ok(enhanced_last_file) => {
                        let _ = tx_clone.send(("graph", enhanced_last_file)).await;
                    },
                    Err(e) => {
                        error!("Failed to generate graph visualization: {}", e);
                    }
                }
            });
        }
        
        // Spawn HTML export task if enabled
        if enable_html_export {
            let tx_clone = tx.clone();
            let output_dir_clone = output_dir.clone();
            let last_file_clone = last_file_clone.clone();
            
            task::spawn(async move {
                let result = task::spawn_blocking(move || {
                    let mut last_file_copy = last_file_clone.clone();
                    
                    if let Ok(html_path) = export_last_file_to_html(&last_file_copy, &output_dir_clone) {
                        if let Some(artifacts) = &mut last_file_copy.artifacts {
                            let artifact = create_artifact(
                                "HTML Report".to_string(),
                                ArtifactType::Text,
                                "html_export".to_string(),
                                html_path.to_string_lossy().to_string()
                            );
                            artifacts.push(artifact);
                        }
                    }
                    
                    last_file_copy
                }).await;
                
                match result {
                    Ok(enhanced_last_file) => {
                        let _ = tx_clone.send(("html", enhanced_last_file)).await;
                    },
                    Err(e) => {
                        error!("Failed to export to HTML: {}", e);
                    }
                }
            });
        }
        
        // Spawn AI enhancement task if enabled and AI client is available
        if self.config.enable_ai_enhancement && self.ai_client.is_some() {
            let tx_clone = tx.clone();
            let last_file_clone = last_file_clone.clone();
            let ai_client = self.ai_client.as_ref().unwrap().clone();
            
            task::spawn(async move {
                match super::generator::enhance_last_file_with_ai(last_file_clone, &ai_client).await {
                    Ok(enhanced_last_file) => {
                        let _ = tx_clone.send(("ai", enhanced_last_file)).await;
                    },
                    Err(e) => {
                        error!("Failed to enhance with AI: {}", e);
                    }
                }
            });
        }
        
        // Drop the original sender to ensure the channel closes when all tasks are done
        drop(tx);
        
        // Collect results from all tasks
        let mut artifacts_result: Option<LastFile> = None;
        let mut graph_result: Option<LastFile> = None;
        let mut html_result: Option<LastFile> = None;
        let mut ai_result: Option<LastFile> = None;
        
        while let Some((task_type, result)) = rx.recv().await {
            match task_type {
                "artifacts" => artifacts_result = Some(result),
                "graph" => graph_result = Some(result),
                "html" => html_result = Some(result),
                "ai" => ai_result = Some(result),
                _ => {}
            }
        }
        
        // Merge results from all tasks
        if let Some(result) = artifacts_result {
            last_file.artifacts = result.artifacts;
        }
        
        if let Some(result) = graph_result {
            last_file.execution_graph = result.execution_graph;
            if let Some(artifacts) = &result.artifacts {
                if let Some(last_artifacts) = &mut last_file.artifacts {
                    for artifact in artifacts {
                        if artifact.task_id == "graph_visualization" {
                            last_artifacts.push(artifact.clone());
                        }
                    }
                } else {
                    last_file.artifacts = Some(artifacts.clone());
                }
            }
        }
        
        if let Some(result) = html_result {
            if let Some(artifacts) = &result.artifacts {
                if let Some(last_artifacts) = &mut last_file.artifacts {
                    for artifact in artifacts {
                        if artifact.task_id == "html_export" {
                            last_artifacts.push(artifact.clone());
                        }
                    }
                } else {
                    last_file.artifacts = Some(artifacts.clone());
                }
            }
        }
        
        if let Some(result) = ai_result {
            if let Some(metadata) = &result.metadata {
                if let Some(last_metadata) = &mut last_file.metadata {
                    if let Some(ai_insights) = metadata.get("ai_insights") {
                        last_metadata.insert("ai_insights".to_string(), ai_insights.clone());
                    }
                } else {
                    last_file.metadata = result.metadata.clone();
                }
            }
            
            if let Some(summary) = &result.summary {
                last_file.summary = Some(summary.clone());
            }
            
            if let Some(artifacts) = &result.artifacts {
                if let Some(last_artifacts) = &mut last_file.artifacts {
                    for artifact in artifacts {
                        if artifact.task_id == "ai_analysis" {
                            last_artifacts.push(artifact.clone());
                        }
                    }
                } else {
                    last_file.artifacts = Some(artifacts.clone());
                }
            }
        }
        
        // Update summary with final artifact count
        last_file.generate_summary();
        
        // Write LAST file to disk
        if let Err(e) = write_last_file(last_file, &self.config.output_dir) {
            warn!("Failed to write LAST file to disk: {}", e);
        }
        
        // Write summary to disk
        if let Err(e) = write_last_file_summary(last_file, &self.config.output_dir) {
            warn!("Failed to write LAST file summary to disk: {}", e);
        }
        
        Ok(())
    }
    
    /// Processes a LAST file sequentially
    async fn process_sequential(&self, last_file: &mut LastFile, alt_file: &AltFile) -> Result<(), String> {
        info!("Processing LAST file in sequential mode: {}", last_file.id);
        
        // Extract artifacts if enabled
        if self.config.enable_artifact_extraction {
            *last_file = extract_artifacts_from_results(last_file.clone(), &self.config.output_dir);
        }
        
        // Generate execution graph visualization if enabled
        if self.config.enable_graph_visualization {
            if last_file.execution_graph.is_none() {
                last_file.create_execution_graph();
            }
            
            if let Some(graph_path) = generate_execution_graph_visualization(last_file, &self.config.output_dir) {
                if let Some(artifacts) = &mut last_file.artifacts {
                    let artifact = create_artifact(
                        "Execution Graph".to_string(),
                        ArtifactType::Image,
                        "graph_visualization".to_string(),
                        graph_path.to_string_lossy().to_string()
                    );
                    artifacts.push(artifact);
                }
            }
        }
        
        // Enhance with AI if enabled and AI client is available
        if self.config.enable_ai_enhancement && self.ai_client.is_some() {
            match super::generator::enhance_last_file_with_ai(last_file.clone(), self.ai_client.as_ref().unwrap()).await {
                Ok(enhanced_last_file) => {
                    if let Some(metadata) = &enhanced_last_file.metadata {
                        if let Some(ai_insights) = metadata.get("ai_insights") {
                            if let Some(last_metadata) = &mut last_file.metadata {
                                last_metadata.insert("ai_insights".to_string(), ai_insights.clone());
                            }
                        }
                    }
                    
                    if let Some(summary) = &enhanced_last_file.summary {
                        last_file.summary = Some(summary.clone());
                    }
                    
                    if let Some(artifacts) = &enhanced_last_file.artifacts {
                        if let Some(last_artifacts) = &mut last_file.artifacts {
                            for artifact in artifacts {
                                if artifact.task_id == "ai_analysis" {
                                    last_artifacts.push(artifact.clone());
                                }
                            }
                        }
                    }
                },
                Err(e) => {
                    warn!("Failed to enhance LAST file with AI: {}", e);
                }
            }
        }
        
        // Export to HTML if enabled
        if self.config.enable_html_export {
            if let Ok(html_path) = export_last_file_to_html(last_file, &self.config.output_dir) {
                if let Some(artifacts) = &mut last_file.artifacts {
                    let artifact = create_artifact(
                        "HTML Report".to_string(),
                        ArtifactType::Text,
                        "html_export".to_string(),
                        html_path.to_string_lossy().to_string()
                    );
                    artifacts.push(artifact);
                }
            }
        }
        
        // Update summary with final artifact count
        last_file.generate_summary();
        
        // Write LAST file to disk
        if let Err(e) = write_last_file(last_file, &self.config.output_dir) {
            warn!("Failed to write LAST file to disk: {}", e);
        }
        
        // Write summary to disk
        if let Err(e) = write_last_file_summary(last_file, &self.config.output_dir) {
            warn!("Failed to write LAST file summary to disk: {}", e);
        }
        
        Ok(())
    }
    
    /// Batch processes multiple ALT files and task results
    pub async fn batch_process(
        &self,
        alt_files: Vec<AltFile>,
        task_results_map: HashMap<String, HashMap<String, TaskResult>>,
    ) -> HashMap<String, Result<LastFile, String>> {
        info!("Batch processing {} ALT files", alt_files.len());
        let start_time = Instant::now();
        
        let mut results = HashMap::new();
        
        // Process ALT files in parallel using rayon
        if self.config.parallel_processing {
            // Create a shared results container
            let results_mutex = Arc::new(Mutex::new(HashMap::new()));
            
            // Process files in parallel
            alt_files.into_par_iter().for_each(|alt_file| {
                let alt_id = alt_file.id.clone();
                
                // Get task results for this ALT file
                let task_results = match task_results_map.get(&alt_id) {
                    Some(results) => results.clone(),
                    None => HashMap::new(),
                };
                
                // Create a runtime for this thread
                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .unwrap();
                
                // Process the ALT file
                let process_result = rt.block_on(self.process(&alt_file, task_results));
                
                // Store the result
                let mut results = results_mutex.lock().unwrap();
                results.insert(alt_id, process_result);
            });
            
            // Get the final results
            results = Arc::try_unwrap(results_mutex).unwrap().into_inner().unwrap();
        } else {
            // Process files sequentially
            for alt_file in alt_files {
                let alt_id = alt_file.id.clone();
                
                // Get task results for this ALT file
                let task_results = match task_results_map.get(&alt_id) {
                    Some(results) => results.clone(),
                    None => HashMap::new(),
                };
                
                // Process the ALT file
                let process_result = self.process(&alt_file, task_results).await;
                
                // Store the result
                results.insert(alt_id, process_result);
            }
        }
        
        let duration = start_time.elapsed();
        info!("Batch processing completed in {:?} for {} ALT files", duration, results.len());
        
        results
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::alt_file::models::{Task, AltMode};
    use crate::task_manager::models::{TaskStatus, TaskResult};
    use tempfile::TempDir;
    
    fn create_test_alt_file() -> AltFile {
        let mut alt_file = AltFile::new("Test ALT File".to_string());
        alt_file.mode = Some(AltMode::Normal);
        
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
        
        alt_file.add_task(task1);
        alt_file.add_task(task2);
        
        alt_file
    }
    
    fn create_test_task_results() -> HashMap<String, TaskResult> {
        let mut results = HashMap::new();
        
        // Create successful task result
        let mut result1 = TaskResult::new("task1".to_string());
        result1.mark_running();
        result1.mark_completed(serde_json::json!({
            "output": "Task 1 completed successfully",
            "text": "This is the output text from task 1"
        }));
        
        // Create failed task result
        let mut result2 = TaskResult::new("task2".to_string());
        result2.mark_running();
        result2.mark_failed("Task 2 failed".to_string());
        
        results.insert("task1".to_string(), result1);
        results.insert("task2".to_string(), result2);
        
        results
    }
    
    #[tokio::test]
    async fn test_last_file_processor_sequential() {
        // Create a temporary directory
        let temp_dir = TempDir::new().unwrap();
        
        // Create test data
        let alt_file = create_test_alt_file();
        let task_results = create_test_task_results();
        
        // Create processor with sequential processing
        let mut config = LastFileProcessorConfig::default();
        config.output_dir = temp_dir.path().to_path_buf();
        config.parallel_processing = false;
        config.enable_ai_enhancement = false;
        
        let processor = LastFileProcessor::with_config(config);
        
        // Process the ALT file
        let result = processor.process(&alt_file, task_results).await;
        
        // Verify result
        assert!(result.is_ok());
        let last_file = result.unwrap();
        assert_eq!(last_file.alt_file_id, alt_file.id);
        assert_eq!(last_file.status, LastFileStatus::PartialSuccess);
    }
    
    #[tokio::test]
    async fn test_last_file_processor_parallel() {
        // Create a temporary directory
        let temp_dir = TempDir::new().unwrap();
        
        // Create test data
        let alt_file = create_test_alt_file();
        let task_results = create_test_task_results();
        
        // Create processor with parallel processing
        let mut config = LastFileProcessorConfig::default();
        config.output_dir = temp_dir.path().to_path_buf();
        config.parallel_processing = true;
        config.enable_ai_enhancement = false;
        
        let processor = LastFileProcessor::with_config(config);
        
        // Process the ALT file
        let result = processor.process(&alt_file, task_results).await;
        
        // Verify result
        assert!(result.is_ok());
        let last_file = result.unwrap();
        assert_eq!(last_file.alt_file_id, alt_file.id);
        assert_eq!(last_file.status, LastFileStatus::PartialSuccess);
    }
    
    #[tokio::test]
    async fn test_batch_processing() {
        // Create a temporary directory
        let temp_dir = TempDir::new().unwrap();
        
        // Create multiple test ALT files
        let alt_file1 = create_test_alt_file();
        let mut alt_file2 = create_test_alt_file();
        alt_file2.id = "alt_file_2".to_string();
        
        let alt_files = vec![alt_file1.clone(), alt_file2.clone()];
        
        // Create task results for each ALT file
        let mut task_results_map = HashMap::new();
        task_results_map.insert(alt_file1.id.clone(), create_test_task_results());
        task_results_map.insert(alt_file2.id.clone(), create_test_task_results());
        
        // Create processor
        let mut config = LastFileProcessorConfig::default();
        config.output_dir = temp_dir.path().to_path_buf();
        config.enable_ai_enhancement = false;
        
        let processor = LastFileProcessor::with_config(config);
        
        // Batch process the ALT files
        let results = processor.batch_process(alt_files, task_results_map).await;
        
        // Verify results
        assert_eq!(results.len(), 2);
        assert!(results.contains_key(&alt_file1.id));
        assert!(results.contains_key(&alt_file2.id));
        
        assert!(results.get(&alt_file1.id).unwrap().is_ok());
        assert!(results.get(&alt_file2.id).unwrap().is_ok());
    }
}
