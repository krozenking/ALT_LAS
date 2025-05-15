#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Çoklu GPU Desteği Entegrasyon Testleri

Bu modül, çoklu GPU desteği bileşenlerinin entegrasyonu için testler içerir.
"""

import unittest
import sys
import os
import time
import threading
import json
from unittest.mock import patch, MagicMock

# Modül yolunu ekle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Test edilecek modülleri içe aktar
from gpu_pool_manager import GPUStatus, GPUInfo
from gpu_selection_strategy import StrategySelector
from workload_distributor import WorkloadDistributor, TaskStatus
import api_extensions

class MockGPUPoolManager:
    """Mock GPU Havuzu Yöneticisi."""
    
    def __init__(self):
        """Mock GPU Havuzu Yöneticisi'ni başlat."""
        self.gpus = {
            0: {
                'name': 'NVIDIA A100',
                'compute_capability': (8, 0),
                'memory_total': 40 * 1024 * 1024 * 1024,  # 40 GB
                'status': GPUStatus.AVAILABLE,
                'reserved_by': None,
                'reserved_at': None
            },
            1: {
                'name': 'NVIDIA A100',
                'compute_capability': (8, 0),
                'memory_total': 40 * 1024 * 1024 * 1024,  # 40 GB
                'status': GPUStatus.AVAILABLE,
                'reserved_by': None,
                'reserved_at': None
            }
        }
        self.lock = threading.RLock()
        
    def discover_gpus(self):
        """Sistemdeki tüm uyumlu GPU'ları algıla ve döndür."""
        return list(self.gpus.keys())
        
    def get_gpu_info(self, gpu_id):
        """Belirli bir GPU'nun özelliklerini ve durumunu döndür."""
        if gpu_id not in self.gpus:
            raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
            
        with self.lock:
            gpu = self.gpus[gpu_id]
            
            # Rastgele değerler oluştur
            utilization = 30 if gpu_id == 0 else 70
            memory_used = 10 * 1024 * 1024 * 1024 if gpu_id == 0 else 25 * 1024 * 1024 * 1024  # 10 GB / 25 GB
            memory_free = gpu['memory_total'] - memory_used
            
            return GPUInfo(
                id=gpu_id,
                name=gpu['name'],
                compute_capability=gpu['compute_capability'],
                memory_total=gpu['memory_total'],
                memory_used=memory_used,
                memory_free=memory_free,
                utilization=utilization,
                temperature=70,
                power_usage=200,
                power_limit=300,
                status=gpu['status'],
                reserved_by=gpu['reserved_by'],
                reserved_at=gpu['reserved_at'],
                processes=[]
            )
            
    def get_all_gpu_info(self):
        """Tüm GPU'ların özelliklerini ve durumlarını döndür."""
        result = {}
        for gpu_id in self.gpus:
            result[gpu_id] = self.get_gpu_info(gpu_id)
        return result
        
    def reserve_gpu(self, gpu_id, task_id):
        """Belirli bir GPU'yu belirli bir görev için rezerve et."""
        if gpu_id not in self.gpus:
            raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
            
        with self.lock:
            gpu = self.gpus[gpu_id]
            
            if gpu['status'] != GPUStatus.AVAILABLE:
                return False
                
            gpu['status'] = GPUStatus.RESERVED
            gpu['reserved_by'] = task_id
            gpu['reserved_at'] = time.time()
            
            return True
            
    def release_gpu(self, gpu_id, task_id):
        """Belirli bir GPU'yu serbest bırak."""
        if gpu_id not in self.gpus:
            raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
            
        with self.lock:
            gpu = self.gpus[gpu_id]
            
            if gpu['reserved_by'] != task_id:
                raise ValueError(f"GPU {gpu_id} '{gpu['reserved_by']}' görevi tarafından rezerve edilmiş, '{task_id}' tarafından değil")
                
            gpu['status'] = GPUStatus.AVAILABLE
            gpu['reserved_by'] = None
            gpu['reserved_at'] = None
            
            return True
            
    def get_available_gpus(self):
        """Kullanılabilir GPU'ları döndür."""
        with self.lock:
            return [gpu_id for gpu_id, gpu in self.gpus.items() if gpu['status'] == GPUStatus.AVAILABLE]
            
    def check_gpu_health(self, gpu_id):
        """Belirli bir GPU'nun sağlık durumunu kontrol et."""
        return True


class TestIntegration(unittest.TestCase):
    """Çoklu GPU Desteği Entegrasyon Testleri."""
    
    def setUp(self):
        """Her test öncesinde çalışacak kurulum."""
        # Yapılandırma
        self.config = {
            'default_strategy': 'least_loaded',
            'task_specific_mappings': {
                'image_segmentation': 'gpu_0',
                'text_generation': 'gpu_1'
            },
            'queue_processing_interval': 0.1,
            'max_concurrent_tasks_per_gpu': 4
        }
        
        # Mock GPU Havuzu Yöneticisi
        self.gpu_manager = MockGPUPoolManager()
        
        # Strateji Seçici
        self.strategy_selector = StrategySelector(self.config)
        
        # İş Yükü Dağıtıcı
        self.distributor = WorkloadDistributor(
            self.gpu_manager,
            self.strategy_selector,
            self.config
        )
        
        # Kuyruk işleme thread'ini durdur (testlerde manuel olarak çağıracağız)
        self.distributor.stop_queue_processor()
        
        # API'yi yapılandır
        api_extensions.distributor = self.distributor
        self.app = api_extensions.app.test_client()
        self.app.testing = True
        
        # Örnek görevler
        self.tasks = [
            {'id': 'task-1', 'type': 'image_segmentation', 'text': 'Sample input 1', 'execution_time': 0.1},
            {'id': 'task-2', 'type': 'text_generation', 'text': 'Sample input 2', 'execution_time': 0.1},
            {'id': 'task-3', 'type': 'object_detection', 'text': 'Sample input 3', 'execution_time': 0.1}
        ]
        
    def tearDown(self):
        """Her test sonrasında çalışacak temizlik."""
        # İş Yükü Dağıtıcı'yı temizle
        self.distributor.stop_queue_processor()
        
    def test_gpu_selection_and_distribution(self):
        """GPU seçimi ve dağıtımını test et."""
        # _execute_task_on_gpu metodunu mock'la
        self.distributor._execute_task_on_gpu = MagicMock()
        
        # Görevleri dağıt
        for task in self.tasks:
            selected_gpu = self.distributor.distribute_task(task)
            
            # Sonuçları doğrula
            self.assertIsNotNone(selected_gpu)
            self.assertIn(selected_gpu, [0, 1])
            
            # Görev durumunun güncellendiğini doğrula
            self.assertEqual(self.distributor.task_status[task['id']], TaskStatus.RUNNING)
            self.assertEqual(self.distributor.task_gpu_mapping[task['id']], selected_gpu)
            
        # _execute_task_on_gpu'nun çağrıldığını doğrula
        self.assertEqual(self.distributor._execute_task_on_gpu.call_count, 3)
        
        # GPU'ların rezerve edildiğini doğrula
        for task_id, gpu_id in self.distributor.task_gpu_mapping.items():
            self.assertEqual(self.gpu_manager.gpus[gpu_id]['status'], GPUStatus.RESERVED)
            self.assertEqual(self.gpu_manager.gpus[gpu_id]['reserved_by'], task_id)
            
    def test_api_predict_and_status(self):
        """API predict ve status endpoint'lerini test et."""
        # _execute_task_on_gpu metodunu mock'la
        self.distributor._execute_task_on_gpu = MagicMock()
        
        # Predict isteği gönder
        response = self.app.post(
            '/api/v1/predict',
            data=json.dumps({
                'text': 'Sample input text',
                'max_length': 128,
                'temperature': 0.7,
                'gpu_options': {
                    'strategy': 'least_loaded'
                }
            }),
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('task_id', data)
        self.assertIn('gpu_id', data)
        self.assertEqual(data['status'], 'running')
        
        # Görev ID'sini al
        task_id = data['task_id']
        
        # Görev durumunu sorgula
        response = self.app.get(f'/api/v1/task/{task_id}')
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['task_id'], task_id)
        self.assertIn('gpu_id', data)
        self.assertEqual(data['status'], 'running')
        
        # Tüm görevleri sorgula
        response = self.app.get('/api/v1/tasks')
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('tasks', data)
        self.assertIn(task_id, data['tasks'])
        
        # GPU'ları sorgula
        response = self.app.get('/api/v1/gpus')
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('gpus', data)
        self.assertEqual(len(data['gpus']), 2)
        
    def test_batch_processing(self):
        """Batch işlemeyi test et."""
        # _execute_task_on_gpu metodunu mock'la
        self.distributor._execute_task_on_gpu = MagicMock()
        
        # Batch isteği gönder
        response = self.app.post(
            '/api/v1/batch_predict',
            data=json.dumps({
                'batch': [
                    {
                        'text': 'Sample input text 1',
                        'max_length': 128,
                        'temperature': 0.7
                    },
                    {
                        'text': 'Sample input text 2',
                        'max_length': 256,
                        'temperature': 0.5
                    }
                ],
                'gpu_options': {
                    'strategy': 'round_robin',
                    'batch_split': True
                }
            }),
            content_type='application/json'
        )
        
        # Sonuçları doğrula
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('status', data)
        self.assertIn('tasks', data)
        self.assertEqual(len(data['tasks']), 2)
        
        # Görev ID'lerini al
        task_ids = [task['task_id'] for task in data['tasks']]
        
        # Her görevin durumunu sorgula
        for task_id in task_ids:
            response = self.app.get(f'/api/v1/task/{task_id}')
            
            # Sonuçları doğrula
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(data['task_id'], task_id)
            self.assertIn('gpu_id', data)
            self.assertEqual(data['status'], 'running')


if __name__ == '__main__':
    unittest.main()
