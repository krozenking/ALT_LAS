"""
İstek Yönlendirici (Request Router) Modülü

Bu modül, istekleri uygun GPU'lara yönlendiren bileşeni içerir.
İstek Yönlendirici, Yük Dengeleyici'den aldığı GPU seçimini kullanarak
istekleri ilgili GPU'ya yönlendirir, istek durumunu takip eder ve
sonuçları toplar.

Kullanım:
    from request_router import RequestRouter
    
    # Yapılandırma ile başlat
    config = {
        'max_retries': 3,  # Maksimum yeniden deneme sayısı
        'retry_delay': 1.0,  # Yeniden deneme gecikmesi (saniye)
        'request_timeout': 30.0,  # İstek zaman aşımı (saniye)
    }
    
    # İstek Yönlendirici'yi oluştur
    router = RequestRouter(config, load_balancer, error_handler)
    
    # İsteği yönlendir
    result = await router.route_request(request)
    
    # İstek durumunu sorgula
    status = await router.get_request_status(request_id)
    
    # İsteği iptal et
    result = await router.cancel_request(request_id)
"""

import asyncio
import logging
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import aiohttp

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("request_router")

class RequestRouter:
    """İstek yönlendirici sınıf."""
    
    def __init__(self, config: Dict[str, Any], load_balancer, error_handler=None):
        """
        İstek Yönlendirici'yi başlat.
        
        Args:
            config: Yapılandırma parametreleri
            load_balancer: Yük Dengeleyici
            error_handler: Hata İşleyici (opsiyonel)
        """
        self.config = config
        self.load_balancer = load_balancer
        self.error_handler = error_handler
        
        # İstek takibi
        self.requests = {}  # request_id -> request
        self.active_requests = {}  # gpu_id -> [request_id, ...]
        self.request_queue = []  # [request_id, ...]
        
        # İstatistikler
        self.stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'cancelled_requests': 0,
            'retried_requests': 0,
            'average_processing_time': 0.0,
            'gpu_usage': {}  # gpu_id -> count
        }
        
        # Periyodik görevler
        self.cleanup_task = None
        self.queue_processing_task = None
        
    async def start(self):
        """İstek Yönlendirici'yi başlat."""
        logger.info("İstek Yönlendirici başlatılıyor...")
        
        # Periyodik temizleme görevini başlat
        self.cleanup_task = asyncio.create_task(self._cleanup_loop())
        
        # Periyodik kuyruk işleme görevini başlat
        self.queue_processing_task = asyncio.create_task(self._queue_processing_loop())
        
        logger.info("İstek Yönlendirici başlatıldı")
        
    async def stop(self):
        """İstek Yönlendirici'yi durdur."""
        logger.info("İstek Yönlendirici durduruluyor...")
        
        # Temizleme görevini iptal et
        if self.cleanup_task:
            self.cleanup_task.cancel()
            try:
                await self.cleanup_task
            except asyncio.CancelledError:
                pass
                
        # Kuyruk işleme görevini iptal et
        if self.queue_processing_task:
            self.queue_processing_task.cancel()
            try:
                await self.queue_processing_task
            except asyncio.CancelledError:
                pass
                
        logger.info("İstek Yönlendirici durduruldu")
        
    async def route_request(self, request):
        """
        İsteği yönlendir.
        
        Args:
            request: İstek
            
        Returns:
            Yönlendirme sonucu
        """
        # İstatistikleri güncelle
        self.stats['total_requests'] += 1
        
        # İsteği kaydet
        self.requests[request.request_id] = request
        
        # En uygun GPU'yu seç
        gpu_id = await self.load_balancer.select_gpu(request)
        
        if gpu_id:
            # GPU bulundu, isteği yönlendir
            request.status = 'processing'
            request.gpu_id = gpu_id
            request.start_time = datetime.now().isoformat()
            
            # Aktif isteklere ekle
            if gpu_id not in self.active_requests:
                self.active_requests[gpu_id] = []
            self.active_requests[gpu_id].append(request.request_id)
            
            # GPU kullanım istatistiklerini güncelle
            if gpu_id not in self.stats['gpu_usage']:
                self.stats['gpu_usage'][gpu_id] = 0
            self.stats['gpu_usage'][gpu_id] += 1
            
            # İsteği GPU'ya gönder
            try:
                result = await self._send_request_to_gpu(request)
                
                # İşlem başarılı
                request.status = 'completed'
                request.completion_time = datetime.now().isoformat()
                request.result = result
                request.progress = 1.0
                
                # İstatistikleri güncelle
                self.stats['successful_requests'] += 1
                
                # İşlem süresini hesapla ve ortalama işlem süresini güncelle
                processing_time = (datetime.fromisoformat(request.completion_time) - 
                                  datetime.fromisoformat(request.start_time)).total_seconds()
                
                # Ortalama işlem süresini güncelle
                if self.stats['successful_requests'] == 1:
                    self.stats['average_processing_time'] = processing_time
                else:
                    self.stats['average_processing_time'] = (
                        (self.stats['average_processing_time'] * (self.stats['successful_requests'] - 1) + 
                         processing_time) / self.stats['successful_requests']
                    )
                
                # Aktif isteklerden kaldır
                if gpu_id in self.active_requests and request.request_id in self.active_requests[gpu_id]:
                    self.active_requests[gpu_id].remove(request.request_id)
                
                logger.info(f"İstek {request.request_id} başarıyla tamamlandı, GPU: {gpu_id}")
                
                return {
                    'request_id': request.request_id,
                    'status': request.status,
                    'result': result
                }
                
            except Exception as e:
                # İşlem başarısız
                error_message = str(e)
                
                # Hata işleyici varsa hatayı işle
                if self.error_handler:
                    handled, action = await self.error_handler.handle_error(request, error_message)
                    if handled and action == 'retry':
                        # Yeniden deneme
                        self.stats['retried_requests'] += 1
                        return await self.route_request(request)
                
                # Hatayı kaydet
                request.status = 'failed'
                request.completion_time = datetime.now().isoformat()
                request.error = error_message
                
                # İstatistikleri güncelle
                self.stats['failed_requests'] += 1
                
                # Aktif isteklerden kaldır
                if gpu_id in self.active_requests and request.request_id in self.active_requests[gpu_id]:
                    self.active_requests[gpu_id].remove(request.request_id)
                
                logger.error(f"İstek {request.request_id} başarısız oldu, GPU: {gpu_id}, Hata: {error_message}")
                
                return {
                    'request_id': request.request_id,
                    'status': request.status,
                    'error': error_message
                }
        else:
            # Uygun GPU bulunamadı, isteği kuyruğa al
            request.status = 'queued'
            request.queue_position = len(self.request_queue) + 1
            
            # Kuyruğa ekle
            self.request_queue.append(request.request_id)
            
            logger.info(f"İstek {request.request_id} kuyruğa alındı, sıra: {request.queue_position}")
            
            return {
                'request_id': request.request_id,
                'status': request.status,
                'queue_position': request.queue_position
            }
            
    async def get_request_status(self, request_id):
        """
        İstek durumunu sorgula.
        
        Args:
            request_id: İstek ID'si
            
        Returns:
            İstek durumu
        """
        request = self.requests.get(request_id)
        
        if not request:
            return {
                'request_id': request_id,
                'status': 'not_found',
                'error': 'İstek bulunamadı'
            }
            
        # GPU'dan güncel durumu al (eğer işleniyorsa)
        if request.status == 'processing' and request.gpu_id:
            try:
                progress = await self._get_request_progress_from_gpu(request)
                request.progress = progress
            except Exception as e:
                logger.warning(f"İstek {request_id} ilerleme durumu alınamadı: {e}")
                
        return {
            'request_id': request.request_id,
            'user_id': request.user_id,
            'model_id': request.model_id,
            'status': request.status,
            'gpu_id': request.gpu_id,
            'submission_time': request.submission_time,
            'start_time': request.start_time,
            'completion_time': request.completion_time,
            'queue_position': request.queue_position,
            'progress': request.progress,
            'result': request.result,
            'error': request.error
        }
        
    async def cancel_request(self, request_id):
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
                'error': 'İstek bulunamadı'
            }
            
        # İstek zaten tamamlanmış veya başarısız olmuşsa iptal edilemez
        if request.status in ['completed', 'failed', 'cancelled']:
            return {
                'request_id': request_id,
                'status': request.status,
                'message': f'İstek zaten {request.status} durumunda'
            }
            
        # İstek kuyruktaysa kuyruktan çıkar
        if request.status == 'queued':
            if request_id in self.request_queue:
                self.request_queue.remove(request_id)
                
            # Kuyruk pozisyonlarını güncelle
            for i, queued_request_id in enumerate(self.request_queue):
                queued_request = self.requests.get(queued_request_id)
                if queued_request:
                    queued_request.queue_position = i + 1
                    
        # İstek işleniyorsa GPU'dan iptal et
        elif request.status == 'processing' and request.gpu_id:
            try:
                await self._cancel_request_on_gpu(request)
                
                # Aktif isteklerden kaldır
                if request.gpu_id in self.active_requests and request_id in self.active_requests[request.gpu_id]:
                    self.active_requests[request.gpu_id].remove(request_id)
            except Exception as e:
                logger.error(f"İstek {request_id} GPU'dan iptal edilemedi: {e}")
                
        # İsteği iptal edildi olarak işaretle
        request.status = 'cancelled'
        request.completion_time = datetime.now().isoformat()
        
        # İstatistikleri güncelle
        self.stats['cancelled_requests'] += 1
        
        logger.info(f"İstek {request_id} iptal edildi")
        
        return {
            'request_id': request_id,
            'status': 'cancelled',
            'message': 'İstek başarıyla iptal edildi'
        }
        
    async def get_stats(self):
        """
        İstek yönlendirici istatistiklerini al.
        
        Returns:
            İstatistikler
        """
        return self.stats
        
    async def _send_request_to_gpu(self, request):
        """
        İsteği GPU'ya gönder.
        
        Args:
            request: İstek
            
        Returns:
            İşlem sonucu
        """
        # Bu fonksiyon, gerçek uygulamada GPU'ya istek gönderecektir.
        # Bu prototipte, işlemi simüle ediyoruz.
        
        # İşlem süresini simüle et
        expected_duration = request.resource_requirements.get('expected_duration', 1000)
        await asyncio.sleep(expected_duration / 1000)  # ms -> s
        
        # Sonuç döndür
        return {
            'success': True,
            'message': 'İşlem tamamlandı',
            'data': {
                'model_id': request.model_id,
                'type': request.type,
                'timestamp': datetime.now().isoformat()
            }
        }
        
    async def _get_request_progress_from_gpu(self, request):
        """
        İsteğin GPU'daki ilerleme durumunu al.
        
        Args:
            request: İstek
            
        Returns:
            İlerleme durumu (0.0 - 1.0)
        """
        # Bu fonksiyon, gerçek uygulamada GPU'dan ilerleme durumunu alacaktır.
        # Bu prototipte, ilerleme durumunu simüle ediyoruz.
        
        # İşlem başlangıç zamanı
        if not request.start_time:
            return 0.0
            
        start_time = datetime.fromisoformat(request.start_time)
        now = datetime.now()
        
        # Geçen süre
        elapsed_time = (now - start_time).total_seconds() * 1000  # ms
        
        # Beklenen süre
        expected_duration = request.resource_requirements.get('expected_duration', 1000)  # ms
        
        # İlerleme durumu
        progress = min(elapsed_time / expected_duration, 1.0)
        
        return progress
        
    async def _cancel_request_on_gpu(self, request):
        """
        İsteği GPU'da iptal et.
        
        Args:
            request: İstek
        """
        # Bu fonksiyon, gerçek uygulamada GPU'da isteği iptal edecektir.
        # Bu prototipte, iptal işlemini simüle ediyoruz.
        
        # İptal işlemini simüle et
        await asyncio.sleep(0.1)
        
    async def _cleanup_loop(self):
        """Periyodik temizleme döngüsü."""
        while True:
            try:
                # Tamamlanmış veya başarısız olmuş eski istekleri temizle
                now = datetime.now()
                to_remove = []
                
                for request_id, request in self.requests.items():
                    if request.status in ['completed', 'failed', 'cancelled']:
                        if request.completion_time:
                            completion_time = datetime.fromisoformat(request.completion_time)
                            # 1 saatten eski istekleri temizle
                            if (now - completion_time).total_seconds() > 3600:
                                to_remove.append(request_id)
                                
                # İstekleri temizle
                for request_id in to_remove:
                    del self.requests[request_id]
                    
                if to_remove:
                    logger.info(f"{len(to_remove)} eski istek temizlendi")
                    
                # Zaman aşımına uğramış istekleri kontrol et
                for request_id, request in self.requests.items():
                    if request.status in ['pending', 'queued', 'processing']:
                        if request.is_expired():
                            # İsteği iptal et
                            await self.cancel_request(request_id)
                            logger.warning(f"İstek {request_id} zaman aşımına uğradı ve iptal edildi")
                            
                # Her 5 dakikada bir çalış
                await asyncio.sleep(300)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Temizleme döngüsünde hata: {e}")
                await asyncio.sleep(300)
                
    async def _queue_processing_loop(self):
        """Periyodik kuyruk işleme döngüsü."""
        while True:
            try:
                # Kuyruktaki istekleri işle
                if self.request_queue:
                    # Kuyruğun başındaki isteği al
                    request_id = self.request_queue[0]
                    request = self.requests.get(request_id)
                    
                    if request and request.status == 'queued':
                        # En uygun GPU'yu seç
                        gpu_id = await self.load_balancer.select_gpu(request)
                        
                        if gpu_id:
                            # GPU bulundu, isteği kuyruktan çıkar
                            self.request_queue.pop(0)
                            
                            # Kuyruk pozisyonlarını güncelle
                            for i, queued_request_id in enumerate(self.request_queue):
                                queued_request = self.requests.get(queued_request_id)
                                if queued_request:
                                    queued_request.queue_position = i + 1
                                    
                            # İsteği yönlendir
                            await self.route_request(request)
                            
                # Her 1 saniyede bir çalış
                await asyncio.sleep(1)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Kuyruk işleme döngüsünde hata: {e}")
                await asyncio.sleep(1)
