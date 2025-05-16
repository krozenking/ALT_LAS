"""
GPU İstek Yönlendirme Katmanı Prototip Kodları

Bu modül, GPU İstek Yönlendirme Katmanı'nın temel bileşenlerinin prototip
kodlarını içermektedir.

Kullanım:
    from gpu_request_router import GPURequestRouter
    
    # Yapılandırma ile başlat
    config = {
        'gpu_monitoring_url': 'http://gpu-monitoring-service:8080',
        'metrics_url': 'http://metrics-service:9090',
        'min_memory_threshold': 0.1,  # En az %10 boş bellek gerekli
        'max_temperature': 85,  # Maksimum 85°C sıcaklık
        'health_check_interval': 60,  # 60 saniyede bir sağlık kontrolü
        'request_timeout': 30000,  # 30 saniye istek zaman aşımı
    }
    
    # GPU İstek Yönlendirici'yi oluştur
    router = GPURequestRouter(config)
    
    # İsteği yönlendir
    result = await router.route_request(request)
"""

import asyncio
import logging
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import json
import aiohttp
import numpy as np

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("gpu_request_router")

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
            'processes': self.processes
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

class Request:
    """İsteği temsil eden sınıf."""
    
    def __init__(self, **kwargs):
        """
        İsteği başlat.
        
        Args:
            **kwargs: İstek parametreleri
        """
        self.request_id = kwargs.get('request_id', str(uuid.uuid4()))
        self.user_id = kwargs.get('user_id', 'anonymous')
        self.model_id = kwargs.get('model_id', '')
        self.priority = kwargs.get('priority', 3)
        self.type = kwargs.get('type', 'inference')
        self.resource_requirements = kwargs.get('resource_requirements', {})
        self.timeout = kwargs.get('timeout', 30000)
        self.callback_url = kwargs.get('callback_url', None)
        self.payload = kwargs.get('payload', {})
        self.status = kwargs.get('status', 'pending')
        self.gpu_id = kwargs.get('gpu_id', None)
        self.submission_time = kwargs.get('submission_time', datetime.now().isoformat())
        self.start_time = kwargs.get('start_time', None)
        self.completion_time = kwargs.get('completion_time', None)
        self.queue_position = kwargs.get('queue_position', 0)
        self.progress = kwargs.get('progress', 0.0)
        self.result = kwargs.get('result', None)
        self.error = kwargs.get('error', None)
        
    def to_dict(self) -> Dict[str, Any]:
        """
        İsteği sözlük olarak döndür.
        
        Returns:
            İstek sözlüğü
        """
        return {
            'request_id': self.request_id,
            'user_id': self.user_id,
            'model_id': self.model_id,
            'priority': self.priority,
            'type': self.type,
            'resource_requirements': self.resource_requirements,
            'timeout': self.timeout,
            'callback_url': self.callback_url,
            'payload': self.payload,
            'status': self.status,
            'gpu_id': self.gpu_id,
            'submission_time': self.submission_time,
            'start_time': self.start_time,
            'completion_time': self.completion_time,
            'queue_position': self.queue_position,
            'progress': self.progress,
            'result': self.result,
            'error': self.error
        }
        
    def get_required_memory(self) -> int:
        """
        İsteğin gerektirdiği bellek miktarını döndür.
        
        Returns:
            Gerekli bellek miktarı (byte)
        """
        memory_mb = self.resource_requirements.get('memory', 0)
        return memory_mb * 1024 * 1024  # MB -> byte
        
    def is_expired(self) -> bool:
        """
        İsteğin zaman aşımına uğrayıp uğramadığını kontrol et.
        
        Returns:
            Zaman aşımına uğradıysa True, uğramadıysa False
        """
        if not self.submission_time:
            return False
            
        submission_time = datetime.fromisoformat(self.submission_time)
        now = datetime.now()
        elapsed_ms = (now - submission_time).total_seconds() * 1000
        
        return elapsed_ms > self.timeout

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
        self.update_interval = config.get('gpu_state_update_interval', 5)  # 5 saniyede bir güncelle
        
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
        
    async def update_gpu_states(self):
        """GPU durumlarını güncelle."""
        try:
            # GPU Monitoring Service'den GPU durumlarını al
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.config['gpu_monitoring_url']}/gpus") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # GPU durumlarını güncelle
                        for gpu_data in data.get('gpus', []):
                            gpu_id = gpu_data.get('gpu_id')
                            if gpu_id:
                                self.gpu_states[gpu_id] = GPUState(
                                    gpu_id=gpu_id,
                                    name=gpu_data.get('name', ''),
                                    **gpu_data
                                )
                    else:
                        logger.error(f"GPU durumları alınamadı: {response.status}")
        except Exception as e:
            logger.error(f"GPU durumları güncellenirken hata: {e}")
            
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

class LoadBalancer:
    """Yük dengeleyici sınıf."""
    
    def __init__(self, config: Dict[str, Any], gpu_state_monitor: GPUStateMonitor):
        """
        Yük Dengeleyici'yi başlat.
        
        Args:
            config: Yapılandırma parametreleri
            gpu_state_monitor: GPU Durum İzleyici
        """
        self.config = config
        self.gpu_state_monitor = gpu_state_monitor
        
    async def select_gpu(self, request: Request) -> Optional[str]:
        """
        İstek için en uygun GPU'yu seç.
        
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
            if not state.is_available() or not state.is_healthy(self.config.get('max_temperature', 85)):
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
                0.4 * usage_score +
                0.3 * priority_score +
                0.2 * performance_score +
                0.1 * health_score
            )
            
        # En yüksek skora sahip GPU'yu seç
        if not scores:
            return None
            
        return max(scores, key=scores.get)

class RequestRouter:
    """İstek yönlendirici sınıf."""
    
    def __init__(self, config: Dict[str, Any], load_balancer: LoadBalancer):
        """
        İstek Yönlendirici'yi başlat.
        
        Args:
            config: Yapılandırma parametreleri
            load_balancer: Yük Dengeleyici
        """
        self.config = config
        self.load_balancer = load_balancer
        self.requests: Dict[str, Request] = {}
        
    async def route_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        İsteği yönlendir.
        
        Args:
            request_data: İstek verileri
            
        Returns:
            Yönlendirme sonucu
        """
        # İstek nesnesi oluştur
        request = Request(**request_data)
        
        # İsteği kaydet
        self.requests[request.request_id] = request
        
        # En uygun GPU'yu seç
        gpu_id = await self.load_balancer.select_gpu(request)
        
        if gpu_id:
            # GPU bulundu, isteği yönlendir
            request.status = 'processing'
            request.gpu_id = gpu_id
            request.start_time = datetime.now().isoformat()
            
            # İsteği GPU'ya gönder (gerçek uygulamada burada GPU'ya istek gönderilir)
            # Bu prototipte sadece simüle ediyoruz
            asyncio.create_task(self._process_request(request))
            
            return {
                'request_id': request.request_id,
                'status': request.status,
                'gpu_id': request.gpu_id,
                'estimated_start_time': request.start_time,
                'estimated_completion_time': (datetime.fromisoformat(request.start_time) + 
                                             timedelta(milliseconds=request.resource_requirements.get('expected_duration', 1000))).isoformat(),
                'queue_position': 0
            }
        else:
            # Uygun GPU bulunamadı, isteği kuyruğa al
            request.status = 'queued'
            request.queue_position = len([r for r in self.requests.values() if r.status == 'queued'])
            
            return {
                'request_id': request.request_id,
                'status': request.status,
                'gpu_id': None,
                'estimated_start_time': None,
                'estimated_completion_time': None,
                'queue_position': request.queue_position
            }
            
    async def _process_request(self, request: Request):
        """
        İsteği işle (simülasyon).
        
        Args:
            request: İstek
        """
        try:
            # İşlem süresini simüle et
            expected_duration = request.resource_requirements.get('expected_duration', 1000)
            await asyncio.sleep(expected_duration / 1000)  # ms -> s
            
            # İşlemi tamamla
            request.status = 'completed'
            request.completion_time = datetime.now().isoformat()
            request.progress = 1.0
            request.result = {'success': True, 'message': 'İşlem tamamlandı'}
            
            # Callback URL varsa sonucu gönder
            if request.callback_url:
                asyncio.create_task(self._send_callback(request))
                
        except Exception as e:
            # Hata durumu
            request.status = 'failed'
            request.completion_time = datetime.now().isoformat()
            request.error = str(e)
            
            logger.error(f"İstek işlenirken hata: {e}")
            
    async def _send_callback(self, request: Request):
        """
        Callback URL'ye sonuç gönder.
        
        Args:
            request: İstek
        """
        if not request.callback_url:
            return
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    request.callback_url,
                    json=request.to_dict()
                ) as response:
                    if response.status != 200:
                        logger.error(f"Callback gönderimi başarısız: {response.status}")
        except Exception as e:
            logger.error(f"Callback gönderilirken hata: {e}")
            
    async def get_request(self, request_id: str) -> Optional[Request]:
        """
        İstek bilgilerini al.
        
        Args:
            request_id: İstek ID'si
            
        Returns:
            İstek, bulunamazsa None
        """
        return self.requests.get(request_id)
        
    async def cancel_request(self, request_id: str) -> Dict[str, Any]:
        """
        İsteği iptal et.
        
        Args:
            request_id: İstek ID'si
            
        Returns:
            İptal sonucu
        """
        request = self.requests.get(request_id)
        
        if not request:
            return {
                'request_id': request_id,
                'status': 'not_found',
                'message': 'İstek bulunamadı'
            }
            
        if request.status in ['completed', 'failed', 'cancelled']:
            return {
                'request_id': request_id,
                'status': request.status,
                'message': f'İstek zaten {request.status} durumunda'
            }
            
        # İsteği iptal et
        request.status = 'cancelled'
        request.completion_time = datetime.now().isoformat()
        
        return {
            'request_id': request_id,
            'status': 'cancelled',
            'message': 'İstek başarıyla iptal edildi'
        }

class GPURequestRouter:
    """GPU İstek Yönlendirme Katmanı ana sınıfı."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        GPU İstek Yönlendirici'yi başlat.
        
        Args:
            config: Yapılandırma parametreleri
        """
        self.config = config
        self.gpu_state_monitor = GPUStateMonitor(config)
        self.load_balancer = LoadBalancer(config, self.gpu_state_monitor)
        self.request_router = RequestRouter(config, self.load_balancer)
        
    async def route_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        İsteği yönlendir.
        
        Args:
            request_data: İstek verileri
            
        Returns:
            Yönlendirme sonucu
        """
        return await self.request_router.route_request(request_data)
        
    async def get_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        İstek bilgilerini al.
        
        Args:
            request_id: İstek ID'si
            
        Returns:
            İstek bilgileri, bulunamazsa None
        """
        request = await self.request_router.get_request(request_id)
        return request.to_dict() if request else None
        
    async def cancel_request(self, request_id: str) -> Dict[str, Any]:
        """
        İsteği iptal et.
        
        Args:
            request_id: İstek ID'si
            
        Returns:
            İptal sonucu
        """
        return await self.request_router.cancel_request(request_id)
        
    async def get_gpu_states(self) -> Dict[str, Dict[str, Any]]:
        """
        Tüm GPU'ların durumunu al.
        
        Returns:
            GPU durumları
        """
        gpu_states = await self.gpu_state_monitor.get_gpu_states()
        return {gpu_id: state.to_dict() for gpu_id, state in gpu_states.items()}
        
    async def get_gpu_state(self, gpu_id: str) -> Optional[Dict[str, Any]]:
        """
        Belirli bir GPU'nun durumunu al.
        
        Args:
            gpu_id: GPU ID'si
            
        Returns:
            GPU durumu, bulunamazsa None
        """
        state = await self.gpu_state_monitor.get_gpu_state(gpu_id)
        return state.to_dict() if state else None
