"""
GPU Meta Veri Toplayıcı

Bu modül, GPU kaynak kullanımı ve işlem süresi gibi performans metriklerini
toplayan ve API yanıtlarına ekleyen fonksiyonları içerir.

Örnek Kullanım:
    from gpu_metadata_collector import gpu_metrics_collector, MetricsTracer

    @app.route('/api/v1/predict', methods=['POST'])
    @gpu_metrics_collector
    def predict():
        # API işlemleri
        result = model.predict(request.json['data'])
        return jsonify(result)
"""

import time
import uuid
import json
import logging
from datetime import datetime
from functools import wraps
from typing import Dict, Any, Optional, List, Callable

import torch
import pynvml

# Yapılandırma
DEFAULT_CONFIG = {
    "enabled": True,
    "include_in_response": True,
    "detail_level": "standard",  # "minimal", "standard", "full"
    "sampling_rate": 1.0,        # 1.0 = tüm istekler, 0.1 = %10 örnekleme
    
    "components": {
        "processing_time": {
            "enabled": True,
            "include_components": True
        },
        
        "gpu_resources": {
            "enabled": True,
            "include_temperature": True,
            "include_utilization": True
        },
        
        "tracing": {
            "enabled": True,
            "propagate_headers": True
        }
    }
}

# Loglama
logger = logging.getLogger(__name__)


class MetricsTracer:
    """
    İşlem süresi ve GPU kaynak kullanımı gibi metrikleri izleyen sınıf.
    """
    
    _spans: Dict[str, Dict[str, Any]] = {}
    _current_request_id: Optional[str] = None
    _start_time: float = 0
    
    @classmethod
    def start_request(cls, request_id: Optional[str] = None) -> str:
        """
        Yeni bir istek izlemeye başlar.
        
        Args:
            request_id: İstek ID'si. None ise otomatik oluşturulur.
            
        Returns:
            İstek ID'si
        """
        if request_id is None:
            request_id = str(uuid.uuid4())
        
        cls._current_request_id = request_id
        cls._start_time = time.time()
        cls._spans = {}
        
        return request_id
    
    @classmethod
    def end_request(cls) -> Dict[str, Any]:
        """
        İstek izlemeyi sonlandırır ve toplanan metrikleri döndürür.
        
        Returns:
            Toplanan metrikler
        """
        end_time = time.time()
        total_time = (end_time - cls._start_time) * 1000  # ms cinsinden
        
        # GPU metriklerini topla
        gpu_metrics = collect_gpu_metrics()
        
        # Bileşen sürelerini hesapla
        component_times = {}
        for span_name, span_data in cls._spans.items():
            component_times[f"{span_name}_ms"] = span_data["duration_ms"]
        
        # Meta veri modelini oluştur
        metadata = {
            "request_id": cls._current_request_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "processing_time": {
                "total_ms": total_time,
                "components": component_times
            },
            "gpu_resources": gpu_metrics,
            "trace_id": cls._current_request_id,  # Basit bir örnek için aynı ID kullanılıyor
            "version": "1.0"
        }
        
        # Temizlik
        cls._current_request_id = None
        cls._spans = {}
        
        return metadata
    
    @classmethod
    def span(cls, name: str):
        """
        İşlem akışının bir bölümünü izlemek için context manager.
        
        Args:
            name: İzleme noktası adı
            
        Returns:
            Context manager
        """
        class SpanContextManager:
            def __init__(self, span_name):
                self.span_name = span_name
                self.start_time = 0
            
            def __enter__(self):
                self.start_time = time.time()
                return self
            
            def __exit__(self, exc_type, exc_val, exc_tb):
                end_time = time.time()
                duration_ms = (end_time - self.start_time) * 1000  # ms cinsinden
                
                cls._spans[self.span_name] = {
                    "start_time": self.start_time,
                    "end_time": end_time,
                    "duration_ms": duration_ms
                }
        
        return SpanContextManager(name)


def gpu_metrics_collector(func):
    """
    API endpoint'lerini saran ve GPU metriklerini toplayan dekoratör.
    
    Args:
        func: Decore edilecek fonksiyon
        
    Returns:
        Decore edilmiş fonksiyon
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Yapılandırmayı kontrol et
        if not DEFAULT_CONFIG["enabled"]:
            return func(*args, **kwargs)
        
        # Örnekleme oranını kontrol et
        if DEFAULT_CONFIG["sampling_rate"] < 1.0:
            import random
            if random.random() > DEFAULT_CONFIG["sampling_rate"]:
                return func(*args, **kwargs)
        
        # İzlemeyi başlat
        request_id = MetricsTracer.start_request()
        
        try:
            # Orijinal fonksiyonu çağır
            result = func(*args, **kwargs)
            
            # İzlemeyi sonlandır ve metrikleri al
            metadata = MetricsTracer.end_request()
            
            # Yanıta meta verileri ekle
            if DEFAULT_CONFIG["include_in_response"]:
                # Dict yanıtı için
                if isinstance(result, dict):
                    result["meta"] = metadata
                # Flask/FastAPI yanıtı için
                elif hasattr(result, "json") and callable(getattr(result, "json")):
                    response_data = result.json()
                    response_data["meta"] = metadata
                    result.body = json.dumps(response_data).encode()
            
            return result
            
        except Exception as e:
            # Hata durumunda da metrikleri topla
            metadata = MetricsTracer.end_request()
            logger.error(f"Error in API call: {str(e)}, Metrics: {metadata}")
            raise
    
    return wrapper


def collect_gpu_metrics(device_id: int = 0) -> Dict[str, Any]:
    """
    GPU kaynak kullanımı metriklerini toplar.
    
    Args:
        device_id: GPU cihaz ID'si
        
    Returns:
        GPU metrikleri
    """
    metrics = {}
    
    try:
        # NVML'yi başlat
        pynvml.nvmlInit()
        
        # Cihaz sayısını kontrol et
        device_count = pynvml.nvmlDeviceGetCount()
        if device_id >= device_count:
            logger.warning(f"Device ID {device_id} is out of range. Using device 0 instead.")
            device_id = 0
        
        # NVML ile GPU bilgilerini al
        handle = pynvml.nvmlDeviceGetHandleByIndex(device_id)
        metrics["device_id"] = device_id
        metrics["device_name"] = pynvml.nvmlDeviceGetName(handle).decode('utf-8')
        
        # Bellek bilgileri
        memory_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
        metrics["memory_used_mb"] = memory_info.used / (1024 * 1024)
        metrics["memory_total_mb"] = memory_info.total / (1024 * 1024)
        
        # Yapılandırmaya göre ek bilgileri ekle
        if DEFAULT_CONFIG["components"]["gpu_resources"]["include_utilization"]:
            utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
            metrics["utilization_percent"] = utilization.gpu
        
        if DEFAULT_CONFIG["components"]["gpu_resources"]["include_temperature"]:
            metrics["temperature_c"] = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        
        # PyTorch CUDA bilgilerini ekle
        if torch.cuda.is_available():
            metrics["pytorch_allocated_mb"] = torch.cuda.memory_allocated(device_id) / (1024 * 1024)
            metrics["pytorch_cached_mb"] = torch.cuda.memory_reserved(device_id) / (1024 * 1024)
        
        # NVML'yi kapat
        pynvml.nvmlShutdown()
        
    except Exception as e:
        logger.error(f"Error collecting GPU metrics: {str(e)}")
        metrics = {
            "device_id": device_id,
            "error": str(e)
        }
    
    return metrics


def add_metadata_to_response(response_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Yanıt verisine meta verileri ekler.
    
    Args:
        response_data: Yanıt verisi
        
    Returns:
        Meta veriler eklenmiş yanıt verisi
    """
    metadata = MetricsTracer.end_request()
    response_data["meta"] = metadata
    return response_data


def configure_metadata_collection(config: Dict[str, Any]) -> None:
    """
    Meta veri toplama yapılandırmasını günceller.
    
    Args:
        config: Yeni yapılandırma
    """
    global DEFAULT_CONFIG
    
    # Yapılandırmayı güncelle
    for key, value in config.items():
        if key in DEFAULT_CONFIG:
            if isinstance(value, dict) and isinstance(DEFAULT_CONFIG[key], dict):
                # İç içe yapılandırma için
                for sub_key, sub_value in value.items():
                    if sub_key in DEFAULT_CONFIG[key]:
                        DEFAULT_CONFIG[key][sub_key] = sub_value
            else:
                DEFAULT_CONFIG[key] = value
    
    logger.info(f"Metadata collection configuration updated: {DEFAULT_CONFIG}")


# Örnek kullanım
if __name__ == "__main__":
    # Loglama yapılandırması
    logging.basicConfig(level=logging.INFO)
    
    # Meta veri toplama yapılandırması
    configure_metadata_collection({
        "detail_level": "full",
        "sampling_rate": 0.5
    })
    
    # GPU metriklerini topla
    print("GPU Metrics:", collect_gpu_metrics())
    
    # İzleme örneği
    @gpu_metrics_collector
    def example_function(data):
        with MetricsTracer.span("preprocessing"):
            # Ön işleme simülasyonu
            time.sleep(0.1)
            processed_data = data
        
        with MetricsTracer.span("inference"):
            # Çıkarım simülasyonu
            time.sleep(0.3)
            result = processed_data * 2
        
        with MetricsTracer.span("postprocessing"):
            # Son işleme simülasyonu
            time.sleep(0.05)
            final_result = {"result": result}
        
        return final_result
    
    # Fonksiyonu çağır
    result = example_function(10)
    print("Result with metadata:", json.dumps(result, indent=2))
