use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::fs;
use std::io;
use log::{info, debug, warn, error};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::alt_file::models::{AltFile, Task, TaskStatus};
use crate::task_manager::{TaskManager, TaskExecutionInfo};

/// API Gateway integration service
pub struct ApiGatewayService {
    base_url: String,
    api_key: String,
    client: reqwest::Client,
}

impl ApiGatewayService {
    /// Creates a new API Gateway service
    pub fn new(base_url: String, api_key: String) -> Result<Self, reqwest::Error> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()?;
        
        Ok(Self {
            base_url,
            api_key,
            client,
        })
    }
    
    /// Registers a runner with the API Gateway
    pub async fn register_runner(&self, runner_id: &str) -> Result<(), String> {
        let url = format!("{}/api/runners/register", self.base_url);
        
        let response = self.client.post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&serde_json::json!({
                "runner_id": runner_id,
                "status": "available",
                "capabilities": ["alt_processing", "ai_integration"],
                "version": env!("CARGO_PKG_VERSION"),
            }))
            .send()
            .await
            .map_err(|e| format!("Failed to register runner: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to register runner: {} - {}", response.status(), error_text));
        }
        
        info!("Runner {} registered successfully", runner_id);
        Ok(())
    }
    
    /// Updates the status of a task
    pub async fn update_task_status(&self, task_id: &str, status: TaskStatus, details: Option<String>) -> Result<(), String> {
        let url = format!("{}/api/tasks/{}/status", self.base_url, task_id);
        
        let response = self.client.put(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&serde_json::json!({
                "status": status,
                "details": details,
                "updated_at": Utc::now(),
            }))
            .send()
            .await
            .map_err(|e| format!("Failed to update task status: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to update task status: {} - {}", response.status(), error_text));
        }
        
        debug!("Task {} status updated to {:?}", task_id, status);
        Ok(())
    }
    
    /// Gets an ALT file from the API Gateway
    pub async fn get_alt_file(&self, alt_file_id: &str) -> Result<AltFile, String> {
        let url = format!("{}/api/alt-files/{}", self.base_url, alt_file_id);
        
        let response = self.client.get(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await
            .map_err(|e| format!("Failed to get ALT file: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to get ALT file: {} - {}", response.status(), error_text));
        }
        
        let alt_file: AltFile = response.json().await
            .map_err(|e| format!("Failed to parse ALT file: {}", e))?;
        
        debug!("Retrieved ALT file: {}", alt_file_id);
        Ok(alt_file)
    }
    
    /// Submits a LAST file to the API Gateway
    pub async fn submit_last_file(&self, last_file: &serde_json::Value) -> Result<(), String> {
        let url = format!("{}/api/last-files", self.base_url);
        
        let response = self.client.post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(last_file)
            .send()
            .await
            .map_err(|e| format!("Failed to submit LAST file: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to submit LAST file: {} - {}", response.status(), error_text));
        }
        
        info!("LAST file submitted successfully");
        Ok(())
    }
}

/// Segmentation Service integration
pub struct SegmentationService {
    base_url: String,
    client: reqwest::Client,
}

impl SegmentationService {
    /// Creates a new Segmentation Service
    pub fn new(base_url: String) -> Result<Self, reqwest::Error> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(60))
            .build()?;
        
        Ok(Self {
            base_url,
            client,
        })
    }
    
    /// Gets a segment from the Segmentation Service
    pub async fn get_segment(&self, segment_id: &str) -> Result<serde_json::Value, String> {
        let url = format!("{}/api/segments/{}", self.base_url, segment_id);
        
        let response = self.client.get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to get segment: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to get segment: {} - {}", response.status(), error_text));
        }
        
        let segment: serde_json::Value = response.json().await
            .map_err(|e| format!("Failed to parse segment: {}", e))?;
        
        debug!("Retrieved segment: {}", segment_id);
        Ok(segment)
    }
    
    /// Submits a processed segment to the Segmentation Service
    pub async fn submit_processed_segment(&self, segment_id: &str, processed_segment: &serde_json::Value) -> Result<(), String> {
        let url = format!("{}/api/segments/{}/processed", self.base_url, segment_id);
        
        let response = self.client.post(&url)
            .json(processed_segment)
            .send()
            .await
            .map_err(|e| format!("Failed to submit processed segment: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to submit processed segment: {} - {}", response.status(), error_text));
        }
        
        debug!("Processed segment submitted: {}", segment_id);
        Ok(())
    }
    
    /// Gets the status of a segment
    pub async fn get_segment_status(&self, segment_id: &str) -> Result<String, String> {
        let url = format!("{}/api/segments/{}/status", self.base_url, segment_id);
        
        let response = self.client.get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to get segment status: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to get segment status: {} - {}", response.status(), error_text));
        }
        
        let status: serde_json::Value = response.json().await
            .map_err(|e| format!("Failed to parse segment status: {}", e))?;
        
        let status_str = status["status"].as_str()
            .ok_or_else(|| "Invalid status format".to_string())?
            .to_string();
        
        debug!("Segment {} status: {}", segment_id, status_str);
        Ok(status_str)
    }
}

/// Archive Service integration
pub struct ArchiveService {
    base_url: String,
    client: reqwest::Client,
}

impl ArchiveService {
    /// Creates a new Archive Service
    pub fn new(base_url: String) -> Result<Self, reqwest::Error> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(120))
            .build()?;
        
        Ok(Self {
            base_url,
            client,
        })
    }
    
    /// Archives a LAST file
    pub async fn archive_last_file(&self, last_file: &serde_json::Value) -> Result<String, String> {
        let url = format!("{}/api/archive/last-files", self.base_url);
        
        let response = self.client.post(&url)
            .json(last_file)
            .send()
            .await
            .map_err(|e| format!("Failed to archive LAST file: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to archive LAST file: {} - {}", response.status(), error_text));
        }
        
        let result: serde_json::Value = response.json().await
            .map_err(|e| format!("Failed to parse archive result: {}", e))?;
        
        let archive_id = result["archive_id"].as_str()
            .ok_or_else(|| "Invalid archive result format".to_string())?
            .to_string();
        
        info!("LAST file archived with ID: {}", archive_id);
        Ok(archive_id)
    }
    
    /// Uploads a file to the Archive Service
    pub async fn upload_file(&self, file_path: &Path, metadata: &serde_json::Value) -> Result<String, String> {
        let url = format!("{}/api/archive/files", self.base_url);
        
        let file_name = file_path.file_name()
            .ok_or_else(|| "Invalid file path".to_string())?
            .to_string_lossy()
            .to_string();
        
        let file_content = fs::read(file_path)
            .map_err(|e| format!("Failed to read file: {}", e))?;
        
        let form = reqwest::multipart::Form::new()
            .text("metadata", serde_json::to_string(metadata).unwrap())
            .part("file", reqwest::multipart::Part::bytes(file_content)
                .file_name(file_name));
        
        let response = self.client.post(&url)
            .multipart(form)
            .send()
            .await
            .map_err(|e| format!("Failed to upload file: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to upload file: {} - {}", response.status(), error_text));
        }
        
        let result: serde_json::Value = response.json().await
            .map_err(|e| format!("Failed to parse upload result: {}", e))?;
        
        let file_id = result["file_id"].as_str()
            .ok_or_else(|| "Invalid upload result format".to_string())?
            .to_string();
        
        debug!("File uploaded with ID: {}", file_id);
        Ok(file_id)
    }
    
    /// Gets a file from the Archive Service
    pub async fn get_file(&self, file_id: &str, output_path: &Path) -> Result<(), String> {
        let url = format!("{}/api/archive/files/{}", self.base_url, file_id);
        
        let response = self.client.get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to get file: {}", e))?;
        
        if !response.status().is_success() {
            let error_text = response.text().await
                .unwrap_or_else(|_| "Failed to read error response".to_string());
            
            return Err(format!("Failed to get file: {} - {}", response.status(), error_text));
        }
        
        let bytes = response.bytes().await
            .map_err(|e| format!("Failed to read file bytes: {}", e))?;
        
        fs::write(output_path, bytes)
            .map_err(|e| format!("Failed to write file: {}", e))?;
        
        debug!("File downloaded to: {:?}", output_path);
        Ok(())
    }
}

/// Integration service for all external services
pub struct IntegrationService {
    api_gateway: ApiGatewayService,
    segmentation: SegmentationService,
    archive: ArchiveService,
}

impl IntegrationService {
    /// Creates a new Integration Service
    pub fn new(
        api_gateway_url: String,
        api_key: String,
        segmentation_url: String,
        archive_url: String,
    ) -> Result<Self, String> {
        let api_gateway = ApiGatewayService::new(api_gateway_url, api_key)
            .map_err(|e| format!("Failed to create API Gateway service: {}", e))?;
        
        let segmentation = SegmentationService::new(segmentation_url)
            .map_err(|e| format!("Failed to create Segmentation service: {}", e))?;
        
        let archive = ArchiveService::new(archive_url)
            .map_err(|e| format!("Failed to create Archive service: {}", e))?;
        
        Ok(Self {
            api_gateway,
            segmentation,
            archive,
        })
    }
    
    /// Gets the API Gateway service
    pub fn api_gateway(&self) -> &ApiGatewayService {
        &self.api_gateway
    }
    
    /// Gets the Segmentation service
    pub fn segmentation(&self) -> &SegmentationService {
        &self.segmentation
    }
    
    /// Gets the Archive service
    pub fn archive(&self) -> &ArchiveService {
        &self.archive
    }
    
    /// Processes an ALT file end-to-end
    pub async fn process_alt_file(&self, alt_file_id: &str, task_manager: &TaskManager) -> Result<String, String> {
        // Get the ALT file
        let alt_file = self.api_gateway.get_alt_file(alt_file_id).await?;
        
        // Update task statuses to Running
        for task in &alt_file.tasks {
            self.api_gateway.update_task_status(&task.id, TaskStatus::Running, None).await?;
        }
        
        // Process the ALT file
        let last_file = task_manager.process_alt_file(&alt_file).await?;
        
        // Update task statuses based on results
        let task_executions = task_manager.get_all_task_execution_infos().await;
        for (task_id, execution_info) in task_executions {
            let status = match execution_info.status {
                crate::task_manager::TaskExecutionStatus::Completed => TaskStatus::Completed,
                crate::task_manager::TaskExecutionStatus::Failed(_) => TaskStatus::Failed,
                crate::task_manager::TaskExecutionStatus::Cancelled => TaskStatus::Cancelled,
                crate::task_manager::TaskExecutionStatus::TimedOut => TaskStatus::Failed,
                _ => TaskStatus::Pending,
            };
            
            self.api_gateway.update_task_status(&task_id, status, execution_info.error).await?;
        }
        
        // Convert LAST file to JSON
        let last_file_json = serde_json::to_value(&last_file)
            .map_err(|e| format!("Failed to serialize LAST file: {}", e))?;
        
        // Submit the LAST file to the API Gateway
        self.api_gateway.submit_last_file(&last_file_json).await?;
        
        // Archive the LAST file
        let archive_id = self.archive.archive_last_file(&last_file_json).await?;
        
        Ok(archive_id)
    }
}
