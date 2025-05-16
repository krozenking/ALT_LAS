"""
Kullanıcı Kota Yöneticisi (User Quota Manager) Modülü

Bu modül, kullanıcıların GPU kaynak kullanımını sınırlandıran bileşeni içerir.
Kullanıcı Kota Yöneticisi, kullanıcıların GPU kullanım kotalarını takip eder,
kota aşımlarını kontrol eder ve kota politikalarını uygular.

Kullanım:
    from user_quota_manager import UserQuotaManager
    
    # Yapılandırma ile başlat
    config = {
        'default_gpu_limit': 2,  # Varsayılan GPU limiti
        'default_request_limit': 100,  # Varsayılan istek limiti
        'default_priority_limit': 3,  # Varsayılan öncelik limiti
        'quota_check_interval': 60,  # Kota kontrol aralığı (saniye)
    }
    
    # Kullanıcı Kota Yöneticisi'ni oluştur
    quota_manager = UserQuotaManager(config)
    
    # Kullanıcı kotasını kontrol et
    allowed, reason = await quota_manager.check_quota(user_id, request)
    
    # Kullanıcı kotasını güncelle
    await quota_manager.update_quota(user_id, gpu_usage=1, request_count=1)
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import json
import aiohttp

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("user_quota_manager")

class UserQuota:
    """Kullanıcı kotası sınıfı."""
    
    def __init__(self, user_id: str, **kwargs):
        """
        Kullanıcı kotasını başlat.
        
        Args:
            user_id: Kullanıcı ID'si
            **kwargs: Diğer kota parametreleri
        """
        self.user_id = user_id
        self.gpu_limit = kwargs.get('gpu_limit', 2)
        self.gpu_usage = kwargs.get('gpu_usage', 0)
        self.request_limit = kwargs.get('request_limit', 100)
        self.request_count = kwargs.get('request_count', 0)
        self.priority_limit = kwargs.get('priority_limit', 3)
        self.expiration_time = kwargs.get('expiration_time', None)
        self.last_updated = datetime.now().isoformat()
        
    def to_dict(self) -> Dict[str, Any]:
        """
        Kullanıcı kotasını sözlük olarak döndür.
        
        Returns:
            Kullanıcı kotası sözlüğü
        """
        return {
            'user_id': self.user_id,
            'gpu_limit': self.gpu_limit,
            'gpu_usage': self.gpu_usage,
            'request_limit': self.request_limit,
            'request_count': self.request_count,
            'priority_limit': self.priority_limit,
            'expiration_time': self.expiration_time,
            'last_updated': self.last_updated
        }
        
    def is_expired(self) -> bool:
        """
        Kullanıcı kotasının süresi dolmuş mu kontrol et.
        
        Returns:
            Süresi dolmuşsa True, dolmamışsa False
        """
        if not self.expiration_time:
            return False
            
        expiration_time = datetime.fromisoformat(self.expiration_time)
        now = datetime.now()
        
        return now > expiration_time
        
    def has_gpu_quota(self, requested_gpus: int = 1) -> bool:
        """
        Kullanıcının GPU kotası var mı kontrol et.
        
        Args:
            requested_gpus: İstenen GPU sayısı
            
        Returns:
            GPU kotası varsa True, yoksa False
        """
        return self.gpu_usage + requested_gpus <= self.gpu_limit
        
    def has_request_quota(self, requested_count: int = 1) -> bool:
        """
        Kullanıcının istek kotası var mı kontrol et.
        
        Args:
            requested_count: İstenen istek sayısı
            
        Returns:
            İstek kotası varsa True, yoksa False
        """
        return self.request_count + requested_count <= self.request_limit
        
    def has_priority_quota(self, requested_priority: int = 3) -> bool:
        """
        Kullanıcının öncelik kotası var mı kontrol et.
        
        Args:
            requested_priority: İstenen öncelik seviyesi
            
        Returns:
            Öncelik kotası varsa True, yoksa False
        """
        return requested_priority <= self.priority_limit
        
    def update_usage(self, gpu_usage: int = 0, request_count: int = 0):
        """
        Kullanım değerlerini güncelle.
        
        Args:
            gpu_usage: GPU kullanımı değişimi
            request_count: İstek sayısı değişimi
        """
        self.gpu_usage += gpu_usage
        self.request_count += request_count
        self.last_updated = datetime.now().isoformat()
        
        # Negatif değerleri engelle
        self.gpu_usage = max(0, self.gpu_usage)
        self.request_count = max(0, self.request_count)

class UserQuotaManager:
    """Kullanıcı kota yöneticisi sınıf."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Kullanıcı Kota Yöneticisi'ni başlat.
        
        Args:
            config: Yapılandırma parametreleri
        """
        self.config = config
        self.user_quotas = {}  # user_id -> UserQuota
        
        # Varsayılan kota değerleri
        self.default_gpu_limit = config.get('default_gpu_limit', 2)
        self.default_request_limit = config.get('default_request_limit', 100)
        self.default_priority_limit = config.get('default_priority_limit', 3)
        
        # Kota kontrol aralığı
        self.quota_check_interval = config.get('quota_check_interval', 60)
        
        # Periyodik görevler
        self.cleanup_task = None
        
        # İstatistikler
        self.stats = {
            'total_quota_checks': 0,
            'allowed_requests': 0,
            'denied_requests': 0,
            'denial_reasons': {},
            'user_stats': {}  # user_id -> {allowed, denied}
        }
        
    async def start(self):
        """Kullanıcı Kota Yöneticisi'ni başlat."""
        logger.info("Kullanıcı Kota Yöneticisi başlatılıyor...")
        
        # Periyodik temizleme görevini başlat
        self.cleanup_task = asyncio.create_task(self._cleanup_loop())
        
        # Kota verilerini yükle (gerçek uygulamada veritabanından yüklenebilir)
        await self._load_quotas()
        
        logger.info("Kullanıcı Kota Yöneticisi başlatıldı")
        
    async def stop(self):
        """Kullanıcı Kota Yöneticisi'ni durdur."""
        logger.info("Kullanıcı Kota Yöneticisi durduruluyor...")
        
        # Temizleme görevini iptal et
        if self.cleanup_task:
            self.cleanup_task.cancel()
            try:
                await self.cleanup_task
            except asyncio.CancelledError:
                pass
                
        # Kota verilerini kaydet (gerçek uygulamada veritabanına kaydedilebilir)
        await self._save_quotas()
        
        logger.info("Kullanıcı Kota Yöneticisi durduruldu")
        
    async def check_quota(self, user_id: str, request) -> Tuple[bool, Optional[str]]:
        """
        Kullanıcı kotasını kontrol et.
        
        Args:
            user_id: Kullanıcı ID'si
            request: İstek
            
        Returns:
            (izin_verildi, ret_nedeni) çifti
        """
        # İstatistikleri güncelle
        self.stats['total_quota_checks'] += 1
        
        # Kullanıcı istatistiklerini başlat
        if user_id not in self.stats['user_stats']:
            self.stats['user_stats'][user_id] = {
                'allowed': 0,
                'denied': 0,
                'denial_reasons': {}
            }
            
        # Kullanıcı kotasını al veya oluştur
        user_quota = await self.get_user_quota(user_id)
        
        # Kota süresi dolmuşsa reddet
        if user_quota.is_expired():
            reason = "Kota süresi dolmuş"
            self._update_denial_stats(user_id, reason)
            return False, reason
            
        # GPU kotasını kontrol et
        if not user_quota.has_gpu_quota():
            reason = "GPU kotası aşıldı"
            self._update_denial_stats(user_id, reason)
            return False, reason
            
        # İstek kotasını kontrol et
        if not user_quota.has_request_quota():
            reason = "İstek kotası aşıldı"
            self._update_denial_stats(user_id, reason)
            return False, reason
            
        # Öncelik kotasını kontrol et
        if not user_quota.has_priority_quota(request.priority):
            reason = f"Öncelik kotası aşıldı (maksimum: {user_quota.priority_limit}, istenen: {request.priority})"
            self._update_denial_stats(user_id, reason)
            return False, reason
            
        # Tüm kontroller geçildi, izin ver
        self.stats['allowed_requests'] += 1
        self.stats['user_stats'][user_id]['allowed'] += 1
        
        return True, None
        
    async def update_quota(self, user_id: str, gpu_usage: int = 0, request_count: int = 0):
        """
        Kullanıcı kotasını güncelle.
        
        Args:
            user_id: Kullanıcı ID'si
            gpu_usage: GPU kullanımı değişimi
            request_count: İstek sayısı değişimi
        """
        # Kullanıcı kotasını al veya oluştur
        user_quota = await self.get_user_quota(user_id)
        
        # Kullanım değerlerini güncelle
        user_quota.update_usage(gpu_usage, request_count)
        
        logger.info(f"Kullanıcı {user_id} kotası güncellendi: GPU kullanımı: {user_quota.gpu_usage}, İstek sayısı: {user_quota.request_count}")
        
    async def get_user_quota(self, user_id: str) -> UserQuota:
        """
        Kullanıcı kotasını al.
        
        Args:
            user_id: Kullanıcı ID'si
            
        Returns:
            Kullanıcı kotası
        """
        # Kullanıcı kotası yoksa oluştur
        if user_id not in self.user_quotas:
            self.user_quotas[user_id] = UserQuota(
                user_id=user_id,
                gpu_limit=self.default_gpu_limit,
                request_limit=self.default_request_limit,
                priority_limit=self.default_priority_limit
            )
            
        return self.user_quotas[user_id]
        
    async def set_user_quota(self, user_id: str, **kwargs):
        """
        Kullanıcı kotasını ayarla.
        
        Args:
            user_id: Kullanıcı ID'si
            **kwargs: Kota parametreleri
        """
        # Kullanıcı kotasını al veya oluştur
        user_quota = await self.get_user_quota(user_id)
        
        # Kota parametrelerini güncelle
        for key, value in kwargs.items():
            if hasattr(user_quota, key):
                setattr(user_quota, key, value)
                
        user_quota.last_updated = datetime.now().isoformat()
        
        logger.info(f"Kullanıcı {user_id} kotası ayarlandı: {kwargs}")
        
    async def reset_user_quota(self, user_id: str):
        """
        Kullanıcı kotasını sıfırla.
        
        Args:
            user_id: Kullanıcı ID'si
        """
        # Kullanıcı kotasını varsayılan değerlerle oluştur
        self.user_quotas[user_id] = UserQuota(
            user_id=user_id,
            gpu_limit=self.default_gpu_limit,
            request_limit=self.default_request_limit,
            priority_limit=self.default_priority_limit
        )
        
        logger.info(f"Kullanıcı {user_id} kotası sıfırlandı")
        
    async def get_stats(self):
        """
        Kullanıcı kota yöneticisi istatistiklerini al.
        
        Returns:
            İstatistikler
        """
        return self.stats
        
    def _update_denial_stats(self, user_id: str, reason: str):
        """
        Ret istatistiklerini güncelle.
        
        Args:
            user_id: Kullanıcı ID'si
            reason: Ret nedeni
        """
        # Genel istatistikleri güncelle
        self.stats['denied_requests'] += 1
        
        if reason not in self.stats['denial_reasons']:
            self.stats['denial_reasons'][reason] = 0
        self.stats['denial_reasons'][reason] += 1
        
        # Kullanıcı istatistiklerini güncelle
        self.stats['user_stats'][user_id]['denied'] += 1
        
        if reason not in self.stats['user_stats'][user_id]['denial_reasons']:
            self.stats['user_stats'][user_id]['denial_reasons'][reason] = 0
        self.stats['user_stats'][user_id]['denial_reasons'][reason] += 1
        
    async def _cleanup_loop(self):
        """Periyodik temizleme döngüsü."""
        while True:
            try:
                # Süresi dolmuş kotaları temizle
                expired_users = []
                
                for user_id, user_quota in self.user_quotas.items():
                    if user_quota.is_expired():
                        expired_users.append(user_id)
                        
                # Süresi dolmuş kotaları sıfırla
                for user_id in expired_users:
                    await self.reset_user_quota(user_id)
                    logger.info(f"Kullanıcı {user_id} kotası süresi dolduğu için sıfırlandı")
                    
                # Her saat başı çalış
                await asyncio.sleep(self.quota_check_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Temizleme döngüsünde hata: {e}")
                await asyncio.sleep(self.quota_check_interval)
                
    async def _load_quotas(self):
        """Kota verilerini yükle."""
        try:
            # Gerçek uygulamada veritabanından yüklenebilir
            # Bu prototipte, dosyadan yüklemeyi simüle ediyoruz
            
            # Örnek kota verileri
            sample_quotas = {
                'user1': {
                    'user_id': 'user1',
                    'gpu_limit': 4,
                    'gpu_usage': 1,
                    'request_limit': 200,
                    'request_count': 50,
                    'priority_limit': 4,
                    'expiration_time': (datetime.now() + timedelta(days=30)).isoformat()
                },
                'user2': {
                    'user_id': 'user2',
                    'gpu_limit': 2,
                    'gpu_usage': 0,
                    'request_limit': 100,
                    'request_count': 10,
                    'priority_limit': 3,
                    'expiration_time': (datetime.now() + timedelta(days=30)).isoformat()
                }
            }
            
            # Kota verilerini yükle
            for user_id, quota_data in sample_quotas.items():
                self.user_quotas[user_id] = UserQuota(**quota_data)
                
            logger.info(f"{len(self.user_quotas)} kullanıcı kotası yüklendi")
        except Exception as e:
            logger.error(f"Kota verileri yüklenirken hata: {e}")
            
    async def _save_quotas(self):
        """Kota verilerini kaydet."""
        try:
            # Gerçek uygulamada veritabanına kaydedilebilir
            # Bu prototipte, dosyaya kaydetmeyi simüle ediyoruz
            
            # Kota verilerini sözlüğe dönüştür
            quota_data = {user_id: quota.to_dict() for user_id, quota in self.user_quotas.items()}
            
            # Sözlüğü JSON formatına dönüştür
            quota_json = json.dumps(quota_data, indent=2)
            
            logger.info(f"{len(self.user_quotas)} kullanıcı kotası kaydedildi")
        except Exception as e:
            logger.error(f"Kota verileri kaydedilirken hata: {e}")
