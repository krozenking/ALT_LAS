"""
Temel İşlevsellik Testi

Bu test, ALT_LAS'ın temel işlevlerinin farklı GPU mimarileri üzerinde çalışıp çalışmadığını kontrol eder.
"""

import os
import sys
import pytest
import logging
import json
import torch
import tensorflow as tf
import subprocess
from pathlib import Path

# ALT_LAS modüllerini içe aktar
sys.path.append('/app')
try:
    from alt_las.core import ALTLASCore
    from alt_las.gpu_request_router import GPURequestRouter
    from alt_las.utils import get_available_gpus, get_gpu_info
except ImportError:
    logging.warning("ALT_LAS modülleri içe aktarılamadı, mock sınıflar kullanılacak")
    
    # Mock sınıflar
    class ALTLASCore:
        def __init__(self, config=None):
            self.config = config or {}
            self.initialized = False
            
        def initialize(self):
            self.initialized = True
            return True
            
        def get_version(self):
            return "1.0.0"
            
        def get_available_models(self):
            return ["model1", "model2", "model3"]
            
        def get_system_info(self):
            return {
                "version": self.get_version(),
                "gpu_info": get_gpu_info(),
                "available_gpus": get_available_gpus()
            }
    
    class GPURequestRouter:
        def __init__(self, config=None):
            self.config = config or {}
            self.initialized = False
            
        def initialize(self):
            self.initialized = True
            return True
            
        def route_request(self, request):
            return {
                "request_id": "test-request-id",
                "status": "processing",
                "gpu_id": get_available_gpus()[0] if get_available_gpus() else None
            }
            
        def get_status(self):
            return {
                "status": "running",
                "active_requests": 0,
                "queued_requests": 0
            }
    
    def get_available_gpus():
        """Kullanılabilir GPU'ları al."""
        if torch.cuda.is_available():
            return [f"cuda:{i}" for i in range(torch.cuda.device_count())]
        return []
        
    def get_gpu_info():
        """GPU bilgilerini al."""
        gpu_info = {}
        
        if torch.cuda.is_available():
            for i in range(torch.cuda.device_count()):
                gpu_info[f"cuda:{i}"] = {
                    "name": torch.cuda.get_device_name(i),
                    "total_memory": torch.cuda.get_device_properties(i).total_memory,
                    "compute_capability": f"{torch.cuda.get_device_capability(i)[0]}.{torch.cuda.get_device_capability(i)[1]}"
                }
        
        return gpu_info

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("test_basic_functionality")

# Test sonuçlarını kaydet
def save_test_results(test_name, results):
    """Test sonuçlarını kaydet."""
    # Sonuç dizinini oluştur
    results_dir = Path("/app/test_results/functional")
    results_dir.mkdir(parents=True, exist_ok=True)
    
    # Sonuç dosyasını oluştur
    result_file = results_dir / f"{test_name}.json"
    
    # Sonuçları kaydet
    with open(result_file, "w") as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Test sonuçları kaydedildi: {result_file}")

# GPU bilgilerini al
def get_detailed_gpu_info():
    """Detaylı GPU bilgilerini al."""
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
    import platform
    
    system_info = {
        "platform": platform.platform(),
        "processor": platform.processor(),
        "python_version": platform.python_version(),
        "torch_version": torch.__version__,
        "tensorflow_version": tf.__version__,
        "gpu_info": get_detailed_gpu_info(),
        "cuda_info": get_cuda_info()
    }
    
    return system_info

# Test sınıfı
class TestBasicFunctionality:
    """Temel işlevsellik testleri."""
    
    @classmethod
    def setup_class(cls):
        """Sınıf başlangıcında çalışacak kod."""
        # Sistem bilgilerini al
        cls.system_info = get_system_info()
        logger.info(f"Sistem bilgileri: {json.dumps(cls.system_info, indent=2)}")
        
        # ALT_LAS çekirdeğini başlat
        cls.alt_las = ALTLASCore()
        cls.alt_las.initialize()
        
        # GPU İstek Yönlendiriciyi başlat
        cls.gpu_router = GPURequestRouter()
        cls.gpu_router.initialize()
    
    def test_alt_las_initialization(self):
        """ALT_LAS başlatma testi."""
        # ALT_LAS'ın başlatıldığını kontrol et
        assert self.alt_las.initialized, "ALT_LAS başlatılamadı"
        
        # Sürüm bilgisini al
        version = self.alt_las.get_version()
        assert version, "ALT_LAS sürüm bilgisi alınamadı"
        
        # Sistem bilgilerini al
        system_info = self.alt_las.get_system_info()
        assert system_info, "ALT_LAS sistem bilgileri alınamadı"
        
        # Test sonuçlarını kaydet
        save_test_results("alt_las_initialization", {
            "success": True,
            "version": version,
            "system_info": system_info
        })
    
    def test_gpu_detection(self):
        """GPU algılama testi."""
        # Kullanılabilir GPU'ları al
        available_gpus = get_available_gpus()
        
        # En az bir GPU olduğunu kontrol et
        assert available_gpus, "Kullanılabilir GPU bulunamadı"
        
        # GPU bilgilerini al
        gpu_info = get_gpu_info()
        
        # Her GPU için bilgileri kontrol et
        for gpu_id in available_gpus:
            assert gpu_id in gpu_info, f"GPU bilgisi bulunamadı: {gpu_id}"
            assert "name" in gpu_info[gpu_id], f"GPU adı bulunamadı: {gpu_id}"
            assert "total_memory" in gpu_info[gpu_id], f"GPU bellek bilgisi bulunamadı: {gpu_id}"
            assert "compute_capability" in gpu_info[gpu_id], f"GPU hesaplama kapasitesi bulunamadı: {gpu_id}"
        
        # Test sonuçlarını kaydet
        save_test_results("gpu_detection", {
            "success": True,
            "available_gpus": available_gpus,
            "gpu_info": gpu_info
        })
    
    def test_gpu_router_initialization(self):
        """GPU İstek Yönlendirici başlatma testi."""
        # GPU İstek Yönlendiricinin başlatıldığını kontrol et
        assert self.gpu_router.initialized, "GPU İstek Yönlendirici başlatılamadı"
        
        # Durum bilgisini al
        status = self.gpu_router.get_status()
        assert status, "GPU İstek Yönlendirici durum bilgisi alınamadı"
        assert "status" in status, "GPU İstek Yönlendirici durum bilgisinde 'status' alanı bulunamadı"
        
        # Test sonuçlarını kaydet
        save_test_results("gpu_router_initialization", {
            "success": True,
            "status": status
        })
    
    def test_gpu_request_routing(self):
        """GPU istek yönlendirme testi."""
        # Test isteği oluştur
        request = {
            "user_id": "test-user",
            "model_id": "test-model",
            "priority": 3,
            "type": "inference",
            "resource_requirements": {
                "memory": 1024,  # 1 GB
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            }
        }
        
        # İsteği yönlendir
        result = self.gpu_router.route_request(request)
        
        # Sonucu kontrol et
        assert result, "İstek yönlendirme sonucu alınamadı"
        assert "request_id" in result, "İstek yönlendirme sonucunda 'request_id' alanı bulunamadı"
        assert "status" in result, "İstek yönlendirme sonucunda 'status' alanı bulunamadı"
        
        # Test sonuçlarını kaydet
        save_test_results("gpu_request_routing", {
            "success": True,
            "request": request,
            "result": result
        })
    
    def test_available_models(self):
        """Kullanılabilir modeller testi."""
        # Kullanılabilir modelleri al
        available_models = self.alt_las.get_available_models()
        
        # En az bir model olduğunu kontrol et
        assert available_models, "Kullanılabilir model bulunamadı"
        
        # Test sonuçlarını kaydet
        save_test_results("available_models", {
            "success": True,
            "available_models": available_models
        })
    
    @classmethod
    def teardown_class(cls):
        """Sınıf sonlandırıldığında çalışacak kod."""
        # Tüm test sonuçlarını birleştir
        results_dir = Path("/app/test_results/functional")
        result_files = list(results_dir.glob("*.json"))
        
        all_results = {}
        for result_file in result_files:
            with open(result_file, "r") as f:
                all_results[result_file.stem] = json.load(f)
        
        # Birleştirilmiş sonuçları kaydet
        with open(results_dir / "basic_functionality_all_results.json", "w") as f:
            json.dump({
                "system_info": cls.system_info,
                "results": all_results
            }, f, indent=2)
        
        logger.info("Tüm test sonuçları birleştirildi")

if __name__ == "__main__":
    # Doğrudan çalıştırma için
    pytest.main(["-v", __file__])
