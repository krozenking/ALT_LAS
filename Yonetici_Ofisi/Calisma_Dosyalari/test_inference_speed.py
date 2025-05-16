"""
Çıkarım Hızı Performans Testi

Bu test, farklı model boyutları için çıkarım hızını ölçer.
"""

import os
import time
import pytest
import numpy as np
import torch
import tensorflow as tf
from transformers import AutoModelForCausalLM, AutoTokenizer
import logging
import json
import platform
import subprocess
from pathlib import Path

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("test_inference_speed")

# Test yapılandırması
TEST_CONFIG = {
    "small_model": {
        "name": "gpt2",
        "type": "causal_lm",
        "input_length": 128,
        "output_length": 32,
        "batch_sizes": [1, 2, 4, 8, 16],
        "iterations": 10,
        "warmup_iterations": 3
    },
    "medium_model": {
        "name": "gpt2-medium",
        "type": "causal_lm",
        "input_length": 128,
        "output_length": 32,
        "batch_sizes": [1, 2, 4, 8],
        "iterations": 10,
        "warmup_iterations": 3
    },
    "large_model": {
        "name": "gpt2-large",
        "type": "causal_lm",
        "input_length": 128,
        "output_length": 32,
        "batch_sizes": [1, 2, 4],
        "iterations": 5,
        "warmup_iterations": 2
    }
}

# GPU bilgilerini al
def get_gpu_info():
    """GPU bilgilerini al."""
    try:
        # NVIDIA-SMI komutunu çalıştır
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,driver_version,memory.total,compute_capability", "--format=csv,noheader"],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Çıktıyı işle
        gpu_info = {}
        for i, line in enumerate(result.stdout.strip().split("\n")):
            name, driver_version, memory_total, compute_capability = line.split(", ")
            gpu_info[f"gpu_{i}"] = {
                "name": name,
                "driver_version": driver_version,
                "memory_total": memory_total,
                "compute_capability": compute_capability
            }
        
        return gpu_info
    except Exception as e:
        logger.error(f"GPU bilgileri alınamadı: {e}")
        return {"error": str(e)}

# CUDA bilgilerini al
def get_cuda_info():
    """CUDA bilgilerini al."""
    try:
        # nvcc --version komutunu çalıştır
        result = subprocess.run(
            ["nvcc", "--version"],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Çıktıyı işle
        cuda_info = {}
        for line in result.stdout.strip().split("\n"):
            if "release" in line:
                cuda_info["version"] = line.split("release ")[1].split(",")[0]
                break
        
        return cuda_info
    except Exception as e:
        logger.error(f"CUDA bilgileri alınamadı: {e}")
        return {"error": str(e)}

# Sistem bilgilerini al
def get_system_info():
    """Sistem bilgilerini al."""
    system_info = {
        "platform": platform.platform(),
        "processor": platform.processor(),
        "python_version": platform.python_version(),
        "torch_version": torch.__version__,
        "tensorflow_version": tf.__version__,
        "gpu_info": get_gpu_info(),
        "cuda_info": get_cuda_info()
    }
    
    return system_info

# Test sonuçlarını kaydet
def save_test_results(model_name, batch_size, results, system_info):
    """Test sonuçlarını kaydet."""
    # Sonuç dizinini oluştur
    results_dir = Path("/app/test_results/inference_speed")
    results_dir.mkdir(parents=True, exist_ok=True)
    
    # Sonuç dosyasını oluştur
    result_file = results_dir / f"{model_name}_batch_{batch_size}.json"
    
    # Sonuçları kaydet
    with open(result_file, "w") as f:
        json.dump({
            "model_name": model_name,
            "batch_size": batch_size,
            "results": results,
            "system_info": system_info
        }, f, indent=2)
    
    logger.info(f"Test sonuçları kaydedildi: {result_file}")

# PyTorch modeli ile çıkarım hızını ölç
@pytest.mark.parametrize("model_config_name", ["small_model", "medium_model", "large_model"])
@pytest.mark.parametrize("framework", ["pytorch", "tensorflow"])
def test_inference_speed(benchmark, model_config_name, framework):
    """Çıkarım hızını ölç."""
    # Test yapılandırmasını al
    model_config = TEST_CONFIG[model_config_name]
    model_name = model_config["name"]
    input_length = model_config["input_length"]
    output_length = model_config["output_length"]
    batch_sizes = model_config["batch_sizes"]
    iterations = model_config["iterations"]
    warmup_iterations = model_config["warmup_iterations"]
    
    # Sistem bilgilerini al
    system_info = get_system_info()
    logger.info(f"Sistem bilgileri: {json.dumps(system_info, indent=2)}")
    
    # Her batch boyutu için test et
    for batch_size in batch_sizes:
        logger.info(f"Model: {model_name}, Batch Boyutu: {batch_size}, Framework: {framework}")
        
        # PyTorch ile test
        if framework == "pytorch":
            # Modeli yükle
            model = AutoModelForCausalLM.from_pretrained(model_name)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # GPU'ya taşı
            if torch.cuda.is_available():
                model = model.cuda()
                logger.info(f"Model GPU'ya taşındı: {torch.cuda.get_device_name(0)}")
            else:
                logger.warning("GPU bulunamadı, CPU kullanılıyor")
            
            # Giriş verilerini oluştur
            input_text = "Bu bir test cümlesidir. " * (input_length // 5)
            inputs = tokenizer(
                [input_text] * batch_size,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=input_length
            )
            
            # GPU'ya taşı
            if torch.cuda.is_available():
                inputs = {k: v.cuda() for k, v in inputs.items()}
            
            # Isınma turu
            logger.info(f"Isınma turu başlatılıyor ({warmup_iterations} iterasyon)...")
            for _ in range(warmup_iterations):
                with torch.no_grad():
                    outputs = model.generate(
                        inputs["input_ids"],
                        max_length=input_length + output_length,
                        num_return_sequences=1
                    )
            
            # Çıkarım hızını ölç
            logger.info(f"Çıkarım hızı ölçümü başlatılıyor ({iterations} iterasyon)...")
            results = []
            
            def run_inference():
                start_time = time.time()
                with torch.no_grad():
                    outputs = model.generate(
                        inputs["input_ids"],
                        max_length=input_length + output_length,
                        num_return_sequences=1
                    )
                end_time = time.time()
                inference_time = end_time - start_time
                tokens_per_second = (batch_size * output_length) / inference_time
                return inference_time, tokens_per_second
            
            # Benchmark ile ölç
            result = benchmark(run_inference)
            
            # Sonuçları kaydet
            save_test_results(model_name, batch_size, {
                "framework": framework,
                "inference_time": result[0],
                "tokens_per_second": result[1]
            }, system_info)
        
        # TensorFlow ile test
        elif framework == "tensorflow":
            # TensorFlow ile test kodları buraya eklenecek
            pass
        
        else:
            logger.error(f"Desteklenmeyen framework: {framework}")
            pytest.fail(f"Desteklenmeyen framework: {framework}")

if __name__ == "__main__":
    # Doğrudan çalıştırma için
    pytest.main(["-v", __file__])
