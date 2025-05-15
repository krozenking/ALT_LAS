use std::time::Instant;
use log::{info, warn, debug};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

/// Performance metrics for the Runner Service
pub struct PerformanceMetrics {
    /// Total number of tasks processed
    tasks_processed: AtomicUsize,
    /// Total number of successful tasks
    successful_tasks: AtomicUsize,
    /// Total number of failed tasks
    failed_tasks: AtomicUsize,
    /// Total execution time in milliseconds
    total_execution_time_ms: AtomicUsize,
}

impl PerformanceMetrics {
    /// Creates a new performance metrics instance
    pub fn new() -> Self {
        PerformanceMetrics {
            tasks_processed: AtomicUsize::new(0),
            successful_tasks: AtomicUsize::new(0),
            failed_tasks: AtomicUsize::new(0),
            total_execution_time_ms: AtomicUsize::new(0),
        }
    }

    /// Records a task execution
    pub fn record_task_execution(&self, success: bool, execution_time_ms: u64) {
        self.tasks_processed.fetch_add(1, Ordering::SeqCst);
        
        if success {
            self.successful_tasks.fetch_add(1, Ordering::SeqCst);
        } else {
            self.failed_tasks.fetch_add(1, Ordering::SeqCst);
        }
        
        self.total_execution_time_ms.fetch_add(execution_time_ms as usize, Ordering::SeqCst);
    }

    /// Gets the current metrics
    pub fn get_metrics(&self) -> serde_json::Value {
        let tasks_processed = self.tasks_processed.load(Ordering::SeqCst);
        let successful_tasks = self.successful_tasks.load(Ordering::SeqCst);
        let failed_tasks = self.failed_tasks.load(Ordering::SeqCst);
        let total_execution_time_ms = self.total_execution_time_ms.load(Ordering::SeqCst);
        
        let success_rate = if tasks_processed > 0 {
            (successful_tasks as f64 / tasks_processed as f64) * 100.0
        } else {
            0.0
        };
        
        let avg_execution_time = if tasks_processed > 0 {
            total_execution_time_ms as f64 / tasks_processed as f64
        } else {
            0.0
        };
        
        serde_json::json!({
            "tasks_processed": tasks_processed,
            "successful_tasks": successful_tasks,
            "failed_tasks": failed_tasks,
            "success_rate_percent": success_rate,
            "total_execution_time_ms": total_execution_time_ms,
            "avg_execution_time_ms": avg_execution_time,
        })
    }
}

/// Performance timer for measuring execution time
pub struct PerformanceTimer {
    start_time: Instant,
    label: String,
}

impl PerformanceTimer {
    /// Creates a new performance timer
    pub fn new(label: &str) -> Self {
        debug!("Starting timer: {}", label);
        PerformanceTimer {
            start_time: Instant::now(),
            label: label.to_string(),
        }
    }
    
    /// Gets the elapsed time in milliseconds
    pub fn elapsed_ms(&self) -> u64 {
        let elapsed = self.start_time.elapsed();
        elapsed.as_secs() * 1000 + elapsed.subsec_millis() as u64
    }
}

impl Drop for PerformanceTimer {
    fn drop(&mut self) {
        let elapsed_ms = self.elapsed_ms();
        debug!("Timer '{}' completed in {}ms", self.label, elapsed_ms);
    }
}

/// Memory usage tracker
pub struct MemoryTracker;

impl MemoryTracker {
    /// Gets the current memory usage
    pub fn get_memory_usage() -> Option<serde_json::Value> {
        #[cfg(target_os = "linux")]
        {
            use std::fs::File;
            use std::io::Read;
            
            // Read memory information from /proc/self/status
            let mut file = match File::open("/proc/self/status") {
                Ok(file) => file,
                Err(_) => return None,
            };
            
            let mut contents = String::new();
            if file.read_to_string(&mut contents).is_err() {
                return None;
            }
            
            // Parse VmRSS (Resident Set Size)
            let vm_rss = contents.lines()
                .find(|line| line.starts_with("VmRSS:"))
                .and_then(|line| {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 2 {
                        parts[1].parse::<u64>().ok()
                    } else {
                        None
                    }
                });
            
            // Parse VmSize (Virtual Memory Size)
            let vm_size = contents.lines()
                .find(|line| line.starts_with("VmSize:"))
                .and_then(|line| {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 2 {
                        parts[1].parse::<u64>().ok()
                    } else {
                        None
                    }
                });
            
            if let (Some(rss), Some(size)) = (vm_rss, vm_size) {
                return Some(serde_json::json!({
                    "resident_set_size_kb": rss,
                    "virtual_memory_size_kb": size,
                }));
            }
        }
        
        None
    }
    
    /// Logs the current memory usage
    pub fn log_memory_usage() {
        if let Some(memory_usage) = Self::get_memory_usage() {
            info!("Memory Usage: {}", memory_usage);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;
    use std::time::Duration;
    
    #[test]
    fn test_performance_timer() {
        let timer = PerformanceTimer::new("test_timer");
        
        // Sleep for 100ms
        thread::sleep(Duration::from_millis(100));
        
        let elapsed = timer.elapsed_ms();
        assert!(elapsed >= 100, "Timer should measure at least 100ms");
    }
    
    #[test]
    fn test_performance_metrics() {
        let metrics = PerformanceMetrics::new();
        
        // Record some task executions
        metrics.record_task_execution(true, 100);
        metrics.record_task_execution(true, 200);
        metrics.record_task_execution(false, 300);
        
        // Get metrics
        let json_metrics = metrics.get_metrics();
        
        // Verify metrics
        assert_eq!(json_metrics["tasks_processed"], 3);
        assert_eq!(json_metrics["successful_tasks"], 2);
        assert_eq!(json_metrics["failed_tasks"], 1);
        assert_eq!(json_metrics["total_execution_time_ms"], 600);
        assert_eq!(json_metrics["avg_execution_time_ms"], 200.0);
        assert_eq!(json_metrics["success_rate_percent"], 66.66666666666666);
    }
}
