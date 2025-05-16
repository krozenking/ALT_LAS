"""
GPU İstek Yönlendirme Katmanı Performans Testleri

Bu modül, GPU İstek Yönlendirme Katmanı'nın performans testlerini içerir.
Locust kullanılarak yük testleri gerçekleştirilir.

Kullanım:
    locust -f test_performance.py
"""

import time
import json
import random
import uuid
from locust import HttpUser, task, between

class GPURequestRouterUser(HttpUser):
    """GPU İstek Yönlendirme Katmanı kullanıcısı."""
    
    # İstekler arasında 1-5 saniye bekle
    wait_time = between(1, 5)
    
    def on_start(self):
        """Kullanıcı başlangıç işlemleri."""
        # Kullanıcı ID'si oluştur
        self.user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        
        # İstek ID'lerini sakla
        self.request_ids = []
        
    @task(10)
    def route_request(self):
        """İstek yönlendirme testi."""
        # Model ID'si oluştur
        model_id = f"test_model_{random.randint(1, 10)}"
        
        # İstek türü seç
        request_type = random.choice(["inference", "training", "fine-tuning"])
        
        # Öncelik seç
        priority = random.randint(1, 5)
        
        # Bellek gereksinimi seç
        memory = random.choice([1024, 2048, 4096, 8192])
        
        # İşlem süresi seç
        expected_duration = random.choice([1000, 2000, 5000, 10000])
        
        # İstek verisi
        request_data = {
            "user_id": self.user_id,
            "model_id": model_id,
            "priority": priority,
            "type": request_type,
            "resource_requirements": {
                "memory": memory,
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": expected_duration
            },
            "timeout": expected_duration * 2,
            "payload": {
                "input": f"Test input {uuid.uuid4().hex[:8]}"
            }
        }
        
        # İsteği gönder
        with self.client.post("/api/v1/route", json=request_data, catch_response=True) as response:
            if response.status_code == 200:
                # İstek ID'sini sakla
                request_id = response.json()["request_id"]
                self.request_ids.append(request_id)
            else:
                response.failure(f"İstek yönlendirme başarısız: {response.status_code}")
                
    @task(5)
    def route_batch_request(self):
        """Toplu istek yönlendirme testi."""
        # İstek sayısı seç
        request_count = random.randint(2, 5)
        
        # İstekleri oluştur
        requests = []
        for i in range(request_count):
            # Model ID'si oluştur
            model_id = f"test_model_{random.randint(1, 10)}"
            
            # İstek türü seç
            request_type = random.choice(["inference", "training", "fine-tuning"])
            
            # Öncelik seç
            priority = random.randint(1, 5)
            
            # Bellek gereksinimi seç
            memory = random.choice([1024, 2048, 4096, 8192])
            
            # İşlem süresi seç
            expected_duration = random.choice([1000, 2000, 5000, 10000])
            
            # İstek verisi
            request = {
                "model_id": model_id,
                "priority": priority,
                "type": request_type,
                "resource_requirements": {
                    "memory": memory,
                    "compute_units": 1,
                    "max_batch_size": 1,
                    "expected_duration": expected_duration
                },
                "payload": {
                    "input": f"Test input {uuid.uuid4().hex[:8]}"
                }
            }
            
            requests.append(request)
            
        # Batch istek verisi
        batch_request_data = {
            "user_id": self.user_id,
            "requests": requests,
            "timeout": 60000
        }
        
        # İsteği gönder
        with self.client.post("/api/v1/route/batch", json=batch_request_data, catch_response=True) as response:
            if response.status_code == 200:
                # İstek ID'lerini sakla
                request_ids = response.json()["request_ids"]
                self.request_ids.extend(request_ids)
            else:
                response.failure(f"Toplu istek yönlendirme başarısız: {response.status_code}")
                
    @task(20)
    def get_request_status(self):
        """İstek durumu sorgulama testi."""
        # İstek ID'si varsa sorgula
        if self.request_ids:
            # Rastgele bir istek ID'si seç
            request_id = random.choice(self.request_ids)
            
            # İstek durumunu sorgula
            with self.client.get(f"/api/v1/requests/{request_id}", catch_response=True) as response:
                if response.status_code == 200:
                    # İstek tamamlanmış veya başarısız olmuşsa listeden çıkar
                    if response.json()["status"] in ["completed", "failed", "cancelled"]:
                        self.request_ids.remove(request_id)
                elif response.status_code == 404:
                    # İstek bulunamadıysa listeden çıkar
                    if request_id in self.request_ids:
                        self.request_ids.remove(request_id)
                    response.success()
                else:
                    response.failure(f"İstek durumu sorgulama başarısız: {response.status_code}")
                    
    @task(5)
    def cancel_request(self):
        """İstek iptal etme testi."""
        # İstek ID'si varsa iptal et
        if self.request_ids:
            # Rastgele bir istek ID'si seç
            request_id = random.choice(self.request_ids)
            
            # İsteği iptal et
            with self.client.delete(f"/api/v1/requests/{request_id}", catch_response=True) as response:
                if response.status_code == 200:
                    # İstek iptal edildiyse listeden çıkar
                    self.request_ids.remove(request_id)
                elif response.status_code == 404:
                    # İstek bulunamadıysa listeden çıkar
                    if request_id in self.request_ids:
                        self.request_ids.remove(request_id)
                    response.success()
                else:
                    response.failure(f"İstek iptal etme başarısız: {response.status_code}")
                    
    @task(2)
    def get_gpu_states(self):
        """GPU durumlarını alma testi."""
        # GPU durumlarını al
        with self.client.get("/api/v1/gpus", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"GPU durumlarını alma başarısız: {response.status_code}")
                
    @task(1)
    def get_metrics(self):
        """Metrikleri alma testi."""
        # Metrikleri al
        with self.client.get("/api/v1/metrics", catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Metrikleri alma başarısız: {response.status_code}")

class StressTestUser(HttpUser):
    """Stres testi kullanıcısı."""
    
    # İstekler arasında 0.1-1 saniye bekle
    wait_time = between(0.1, 1)
    
    def on_start(self):
        """Kullanıcı başlangıç işlemleri."""
        # Kullanıcı ID'si oluştur
        self.user_id = f"stress_user_{uuid.uuid4().hex[:8]}"
        
    @task
    def route_request(self):
        """İstek yönlendirme testi."""
        # İstek verisi
        request_data = {
            "user_id": self.user_id,
            "model_id": "stress_model",
            "priority": 3,
            "type": "inference",
            "resource_requirements": {
                "memory": 1024,
                "compute_units": 1,
                "max_batch_size": 1,
                "expected_duration": 1000
            },
            "timeout": 30000,
            "payload": {
                "input": "Stress test input"
            }
        }
        
        # İsteği gönder
        with self.client.post("/api/v1/route", json=request_data, catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"İstek yönlendirme başarısız: {response.status_code}")

class EnduranceTestUser(HttpUser):
    """Dayanıklılık testi kullanıcısı."""
    
    # İstekler arasında 5-10 saniye bekle
    wait_time = between(5, 10)
    
    def on_start(self):
        """Kullanıcı başlangıç işlemleri."""
        # Kullanıcı ID'si oluştur
        self.user_id = f"endurance_user_{uuid.uuid4().hex[:8]}"
        
        # İstek ID'lerini sakla
        self.request_ids = []
        
    @task
    def route_and_monitor_request(self):
        """İstek yönlendirme ve izleme testi."""
        # İstek verisi
        request_data = {
            "user_id": self.user_id,
            "model_id": "endurance_model",
            "priority": 3,
            "type": "training",
            "resource_requirements": {
                "memory": 4096,
                "compute_units": 2,
                "max_batch_size": 1,
                "expected_duration": 30000  # 30 saniye
            },
            "timeout": 60000,  # 1 dakika
            "payload": {
                "input": f"Endurance test input {uuid.uuid4().hex[:8]}"
            }
        }
        
        # İsteği gönder
        with self.client.post("/api/v1/route", json=request_data, catch_response=True) as response:
            if response.status_code == 200:
                # İstek ID'sini sakla
                request_id = response.json()["request_id"]
                self.request_ids.append(request_id)
                
                # İstek durumunu izle
                start_time = time.time()
                completed = False
                
                while time.time() - start_time < 60 and not completed:  # 1 dakika bekle
                    # İstek durumunu sorgula
                    status_response = self.client.get(f"/api/v1/requests/{request_id}")
                    
                    if status_response.status_code == 200:
                        status = status_response.json()["status"]
                        
                        if status in ["completed", "failed", "cancelled"]:
                            completed = True
                            # İstek ID'sini listeden çıkar
                            self.request_ids.remove(request_id)
                            break
                            
                    # 5 saniye bekle
                    time.sleep(5)
                    
                if not completed:
                    response.failure(f"İstek {request_id} 1 dakika içinde tamamlanmadı")
            else:
                response.failure(f"İstek yönlendirme başarısız: {response.status_code}")

# Locust çalıştırma ayarları
if __name__ == "__main__":
    import os
    from locust import main
    
    # Locust komut satırı argümanları
    os.environ["LOCUST_HOST"] = "http://localhost:8000"
    os.environ["LOCUST_USERS"] = "10"
    os.environ["LOCUST_SPAWN_RATE"] = "1"
    os.environ["LOCUST_RUN_TIME"] = "5m"
    
    # Locust'u başlat
    main.main()
