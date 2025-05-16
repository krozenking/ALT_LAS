"""
GPU Durum İzleyici (GPU State Monitor) Modülü

Bu modül, GPU'ların durumunu ve kullanım oranlarını izleyen bileşeni içerir.
GPU Durum İzleyici, GPU Monitoring System ile entegre olarak GPU'ların durumunu
alır ve Yük Dengeleyici'ye iletir.

Kullanım:
    from gpu_state_monitor import GPUStateMonitor
    
    # Yapılandırma ile başlat
    config = {
        'gpu_monitoring_url': 'http://gpu-monitoring-service:8080',
        'update_interval': 5,  # 5 saniyede bir güncelle
        'health_check_interval': 60,  # 60 saniyede bir sağlık kontrolü
        'max_temperature': 85,  # Maksimum 85°C sıcaklık
    }
    
    # GPU Durum İzleyici'yi oluştur
    monitor = GPUStateMonitor(config)
    
    # GPU durumlarını al
    gpu_states = await monitor.get_gpu_states()
    
    # Belirli bir GPU'nun durumunu al
    gpu_state = await monitor.get_gpu_state('gpu-1')
    
    # GPU'nun sağlıklı olup olmadığını kontrol et
    is_healthy = await monitor.is_gpu_healthy('gpu-1')
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Any
import aiohttp
from datetime import datetime

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("gpu_state_monitor")

class GPUState:
    """GPU durumunu temsil eden sınıf."""
    
    def __init__(self, gpu_id: str, name: str, **kwargs):
        """
        GPU durumunu başlat.
        
        Args:
            gpu_id: GPU ID'si
            name: GPU adı
            **kwargs: Diğer GPU özellikleri
        """
        self.gpu_id = gpu_id
        self.name = name
        self.status = kwargs.get('status', 'available')
        self.compute_capability = kwargs.get('compute_capability', '0.0')
        self.memory_total = kwargs.get('memory_total', 0)
        self.memory_used = kwargs.get('memory_used', 0)
        self.memory_free = self.memory_total - self.memory_used
        self.utilization = kwargs.get('utilization', 0.0)
        self.temperature = kwargs.get('temperature', 0.0)
        self.power_usage = kwargs.get('power_usage', 0.0)
        self.power_limit = kwargs.get('power_limit', 0.0)
        self.active_requests = kwargs.get('active_requests', [])
        self.queued_requests = kwargs.get('queued_requests', 0)
        self.performance_index = kwargs.get('performance_index', 0.5)
        self.error_rate = kwargs.get('error_rate', 0.0)
        self.uptime = kwargs.get('uptime', 0)
        self.processes = kwargs.get('processes', [])
        self.last_updated = datetime.now().isoformat()
        
    def to_dict(self) -> Dict[str, Any]:
        """
        GPU durumunu sözlük olarak döndür.
        
        Returns:
            GPU durumu sözlüğü
        """
        return {
            'gpu_id': self.gpu_id,
            'name': self.name,
            'status': self.status,
            'compute_capability': self.compute_capability,
            'memory_total': self.memory_total,
            'memory_used': self.memory_used,
            'memory_free': self.memory_free,
            'utilization': self.utilization,
            'temperature': self.temperature,
            'power_usage': self.power_usage,
            'power_limit': self.power_limit,
            'active_requests': self.active_requests,
            'queued_requests': self.queued_requests,
            'performance_index': self.performance_index,
            'error_rate': self.error_rate,
            'uptime': self.uptime,
            'processes': self.processes,
            'last_updated': self.last_updated
        }
        
    def is_available(self) -> bool:
        """
        GPU'nun kullanılabilir olup olmadığını kontrol et.
        
        Returns:
            GPU kullanılabilir ise True, değilse False
        """
        return self.status == 'available'
        
    def has_sufficient_memory(self, required_memory: int) -> bool:
        """
        GPU'nun yeterli belleğe sahip olup olmadığını kontrol et.
        
        Args:
            required_memory: Gerekli bellek miktarı (byte)
            
        Returns:
            Yeterli bellek varsa True, yoksa False
        """
        return self.memory_free >= required_memory
        
    def is_healthy(self, max_temperature: float = 85.0) -> bool:
        """
        GPU'nun sağlıklı olup olmadığını kontrol et.
        
        Args:
            max_temperature: Maksimum sıcaklık (Celsius)
            
        Returns:
            GPU sağlıklı ise True, değilse False
        """
        return (
            self.status != 'error' and 
            self.temperature <= max_temperature and
            self.error_rate < 0.1
        )
        
    def update(self, **kwargs):
        """
        GPU durumunu güncelle.
        
        Args:
            **kwargs: Güncellenecek özellikler
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
        # Bellek kullanımını güncelle
        if 'memory_total' in kwargs or 'memory_used' in kwargs:
            self.memory_free = self.memory_total - self.memory_used
            
        # Son güncelleme zamanını güncelle
        self.last_updated = datetime.now().isoformat()

class GPUStateMonitor:
    """GPU durumunu izleyen sınıf."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        GPU Durum İzleyici'yi başlat.
        
        Args:
            config: Yapılandırma parametreleri
        """
        self.config = config
        self.gpu_states: Dict[str, GPUState] = {}
        self.last_update = 0
        self.update_interval = config.get('update_interval', 5)  # 5 saniyede bir güncelle
        self.health_check_interval = config.get('health_check_interval', 60)  # 60 saniyede bir sağlık kontrolü
        self.max_temperature = config.get('max_temperature', 85.0)  # Maksimum 85°C sıcaklık
        self.gpu_monitoring_url = config.get('gpu_monitoring_url', 'http://gpu-monitoring-service:8080')
        
        # Güncelleme ve sağlık kontrolü görevlerini başlat
        self.update_task = None
        self.health_check_task = None
        
        # Durum değişikliği callback'leri
        self.status_change_callbacks = []
        
    async def start(self):
        """GPU Durum İzleyici'yi başlat."""
        logger.info("GPU Durum İzleyici başlatılıyor...")
        
        # İlk güncellemeyi yap
        await self.update_gpu_states()
        
        # Periyodik güncelleme görevini başlat
        self.update_task = asyncio.create_task(self._update_loop())
        
        # Periyodik sağlık kontrolü görevini başlat
        self.health_check_task = asyncio.create_task(self._health_check_loop())
        
        logger.info("GPU Durum İzleyici başlatıldı")
        
    async def stop(self):
        """GPU Durum İzleyici'yi durdur."""
        logger.info("GPU Durum İzleyici durduruluyor...")
        
        # Güncelleme görevini iptal et
        if self.update_task:
            self.update_task.cancel()
            try:
                await self.update_task
            except asyncio.CancelledError:
                pass
                
        # Sağlık kontrolü görevini iptal et
        if self.health_check_task:
            self.health_check_task.cancel()
            try:
                await self.health_check_task
            except asyncio.CancelledError:
                pass
                
        logger.info("GPU Durum İzleyici durduruldu")
        
    async def get_gpu_states(self) -> Dict[str, GPUState]:
        """
        Tüm GPU'ların durumunu al.
        
        Returns:
            GPU durumları sözlüğü
        """
        # Belirli bir süre geçtiyse GPU durumlarını güncelle
        now = time.time()
        if now - self.last_update > self.update_interval:
            await self.update_gpu_states()
            self.last_update = now
            
        return self.gpu_states
        
    async def get_gpu_state(self, gpu_id: str) -> Optional[GPUState]:
        """
        Belirli bir GPU'nun durumunu al.
        
        Args:
            gpu_id: GPU ID'si
            
        Returns:
            GPU durumu, bulunamazsa None
        """
        gpu_states = await self.get_gpu_states()
        return gpu_states.get(gpu_id)
        
    async def is_gpu_healthy(self, gpu_id: str) -> bool:
        """
        Belirli bir GPU'nun sağlıklı olup olmadığını kontrol et.
        
        Args:
            gpu_id: GPU ID'si
            
        Returns:
            GPU sağlıklı ise True, değilse False
        """
        gpu_state = await self.get_gpu_state(gpu_id)
        if not gpu_state:
            return False
            
        return gpu_state.is_healthy(self.max_temperature)
        
    async def update_gpu_states(self):
        """GPU durumlarını güncelle."""
        try:
            # GPU Monitoring Service'den GPU durumlarını al
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.gpu_monitoring_url}/gpus") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Mevcut GPU ID'lerini sakla
                        current_gpu_ids = set(self.gpu_states.keys())
                        
                        # GPU durumlarını güncelle
                        for gpu_data in data.get('gpus', []):
                            gpu_id = gpu_data.get('gpu_id')
                            if not gpu_id:
                                continue
                                
                            # GPU zaten varsa güncelle, yoksa yeni oluştur
                            if gpu_id in self.gpu_states:
                                # Önceki durumu sakla
                                previous_status = self.gpu_states[gpu_id].status
                                
                                # GPU'yu güncelle
                                self.gpu_states[gpu_id].update(**gpu_data)
                                
                                # Durum değişikliği kontrolü
                                if previous_status != self.gpu_states[gpu_id].status:
                                    await self._notify_status_change(
                                        gpu_id, 
                                        previous_status, 
                                        self.gpu_states[gpu_id].status
                                    )
                            else:
                                # Yeni GPU oluştur
                                self.gpu_states[gpu_id] = GPUState(
                                    gpu_id=gpu_id,
                                    name=gpu_data.get('name', ''),
                                    **gpu_data
                                )
                                
                                # Yeni GPU bildirimi
                                await self._notify_status_change(
                                    gpu_id, 
                                    None, 
                                    self.gpu_states[gpu_id].status
                                )
                                
                            # İşlenen GPU ID'sini kaldır
                            if gpu_id in current_gpu_ids:
                                current_gpu_ids.remove(gpu_id)
                                
                        # Artık mevcut olmayan GPU'ları kaldır
                        for gpu_id in current_gpu_ids:
                            # Silinen GPU bildirimi
                            await self._notify_status_change(
                                gpu_id, 
                                self.gpu_states[gpu_id].status, 
                                None
                            )
                            
                            # GPU'yu kaldır
                            del self.gpu_states[gpu_id]
                    else:
                        logger.error(f"GPU durumları alınamadı: {response.status}")
        except Exception as e:
            logger.error(f"GPU durumları güncellenirken hata: {e}")
            
    async def _update_loop(self):
        """Periyodik güncelleme döngüsü."""
        while True:
            try:
                await self.update_gpu_states()
                await asyncio.sleep(self.update_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Güncelleme döngüsünde hata: {e}")
                await asyncio.sleep(self.update_interval)
                
    async def _health_check_loop(self):
        """Periyodik sağlık kontrolü döngüsü."""
        while True:
            try:
                # Her GPU için sağlık kontrolü yap
                for gpu_id, gpu_state in self.gpu_states.items():
                    # Önceki durumu sakla
                    previous_status = gpu_state.status
                    
                    # GPU sağlıklı mı kontrol et
                    is_healthy = gpu_state.is_healthy(self.max_temperature)
                    
                    # GPU sağlıksızsa ve hata durumunda değilse, durumunu güncelle
                    if not is_healthy and gpu_state.status != 'error':
                        gpu_state.status = 'error'
                        logger.warning(f"GPU {gpu_id} sağlıksız olarak işaretlendi")
                        
                        # Durum değişikliği bildirimi
                        await self._notify_status_change(gpu_id, previous_status, 'error')
                        
                    # GPU sağlıklıysa ve hata durumundaysa, durumunu güncelle
                    elif is_healthy and gpu_state.status == 'error':
                        # GPU rezerve edilmişse 'reserved', edilmemişse 'available' olarak işaretle
                        new_status = 'reserved' if gpu_state.active_requests else 'available'
                        gpu_state.status = new_status
                        logger.info(f"GPU {gpu_id} tekrar {new_status} olarak işaretlendi")
                        
                        # Durum değişikliği bildirimi
                        await self._notify_status_change(gpu_id, 'error', new_status)
                        
                await asyncio.sleep(self.health_check_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Sağlık kontrolü döngüsünde hata: {e}")
                await asyncio.sleep(self.health_check_interval)
                
    def register_status_change_callback(self, callback):
        """
        GPU durum değişikliği callback'i kaydet.
        
        Args:
            callback: Durum değişikliği callback fonksiyonu
                     callback(gpu_id, previous_status, new_status)
        """
        self.status_change_callbacks.append(callback)
        
    async def _notify_status_change(self, gpu_id: str, previous_status: Optional[str], new_status: Optional[str]):
        """
        GPU durum değişikliği bildir.
        
        Args:
            gpu_id: GPU ID'si
            previous_status: Önceki durum
            new_status: Yeni durum
        """
        for callback in self.status_change_callbacks:
            try:
                await callback(gpu_id, previous_status, new_status)
            except Exception as e:
                logger.error(f"Durum değişikliği callback'inde hata: {e}")
