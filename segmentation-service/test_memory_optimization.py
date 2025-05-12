#!/usr/bin/env python3
"""
Memory Optimization Test for Segmentation Service

This script tests the memory optimization mechanisms in the Segmentation Service.
It simulates a high load by sending multiple requests and monitors memory usage.
"""

import os
import sys
import time
import logging
import requests
import json
import psutil
import matplotlib.pyplot as plt
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("memory_test.log")
    ]
)
logger = logging.getLogger("memory_test")

# Test configuration
TEST_CONFIG = {
    "base_url": "http://localhost:8000",
    "num_requests": 100,
    "concurrent_requests": 10,
    "request_delay": 0.1,  # seconds
    "memory_check_interval": 1.0,  # seconds
    "test_duration": 60,  # seconds
    "plot_results": True
}

# Sample commands for testing
SAMPLE_COMMANDS = [
    "Analyze the data and create a comprehensive report with visualizations.",
    "Search for information about artificial intelligence and summarize the key findings.",
    "Create a detailed project plan for implementing a new software system.",
    "Veriyi analiz et ve kapsamlı bir rapor oluştur, görselleştirmeler ekle.",
    "Yapay zeka hakkında bilgi ara ve önemli bulguları özetle.",
    "Yeni bir yazılım sistemi uygulamak için detaylı bir proje planı oluştur.",
    "Recherchez des informations sur l'intelligence artificielle et résumez les principales conclusions.",
    "Analysieren Sie die Daten und erstellen Sie einen umfassenden Bericht mit Visualisierungen.",
    "Analiza los datos y crea un informe completo con visualizaciones.",
    "Analyze the data, create visualizations, generate insights, and prepare a comprehensive report with recommendations."
]

def track_memory_usage() -> float:
    """
    Track current memory usage of the process
    
    Returns:
        Current memory usage in MB
    """
    process = psutil.Process()
    memory_info = process.memory_info()
    memory_mb = memory_info.rss / 1024 / 1024  # Convert to MB
    return memory_mb

def send_request(command: str) -> Dict[str, Any]:
    """
    Send a segmentation request to the service
    
    Args:
        command: Command to segment
        
    Returns:
        Response from the service
    """
    url = f"{TEST_CONFIG['base_url']}/segment"
    payload = {
        "command": command,
        "mode": "Normal",
        "persona": "technical_expert",
        "metadata": {
            "test": True
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error sending request: {e}")
        return {"error": str(e)}

def get_memory_stats() -> Dict[str, Any]:
    """
    Get memory statistics from the service
    
    Returns:
        Memory statistics
    """
    url = f"{TEST_CONFIG['base_url']}/memory-stats"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error getting memory stats: {e}")
        return {"error": str(e)}

def trigger_memory_optimization(aggressive: bool = False) -> Dict[str, Any]:
    """
    Trigger memory optimization in the service
    
    Args:
        aggressive: Whether to perform aggressive optimization
        
    Returns:
        Optimization results
    """
    url = f"{TEST_CONFIG['base_url']}/optimize-memory"
    params = {"aggressive": aggressive}
    
    try:
        response = requests.post(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error triggering memory optimization: {e}")
        return {"error": str(e)}

def run_load_test() -> List[Tuple[float, float]]:
    """
    Run a load test on the service
    
    Returns:
        List of (timestamp, memory_usage) tuples
    """
    logger.info("Starting load test")
    
    # Track memory usage over time
    memory_usage_data = []
    start_time = time.time()
    
    # Get initial memory stats
    initial_stats = get_memory_stats()
    logger.info(f"Initial memory stats: {json.dumps(initial_stats, indent=2)}")
    
    # Start memory tracking thread
    def track_memory():
        while time.time() - start_time < TEST_CONFIG["test_duration"]:
            stats = get_memory_stats()
            if "error" not in stats:
                memory_mb = stats["memory"]["process"]["rss"]
                timestamp = time.time() - start_time
                memory_usage_data.append((timestamp, memory_mb))
                logger.info(f"Memory usage at {timestamp:.2f}s: {memory_mb:.2f} MB")
            time.sleep(TEST_CONFIG["memory_check_interval"])
    
    # Start memory tracking in a separate thread
    import threading
    memory_thread = threading.Thread(target=track_memory)
    memory_thread.daemon = True
    memory_thread.start()
    
    # Send requests in parallel
    with ThreadPoolExecutor(max_workers=TEST_CONFIG["concurrent_requests"]) as executor:
        request_count = 0
        while time.time() - start_time < TEST_CONFIG["test_duration"]:
            # Select a random command
            import random
            command = random.choice(SAMPLE_COMMANDS)
            
            # Submit request
            future = executor.submit(send_request, command)
            request_count += 1
            
            # Log progress
            if request_count % 10 == 0:
                logger.info(f"Sent {request_count} requests")
            
            # Wait a bit before sending the next request
            time.sleep(TEST_CONFIG["request_delay"])
    
    # Wait for memory tracking thread to finish
    memory_thread.join(timeout=1.0)
    
    # Get final memory stats
    final_stats = get_memory_stats()
    logger.info(f"Final memory stats: {json.dumps(final_stats, indent=2)}")
    
    # Trigger memory optimization
    logger.info("Triggering memory optimization")
    optimization_results = trigger_memory_optimization(aggressive=True)
    logger.info(f"Optimization results: {json.dumps(optimization_results, indent=2)}")
    
    # Get memory stats after optimization
    post_optimization_stats = get_memory_stats()
    logger.info(f"Post-optimization memory stats: {json.dumps(post_optimization_stats, indent=2)}")
    
    logger.info(f"Load test completed. Sent {request_count} requests.")
    
    return memory_usage_data

def plot_memory_usage(memory_usage_data: List[Tuple[float, float]]):
    """
    Plot memory usage over time
    
    Args:
        memory_usage_data: List of (timestamp, memory_usage) tuples
    """
    if not memory_usage_data:
        logger.warning("No memory usage data to plot")
        return
    
    # Extract data
    timestamps = [data[0] for data in memory_usage_data]
    memory_usage = [data[1] for data in memory_usage_data]
    
    # Create plot
    plt.figure(figsize=(10, 6))
    plt.plot(timestamps, memory_usage, 'b-', linewidth=2)
    plt.xlabel('Time (seconds)')
    plt.ylabel('Memory Usage (MB)')
    plt.title('Memory Usage Over Time')
    plt.grid(True)
    
    # Add trend line
    if len(timestamps) > 1:
        z = np.polyfit(timestamps, memory_usage, 1)
        p = np.poly1d(z)
        plt.plot(timestamps, p(timestamps), "r--", linewidth=1)
        
        # Calculate slope
        slope = z[0]
        if slope > 0:
            trend_text = f"Trend: Increasing ({slope:.2f} MB/s)"
        elif slope < 0:
            trend_text = f"Trend: Decreasing ({slope:.2f} MB/s)"
        else:
            trend_text = "Trend: Stable"
        
        plt.text(0.05, 0.95, trend_text, transform=plt.gca().transAxes, 
                 verticalalignment='top', bbox=dict(boxstyle='round', facecolor='white', alpha=0.5))
    
    # Save plot
    plt.savefig("memory_usage.png")
    logger.info("Memory usage plot saved to memory_usage.png")
    
    # Show plot
    plt.show()

def main():
    """Main function"""
    logger.info("Memory Optimization Test for Segmentation Service")
    
    # Check if service is running
    try:
        response = requests.get(f"{TEST_CONFIG['base_url']}/health")
        if response.status_code != 200:
            logger.error(f"Service is not healthy: {response.status_code}")
            return
    except Exception as e:
        logger.error(f"Error connecting to service: {e}")
        logger.error(f"Make sure the service is running at {TEST_CONFIG['base_url']}")
        return
    
    # Run load test
    memory_usage_data = run_load_test()
    
    # Plot results
    if TEST_CONFIG["plot_results"]:
        plot_memory_usage(memory_usage_data)

if __name__ == "__main__":
    main()
