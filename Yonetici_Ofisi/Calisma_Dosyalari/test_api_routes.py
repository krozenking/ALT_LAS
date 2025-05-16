"""
GPU İstek Yönlendirme Katmanı API Rotaları Birim Testleri

Bu modül, GPU İstek Yönlendirme Katmanı API rotalarının birim testlerini içerir.
"""

import asyncio
import pytest
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime

from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

# API rotalarını içe aktar
from api_routes import router, setup_components

# API veri modellerini içe aktar
from api_models import (
    RequestModel, BatchRequestModel, RequestStatusModel, GPUStateModel,
    MetricsModel, UserQuotaModel
)

# Test uygulaması oluştur
app = FastAPI()
app.include_router(router)

# Test istemcisi oluştur
client = TestClient(app)

# Mock bileşenler oluştur
mock_request_receiver = AsyncMock()
mock_request_router = AsyncMock()
mock_gpu_state_monitor = AsyncMock()
mock_error_handler = AsyncMock()
mock_user_quota_manager = AsyncMock()

# Mock bileşenleri ayarla
setup_components(
    mock_request_receiver,
    mock_request_router,
    mock_gpu_state_monitor,
    mock_error_handler,
    mock_user_quota_manager
)

class TestAPIRoutes:
    """API rotaları için testler."""
    
    def setup_method(self):
        """Her test öncesinde çalışacak kod."""
        # Mock bileşenleri sıfırla
        mock_request_receiver.reset_mock()
        mock_request_router.reset_mock()
        mock_gpu_state_monitor.reset_mock()
        mock_error_handler.reset_mock()
        mock_user_quota_manager.reset_mock()
        
    def test_route_request_success(self):
        """İstek yönlendirme başarılı durumu testi."""
        # Mock yanıtları ayarla
        mock_user_quota_manager.check_quota.return_value = (True, None)
        mock_request_receiver.process_request.return_value = (MagicMock(), None)
        mock_request_router.route_request.return_value = {
            'request_id': '123',
            'status': 'processing',
            'gpu_id': 'gpu-1',
            'estimated_start_time': datetime.now().isoformat(),
            'estimated_completion_time': datetime.now().isoformat(),
            'queue_position': 0
        }
        
        # İstek gönder
        response = client.post(
            "/api/v1/route",
            json={
                'user_id': 'user-1',
                'model_id': 'model-1',
                'priority': 3,
                'type': 'inference',
                'resource_requirements': {
                    'memory': 1024,
                    'compute_units': 1,
                    'max_batch_size': 1,
                    'expected_duration': 1000
                }
            }
        )
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert 'request_id' in response.json()
        assert response.json()['status'] == 'processing'
        assert response.json()['gpu_id'] == 'gpu-1'
        
        # Mock çağrıları kontrol et
        mock_user_quota_manager.check_quota.assert_called_once()
        mock_request_receiver.process_request.assert_called_once()
        mock_request_router.route_request.assert_called_once()
        mock_user_quota_manager.update_quota.assert_called_once()
        
    def test_route_request_quota_exceeded(self):
        """İstek yönlendirme kota aşımı durumu testi."""
        # Mock yanıtları ayarla
        mock_user_quota_manager.check_quota.return_value = (False, "GPU quota exceeded")
        
        # İstek gönder
        response = client.post(
            "/api/v1/route",
            json={
                'user_id': 'user-1',
                'model_id': 'model-1',
                'priority': 3,
                'type': 'inference',
                'resource_requirements': {
                    'memory': 1024,
                    'compute_units': 1,
                    'max_batch_size': 1,
                    'expected_duration': 1000
                }
            }
        )
        
        # Yanıtı kontrol et
        assert response.status_code == 429
        assert "Quota exceeded" in response.json()['detail']
        
        # Mock çağrıları kontrol et
        mock_user_quota_manager.check_quota.assert_called_once()
        mock_request_receiver.process_request.assert_not_called()
        mock_request_router.route_request.assert_not_called()
        mock_user_quota_manager.update_quota.assert_not_called()
        
    def test_route_request_invalid_request(self):
        """İstek yönlendirme geçersiz istek durumu testi."""
        # Mock yanıtları ayarla
        mock_user_quota_manager.check_quota.return_value = (True, None)
        mock_request_receiver.process_request.return_value = (None, "Invalid request")
        
        # İstek gönder
        response = client.post(
            "/api/v1/route",
            json={
                'user_id': 'user-1',
                'model_id': 'model-1',
                'priority': 3,
                'type': 'invalid_type',
                'resource_requirements': {
                    'memory': 1024,
                    'compute_units': 1,
                    'max_batch_size': 1,
                    'expected_duration': 1000
                }
            }
        )
        
        # Yanıtı kontrol et
        assert response.status_code == 400
        assert response.json()['detail'] == "Invalid request"
        
        # Mock çağrıları kontrol et
        mock_user_quota_manager.check_quota.assert_called_once()
        mock_request_receiver.process_request.assert_called_once()
        mock_request_router.route_request.assert_not_called()
        mock_user_quota_manager.update_quota.assert_not_called()
        
    def test_get_request_status_success(self):
        """İstek durumu sorgulama başarılı durumu testi."""
        # Mock yanıtları ayarla
        mock_request_router.get_request_status.return_value = {
            'request_id': '123',
            'user_id': 'user-1',
            'model_id': 'model-1',
            'status': 'completed',
            'gpu_id': 'gpu-1',
            'submission_time': datetime.now().isoformat(),
            'start_time': datetime.now().isoformat(),
            'completion_time': datetime.now().isoformat(),
            'queue_position': 0,
            'progress': 1.0,
            'result': {'success': True},
            'error': None
        }
        
        # İstek gönder
        response = client.get("/api/v1/requests/123")
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert response.json()['request_id'] == '123'
        assert response.json()['status'] == 'completed'
        
        # Mock çağrıları kontrol et
        mock_request_router.get_request_status.assert_called_once_with('123')
        
    def test_get_request_status_not_found(self):
        """İstek durumu sorgulama bulunamadı durumu testi."""
        # Mock yanıtları ayarla
        mock_request_router.get_request_status.return_value = None
        
        # İstek gönder
        response = client.get("/api/v1/requests/123")
        
        # Yanıtı kontrol et
        assert response.status_code == 404
        assert "Request not found" in response.json()['detail']
        
        # Mock çağrıları kontrol et
        mock_request_router.get_request_status.assert_called_once_with('123')
        
    def test_cancel_request_success(self):
        """İstek iptal etme başarılı durumu testi."""
        # Mock yanıtları ayarla
        mock_request_router.cancel_request.return_value = {
            'request_id': '123',
            'status': 'cancelled',
            'message': 'İstek başarıyla iptal edildi'
        }
        
        # İstek gönder
        response = client.delete("/api/v1/requests/123")
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert response.json()['request_id'] == '123'
        assert response.json()['status'] == 'cancelled'
        
        # Mock çağrıları kontrol et
        mock_request_router.cancel_request.assert_called_once_with('123')
        
    def test_cancel_request_not_found(self):
        """İstek iptal etme bulunamadı durumu testi."""
        # Mock yanıtları ayarla
        mock_request_router.cancel_request.return_value = {
            'request_id': '123',
            'status': 'not_found',
            'message': 'İstek bulunamadı'
        }
        
        # İstek gönder
        response = client.delete("/api/v1/requests/123")
        
        # Yanıtı kontrol et
        assert response.status_code == 404
        assert "Request not found" in response.json()['detail']
        
        # Mock çağrıları kontrol et
        mock_request_router.cancel_request.assert_called_once_with('123')
        
    def test_get_gpus_success(self):
        """GPU'ları alma başarılı durumu testi."""
        # Mock yanıtları ayarla
        mock_gpu_state = MagicMock()
        mock_gpu_state.to_dict.return_value = {
            'gpu_id': 'gpu-1',
            'name': 'NVIDIA GeForce RTX 3080',
            'status': 'available',
            'compute_capability': '8.6',
            'memory_total': 10737418240,
            'memory_used': 2147483648,
            'memory_free': 8589934592,
            'utilization': 0.3,
            'temperature': 65.0,
            'power_usage': 180.0,
            'power_limit': 320.0,
            'active_requests': [],
            'queued_requests': 0,
            'performance_index': 0.8,
            'error_rate': 0.0,
            'uptime': 3600,
            'processes': []
        }
        mock_gpu_state_monitor.get_gpu_states.return_value = {'gpu-1': mock_gpu_state}
        
        # İstek gönder
        response = client.get("/api/v1/gpus")
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert 'gpus' in response.json()
        assert len(response.json()['gpus']) == 1
        assert response.json()['gpus'][0]['gpu_id'] == 'gpu-1'
        
        # Mock çağrıları kontrol et
        mock_gpu_state_monitor.get_gpu_states.assert_called_once()
        
    def test_get_gpu_success(self):
        """Belirli bir GPU'yu alma başarılı durumu testi."""
        # Mock yanıtları ayarla
        mock_gpu_state = MagicMock()
        mock_gpu_state.to_dict.return_value = {
            'gpu_id': 'gpu-1',
            'name': 'NVIDIA GeForce RTX 3080',
            'status': 'available',
            'compute_capability': '8.6',
            'memory_total': 10737418240,
            'memory_used': 2147483648,
            'memory_free': 8589934592,
            'utilization': 0.3,
            'temperature': 65.0,
            'power_usage': 180.0,
            'power_limit': 320.0,
            'active_requests': [],
            'queued_requests': 0,
            'performance_index': 0.8,
            'error_rate': 0.0,
            'uptime': 3600,
            'processes': []
        }
        mock_gpu_state_monitor.get_gpu_state.return_value = mock_gpu_state
        
        # İstek gönder
        response = client.get("/api/v1/gpus/gpu-1")
        
        # Yanıtı kontrol et
        assert response.status_code == 200
        assert response.json()['gpu_id'] == 'gpu-1'
        
        # Mock çağrıları kontrol et
        mock_gpu_state_monitor.get_gpu_state.assert_called_once_with('gpu-1')
        
    def test_get_gpu_not_found(self):
        """Belirli bir GPU'yu alma bulunamadı durumu testi."""
        # Mock yanıtları ayarla
        mock_gpu_state_monitor.get_gpu_state.return_value = None
        
        # İstek gönder
        response = client.get("/api/v1/gpus/gpu-1")
        
        # Yanıtı kontrol et
        assert response.status_code == 404
        assert "GPU not found" in response.json()['detail']
        
        # Mock çağrıları kontrol et
        mock_gpu_state_monitor.get_gpu_state.assert_called_once_with('gpu-1')
