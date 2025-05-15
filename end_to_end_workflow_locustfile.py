"""
Uçtan Uca İş Akışı için Locust Yük Testi Scripti

Bu script, ALT_LAS projesindeki uçtan uca iş akışlarını test etmek için kullanılır.
Segmentation Service ve AI Orchestrator servislerini birlikte kullanarak
gerçek kullanım senaryolarını simüle eder.

Kullanım:
    locust -f end_to_end_workflow_locustfile.py
"""

import json
import random
import time
import uuid
from locust import HttpUser, task, between, events


class EndToEndWorkflow(HttpUser):
    """Uçtan uca iş akışlarını test eden kullanıcı sınıfı"""
    
    # Kullanıcı işlemleri arasında 3-7 saniye bekler
    wait_time = between(3, 7)
    
    # Kullanıcı başlatıldığında çalışacak metot
    def on_start(self):
        """Kullanıcı oturumu başlatıldığında çalışır"""
        self.client.headers = {
            "Content-Type": "application/json",
            "X-Request-ID": str(uuid.uuid4()),
            "Authorization": "Bearer test-token"
        }
        
        # Servis URL'leri
        self.segmentation_url = "http://segmentation-service:8080"
        self.ai_orchestrator_url = "http://ai-orchestrator:8080"
    
    def get_random_text(self, length="medium"):
        """Belirtilen uzunlukta rastgele metin örnekleri döndürür"""
        short_text = "Bu kısa bir metin örneğidir."
        medium_text = "Bu orta uzunlukta bir metin örneğidir. Birkaç cümle içerir ve işlenecektir."
        long_text = "Bu uzun bir metin örneğidir. " + "Lorem ipsum dolor sit amet. " * 10
        
        if length == "short":
            return short_text
        elif length == "medium":
            return medium_text
        elif length == "long":
            return long_text
        else:
            return random.choice([short_text, medium_text, long_text])
    
    @task(3)
    def text_processing_workflow(self):
        """Metin işleme iş akışını test eder"""
        # İş akışı başlangıç zamanı
        workflow_start_time = time.time()
        
        # 1. Adım: Metin segmentasyonu
        text = self.get_random_text(random.choice(["medium", "long"]))
        
        segmentation_payload = {
            "text": text,
            "parameters": {
                "language": "tr",
                "mode": "normal",
                "persona": "researcher"
            }
        }
        
        segmentation_start_time = time.time()
        segmentation_response = self.client.post(
            f"{self.segmentation_url}/api/v1/segment",
            json=segmentation_payload,
            name="[Workflow] 1. Segment Text",
            catch_response=True
        )
        
        if segmentation_response.status_code != 200:
            segmentation_response.failure(f"Segmentation failed: {segmentation_response.status_code}, {segmentation_response.text}")
            return
        
        segmentation_time = time.time() - segmentation_start_time
        
        try:
            segmentation_result = segmentation_response.json()
            segments = segmentation_result.get("segments", [])
            
            if not segments:
                segmentation_response.failure("No segments returned from segmentation service")
                return
            
            # 2. Adım: LLM işleme
            # Segmentasyon sonucunu kullanarak LLM isteği oluştur
            llm_payload = {
                "input": segments[0].get("text", text),  # İlk segmenti kullan veya orijinal metni
                "parameters": {
                    "max_tokens": 100,
                    "temperature": 0.7
                }
            }
            
            llm_start_time = time.time()
            llm_response = self.client.post(
                f"{self.ai_orchestrator_url}/api/llm",
                json=llm_payload,
                name="[Workflow] 2. Process LLM",
                catch_response=True
            )
            
            if llm_response.status_code != 200:
                llm_response.failure(f"LLM processing failed: {llm_response.status_code}, {llm_response.text}")
                return
            
            llm_time = time.time() - llm_start_time
            
            # Toplam iş akışı süresi
            workflow_time = time.time() - workflow_start_time
            
            # Özel metrik olarak iş akışı süresini kaydet
            events.request.fire(
                request_type="CUSTOM",
                name="End-to-End Workflow Time",
                response_time=workflow_time * 1000,  # ms cinsinden
                response_length=0,
                exception=None,
            )
            
            # Adım sürelerini kaydet
            events.request.fire(
                request_type="CUSTOM",
                name="Segmentation Step Time",
                response_time=segmentation_time * 1000,  # ms cinsinden
                response_length=0,
                exception=None,
            )
            
            events.request.fire(
                request_type="CUSTOM",
                name="LLM Step Time",
                response_time=llm_time * 1000,  # ms cinsinden
                response_length=0,
                exception=None,
            )
            
        except json.JSONDecodeError:
            segmentation_response.failure("Invalid JSON response from segmentation service")
    
    @task(1)
    def alt_file_processing_workflow(self):
        """ALT dosyası işleme iş akışını test eder"""
        # İş akışı başlangıç zamanı
        workflow_start_time = time.time()
        
        # 1. Adım: ALT dosyası segmentasyonu
        alt_content = "ALT dosyası içeriği simülasyonu"
        
        alt_payload = {
            "alt_content": alt_content,
            "parameters": {
                "language": "tr",
                "mode": "normal",
                "persona": "technical_expert"
            }
        }
        
        alt_segmentation_start_time = time.time()
        alt_segmentation_response = self.client.post(
            f"{self.segmentation_url}/api/v1/segment/alt",
            json=alt_payload,
            name="[Workflow] 1. Segment ALT File",
            catch_response=True
        )
        
        if alt_segmentation_response.status_code != 200:
            alt_segmentation_response.failure(f"ALT segmentation failed: {alt_segmentation_response.status_code}, {alt_segmentation_response.text}")
            return
        
        alt_segmentation_time = time.time() - alt_segmentation_start_time
        
        try:
            alt_segmentation_result = alt_segmentation_response.json()
            segments = alt_segmentation_result.get("segments", [])
            
            if not segments:
                alt_segmentation_response.failure("No segments returned from ALT segmentation")
                return
            
            # 2. Adım: Görüntü işleme (simülasyon)
            vision_payload = {
                "image": "base64_encoded_image_data_placeholder",
                "parameters": {
                    "model": "vision-model",
                    "task": "classification"
                }
            }
            
            vision_start_time = time.time()
            vision_response = self.client.post(
                f"{self.ai_orchestrator_url}/api/vision",
                json=vision_payload,
                name="[Workflow] 2. Process Vision",
                catch_response=True
            )
            
            if vision_response.status_code != 200:
                vision_response.failure(f"Vision processing failed: {vision_response.status_code}, {vision_response.text}")
                return
            
            vision_time = time.time() - vision_start_time
            
            # Toplam iş akışı süresi
            workflow_time = time.time() - workflow_start_time
            
            # Özel metrik olarak iş akışı süresini kaydet
            events.request.fire(
                request_type="CUSTOM",
                name="ALT Workflow Time",
                response_time=workflow_time * 1000,  # ms cinsinden
                response_length=0,
                exception=None,
            )
            
        except json.JSONDecodeError:
            alt_segmentation_response.failure("Invalid JSON response from ALT segmentation service")


# Test olayları için dinleyiciler
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Test başladığında çalışır"""
    print("Uçtan uca iş akışı yük testi başlatılıyor...")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Test bittiğinde çalışır"""
    print("Uçtan uca iş akışı yük testi tamamlandı.")


# Başarılı istekler için dinleyici
@events.request_success.add_listener
def on_request_success(request_type, name, response_time, response_length, **kwargs):
    """Başarılı istekler için çalışır"""
    if request_type == "CUSTOM":
        if name == "End-to-End Workflow Time":
            print(f"Uçtan uca iş akışı süresi: {response_time:.2f} ms")
        elif name == "ALT Workflow Time":
            print(f"ALT iş akışı süresi: {response_time:.2f} ms")


# Başarısız istekler için dinleyici
@events.request_failure.add_listener
def on_request_failure(request_type, name, response_time, exception, **kwargs):
    """Başarısız istekler için çalışır"""
    print(f"Hata: {name} - {exception}")


if __name__ == "__main__":
    print("Bu script doğrudan çalıştırılmamalıdır. Locust ile çalıştırın:")
    print("locust -f end_to_end_workflow_locustfile.py")
