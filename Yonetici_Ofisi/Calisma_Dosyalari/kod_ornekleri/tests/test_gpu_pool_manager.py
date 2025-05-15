#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
GPU Havuzu Yöneticisi Birim Testleri

Bu modül, GPU Havuzu Yöneticisi için birim testleri içerir.
"""

import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import time

# Modül yolunu ekle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Test edilecek modülü içe aktar
from gpu_pool_manager import GPUPoolManager, NVMLGPUPoolManager, GPUStatus, GPUInfo

class MockNVMLError(Exception):
    """NVML hata sınıfı mock'u."""
    pass

class TestGPUPoolManager(unittest.TestCase):
    """GPU Havuzu Yöneticisi için birim testleri."""
    
    def setUp(self):
        """Her test öncesinde çalışacak kurulum."""
        # Temel yapılandırma
        self.config = {
            'min_compute_capability': 7.0,
            'memory_threshold': 0.9,
            'utilization_threshold': 0.95,
            'health_check_interval': 1.0,
            'max_temperature': 85
        }
        
    def test_abstract_methods(self):
        """Soyut metodların uygulanması gerektiğini test et."""
        # GPUPoolManager soyut bir sınıf olduğundan, doğrudan örneklenemez
        with self.assertRaises(TypeError):
            manager = GPUPoolManager(self.config)
            
    def test_get_all_gpu_info(self):
        """get_all_gpu_info metodunu test et."""
        # GPUPoolManager'dan türetilmiş bir test sınıfı oluştur
        class TestManager(GPUPoolManager):
            def discover_gpus(self):
                return [0, 1]
                
            def get_gpu_info(self, gpu_id):
                if gpu_id == 0:
                    return GPUInfo(
                        id=0, name="Test GPU 0", compute_capability=(7, 5),
                        memory_total=16000, memory_used=4000, memory_free=12000,
                        utilization=30.0, temperature=60, power_usage=150.0,
                        power_limit=250.0, status=GPUStatus.AVAILABLE,
                        reserved_by=None, reserved_at=None, processes=[]
                    )
                elif gpu_id == 1:
                    return GPUInfo(
                        id=1, name="Test GPU 1", compute_capability=(8, 0),
                        memory_total=32000, memory_used=8000, memory_free=24000,
                        utilization=50.0, temperature=70, power_usage=200.0,
                        power_limit=300.0, status=GPUStatus.AVAILABLE,
                        reserved_by=None, reserved_at=None, processes=[]
                    )
                else:
                    raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
                    
            def check_gpu_health(self, gpu_id):
                return True
                
        # Test Manager örneği oluştur
        manager = TestManager(self.config)
        
        # devices sözlüğünü manuel olarak doldur
        manager.devices = {
            0: {'status': GPUStatus.AVAILABLE, 'reserved_by': None, 'reserved_at': None},
            1: {'status': GPUStatus.AVAILABLE, 'reserved_by': None, 'reserved_at': None}
        }
        
        # get_all_gpu_info metodunu çağır
        all_gpu_info = manager.get_all_gpu_info()
        
        # Sonuçları doğrula
        self.assertEqual(len(all_gpu_info), 2)
        self.assertEqual(all_gpu_info[0].id, 0)
        self.assertEqual(all_gpu_info[0].name, "Test GPU 0")
        self.assertEqual(all_gpu_info[1].id, 1)
        self.assertEqual(all_gpu_info[1].name, "Test GPU 1")
        
    def test_reserve_and_release_gpu(self):
        """reserve_gpu ve release_gpu metodlarını test et."""
        # GPUPoolManager'dan türetilmiş bir test sınıfı oluştur
        class TestManager(GPUPoolManager):
            def discover_gpus(self):
                return [0, 1]
                
            def get_gpu_info(self, gpu_id):
                if gpu_id not in self.devices:
                    raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
                    
                status = self.devices[gpu_id]['status']
                reserved_by = self.devices[gpu_id]['reserved_by']
                reserved_at = self.devices[gpu_id]['reserved_at']
                
                return GPUInfo(
                    id=gpu_id, name=f"Test GPU {gpu_id}", compute_capability=(7, 5),
                    memory_total=16000, memory_used=4000, memory_free=12000,
                    utilization=30.0, temperature=60, power_usage=150.0,
                    power_limit=250.0, status=status,
                    reserved_by=reserved_by, reserved_at=reserved_at, processes=[]
                )
                
            def check_gpu_health(self, gpu_id):
                return True
                
        # Test Manager örneği oluştur
        manager = TestManager(self.config)
        
        # devices sözlüğünü manuel olarak doldur
        manager.devices = {
            0: {'status': GPUStatus.AVAILABLE, 'reserved_by': None, 'reserved_at': None},
            1: {'status': GPUStatus.AVAILABLE, 'reserved_by': None, 'reserved_at': None}
        }
        
        # GPU 0'ı rezerve et
        result = manager.reserve_gpu(0, "task-123")
        
        # Sonuçları doğrula
        self.assertTrue(result)
        self.assertEqual(manager.devices[0]['status'], GPUStatus.RESERVED)
        self.assertEqual(manager.devices[0]['reserved_by'], "task-123")
        self.assertIsNotNone(manager.devices[0]['reserved_at'])
        
        # Zaten rezerve edilmiş GPU'yu rezerve etmeyi dene
        result = manager.reserve_gpu(0, "task-456")
        
        # Sonuçları doğrula
        self.assertFalse(result)
        self.assertEqual(manager.devices[0]['reserved_by'], "task-123")
        
        # GPU 0'ı serbest bırak
        result = manager.release_gpu(0, "task-123")
        
        # Sonuçları doğrula
        self.assertTrue(result)
        self.assertEqual(manager.devices[0]['status'], GPUStatus.AVAILABLE)
        self.assertIsNone(manager.devices[0]['reserved_by'])
        self.assertIsNone(manager.devices[0]['reserved_at'])
        
        # Yanlış görev ID'si ile GPU'yu serbest bırakmayı dene
        manager.devices[0]['status'] = GPUStatus.RESERVED
        manager.devices[0]['reserved_by'] = "task-123"
        manager.devices[0]['reserved_at'] = time.time()
        
        with self.assertRaises(ValueError):
            manager.release_gpu(0, "task-456")
            
        # Geçersiz GPU ID'si ile işlem yapmayı dene
        with self.assertRaises(ValueError):
            manager.reserve_gpu(2, "task-123")
            
        with self.assertRaises(ValueError):
            manager.release_gpu(2, "task-123")
            
    def test_get_available_gpus(self):
        """get_available_gpus metodunu test et."""
        # GPUPoolManager'dan türetilmiş bir test sınıfı oluştur
        class TestManager(GPUPoolManager):
            def discover_gpus(self):
                return [0, 1, 2]
                
            def get_gpu_info(self, gpu_id):
                if gpu_id == 0:
                    return GPUInfo(
                        id=0, name="Test GPU 0", compute_capability=(7, 5),
                        memory_total=16000, memory_used=4000, memory_free=12000,
                        utilization=30.0, temperature=60, power_usage=150.0,
                        power_limit=250.0, status=GPUStatus.AVAILABLE,
                        reserved_by=None, reserved_at=None, processes=[]
                    )
                elif gpu_id == 1:
                    return GPUInfo(
                        id=1, name="Test GPU 1", compute_capability=(8, 0),
                        memory_total=16000, memory_used=15000, memory_free=1000,
                        utilization=95.0, temperature=70, power_usage=200.0,
                        power_limit=300.0, status=GPUStatus.AVAILABLE,
                        reserved_by=None, reserved_at=None, processes=[]
                    )
                elif gpu_id == 2:
                    return GPUInfo(
                        id=2, name="Test GPU 2", compute_capability=(8, 0),
                        memory_total=16000, memory_used=8000, memory_free=8000,
                        utilization=50.0, temperature=70, power_usage=200.0,
                        power_limit=300.0, status=GPUStatus.RESERVED,
                        reserved_by="task-123", reserved_at=time.time(), processes=[]
                    )
                else:
                    raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
                    
            def check_gpu_health(self, gpu_id):
                return True
                
        # Test Manager örneği oluştur
        manager = TestManager(self.config)
        
        # devices sözlüğünü manuel olarak doldur
        manager.devices = {
            0: {'status': GPUStatus.AVAILABLE, 'reserved_by': None, 'reserved_at': None},
            1: {'status': GPUStatus.AVAILABLE, 'reserved_by': None, 'reserved_at': None},
            2: {'status': GPUStatus.RESERVED, 'reserved_by': "task-123", 'reserved_at': time.time()}
        }
        
        # get_available_gpus metodunu çağır
        available_gpus = manager.get_available_gpus()
        
        # Sonuçları doğrula
        self.assertEqual(len(available_gpus), 1)
        self.assertEqual(available_gpus[0], 0)
        
        # GPU 1'in bellek kullanımını eşiğin altına düşür
        manager.memory_threshold = 0.99  # %99
        
        # get_available_gpus metodunu tekrar çağır
        available_gpus = manager.get_available_gpus()
        
        # Sonuçları doğrula
        self.assertEqual(len(available_gpus), 2)
        self.assertIn(0, available_gpus)
        self.assertIn(1, available_gpus)


@patch('gpu_pool_manager.pynvml')
class TestNVMLGPUPoolManager(unittest.TestCase):
    """NVML GPU Havuzu Yöneticisi için birim testleri."""
    
    def setUp(self):
        """Her test öncesinde çalışacak kurulum."""
        # Temel yapılandırma
        self.config = {
            'min_compute_capability': 7.0,
            'memory_threshold': 0.9,
            'utilization_threshold': 0.95,
            'health_check_interval': 1.0,
            'max_temperature': 85
        }
        
        # NVML hata sınıfı mock'u
        self.nvml_error = MockNVMLError
        
    def test_init(self, mock_pynvml):
        """__init__ metodunu test et."""
        # NVML hata sınıfını ayarla
        mock_pynvml.NVMLError = self.nvml_error
        
        # nvmlInit'in başarılı olduğunu simüle et
        mock_pynvml.nvmlDeviceGetCount.return_value = 2
        
        # NVMLGPUPoolManager örneği oluştur
        with patch('gpu_pool_manager.NVML_AVAILABLE', True):
            manager = NVMLGPUPoolManager(self.config)
            
            # nvmlInit'in çağrıldığını doğrula
            mock_pynvml.nvmlInit.assert_called_once()
            
            # nvmlDeviceGetCount'un çağrıldığını doğrula
            mock_pynvml.nvmlDeviceGetCount.assert_called_once()
            
            # discover_gpus'un çağrıldığını doğrula
            self.assertEqual(manager.device_count, 2)
            
    def test_discover_gpus(self, mock_pynvml):
        """discover_gpus metodunu test et."""
        # NVML hata sınıfını ayarla
        mock_pynvml.NVMLError = self.nvml_error
        
        # nvmlInit'in başarılı olduğunu simüle et
        mock_pynvml.nvmlDeviceGetCount.return_value = 2
        
        # GPU handle'larını simüle et
        mock_handles = [MagicMock(), MagicMock()]
        mock_pynvml.nvmlDeviceGetHandleByIndex.side_effect = lambda i: mock_handles[i]
        
        # GPU isimlerini simüle et
        mock_pynvml.nvmlDeviceGetName.side_effect = lambda h: f"NVIDIA A100-{mock_handles.index(h)}".encode('utf-8')
        
        # Compute capability'leri simüle et
        mock_pynvml.nvmlDeviceGetCudaComputeCapability.side_effect = lambda h: (8, 0) if mock_handles.index(h) == 0 else (7, 0)
        
        # Bellek bilgilerini simüle et
        memory_info = MagicMock()
        memory_info.total = 40 * 1024 * 1024 * 1024  # 40 GB
        mock_pynvml.nvmlDeviceGetMemoryInfo.return_value = memory_info
        
        # NVMLGPUPoolManager örneği oluştur
        with patch('gpu_pool_manager.NVML_AVAILABLE', True):
            manager = NVMLGPUPoolManager(self.config)
            
            # discover_gpus metodunu çağır
            discovered_gpus = manager.discover_gpus()
            
            # Sonuçları doğrula
            self.assertEqual(len(discovered_gpus), 2)
            self.assertEqual(discovered_gpus, [0, 1])
            self.assertEqual(len(manager.devices), 2)
            self.assertEqual(manager.devices[0]['name'], "NVIDIA A100-0")
            self.assertEqual(manager.devices[1]['name'], "NVIDIA A100-1")
            
    def test_get_gpu_info(self, mock_pynvml):
        """get_gpu_info metodunu test et."""
        # NVML hata sınıfını ayarla
        mock_pynvml.NVMLError = self.nvml_error
        
        # nvmlInit'in başarılı olduğunu simüle et
        mock_pynvml.nvmlDeviceGetCount.return_value = 1
        
        # GPU handle'ını simüle et
        mock_handle = MagicMock()
        mock_pynvml.nvmlDeviceGetHandleByIndex.return_value = mock_handle
        
        # GPU ismini simüle et
        mock_pynvml.nvmlDeviceGetName.return_value = "NVIDIA A100".encode('utf-8')
        
        # Compute capability'i simüle et
        mock_pynvml.nvmlDeviceGetCudaComputeCapability.return_value = (8, 0)
        
        # Bellek bilgilerini simüle et
        memory_info = MagicMock()
        memory_info.total = 40 * 1024 * 1024 * 1024  # 40 GB
        memory_info.used = 10 * 1024 * 1024 * 1024   # 10 GB
        memory_info.free = 30 * 1024 * 1024 * 1024   # 30 GB
        mock_pynvml.nvmlDeviceGetMemoryInfo.return_value = memory_info
        
        # Kullanım oranlarını simüle et
        utilization = MagicMock()
        utilization.gpu = 50  # %50
        mock_pynvml.nvmlDeviceGetUtilizationRates.return_value = utilization
        
        # Sıcaklığı simüle et
        mock_pynvml.nvmlDeviceGetTemperature.return_value = 70  # 70°C
        
        # Güç kullanımını simüle et
        mock_pynvml.nvmlDeviceGetPowerUsage.return_value = 200000  # 200W (mW cinsinden)
        
        # Güç limitini simüle et
        mock_pynvml.nvmlDeviceGetPowerManagementLimit.return_value = 300000  # 300W (mW cinsinden)
        
        # Çalışan süreçleri simüle et
        proc = MagicMock()
        proc.pid = 1234
        proc.usedGpuMemory = 5 * 1024 * 1024 * 1024  # 5 GB
        mock_pynvml.nvmlDeviceGetComputeRunningProcesses.return_value = [proc]
        
        # Süreç ismini simüle et
        mock_pynvml.nvmlSystemGetProcessName.return_value = "python".encode('utf-8')
        
        # NVMLGPUPoolManager örneği oluştur
        with patch('gpu_pool_manager.NVML_AVAILABLE', True):
            manager = NVMLGPUPoolManager(self.config)
            
            # devices sözlüğünü manuel olarak doldur
            manager.devices = {
                0: {
                    'handle': mock_handle,
                    'name': "NVIDIA A100",
                    'compute_capability': (8, 0),
                    'memory_total': 40 * 1024 * 1024 * 1024,
                    'status': GPUStatus.AVAILABLE,
                    'reserved_by': None,
                    'reserved_at': None
                }
            }
            
            # get_gpu_info metodunu çağır
            gpu_info = manager.get_gpu_info(0)
            
            # Sonuçları doğrula
            self.assertEqual(gpu_info.id, 0)
            self.assertEqual(gpu_info.name, "NVIDIA A100")
            self.assertEqual(gpu_info.compute_capability, (8, 0))
            self.assertEqual(gpu_info.memory_total, 40 * 1024 * 1024 * 1024)
            self.assertEqual(gpu_info.memory_used, 10 * 1024 * 1024 * 1024)
            self.assertEqual(gpu_info.memory_free, 30 * 1024 * 1024 * 1024)
            self.assertEqual(gpu_info.utilization, 50)
            self.assertEqual(gpu_info.temperature, 70)
            self.assertEqual(gpu_info.power_usage, 200)
            self.assertEqual(gpu_info.power_limit, 300)
            self.assertEqual(gpu_info.status, GPUStatus.AVAILABLE)
            self.assertIsNone(gpu_info.reserved_by)
            self.assertIsNone(gpu_info.reserved_at)
            self.assertEqual(len(gpu_info.processes), 1)
            self.assertEqual(gpu_info.processes[0]['pid'], 1234)
            self.assertEqual(gpu_info.processes[0]['name'], "python")
            self.assertEqual(gpu_info.processes[0]['memory_used'], 5 * 1024 * 1024 * 1024)


if __name__ == '__main__':
    unittest.main()
