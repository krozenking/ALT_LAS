"""
AI Orchestrator Servisi için Locust Yük Testi Scripti

Bu script, AI Orchestrator servisinin performansını test etmek için kullanılır.
Farklı API endpoint'lerine istekler göndererek servisin yanıt sürelerini ve
kapasitesini ölçer.

Kullanım:
    locust -f ai_orchestrator_locustfile.py --host=http://ai-orchestrator:8080
"""

import json
import random
import time
import uuid
from locust import HttpUser, task, between, events, TaskSet


class ModelOperations(TaskSet):
    """Model yönetimi ile ilgili işlemleri test eden task seti"""
    
    @task(1)
    def get_models_info(self):
        """Mevcut modellerin bilgilerini alır"""
        with self.client.get("/api/models/info", name="Get Models Info", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to get models info: {response.status_code}, {response.text}")
    
    @task(2)
    def get_model_status(self):
        """Belirli bir modelin durumunu sorgular"""
        model_ids = ["gpt-3.5-turbo", "llama-2-7b", "stable-diffusion-v1.5"]
        model_id = random.choice(model_ids)
        
        with self.client.get(f"/api/models/{model_id}/status", name="Get Model Status", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to get model status: {response.status_code}, {response.text}")
    
    @task(1)
    def load_model(self):
        """Model yükleme isteği gönderir"""
        model_ids = ["gpt-3.5-turbo", "llama-2-7b", "stable-diffusion-v1.5"]
        model_id = random.choice(model_ids)
        
        payload = {
            "model_id": model_id,
            "options": {
                "use_gpu": True,
                "precision": "fp16"
            }
        }
        
        with self.client.post("/api/models/load", json=payload, name="Load Model", catch_response=True) as response:
            if response.status_code != 200 and response.status_code != 202:
                response.failure(f"Failed to load model: {response.status_code}, {response.text}")


class LLMProcessing(TaskSet):
    """LLM işleme ile ilgili işlemleri test eden task seti"""
    
    def get_random_text(self):
        """Farklı uzunluklarda rastgele metin örnekleri döndürür"""
        text_samples = [
            "Bu kısa bir metin örneğidir.",
            "Bu orta uzunlukta bir metin örneğidir. Birkaç cümle içerir ve LLM tarafından işlenecektir.",
            "Bu uzun bir metin örneğidir. " + "Lorem ipsum dolor sit amet. " * 10
        ]
        return random.choice(text_samples)
    
    @task(5)
    def process_llm(self):
        """LLM işleme isteği gönderir"""
        text = self.get_random_text()
        
        payload = {
            "input": text,
            "parameters": {
                "max_tokens": random.choice([50, 100, 200]),
                "temperature": random.uniform(0.5, 0.9),
                "top_p": 0.9
            }
        }
        
        start_time = time.time()
        with self.client.post("/api/llm", json=payload, name="Process LLM", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to process LLM: {response.status_code}, {response.text}")
            else:
                processing_time = time.time() - start_time
                events.request.fire(
                    request_type="CUSTOM",
                    name="LLM Processing Time",
                    response_time=processing_time * 1000,  # ms cinsinden
                    response_length=len(response.text),
                    exception=None,
                )
    
    @task(2)
    def process_llm_batch(self):
        """Toplu LLM işleme isteği gönderir"""
        texts = [self.get_random_text() for _ in range(3)]
        
        payload = {
            "inputs": texts,
            "parameters": {
                "max_tokens": 100,
                "temperature": 0.7
            }
        }
        
        with self.client.post("/api/inference/batch", json=payload, name="Process LLM Batch", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to process LLM batch: {response.status_code}, {response.text}")


class VisionProcessing(TaskSet):
    """Görüntü işleme ile ilgili işlemleri test eden task seti"""
    
    @task
    def process_vision(self):
        """Görüntü işleme isteği gönderir (simülasyon)"""
        # Gerçek bir görüntü yerine base64 kodlanmış veri gönderiyormuş gibi simüle ediyoruz
        payload = {
            "image": "base64_encoded_image_data_placeholder",
            "parameters": {
                "model": "vision-model",
                "task": random.choice(["classification", "object_detection", "segmentation"])
            }
        }
        
        with self.client.post("/api/vision", json=payload, name="Process Vision", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to process vision: {response.status_code}, {response.text}")


class AIOrchestrator(HttpUser):
    """AI Orchestrator servisini test eden kullanıcı sınıfı"""
    
    # Kullanıcı işlemleri arasında 1-5 saniye bekler
    wait_time = between(1, 5)
    
    # Kullanıcı başlatıldığında çalışacak metot
    def on_start(self):
        """Kullanıcı oturumu başlatıldığında çalışır"""
        # API anahtarı veya token alınabilir
        self.client.headers = {
            "Content-Type": "application/json",
            "X-Request-ID": str(uuid.uuid4()),
            "Authorization": "Bearer test-token"
        }
    
    # Kullanıcının yapabileceği görevler
    tasks = {
        LLMProcessing: 6,  # LLM işleme görevleri daha sık yapılır
        ModelOperations: 2,
        VisionProcessing: 1
    }


# Test olayları için dinleyiciler
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Test başladığında çalışır"""
    print("AI Orchestrator yük testi başlatılıyor...")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Test bittiğinde çalışır"""
    print("AI Orchestrator yük testi tamamlandı.")


# Başarılı istekler için dinleyici
@events.request_success.add_listener
def on_request_success(request_type, name, response_time, response_length, **kwargs):
    """Başarılı istekler için çalışır"""
    if request_type == "CUSTOM" and name == "LLM Processing Time":
        print(f"LLM işleme süresi: {response_time:.2f} ms")


# Başarısız istekler için dinleyici
@events.request_failure.add_listener
def on_request_failure(request_type, name, response_time, exception, **kwargs):
    """Başarısız istekler için çalışır"""
    print(f"Hata: {name} - {exception}")


if __name__ == "__main__":
    print("Bu script doğrudan çalıştırılmamalıdır. Locust ile çalıştırın:")
    print("locust -f ai_orchestrator_locustfile.py --host=http://ai-orchestrator:8080")
