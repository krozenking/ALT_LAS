# gpu_selection_strategy.py
import random
import logging

# Logger oluştur
logger = logging.getLogger('gpu_selection_strategy')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

class SingleGPUStrategy:
    """Tek GPU seçim stratejisi."""
    
    def __init__(self, config):
        """Tek GPU Stratejisi'ni başlat."""
        self.config = config
    
    def select_gpu(self, available_gpus, task, gpu_pool_manager):
        """Tek GPU seçim stratejisi."""
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
        
        # İlk kullanılabilir GPU'yu seç
        return available_gpus[0]

class RoundRobinStrategy:
    """Round Robin GPU seçim stratejisi."""
    
    def __init__(self, config):
        """Round Robin Stratejisi'ni başlat."""
        self.config = config
        self.last_gpu_index = -1
    
    def select_gpu(self, available_gpus, task, gpu_pool_manager):
        """Round Robin GPU seçim stratejisi."""
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
        
        # Bir sonraki GPU'yu seç
        self.last_gpu_index = (self.last_gpu_index + 1) % len(available_gpus)
        return available_gpus[self.last_gpu_index]

class LeastLoadedStrategy:
    """En Az Yüklü GPU seçim stratejisi."""
    
    def __init__(self, config):
        """En Az Yüklü Stratejisi'ni başlat."""
        self.config = config
    
    def select_gpu(self, available_gpus, task, gpu_pool_manager):
        """En Az Yüklü GPU seçim stratejisi."""
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
        
        # GPU bilgilerini al
        gpu_infos = {}
        for gpu_id in available_gpus:
            gpu_infos[gpu_id] = gpu_pool_manager.get_gpu_info(gpu_id)
        
        # En az yüklü GPU'yu bul
        least_loaded_gpu = min(gpu_infos.items(), key=lambda x: x[1].utilization)
        
        return least_loaded_gpu[0]

class MemoryOptimizedStrategy:
    """Bellek Optimizasyonlu GPU seçim stratejisi."""
    
    def __init__(self, config):
        """Bellek Optimizasyonlu Stratejisi'ni başlat."""
        self.config = config
    
    def select_gpu(self, available_gpus, task, gpu_pool_manager):
        """Bellek Optimizasyonlu GPU seçim stratejisi."""
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
        
        # GPU bilgilerini al
        gpu_infos = {}
        for gpu_id in available_gpus:
            gpu_infos[gpu_id] = gpu_pool_manager.get_gpu_info(gpu_id)
        
        # En fazla boş belleğe sahip GPU'yu bul
        most_free_memory_gpu = max(gpu_infos.items(), key=lambda x: x[1].memory_free)
        
        return most_free_memory_gpu[0]

class RandomStrategy:
    """Rastgele GPU seçim stratejisi."""
    
    def __init__(self, config):
        """Rastgele Stratejisi'ni başlat."""
        self.config = config
    
    def select_gpu(self, available_gpus, task, gpu_pool_manager):
        """Rastgele GPU seçim stratejisi."""
        if not available_gpus:
            logger.warning("Kullanılabilir GPU yok")
            return None
        
        # Rastgele bir GPU seç
        return random.choice(available_gpus)

class StrategySelector:
    """GPU seçim stratejisi seçici."""
    
    def __init__(self, config):
        """Strateji Seçici'yi başlat."""
        self.config = config
        self.strategies = {
            'single_gpu': SingleGPUStrategy(config),
            'round_robin': RoundRobinStrategy(config),
            'least_loaded': LeastLoadedStrategy(config),
            'memory_optimized': MemoryOptimizedStrategy(config),
            'random': RandomStrategy(config)
        }
        
        # Varsayılan strateji
        self.default_strategy = config['selection'].get('default_strategy', 'single_gpu')
        
        logger.info(f"Strateji Seçici başlatıldı (Varsayılan: {self.default_strategy})")
    
    def get_strategy(self, strategy_name=None):
        """Belirli bir stratejiyi döndür."""
        if strategy_name is None:
            strategy_name = self.default_strategy
        
        if strategy_name not in self.strategies:
            logger.warning(f"Strateji '{strategy_name}' bulunamadı, varsayılan strateji '{self.default_strategy}' kullanılıyor")
            strategy_name = self.default_strategy
        
        return self.strategies[strategy_name]
    
    def select_gpu(self, available_gpus, task, gpu_pool_manager, strategy_name=None):
        """Belirli bir strateji kullanarak GPU seç."""
        strategy = self.get_strategy(strategy_name)
        
        logger.info(f"GPU seçimi için '{strategy.__class__.__name__}' stratejisi kullanılıyor")
        
        return strategy.select_gpu(available_gpus, task, gpu_pool_manager)
