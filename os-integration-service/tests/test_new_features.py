#!/usr/bin/env python3
import os
import sys
import json
import requests
import time
import platform

# Test script for OS Integration Service
# This script tests the new functionality added to the service

BASE_URL = "http://localhost:8080"

def test_api_endpoint(endpoint, method="GET", data=None, expected_status=200):
    """Test an API endpoint and return the response"""
    url = f"{BASE_URL}{endpoint}"
    print(f"Testing {method} {url}...")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        else:
            print(f"Unsupported method: {method}")
            return None
        
        if response.status_code == expected_status:
            print(f"✅ Success: {response.status_code}")
            try:
                return response.json()
            except:
                return response.text
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_filesystem_monitoring():
    """Test filesystem monitoring functionality"""
    print("\n=== Testing Filesystem Monitoring ===")
    
    # Create a test directory
    test_dir = os.path.join(os.getcwd(), "test_monitor_dir")
    os.makedirs(test_dir, exist_ok=True)
    
    # Start monitoring
    monitor_response = test_api_endpoint(
        "/api/monitor/start", 
        method="POST", 
        data={"path": test_dir}
    )
    
    if not monitor_response:
        return False
    
    watcher_id = monitor_response.get("watcher_id")
    if not watcher_id:
        print("❌ Failed to get watcher_id")
        return False
    
    print(f"Started monitoring with ID: {watcher_id}")
    
    # Create a test file
    test_file = os.path.join(test_dir, "test_file.txt")
    with open(test_file, "w") as f:
        f.write("Test content")
    
    # Wait for events to be processed
    time.sleep(2)
    
    # Get events
    events = test_api_endpoint("/api/monitor/events")
    print(f"Events: {json.dumps(events, indent=2)}")
    
    # Stop monitoring
    stop_response = test_api_endpoint(
        "/api/monitor/stop", 
        method="POST", 
        data={"watcher_id": watcher_id}
    )
    
    # Clean up
    os.remove(test_file)
    os.rmdir(test_dir)
    
    return True

def test_app_control():
    """Test application control functionality"""
    print("\n=== Testing Application Control ===")
    
    # List windows
    windows = test_api_endpoint("/api/app/list")
    if not windows:
        return False
    
    print(f"Found {len(windows)} windows")
    
    if len(windows) > 0:
        # Try to find a window by title
        window = windows[0]
        title = window.get("title")
        
        if title:
            find_response = test_api_endpoint(
                "/api/app/find", 
                method="POST", 
                data={"title": title}
            )
            
            if find_response:
                print(f"Successfully found window with title: {title}")
    
    return True

def test_registry_access():
    """Test registry access functionality (Windows only)"""
    if platform.system() != "Windows":
        print("\n=== Skipping Registry Access Tests (Windows Only) ===")
        return True
    
    print("\n=== Testing Registry Access ===")
    
    # Test reading a registry value
    read_response = test_api_endpoint(
        "/api/registry/read_string", 
        method="POST", 
        data={
            "root_key": "HKEY_CURRENT_USER",
            "sub_key": "Software\\Microsoft\\Windows\\CurrentVersion\\Explorer",
            "value_name": "ShellState"
        }
    )
    
    # Test writing a registry value (using a test key)
    write_response = test_api_endpoint(
        "/api/registry/write_string", 
        method="POST", 
        data={
            "root_key": "HKEY_CURRENT_USER",
            "sub_key": "Software\\ALT_LAS_Test",
            "value_name": "TestValue",
            "data": "TestData"
        }
    )
    
    # Test reading the value we just wrote
    read_test_response = test_api_endpoint(
        "/api/registry/read_string", 
        method="POST", 
        data={
            "root_key": "HKEY_CURRENT_USER",
            "sub_key": "Software\\ALT_LAS_Test",
            "value_name": "TestValue"
        }
    )
    
    # Test deleting the value
    delete_response = test_api_endpoint(
        "/api/registry/delete_value", 
        method="POST", 
        data={
            "root_key": "HKEY_CURRENT_USER",
            "sub_key": "Software\\ALT_LAS_Test",
            "value_name": "TestValue"
        }
    )
    
    return True

def main():
    print(f"Testing OS Integration Service at {BASE_URL}")
    
    # Test platform info endpoint to verify service is running
    platform_info = test_api_endpoint("/api/platform/info")
    if not platform_info:
        print("❌ Service is not running or not accessible")
        return
    
    print(f"Service is running on: {platform_info}")
    
    # Test new functionality
    test_filesystem_monitoring()
    test_app_control()
    test_registry_access()
    
    print("\n=== Testing Complete ===")

if __name__ == "__main__":
    main()
