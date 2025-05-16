"""
GPU İstek Yönlendirme Katmanı API Uygulaması

Bu modül, GPU İstek Yönlendirme Katmanı'nın API katmanını içerir.
FastAPI kullanılarak geliştirilmiştir.

Kullanım:
    # Uygulamayı başlat
    uvicorn api_app:app --host 0.0.0.0 --port 8000
"""

import asyncio
import logging
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid
import json

from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api_app")

# Yapılandırma
config = {
    'gpu_monitoring_url': 'http://gpu-monitoring-service:8080',
    'metrics_url': 'http://metrics-service:9090',
    'update_interval': 5,
    'health_check_interval': 60,
    'max_temperature': 85.0,
    'strategy': 'hybrid',
    'weights': {
        'usage': 0.4,
        'priority': 0.3,
        'performance': 0.2,
        'health': 0.1
    },
    'max_retries': 3,
    'retry_delay': 1.0,
    'error_threshold': 0.1,
    'error_window': 60,
    'default_gpu_limit': 2,
    'default_request_limit': 100,
    'default_priority_limit': 3,
    'quota_check_interval': 60,
    'validate_requests': True,
    'generate_request_id': True,
    'add_metadata': True
}

# Pydantic modelleri
class ResourceRequirements(BaseModel):
    memory: int = Field(0, description="Gerekli bellek miktarı (MB)")
    compute_units: int = Field(0, description="Gerekli işlem birimi sayısı")
    max_batch_size: int = Field(1, description="Maksimum batch boyutu")
    expected_duration: int = Field(1000, description="Tahmini işlem süresi (ms)")

class RouteRequest(BaseModel):
    request_id: Optional[str] = Field(None, description="İstek ID'si (opsiyonel)")
    user_id: str = Field(..., description="Kullanıcı ID'si")
    model_id: str = Field(..., description="Model ID'si")
    priority: int = Field(3, description="Öncelik seviyesi (1-5)")
    type: str = Field("inference", description="İstek türü (inference, training, fine-tuning)")
    resource_requirements: ResourceRequirements = Field(default_factory=ResourceRequirements, description="Kaynak gereksinimleri")
    timeout: int = Field(30000, description="Zaman aşımı süresi (ms)")
    callback_url: Optional[str] = Field(None, description="Callback URL'si (opsiyonel)")
    payload: Dict[str, Any] = Field(default_factory=dict, description="İstek verisi")

class BatchRouteRequest(BaseModel):
    batch_id: Optional[str] = Field(None, description="Batch ID'si (opsiyonel)")
    user_id: str = Field(..., description="Kullanıcı ID'si")
    requests: List[RouteRequest] = Field(..., description="İstekler")
    timeout: int = Field(60000, description="Zaman aşımı süresi (ms)")
    callback_url: Optional[str] = Field(None, description="Callback URL'si (opsiyonel)")

class RouteResponse(BaseModel):
    request_id: str = Field(..., description="İstek ID'si")
    status: str = Field(..., description="İstek durumu (pending, processing, queued, completed, failed)")
    gpu_id: Optional[str] = Field(None, description="GPU ID'si")
    estimated_start_time: Optional[str] = Field(None, description="Tahmini başlangıç zamanı")
    estimated_completion_time: Optional[str] = Field(None, description="Tahmini tamamlanma zamanı")
    queue_position: Optional[int] = Field(None, description="Kuyruk pozisyonu")
    error: Optional[str] = Field(None, description="Hata mesajı")

class BatchRouteResponse(BaseModel):
    batch_id: str = Field(..., description="Batch ID'si")
    status: str = Field(..., description="Batch durumu (pending, processing, completed, failed)")
    request_ids: List[str] = Field(..., description="İstek ID'leri")
    estimated_start_time: Optional[str] = Field(None, description="Tahmini başlangıç zamanı")
    estimated_completion_time: Optional[str] = Field(None, description="Tahmini tamamlanma zamanı")

class RequestStatusResponse(BaseModel):
    request_id: str = Field(..., description="İstek ID'si")
    user_id: str = Field(..., description="Kullanıcı ID'si")
    model_id: str = Field(..., description="Model ID'si")
    status: str = Field(..., description="İstek durumu (pending, processing, queued, completed, failed)")
    gpu_id: Optional[str] = Field(None, description="GPU ID'si")
    submission_time: str = Field(..., description="Gönderim zamanı")
    start_time: Optional[str] = Field(None, description="Başlangıç zamanı")
    completion_time: Optional[str] = Field(None, description="Tamamlanma zamanı")
    queue_position: Optional[int] = Field(None, description="Kuyruk pozisyonu")
    progress: float = Field(0.0, description="İlerleme durumu (0.0 - 1.0)")
    result: Optional[Dict[str, Any]] = Field(None, description="İşlem sonucu")
    error: Optional[str] = Field(None, description="Hata mesajı")

class CancelRequestResponse(BaseModel):
    request_id: str = Field(..., description="İstek ID'si")
    status: str = Field(..., description="İptal durumu (cancelled, not_found)")
    message: str = Field(..., description="Mesaj")

class GPUState(BaseModel):
    gpu_id: str = Field(..., description="GPU ID'si")
    name: str = Field(..., description="GPU adı")
    status: str = Field(..., description="GPU durumu (available, busy, error, maintenance)")
    compute_capability: str = Field(..., description="Compute capability")
    memory_total: int = Field(..., description="Toplam bellek (byte)")
    memory_used: int = Field(..., description="Kullanılan bellek (byte)")
    memory_free: int = Field(..., description="Boş bellek (byte)")
    utilization: float = Field(..., description="Kullanım oranı (0.0 - 1.0)")
    temperature: float = Field(..., description="Sıcaklık (Celsius)")
    power_usage: float = Field(..., description="Güç tüketimi (Watt)")
    power_limit: float = Field(..., description="Güç limiti (Watt)")
    active_requests: List[Dict[str, Any]] = Field(default_factory=list, description="Aktif istekler")
    queued_requests: int = Field(0, description="Kuyrukta bekleyen istek sayısı")
    performance_index: float = Field(..., description="Performans indeksi (0.0 - 1.0)")
    error_rate: float = Field(..., description="Hata oranı (0.0 - 1.0)")
    uptime: int = Field(..., description="Çalışma süresi (saniye)")

class GPUStatesResponse(BaseModel):
    gpus: List[GPUState] = Field(..., description="GPU'lar")

class MetricsResponse(BaseModel):
    timestamp: str = Field(..., description="Zaman damgası")
    total_requests: int = Field(..., description="Toplam istek sayısı")
    active_requests: int = Field(..., description="Aktif istek sayısı")
    completed_requests: int = Field(..., description="Tamamlanan istek sayısı")
    failed_requests: int = Field(..., description="Başarısız istek sayısı")
    average_response_time: float = Field(..., description="Ortalama yanıt süresi (ms)")
    p95_response_time: float = Field(..., description="P95 yanıt süresi (ms)")
    p99_response_time: float = Field(..., description="P99 yanıt süresi (ms)")
    gpu_utilization: Dict[str, Dict[str, Any]] = Field(..., description="GPU kullanım oranları")
    user_metrics: Dict[str, Dict[str, Any]] = Field(..., description="Kullanıcı metrikleri")

# Bileşenleri içe aktar
from request_receiver import Request, RequestReceiver
from gpu_state_monitor import GPUState as GPUStateClass, GPUStateMonitor
from load_balancer import LoadBalancer
from request_router import RequestRouter
from error_handler import ErrorHandler
from user_quota_manager import UserQuotaManager

# Uygulama oluştur
app = FastAPI(
    title="GPU İstek Yönlendirme Katmanı API",
    description="GPU İstek Yönlendirme Katmanı için API",
    version="1.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bileşenleri oluştur
gpu_state_monitor = GPUStateMonitor(config)
error_handler = ErrorHandler(config, gpu_state_monitor)
load_balancer = LoadBalancer(config, gpu_state_monitor)
request_receiver = RequestReceiver(config)
request_router = RequestRouter(config, load_balancer, error_handler)
user_quota_manager = UserQuotaManager(config)

# Bağımlılık enjeksiyonu
async def get_gpu_state_monitor():
    return gpu_state_monitor

async def get_error_handler():
    return error_handler

async def get_load_balancer():
    return load_balancer

async def get_request_receiver():
    return request_receiver

async def get_request_router():
    return request_router

async def get_user_quota_manager():
    return user_quota_manager

# Başlangıç ve sonlandırma olayları
@app.on_event("startup")
async def startup_event():
    logger.info("API uygulaması başlatılıyor...")
    
    # Bileşenleri başlat
    await gpu_state_monitor.start()
    await request_router.start()
    await user_quota_manager.start()
    
    logger.info("API uygulaması başlatıldı")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("API uygulaması durduruluyor...")
    
    # Bileşenleri durdur
    await gpu_state_monitor.stop()
    await request_router.stop()
    await user_quota_manager.stop()
    
    logger.info("API uygulaması durduruldu")

# API rotaları
@app.post("/api/v1/route", response_model=RouteResponse)
async def route_request(
    request_data: RouteRequest,
    request_receiver: RequestReceiver = Depends(get_request_receiver),
    request_router: RequestRouter = Depends(get_request_router),
    user_quota_manager: UserQuotaManager = Depends(get_user_quota_manager)
):
    # İsteği işle
    request, error_message = await request_receiver.process_request(request_data.dict())
    
    if not request:
        raise HTTPException(status_code=400, detail=error_message)
        
    # Kullanıcı kotasını kontrol et
    allowed, reason = await user_quota_manager.check_quota(request.user_id, request)
    
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)
        
    # İsteği yönlendir
    result = await request_router.route_request(request)
    
    # Kullanıcı kotasını güncelle
    await user_quota_manager.update_quota(request.user_id, gpu_usage=1, request_count=1)
    
    return result

@app.post("/api/v1/route/batch", response_model=BatchRouteResponse)
async def route_batch_request(
    batch_request: BatchRouteRequest,
    request_receiver: RequestReceiver = Depends(get_request_receiver),
    request_router: RequestRouter = Depends(get_request_router),
    user_quota_manager: UserQuotaManager = Depends(get_user_quota_manager)
):
    # Batch ID oluştur
    batch_id = batch_request.batch_id or str(uuid.uuid4())
    
    # İstekleri işle
    request_ids = []
    
    for request_data in batch_request.requests:
        # Kullanıcı ID'sini batch'ten al
        request_data.user_id = batch_request.user_id
        
        # İsteği işle
        request, error_message = await request_receiver.process_request(request_data.dict())
        
        if not request:
            continue
            
        # Kullanıcı kotasını kontrol et
        allowed, reason = await user_quota_manager.check_quota(request.user_id, request)
        
        if not allowed:
            continue
            
        # İsteği yönlendir
        result = await request_router.route_request(request)
        
        # İstek ID'sini ekle
        request_ids.append(result['request_id'])
        
    # Kullanıcı kotasını güncelle
    await user_quota_manager.update_quota(batch_request.user_id, gpu_usage=len(request_ids), request_count=len(request_ids))
    
    # Batch durumunu belirle
    status = "pending" if request_ids else "failed"
    
    return {
        "batch_id": batch_id,
        "status": status,
        "request_ids": request_ids,
        "estimated_start_time": datetime.now().isoformat() if request_ids else None,
        "estimated_completion_time": None
    }

@app.get("/api/v1/requests/{request_id}", response_model=RequestStatusResponse)
async def get_request_status(
    request_id: str,
    request_router: RequestRouter = Depends(get_request_router)
):
    # İstek durumunu sorgula
    result = await request_router.get_request_status(request_id)
    
    if result['status'] == 'not_found':
        raise HTTPException(status_code=404, detail="İstek bulunamadı")
        
    return result

@app.delete("/api/v1/requests/{request_id}", response_model=CancelRequestResponse)
async def cancel_request(
    request_id: str,
    request_router: RequestRouter = Depends(get_request_router),
    user_quota_manager: UserQuotaManager = Depends(get_user_quota_manager)
):
    # İsteği iptal et
    result = await request_router.cancel_request(request_id)
    
    if result['status'] == 'not_found':
        raise HTTPException(status_code=404, detail="İstek bulunamadı")
        
    # İptal edilen istek için kullanıcı kotasını güncelle
    if result['status'] == 'cancelled' and 'user_id' in result:
        await user_quota_manager.update_quota(result['user_id'], gpu_usage=-1, request_count=0)
        
    return result

@app.get("/api/v1/gpus", response_model=GPUStatesResponse)
async def get_gpu_states(
    gpu_state_monitor: GPUStateMonitor = Depends(get_gpu_state_monitor)
):
    # GPU durumlarını al
    gpu_states = await gpu_state_monitor.get_gpu_states()
    
    # GPU durumlarını dönüştür
    gpus = [state.to_dict() for state in gpu_states.values()]
    
    return {"gpus": gpus}

@app.get("/api/v1/gpus/{gpu_id}", response_model=GPUState)
async def get_gpu_state(
    gpu_id: str,
    gpu_state_monitor: GPUStateMonitor = Depends(get_gpu_state_monitor)
):
    # GPU durumunu al
    gpu_state = await gpu_state_monitor.get_gpu_state(gpu_id)
    
    if not gpu_state:
        raise HTTPException(status_code=404, detail="GPU bulunamadı")
        
    return gpu_state.to_dict()

@app.get("/api/v1/metrics", response_model=MetricsResponse)
async def get_metrics(
    request_router: RequestRouter = Depends(get_request_router),
    gpu_state_monitor: GPUStateMonitor = Depends(get_gpu_state_monitor),
    error_handler: ErrorHandler = Depends(get_error_handler),
    user_quota_manager: UserQuotaManager = Depends(get_user_quota_manager)
):
    # İstatistikleri al
    router_stats = await request_router.get_stats()
    error_stats = await error_handler.get_stats()
    quota_stats = await user_quota_manager.get_stats()
    
    # GPU durumlarını al
    gpu_states = await gpu_state_monitor.get_gpu_states()
    
    # GPU kullanım oranlarını hesapla
    gpu_utilization = {}
    
    for gpu_id, state in gpu_states.items():
        gpu_utilization[gpu_id] = {
            "memory_utilization": state.memory_used / state.memory_total if state.memory_total > 0 else 0,
            "compute_utilization": state.utilization,
            "temperature": state.temperature,
            "active_requests": len(state.active_requests),
            "queued_requests": state.queued_requests
        }
        
    # Kullanıcı metriklerini hesapla
    user_metrics = {}
    
    for user_id, stats in quota_stats['user_stats'].items():
        user_metrics[user_id] = {
            "total_requests": stats['allowed'] + stats['denied'],
            "allowed_requests": stats['allowed'],
            "denied_requests": stats['denied'],
            "average_response_time": router_stats['average_processing_time'] if 'average_processing_time' in router_stats else 0
        }
        
    # Metrikleri döndür
    return {
        "timestamp": datetime.now().isoformat(),
        "total_requests": router_stats['total_requests'],
        "active_requests": sum(len(requests) for requests in router_stats.get('active_requests', {}).values()),
        "completed_requests": router_stats.get('successful_requests', 0),
        "failed_requests": router_stats.get('failed_requests', 0),
        "average_response_time": router_stats.get('average_processing_time', 0) * 1000,  # s -> ms
        "p95_response_time": 0,  # Gerçek uygulamada hesaplanabilir
        "p99_response_time": 0,  # Gerçek uygulamada hesaplanabilir
        "gpu_utilization": gpu_utilization,
        "user_metrics": user_metrics
    }

# Ana uygulama
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
