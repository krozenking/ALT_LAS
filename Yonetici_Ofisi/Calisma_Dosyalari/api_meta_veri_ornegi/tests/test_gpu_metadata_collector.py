"""
GPU Meta Veri Toplayıcı Testleri

Bu modül, GPU Meta Veri Toplayıcı bileşeninin birim testlerini içerir.
"""

import json
import time
import unittest
from unittest.mock import patch, MagicMock

import torch
import pytest

# Test edilecek modülü import et
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from gpu_metadata_collector import (
    MetricsTracer,
    gpu_metrics_collector,
    collect_gpu_metrics,
    add_metadata_to_response,
    configure_metadata_collection,
    DEFAULT_CONFIG
)


class TestMetricsTracer(unittest.TestCase):
    """MetricsTracer sınıfı için testler."""
    
    def setUp(self):
        """Test öncesi hazırlık."""
        # Her test öncesinde MetricsTracer'ı sıfırla
        MetricsTracer._spans = {}
        MetricsTracer._current_request_id = None
        MetricsTracer._start_time = 0
    
    def test_start_request(self):
        """start_request metodunun testi."""
        # Belirli bir request_id ile başlat
        request_id = "test-request-id"
        result = MetricsTracer.start_request(request_id)
        
        # Sonuçları kontrol et
        self.assertEqual(result, request_id)
        self.assertEqual(MetricsTracer._current_request_id, request_id)
        self.assertGreater(MetricsTracer._start_time, 0)
        self.assertEqual(MetricsTracer._spans, {})
        
        # request_id olmadan başlat
        MetricsTracer._current_request_id = None
        result = MetricsTracer.start_request()
        
        # Sonuçları kontrol et
        self.assertIsNotNone(result)
        self.assertEqual(MetricsTracer._current_request_id, result)
    
    def test_end_request(self):
        """end_request metodunun testi."""
        # Önce bir istek başlat
        request_id = "test-request-id"
        MetricsTracer.start_request(request_id)
        
        # Bazı span'ler ekle
        with MetricsTracer.span("test-span-1"):
            time.sleep(0.01)
        
        with MetricsTracer.span("test-span-2"):
            time.sleep(0.02)
        
        # İsteği sonlandır
        metadata = MetricsTracer.end_request()
        
        # Sonuçları kontrol et
        self.assertEqual(metadata["request_id"], request_id)
        self.assertIn("timestamp", metadata)
        self.assertIn("processing_time", metadata)
        self.assertIn("total_ms", metadata["processing_time"])
        self.assertIn("components", metadata["processing_time"])
        self.assertIn("test-span-1_ms", metadata["processing_time"]["components"])
        self.assertIn("test-span-2_ms", metadata["processing_time"]["components"])
        self.assertIn("gpu_resources", metadata)
        self.assertIn("trace_id", metadata)
        self.assertEqual(metadata["version"], "1.0")
        
        # MetricsTracer'ın sıfırlandığını kontrol et
        self.assertIsNone(MetricsTracer._current_request_id)
        self.assertEqual(MetricsTracer._spans, {})
    
    def test_span(self):
        """span metodunun testi."""
        # Önce bir istek başlat
        MetricsTracer.start_request("test-request-id")
        
        # Span kullan
        with MetricsTracer.span("test-span"):
            time.sleep(0.01)
        
        # Span'in kaydedildiğini kontrol et
        self.assertIn("test-span", MetricsTracer._spans)
        self.assertIn("start_time", MetricsTracer._spans["test-span"])
        self.assertIn("end_time", MetricsTracer._spans["test-span"])
        self.assertIn("duration_ms", MetricsTracer._spans["test-span"])
        self.assertGreater(MetricsTracer._spans["test-span"]["duration_ms"], 0)


class TestGpuMetricsCollector(unittest.TestCase):
    """gpu_metrics_collector dekoratörü için testler."""
    
    def setUp(self):
        """Test öncesi hazırlık."""
        # Her test öncesinde MetricsTracer'ı sıfırla
        MetricsTracer._spans = {}
        MetricsTracer._current_request_id = None
        MetricsTracer._start_time = 0
        
        # DEFAULT_CONFIG'i yedekle
        self.original_config = DEFAULT_CONFIG.copy()
    
    def tearDown(self):
        """Test sonrası temizlik."""
        # DEFAULT_CONFIG'i geri yükle
        global DEFAULT_CONFIG
        DEFAULT_CONFIG = self.original_config
    
    @patch('gpu_metadata_collector.MetricsTracer.start_request')
    @patch('gpu_metadata_collector.MetricsTracer.end_request')
    def test_gpu_metrics_collector(self, mock_end_request, mock_start_request):
        """gpu_metrics_collector dekoratörünün testi."""
        # Mock'ları yapılandır
        mock_start_request.return_value = "test-request-id"
        mock_end_request.return_value = {
            "request_id": "test-request-id",
            "timestamp": "2025-05-31T14:30:15.123Z",
            "processing_time": {
                "total_ms": 100.0,
                "components": {}
            },
            "gpu_resources": {},
            "trace_id": "test-request-id",
            "version": "1.0"
        }
        
        # Test fonksiyonu
        @gpu_metrics_collector
        def test_function():
            return {"result": "test"}
        
        # Fonksiyonu çağır
        result = test_function()
        
        # Sonuçları kontrol et
        mock_start_request.assert_called_once()
        mock_end_request.assert_called_once()
        self.assertEqual(result["result"], "test")
        self.assertIn("meta", result)
        self.assertEqual(result["meta"]["request_id"], "test-request-id")
    
    @patch('gpu_metadata_collector.MetricsTracer.start_request')
    @patch('gpu_metadata_collector.MetricsTracer.end_request')
    def test_gpu_metrics_collector_disabled(self, mock_end_request, mock_start_request):
        """gpu_metrics_collector dekoratörünün devre dışı bırakıldığında testi."""
        # Dekoratörü devre dışı bırak
        global DEFAULT_CONFIG
        DEFAULT_CONFIG["enabled"] = False
        
        # Test fonksiyonu
        @gpu_metrics_collector
        def test_function():
            return {"result": "test"}
        
        # Fonksiyonu çağır
        result = test_function()
        
        # Sonuçları kontrol et
        mock_start_request.assert_not_called()
        mock_end_request.assert_not_called()
        self.assertEqual(result["result"], "test")
        self.assertNotIn("meta", result)
    
    @patch('gpu_metadata_collector.MetricsTracer.start_request')
    @patch('gpu_metadata_collector.MetricsTracer.end_request')
    def test_gpu_metrics_collector_sampling(self, mock_end_request, mock_start_request):
        """gpu_metrics_collector dekoratörünün örnekleme ile testi."""
        # Örnekleme oranını ayarla
        global DEFAULT_CONFIG
        DEFAULT_CONFIG["sampling_rate"] = 0.0  # Hiçbir istek örneklenmeyecek
        
        # Test fonksiyonu
        @gpu_metrics_collector
        def test_function():
            return {"result": "test"}
        
        # Fonksiyonu çağır
        result = test_function()
        
        # Sonuçları kontrol et
        mock_start_request.assert_not_called()
        mock_end_request.assert_not_called()
        self.assertEqual(result["result"], "test")
        self.assertNotIn("meta", result)


class TestCollectGpuMetrics(unittest.TestCase):
    """collect_gpu_metrics fonksiyonu için testler."""
    
    @patch('pynvml.nvmlInit')
    @patch('pynvml.nvmlDeviceGetCount')
    @patch('pynvml.nvmlDeviceGetHandleByIndex')
    @patch('pynvml.nvmlDeviceGetName')
    @patch('pynvml.nvmlDeviceGetMemoryInfo')
    @patch('pynvml.nvmlDeviceGetUtilizationRates')
    @patch('pynvml.nvmlDeviceGetTemperature')
    @patch('pynvml.nvmlShutdown')
    @patch('torch.cuda.is_available')
    @patch('torch.cuda.memory_allocated')
    @patch('torch.cuda.memory_reserved')
    def test_collect_gpu_metrics(
        self, mock_memory_reserved, mock_memory_allocated, mock_is_available,
        mock_shutdown, mock_temperature, mock_utilization, mock_memory_info,
        mock_device_name, mock_device_handle, mock_device_count, mock_init
    ):
        """collect_gpu_metrics fonksiyonunun testi."""
        # Mock'ları yapılandır
        mock_init.return_value = None
        mock_device_count.return_value = 1
        mock_device_handle.return_value = MagicMock()
        mock_device_name.return_value = b"NVIDIA Test GPU"
        
        memory_info = MagicMock()
        memory_info.used = 1024 * 1024 * 1024  # 1 GB
        memory_info.total = 8 * 1024 * 1024 * 1024  # 8 GB
        mock_memory_info.return_value = memory_info
        
        utilization = MagicMock()
        utilization.gpu = 50  # %50 kullanım
        mock_utilization.return_value = utilization
        
        mock_temperature.return_value = 70  # 70°C
        mock_shutdown.return_value = None
        
        mock_is_available.return_value = True
        mock_memory_allocated.return_value = 512 * 1024 * 1024  # 512 MB
        mock_memory_reserved.return_value = 768 * 1024 * 1024  # 768 MB
        
        # Fonksiyonu çağır
        result = collect_gpu_metrics()
        
        # Sonuçları kontrol et
        self.assertEqual(result["device_id"], 0)
        self.assertEqual(result["device_name"], "NVIDIA Test GPU")
        self.assertEqual(result["memory_used_mb"], 1024)
        self.assertEqual(result["memory_total_mb"], 8 * 1024)
        self.assertEqual(result["utilization_percent"], 50)
        self.assertEqual(result["temperature_c"], 70)
        self.assertEqual(result["pytorch_allocated_mb"], 512)
        self.assertEqual(result["pytorch_cached_mb"], 768)
        
        # Mock çağrılarını kontrol et
        mock_init.assert_called_once()
        mock_device_count.assert_called_once()
        mock_device_handle.assert_called_once()
        mock_device_name.assert_called_once()
        mock_memory_info.assert_called_once()
        mock_utilization.assert_called_once()
        mock_temperature.assert_called_once()
        mock_shutdown.assert_called_once()
        mock_is_available.assert_called_once()
        mock_memory_allocated.assert_called_once()
        mock_memory_reserved.assert_called_once()
    
    @patch('pynvml.nvmlInit')
    @patch('logging.error')
    def test_collect_gpu_metrics_error(self, mock_error, mock_init):
        """collect_gpu_metrics fonksiyonunun hata durumunda testi."""
        # Mock'ları yapılandır
        mock_init.side_effect = Exception("Test error")
        
        # Fonksiyonu çağır
        result = collect_gpu_metrics()
        
        # Sonuçları kontrol et
        self.assertEqual(result["device_id"], 0)
        self.assertEqual(result["error"], "Test error")
        
        # Mock çağrılarını kontrol et
        mock_init.assert_called_once()
        mock_error.assert_called_once()


class TestConfigureMetadataCollection(unittest.TestCase):
    """configure_metadata_collection fonksiyonu için testler."""
    
    def setUp(self):
        """Test öncesi hazırlık."""
        # DEFAULT_CONFIG'i yedekle
        self.original_config = DEFAULT_CONFIG.copy()
    
    def tearDown(self):
        """Test sonrası temizlik."""
        # DEFAULT_CONFIG'i geri yükle
        global DEFAULT_CONFIG
        DEFAULT_CONFIG = self.original_config
    
    def test_configure_metadata_collection(self):
        """configure_metadata_collection fonksiyonunun testi."""
        # Yeni yapılandırma
        new_config = {
            "detail_level": "minimal",
            "sampling_rate": 0.5,
            "components": {
                "processing_time": {
                    "include_components": False
                }
            }
        }
        
        # Fonksiyonu çağır
        configure_metadata_collection(new_config)
        
        # Sonuçları kontrol et
        self.assertEqual(DEFAULT_CONFIG["detail_level"], "minimal")
        self.assertEqual(DEFAULT_CONFIG["sampling_rate"], 0.5)
        self.assertEqual(DEFAULT_CONFIG["components"]["processing_time"]["include_components"], False)
        
        # Diğer yapılandırma değerlerinin değişmediğini kontrol et
        self.assertEqual(DEFAULT_CONFIG["enabled"], self.original_config["enabled"])
        self.assertEqual(DEFAULT_CONFIG["include_in_response"], self.original_config["include_in_response"])
        self.assertEqual(DEFAULT_CONFIG["components"]["gpu_resources"]["include_temperature"], self.original_config["components"]["gpu_resources"]["include_temperature"])


if __name__ == '__main__':
    unittest.main()
