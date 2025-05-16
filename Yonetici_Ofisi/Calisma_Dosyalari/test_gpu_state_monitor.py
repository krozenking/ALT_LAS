"""
GPU Durum İzleyici (GPU State Monitor) Birim Testleri

Bu modül, GPU Durum İzleyici bileşeninin birim testlerini içerir.
"""

import asyncio
import pytest
import unittest
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime

# GPU Durum İzleyici modülünü içe aktar
from gpu_state_monitor import GPUState, GPUStateMonitor

class TestGPUState:
    """GPU Durumu sınıfı için testler."""
    
    def test_init(self):
        """GPU Durumu başlatma testi."""
        # GPU Durumu oluştur
        gpu_state = GPUState(
            gpu_id="gpu-1",
            name="NVIDIA GeForce RTX 3080",
            status="available",
            compute_capability="8.6",
            memory_total=10737418240,  # 10 GB
            memory_used=2147483648,  # 2 GB
            utilization=0.3,
            temperature=65.0,
            power_usage=180.0,
            power_limit=320.0
        )
        
        # Özellikleri kontrol et
        assert gpu_state.gpu_id == "gpu-1"
        assert gpu_state.name == "NVIDIA GeForce RTX 3080"
        assert gpu_state.status == "available"
        assert gpu_state.compute_capability == "8.6"
        assert gpu_state.memory_total == 10737418240
        assert gpu_state.memory_used == 2147483648
        assert gpu_state.memory_free == 8589934592  # 8 GB
        assert gpu_state.utilization == 0.3
        assert gpu_state.temperature == 65.0
        assert gpu_state.power_usage == 180.0
        assert gpu_state.power_limit == 320.0
        
    def test_to_dict(self):
        """GPU Durumu sözlük dönüşümü testi."""
        # GPU Durumu oluştur
        gpu_state = GPUState(
            gpu_id="gpu-1",
            name="NVIDIA GeForce RTX 3080"
        )
        
        # Sözlüğe dönüştür
        gpu_dict = gpu_state.to_dict()
        
        # Sözlüğü kontrol et
        assert gpu_dict["gpu_id"] == "gpu-1"
        assert gpu_dict["name"] == "NVIDIA GeForce RTX 3080"
        assert "memory_total" in gpu_dict
        assert "memory_used" in gpu_dict
        assert "memory_free" in gpu_dict
        assert "status" in gpu_dict
        assert "last_updated" in gpu_dict
        
    def test_is_available(self):
        """GPU kullanılabilirlik testi."""
        # Kullanılabilir GPU
        gpu_state = GPUState(
            gpu_id="gpu-1",
            name="NVIDIA GeForce RTX 3080",
            status="available"
        )
        assert gpu_state.is_available() == True
        
        # Kullanılamaz GPU
        gpu_state = GPUState(
            gpu_id="gpu-2",
            name="NVIDIA GeForce RTX 3080",
            status="error"
        )
        assert gpu_state.is_available() == False
        
    def test_has_sufficient_memory(self):
        """GPU bellek yeterliliği testi."""
        # Yeterli belleğe sahip GPU
        gpu_state = GPUState(
            gpu_id="gpu-1",
            name="NVIDIA GeForce RTX 3080",
            memory_total=10737418240,  # 10 GB
            memory_used=2147483648  # 2 GB
        )
        assert gpu_state.has_sufficient_memory(4294967296) == True  # 4 GB
        
        # Yetersiz belleğe sahip GPU
        gpu_state = GPUState(
            gpu_id="gpu-2",
            name="NVIDIA GeForce RTX 3080",
            memory_total=10737418240,  # 10 GB
            memory_used=8589934592  # 8 GB
        )
        assert gpu_state.has_sufficient_memory(4294967296) == False  # 4 GB
        
    def test_is_healthy(self):
        """GPU sağlık durumu testi."""
        # Sağlıklı GPU
        gpu_state = GPUState(
            gpu_id="gpu-1",
            name="NVIDIA GeForce RTX 3080",
            status="available",
            temperature=65.0,
            error_rate=0.0
        )
        assert gpu_state.is_healthy(85.0) == True
        
        # Yüksek sıcaklıklı GPU
        gpu_state = GPUState(
            gpu_id="gpu-2",
            name="NVIDIA GeForce RTX 3080",
            status="available",
            temperature=90.0,
            error_rate=0.0
        )
        assert gpu_state.is_healthy(85.0) == False
        
        # Yüksek hata oranlı GPU
        gpu_state = GPUState(
            gpu_id="gpu-3",
            name="NVIDIA GeForce RTX 3080",
            status="available",
            temperature=65.0,
            error_rate=0.2
        )
        assert gpu_state.is_healthy(85.0) == False
        
        # Hata durumundaki GPU
        gpu_state = GPUState(
            gpu_id="gpu-4",
            name="NVIDIA GeForce RTX 3080",
            status="error",
            temperature=65.0,
            error_rate=0.0
        )
        assert gpu_state.is_healthy(85.0) == False
        
    def test_update(self):
        """GPU durumu güncelleme testi."""
        # GPU Durumu oluştur
        gpu_state = GPUState(
            gpu_id="gpu-1",
            name="NVIDIA GeForce RTX 3080",
            memory_total=10737418240,  # 10 GB
            memory_used=2147483648  # 2 GB
        )
        
        # Durumu güncelle
        gpu_state.update(
            status="busy",
            memory_used=4294967296,  # 4 GB
            temperature=70.0
        )
        
        # Güncellenmiş durumu kontrol et
        assert gpu_state.status == "busy"
        assert gpu_state.memory_used == 4294967296
        assert gpu_state.memory_free == 6442450944  # 6 GB
        assert gpu_state.temperature == 70.0

@pytest.mark.asyncio
class TestGPUStateMonitor:
    """GPU Durum İzleyici sınıfı için testler."""
    
    async def test_init(self):
        """GPU Durum İzleyici başlatma testi."""
        # Yapılandırma
        config = {
            'gpu_monitoring_url': 'http://gpu-monitoring-service:8080',
            'update_interval': 5,
            'health_check_interval': 60,
            'max_temperature': 85.0
        }
        
        # GPU Durum İzleyici oluştur
        monitor = GPUStateMonitor(config)
        
        # Özellikleri kontrol et
        assert monitor.config == config
        assert monitor.update_interval == 5
        assert monitor.health_check_interval == 60
        assert monitor.max_temperature == 85.0
        assert monitor.gpu_monitoring_url == 'http://gpu-monitoring-service:8080'
        assert isinstance(monitor.gpu_states, dict)
        assert len(monitor.gpu_states) == 0
        
    @patch('aiohttp.ClientSession.get')
    async def test_update_gpu_states(self, mock_get):
        """GPU durumlarını güncelleme testi."""
        # Mock yanıtı ayarla
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            'gpus': [
                {
                    'gpu_id': 'gpu-1',
                    'name': 'NVIDIA GeForce RTX 3080',
                    'status': 'available',
                    'compute_capability': '8.6',
                    'memory_total': 10737418240,  # 10 GB
                    'memory_used': 2147483648,  # 2 GB
                    'utilization': 0.3,
                    'temperature': 65.0,
                    'power_usage': 180.0,
                    'power_limit': 320.0
                },
                {
                    'gpu_id': 'gpu-2',
                    'name': 'NVIDIA GeForce RTX 3090',
                    'status': 'available',
                    'compute_capability': '8.6',
                    'memory_total': 21474836480,  # 20 GB
                    'memory_used': 4294967296,  # 4 GB
                    'utilization': 0.2,
                    'temperature': 60.0,
                    'power_usage': 200.0,
                    'power_limit': 350.0
                }
            ]
        })
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Yapılandırma
        config = {
            'gpu_monitoring_url': 'http://gpu-monitoring-service:8080',
            'update_interval': 5,
            'health_check_interval': 60,
            'max_temperature': 85.0
        }
        
        # GPU Durum İzleyici oluştur
        monitor = GPUStateMonitor(config)
        
        # GPU durumlarını güncelle
        await monitor.update_gpu_states()
        
        # GPU durumlarını kontrol et
        assert len(monitor.gpu_states) == 2
        assert 'gpu-1' in monitor.gpu_states
        assert 'gpu-2' in monitor.gpu_states
        assert monitor.gpu_states['gpu-1'].name == 'NVIDIA GeForce RTX 3080'
        assert monitor.gpu_states['gpu-2'].name == 'NVIDIA GeForce RTX 3090'
        
    @patch('aiohttp.ClientSession.get')
    async def test_get_gpu_states(self, mock_get):
        """GPU durumlarını alma testi."""
        # Mock yanıtı ayarla
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            'gpus': [
                {
                    'gpu_id': 'gpu-1',
                    'name': 'NVIDIA GeForce RTX 3080'
                }
            ]
        })
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Yapılandırma
        config = {
            'gpu_monitoring_url': 'http://gpu-monitoring-service:8080',
            'update_interval': 5
        }
        
        # GPU Durum İzleyici oluştur
        monitor = GPUStateMonitor(config)
        
        # GPU durumlarını al
        gpu_states = await monitor.get_gpu_states()
        
        # GPU durumlarını kontrol et
        assert len(gpu_states) == 1
        assert 'gpu-1' in gpu_states
        assert gpu_states['gpu-1'].name == 'NVIDIA GeForce RTX 3080'
        
    @patch('aiohttp.ClientSession.get')
    async def test_get_gpu_state(self, mock_get):
        """Belirli bir GPU'nun durumunu alma testi."""
        # Mock yanıtı ayarla
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            'gpus': [
                {
                    'gpu_id': 'gpu-1',
                    'name': 'NVIDIA GeForce RTX 3080'
                },
                {
                    'gpu_id': 'gpu-2',
                    'name': 'NVIDIA GeForce RTX 3090'
                }
            ]
        })
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Yapılandırma
        config = {
            'gpu_monitoring_url': 'http://gpu-monitoring-service:8080',
            'update_interval': 5
        }
        
        # GPU Durum İzleyici oluştur
        monitor = GPUStateMonitor(config)
        
        # GPU durumunu al
        gpu_state = await monitor.get_gpu_state('gpu-2')
        
        # GPU durumunu kontrol et
        assert gpu_state is not None
        assert gpu_state.gpu_id == 'gpu-2'
        assert gpu_state.name == 'NVIDIA GeForce RTX 3090'
        
        # Olmayan GPU durumunu al
        gpu_state = await monitor.get_gpu_state('gpu-3')
        
        # GPU durumunu kontrol et
        assert gpu_state is None
        
    @patch('aiohttp.ClientSession.get')
    async def test_is_gpu_healthy(self, mock_get):
        """GPU sağlık durumu kontrolü testi."""
        # Mock yanıtı ayarla
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            'gpus': [
                {
                    'gpu_id': 'gpu-1',
                    'name': 'NVIDIA GeForce RTX 3080',
                    'status': 'available',
                    'temperature': 65.0,
                    'error_rate': 0.0
                },
                {
                    'gpu_id': 'gpu-2',
                    'name': 'NVIDIA GeForce RTX 3090',
                    'status': 'error',
                    'temperature': 90.0,
                    'error_rate': 0.2
                }
            ]
        })
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Yapılandırma
        config = {
            'gpu_monitoring_url': 'http://gpu-monitoring-service:8080',
            'update_interval': 5,
            'max_temperature': 85.0
        }
        
        # GPU Durum İzleyici oluştur
        monitor = GPUStateMonitor(config)
        
        # GPU sağlık durumunu kontrol et
        is_healthy = await monitor.is_gpu_healthy('gpu-1')
        assert is_healthy == True
        
        is_healthy = await monitor.is_gpu_healthy('gpu-2')
        assert is_healthy == False
        
        is_healthy = await monitor.is_gpu_healthy('gpu-3')
        assert is_healthy == False
