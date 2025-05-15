#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
GPU Seçim Stratejisi Birim Testleri

Bu modül, GPU Seçim Stratejisi için birim testleri içerir.
"""

import unittest
import sys
import os
import random
from unittest.mock import patch

# Modül yolunu ekle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Test edilecek modülü içe aktar
from gpu_selection_strategy import (
    GPUSelectionStrategy, RoundRobinStrategy, LeastLoadedStrategy,
    MemoryOptimizedStrategy, TaskSpecificStrategy, RandomStrategy,
    StrategySelector
)

class TestGPUSelectionStrategy(unittest.TestCase):
    """GPU Seçim Stratejisi için birim testleri."""
    
    def setUp(self):
        """Her test öncesinde çalışacak kurulum."""
        # Örnek GPU bilgileri
        self.gpu_info = {
            0: type('GPUInfo', (), {
                'id': 0,
                'name': 'NVIDIA A100',
                'utilization': 30,
                'memory_total': 40 * 1024 * 1024 * 1024,  # 40 GB
                'memory_used': 10 * 1024 * 1024 * 1024,   # 10 GB
                'memory_free': 30 * 1024 * 1024 * 1024    # 30 GB
            }),
            1: type('GPUInfo', (), {
                'id': 1,
                'name': 'NVIDIA A100',
                'utilization': 70,
                'memory_total': 40 * 1024 * 1024 * 1024,  # 40 GB
                'memory_used': 25 * 1024 * 1024 * 1024,   # 25 GB
                'memory_free': 15 * 1024 * 1024 * 1024    # 15 GB
            }),
            2: type('GPUInfo', (), {
                'id': 2,
                'name': 'NVIDIA A100',
                'utilization': 50,
                'memory_total': 40 * 1024 * 1024 * 1024,  # 40 GB
                'memory_used': 20 * 1024 * 1024 * 1024,   # 20 GB
                'memory_free': 20 * 1024 * 1024 * 1024    # 20 GB
            })
        }
        
        # Kullanılabilir GPU'lar
        self.available_gpus = [0, 1, 2]
        
        # Örnek görevler
        self.tasks = [
            {'id': 'task-1', 'type': 'image_segmentation', 'estimated_memory': 8 * 1024 * 1024 * 1024},  # 8 GB
            {'id': 'task-2', 'type': 'text_generation', 'estimated_memory': 5 * 1024 * 1024 * 1024},     # 5 GB
            {'id': 'task-3', 'type': 'unknown', 'estimated_memory': 2 * 1024 * 1024 * 1024}              # 2 GB
        ]
        
    def test_abstract_methods(self):
        """Soyut metodların uygulanması gerektiğini test et."""
        # GPUSelectionStrategy soyut bir sınıf olduğundan, doğrudan örneklenemez
        with self.assertRaises(TypeError):
            strategy = GPUSelectionStrategy()
            
    def test_round_robin_strategy(self):
        """RoundRobinStrategy'yi test et."""
        strategy = RoundRobinStrategy()
        
        # İlk görev için GPU seç
        selected_gpu = strategy.select_gpu(self.tasks[0], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 0)
        
        # İkinci görev için GPU seç
        selected_gpu = strategy.select_gpu(self.tasks[1], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 1)
        
        # Üçüncü görev için GPU seç
        selected_gpu = strategy.select_gpu(self.tasks[2], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 2)
        
        # Dördüncü görev için GPU seç (döngü başa dönmeli)
        selected_gpu = strategy.select_gpu(self.tasks[0], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 0)
        
        # Kullanılabilir GPU yoksa None döndürmeli
        selected_gpu = strategy.select_gpu(self.tasks[0], [], self.gpu_info)
        self.assertIsNone(selected_gpu)
        
    def test_least_loaded_strategy(self):
        """LeastLoadedStrategy'yi test et."""
        strategy = LeastLoadedStrategy()
        
        # En az yüklü GPU'yu seç (GPU 0, %30 kullanım)
        selected_gpu = strategy.select_gpu(self.tasks[0], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 0)
        
        # GPU 0'ın kullanım oranını artır
        self.gpu_info[0].utilization = 80
        
        # Şimdi en az yüklü GPU 2 olmalı (%50 kullanım)
        selected_gpu = strategy.select_gpu(self.tasks[1], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 2)
        
        # Kullanılabilir GPU yoksa None döndürmeli
        selected_gpu = strategy.select_gpu(self.tasks[0], [], self.gpu_info)
        self.assertIsNone(selected_gpu)
        
    def test_memory_optimized_strategy(self):
        """MemoryOptimizedStrategy'yi test et."""
        strategy = MemoryOptimizedStrategy()
        
        # 8 GB bellek gerektiren görev için en uygun GPU'yu seç
        # Tüm GPU'lar yeterli belleğe sahip, en az bellek kullanımına sahip GPU 0 seçilmeli
        selected_gpu = strategy.select_gpu(self.tasks[0], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 0)
        
        # GPU 0'ın bellek kullanımını artır
        self.gpu_info[0].memory_used = 35 * 1024 * 1024 * 1024  # 35 GB
        self.gpu_info[0].memory_free = 5 * 1024 * 1024 * 1024   # 5 GB
        
        # 8 GB bellek gerektiren görev için artık GPU 0 yetersiz, GPU 2 seçilmeli
        selected_gpu = strategy.select_gpu(self.tasks[0], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 2)
        
        # Tüm GPU'ların bellek kullanımını artır, hiçbiri 8 GB için yeterli olmasın
        self.gpu_info[1].memory_used = 35 * 1024 * 1024 * 1024  # 35 GB
        self.gpu_info[1].memory_free = 5 * 1024 * 1024 * 1024   # 5 GB
        self.gpu_info[2].memory_used = 35 * 1024 * 1024 * 1024  # 35 GB
        self.gpu_info[2].memory_free = 5 * 1024 * 1024 * 1024   # 5 GB
        
        # Bu durumda en fazla boş belleğe sahip GPU'yu seçmeli (hepsi eşit)
        selected_gpu = strategy.select_gpu(self.tasks[0], self.available_gpus, self.gpu_info)
        self.assertIn(selected_gpu, self.available_gpus)
        
        # Bellek gereksinimi belirtilmemiş görev için en fazla boş belleğe sahip GPU'yu seçmeli
        task_without_memory = {'id': 'task-4', 'type': 'unknown'}
        selected_gpu = strategy.select_gpu(task_without_memory, self.available_gpus, self.gpu_info)
        self.assertIn(selected_gpu, self.available_gpus)
        
        # Kullanılabilir GPU yoksa None döndürmeli
        selected_gpu = strategy.select_gpu(self.tasks[0], [], self.gpu_info)
        self.assertIsNone(selected_gpu)
        
    def test_task_specific_strategy(self):
        """TaskSpecificStrategy'yi test et."""
        # Görev tipi -> GPU ID eşleştirmeleri
        task_mappings = {
            'image_segmentation': 0,
            'text_generation': 1
        }
        
        strategy = TaskSpecificStrategy(task_mappings)
        
        # 'image_segmentation' tipi görev için GPU 0 seçilmeli
        selected_gpu = strategy.select_gpu(self.tasks[0], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 0)
        
        # 'text_generation' tipi görev için GPU 1 seçilmeli
        selected_gpu = strategy.select_gpu(self.tasks[1], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 1)
        
        # Bilinmeyen görev tipi için yedek strateji (LeastLoadedStrategy) kullanılmalı
        # En az yüklü GPU 0 (%30 kullanım)
        selected_gpu = strategy.select_gpu(self.tasks[2], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 0)
        
        # GPU 0'ı kullanılamaz yap
        available_gpus = [1, 2]
        
        # 'image_segmentation' tipi görev için GPU 0 tercih edilir ama kullanılamaz
        # Bu durumda yedek strateji kullanılmalı, en az yüklü GPU 2 (%50 kullanım)
        selected_gpu = strategy.select_gpu(self.tasks[0], available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 2)
        
        # Kullanılabilir GPU yoksa None döndürmeli
        selected_gpu = strategy.select_gpu(self.tasks[0], [], self.gpu_info)
        self.assertIsNone(selected_gpu)
        
    @patch('random.choice')
    def test_random_strategy(self, mock_choice):
        """RandomStrategy'yi test et."""
        strategy = RandomStrategy()
        
        # random.choice'un davranışını kontrol et
        mock_choice.side_effect = lambda x: x[0]
        
        # Rastgele bir GPU seç (mock ile ilk GPU'yu seçecek)
        selected_gpu = strategy.select_gpu(self.tasks[0], self.available_gpus, self.gpu_info)
        self.assertEqual(selected_gpu, 0)
        
        # random.choice'un çağrıldığını doğrula
        mock_choice.assert_called_with(self.available_gpus)
        
        # Kullanılabilir GPU yoksa None döndürmeli
        selected_gpu = strategy.select_gpu(self.tasks[0], [], self.gpu_info)
        self.assertIsNone(selected_gpu)
        
    def test_strategy_selector(self):
        """StrategySelector'ü test et."""
        # Yapılandırma
        config = {
            'default_strategy': 'least_loaded',
            'task_specific_mappings': {
                'image_segmentation': 'gpu_0',
                'text_generation': 'gpu_1'
            }
        }
        
        # StrategySelector örneği oluştur
        selector = StrategySelector(config)
        
        # Varsayılan stratejiyi al
        default_strategy = selector.get_default_strategy()
        self.assertIsInstance(default_strategy, LeastLoadedStrategy)
        
        # Belirli stratejileri al
        round_robin_strategy = selector.get_strategy('round_robin')
        self.assertIsInstance(round_robin_strategy, RoundRobinStrategy)
        
        least_loaded_strategy = selector.get_strategy('least_loaded')
        self.assertIsInstance(least_loaded_strategy, LeastLoadedStrategy)
        
        memory_optimized_strategy = selector.get_strategy('memory_optimized')
        self.assertIsInstance(memory_optimized_strategy, MemoryOptimizedStrategy)
        
        task_specific_strategy = selector.get_strategy('task_specific')
        self.assertIsInstance(task_specific_strategy, TaskSpecificStrategy)
        
        random_strategy = selector.get_strategy('random')
        self.assertIsInstance(random_strategy, RandomStrategy)
        
        # Geçersiz strateji adı için varsayılan strateji döndürmeli
        invalid_strategy = selector.get_strategy('invalid')
        self.assertIsInstance(invalid_strategy, LeastLoadedStrategy)
        
        # Varsayılan stratejiyi değiştir
        result = selector.set_default_strategy('round_robin')
        self.assertTrue(result)
        
        # Yeni varsayılan stratejiyi doğrula
        new_default_strategy = selector.get_default_strategy()
        self.assertIsInstance(new_default_strategy, RoundRobinStrategy)
        
        # Geçersiz strateji adı ile varsayılan stratejiyi değiştirmeyi dene
        result = selector.set_default_strategy('invalid')
        self.assertFalse(result)
        
        # Varsayılan stratejinin değişmediğini doğrula
        current_default_strategy = selector.get_default_strategy()
        self.assertIsInstance(current_default_strategy, RoundRobinStrategy)


if __name__ == '__main__':
    unittest.main()
