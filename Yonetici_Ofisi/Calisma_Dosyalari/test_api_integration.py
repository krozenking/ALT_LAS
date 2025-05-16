"""
GPU İstek Yönlendirme Katmanı API Entegrasyon Testleri

Bu modül, GPU İstek Yönlendirme Katmanı API'sinin entegrasyon testlerini içerir.
"""

import asyncio
import pytest
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime
import json
import uuid

from fastapi.testclient import TestClient
from api_app import app, config

# Test istemcisi
client = TestClient(app)

class TestAPIIntegration:
    """API entegrasyon testleri."""
    
    def test_route_request(self):
        """İstek yönlendirme testi."""
        # Test isteği
        request_data = {
            "user_id": "test_user",
            "model_id": "test_model",
            "priority": 3,
            "type": "inference",
            "resource_requirements": {
                "memory": 1024,
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            },
            "timeout": 30000,
            "payload": {
                "input": "Test input"
            }
        }
        
        # İsteği gönder
        response = client.post("/api/v1/route", json=request_data)
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert "request_id" in response.json()
        assert "status" in response.json()
        
    def test_route_batch_request(self):
        """Toplu istek yönlendirme testi."""
        # Test isteği
        batch_request_data = {
            "user_id": "test_user",
            "requests": [
                {
                    "model_id": "test_model_1",
                    "priority": 3,
                    "type": "inference",
                    "resource_requirements": {
                        "memory": 1024,
                        "compute_units": 1,
                        "max_batch_size": 1,
                        "expected_duration": 1000
                    },
                    "payload": {
                        "input": "Test input 1"
                    }
                },
                {
                    "model_id": "test_model_2",
                    "priority": 2,
                    "type": "inference",
                    "resource_requirements": {
                        "memory": 2048,
                        "compute_units": 2,
                        "max_batch_size": 2,
                        "expected_duration": 2000
                    },
                    "payload": {
                        "input": "Test input 2"
                    }
                }
            ],
            "timeout": 60000
        }
        
        # İsteği gönder
        response = client.post("/api/v1/route/batch", json=batch_request_data)
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert "batch_id" in response.json()
        assert "status" in response.json()
        assert "request_ids" in response.json()
        
    def test_get_request_status(self):
        """İstek durumu sorgulama testi."""
        # Önce bir istek gönder
        request_data = {
            "user_id": "test_user",
            "model_id": "test_model",
            "priority": 3,
            "type": "inference",
            "resource_requirements": {
                "memory": 1024,
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            },
            "timeout": 30000,
            "payload": {
                "input": "Test input"
            }
        }
        
        response = client.post("/api/v1/route", json=request_data)
        request_id = response.json()["request_id"]
        
        # İstek durumunu sorgula
        response = client.get(f"/api/v1/requests/{request_id}")
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert response.json()["request_id"] == request_id
        assert "status" in response.json()
        assert "user_id" in response.json()
        assert "model_id" in response.json()
        
    def test_cancel_request(self):
        """İstek iptal etme testi."""
        # Önce bir istek gönder
        request_data = {
            "user_id": "test_user",
            "model_id": "test_model",
            "priority": 3,
            "type": "inference",
            "resource_requirements": {
                "memory": 1024,
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            },
            "timeout": 30000,
            "payload": {
                "input": "Test input"
            }
        }
        
        response = client.post("/api/v1/route", json=request_data)
        request_id = response.json()["request_id"]
        
        # İsteği iptal et
        response = client.delete(f"/api/v1/requests/{request_id}")
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert response.json()["request_id"] == request_id
        assert response.json()["status"] == "cancelled"
        
    def test_get_gpu_states(self):
        """GPU durumlarını alma testi."""
        # GPU durumlarını al
        response = client.get("/api/v1/gpus")
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert "gpus" in response.json()
        
    def test_get_metrics(self):
        """Metrikleri alma testi."""
        # Metrikleri al
        response = client.get("/api/v1/metrics")
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert "timestamp" in response.json()
        assert "total_requests" in response.json()
        assert "active_requests" in response.json()
        assert "completed_requests" in response.json()
        assert "failed_requests" in response.json()
        assert "average_response_time" in response.json()
        assert "gpu_utilization" in response.json()
        assert "user_metrics" in response.json()
        
    def test_invalid_request(self):
        """Geçersiz istek testi."""
        # Geçersiz istek
        request_data = {
            # user_id eksik
            "model_id": "test_model",
            "priority": 3,
            "type": "inference",
            "resource_requirements": {
                "memory": 1024,
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            },
            "timeout": 30000,
            "payload": {
                "input": "Test input"
            }
        }
        
        # İsteği gönder
        response = client.post("/api/v1/route", json=request_data)
        
        # Yanıtı kontrol et
        assert response.status_code == 422  # Validation Error
        
    def test_request_not_found(self):
        """Bulunamayan istek testi."""
        # Olmayan bir istek ID'si
        request_id = str(uuid.uuid4())
        
        # İstek durumunu sorgula
        response = client.get(f"/api/v1/requests/{request_id}")
        
        # Yanıtı kontrol et
        assert response.status_code == 404
        
    def test_cancel_nonexistent_request(self):
        """Olmayan isteği iptal etme testi."""
        # Olmayan bir istek ID'si
        request_id = str(uuid.uuid4())
        
        # İsteği iptal et
        response = client.delete(f"/api/v1/requests/{request_id}")
        
        # Yanıtı kontrol et
        assert response.status_code == 404
        
    def test_get_nonexistent_gpu(self):
        """Olmayan GPU durumunu alma testi."""
        # Olmayan bir GPU ID'si
        gpu_id = "nonexistent_gpu"
        
        # GPU durumunu al
        response = client.get(f"/api/v1/gpus/{gpu_id}")
        
        # Yanıtı kontrol et
        assert response.status_code == 404
        
    def test_high_priority_request(self):
        """Yüksek öncelikli istek testi."""
        # Yüksek öncelikli istek
        request_data = {
            "user_id": "test_user",
            "model_id": "test_model",
            "priority": 5,  # Yüksek öncelik
            "type": "inference",
            "resource_requirements": {
                "memory": 1024,
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            },
            "timeout": 30000,
            "payload": {
                "input": "Test input"
            }
        }
        
        # İsteği gönder
        response = client.post("/api/v1/route", json=request_data)
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert "request_id" in response.json()
        assert "status" in response.json()
        
    def test_low_priority_request(self):
        """Düşük öncelikli istek testi."""
        # Düşük öncelikli istek
        request_data = {
            "user_id": "test_user",
            "model_id": "test_model",
            "priority": 1,  # Düşük öncelik
            "type": "inference",
            "resource_requirements": {
                "memory": 1024,
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            },
            "timeout": 30000,
            "payload": {
                "input": "Test input"
            }
        }
        
        # İsteği gönder
        response = client.post("/api/v1/route", json=request_data)
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert "request_id" in response.json()
        assert "status" in response.json()
        
    def test_high_memory_request(self):
        """Yüksek bellek gerektiren istek testi."""
        # Yüksek bellek gerektiren istek
        request_data = {
            "user_id": "test_user",
            "model_id": "test_model",
            "priority": 3,
            "type": "inference",
            "resource_requirements": {
                "memory": 8192,  # 8 GB
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            },
            "timeout": 30000,
            "payload": {
                "input": "Test input"
            }
        }
        
        # İsteği gönder
        response = client.post("/api/v1/route", json=request_data)
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert "request_id" in response.json()
        assert "status" in response.json()
        
    def test_long_running_request(self):
        """Uzun süren istek testi."""
        # Uzun süren istek
        request_data = {
            "user_id": "test_user",
            "model_id": "test_model",
            "priority": 3,
            "type": "training",  # Eğitim isteği
            "resource_requirements": {
                "memory": 4096,
                "compute_units": 2,
                "max_batch_size": 1,
                "expected_duration": 60000  # 1 dakika
            },
            "timeout": 120000,  # 2 dakika
            "payload": {
                "input": "Test input"
            }
        }
        
        # İsteği gönder
        response = client.post("/api/v1/route", json=request_data)
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert "request_id" in response.json()
        assert "status" in response.json()
        
    def test_multiple_requests(self):
        """Çoklu istek testi."""
        # Çoklu istek
        for i in range(5):
            request_data = {
                "user_id": "test_user",
                "model_id": f"test_model_{i}",
                "priority": 3,
                "type": "inference",
                "resource_requirements": {
                    "memory": 1024,
                    "compute_units": 1,
                    "max_batch_size": 1,
                    "expected_duration": 1000
                },
                "timeout": 30000,
                "payload": {
                    "input": f"Test input {i}"
                }
            }
            
            # İsteği gönder
            response = client.post("/api/v1/route", json=request_data)
            
            # Yanıtı kontrol et
            assert response.status_code == 200
            assert "request_id" in response.json()
            assert "status" in response.json()
            
        # Metrikleri kontrol et
        response = client.get("/api/v1/metrics")
        assert response.json()["total_requests"] >= 5
