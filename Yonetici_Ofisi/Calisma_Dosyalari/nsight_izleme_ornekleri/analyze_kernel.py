#!/usr/bin/env python3
"""
Nsight Compute çekirdek analiz scripti.

Bu script, Nsight Compute tarafından oluşturulan .ncu-rep dosyalarını analiz eder
ve çekirdek performans metriklerini JSON formatında çıktı olarak verir.

Kullanım:
    python analyze_kernel.py <kernel_profile.ncu-rep>
"""

import sys
import os
import json
import subprocess
import re
import tempfile
from typing import Dict, List, Any, Optional, Tuple

def run_ncu_stats(profile_file: str) -> str:
    """
    Nsight Compute stats komutunu çalıştırır ve çıktıyı döndürür.
    
    Args:
        profile_file: Profil dosyasının yolu
        
    Returns:
        stats komutunun çıktısı
    """
    cmd = ["ncu", "--csv", "--page", "raw", "--import", profile_file]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error running ncu stats: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    
    return result.stdout

def parse_kernel_metrics(stats_output: str) -> List[Dict[str, Any]]:
    """
    Çekirdek metriklerini ayrıştırır.
    
    Args:
        stats_output: ncu stats komutunun çıktısı
        
    Returns:
        Çekirdek metrikleri listesi
    """
    kernel_metrics = []
    
    # CSV formatını ayrıştır
    lines = stats_output.strip().split("\n")
    if len(lines) < 2:
        return kernel_metrics
    
    # Başlık satırını ayrıştır
    headers = [h.strip() for h in lines[0].split(",")]
    
    # Çekirdek satırlarını ayrıştır
    for line in lines[1:]:
        if not line.strip():
            continue
        
        # CSV alanlarını ayrıştır (tırnak içindeki virgülleri koru)
        values = []
        in_quotes = False
        current_value = ""
        
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                values.append(current_value.strip())
                current_value = ""
            else:
                current_value += char
        
        # Son değeri ekle
        values.append(current_value.strip())
        
        # Başlık ve değerleri eşleştir
        kernel = {}
        for i, header in enumerate(headers):
            if i < len(values):
                value = values[i]
                
                # Tırnak işaretlerini kaldır
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                
                try:
                    # Sayısal değerleri dönüştür
                    if value.replace(".", "", 1).isdigit():
                        kernel[header] = float(value)
                    else:
                        kernel[header] = value
                except ValueError:
                    kernel[header] = value
        
        kernel_metrics.append(kernel)
    
    return kernel_metrics

def extract_kernel_details(profile_file: str) -> Dict[str, Any]:
    """
    Profil dosyasından çekirdek detaylarını çıkarır.
    
    Args:
        profile_file: Profil dosyasının yolu
        
    Returns:
        Çekirdek detayları
    """
    kernel_details = {}
    
    # Çekirdek detaylarını çıkar
    cmd = ["ncu", "--csv", "--page", "details", "--import", profile_file]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error extracting kernel details: {result.stderr}", file=sys.stderr)
        return kernel_details
    
    # CSV formatını ayrıştır
    lines = result.stdout.strip().split("\n")
    if len(lines) < 2:
        return kernel_details
    
    # Başlık satırını ayrıştır
    headers = [h.strip() for h in lines[0].split(",")]
    
    # Detay satırlarını ayrıştır
    details = {}
    for line in lines[1:]:
        if not line.strip():
            continue
        
        # CSV alanlarını ayrıştır
        values = []
        in_quotes = False
        current_value = ""
        
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                values.append(current_value.strip())
                current_value = ""
            else:
                current_value += char
        
        # Son değeri ekle
        values.append(current_value.strip())
        
        # Başlık ve değerleri eşleştir
        for i, header in enumerate(headers):
            if i < len(values):
                value = values[i]
                
                # Tırnak işaretlerini kaldır
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                
                try:
                    # Sayısal değerleri dönüştür
                    if value.replace(".", "", 1).isdigit():
                        details[header] = float(value)
                    else:
                        details[header] = value
                except ValueError:
                    details[header] = value
    
    kernel_details["details"] = details
    
    return kernel_details

def analyze_kernel_profile(profile_file: str) -> Dict[str, Any]:
    """
    Çekirdek profil dosyasını analiz eder ve performans metriklerini döndürür.
    
    Args:
        profile_file: Profil dosyasının yolu
        
    Returns:
        Performans metrikleri
    """
    if not os.path.exists(profile_file):
        print(f"Error: Profile file '{profile_file}' not found", file=sys.stderr)
        sys.exit(1)
    
    # ncu stats komutunu çalıştır
    stats_output = run_ncu_stats(profile_file)
    
    # Metrikleri ayrıştır
    kernel_metrics = parse_kernel_metrics(stats_output)
    kernel_details = extract_kernel_details(profile_file)
    
    # Tüm metrikleri birleştir
    metrics = {
        "profile_file": profile_file,
        "kernels": kernel_metrics,
        "details": kernel_details
    }
    
    # Özet metrikler
    summary = {}
    
    if kernel_metrics:
        # Çekirdek sayısı
        summary["kernel_count"] = len(kernel_metrics)
        
        # Çekirdek adı
        if "Kernel Name" in kernel_metrics[0]:
            summary["kernel_name"] = kernel_metrics[0]["Kernel Name"]
        
        # Çekirdek süresi
        if "Duration" in kernel_metrics[0]:
            durations = [k["Duration"] for k in kernel_metrics if "Duration" in k]
            summary["avg_duration_ns"] = sum(durations) / len(durations)
            summary["avg_duration_ms"] = summary["avg_duration_ns"] / 1_000_000
            summary["min_duration_ns"] = min(durations)
            summary["min_duration_ms"] = summary["min_duration_ns"] / 1_000_000
            summary["max_duration_ns"] = max(durations)
            summary["max_duration_ms"] = summary["max_duration_ns"] / 1_000_000
        
        # SM etkinliği
        sm_efficiency_key = next((k for k in kernel_metrics[0].keys() if "sm__throughput" in k.lower()), None)
        if sm_efficiency_key:
            sm_efficiencies = [k[sm_efficiency_key] for k in kernel_metrics if sm_efficiency_key in k]
            summary["avg_sm_efficiency"] = sum(sm_efficiencies) / len(sm_efficiencies)
        
        # Bellek throughput
        mem_throughput_key = next((k for k in kernel_metrics[0].keys() if "dram__throughput" in k.lower()), None)
        if mem_throughput_key:
            mem_throughputs = [k[mem_throughput_key] for k in kernel_metrics if mem_throughput_key in k]
            summary["avg_memory_throughput"] = sum(mem_throughputs) / len(mem_throughputs)
        
        # Warp yürütme etkinliği
        warp_efficiency_key = next((k for k in kernel_metrics[0].keys() if "warp__execution_efficiency" in k.lower()), None)
        if warp_efficiency_key:
            warp_efficiencies = [k[warp_efficiency_key] for k in kernel_metrics if warp_efficiency_key in k]
            summary["avg_warp_execution_efficiency"] = sum(warp_efficiencies) / len(warp_efficiencies)
    
    metrics["summary"] = summary
    
    # Optimizasyon önerileri
    recommendations = []
    
    # SM etkinliği düşükse
    if "avg_sm_efficiency" in summary and summary["avg_sm_efficiency"] < 60:
        recommendations.append({
            "issue": "Low SM Efficiency",
            "description": "Streaming Multiprocessor utilization is below optimal levels.",
            "recommendation": "Consider increasing parallelism or reducing thread divergence."
        })
    
    # Warp yürütme etkinliği düşükse
    if "avg_warp_execution_efficiency" in summary and summary["avg_warp_execution_efficiency"] < 70:
        recommendations.append({
            "issue": "Low Warp Execution Efficiency",
            "description": "Warps are not executing efficiently, possibly due to thread divergence.",
            "recommendation": "Reduce conditional branches or ensure they align with warp boundaries."
        })
    
    # Bellek throughput düşükse
    if "avg_memory_throughput" in summary and summary["avg_memory_throughput"] < 100:
        recommendations.append({
            "issue": "Low Memory Throughput",
            "description": "Memory access patterns may not be optimal.",
            "recommendation": "Ensure memory accesses are coalesced and consider using shared memory."
        })
    
    metrics["recommendations"] = recommendations
    
    return metrics

def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <kernel_profile.ncu-rep>", file=sys.stderr)
        sys.exit(1)
    
    profile_file = sys.argv[1]
    metrics = analyze_kernel_profile(profile_file)
    
    # JSON formatında çıktı ver
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__":
    main()
