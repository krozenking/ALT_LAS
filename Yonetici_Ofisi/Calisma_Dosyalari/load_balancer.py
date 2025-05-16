"""
Yük Dengeleyici (Load Balancer) Modülü

Bu modül, GPU'lar arasında yük dengelemesi yapan bileşeni içerir.
Yük Dengeleyici, GPU Durum İzleyici'den GPU durumlarını alır ve
istekleri en uygun GPU'ya yönlendirir.

Kullanım:
    from load_balancer import LoadBalancer
    
    # Yapılandırma ile başlat
    config = {
        'strategy': 'hybrid',  # Yük dengeleme stratejisi (hybrid, dynamic, priority, resource)
        'weights': {
            'usage': 0.4,
            'priority': 0.3,
            'performance': 0.2,
            'health': 0.1
        }
    }
    
    # Yük Dengeleyici'yi oluştur
    load_balancer = LoadBalancer(config, gpu_state_monitor)
    
    # İstek için en uygun GPU'yu seç
    gpu_id = await load_balancer.select_gpu(request)
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("load_balancer")

class BalancingStrategy(str, Enum):
    """Yük dengeleme stratejileri."""
    DYNAMIC = "dynamic"  # Dinamik yük dengeleme
    PRIORITY = "priority"  # Öncelik bazlı yük dengeleme
    RESOURCE = "resource"  # Kaynak bazlı yük dengeleme
    HYBRID = "hybrid"  # Hibrit yük dengeleme

class LoadBalancer:
    """Yük dengeleyici sınıf."""
    
    def __init__(self, config: Dict[str, Any], gpu_state_monitor):
        """
        Yük Dengeleyici'yi başlat.
        
        Args:
            config: Yapılandırma parametreleri
            gpu_state_monitor: GPU Durum İzleyici
        """
        self.config = config
        self.gpu_state_monitor = gpu_state_monitor
        
        # Yük dengeleme stratejisi
        self.strategy = BalancingStrategy(config.get('strategy', 'hybrid'))
        
        # Ağırlıklar
        self.weights = config.get('weights', {
            'usage': 0.4,
            'priority': 0.3,
            'performance': 0.2,
            'health': 0.1
        })
        
        # İstatistikler
        self.stats = {
            'total_requests': 0,
            'successful_allocations': 0,
            'failed_allocations': 0,
            'gpu_allocations': {}
        }
        
        # GPU Durum İzleyici'ye durum değişikliği callback'i kaydet
        self.gpu_state_monitor.register_status_change_callback(self._handle_gpu_status_change)
        
    async def select_gpu(self, request) -> Optional[str]:
        """
        İstek için en uygun GPU'yu seç.
        
        Args:
            request: İstek
            
        Returns:
            Seçilen GPU ID'si, uygun GPU bulunamazsa None
        """
        # İstatistikleri güncelle
        self.stats['total_requests'] += 1
        
        # Seçilen stratejiyi uygula
        if self.strategy == BalancingStrategy.DYNAMIC:
            gpu_id = await self._dynamic_strategy(request)
        elif self.strategy == BalancingStrategy.PRIORITY:
            gpu_id = await self._priority_strategy(request)
        elif self.strategy == BalancingStrategy.RESOURCE:
            gpu_id = await self._resource_strategy(request)
        else:  # HYBRID
            gpu_id = await self._hybrid_strategy(request)
            
        # İstatistikleri güncelle
        if gpu_id:
            self.stats['successful_allocations'] += 1
            self.stats['gpu_allocations'][gpu_id] = self.stats['gpu_allocations'].get(gpu_id, 0) + 1
            logger.info(f"İstek {request.request_id} için GPU {gpu_id} seçildi")
        else:
            self.stats['failed_allocations'] += 1
            logger.warning(f"İstek {request.request_id} için uygun GPU bulunamadı")
            
        return gpu_id
        
    async def _dynamic_strategy(self, request) -> Optional[str]:
        """
        Dinamik yük dengeleme stratejisi.
        
        Args:
            request: İstek
            
        Returns:
            Seçilen GPU ID'si, uygun GPU bulunamazsa None
        """
        # Tüm GPU durumlarını al
        gpu_states = await self.gpu_state_monitor.get_gpu_states()
        
        # Uygun GPU'ları filtrele
        suitable_gpus = {}
        for gpu_id, state in gpu_states.items():
            # GPU kullanılabilir ve sağlıklı mı?
            if not state.is_available() or not state.is_healthy():
                continue
                
            # GPU'da yeterli bellek var mı?
            required_memory = request.get_required_memory()
            if not state.has_sufficient_memory(required_memory):
                continue
                
            suitable_gpus[gpu_id] = state
            
        if not suitable_gpus:
            return None
            
        # En az yüklü GPU'yu seç
        min_load = float('inf')
        selected_gpu_id = None
        
        for gpu_id, state in suitable_gpus.items():
            # Yük hesapla (bellek kullanımı ve işlem gücü kullanımı)
            memory_load = state.memory_used / state.memory_total if state.memory_total > 0 else 1
            compute_load = state.utilization
            load = 0.7 * memory_load + 0.3 * compute_load
            
            if load < min_load:
                min_load = load
                selected_gpu_id = gpu_id
                
        return selected_gpu_id
        
    async def _priority_strategy(self, request) -> Optional[str]:
        """
        Öncelik bazlı yük dengeleme stratejisi.
        
        Args:
            request: İstek
            
        Returns:
            Seçilen GPU ID'si, uygun GPU bulunamazsa None
        """
        # Tüm GPU durumlarını al
        gpu_states = await self.gpu_state_monitor.get_gpu_states()
        
        # Uygun GPU'ları filtrele
        suitable_gpus = {}
        for gpu_id, state in gpu_states.items():
            # GPU kullanılabilir ve sağlıklı mı?
            if not state.is_available() or not state.is_healthy():
                continue
                
            # GPU'da yeterli bellek var mı?
            required_memory = request.get_required_memory()
            if not state.has_sufficient_memory(required_memory):
                continue
                
            suitable_gpus[gpu_id] = state
            
        if not suitable_gpus:
            return None
            
        # İstek önceliğine göre GPU seç
        priority = request.priority
        
        # Yüksek öncelikli istekler için en iyi performanslı GPU'yu seç
        if priority >= 4:  # Yüksek öncelik (4-5)
            max_performance = -1
            selected_gpu_id = None
            
            for gpu_id, state in suitable_gpus.items():
                if state.performance_index > max_performance:
                    max_performance = state.performance_index
                    selected_gpu_id = gpu_id
                    
            return selected_gpu_id
            
        # Orta öncelikli istekler için dengeli bir GPU seç
        elif priority >= 2:  # Orta öncelik (2-3)
            # Bellek ve işlem gücü kullanımı dengeli olan GPU'yu seç
            min_imbalance = float('inf')
            selected_gpu_id = None
            
            for gpu_id, state in suitable_gpus.items():
                memory_load = state.memory_used / state.memory_total if state.memory_total > 0 else 1
                compute_load = state.utilization
                imbalance = abs(memory_load - compute_load)
                
                if imbalance < min_imbalance:
                    min_imbalance = imbalance
                    selected_gpu_id = gpu_id
                    
            return selected_gpu_id
            
        # Düşük öncelikli istekler için en az yüklü GPU'yu seç
        else:  # Düşük öncelik (1)
            min_load = float('inf')
            selected_gpu_id = None
            
            for gpu_id, state in suitable_gpus.items():
                memory_load = state.memory_used / state.memory_total if state.memory_total > 0 else 1
                compute_load = state.utilization
                load = 0.7 * memory_load + 0.3 * compute_load
                
                if load < min_load:
                    min_load = load
                    selected_gpu_id = gpu_id
                    
            return selected_gpu_id
        
    async def _resource_strategy(self, request) -> Optional[str]:
        """
        Kaynak bazlı yük dengeleme stratejisi.
        
        Args:
            request: İstek
            
        Returns:
            Seçilen GPU ID'si, uygun GPU bulunamazsa None
        """
        # Tüm GPU durumlarını al
        gpu_states = await self.gpu_state_monitor.get_gpu_states()
        
        # İstek kaynak gereksinimlerini al
        required_memory = request.get_required_memory()
        
        # Uygun GPU'ları filtrele
        suitable_gpus = {}
        for gpu_id, state in gpu_states.items():
            # GPU kullanılabilir ve sağlıklı mı?
            if not state.is_available() or not state.is_healthy():
                continue
                
            # GPU'da yeterli bellek var mı?
            if not state.has_sufficient_memory(required_memory):
                continue
                
            suitable_gpus[gpu_id] = state
            
        if not suitable_gpus:
            return None
            
        # En uygun GPU'yu seç (en az kaynak israfı)
        min_waste = float('inf')
        selected_gpu_id = None
        
        for gpu_id, state in suitable_gpus.items():
            # Bellek israfı (boş bellek - gerekli bellek)
            memory_waste = state.memory_free - required_memory
            
            if memory_waste < min_waste:
                min_waste = memory_waste
                selected_gpu_id = gpu_id
                
        return selected_gpu_id
        
    async def _hybrid_strategy(self, request) -> Optional[str]:
        """
        Hibrit yük dengeleme stratejisi.
        
        Args:
            request: İstek
            
        Returns:
            Seçilen GPU ID'si, uygun GPU bulunamazsa None
        """
        # Tüm GPU durumlarını al
        gpu_states = await self.gpu_state_monitor.get_gpu_states()
        
        # Uygun GPU'ları filtrele
        suitable_gpus = {}
        for gpu_id, state in gpu_states.items():
            # GPU kullanılabilir ve sağlıklı mı?
            if not state.is_available() or not state.is_healthy():
                continue
                
            # GPU'da yeterli bellek var mı?
            required_memory = request.get_required_memory()
            if not state.has_sufficient_memory(required_memory):
                continue
                
            suitable_gpus[gpu_id] = state
            
        if not suitable_gpus:
            return None
            
        # Her GPU için skor hesapla
        scores = {}
        for gpu_id, state in suitable_gpus.items():
            # GPU kullanım oranı (0-1 arası, düşük daha iyi)
            memory_usage_score = 1 - (state.memory_used / state.memory_total if state.memory_total > 0 else 1)
            compute_usage_score = 1 - state.utilization
            usage_score = 0.6 * memory_usage_score + 0.4 * compute_usage_score
            
            # İstek önceliği (1-5 arası, yüksek daha iyi)
            priority_score = request.priority / 5
            
            # Geçmiş performans (0-1 arası, yüksek daha iyi)
            performance_score = state.performance_index
            
            # GPU sağlık durumu (0-1 arası, yüksek daha iyi)
            health_score = 1.0 - (state.temperature / 100)  # Sıcaklık skoru
            
            # Ağırlıklandırma
            scores[gpu_id] = (
                self.weights.get('usage', 0.4) * usage_score +
                self.weights.get('priority', 0.3) * priority_score +
                self.weights.get('performance', 0.2) * performance_score +
                self.weights.get('health', 0.1) * health_score
            )
            
        # En yüksek skora sahip GPU'yu seç
        if not scores:
            return None
            
        return max(scores, key=scores.get)
        
    async def get_stats(self) -> Dict[str, Any]:
        """
        Yük dengeleyici istatistiklerini al.
        
        Returns:
            İstatistikler
        """
        return self.stats
        
    async def _handle_gpu_status_change(self, gpu_id: str, previous_status: Optional[str], new_status: Optional[str]):
        """
        GPU durum değişikliği işle.
        
        Args:
            gpu_id: GPU ID'si
            previous_status: Önceki durum
            new_status: Yeni durum
        """
        # Yeni GPU eklendi
        if previous_status is None and new_status is not None:
            logger.info(f"Yeni GPU eklendi: {gpu_id}, durum: {new_status}")
            
        # GPU silindi
        elif previous_status is not None and new_status is None:
            logger.info(f"GPU silindi: {gpu_id}, önceki durum: {previous_status}")
            
        # GPU durumu değişti
        elif previous_status != new_status:
            logger.info(f"GPU durumu değişti: {gpu_id}, {previous_status} -> {new_status}")
            
            # GPU kullanılamaz hale geldiyse, istatistikleri güncelle
            if new_status in ['error', 'maintenance']:
                if gpu_id in self.stats['gpu_allocations']:
                    logger.warning(f"GPU {gpu_id} kullanılamaz hale geldi, {self.stats['gpu_allocations'][gpu_id]} istek etkilenebilir")
