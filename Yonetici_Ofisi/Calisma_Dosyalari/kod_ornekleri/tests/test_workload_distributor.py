#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
İş Yükü Dağıtıcı Birim Testleri

Bu modül, İş Yükü Dağıtıcı için birim testleri içerir.
"""

import unittest
import sys
import os
import time
import threading
from unittest.mock import patch, MagicMock, call

# Modül yolunu ekle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Test edilecek modülü içe aktar
from workload_distributor import WorkloadDistributor, TaskStatus, PrioritizedTask

class TestWorkloadDistributor(unittest.TestCase):
    """İş Yükü Dağıtıcı için birim testleri."""
    
    def setUp(self):
        """Her test öncesinde çalışacak kurulum."""
        # Mock GPU Havuzu Yöneticisi
        self.mock_gpu_manager = MagicMock()
        self.mock_gpu_manager.get_available_gpus.return_value = [0, 1]
        self.mock_gpu_manager.get_all_gpu_info.return_value = {
            0: type('GPUInfo', (), {
                'id': 0,
                'utilization': 30,
                'memory_used': 4000,
                'memory_total': 16000
            }),
            1: type('GPUInfo', (), {
                'id': 1,
                'utilization': 70,
                'memory_used': 8000,
                'memory_total': 16000
            })
        }
        
        # Mock Strateji Seçici
        self.mock_strategy = MagicMock()
        self.mock_strategy.select_gpu.return_value = 0
        
        self.mock_strategy_selector = MagicMock()
        self.mock_strategy_selector.get_strategy.return_value = self.mock_strategy
        self.mock_strategy_selector.get_default_strategy.return_value = self.mock_strategy
        
        # Yapılandırma
        self.config = {
            'default_strategy': 'least_loaded',
            'queue_processing_interval': 0.1,
            'max_concurrent_tasks_per_gpu': 4
        }
        
        # İş Yükü Dağıtıcı örneği oluştur
        self.distributor = WorkloadDistributor(
            self.mock_gpu_manager,
            self.mock_strategy_selector,
            self.config
        )
        
        # Kuyruk işleme thread'ini durdur (testlerde manuel olarak çağıracağız)
        self.distributor.stop_queue_processor()
        
        # Örnek görevler
        self.tasks = [
            {'id': 'task-1', 'type': 'image_segmentation', 'execution_time': 0.1},
            {'id': 'task-2', 'type': 'text_generation', 'execution_time': 0.1},
            {'id': 'task-3', 'type': 'object_detection', 'execution_time': 0.1}
        ]
        
    def tearDown(self):
        """Her test sonrasında çalışacak temizlik."""
        # İş Yükü Dağıtıcı'yı temizle
        self.distributor.stop_queue_processor()
        
    def test_distribute_task(self):
        """distribute_task metodunu test et."""
        # _execute_task_on_gpu metodunu mock'la
        self.distributor._execute_task_on_gpu = MagicMock()
        
        # Görevi dağıt
        selected_gpu = self.distributor.distribute_task(self.tasks[0])
        
        # Sonuçları doğrula
        self.assertEqual(selected_gpu, 0)
        
        # GPU Havuzu Yöneticisi'nin çağrıldığını doğrula
        self.mock_gpu_manager.get_available_gpus.assert_called_once()
        self.mock_gpu_manager.get_all_gpu_info.assert_called_once()
        self.mock_gpu_manager.reserve_gpu.assert_called_once_with(0, 'task-1')
        
        # Strateji Seçici'nin çağrıldığını doğrula
        self.mock_strategy_selector.get_strategy.assert_called_once_with('least_loaded')
        
        # Strateji'nin çağrıldığını doğrula
        self.mock_strategy.select_gpu.assert_called_once()
        
        # _execute_task_on_gpu'nun çağrıldığını doğrula
        self.distributor._execute_task_on_gpu.assert_called_once_with(self.tasks[0], 0)
        
        # Görev durumunun güncellendiğini doğrula
        self.assertEqual(self.distributor.task_status[self.tasks[0]['id']], TaskStatus.RUNNING)
        self.assertEqual(self.distributor.task_gpu_mapping[self.tasks[0]['id']], 0)
        
    def test_distribute_task_no_available_gpus(self):
        """Kullanılabilir GPU yokken distribute_task metodunu test et."""
        # _execute_task_on_gpu metodunu mock'la
        self.distributor._execute_task_on_gpu = MagicMock()
        
        # Kullanılabilir GPU olmadığını simüle et
        self.mock_gpu_manager.get_available_gpus.return_value = []
        
        # Görevi dağıt
        selected_gpu = self.distributor.distribute_task(self.tasks[0])
        
        # Sonuçları doğrula
        self.assertIsNone(selected_gpu)
        
        # GPU Havuzu Yöneticisi'nin çağrıldığını doğrula
        self.mock_gpu_manager.get_available_gpus.assert_called_once()
        
        # Strateji Seçici'nin çağrılmadığını doğrula
        self.mock_strategy_selector.get_strategy.assert_not_called()
        
        # Strateji'nin çağrılmadığını doğrula
        self.mock_strategy.select_gpu.assert_not_called()
        
        # _execute_task_on_gpu'nun çağrılmadığını doğrula
        self.distributor._execute_task_on_gpu.assert_not_called()
        
        # Görevin kuyruğa eklendiğini doğrula
        self.assertEqual(self.distributor.task_status[self.tasks[0]['id']], TaskStatus.QUEUED)
        self.assertEqual(self.distributor.task_queue.qsize(), 1)
        
    def test_distribute_task_strategy_returns_none(self):
        """Strateji None döndürdüğünde distribute_task metodunu test et."""
        # _execute_task_on_gpu metodunu mock'la
        self.distributor._execute_task_on_gpu = MagicMock()
        
        # Strateji'nin None döndürdüğünü simüle et
        self.mock_strategy.select_gpu.return_value = None
        
        # Görevi dağıt
        selected_gpu = self.distributor.distribute_task(self.tasks[0])
        
        # Sonuçları doğrula
        self.assertIsNone(selected_gpu)
        
        # GPU Havuzu Yöneticisi'nin çağrıldığını doğrula
        self.mock_gpu_manager.get_available_gpus.assert_called_once()
        self.mock_gpu_manager.get_all_gpu_info.assert_called_once()
        
        # Strateji Seçici'nin çağrıldığını doğrula
        self.mock_strategy_selector.get_strategy.assert_called_once()
        
        # Strateji'nin çağrıldığını doğrula
        self.mock_strategy.select_gpu.assert_called_once()
        
        # _execute_task_on_gpu'nun çağrılmadığını doğrula
        self.distributor._execute_task_on_gpu.assert_not_called()
        
        # Görevin kuyruğa eklendiğini doğrula
        self.assertEqual(self.distributor.task_status[self.tasks[0]['id']], TaskStatus.QUEUED)
        self.assertEqual(self.distributor.task_queue.qsize(), 1)
        
    def test_distribute_batch_split(self):
        """split_batch=True ile distribute_batch metodunu test et."""
        # distribute_task metodunu mock'la
        self.distributor.distribute_task = MagicMock()
        self.distributor.distribute_task.side_effect = [0, 1, None]
        
        # Batch'i dağıt
        result = self.distributor.distribute_batch(self.tasks, split_batch=True)
        
        # Sonuçları doğrula
        self.assertEqual(result['status'], 'mixed')
        self.assertEqual(len(result['distributed']), 2)
        self.assertEqual(len(result['queued']), 1)
        
        # distribute_task'ın çağrıldığını doğrula
        self.assertEqual(self.distributor.distribute_task.call_count, 3)
        
    def test_distribute_batch_no_split(self):
        """split_batch=False ile distribute_batch metodunu test et."""
        # _execute_task_on_gpu metodunu mock'la
        self.distributor._execute_task_on_gpu = MagicMock()
        
        # Batch'i dağıt
        result = self.distributor.distribute_batch(self.tasks, split_batch=False)
        
        # Sonuçları doğrula
        self.assertEqual(result['status'], 'running')
        self.assertEqual(result['gpu_id'], 0)
        self.assertEqual(len(result['task_ids']), 3)
        
        # GPU Havuzu Yöneticisi'nin çağrıldığını doğrula
        self.assertEqual(self.mock_gpu_manager.reserve_gpu.call_count, 3)
        
        # _execute_task_on_gpu'nun çağrıldığını doğrula
        self.assertEqual(self.distributor._execute_task_on_gpu.call_count, 3)
        
    def test_distribute_batch_no_available_gpus(self):
        """Kullanılabilir GPU yokken distribute_batch metodunu test et."""
        # Kullanılabilir GPU olmadığını simüle et
        self.mock_gpu_manager.get_available_gpus.return_value = []
        
        # Batch'i dağıt
        result = self.distributor.distribute_batch(self.tasks, split_batch=True)
        
        # Sonuçları doğrula
        self.assertEqual(result['status'], 'queued')
        self.assertEqual(len(result['task_ids']), 3)
        
        # Görevlerin kuyruğa eklendiğini doğrula
        self.assertEqual(self.distributor.task_queue.qsize(), 3)
        
    def test_cancel_task_queued(self):
        """Kuyruktaki bir görevi iptal etmeyi test et."""
        # Görevi kuyruğa ekle
        self.distributor.task_status['task-1'] = TaskStatus.QUEUED
        
        # Görevi iptal et
        result = self.distributor.cancel_task('task-1')
        
        # Sonuçları doğrula
        self.assertTrue(result)
        self.assertEqual(self.distributor.task_status['task-1'], TaskStatus.CANCELED)
        
    def test_cancel_task_running(self):
        """Çalışan bir görevi iptal etmeyi test et."""
        # Görevi çalışıyor olarak işaretle
        self.distributor.task_status['task-1'] = TaskStatus.RUNNING
        self.distributor.task_gpu_mapping['task-1'] = 0
        
        # Görevi iptal et
        result = self.distributor.cancel_task('task-1')
        
        # Sonuçları doğrula
        self.assertTrue(result)
        self.assertEqual(self.distributor.task_status['task-1'], TaskStatus.CANCELED)
        
        # GPU'nun serbest bırakıldığını doğrula
        self.mock_gpu_manager.release_gpu.assert_called_once_with(0, 'task-1')
        
        # Görev-GPU eşleştirmesinin kaldırıldığını doğrula
        self.assertNotIn('task-1', self.distributor.task_gpu_mapping)
        
    def test_cancel_task_completed(self):
        """Tamamlanmış bir görevi iptal etmeyi test et."""
        # Görevi tamamlanmış olarak işaretle
        self.distributor.task_status['task-1'] = TaskStatus.COMPLETED
        
        # Görevi iptal et
        result = self.distributor.cancel_task('task-1')
        
        # Sonuçları doğrula
        self.assertFalse(result)
        self.assertEqual(self.distributor.task_status['task-1'], TaskStatus.COMPLETED)
        
    def test_cancel_task_not_found(self):
        """Var olmayan bir görevi iptal etmeyi test et."""
        # Görevi iptal et
        result = self.distributor.cancel_task('non-existent-task')
        
        # Sonuçları doğrula
        self.assertFalse(result)
        
    def test_get_task_status(self):
        """get_task_status metodunu test et."""
        # Görev durumunu ayarla
        self.distributor.task_status['task-1'] = TaskStatus.RUNNING
        self.distributor.task_gpu_mapping['task-1'] = 0
        self.distributor.task_results['task-1'] = {'status': 'success', 'execution_time': 0.1}
        
        # Görev durumunu al
        status = self.distributor.get_task_status('task-1')
        
        # Sonuçları doğrula
        self.assertEqual(status['id'], 'task-1')
        self.assertEqual(status['status'], 'running')
        self.assertEqual(status['gpu_id'], 0)
        self.assertEqual(status['result']['status'], 'success')
        
    def test_get_task_status_not_found(self):
        """Var olmayan bir görevin durumunu almayı test et."""
        # Görev durumunu al
        status = self.distributor.get_task_status('non-existent-task')
        
        # Sonuçları doğrula
        self.assertIsNone(status)
        
    def test_get_all_task_statuses(self):
        """get_all_task_statuses metodunu test et."""
        # Görev durumlarını ayarla
        self.distributor.task_status['task-1'] = TaskStatus.RUNNING
        self.distributor.task_status['task-2'] = TaskStatus.COMPLETED
        
        # get_task_status metodunu mock'la
        self.distributor.get_task_status = MagicMock()
        self.distributor.get_task_status.side_effect = lambda task_id: {'id': task_id, 'status': 'running' if task_id == 'task-1' else 'completed'}
        
        # Tüm görev durumlarını al
        statuses = self.distributor.get_all_task_statuses()
        
        # Sonuçları doğrula
        self.assertEqual(len(statuses), 2)
        self.assertEqual(statuses['task-1']['status'], 'running')
        self.assertEqual(statuses['task-2']['status'], 'completed')
        
        # get_task_status'un çağrıldığını doğrula
        self.assertEqual(self.distributor.get_task_status.call_count, 2)
        
    def test_get_queue_status(self):
        """get_queue_status metodunu test et."""
        # Kuyruk ve çalışan görevleri ayarla
        self.distributor.task_queue.put(PrioritizedTask(0, time.time(), {'id': 'task-1'}))
        self.distributor.task_queue.put(PrioritizedTask(0, time.time(), {'id': 'task-2'}))
        self.distributor.task_gpu_mapping = {'task-3': 0, 'task-4': 0, 'task-5': 1}
        
        # Kuyruk durumunu al
        status = self.distributor.get_queue_status()
        
        # Sonuçları doğrula
        self.assertEqual(status['queue_size'], 2)
        self.assertEqual(status['running_tasks'], 3)
        self.assertEqual(status['gpu_utilization'][0], 2)
        self.assertEqual(status['gpu_utilization'][1], 1)
        
    def test_process_queue(self):
        """_process_queue metodunu test et."""
        # _execute_task_on_gpu metodunu mock'la
        self.distributor._execute_task_on_gpu = MagicMock()
        
        # Kuyruğa görevler ekle
        self.distributor.task_queue.put(PrioritizedTask(0, time.time(), self.tasks[0]))
        self.distributor.task_queue.put(PrioritizedTask(0, time.time(), self.tasks[1]))
        self.distributor.task_status[self.tasks[0]['id']] = TaskStatus.QUEUED
        self.distributor.task_status[self.tasks[1]['id']] = TaskStatus.QUEUED
        
        # Kuyruğu işle
        self.distributor._process_queue()
        
        # Sonuçları doğrula
        self.assertEqual(self.distributor.task_queue.qsize(), 0)
        self.assertEqual(self.distributor.task_status[self.tasks[0]['id']], TaskStatus.RUNNING)
        self.assertEqual(self.distributor.task_status[self.tasks[1]['id']], TaskStatus.RUNNING)
        
        # GPU Havuzu Yöneticisi'nin çağrıldığını doğrula
        self.assertEqual(self.mock_gpu_manager.reserve_gpu.call_count, 2)
        
        # _execute_task_on_gpu'nun çağrıldığını doğrula
        self.assertEqual(self.distributor._execute_task_on_gpu.call_count, 2)


if __name__ == '__main__':
    unittest.main()
