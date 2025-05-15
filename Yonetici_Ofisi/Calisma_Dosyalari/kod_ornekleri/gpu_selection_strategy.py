#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
GPU Seçim Stratejisi

Bu modül, ALT_LAS sisteminde iş yüklerinin hangi GPU'ya yönlendirileceğini belirleyen
strateji sınıflarını içerir. Çoklu GPU desteği için temel bileşendir.

Kullanım:
    from gpu_selection_strategy import (
        GPUSelectionStrategy, RoundRobinStrategy, 
        LeastLoadedStrategy, TaskSpecificStrategy,
        StrategySelector
    )
    
    # Strateji seçiciyi yapılandırma ile başlat
    config = {
        'default_strategy': 'least_loaded',
        'task_specific_mappings': {
            'image_segmentation': 'gpu_0',
            'text_generation': 'gpu_1'
        }
    }
    
    # Strateji seçiciyi oluştur
    selector = StrategySelector(config)
    
    # Varsayılan stratejiyi al
    strategy = selector.get_default_strategy()
    
    # Belirli bir stratejiyi al
    strategy = selector.get_strategy('round_robin')
    
    # GPU seç
    task = {'id': 'task-123', 'type': 'image_segmentation', 'batch_size': 4}
    available_gpus = [0, 1, 2]
    gpu_info = {...}  # GPU bilgileri
    
    selected_gpu = strategy.select_gpu(task, available_gpus, gpu_info)
"""

import logging
import random
import time
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Tuple

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GPUSelectionStrategy(ABC):
    """
    GPU Seçim Stratejisi soyut temel sınıfı.
    
    Bu sınıf, iş yüklerinin hangi GPU'ya yönlendirileceğini belirleyen
    stratejilerin temel arayüzünü tanımlar.
    """
    
    @abstractmethod
    def select_gpu(self, task: Dict[str, Any], available_gpus: List[int], gpu_info: Dict[int, Any]) -> Optional[int]:
        """
        Belirli bir görev için uygun GPU'yu seçer.
        
        Args:
            task: Görev bilgilerini içeren sözlük
            available_gpus: Kullanılabilir GPU ID'lerinin listesi
            gpu_info: GPU bilgilerini içeren sözlük (GPU ID -> GPU bilgisi)
            
        Returns:
            Seçilen GPU ID'si veya uygun GPU bulunamazsa None
        """
        pass


class RoundRobinStrategy(GPUSelectionStrategy):
    """
    Round-Robin GPU Seçim Stratejisi.
    
    Bu strateji, görevleri sırayla her GPU'ya dağıtır.
    """
    
    def __init__(self):
        """Round-Robin stratejisini başlatır."""
        self.current_index = 0
        
    def select_gpu(self, task: Dict[str, Any], available_gpus: List[int], gpu_info: Dict[int, Any]) -> Optional[int]:
        """
        Round-robin stratejisi ile GPU seçer.
        
        Args:
            task: Görev bilgilerini içeren sözlük
            available_gpus: Kullanılabilir GPU ID'lerinin listesi
            gpu_info: GPU bilgilerini içeren sözlük (GPU ID -> GPU bilgisi)
            
        Returns:
            Seçilen GPU ID'si veya uygun GPU bulunamazsa None
        """
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
            
        # Sıradaki GPU'yu seç
        selected_gpu = available_gpus[self.current_index % len(available_gpus)]
        
        # İndeksi güncelle
        self.current_index += 1
        
        logger.info(f"Round-robin stratejisi ile GPU {selected_gpu} seçildi (görev: {task.get('id', 'unknown')})")
        return selected_gpu


class LeastLoadedStrategy(GPUSelectionStrategy):
    """
    En Az Yüklü GPU Seçim Stratejisi.
    
    Bu strateji, en düşük kullanım oranına sahip GPU'yu seçer.
    """
    
    def select_gpu(self, task: Dict[str, Any], available_gpus: List[int], gpu_info: Dict[int, Any]) -> Optional[int]:
        """
        En az yüklü GPU'yu seçer.
        
        Args:
            task: Görev bilgilerini içeren sözlük
            available_gpus: Kullanılabilir GPU ID'lerinin listesi
            gpu_info: GPU bilgilerini içeren sözlük (GPU ID -> GPU bilgisi)
            
        Returns:
            Seçilen GPU ID'si veya uygun GPU bulunamazsa None
        """
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
            
        # Kullanım oranlarını hesapla
        # Hem GPU kullanımını hem de bellek kullanımını dikkate al
        load_scores = {}
        for gpu_id in available_gpus:
            info = gpu_info[gpu_id]
            
            # GPU kullanım oranı (0-100)
            gpu_util = info.utilization
            
            # Bellek kullanım oranı (0-1)
            memory_util = info.memory_used / info.memory_total
            
            # Ağırlıklı skor (GPU kullanımı ve bellek kullanımının kombinasyonu)
            # GPU kullanımı ve bellek kullanımına eşit ağırlık ver
            load_score = 0.5 * (gpu_util / 100) + 0.5 * memory_util
            
            load_scores[gpu_id] = load_score
            
        # En düşük yük skoruna sahip GPU'yu seç
        selected_gpu = min(load_scores, key=load_scores.get)
        
        logger.info(f"En az yüklü stratejisi ile GPU {selected_gpu} seçildi "
                   f"(yük: {load_scores[selected_gpu]:.2f}, görev: {task.get('id', 'unknown')})")
        return selected_gpu


class MemoryOptimizedStrategy(GPUSelectionStrategy):
    """
    Bellek Optimizasyonlu GPU Seçim Stratejisi.
    
    Bu strateji, görevin bellek gereksinimlerine göre en uygun GPU'yu seçer.
    """
    
    def select_gpu(self, task: Dict[str, Any], available_gpus: List[int], gpu_info: Dict[int, Any]) -> Optional[int]:
        """
        Bellek optimizasyonlu strateji ile GPU seçer.
        
        Args:
            task: Görev bilgilerini içeren sözlük
            available_gpus: Kullanılabilir GPU ID'lerinin listesi
            gpu_info: GPU bilgilerini içeren sözlük (GPU ID -> GPU bilgisi)
            
        Returns:
            Seçilen GPU ID'si veya uygun GPU bulunamazsa None
        """
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
            
        # Görevin tahmini bellek gereksinimi
        estimated_memory = task.get('estimated_memory', 0)
        
        if estimated_memory > 0:
            # Yeterli boş belleğe sahip GPU'ları filtrele
            suitable_gpus = []
            for gpu_id in available_gpus:
                info = gpu_info[gpu_id]
                if info.memory_free >= estimated_memory:
                    suitable_gpus.append(gpu_id)
                    
            if suitable_gpus:
                # En az bellek kullanımına sahip GPU'yu seç
                selected_gpu = min(suitable_gpus, key=lambda gpu_id: gpu_info[gpu_id].memory_used)
                
                logger.info(f"Bellek optimizasyonlu strateji ile GPU {selected_gpu} seçildi "
                           f"(boş bellek: {gpu_info[selected_gpu].memory_free / (1024**2):.2f} MB, "
                           f"görev: {task.get('id', 'unknown')})")
                return selected_gpu
                
        # Bellek gereksinimi belirtilmemişse veya uygun GPU bulunamazsa
        # En fazla boş belleğe sahip GPU'yu seç
        selected_gpu = max(available_gpus, key=lambda gpu_id: gpu_info[gpu_id].memory_free)
        
        logger.info(f"Bellek optimizasyonlu strateji ile GPU {selected_gpu} seçildi "
                   f"(boş bellek: {gpu_info[selected_gpu].memory_free / (1024**2):.2f} MB, "
                   f"görev: {task.get('id', 'unknown')})")
        return selected_gpu


class TaskSpecificStrategy(GPUSelectionStrategy):
    """
    Görev Tipine Özgü GPU Seçim Stratejisi.
    
    Bu strateji, görev tipine göre önceden tanımlanmış GPU'ları seçer.
    """
    
    def __init__(self, task_mappings: Dict[str, int]):
        """
        Görev tipine özgü stratejiyi başlatır.
        
        Args:
            task_mappings: Görev tipi -> GPU ID eşleştirmelerini içeren sözlük
        """
        self.task_mappings = task_mappings
        
    def select_gpu(self, task: Dict[str, Any], available_gpus: List[int], gpu_info: Dict[int, Any]) -> Optional[int]:
        """
        Görev tipine özgü strateji ile GPU seçer.
        
        Args:
            task: Görev bilgilerini içeren sözlük
            available_gpus: Kullanılabilir GPU ID'lerinin listesi
            gpu_info: GPU bilgilerini içeren sözlük (GPU ID -> GPU bilgisi)
            
        Returns:
            Seçilen GPU ID'si veya uygun GPU bulunamazsa None
        """
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
            
        # Görev tipini al
        task_type = task.get('type', 'default')
        
        # Görev tipi için belirli bir GPU tanımlanmışsa ve bu GPU kullanılabilirse
        if task_type in self.task_mappings:
            preferred_gpu = self.task_mappings[task_type]
            if preferred_gpu in available_gpus:
                logger.info(f"Görev tipine özgü strateji ile GPU {preferred_gpu} seçildi "
                           f"(görev tipi: {task_type}, görev: {task.get('id', 'unknown')})")
                return preferred_gpu
                
        # Tanımlı bir eşleştirme yoksa veya tercih edilen GPU kullanılamıyorsa
        # Yedek strateji olarak en az yüklü stratejiyi kullan
        fallback_strategy = LeastLoadedStrategy()
        selected_gpu = fallback_strategy.select_gpu(task, available_gpus, gpu_info)
        
        logger.info(f"Görev tipine özgü strateji için yedek strateji ile GPU {selected_gpu} seçildi "
                   f"(görev tipi: {task_type}, görev: {task.get('id', 'unknown')})")
        return selected_gpu


class RandomStrategy(GPUSelectionStrategy):
    """
    Rastgele GPU Seçim Stratejisi.
    
    Bu strateji, kullanılabilir GPU'lar arasından rastgele seçim yapar.
    """
    
    def select_gpu(self, task: Dict[str, Any], available_gpus: List[int], gpu_info: Dict[int, Any]) -> Optional[int]:
        """
        Rastgele strateji ile GPU seçer.
        
        Args:
            task: Görev bilgilerini içeren sözlük
            available_gpus: Kullanılabilir GPU ID'lerinin listesi
            gpu_info: GPU bilgilerini içeren sözlük (GPU ID -> GPU bilgisi)
            
        Returns:
            Seçilen GPU ID'si veya uygun GPU bulunamazsa None
        """
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
            
        # Rastgele bir GPU seç
        selected_gpu = random.choice(available_gpus)
        
        logger.info(f"Rastgele strateji ile GPU {selected_gpu} seçildi (görev: {task.get('id', 'unknown')})")
        return selected_gpu


class StrategySelector:
    """
    GPU Seçim Stratejisi Seçici.
    
    Bu sınıf, farklı GPU seçim stratejilerini yönetir ve uygun stratejiyi seçer.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Strateji seçiciyi başlatır.
        
        Args:
            config: Yapılandırma parametreleri içeren sözlük
        """
        self.config = config
        self.default_strategy_name = config.get('default_strategy', 'least_loaded')
        
        # Görev tipi -> GPU ID eşleştirmeleri
        task_mappings = {}
        task_specific_config = config.get('task_specific_mappings', {})
        for task_type, gpu_id in task_specific_config.items():
            if isinstance(gpu_id, str) and gpu_id.startswith('gpu_'):
                # 'gpu_0' -> 0 dönüşümü
                gpu_id = int(gpu_id[4:])
            task_mappings[task_type] = gpu_id
            
        # Strateji örneklerini oluştur
        self.strategies = {
            'round_robin': RoundRobinStrategy(),
            'least_loaded': LeastLoadedStrategy(),
            'memory_optimized': MemoryOptimizedStrategy(),
            'task_specific': TaskSpecificStrategy(task_mappings),
            'random': RandomStrategy()
        }
        
        logger.info(f"Strateji seçici başlatıldı. Varsayılan strateji: {self.default_strategy_name}")
        
    def get_strategy(self, strategy_name: str) -> GPUSelectionStrategy:
        """
        Belirli bir stratejiyi döndürür.
        
        Args:
            strategy_name: Strateji adı
            
        Returns:
            Strateji nesnesi
            
        Raises:
            ValueError: Geçersiz strateji adı
        """
        if strategy_name not in self.strategies:
            logger.warning(f"Geçersiz strateji adı: {strategy_name}. Varsayılan strateji kullanılıyor: {self.default_strategy_name}")
            return self.get_default_strategy()
            
        return self.strategies[strategy_name]
        
    def get_default_strategy(self) -> GPUSelectionStrategy:
        """
        Varsayılan stratejiyi döndürür.
        
        Returns:
            Varsayılan strateji nesnesi
        """
        return self.strategies[self.default_strategy_name]
        
    def set_default_strategy(self, strategy_name: str) -> bool:
        """
        Varsayılan stratejiyi ayarlar.
        
        Args:
            strategy_name: Strateji adı
            
        Returns:
            İşlemin başarılı olup olmadığı
        """
        if strategy_name not in self.strategies:
            logger.warning(f"Geçersiz strateji adı: {strategy_name}. Varsayılan strateji değiştirilmedi.")
            return False
            
        self.default_strategy_name = strategy_name
        logger.info(f"Varsayılan strateji değiştirildi: {strategy_name}")
        return True


if __name__ == "__main__":
    # Örnek kullanım
    config = {
        'default_strategy': 'least_loaded',
        'task_specific_mappings': {
            'image_segmentation': 'gpu_0',
            'text_generation': 'gpu_1'
        }
    }
    
    # Strateji seçiciyi oluştur
    selector = StrategySelector(config)
    
    # Örnek GPU bilgileri
    gpu_info = {
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
        })
    }
    
    # Kullanılabilir GPU'lar
    available_gpus = [0, 1]
    
    # Farklı stratejileri test et
    strategies = [
        ('round_robin', selector.get_strategy('round_robin')),
        ('least_loaded', selector.get_strategy('least_loaded')),
        ('memory_optimized', selector.get_strategy('memory_optimized')),
        ('task_specific (image_segmentation)', selector.get_strategy('task_specific')),
        ('task_specific (text_generation)', selector.get_strategy('task_specific')),
        ('random', selector.get_strategy('random')),
        ('default', selector.get_default_strategy())
    ]
    
    # Örnek görevler
    tasks = [
        {'id': 'task-1', 'type': 'image_segmentation', 'estimated_memory': 8 * 1024 * 1024 * 1024},  # 8 GB
        {'id': 'task-2', 'type': 'text_generation', 'estimated_memory': 5 * 1024 * 1024 * 1024},     # 5 GB
        {'id': 'task-3', 'type': 'unknown', 'estimated_memory': 2 * 1024 * 1024 * 1024}              # 2 GB
    ]
    
    # Her strateji ve görev kombinasyonunu test et
    for task in tasks:
        print(f"\nGörev: {task['id']} (Tip: {task['type']}, Tahmini Bellek: {task['estimated_memory'] / (1024**3):.1f} GB)")
        
        for name, strategy in strategies:
            selected_gpu = strategy.select_gpu(task, available_gpus, gpu_info)
            print(f"  {name}: GPU {selected_gpu}")
            
    # Varsayılan stratejiyi değiştir
    print("\nVarsayılan stratejiyi 'round_robin' olarak değiştir")
    selector.set_default_strategy('round_robin')
    
    # Yeni varsayılan stratejiyi test et
    default_strategy = selector.get_default_strategy()
    task = {'id': 'task-4', 'type': 'default'}
    selected_gpu = default_strategy.select_gpu(task, available_gpus, gpu_info)
    print(f"Yeni varsayılan strateji (round_robin): GPU {selected_gpu}")
