"""
Örnek FastAPI Uygulaması

Bu modül, API Meta Veri Tasarımı'nın FastAPI ile nasıl kullanılacağını
gösteren örnek bir uygulama içerir.

Çalıştırma:
    uvicorn example_fastapi_app:app --reload
"""

import time
import random
import logging
from typing import Dict, Any, List, Optional

import torch
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, Request
from pydantic import BaseModel

from gpu_metadata_collector import gpu_metrics_collector, MetricsTracer, configure_metadata_collection
from api_middleware import MetadataMiddleware

# Loglama
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI uygulaması
app = FastAPI(
    title="API Meta Veri Örnek Uygulaması",
    description="GPU kaynak kullanımı ve işlem süresi meta verilerini içeren örnek API",
    version="0.1.0"
)

# Meta veri middleware'ini ekle
app.add_middleware(MetadataMiddleware)

# Meta veri yapılandırması
configure_metadata_collection({
    "detail_level": "full",
    "sampling_rate": 1.0
})


# Veri modelleri
class PredictionRequest(BaseModel):
    """Tahmin isteği modeli."""
    
    text: str
    max_length: Optional[int] = 100
    temperature: Optional[float] = 0.7


class PredictionResponse(BaseModel):
    """Tahmin yanıtı modeli."""
    
    generated_text: str
    tokens: int
    model_used: str


# Bağımlılıklar
async def get_model():
    """
    Model bağımlılığı.
    
    Returns:
        Dummy model
    """
    # Gerçek bir model yerine dummy bir model
    return {"name": "dummy-gpt", "type": "transformer"}


# API endpoint'leri
@app.get("/")
async def root():
    """Kök endpoint."""
    return {"message": "API Meta Veri Örnek Uygulaması"}


@app.get("/health")
async def health_check():
    """Sağlık kontrolü endpoint'i."""
    return {"status": "ok"}


@app.post("/api/v1/predict", response_model=PredictionResponse)
@gpu_metrics_collector
async def predict(request: PredictionRequest, model: Dict[str, Any] = Depends(get_model)):
    """
    Metin tahmin endpoint'i.
    
    Args:
        request: Tahmin isteği
        model: Model bağımlılığı
        
    Returns:
        Tahmin yanıtı
    """
    # Ön işleme
    with MetricsTracer.span("preprocessing"):
        logger.info(f"Processing prediction request: {request.text[:20]}...")
        # Ön işleme simülasyonu
        time.sleep(0.1)
    
    # Model çıkarımı
    with MetricsTracer.span("inference"):
        # GPU kullanımı simülasyonu
        if torch.cuda.is_available():
            # Rastgele boyutlu tensörler oluştur
            batch_size = 1
            seq_length = len(request.text)
            hidden_size = 768
            
            # GPU'da tensörler oluştur
            input_tensor = torch.randn(batch_size, seq_length, hidden_size, device="cuda")
            dummy_model = torch.nn.Linear(hidden_size, hidden_size).to("cuda")
            
            # Çıkarım simülasyonu
            for _ in range(5):
                output = dummy_model(input_tensor)
                output = torch.nn.functional.relu(output)
            
            # Temizlik
            del input_tensor, dummy_model, output
            torch.cuda.empty_cache()
        
        # Çıkarım süresi simülasyonu
        time.sleep(0.3 + random.random() * 0.2)
        
        # Dummy yanıt oluştur
        tokens = len(request.text.split()) + random.randint(10, 50)
        generated_text = f"Bu bir örnek yanıttır. Giriş metni: '{request.text[:30]}...' için üretilmiştir."
    
    # Son işleme
    with MetricsTracer.span("postprocessing"):
        # Son işleme simülasyonu
        time.sleep(0.05)
        
        response = PredictionResponse(
            generated_text=generated_text,
            tokens=tokens,
            model_used=model["name"]
        )
    
    return response


@app.get("/api/v1/models")
@gpu_metrics_collector
async def list_models():
    """
    Modelleri listeleyen endpoint.
    
    Returns:
        Model listesi
    """
    # İşlem simülasyonu
    time.sleep(0.1)
    
    return {
        "models": [
            {"id": "dummy-gpt", "type": "transformer", "size": "7B"},
            {"id": "dummy-bert", "type": "encoder", "size": "base"},
            {"id": "dummy-t5", "type": "encoder-decoder", "size": "large"}
        ]
    }


@app.get("/api/v1/gpu/status")
async def gpu_status():
    """
    GPU durumunu döndüren endpoint.
    
    Returns:
        GPU durumu
    """
    from gpu_metadata_collector import collect_gpu_metrics
    
    return {
        "status": "ok",
        "gpu_info": collect_gpu_metrics()
    }


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    İşlem süresini HTTP başlığına ekleyen middleware.
    
    Args:
        request: HTTP isteği
        call_next: Sonraki middleware
        
    Returns:
        HTTP yanıtı
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Uygulama başlatma olayı
@app.on_event("startup")
async def startup_event():
    """Uygulama başlatma olayı."""
    logger.info("Starting API Meta Veri Örnek Uygulaması")
    
    # GPU kullanılabilirliğini kontrol et
    if torch.cuda.is_available():
        device_count = torch.cuda.device_count()
        logger.info(f"GPU available: {device_count} device(s)")
        
        for i in range(device_count):
            logger.info(f"  Device {i}: {torch.cuda.get_device_name(i)}")
    else:
        logger.warning("No GPU available, running in CPU mode")


# Uygulama kapatma olayı
@app.on_event("shutdown")
async def shutdown_event():
    """Uygulama kapatma olayı."""
    logger.info("Shutting down API Meta Veri Örnek Uygulaması")
    
    # GPU belleğini temizle
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


# Doğrudan çalıştırma
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
