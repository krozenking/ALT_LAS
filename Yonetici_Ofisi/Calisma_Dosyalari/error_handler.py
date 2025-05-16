"""
Hata İşleyici (Error Handler) Modülü

Bu modül, hataları tespit eden ve gerekli aksiyonları alan bileşeni içerir.
Hata İşleyici, GPU çökmesi, istek zaman aşımı, kaynak yetersizliği gibi
hata durumlarını ele alır ve uygun aksiyonları alır.

Kullanım:
    from error_handler import ErrorHandler
    
    # Yapılandırma ile başlat
    config = {
        'max_retries': 3,  # Maksimum yeniden deneme sayısı
        'retry_delay': 1.0,  # Yeniden deneme gecikmesi (saniye)
        'error_threshold': 0.1,  # Hata eşiği (0.0 - 1.0)
        'error_window': 60,  # Hata penceresi (saniye)
    }
    
    # Hata İşleyici'yi oluştur
    error_handler = ErrorHandler(config, gpu_state_monitor)
    
    # Hatayı işle
    handled, action = await error_handler.handle_error(request, error_message)
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("error_handler")

class ErrorType(str, Enum):
    """Hata türleri."""
    GPU_CRASH = "gpu_crash"  # GPU çökmesi
    REQUEST_TIMEOUT = "request_timeout"  # İstek zaman aşımı
    RESOURCE_EXHAUSTION = "resource_exhaustion"  # Kaynak tükenmesi
    INVALID_REQUEST = "invalid_request"  # Geçersiz istek
    NETWORK_ERROR = "network_error"  # Ağ hatası
    INTERNAL_ERROR = "internal_error"  # İç hata
    UNKNOWN_ERROR = "unknown_error"  # Bilinmeyen hata

class ErrorAction(str, Enum):
    """Hata aksiyonları."""
    RETRY = "retry"  # Yeniden dene
    REQUEUE = "requeue"  # Yeniden kuyruğa al
    FAIL = "fail"  # Başarısız olarak işaretle
    NOTIFY = "notify"  # Bildirim gönder
    MARK_GPU_ERROR = "mark_gpu_error"  # GPU'yu hata durumunda işaretle

class ErrorHandler:
    """Hata işleyici sınıf."""
    
    def __init__(self, config: Dict[str, Any], gpu_state_monitor):
        """
        Hata İşleyici'yi başlat.
        
        Args:
            config: Yapılandırma parametreleri
            gpu_state_monitor: GPU Durum İzleyici
        """
        self.config = config
        self.gpu_state_monitor = gpu_state_monitor
        
        # Hata istatistikleri
        self.error_stats = {
            'total_errors': 0,
            'handled_errors': 0,
            'unhandled_errors': 0,
            'error_types': {},
            'error_actions': {},
            'gpu_errors': {}  # gpu_id -> {error_count, last_error_time, error_types}
        }
        
        # Hata eşiği ve penceresi
        self.error_threshold = config.get('error_threshold', 0.1)
        self.error_window = config.get('error_window', 60)
        
        # Yeniden deneme parametreleri
        self.max_retries = config.get('max_retries', 3)
        self.retry_delay = config.get('retry_delay', 1.0)
        
        # Hata işleme stratejileri
        self.error_strategies = {
            ErrorType.GPU_CRASH: self._handle_gpu_crash,
            ErrorType.REQUEST_TIMEOUT: self._handle_request_timeout,
            ErrorType.RESOURCE_EXHAUSTION: self._handle_resource_exhaustion,
            ErrorType.INVALID_REQUEST: self._handle_invalid_request,
            ErrorType.NETWORK_ERROR: self._handle_network_error,
            ErrorType.INTERNAL_ERROR: self._handle_internal_error,
            ErrorType.UNKNOWN_ERROR: self._handle_unknown_error
        }
        
        # Hata türü tespit regex'leri
        self.error_patterns = {
            ErrorType.GPU_CRASH: [
                r'gpu.*crash', r'cuda.*error', r'out of memory', r'device.*lost'
            ],
            ErrorType.REQUEST_TIMEOUT: [
                r'timeout', r'timed out', r'deadline exceeded'
            ],
            ErrorType.RESOURCE_EXHAUSTION: [
                r'resource.*exhausted', r'no.*resource', r'insufficient.*resource',
                r'out of.*resource', r'memory.*exhausted'
            ],
            ErrorType.INVALID_REQUEST: [
                r'invalid.*request', r'bad.*request', r'malformed.*request',
                r'invalid.*parameter', r'missing.*parameter'
            ],
            ErrorType.NETWORK_ERROR: [
                r'network.*error', r'connection.*error', r'connection.*refused',
                r'connection.*reset', r'connection.*closed'
            ],
            ErrorType.INTERNAL_ERROR: [
                r'internal.*error', r'server.*error', r'unexpected.*error',
                r'unknown.*error', r'exception'
            ]
        }
        
        # GPU Durum İzleyici'ye durum değişikliği callback'i kaydet
        self.gpu_state_monitor.register_status_change_callback(self._handle_gpu_status_change)
        
    async def handle_error(self, request, error_message: str) -> Tuple[bool, Optional[str]]:
        """
        Hatayı işle.
        
        Args:
            request: İstek
            error_message: Hata mesajı
            
        Returns:
            (işlendi, aksiyon) çifti
        """
        # İstatistikleri güncelle
        self.error_stats['total_errors'] += 1
        
        # Hata türünü tespit et
        error_type = self._detect_error_type(error_message)
        
        # Hata türü istatistiklerini güncelle
        if error_type not in self.error_stats['error_types']:
            self.error_stats['error_types'][error_type] = 0
        self.error_stats['error_types'][error_type] += 1
        
        # GPU hatalarını takip et
        if request.gpu_id:
            if request.gpu_id not in self.error_stats['gpu_errors']:
                self.error_stats['gpu_errors'][request.gpu_id] = {
                    'error_count': 0,
                    'last_error_time': None,
                    'error_types': {}
                }
                
            gpu_errors = self.error_stats['gpu_errors'][request.gpu_id]
            gpu_errors['error_count'] += 1
            gpu_errors['last_error_time'] = datetime.now().isoformat()
            
            if error_type not in gpu_errors['error_types']:
                gpu_errors['error_types'][error_type] = 0
            gpu_errors['error_types'][error_type] += 1
            
            # GPU hata oranını kontrol et
            await self._check_gpu_error_rate(request.gpu_id)
        
        # Hata stratejisini uygula
        if error_type in self.error_strategies:
            handled, action = await self.error_strategies[error_type](request, error_message)
        else:
            handled, action = await self._handle_unknown_error(request, error_message)
            
        # İstatistikleri güncelle
        if handled:
            self.error_stats['handled_errors'] += 1
        else:
            self.error_stats['unhandled_errors'] += 1
            
        if action:
            if action not in self.error_stats['error_actions']:
                self.error_stats['error_actions'][action] = 0
            self.error_stats['error_actions'][action] += 1
            
        return handled, action
        
    def _detect_error_type(self, error_message: str) -> str:
        """
        Hata türünü tespit et.
        
        Args:
            error_message: Hata mesajı
            
        Returns:
            Hata türü
        """
        error_message = error_message.lower()
        
        for error_type, patterns in self.error_patterns.items():
            for pattern in patterns:
                if pattern in error_message:
                    return error_type
                    
        return ErrorType.UNKNOWN_ERROR
        
    async def _handle_gpu_crash(self, request, error_message: str) -> Tuple[bool, Optional[str]]:
        """
        GPU çökmesi hatasını işle.
        
        Args:
            request: İstek
            error_message: Hata mesajı
            
        Returns:
            (işlendi, aksiyon) çifti
        """
        logger.warning(f"GPU çökmesi tespit edildi: {request.gpu_id}, Hata: {error_message}")
        
        # GPU'yu hata durumunda işaretle
        if request.gpu_id:
            gpu_state = await self.gpu_state_monitor.get_gpu_state(request.gpu_id)
            if gpu_state:
                gpu_state.status = 'error'
                logger.warning(f"GPU {request.gpu_id} hata durumunda işaretlendi")
                
        # İsteği yeniden kuyruğa al
        return True, ErrorAction.REQUEUE
        
    async def _handle_request_timeout(self, request, error_message: str) -> Tuple[bool, Optional[str]]:
        """
        İstek zaman aşımı hatasını işle.
        
        Args:
            request: İstek
            error_message: Hata mesajı
            
        Returns:
            (işlendi, aksiyon) çifti
        """
        logger.warning(f"İstek zaman aşımı: {request.request_id}, Hata: {error_message}")
        
        # Yeniden deneme sayısını kontrol et
        retry_count = request.metadata.get('retry_count', 0)
        
        if retry_count < self.max_retries:
            # Yeniden deneme sayısını artır
            request.metadata['retry_count'] = retry_count + 1
            
            # Yeniden deneme gecikmesi
            await asyncio.sleep(self.retry_delay * (retry_count + 1))
            
            # İsteği yeniden dene
            return True, ErrorAction.RETRY
        else:
            # Maksimum yeniden deneme sayısına ulaşıldı
            logger.error(f"İstek {request.request_id} maksimum yeniden deneme sayısına ulaştı")
            return True, ErrorAction.FAIL
        
    async def _handle_resource_exhaustion(self, request, error_message: str) -> Tuple[bool, Optional[str]]:
        """
        Kaynak tükenmesi hatasını işle.
        
        Args:
            request: İstek
            error_message: Hata mesajı
            
        Returns:
            (işlendi, aksiyon) çifti
        """
        logger.warning(f"Kaynak tükenmesi: {request.gpu_id}, Hata: {error_message}")
        
        # GPU'yu kontrol et
        if request.gpu_id:
            gpu_state = await self.gpu_state_monitor.get_gpu_state(request.gpu_id)
            if gpu_state:
                # GPU'nun bellek kullanımını kontrol et
                memory_usage = gpu_state.memory_used / gpu_state.memory_total if gpu_state.memory_total > 0 else 1.0
                
                if memory_usage > 0.9:  # %90'dan fazla bellek kullanımı
                    # GPU'yu geçici olarak devre dışı bırak
                    gpu_state.status = 'maintenance'
                    logger.warning(f"GPU {request.gpu_id} bakım durumunda işaretlendi (bellek kullanımı: {memory_usage:.2f})")
                    
                    # Belirli bir süre sonra GPU'yu tekrar aktif et
                    asyncio.create_task(self._reactivate_gpu_after_delay(request.gpu_id, 60))  # 60 saniye sonra
                    
        # İsteği yeniden kuyruğa al
        return True, ErrorAction.REQUEUE
        
    async def _handle_invalid_request(self, request, error_message: str) -> Tuple[bool, Optional[str]]:
        """
        Geçersiz istek hatasını işle.
        
        Args:
            request: İstek
            error_message: Hata mesajı
            
        Returns:
            (işlendi, aksiyon) çifti
        """
        logger.warning(f"Geçersiz istek: {request.request_id}, Hata: {error_message}")
        
        # Geçersiz istekler yeniden denenemez
        return True, ErrorAction.FAIL
        
    async def _handle_network_error(self, request, error_message: str) -> Tuple[bool, Optional[str]]:
        """
        Ağ hatası işle.
        
        Args:
            request: İstek
            error_message: Hata mesajı
            
        Returns:
            (işlendi, aksiyon) çifti
        """
        logger.warning(f"Ağ hatası: {request.request_id}, Hata: {error_message}")
        
        # Yeniden deneme sayısını kontrol et
        retry_count = request.metadata.get('retry_count', 0)
        
        if retry_count < self.max_retries:
            # Yeniden deneme sayısını artır
            request.metadata['retry_count'] = retry_count + 1
            
            # Yeniden deneme gecikmesi (üstel geri çekilme)
            await asyncio.sleep(self.retry_delay * (2 ** retry_count))
            
            # İsteği yeniden dene
            return True, ErrorAction.RETRY
        else:
            # Maksimum yeniden deneme sayısına ulaşıldı
            logger.error(f"İstek {request.request_id} maksimum yeniden deneme sayısına ulaştı")
            return True, ErrorAction.FAIL
        
    async def _handle_internal_error(self, request, error_message: str) -> Tuple[bool, Optional[str]]:
        """
        İç hata işle.
        
        Args:
            request: İstek
            error_message: Hata mesajı
            
        Returns:
            (işlendi, aksiyon) çifti
        """
        logger.error(f"İç hata: {request.request_id}, Hata: {error_message}")
        
        # İç hatalar genellikle yeniden denenemez
        return True, ErrorAction.FAIL
        
    async def _handle_unknown_error(self, request, error_message: str) -> Tuple[bool, Optional[str]]:
        """
        Bilinmeyen hata işle.
        
        Args:
            request: İstek
            error_message: Hata mesajı
            
        Returns:
            (işlendi, aksiyon) çifti
        """
        logger.error(f"Bilinmeyen hata: {request.request_id}, Hata: {error_message}")
        
        # Bilinmeyen hatalar için yeniden deneme
        retry_count = request.metadata.get('retry_count', 0)
        
        if retry_count < self.max_retries:
            # Yeniden deneme sayısını artır
            request.metadata['retry_count'] = retry_count + 1
            
            # Yeniden deneme gecikmesi
            await asyncio.sleep(self.retry_delay)
            
            # İsteği yeniden dene
            return True, ErrorAction.RETRY
        else:
            # Maksimum yeniden deneme sayısına ulaşıldı
            return True, ErrorAction.FAIL
            
    async def _check_gpu_error_rate(self, gpu_id: str):
        """
        GPU hata oranını kontrol et.
        
        Args:
            gpu_id: GPU ID'si
        """
        if gpu_id not in self.error_stats['gpu_errors']:
            return
            
        gpu_errors = self.error_stats['gpu_errors'][gpu_id]
        
        # Son hata zamanı
        if not gpu_errors['last_error_time']:
            return
            
        last_error_time = datetime.fromisoformat(gpu_errors['last_error_time'])
        now = datetime.now()
        
        # Hata penceresi içindeki hataları say
        if (now - last_error_time).total_seconds() <= self.error_window:
            # GPU durumunu al
            gpu_state = await self.gpu_state_monitor.get_gpu_state(gpu_id)
            if not gpu_state:
                return
                
            # Hata oranını hesapla
            error_rate = gpu_errors['error_count'] / (gpu_state.active_requests + 1)
            
            # Hata oranı eşiği aşıldıysa GPU'yu hata durumunda işaretle
            if error_rate >= self.error_threshold:
                gpu_state.status = 'error'
                gpu_state.error_rate = error_rate
                logger.warning(f"GPU {gpu_id} hata oranı eşiği aşıldı ({error_rate:.2f}), hata durumunda işaretlendi")
                
    async def _reactivate_gpu_after_delay(self, gpu_id: str, delay: int):
        """
        Belirli bir süre sonra GPU'yu tekrar aktif et.
        
        Args:
            gpu_id: GPU ID'si
            delay: Gecikme süresi (saniye)
        """
        await asyncio.sleep(delay)
        
        # GPU durumunu al
        gpu_state = await self.gpu_state_monitor.get_gpu_state(gpu_id)
        if not gpu_state:
            return
            
        # GPU hala bakım durumundaysa aktif et
        if gpu_state.status == 'maintenance':
            gpu_state.status = 'available'
            logger.info(f"GPU {gpu_id} tekrar aktif edildi")
            
    async def _handle_gpu_status_change(self, gpu_id: str, previous_status: Optional[str], new_status: Optional[str]):
        """
        GPU durum değişikliği işle.
        
        Args:
            gpu_id: GPU ID'si
            previous_status: Önceki durum
            new_status: Yeni durum
        """
        # GPU hata durumundan çıktıysa hata istatistiklerini sıfırla
        if previous_status == 'error' and new_status in ['available', 'busy']:
            if gpu_id in self.error_stats['gpu_errors']:
                self.error_stats['gpu_errors'][gpu_id] = {
                    'error_count': 0,
                    'last_error_time': None,
                    'error_types': {}
                }
                logger.info(f"GPU {gpu_id} hata istatistikleri sıfırlandı")
                
    async def get_stats(self):
        """
        Hata işleyici istatistiklerini al.
        
        Returns:
            İstatistikler
        """
        return self.error_stats
