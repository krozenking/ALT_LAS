#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Çoklu GPU Desteği Performans Testleri

Bu modül, çoklu GPU desteğinin performansını ölçmek için testler içerir.
"""

import unittest
import sys
import os
import time
import threading
import random
import statistics
import concurrent.futures
from unittest.mock import patch, MagicMock

# Modül yolunu ekle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Test edilecek modülleri içe aktar
from gpu_pool_manager import GPUStatus, GPUInfo
from gpu_selection_strategy import StrategySelector
from workload_distributor import WorkloadDistributor, TaskStatus

class MockGPUPoolManager:
    """Mock GPU Havuzu Yöneticisi."""
    
    def __init__(self, gpu_count=2):
        """Mock GPU Havuzu Yöneticisi'ni başlat."""
        self.gpus = {}
        for i in range(gpu_count):
            self.gpus[i] = {
                'name': f'NVIDIA A100-{i}',
                'compute_capability': (8, 0),
                'memory_total': 40 * 1024 * 1024 * 1024,  # 40 GB
                'status': GPUStatus.AVAILABLE,
                'reserved_by': None,
                'reserved_at': None
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
            utilization = random.randint(10, 90)
            memory_used = random.randint(5, 35) * 1024 * 1024 * 1024  # 5-35 GB
            memory_free = gpu['memory_total'] - memory_used
            
            return GPUInfo(
                id=gpu_id,
                name=gpu['name'],
                compute_capability=gpu['compute_capability'],
                memory_total=gpu['memory_total'],
                memory_used=memory_used,
                memory_free=memory_free,
                utilization=utilization,
                temperature=random.randint(50, 85),
                power_usage=random.randint(150, 250),
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


class TestPerformance(unittest.TestCase):
    """Çoklu GPU Desteği Performans Testleri."""
    
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
        
    def create_distributor(self, gpu_count=2):
        """İş Yükü Dağıtıcı oluştur."""
        # Mock GPU Havuzu Yöneticisi
        gpu_manager = MockGPUPoolManager(gpu_count)
        
        # Strateji Seçici
        strategy_selector = StrategySelector(self.config)
        
        # İş Yükü Dağıtıcı
        distributor = WorkloadDistributor(
            gpu_manager,
            strategy_selector,
            self.config
        )
        
        # Kuyruk işleme thread'ini durdur (testlerde manuel olarak çağıracağız)
        distributor.stop_queue_processor()
        
        # _execute_task_on_gpu metodunu override et
        def mock_execute_task_on_gpu(task, gpu_id):
            # Görev yürütme thread'i başlat
            thread = threading.Thread(
                target=mock_task_execution_thread,
                args=(task, gpu_id),
                daemon=True
            )
            thread.start()
            
        def mock_task_execution_thread(task, gpu_id):
            task_id = task['id']
            
            try:
                # Görev süresini simüle et
                execution_time = task.get('execution_time', 0.1)
                time.sleep(execution_time)
                
                # Görev sonucunu oluştur
                result = {
                    'status': 'success',
                    'execution_time': execution_time,
                    'gpu_id': gpu_id,
                    'timestamp': time.time()
                }
                
                # Görev sonucunu kaydet
                with distributor.lock:
                    distributor.task_results[task_id] = result
                    distributor.task_status[task_id] = TaskStatus.COMPLETED
            except Exception as e:
                # Hata durumunda
                error_result = {
                    'status': 'error',
                    'error': str(e),
                    'gpu_id': gpu_id,
                    'timestamp': time.time()
                }
                
                # Hata sonucunu kaydet
                with distributor.lock:
                    distributor.task_results[task_id] = error_result
                    distributor.task_status[task_id] = TaskStatus.FAILED
            finally:
                # GPU'yu serbest bırak
                try:
                    gpu_manager.release_gpu(gpu_id, task_id)
                except Exception as e:
                    pass
                    
                # Görev-GPU eşleştirmesini kaldır
                with distributor.lock:
                    if task_id in distributor.task_gpu_mapping:
                        del distributor.task_gpu_mapping[task_id]
                        
        distributor._execute_task_on_gpu = mock_execute_task_on_gpu
        
        return distributor, gpu_manager
        
    def create_task(self, task_type='default', execution_time=0.1):
        """Görev oluştur."""
        return {
            'id': f'task-{random.randint(1000, 9999)}',
            'type': task_type,
            'execution_time': execution_time
        }
        
    def test_single_vs_multi_gpu_throughput(self):
        """Tek GPU vs. çoklu GPU throughput karşılaştırması."""
        # Test parametreleri
        task_count = 100
        execution_time = 0.01
        
        # Tek GPU ile test
        distributor_single, _ = self.create_distributor(gpu_count=1)
        
        # Görevleri oluştur
        tasks = [self.create_task(execution_time=execution_time) for _ in range(task_count)]
        
        # Başlangıç zamanını kaydet
        start_time_single = time.time()
        
        # Görevleri dağıt
        for task in tasks:
            distributor_single.distribute_task(task)
            
        # Tüm görevlerin tamamlanmasını bekle
        while len(distributor_single.task_results) < task_count:
            time.sleep(0.01)
            
        # Bitiş zamanını kaydet
        end_time_single = time.time()
        
        # Toplam süreyi hesapla
        total_time_single = end_time_single - start_time_single
        
        # Throughput hesapla (görev/saniye)
        throughput_single = task_count / total_time_single
        
        # İki GPU ile test
        distributor_multi, _ = self.create_distributor(gpu_count=2)
        
        # Görevleri oluştur
        tasks = [self.create_task(execution_time=execution_time) for _ in range(task_count)]
        
        # Başlangıç zamanını kaydet
        start_time_multi = time.time()
        
        # Görevleri dağıt
        for task in tasks:
            distributor_multi.distribute_task(task)
            
        # Tüm görevlerin tamamlanmasını bekle
        while len(distributor_multi.task_results) < task_count:
            time.sleep(0.01)
            
        # Bitiş zamanını kaydet
        end_time_multi = time.time()
        
        # Toplam süreyi hesapla
        total_time_multi = end_time_multi - start_time_multi
        
        # Throughput hesapla (görev/saniye)
        throughput_multi = task_count / total_time_multi
        
        # Hızlanma faktörünü hesapla
        speedup = throughput_multi / throughput_single
        
        # Sonuçları yazdır
        print(f"\nTek GPU Throughput: {throughput_single:.2f} görev/saniye")
        print(f"İki GPU Throughput: {throughput_multi:.2f} görev/saniye")
        print(f"Hızlanma Faktörü: {speedup:.2f}x")
        
        # Hızlanma faktörünün 1.5'ten büyük olduğunu doğrula
        self.assertGreater(speedup, 1.5)
        
    def test_batch_processing_performance(self):
        """Batch işleme performansını test et."""
        # Test parametreleri
        batch_size = 10
        batch_count = 10
        execution_time = 0.01
        
        # İş Yükü Dağıtıcı oluştur
        distributor, _ = self.create_distributor(gpu_count=2)
        
        # Batch'leri oluştur
        batches = []
        for i in range(batch_count):
            batch = [self.create_task(execution_time=execution_time) for _ in range(batch_size)]
            batches.append(batch)
            
        # Başlangıç zamanını kaydet
        start_time = time.time()
        
        # Batch'leri dağıt
        for batch in batches:
            distributor.distribute_batch(batch, split_batch=True)
            
        # Tüm görevlerin tamamlanmasını bekle
        total_tasks = batch_size * batch_count
        while len(distributor.task_results) < total_tasks:
            time.sleep(0.01)
            
        # Bitiş zamanını kaydet
        end_time = time.time()
        
        # Toplam süreyi hesapla
        total_time = end_time - start_time
        
        # Throughput hesapla (görev/saniye)
        throughput = total_tasks / total_time
        
        # Sonuçları yazdır
        print(f"\nBatch İşleme Throughput: {throughput:.2f} görev/saniye")
        print(f"Ortalama Batch İşleme Süresi: {total_time / batch_count:.4f} saniye")
        
    def test_concurrent_requests(self):
        """Eşzamanlı istekleri test et."""
        # Test parametreleri
        concurrent_requests = 20
        execution_time = 0.05
        
        # İş Yükü Dağıtıcı oluştur
        distributor, _ = self.create_distributor(gpu_count=2)
        
        # Görevleri oluştur
        tasks = [self.create_task(execution_time=execution_time) for _ in range(concurrent_requests)]
        
        # Yanıt sürelerini saklamak için liste
        response_times = []
        
        # Eşzamanlı istekleri simüle et
        def send_request(task):
            start_time = time.time()
            selected_gpu = distributor.distribute_task(task)
            
            # Görevin tamamlanmasını bekle
            task_id = task['id']
            while task_id not in distributor.task_results:
                time.sleep(0.01)
                
            end_time = time.time()
            return end_time - start_time
            
        # ThreadPoolExecutor ile eşzamanlı istekleri gönder
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
            futures = [executor.submit(send_request, task) for task in tasks]
            
            # Sonuçları topla
            for future in concurrent.futures.as_completed(futures):
                response_times.append(future.result())
                
        # İstatistikleri hesapla
        avg_response_time = statistics.mean(response_times)
        p95_response_time = sorted(response_times)[int(len(response_times) * 0.95)]
        p99_response_time = sorted(response_times)[int(len(response_times) * 0.99)]
        
        # Sonuçları yazdır
        print(f"\nEşzamanlı İstekler: {concurrent_requests}")
        print(f"Ortalama Yanıt Süresi: {avg_response_time:.4f} saniye")
        print(f"95. Persentil Yanıt Süresi: {p95_response_time:.4f} saniye")
        print(f"99. Persentil Yanıt Süresi: {p99_response_time:.4f} saniye")


if __name__ == '__main__':
    unittest.main()
