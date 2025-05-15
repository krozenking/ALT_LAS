"""
Segmentation Service için Locust Yük Testi Scripti

Bu script, Segmentation Service'in performansını test etmek için kullanılır.
Farklı API endpoint'lerine istekler göndererek servisin yanıt sürelerini ve
kapasitesini ölçer.

Kullanım:
    locust -f segmentation_service_locustfile.py --host=http://segmentation-service:8080
"""

import json
import random
import time
import uuid
from locust import HttpUser, task, between, events, TaskSet


class SegmentationOperations(TaskSet):
    """Metin segmentasyonu ile ilgili işlemleri test eden task seti"""
    
    def get_random_text(self, length="medium"):
        """Belirtilen uzunlukta rastgele metin örnekleri döndürür"""
        short_text = "Bu kısa bir metin örneğidir."
        medium_text = "Bu orta uzunlukta bir metin örneğidir. Birkaç cümle içerir ve segmentasyon servisi tarafından işlenecektir."
        long_text = "Bu uzun bir metin örneğidir. " + "Lorem ipsum dolor sit amet. " * 10
        
        if length == "short":
            return short_text
        elif length == "medium":
            return medium_text
        elif length == "long":
            return long_text
        else:
            return random.choice([short_text, medium_text, long_text])
    
    @task(5)
    def segment_text(self):
        """Metin segmentasyonu isteği gönderir"""
        text = self.get_random_text()
        
        payload = {
            "text": text,
            "parameters": {
                "language": random.choice(["tr", "en"]),
                "mode": random.choice(["normal", "detailed"]),
                "persona": random.choice(["researcher", "technical_expert", "general"])
            }
        }
        
        start_time = time.time()
        with self.client.post("/api/v1/segment", json=payload, name="Segment Text", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to segment text: {response.status_code}, {response.text}")
            else:
                processing_time = time.time() - start_time
                events.request.fire(
                    request_type="CUSTOM",
                    name="Segmentation Processing Time",
                    response_time=processing_time * 1000,  # ms cinsinden
                    response_length=len(response.text),
                    exception=None,
                )
    
    @task(2)
    def segment_batch(self):
        """Toplu metin segmentasyonu isteği gönderir"""
        texts = [
            self.get_random_text("short"),
            self.get_random_text("medium"),
            self.get_random_text("long")
        ]
        
        payload = {
            "texts": texts,
            "parameters": {
                "language": "tr",
                "mode": "normal",
                "persona": "researcher"
            }
        }
        
        with self.client.post("/api/v1/segment/batch", json=payload, name="Segment Batch", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to segment batch: {response.status_code}, {response.text}")


class AnalysisOperations(TaskSet):
    """Metin analizi ile ilgili işlemleri test eden task seti"""
    
    @task
    def segment_analyze(self):
        """Metin segmentasyonu ve analizi isteği gönderir"""
        text = "Bu metin segmentasyon ve analiz için kullanılacaktır. " + "Örnek cümle. " * random.randint(1, 5)
        
        payload = {
            "text": text,
            "parameters": {
                "language": "tr",
                "mode": "detailed",
                "persona": "researcher",
                "analysis_level": random.choice(["basic", "advanced"])
            }
        }
        
        with self.client.post("/api/v1/segment/analyze", json=payload, name="Segment and Analyze", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to segment and analyze: {response.status_code}, {response.text}")


class ALTFileOperations(TaskSet):
    """ALT dosyası işlemleri ile ilgili işlemleri test eden task seti"""
    
    @task
    def segment_alt_file(self):
        """ALT dosyası segmentasyonu isteği gönderir (simülasyon)"""
        # Gerçek bir ALT dosyası yerine içerik simüle ediyoruz
        alt_content = "ALT dosyası içeriği simülasyonu"
        
        payload = {
            "alt_content": alt_content,
            "parameters": {
                "language": "tr",
                "mode": "normal",
                "persona": "technical_expert"
            }
        }
        
        with self.client.post("/api/v1/segment/alt", json=payload, name="Segment ALT File", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Failed to segment ALT file: {response.status_code}, {response.text}")


class SegmentationService(HttpUser):
    """Segmentation Service'i test eden kullanıcı sınıfı"""
    
    # Kullanıcı işlemleri arasında 1-3 saniye bekler
    wait_time = between(1, 3)
    
    # Kullanıcı başlatıldığında çalışacak metot
    def on_start(self):
        """Kullanıcı oturumu başlatıldığında çalışır"""
        self.client.headers = {
            "Content-Type": "application/json",
            "X-Request-ID": str(uuid.uuid4()),
            "Authorization": "Bearer test-token"
        }
    
    # Kullanıcının yapabileceği görevler
    tasks = {
        SegmentationOperations: 6,  # Segmentasyon işlemleri daha sık yapılır
        AnalysisOperations: 3,
        ALTFileOperations: 1
    }


# Test olayları için dinleyiciler
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Test başladığında çalışır"""
    print("Segmentation Service yük testi başlatılıyor...")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Test bittiğinde çalışır"""
    print("Segmentation Service yük testi tamamlandı.")


# Başarılı istekler için dinleyici
@events.request_success.add_listener
def on_request_success(request_type, name, response_time, response_length, **kwargs):
    """Başarılı istekler için çalışır"""
    if request_type == "CUSTOM" and name == "Segmentation Processing Time":
        print(f"Segmentasyon işleme süresi: {response_time:.2f} ms")


# Başarısız istekler için dinleyici
@events.request_failure.add_listener
def on_request_failure(request_type, name, response_time, exception, **kwargs):
    """Başarısız istekler için çalışır"""
    print(f"Hata: {name} - {exception}")


if __name__ == "__main__":
    print("Bu script doğrudan çalıştırılmamalıdır. Locust ile çalıştırın:")
    print("locust -f segmentation_service_locustfile.py --host=http://segmentation-service:8080")
