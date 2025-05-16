"""
GPU İstek Yönlendirme Katmanı API Veri Modelleri

Bu modül, GPU İstek Yönlendirme Katmanı API'si için Pydantic veri modellerini içerir.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ResourceRequirements(BaseModel):
    """Kaynak gereksinimleri modeli."""
    
    memory: int = Field(0, description="Gerekli bellek miktarı (MB)")
    compute_units: int = Field(0, description="Gerekli işlem gücü")
    max_batch_size: int = Field(1, description="Maksimum batch boyutu")
    expected_duration: int = Field(1000, description="Tahmini işlem süresi (ms)")

class RequestModel(BaseModel):
    """İstek modeli."""
    
    request_id: Optional[str] = Field(None, description="İstek ID'si (otomatik oluşturulabilir)")
    user_id: str = Field(..., description="Kullanıcı ID'si")
    model_id: str = Field(..., description="Model ID'si")
    priority: int = Field(3, description="İstek önceliği (1-5)")
    type: str = Field("inference", description="İstek türü (inference, training, fine-tuning)")
    resource_requirements: ResourceRequirements = Field(default_factory=ResourceRequirements, description="Kaynak gereksinimleri")
    timeout: int = Field(30000, description="Zaman aşımı (ms)")
    callback_url: Optional[str] = Field(None, description="Callback URL")
    payload: Dict[str, Any] = Field(default_factory=dict, description="İstek yükü")

class BatchRequestModel(BaseModel):
    """Toplu istek modeli."""
    
    batch_id: Optional[str] = Field(None, description="Batch ID'si (otomatik oluşturulabilir)")
    user_id: str = Field(..., description="Kullanıcı ID'si")
    requests: List[RequestModel] = Field(..., description="İstekler")
    timeout: int = Field(60000, description="Zaman aşımı (ms)")
    callback_url: Optional[str] = Field(None, description="Callback URL")

class RequestStatusModel(BaseModel):
    """İstek durumu modeli."""
    
    request_id: str = Field(..., description="İstek ID'si")
    user_id: str = Field(..., description="Kullanıcı ID'si")
    model_id: str = Field(..., description="Model ID'si")
    status: str = Field(..., description="İstek durumu")
    gpu_id: Optional[str] = Field(None, description="GPU ID'si")
    submission_time: str = Field(..., description="Gönderim zamanı")
    start_time: Optional[str] = Field(None, description="Başlangıç zamanı")
    completion_time: Optional[str] = Field(None, description="Tamamlanma zamanı")
    queue_position: int = Field(0, description="Kuyruk pozisyonu")
    progress: float = Field(0.0, description="İlerleme (0-1)")
    result: Optional[Dict[str, Any]] = Field(None, description="Sonuç")
    error: Optional[str] = Field(None, description="Hata")

class GPUProcessModel(BaseModel):
    """GPU işlemi modeli."""
    
    pid: int = Field(..., description="İşlem ID'si")
    name: str = Field(..., description="İşlem adı")
    memory_used: int = Field(..., description="Kullanılan bellek (byte)")

class GPURequestModel(BaseModel):
    """GPU isteği modeli."""
    
    request_id: str = Field(..., description="İstek ID'si")
    user_id: str = Field(..., description="Kullanıcı ID'si")
    model_id: str = Field(..., description="Model ID'si")
    start_time: str = Field(..., description="Başlangıç zamanı")
    progress: float = Field(..., description="İlerleme (0-1)")

class GPUStateModel(BaseModel):
    """GPU durumu modeli."""
    
    gpu_id: str = Field(..., description="GPU ID'si")
    name: str = Field(..., description="GPU adı")
    status: str = Field(..., description="GPU durumu")
    compute_capability: str = Field(..., description="Hesaplama kapasitesi")
    memory_total: int = Field(..., description="Toplam bellek (byte)")
    memory_used: int = Field(..., description="Kullanılan bellek (byte)")
    memory_free: int = Field(..., description="Boş bellek (byte)")
    utilization: float = Field(..., description="Kullanım oranı (0-1)")
    temperature: float = Field(..., description="Sıcaklık (Celsius)")
    power_usage: float = Field(..., description="Güç tüketimi (Watt)")
    power_limit: float = Field(..., description="Güç limiti (Watt)")
    active_requests: List[GPURequestModel] = Field(default_factory=list, description="Aktif istekler")
    queued_requests: int = Field(0, description="Kuyrukta bekleyen istek sayısı")
    performance_index: float = Field(..., description="Performans indeksi (0-1)")
    error_rate: float = Field(..., description="Hata oranı (0-1)")
    uptime: int = Field(..., description="Çalışma süresi (saniye)")
    processes: List[GPUProcessModel] = Field(default_factory=list, description="İşlemler")

class UserMetricsModel(BaseModel):
    """Kullanıcı metrikleri modeli."""
    
    total_requests: int = Field(..., description="Toplam istek sayısı")
    active_requests: int = Field(..., description="Aktif istek sayısı")
    completed_requests: int = Field(..., description="Tamamlanan istek sayısı")
    failed_requests: int = Field(..., description="Başarısız istek sayısı")
    average_response_time: float = Field(..., description="Ortalama yanıt süresi (ms)")
    gpu_usage: float = Field(..., description="GPU kullanımı (0-1)")

class GPUUtilizationModel(BaseModel):
    """GPU kullanım oranları modeli."""
    
    memory_utilization: float = Field(..., description="Bellek kullanım oranı (0-1)")
    compute_utilization: float = Field(..., description="İşlem gücü kullanım oranı (0-1)")
    temperature: float = Field(..., description="Sıcaklık (Celsius)")
    active_requests: int = Field(..., description="Aktif istek sayısı")
    queued_requests: int = Field(..., description="Kuyrukta bekleyen istek sayısı")

class MetricsModel(BaseModel):
    """Metrikler modeli."""
    
    timestamp: str = Field(..., description="Zaman damgası")
    total_requests: int = Field(..., description="Toplam istek sayısı")
    active_requests: int = Field(..., description="Aktif istek sayısı")
    completed_requests: int = Field(..., description="Tamamlanan istek sayısı")
    failed_requests: int = Field(..., description="Başarısız istek sayısı")
    average_response_time: float = Field(..., description="Ortalama yanıt süresi (ms)")
    p95_response_time: float = Field(..., description="P95 yanıt süresi (ms)")
    p99_response_time: float = Field(..., description="P99 yanıt süresi (ms)")
    gpu_utilization: Dict[str, GPUUtilizationModel] = Field(default_factory=dict, description="GPU kullanım oranları")
    user_metrics: Dict[str, UserMetricsModel] = Field(default_factory=dict, description="Kullanıcı metrikleri")

class UserQuotaModel(BaseModel):
    """Kullanıcı kotası modeli."""
    
    user_id: str = Field(..., description="Kullanıcı ID'si")
    gpu_limit: int = Field(..., description="GPU limiti")
    gpu_usage: int = Field(..., description="GPU kullanımı")
    request_limit: int = Field(..., description="İstek limiti")
    request_count: int = Field(..., description="İstek sayısı")
    priority_limit: int = Field(..., description="Öncelik limiti")
    expiration_time: Optional[str] = Field(None, description="Bitiş zamanı")
