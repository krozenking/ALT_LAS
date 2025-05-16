"""
İstek Alıcı (Request Receiver) Modülü

Bu modül, gelen istekleri kabul eden ve ön işleme tabi tutan bileşeni içerir.
İstek Alıcı, isteklerin doğruluğunu ve geçerliliğini kontrol eder, istek
parametrelerini standartlaştırır, istek kimliği oluşturur ve istek meta
verilerini ekler.

Kullanım:
    from request_receiver import RequestReceiver
    
    # Yapılandırma ile başlat
    config = {
        'validate_requests': True,  # İstekleri doğrula
        'generate_request_id': True,  # İstek kimliği oluştur
        'add_metadata': True,  # Meta verileri ekle
    }
    
    # İstek Alıcı'yı oluştur
    receiver = RequestReceiver(config)
    
    # İsteği işle
    processed_request = await receiver.process_request(request_data)
"""

import asyncio
import logging
import time
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("request_receiver")

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
        self.metadata = kwargs.get('metadata', {})
        
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
            'error': self.error,
            'metadata': self.metadata
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

class RequestValidator:
    """İstek doğrulayıcı sınıf."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        İstek Doğrulayıcı'yı başlat.
        
        Args:
            config: Yapılandırma parametreleri
        """
        self.config = config
        
    def validate_request(self, request_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        İsteği doğrula.
        
        Args:
            request_data: İstek verileri
            
        Returns:
            (geçerli, hata_mesajı) çifti
        """
        # Zorunlu alanları kontrol et
        required_fields = ['user_id', 'model_id']
        for field in required_fields:
            if field not in request_data:
                return False, f"Zorunlu alan eksik: {field}"
                
        # Öncelik değerini kontrol et
        priority = request_data.get('priority', 3)
        if not isinstance(priority, int) or priority < 1 or priority > 5:
            return False, "Öncelik değeri 1-5 arasında bir tamsayı olmalıdır"
            
        # İstek türünü kontrol et
        valid_types = ['inference', 'training', 'fine-tuning']
        request_type = request_data.get('type', 'inference')
        if request_type not in valid_types:
            return False, f"Geçersiz istek türü: {request_type}. Geçerli türler: {', '.join(valid_types)}"
            
        # Kaynak gereksinimlerini kontrol et
        resource_requirements = request_data.get('resource_requirements', {})
        if not isinstance(resource_requirements, dict):
            return False, "Kaynak gereksinimleri bir sözlük olmalıdır"
            
        # Bellek gereksinimini kontrol et
        memory = resource_requirements.get('memory', 0)
        if not isinstance(memory, int) or memory < 0:
            return False, "Bellek gereksinimi pozitif bir tamsayı olmalıdır"
            
        # Zaman aşımı değerini kontrol et
        timeout = request_data.get('timeout', 30000)
        if not isinstance(timeout, int) or timeout < 0:
            return False, "Zaman aşımı değeri pozitif bir tamsayı olmalıdır"
            
        # Callback URL'yi kontrol et
        callback_url = request_data.get('callback_url')
        if callback_url is not None and not isinstance(callback_url, str):
            return False, "Callback URL bir string olmalıdır"
            
        return True, None

class RequestReceiver:
    """İstek alıcı sınıf."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        İstek Alıcı'yı başlat.
        
        Args:
            config: Yapılandırma parametreleri
        """
        self.config = config
        self.validator = RequestValidator(config)
        
        # İstatistikler
        self.stats = {
            'total_requests': 0,
            'valid_requests': 0,
            'invalid_requests': 0,
            'request_types': {}
        }
        
    async def process_request(self, request_data: Dict[str, Any]) -> Tuple[Optional[Request], Optional[str]]:
        """
        İsteği işle.
        
        Args:
            request_data: İstek verileri
            
        Returns:
            (işlenmiş_istek, hata_mesajı) çifti
        """
        # İstatistikleri güncelle
        self.stats['total_requests'] += 1
        
        # İsteği doğrula
        if self.config.get('validate_requests', True):
            valid, error_message = self.validator.validate_request(request_data)
            if not valid:
                self.stats['invalid_requests'] += 1
                logger.warning(f"Geçersiz istek: {error_message}")
                return None, error_message
                
        # İstatistikleri güncelle
        self.stats['valid_requests'] += 1
        request_type = request_data.get('type', 'inference')
        self.stats['request_types'][request_type] = self.stats['request_types'].get(request_type, 0) + 1
        
        # İstek kimliği oluştur
        if self.config.get('generate_request_id', True) and 'request_id' not in request_data:
            request_data['request_id'] = str(uuid.uuid4())
            
        # Meta verileri ekle
        if self.config.get('add_metadata', True):
            request_data['metadata'] = request_data.get('metadata', {})
            request_data['metadata']['received_at'] = datetime.now().isoformat()
            request_data['metadata']['receiver_id'] = self.config.get('receiver_id', 'default')
            
        # İstek nesnesi oluştur
        request = Request(**request_data)
        
        logger.info(f"İstek işlendi: {request.request_id}, tür: {request.type}, öncelik: {request.priority}")
        
        return request, None
        
    async def get_stats(self) -> Dict[str, Any]:
        """
        İstek alıcı istatistiklerini al.
        
        Returns:
            İstatistikler
        """
        return self.stats
