#!/usr/bin/env python3
"""
Nsight Systems profil analiz scripti.

Bu script, Nsight Systems tarafından oluşturulan .nsys-rep dosyalarını analiz eder
ve performans metriklerini JSON formatında çıktı olarak verir.

Kullanım:
    python analyze_profile.py <profile_file.nsys-rep>
"""

import sys
import os
import json
import subprocess
import re
import tempfile
from typing import Dict, List, Any, Optional, Tuple

def run_nsys_stats(profile_file: str) -> str:
    """
    Nsight Systems stats komutunu çalıştırır ve çıktıyı döndürür.
    
    Args:
        profile_file: Profil dosyasının yolu
        
    Returns:
        stats komutunun çıktısı
    """
    cmd = ["nsys", "stats", "--report", "cudaapisum,gpukernsum", "--format", "csv", profile_file]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error running nsys stats: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    
    return result.stdout

def parse_cuda_api_summary(stats_output: str) -> Dict[str, Any]:
    """
    CUDA API özet bölümünü ayrıştırır.
    
    Args:
        stats_output: nsys stats komutunun çıktısı
        
    Returns:
        CUDA API özet metrikleri
    """
    api_summary = {}
    
    # CUDA API özet bölümünü bul
    api_section_match = re.search(r"CUDA API Statistics(.+?)(?=\n\n)", stats_output, re.DOTALL)
    if not api_section_match:
        return api_summary
    
    api_section = api_section_match.group(1)
    
    # CSV formatını ayrıştır
    lines = api_section.strip().split("\n")
    if len(lines) < 2:
        return api_summary
    
    # Başlık satırını ayrıştır
    headers = [h.strip() for h in lines[0].split(",")]
    
    # Toplam satırını bul
    total_line = None
    for line in lines[1:]:
        if "Total" in line:
            total_line = line
            break
    
    if not total_line:
        return api_summary
    
    # Toplam değerleri ayrıştır
    values = [v.strip() for v in total_line.split(",")]
    
    # Başlık ve değerleri eşleştir
    for i, header in enumerate(headers):
        if i < len(values):
            try:
                # Sayısal değerleri dönüştür
                if values[i].replace(".", "", 1).isdigit():
                    api_summary[header] = float(values[i])
                else:
                    api_summary[header] = values[i]
            except ValueError:
                api_summary[header] = values[i]
    
    return api_summary

def parse_gpu_kernel_summary(stats_output: str) -> Dict[str, Any]:
    """
    GPU çekirdek özet bölümünü ayrıştırır.
    
    Args:
        stats_output: nsys stats komutunun çıktısı
        
    Returns:
        GPU çekirdek özet metrikleri
    """
    kernel_summary = {}
    
    # GPU çekirdek özet bölümünü bul
    kernel_section_match = re.search(r"CUDA Kernel Statistics(.+?)(?=\n\n|$)", stats_output, re.DOTALL)
    if not kernel_section_match:
        return kernel_summary
    
    kernel_section = kernel_section_match.group(1)
    
    # CSV formatını ayrıştır
    lines = kernel_section.strip().split("\n")
    if len(lines) < 2:
        return kernel_summary
    
    # Başlık satırını ayrıştır
    headers = [h.strip() for h in lines[0].split(",")]
    
    # Çekirdek satırlarını ayrıştır
    kernels = []
    for line in lines[1:]:
        if not line.strip():
            continue
        
        values = [v.strip() for v in line.split(",")]
        kernel = {}
        
        for i, header in enumerate(headers):
            if i < len(values):
                try:
                    # Sayısal değerleri dönüştür
                    if values[i].replace(".", "", 1).isdigit():
                        kernel[header] = float(values[i])
                    else:
                        kernel[header] = values[i]
                except ValueError:
                    kernel[header] = values[i]
        
        kernels.append(kernel)
    
    # Toplam ve ortalama değerleri hesapla
    if kernels:
        kernel_summary["kernels"] = kernels
        kernel_summary["kernel_count"] = len(kernels)
        
        # Toplam çalışma süresi
        if "Duration (ns)" in kernels[0]:
            total_duration_ns = sum(k["Duration (ns)"] for k in kernels)
            kernel_summary["total_duration_ns"] = total_duration_ns
            kernel_summary["total_duration_ms"] = total_duration_ns / 1_000_000
            
            # Ortalama çalışma süresi
            kernel_summary["avg_duration_ns"] = total_duration_ns / len(kernels)
            kernel_summary["avg_duration_ms"] = kernel_summary["avg_duration_ns"] / 1_000_000
        
        # En uzun çalışan çekirdek
        if "Duration (ns)" in kernels[0]:
            longest_kernel = max(kernels, key=lambda k: k["Duration (ns)"])
            kernel_summary["longest_kernel"] = {
                "name": longest_kernel.get("Name", "Unknown"),
                "duration_ns": longest_kernel.get("Duration (ns)", 0),
                "duration_ms": longest_kernel.get("Duration (ns)", 0) / 1_000_000
            }
    
    return kernel_summary

def extract_timeline_metrics(profile_file: str) -> Dict[str, Any]:
    """
    Profil dosyasından zaman çizelgesi metriklerini çıkarır.
    
    Args:
        profile_file: Profil dosyasının yolu
        
    Returns:
        Zaman çizelgesi metrikleri
    """
    timeline_metrics = {}
    
    # Geçici bir SQLite dosyası oluştur
    with tempfile.NamedTemporaryFile(suffix='.sqlite') as temp_file:
        # Profil dosyasını SQLite formatına dönüştür
        cmd = ["nsys", "export", "--type", "sqlite", "--output", temp_file.name, profile_file]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Error exporting to SQLite: {result.stderr}", file=sys.stderr)
            return timeline_metrics
        
        # SQLite dosyasını sorgula
        try:
            import sqlite3
            
            conn = sqlite3.connect(temp_file.name)
            cursor = conn.cursor()
            
            # Toplam uygulama çalışma süresi
            cursor.execute("SELECT MIN(start), MAX(end) FROM CUPTI_ACTIVITY_KIND_RUNTIME")
            start, end = cursor.fetchone()
            if start is not None and end is not None:
                timeline_metrics["application_duration_ns"] = end - start
                timeline_metrics["application_duration_ms"] = (end - start) / 1_000_000
            
            # GPU kullanım oranı
            cursor.execute("""
                SELECT SUM(end - start) FROM CUPTI_ACTIVITY_KIND_CONCURRENT_KERNEL
            """)
            total_kernel_time = cursor.fetchone()[0] or 0
            
            if "application_duration_ns" in timeline_metrics and timeline_metrics["application_duration_ns"] > 0:
                timeline_metrics["gpu_utilization_percent"] = (total_kernel_time / timeline_metrics["application_duration_ns"]) * 100
            
            # Bellek transferleri
            cursor.execute("""
                SELECT SUM(bytes) FROM CUPTI_ACTIVITY_KIND_MEMCPY
                WHERE copyKind = 1 -- Host to Device
            """)
            h2d_bytes = cursor.fetchone()[0] or 0
            
            cursor.execute("""
                SELECT SUM(bytes) FROM CUPTI_ACTIVITY_KIND_MEMCPY
                WHERE copyKind = 2 -- Device to Host
            """)
            d2h_bytes = cursor.fetchone()[0] or 0
            
            timeline_metrics["host_to_device_bytes"] = h2d_bytes
            timeline_metrics["device_to_host_bytes"] = d2h_bytes
            timeline_metrics["total_transfer_bytes"] = h2d_bytes + d2h_bytes
            
            # Bellek transfer süreleri
            cursor.execute("""
                SELECT SUM(end - start) FROM CUPTI_ACTIVITY_KIND_MEMCPY
                WHERE copyKind = 1 -- Host to Device
            """)
            h2d_time = cursor.fetchone()[0] or 0
            
            cursor.execute("""
                SELECT SUM(end - start) FROM CUPTI_ACTIVITY_KIND_MEMCPY
                WHERE copyKind = 2 -- Device to Host
            """)
            d2h_time = cursor.fetchone()[0] or 0
            
            timeline_metrics["host_to_device_time_ns"] = h2d_time
            timeline_metrics["host_to_device_time_ms"] = h2d_time / 1_000_000
            timeline_metrics["device_to_host_time_ns"] = d2h_time
            timeline_metrics["device_to_host_time_ms"] = d2h_time / 1_000_000
            timeline_metrics["total_transfer_time_ns"] = h2d_time + d2h_time
            timeline_metrics["total_transfer_time_ms"] = (h2d_time + d2h_time) / 1_000_000
            
            conn.close()
            
        except ImportError:
            print("Warning: sqlite3 module not available, skipping timeline metrics", file=sys.stderr)
        except Exception as e:
            print(f"Error querying SQLite database: {e}", file=sys.stderr)
    
    return timeline_metrics

def analyze_profile(profile_file: str) -> Dict[str, Any]:
    """
    Profil dosyasını analiz eder ve performans metriklerini döndürür.
    
    Args:
        profile_file: Profil dosyasının yolu
        
    Returns:
        Performans metrikleri
    """
    if not os.path.exists(profile_file):
        print(f"Error: Profile file '{profile_file}' not found", file=sys.stderr)
        sys.exit(1)
    
    # nsys stats komutunu çalıştır
    stats_output = run_nsys_stats(profile_file)
    
    # Metrikleri ayrıştır
    cuda_api_metrics = parse_cuda_api_summary(stats_output)
    kernel_metrics = parse_gpu_kernel_summary(stats_output)
    timeline_metrics = extract_timeline_metrics(profile_file)
    
    # Tüm metrikleri birleştir
    metrics = {
        "profile_file": profile_file,
        "cuda_api": cuda_api_metrics,
        "kernels": kernel_metrics,
        "timeline": timeline_metrics
    }
    
    # Özet metrikler
    summary = {}
    
    # Kernel metrikleri
    if "avg_duration_ms" in kernel_metrics:
        summary["avg_kernel_time"] = kernel_metrics["avg_duration_ms"]
    if "total_duration_ms" in kernel_metrics:
        summary["total_kernel_time"] = kernel_metrics["total_duration_ms"]
    if "kernel_count" in kernel_metrics:
        summary["kernel_count"] = kernel_metrics["kernel_count"]
    
    # Timeline metrikleri
    if "application_duration_ms" in timeline_metrics:
        summary["application_time"] = timeline_metrics["application_duration_ms"]
    if "gpu_utilization_percent" in timeline_metrics:
        summary["gpu_utilization"] = timeline_metrics["gpu_utilization_percent"]
    if "total_transfer_bytes" in timeline_metrics:
        summary["memory_transfer_mb"] = timeline_metrics["total_transfer_bytes"] / (1024 * 1024)
    if "total_transfer_time_ms" in timeline_metrics:
        summary["memory_transfer_time"] = timeline_metrics["total_transfer_time_ms"]
    
    # CUDA API metrikleri
    if "Time (%)" in cuda_api_metrics:
        summary["cuda_api_time_percent"] = cuda_api_metrics["Time (%)"]
    if "Total Time (ns)" in cuda_api_metrics:
        summary["cuda_api_time"] = cuda_api_metrics["Total Time (ns)"] / 1_000_000
    
    metrics["summary"] = summary
    
    return metrics

def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <profile_file.nsys-rep>", file=sys.stderr)
        sys.exit(1)
    
    profile_file = sys.argv[1]
    metrics = analyze_profile(profile_file)
    
    # JSON formatında çıktı ver
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__":
    main()
