use std::sync::Arc; // Removed unused Mutex
use std::collections::HashMap;
use tokio::sync::mpsc;
use tokio::task;
use log::{info, error, warn}; // Removed unused debug
use std::path::PathBuf; // Removed unused Path
use std::time::Instant;
// use rayon::prelude::*; // Removed unused import
use num_cpus; // Added num_cpus import

use crate::alt_file::models::AltFile; // Removed unused AltMode
use crate::task_manager::models::TaskResult; // Removed unused TaskStatus
// Removed unused Artifact, LastFileStatus
use super::models::{LastFile, ArtifactType, create_artifact};
use super::generator::{generate_last_file, extract_artifacts_from_results, generate_execution_graph_visualization};
use super::writer::{write_last_file, write_last_file_summary, export_last_file_to_html};

/// Configuration for the LAST file processor
#[allow(dead_code)]
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
#[allow(dead_code)]
pub struct LastFileProcessor {
    config: LastFileProcessorConfig,
    ai_client: Option<Arc<crate::ai_service::AiServiceClient>>,
}

#[allow(dead_code)]
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
        let _last_file_id = last_file.id.clone(); // Mark as unused
        let output_dir = self.config.output_dir.clone();
        let enable_artifact_extraction = self.config.enable_artifact_extraction;
        let enable_graph_visualization = self.config.enable_graph_visualization;
        let enable_html_export = self.config.enable_html_export;
        let last_file_clone = last_file.clone();
        let alt_file_clone = alt_file.clone(); // Clone alt_file for graph generation
        
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
            let alt_file_clone = alt_file_clone.clone(); // Clone alt_file for this task
            
            task::spawn(async move {
                let result = task::spawn_blocking(move || {
                    let mut last_file_copy = last_file_clone.clone();
                    if last_file_copy.execution_graph.is_none() {
                        // Use the correct method with alt_file
                        last_file_copy.create_execution_graph_from_alt(&alt_file_clone);
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
                // Use the correct method with alt_file
                last_file.create_execution_graph_from_alt(alt_file);
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
                    warn!("Failed to enhance with AI: {}", e);
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
}
