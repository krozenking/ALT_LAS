"""
GPU İstek Yönlendirme Katmanı Entegrasyon Testleri

Bu modül, GPU İstek Yönlendirme Katmanı'nın diğer sistemlerle entegrasyonunu test eden
entegrasyon testlerini içerir.
"""

import asyncio
import pytest
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime
import os
import json
import aiohttp
from aiohttp import web
import logging

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("test_integration")

# GPU İstek Yönlendirme Katmanı bileşenlerini içe aktar
from request_receiver import Request, RequestReceiver
from gpu_state_monitor import GPUState, GPUStateMonitor
from load_balancer import LoadBalancer
from request_router import RequestRouter
from error_handler import ErrorHandler
from user_quota_manager import UserQuota, UserQuotaManager

# API uygulamasını içe aktar
from api_app import app, config

# Test yapılandırması
TEST_CONFIG = {
    "api": {
        "host": "localhost",
        "port": 8000,
        "debug": True
    },
    "gpu_monitoring": {
        "url": "http://localhost:8001",
        "update_interval": 1,
        "health_check_interval": 5,
        "max_temperature": 85.0
    },
    "load_balancer": {
        "strategy": "hybrid",
        "weights": {
            "usage": 0.4,
            "priority": 0.3,
            "performance": 0.2,
            "health": 0.1
        }
    },
    "request_router": {
        "max_retries": 3,
        "retry_delay": 0.1,
        "request_timeout": 5.0
    },
    "error_handler": {
        "max_retries": 3,
        "retry_delay": 0.1,
        "error_threshold": 0.1,
        "gpu_cooldown_period": 5
    },
    "user_quota_manager": {
        "default_gpu_limit": 2,
        "default_request_limit": 100,
        "default_priority_limit": 3,
        "quota_check_interval": 5
    }
}

# Mock GPU Monitoring Service
class MockGPUMonitoringService:
    """Mock GPU Monitoring Service."""
    
    def __init__(self):
        """Mock GPU Monitoring Service'i başlat."""
        self.app = web.Application()
        self.app.router.add_get('/gpus', self.get_gpus)
        self.app.router.add_get('/gpus/{gpu_id}', self.get_gpu)
        self.app.router.add_get('/gpus/{gpu_id}/health', self.get_gpu_health)
        
        self.gpus = {
            'gpu-1': {
                'gpu_id': 'gpu-1',
                'name': 'NVIDIA GeForce RTX 3080',
                'status': 'available',
                'compute_capability': '8.6',
                'memory_total': 10737418240,  # 10 GB
                'memory_used': 2147483648,  # 2 GB
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
            },
            'gpu-2': {
                'gpu_id': 'gpu-2',
                'name': 'NVIDIA GeForce RTX 3090',
                'status': 'available',
                'compute_capability': '8.6',
                'memory_total': 21474836480,  # 20 GB
                'memory_used': 4294967296,  # 4 GB
                'utilization': 0.2,
                'temperature': 60.0,
                'power_usage': 200.0,
                'power_limit': 350.0,
                'active_requests': [],
                'queued_requests': 0,
                'performance_index': 0.9,
                'error_rate': 0.0,
                'uptime': 7200,
                'processes': []
            }
        }
        
    async def get_gpus(self, request):
        """Tüm GPU'ların durumunu döndür."""
        return web.json_response({'gpus': list(self.gpus.values())})
        
    async def get_gpu(self, request):
        """Belirli bir GPU'nun durumunu döndür."""
        gpu_id = request.match_info['gpu_id']
        if gpu_id in self.gpus:
            return web.json_response(self.gpus[gpu_id])
        else:
            return web.json_response({'error': f'GPU not found: {gpu_id}'}, status=404)
            
    async def get_gpu_health(self, request):
        """Belirli bir GPU'nun sağlık durumunu döndür."""
        gpu_id = request.match_info['gpu_id']
        if gpu_id in self.gpus:
            gpu = self.gpus[gpu_id]
            return web.json_response({
                'gpu_id': gpu['gpu_id'],
                'status': gpu['status'],
                'temperature': gpu['temperature'],
                'error_rate': gpu['error_rate'],
                'is_healthy': gpu['status'] == 'available' and gpu['temperature'] <= 85.0 and gpu['error_rate'] < 0.1
            })
        else:
            return web.json_response({'error': f'GPU not found: {gpu_id}'}, status=404)
            
    async def start(self):
        """Mock GPU Monitoring Service'i başlat."""
        self.runner = web.AppRunner(self.app)
        await self.runner.setup()
        self.site = web.TCPSite(self.runner, 'localhost', 8001)
        await self.site.start()
        logger.info("Mock GPU Monitoring Service started on http://localhost:8001")
        
    async def stop(self):
        """Mock GPU Monitoring Service'i durdur."""
        await self.runner.cleanup()
        logger.info("Mock GPU Monitoring Service stopped")

# Mock AI Orchestrator
class MockAIOrchestrator:
    """Mock AI Orchestrator."""
    
    def __init__(self):
        """Mock AI Orchestrator'ı başlat."""
        self.app = web.Application()
        self.app.router.add_post('/callback', self.callback)
        
        self.callbacks = []
        
    async def callback(self, request):
        """Callback isteğini işle."""
        data = await request.json()
        self.callbacks.append(data)
        logger.info(f"Callback received: {data}")
        return web.json_response({'status': 'ok'})
        
    async def start(self):
        """Mock AI Orchestrator'ı başlat."""
        self.runner = web.AppRunner(self.app)
        await self.runner.setup()
        self.site = web.TCPSite(self.runner, 'localhost', 8002)
        await self.site.start()
        logger.info("Mock AI Orchestrator started on http://localhost:8002")
        
    async def stop(self):
        """Mock AI Orchestrator'ı durdur."""
        await self.runner.cleanup()
        logger.info("Mock AI Orchestrator stopped")

@pytest.mark.asyncio
class TestIntegration:
    """Entegrasyon testleri."""
    
    @classmethod
    async def setup_class(cls):
        """Sınıf başlangıcında çalışacak kod."""
        # Mock servisleri başlat
        cls.gpu_monitoring_service = MockGPUMonitoringService()
        await cls.gpu_monitoring_service.start()
        
        cls.ai_orchestrator = MockAIOrchestrator()
        await cls.ai_orchestrator.start()
        
        # Test yapılandırmasını ayarla
        global config
        config.update(TEST_CONFIG)
        
        # Bileşenleri oluştur
        cls.gpu_state_monitor = GPUStateMonitor(config["gpu_monitoring"])
        cls.load_balancer = LoadBalancer(config["load_balancer"], cls.gpu_state_monitor)
        cls.error_handler = ErrorHandler(config["error_handler"], cls.gpu_state_monitor)
        cls.request_receiver = RequestReceiver(config["request_router"])
        cls.request_router = RequestRouter(config["request_router"], cls.load_balancer, cls.error_handler)
        cls.user_quota_manager = UserQuotaManager(config["user_quota_manager"])
        
        # Bileşenleri başlat
        await cls.gpu_state_monitor.start()
        await cls.error_handler.start()
        await cls.request_router.start()
        await cls.user_quota_manager.start()
        
        # GPU durumlarının yüklenmesi için bekle
        await asyncio.sleep(2)
        
    @classmethod
    async def teardown_class(cls):
        """Sınıf sonlandırıldığında çalışacak kod."""
        # Bileşenleri durdur
        await cls.gpu_state_monitor.stop()
        await cls.error_handler.stop()
        await cls.request_router.stop()
        await cls.user_quota_manager.stop()
        
        # Mock servisleri durdur
        await cls.gpu_monitoring_service.stop()
        await cls.ai_orchestrator.stop()
        
    async def test_gpu_state_monitor_integration(self):
        """GPU Durum İzleyici entegrasyon testi."""
        # GPU durumlarını al
        gpu_states = await self.gpu_state_monitor.get_gpu_states()
        
        # GPU durumlarını kontrol et
        assert len(gpu_states) == 2
        assert 'gpu-1' in gpu_states
        assert 'gpu-2' in gpu_states
        assert gpu_states['gpu-1'].name == 'NVIDIA GeForce RTX 3080'
        assert gpu_states['gpu-2'].name == 'NVIDIA GeForce RTX 3090'
        
        # Belirli bir GPU'nun durumunu al
        gpu_state = await self.gpu_state_monitor.get_gpu_state('gpu-1')
        assert gpu_state is not None
        assert gpu_state.gpu_id == 'gpu-1'
        assert gpu_state.name == 'NVIDIA GeForce RTX 3080'
        
        # GPU sağlık durumunu kontrol et
        is_healthy = await self.gpu_state_monitor.is_gpu_healthy('gpu-1')
        assert is_healthy == True
        
    async def test_load_balancer_integration(self):
        """Yük Dengeleyici entegrasyon testi."""
        # Test isteği oluştur
        request = Request(
            user_id='user-1',
            model_id='model-1',
            priority=3,
            type='inference',
            resource_requirements={
                'memory': 1024,  # 1 GB
                'compute_units': 1,
                'max_batch_size': 1,
                'expected_duration': 1000
            }
        )
        
        # En uygun GPU'yu seç
        gpu_id = await self.load_balancer.select_gpu(request)
        
        # GPU seçimini kontrol et
        assert gpu_id is not None
        assert gpu_id in ['gpu-1', 'gpu-2']
        
    async def test_request_router_integration(self):
        """İstek Yönlendirici entegrasyon testi."""
        # Test isteği oluştur
        request = Request(
            user_id='user-1',
            model_id='model-1',
            priority=3,
            type='inference',
            resource_requirements={
                'memory': 1024,  # 1 GB
                'compute_units': 1,
                'max_batch_size': 1,
                'expected_duration': 1000
            },
            callback_url='http://localhost:8002/callback'
        )
        
        # İsteği yönlendir
        result = await self.request_router.route_request(request)
        
        # Yönlendirme sonucunu kontrol et
        assert result is not None
        assert 'request_id' in result
        assert result['status'] == 'processing'
        assert result['gpu_id'] in ['gpu-1', 'gpu-2']
        
        # İşlemin tamamlanması için bekle
        await asyncio.sleep(2)
        
        # İstek durumunu sorgula
        status = await self.request_router.get_request_status(result['request_id'])
        
        # İstek durumunu kontrol et
        assert status is not None
        assert status['request_id'] == result['request_id']
        assert status['status'] == 'completed'
        
        # Callback'in alındığını kontrol et
        assert len(self.ai_orchestrator.callbacks) > 0
        callback = self.ai_orchestrator.callbacks[-1]
        assert callback['request_id'] == result['request_id']
        assert callback['status'] == 'completed'
        
    async def test_user_quota_manager_integration(self):
        """Kullanıcı Kota Yöneticisi entegrasyon testi."""
        # Kullanıcı kotasını al
        quota = await self.user_quota_manager.get_quota('user-1')
        
        # Kullanıcı kotasını kontrol et
        assert quota is not None
        assert quota.user_id == 'user-1'
        assert quota.gpu_limit == 2
        assert quota.request_limit == 100
        
        # Kullanıcı kotasını güncelle
        await self.user_quota_manager.update_quota('user-1', gpu_usage=1, request_count=10)
        
        # Güncellenmiş kullanıcı kotasını al
        quota = await self.user_quota_manager.get_quota('user-1')
        
        # Güncellenmiş kullanıcı kotasını kontrol et
        assert quota.gpu_usage == 1
        assert quota.request_count == 10
        
        # Kullanıcı kotasını kontrol et
        is_allowed, reason = await self.user_quota_manager.check_quota('user-1', Request(priority=3))
        assert is_allowed == True
        
        # Kullanıcı kotasını sıfırla
        await self.user_quota_manager.reset_quota('user-1')
        
        # Sıfırlanmış kullanıcı kotasını al
        quota = await self.user_quota_manager.get_quota('user-1')
        
        # Sıfırlanmış kullanıcı kotasını kontrol et
        assert quota.gpu_usage == 0
        assert quota.request_count == 0
        
    async def test_end_to_end_integration(self):
        """Uçtan uca entegrasyon testi."""
        # Test isteği oluştur
        request_data = {
            'user_id': 'user-1',
            'model_id': 'model-1',
            'priority': 3,
            'type': 'inference',
            'resource_requirements': {
                'memory': 1024,  # 1 GB
                'compute_units': 1,
                'max_batch_size': 1,
                'expected_duration': 1000
            },
            'callback_url': 'http://localhost:8002/callback'
        }
        
        # İsteği işle
        request, error = await self.request_receiver.process_request(request_data)
        assert error is None
        
        # Kullanıcı kotasını kontrol et
        is_allowed, reason = await self.user_quota_manager.check_quota(request.user_id, request)
        assert is_allowed == True
        
        # İsteği yönlendir
        result = await self.request_router.route_request(request)
        assert result is not None
        assert 'request_id' in result
        assert result['status'] == 'processing'
        
        # Kullanıcı kotasını güncelle
        await self.user_quota_manager.update_quota(
            request.user_id,
            gpu_usage=1 if result.get('gpu_id') else 0,
            request_count=1
        )
        
        # İşlemin tamamlanması için bekle
        await asyncio.sleep(2)
        
        # İstek durumunu sorgula
        status = await self.request_router.get_request_status(result['request_id'])
        assert status is not None
        assert status['status'] == 'completed'
        
        # Callback'in alındığını kontrol et
        assert len(self.ai_orchestrator.callbacks) > 0
        callback = self.ai_orchestrator.callbacks[-1]
        assert callback['request_id'] == result['request_id']
        assert callback['status'] == 'completed'
