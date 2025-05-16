"""
GPU İstek Yönlendirme Katmanı API Rotaları

Bu modül, GPU İstek Yönlendirme Katmanı API'si için FastAPI rotalarını içerir.
"""

import asyncio
import logging
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple

from fastapi import APIRouter, HTTPException, Depends, Header, Query, Path, Body, status
from fastapi.responses import JSONResponse

# API veri modellerini içe aktar
from api_models import (
    RequestModel, BatchRequestModel, RequestStatusModel, GPUStateModel,
    MetricsModel, UserQuotaModel
)

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api_routes")

# Router oluştur
router = APIRouter()

# Bileşenleri tanımla (bunlar dışarıdan enjekte edilecek)
request_receiver = None
request_router = None
gpu_state_monitor = None
error_handler = None
user_quota_manager = None

# Bileşenleri ayarla
def setup_components(
    _request_receiver,
    _request_router,
    _gpu_state_monitor,
    _error_handler,
    _user_quota_manager
):
    """
    Bileşenleri ayarla.
    
    Args:
        _request_receiver: İstek Alıcı
        _request_router: İstek Yönlendirici
        _gpu_state_monitor: GPU Durum İzleyici
        _error_handler: Hata İşleyici
        _user_quota_manager: Kullanıcı Kota Yöneticisi
    """
    global request_receiver, request_router, gpu_state_monitor, error_handler, user_quota_manager
    
    request_receiver = _request_receiver
    request_router = _request_router
    gpu_state_monitor = _gpu_state_monitor
    error_handler = _error_handler
    user_quota_manager = _user_quota_manager

# API rotaları
@router.post("/api/v1/route", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def route_request(request_data: RequestModel):
    """
    İsteği yönlendir.
    
    Args:
        request_data: İstek verileri
        
    Returns:
        Yönlendirme sonucu
    """
    # Kullanıcı kotasını kontrol et
    is_allowed, reason = await user_quota_manager.check_quota(request_data.user_id, request_data)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Quota exceeded: {reason}"
        )
        
    # İsteği işle
    request, error = await request_receiver.process_request(request_data.dict())
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
        
    # İsteği yönlendir
    result = await request_router.route_request(request)
    
    # Kullanıcı kotasını güncelle
    await user_quota_manager.update_quota(
        request_data.user_id,
        gpu_usage=1 if result.get('gpu_id') else 0,
        request_count=1
    )
    
    return result

@router.post("/api/v1/route/batch", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def route_batch_request(batch_data: BatchRequestModel):
    """
    Toplu isteği yönlendir.
    
    Args:
        batch_data: Toplu istek verileri
        
    Returns:
        Yönlendirme sonucu
    """
    # Batch ID oluştur
    batch_id = batch_data.batch_id or str(uuid.uuid4())
    
    # Her istek için kullanıcı kotasını kontrol et
    for request_data in batch_data.requests:
        is_allowed, reason = await user_quota_manager.check_quota(batch_data.user_id, request_data)
        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Quota exceeded for request {request_data.model_id}: {reason}"
            )
            
    # İstekleri işle ve yönlendir
    request_ids = []
    for request_data in batch_data.requests:
        # Callback URL'yi batch callback URL ile değiştir
        request_data_dict = request_data.dict()
        request_data_dict['callback_url'] = batch_data.callback_url
        
        # İsteği işle
        request, error = await request_receiver.process_request(request_data_dict)
        if error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid request {request_data.model_id}: {error}"
            )
            
        # İsteği yönlendir
        result = await request_router.route_request(request)
        request_ids.append(result['request_id'])
        
    # Kullanıcı kotasını güncelle
    await user_quota_manager.update_quota(
        batch_data.user_id,
        request_count=len(batch_data.requests)
    )
    
    # Tahmini başlangıç ve bitiş zamanlarını hesapla
    now = datetime.now()
    estimated_start_time = now.isoformat()
    estimated_completion_time = (now + timedelta(milliseconds=batch_data.timeout)).isoformat()
    
    return {
        'batch_id': batch_id,
        'status': 'pending',
        'request_ids': request_ids,
        'estimated_start_time': estimated_start_time,
        'estimated_completion_time': estimated_completion_time
    }

@router.get("/api/v1/requests/{request_id}", response_model=RequestStatusModel, status_code=status.HTTP_200_OK)
async def get_request_status(request_id: str):
    """
    İstek durumunu sorgula.
    
    Args:
        request_id: İstek ID'si
        
    Returns:
        İstek durumu
    """
    status = await request_router.get_request_status(request_id)
    if not status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request not found: {request_id}"
        )
        
    return status

@router.delete("/api/v1/requests/{request_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def cancel_request(request_id: str):
    """
    İsteği iptal et.
    
    Args:
        request_id: İstek ID'si
        
    Returns:
        İptal sonucu
    """
    result = await request_router.cancel_request(request_id)
    if result['status'] == 'not_found':
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request not found: {request_id}"
        )
        
    return result

@router.get("/api/v1/gpus", response_model=Dict[str, List[GPUStateModel]], status_code=status.HTTP_200_OK)
async def get_gpus():
    """
    Tüm GPU'ların durumunu al.
    
    Returns:
        GPU durumları
    """
    gpu_states = await gpu_state_monitor.get_gpu_states()
    return {
        'gpus': [GPUStateModel(**state.to_dict()) for state in gpu_states.values()]
    }

@router.get("/api/v1/gpus/{gpu_id}", response_model=GPUStateModel, status_code=status.HTTP_200_OK)
async def get_gpu(gpu_id: str):
    """
    Belirli bir GPU'nun durumunu al.
    
    Args:
        gpu_id: GPU ID'si
        
    Returns:
        GPU durumu
    """
    gpu_state = await gpu_state_monitor.get_gpu_state(gpu_id)
    if not gpu_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GPU not found: {gpu_id}"
        )
        
    return GPUStateModel(**gpu_state.to_dict())

@router.get("/api/v1/metrics", response_model=MetricsModel, status_code=status.HTTP_200_OK)
async def get_metrics():
    """
    Sistem metriklerini al.
    
    Returns:
        Metrikler
    """
    # GPU durumlarını al
    gpu_states = await gpu_state_monitor.get_gpu_states()
    
    # İstek yönlendirici istatistiklerini al
    router_stats = await request_router.get_stats()
    
    # Hata işleyici istatistiklerini al
    error_stats = await error_handler.get_stats()
    
    # Kullanıcı kota yöneticisi istatistiklerini al
    quota_stats = await user_quota_manager.get_stats()
    
    # GPU kullanım oranlarını hesapla
    gpu_utilization = {}
    for gpu_id, state in gpu_states.items():
        gpu_utilization[gpu_id] = {
            'memory_utilization': state.memory_used / state.memory_total if state.memory_total > 0 else 0,
            'compute_utilization': state.utilization,
            'temperature': state.temperature,
            'active_requests': len(state.active_requests),
            'queued_requests': state.queued_requests
        }
        
    # Kullanıcı metriklerini hesapla (gerçek uygulamada daha detaylı olacaktır)
    user_metrics = {}
    
    return {
        'timestamp': datetime.now().isoformat(),
        'total_requests': router_stats['total_requests'],
        'active_requests': router_stats['routed_requests'] - router_stats['completed_requests'] - router_stats['failed_requests'] - router_stats['cancelled_requests'],
        'completed_requests': router_stats['completed_requests'],
        'failed_requests': router_stats['failed_requests'],
        'average_response_time': router_stats['avg_processing_time'] * 1000,  # saniye -> ms
        'p95_response_time': 0.0,  # Gerçek uygulamada hesaplanacak
        'p99_response_time': 0.0,  # Gerçek uygulamada hesaplanacak
        'gpu_utilization': gpu_utilization,
        'user_metrics': user_metrics
    }

@router.get("/api/v1/quotas", response_model=Dict[str, List[UserQuotaModel]], status_code=status.HTTP_200_OK)
async def get_quotas():
    """
    Tüm kullanıcı kotalarını al.
    
    Returns:
        Kullanıcı kotaları
    """
    quotas = await user_quota_manager.get_all_quotas()
    return {
        'quotas': [UserQuotaModel(**quota) for quota in quotas.values()]
    }

@router.get("/api/v1/quotas/{user_id}", response_model=UserQuotaModel, status_code=status.HTTP_200_OK)
async def get_quota(user_id: str):
    """
    Belirli bir kullanıcının kotasını al.
    
    Args:
        user_id: Kullanıcı ID'si
        
    Returns:
        Kullanıcı kotası
    """
    quota = await user_quota_manager.get_quota(user_id)
    return UserQuotaModel(**quota.to_dict())

@router.put("/api/v1/quotas/{user_id}", response_model=UserQuotaModel, status_code=status.HTTP_200_OK)
async def set_quota(user_id: str, quota_data: Dict[str, Any]):
    """
    Belirli bir kullanıcının kotasını ayarla.
    
    Args:
        user_id: Kullanıcı ID'si
        quota_data: Kota verileri
        
    Returns:
        Güncellenmiş kullanıcı kotası
    """
    await user_quota_manager.set_quota(user_id, **quota_data)
    quota = await user_quota_manager.get_quota(user_id)
    return UserQuotaModel(**quota.to_dict())

@router.delete("/api/v1/quotas/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def reset_quota(user_id: str):
    """
    Belirli bir kullanıcının kotasını sıfırla.
    
    Args:
        user_id: Kullanıcı ID'si
    """
    await user_quota_manager.reset_quota(user_id)
    return None
