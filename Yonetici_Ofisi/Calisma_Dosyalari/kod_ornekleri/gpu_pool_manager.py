#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
GPU Havuzu Yöneticisi

Bu modül, ALT_LAS sistemindeki GPU'ları algılama, izleme ve yönetme işlevlerini sağlar.
Çoklu GPU desteği için temel bileşendir.

Kullanım:
    from gpu_pool_manager import GPUPoolManager, NVMLGPUPoolManager
    
    # Yapılandırma ile başlat
    config = {
        'min_compute_capability': 7.0,
        'memory_threshold': 0.9,
        'utilization_threshold': 0.95,
        'health_check_interval': 60
    }
    
    # GPU Havuzu Yöneticisini oluştur
    gpu_manager = NVMLGPUPoolManager(config)
    
    # Kullanılabilir GPU'ları al
    available_gpus = gpu_manager.get_available_gpus()
    
    # GPU bilgilerini al
    gpu_info = gpu_manager.get_gpu_info(0)
    
    # GPU'yu rezerve et
    gpu_manager.reserve_gpu(0, 'task-123')
    
    # GPU'yu serbest bırak
    gpu_manager.release_gpu(0, 'task-123')
"""

import os
import time
import logging
import threading
import json
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    import pynvml
    NVML_AVAILABLE = True
except ImportError:
    logger.warning("pynvml kütüphanesi bulunamadı. NVML GPU Havuzu Yöneticisi kullanılamayacak.")
    NVML_AVAILABLE = False

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    logger.warning("torch kütüphanesi bulunamadı. Torch GPU Havuzu Yöneticisi kullanılamayacak.")
    TORCH_AVAILABLE = False


class GPUStatus(Enum):
    """GPU durumunu temsil eden enum."""
    AVAILABLE = "available"
    RESERVED = "reserved"
    BUSY = "busy"
    ERROR = "error"
    OFFLINE = "offline"


@dataclass
class GPUInfo:
    """GPU bilgilerini temsil eden veri sınıfı."""
    id: int
    name: str
    compute_capability: Tuple[int, int]
    memory_total: int  # Byte cinsinden
    memory_used: int  # Byte cinsinden
    memory_free: int  # Byte cinsinden
    utilization: float  # 0-100 arası yüzde
    temperature: int  # Celsius
    power_usage: float  # Watt
    power_limit: float  # Watt
    status: GPUStatus
    reserved_by: Optional[str] = None
    reserved_at: Optional[float] = None
    processes: List[Dict[str, Any]] = None


class GPUPoolManager(ABC):
    """
    GPU Havuzu Yöneticisi soyut temel sınıfı.
    
    Bu sınıf, GPU'ları algılama, izleme ve yönetme işlevlerini tanımlar.
    Alt sınıflar, farklı GPU yönetim kütüphaneleri (NVML, Torch vb.) için
    spesifik uygulamalar sağlar.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        GPU Havuzu Yöneticisini başlatır.
        
        Args:
            config: Yapılandırma parametreleri içeren sözlük
        """
        self.config = config
        self.min_compute_capability = config.get('min_compute_capability', 7.0)
        self.memory_threshold = config.get('memory_threshold', 0.9)
        self.utilization_threshold = config.get('utilization_threshold', 0.95)
        self.health_check_interval = config.get('health_check_interval', 60)
        self.devices = {}
        self.lock = threading.RLock()
        self.health_check_thread = None
        self.stop_health_check = threading.Event()
        
    @abstractmethod
    def discover_gpus(self) -> List[int]:
        """
        Sistemdeki tüm uyumlu GPU'ları algılar ve döndürür.
        
        Returns:
            GPU ID'lerinin listesi
        """
        pass
        
    @abstractmethod
    def get_gpu_info(self, gpu_id: int) -> GPUInfo:
        """
        Belirli bir GPU'nun özelliklerini ve durumunu döndürür.
        
        Args:
            gpu_id: GPU ID'si
            
        Returns:
            GPU bilgilerini içeren GPUInfo nesnesi
            
        Raises:
            ValueError: Geçersiz GPU ID'si
        """
        pass
        
    def get_all_gpu_info(self) -> Dict[int, GPUInfo]:
        """
        Tüm GPU'ların özelliklerini ve durumlarını döndürür.
        
        Returns:
            GPU ID'lerini anahtar, GPUInfo nesnelerini değer olarak içeren sözlük
        """
        with self.lock:
            result = {}
            for gpu_id in self.devices:
                result[gpu_id] = self.get_gpu_info(gpu_id)
            return result
        
    def reserve_gpu(self, gpu_id: int, task_id: str) -> bool:
        """
        Belirli bir GPU'yu belirli bir görev için rezerve eder.
        
        Args:
            gpu_id: GPU ID'si
            task_id: Görev ID'si
            
        Returns:
            İşlemin başarılı olup olmadığı
            
        Raises:
            ValueError: Geçersiz GPU ID'si veya GPU zaten rezerve edilmiş
        """
        with self.lock:
            if gpu_id not in self.devices:
                raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
                
            gpu_info = self.get_gpu_info(gpu_id)
            
            if gpu_info.status != GPUStatus.AVAILABLE:
                logger.warning(f"GPU {gpu_id} rezerve edilemedi: {gpu_info.status}")
                return False
                
            self.devices[gpu_id]['reserved_by'] = task_id
            self.devices[gpu_id]['reserved_at'] = time.time()
            self.devices[gpu_id]['status'] = GPUStatus.RESERVED
            
            logger.info(f"GPU {gpu_id} '{task_id}' görevi için rezerve edildi")
            return True
        
    def release_gpu(self, gpu_id: int, task_id: str) -> bool:
        """
        Belirli bir GPU'yu serbest bırakır.
        
        Args:
            gpu_id: GPU ID'si
            task_id: Görev ID'si
            
        Returns:
            İşlemin başarılı olup olmadığı
            
        Raises:
            ValueError: Geçersiz GPU ID'si veya GPU başka bir görev tarafından rezerve edilmiş
        """
        with self.lock:
            if gpu_id not in self.devices:
                raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
                
            if self.devices[gpu_id]['reserved_by'] != task_id:
                current_task = self.devices[gpu_id]['reserved_by']
                raise ValueError(f"GPU {gpu_id} '{current_task}' görevi tarafından rezerve edilmiş, '{task_id}' tarafından değil")
                
            self.devices[gpu_id]['reserved_by'] = None
            self.devices[gpu_id]['reserved_at'] = None
            self.devices[gpu_id]['status'] = GPUStatus.AVAILABLE
            
            logger.info(f"GPU {gpu_id} '{task_id}' görevi tarafından serbest bırakıldı")
            return True
        
    def get_available_gpus(self) -> List[int]:
        """
        Kullanılabilir GPU'ları döndürür.
        
        Returns:
            Kullanılabilir GPU ID'lerinin listesi
        """
        with self.lock:
            available_gpus = []
            for gpu_id, device in self.devices.items():
                gpu_info = self.get_gpu_info(gpu_id)
                if gpu_info.status == GPUStatus.AVAILABLE:
                    # Bellek ve kullanım eşiklerini kontrol et
                    memory_usage = gpu_info.memory_used / gpu_info.memory_total
                    if memory_usage < self.memory_threshold and gpu_info.utilization < self.utilization_threshold * 100:
                        available_gpus.append(gpu_id)
            return available_gpus
        
    @abstractmethod
    def check_gpu_health(self, gpu_id: int) -> bool:
        """
        Belirli bir GPU'nun sağlık durumunu kontrol eder.
        
        Args:
            gpu_id: GPU ID'si
            
        Returns:
            GPU'nun sağlıklı olup olmadığı
        """
        pass
        
    def start_health_check(self):
        """Periyodik sağlık kontrolü başlatır."""
        if self.health_check_thread is not None and self.health_check_thread.is_alive():
            logger.warning("Sağlık kontrolü zaten çalışıyor")
            return
            
        self.stop_health_check.clear()
        self.health_check_thread = threading.Thread(
            target=self._health_check_loop,
            daemon=True
        )
        self.health_check_thread.start()
        logger.info("GPU sağlık kontrolü başlatıldı")
        
    def stop_health_check(self):
        """Periyodik sağlık kontrolünü durdurur."""
        if self.health_check_thread is None or not self.health_check_thread.is_alive():
            logger.warning("Sağlık kontrolü zaten durdurulmuş")
            return
            
        self.stop_health_check.set()
        self.health_check_thread.join(timeout=5)
        logger.info("GPU sağlık kontrolü durduruldu")
        
    def _health_check_loop(self):
        """Periyodik sağlık kontrolü döngüsü."""
        while not self.stop_health_check.is_set():
            try:
                for gpu_id in list(self.devices.keys()):
                    healthy = self.check_gpu_health(gpu_id)
                    with self.lock:
                        if not healthy and self.devices[gpu_id]['status'] != GPUStatus.ERROR:
                            logger.warning(f"GPU {gpu_id} sağlık kontrolünü geçemedi")
                            self.devices[gpu_id]['status'] = GPUStatus.ERROR
                        elif healthy and self.devices[gpu_id]['status'] == GPUStatus.ERROR:
                            logger.info(f"GPU {gpu_id} sağlık durumu normale döndü")
                            if self.devices[gpu_id]['reserved_by'] is None:
                                self.devices[gpu_id]['status'] = GPUStatus.AVAILABLE
                            else:
                                self.devices[gpu_id]['status'] = GPUStatus.RESERVED
            except Exception as e:
                logger.error(f"Sağlık kontrolü sırasında hata: {e}")
                
            self.stop_health_check.wait(self.health_check_interval)


class NVMLGPUPoolManager(GPUPoolManager):
    """
    NVIDIA Management Library (NVML) kullanan GPU Havuzu Yöneticisi.
    
    Bu sınıf, NVML API'sini kullanarak NVIDIA GPU'larını algılar, izler ve yönetir.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        NVML GPU Havuzu Yöneticisini başlatır.
        
        Args:
            config: Yapılandırma parametreleri içeren sözlük
            
        Raises:
            ImportError: pynvml kütüphanesi bulunamadığında
            RuntimeError: NVML başlatılamadığında
        """
        if not NVML_AVAILABLE:
            raise ImportError("pynvml kütüphanesi bulunamadı. Lütfen 'pip install nvidia-ml-py3' komutu ile yükleyin.")
            
        super().__init__(config)
        
        try:
            pynvml.nvmlInit()
            self.device_count = pynvml.nvmlDeviceGetCount()
            logger.info(f"{self.device_count} NVIDIA GPU algılandı")
            self.discover_gpus()
            self.start_health_check()
        except pynvml.NVMLError as e:
            raise RuntimeError(f"NVML başlatılamadı: {e}")
            
    def __del__(self):
        """Yıkıcı metod, NVML'yi kapatır."""
        try:
            self.stop_health_check()
            pynvml.nvmlShutdown()
        except:
            pass
            
    def discover_gpus(self) -> List[int]:
        """
        Sistemdeki tüm uyumlu NVIDIA GPU'larını algılar ve döndürür.
        
        Returns:
            GPU ID'lerinin listesi
        """
        with self.lock:
            discovered_gpus = []
            
            for i in range(self.device_count):
                try:
                    handle = pynvml.nvmlDeviceGetHandleByIndex(i)
                    name = pynvml.nvmlDeviceGetName(handle).decode('utf-8')
                    compute_capability = self._get_compute_capability(handle)
                    
                    # Compute capability kontrolü
                    cc_float = compute_capability[0] + compute_capability[1] / 10
                    if cc_float < self.min_compute_capability:
                        logger.warning(f"GPU {i} ({name}) minimum compute capability gereksinimini karşılamıyor: "
                                      f"{compute_capability[0]}.{compute_capability[1]} < {self.min_compute_capability}")
                        continue
                        
                    memory_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
                    
                    self.devices[i] = {
                        'handle': handle,
                        'name': name,
                        'compute_capability': compute_capability,
                        'memory_total': memory_info.total,
                        'status': GPUStatus.AVAILABLE,
                        'reserved_by': None,
                        'reserved_at': None
                    }
                    
                    discovered_gpus.append(i)
                    logger.info(f"GPU {i}: {name}, Compute Capability: {compute_capability[0]}.{compute_capability[1]}, "
                               f"Bellek: {memory_info.total / (1024**3):.2f} GB")
                except pynvml.NVMLError as e:
                    logger.error(f"GPU {i} algılanırken hata: {e}")
                    
            return discovered_gpus
            
    def _get_compute_capability(self, handle) -> Tuple[int, int]:
        """
        GPU'nun compute capability değerini döndürür.
        
        Args:
            handle: NVML GPU handle
            
        Returns:
            (major, minor) şeklinde compute capability
        """
        try:
            cc = pynvml.nvmlDeviceGetCudaComputeCapability(handle)
            return cc
        except pynvml.NVMLError:
            # Bazı eski sürümlerde bu fonksiyon bulunmayabilir
            # Alternatif bir yöntem kullanabiliriz
            try:
                attributes = pynvml.nvmlDeviceGetAttributes(handle)
                return (attributes.computeCapabilityMajor, attributes.computeCapabilityMinor)
            except:
                # Varsayılan değer döndür
                return (0, 0)
                
    def get_gpu_info(self, gpu_id: int) -> GPUInfo:
        """
        Belirli bir GPU'nun özelliklerini ve durumunu döndürür.
        
        Args:
            gpu_id: GPU ID'si
            
        Returns:
            GPU bilgilerini içeren GPUInfo nesnesi
            
        Raises:
            ValueError: Geçersiz GPU ID'si
        """
        with self.lock:
            if gpu_id not in self.devices:
                raise ValueError(f"Geçersiz GPU ID: {gpu_id}")
                
            device = self.devices[gpu_id]
            handle = device['handle']
            
            try:
                memory_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
                utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
                temperature = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
                power_usage = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0  # mW -> W
                power_limit = pynvml.nvmlDeviceGetPowerManagementLimit(handle) / 1000.0  # mW -> W
                
                # Çalışan süreçleri al
                processes = []
                try:
                    for proc in pynvml.nvmlDeviceGetComputeRunningProcesses(handle):
                        process_info = {
                            'pid': proc.pid,
                            'memory_used': proc.usedGpuMemory
                        }
                        try:
                            process_name = pynvml.nvmlSystemGetProcessName(proc.pid)
                            process_info['name'] = process_name.decode('utf-8') if process_name else "Unknown"
                        except:
                            process_info['name'] = "Unknown"
                            
                        processes.append(process_info)
                except pynvml.NVMLError:
                    pass
                    
                return GPUInfo(
                    id=gpu_id,
                    name=device['name'],
                    compute_capability=device['compute_capability'],
                    memory_total=memory_info.total,
                    memory_used=memory_info.used,
                    memory_free=memory_info.free,
                    utilization=utilization.gpu,
                    temperature=temperature,
                    power_usage=power_usage,
                    power_limit=power_limit,
                    status=device['status'],
                    reserved_by=device['reserved_by'],
                    reserved_at=device['reserved_at'],
                    processes=processes
                )
            except pynvml.NVMLError as e:
                logger.error(f"GPU {gpu_id} bilgileri alınırken hata: {e}")
                
                # Hata durumunda mevcut bilgilerle sınırlı bir GPUInfo döndür
                return GPUInfo(
                    id=gpu_id,
                    name=device['name'],
                    compute_capability=device['compute_capability'],
                    memory_total=device['memory_total'],
                    memory_used=0,
                    memory_free=0,
                    utilization=0,
                    temperature=0,
                    power_usage=0,
                    power_limit=0,
                    status=GPUStatus.ERROR,
                    reserved_by=device['reserved_by'],
                    reserved_at=device['reserved_at'],
                    processes=[]
                )
                
    def check_gpu_health(self, gpu_id: int) -> bool:
        """
        Belirli bir GPU'nun sağlık durumunu kontrol eder.
        
        Args:
            gpu_id: GPU ID'si
            
        Returns:
            GPU'nun sağlıklı olup olmadığı
        """
        if gpu_id not in self.devices:
            return False
            
        try:
            handle = self.devices[gpu_id]['handle']
            
            # Temel sağlık kontrolü: GPU erişilebilir mi?
            pynvml.nvmlDeviceGetUtilizationRates(handle)
            
            # Sıcaklık kontrolü
            temperature = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
            max_temp = self.config.get('max_temperature', 85)
            if temperature > max_temp:
                logger.warning(f"GPU {gpu_id} sıcaklığı çok yüksek: {temperature}°C > {max_temp}°C")
                return False
                
            # ECC hata kontrolü (destekleniyorsa)
            try:
                ecc_mode = pynvml.nvmlDeviceGetEccMode(handle)
                if ecc_mode[0]:  # ECC etkinse
                    ecc_errors = pynvml.nvmlDeviceGetTotalEccErrors(
                        handle, pynvml.NVML_MEMORY_ERROR_TYPE_UNCORRECTED, pynvml.NVML_VOLATILE_ECC
                    )
                    if ecc_errors > 0:
                        logger.warning(f"GPU {gpu_id} düzeltilemeyen ECC hataları var: {ecc_errors}")
                        return False
            except pynvml.NVMLError:
                # ECC desteklenmiyorsa veya başka bir hata varsa, bu kontrolü atla
                pass
                
            return True
        except pynvml.NVMLError as e:
            logger.error(f"GPU {gpu_id} sağlık kontrolü sırasında hata: {e}")
            return False


# Torch tabanlı GPU Havuzu Yöneticisi de eklenebilir
# class TorchGPUPoolManager(GPUPoolManager):
#     ...


if __name__ == "__main__":
    # Örnek kullanım
    config = {
        'min_compute_capability': 7.0,
        'memory_threshold': 0.9,
        'utilization_threshold': 0.95,
        'health_check_interval': 60,
        'max_temperature': 85
    }
    
    try:
        manager = NVMLGPUPoolManager(config)
        
        print("\nKullanılabilir GPU'lar:")
        available_gpus = manager.get_available_gpus()
        for gpu_id in available_gpus:
            print(f"GPU {gpu_id}")
            
        print("\nTüm GPU'lar:")
        all_gpus = manager.get_all_gpu_info()
        for gpu_id, gpu_info in all_gpus.items():
            print(f"GPU {gpu_id}: {gpu_info.name}")
            print(f"  Compute Capability: {gpu_info.compute_capability[0]}.{gpu_info.compute_capability[1]}")
            print(f"  Bellek: {gpu_info.memory_total / (1024**3):.2f} GB (Kullanılan: {gpu_info.memory_used / (1024**3):.2f} GB)")
            print(f"  Kullanım: {gpu_info.utilization:.1f}%")
            print(f"  Sıcaklık: {gpu_info.temperature}°C")
            print(f"  Güç: {gpu_info.power_usage:.1f}W / {gpu_info.power_limit:.1f}W")
            print(f"  Durum: {gpu_info.status.value}")
            if gpu_info.processes:
                print("  Çalışan Süreçler:")
                for proc in gpu_info.processes:
                    print(f"    PID {proc['pid']}: {proc['name']} ({proc['memory_used'] / (1024**2):.1f} MB)")
            print()
            
        # Örnek rezervasyon
        if available_gpus:
            gpu_id = available_gpus[0]
            print(f"GPU {gpu_id} rezerve ediliyor...")
            manager.reserve_gpu(gpu_id, "test-task-123")
            
            print(f"GPU {gpu_id} bilgileri (rezervasyon sonrası):")
            gpu_info = manager.get_gpu_info(gpu_id)
            print(f"  Durum: {gpu_info.status.value}")
            print(f"  Rezerve Eden: {gpu_info.reserved_by}")
            
            print(f"GPU {gpu_id} serbest bırakılıyor...")
            manager.release_gpu(gpu_id, "test-task-123")
            
            print(f"GPU {gpu_id} bilgileri (serbest bırakma sonrası):")
            gpu_info = manager.get_gpu_info(gpu_id)
            print(f"  Durum: {gpu_info.status.value}")
            print(f"  Rezerve Eden: {gpu_info.reserved_by}")
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        # Temizlik
        if 'manager' in locals():
            del manager
