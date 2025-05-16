# gpu_pool_manager.py
import time
import threading
import logging
import pynvml

# Logger oluştur
logger = logging.getLogger('gpu_pool_manager')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

class GPUInfo:
    """GPU bilgilerini tutan sınıf."""

    def __init__(self, gpu_id, name, compute_capability, memory_total, memory_used,
                 memory_free, utilization, temperature, power_usage, power_limit,
                 status, processes):
        """GPU bilgilerini başlat."""
        self.id = gpu_id
        self.name = name
        self.compute_capability = compute_capability
        self.memory_total = memory_total
        self.memory_used = memory_used
        self.memory_free = memory_free
        self.utilization = utilization
        self.temperature = temperature
        self.power_usage = power_usage
        self.power_limit = power_limit
        self.status = status
        self.processes = processes
        self.reserved_by = None
        self.reserved_at = None

    def to_dict(self):
        """GPU bilgilerini sözlük olarak döndür."""
        return {
            'id': self.id,
            'name': self.name,
            'compute_capability': self.compute_capability,
            'memory_total': self.memory_total,
            'memory_used': self.memory_used,
            'memory_free': self.memory_free,
            'utilization': self.utilization,
            'temperature': self.temperature,
            'power_usage': self.power_usage,
            'power_limit': self.power_limit,
            'status': self.status,
            'processes': self.processes,
            'reserved_by': self.reserved_by,
            'reserved_at': self.reserved_at
        }

class NVMLGPUPoolManager:
    """NVIDIA NVML kullanarak GPU havuzunu yöneten sınıf."""

    def __init__(self, config):
        """GPU Havuzu Yöneticisi'ni başlat."""
        self.config = config
        self.gpus = {}
        self.running = False
        self.thread = None

        # NVML'yi başlat
        try:
            pynvml.nvmlInit()
            logger.info("NVML başlatıldı")
        except Exception as e:
            logger.error(f"NVML başlatılamadı: {str(e)}")
            raise

        # GPU'ları keşfet
        self.discover_gpus()

        # Sağlık kontrolü thread'ini başlat
        self.start_health_check()

    def __del__(self):
        """GPU Havuzu Yöneticisi'ni temizle."""
        self.stop_health_check()

        try:
            # NVML'yi kapat
            pynvml.nvmlShutdown()
            logger.info("NVML kapatıldı")
        except:
            pass

    def discover_gpus(self):
        """Sistemdeki tüm uyumlu GPU'ları algıla ve döndür."""
        try:
            # GPU sayısını al
            gpu_count = pynvml.nvmlDeviceGetCount()
            logger.info(f"{gpu_count} GPU algılandı")

            # Her GPU için bilgileri al
            for i in range(gpu_count):
                try:
                    handle = pynvml.nvmlDeviceGetHandleByIndex(i)

                    # GPU adı
                    name_bytes = pynvml.nvmlDeviceGetName(handle)
                    name = name_bytes.decode('utf-8') if isinstance(name_bytes, bytes) else name_bytes

                    # Hesaplama yeteneği
                    compute_capability = pynvml.nvmlDeviceGetCudaComputeCapability(handle)
                    compute_capability_str = f"{compute_capability[0]}.{compute_capability[1]}"
                    compute_capability_float = float(compute_capability_str)

                    # Minimum hesaplama yeteneği kontrolü
                    min_compute_capability = float(self.config['detection'].get('min_compute_capability', 0.0))

                    if compute_capability_float < min_compute_capability:
                        logger.warning(f"GPU {i} ({name}) hesaplama yeteneği ({compute_capability_str}) minimum gereksinimi ({min_compute_capability}) karşılamıyor")
                        continue

                    # GPU bilgilerini al
                    gpu_info = self.get_gpu_info(i)

                    # GPU'yu havuza ekle
                    self.gpus[i] = gpu_info

                    logger.info(f"GPU {i} ({name}) havuza eklendi")
                except Exception as e:
                    logger.error(f"GPU {i} algılanamadı: {str(e)}")

            return list(self.gpus.keys())
        except Exception as e:
            logger.error(f"GPU'lar keşfedilemedi: {str(e)}")
            return []

    def get_gpu_info(self, gpu_id):
        """Belirli bir GPU'nun özelliklerini ve durumunu döndür."""
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(gpu_id)

            # GPU adı
            name_bytes = pynvml.nvmlDeviceGetName(handle)
            name = name_bytes.decode('utf-8') if isinstance(name_bytes, bytes) else name_bytes

            # Hesaplama yeteneği
            compute_capability = pynvml.nvmlDeviceGetCudaComputeCapability(handle)
            compute_capability_str = f"{compute_capability[0]}.{compute_capability[1]}"

            # Bellek bilgileri
            memory = pynvml.nvmlDeviceGetMemoryInfo(handle)

            # Kullanım oranı
            utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)

            # Sıcaklık
            temperature = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)

            # Güç kullanımı
            try:
                power_usage = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0
            except:
                power_usage = 0.0

            # Güç limiti
            try:
                power_limit = pynvml.nvmlDeviceGetPowerManagementLimit(handle) / 1000.0
            except:
                power_limit = 0.0

            # Çalışan süreçler
            processes = []
            try:
                for p in pynvml.nvmlDeviceGetComputeRunningProcesses(handle):
                    try:
                        process_name_bytes = pynvml.nvmlSystemGetProcessName(p.pid)
                        process_name = process_name_bytes.decode('utf-8') if isinstance(process_name_bytes, bytes) else process_name_bytes
                        memory_used = p.usedGpuMemory if hasattr(p, 'usedGpuMemory') and p.usedGpuMemory is not None else 0
                        processes.append({
                            'pid': p.pid,
                            'name': process_name,
                            'memory_used': memory_used
                        })
                    except:
                        pass
            except:
                pass

            # GPU durumu
            status = "AVAILABLE"

            # GPU bilgilerini oluştur
            gpu_info = GPUInfo(
                gpu_id=gpu_id,
                name=name,
                compute_capability=compute_capability_str,
                memory_total=memory.total,
                memory_used=memory.used,
                memory_free=memory.free,
                utilization=utilization.gpu,
                temperature=temperature,
                power_usage=power_usage,
                power_limit=power_limit,
                status=status,
                processes=processes
            )

            # GPU'yu havuza ekle veya güncelle
            if gpu_id in self.gpus:
                # Rezervasyon bilgilerini koru
                gpu_info.reserved_by = self.gpus[gpu_id].reserved_by
                gpu_info.reserved_at = self.gpus[gpu_id].reserved_at

                # Durum güncelleme
                if gpu_info.reserved_by is not None:
                    gpu_info.status = "RESERVED"

            self.gpus[gpu_id] = gpu_info

            return gpu_info
        except Exception as e:
            logger.error(f"GPU {gpu_id} bilgileri alınamadı: {str(e)}")
            raise ValueError(f"GPU {gpu_id} bulunamadı")

    def get_all_gpu_info(self):
        """Tüm GPU'ların özelliklerini ve durumlarını döndür."""
        result = {}

        for gpu_id in self.gpus:
            try:
                result[gpu_id] = self.get_gpu_info(gpu_id)
            except Exception as e:
                logger.error(f"GPU {gpu_id} bilgileri alınamadı: {str(e)}")

        return result

    def reserve_gpu(self, gpu_id, task_id):
        """Belirli bir GPU'yu belirli bir görev için rezerve et."""
        if gpu_id not in self.gpus:
            logger.error(f"GPU {gpu_id} bulunamadı")
            raise ValueError(f"GPU {gpu_id} bulunamadı")

        gpu = self.gpus[gpu_id]

        if gpu.status != "AVAILABLE":
            logger.warning(f"GPU {gpu_id} kullanılamaz (Durum: {gpu.status})")
            return False

        # GPU'yu rezerve et
        gpu.status = "RESERVED"
        gpu.reserved_by = task_id
        gpu.reserved_at = time.time()

        logger.info(f"GPU {gpu_id} '{task_id}' görevi için rezerve edildi")

        return True

    def release_gpu(self, gpu_id, task_id):
        """Belirli bir GPU'yu serbest bırak."""
        if gpu_id not in self.gpus:
            logger.error(f"GPU {gpu_id} bulunamadı")
            raise ValueError(f"GPU {gpu_id} bulunamadı")

        gpu = self.gpus[gpu_id]

        if gpu.reserved_by != task_id:
            logger.warning(f"GPU {gpu_id} '{gpu.reserved_by}' görevi tarafından rezerve edilmiş, '{task_id}' tarafından değil")
            raise ValueError(f"GPU {gpu_id} '{gpu.reserved_by}' görevi tarafından rezerve edilmiş, '{task_id}' tarafından değil")

        # GPU'yu serbest bırak
        gpu.status = "AVAILABLE"
        gpu.reserved_by = None
        gpu.reserved_at = None

        logger.info(f"GPU {gpu_id} '{task_id}' görevi tarafından serbest bırakıldı")

        return True

    def get_available_gpus(self):
        """Kullanılabilir GPU'ları döndür."""
        return [gpu_id for gpu_id, gpu in self.gpus.items() if gpu.status == "AVAILABLE"]

    def check_gpu_health(self, gpu_id):
        """Belirli bir GPU'nun sağlık durumunu kontrol et."""
        if gpu_id not in self.gpus:
            logger.error(f"GPU {gpu_id} bulunamadı")
            raise ValueError(f"GPU {gpu_id} bulunamadı")

        try:
            # GPU bilgilerini al
            gpu = self.get_gpu_info(gpu_id)

            # Bellek kullanım eşiği kontrolü
            memory_threshold = self.config['detection'].get('memory_threshold', 0.9)
            memory_usage = gpu.memory_used / gpu.memory_total

            if memory_usage > memory_threshold:
                logger.warning(f"GPU {gpu_id} bellek kullanımı ({memory_usage:.2f}) eşiği ({memory_threshold}) aşıyor")
                return False

            # Kullanım oranı eşiği kontrolü
            utilization_threshold = self.config['detection'].get('utilization_threshold', 0.95)

            if gpu.utilization / 100.0 > utilization_threshold:
                logger.warning(f"GPU {gpu_id} kullanım oranı ({gpu.utilization}%) eşiği ({utilization_threshold * 100}%) aşıyor")
                return False

            # Sıcaklık eşiği kontrolü
            max_temperature = self.config['detection'].get('max_temperature', 85)

            if gpu.temperature > max_temperature:
                logger.warning(f"GPU {gpu_id} sıcaklığı ({gpu.temperature}°C) eşiği ({max_temperature}°C) aşıyor")
                return False

            return True
        except Exception as e:
            logger.error(f"GPU {gpu_id} sağlık kontrolü başarısız: {str(e)}")
            return False

    def start_health_check(self):
        """GPU sağlık kontrolü thread'ini başlat."""
        if self.running:
            return

        self.running = True
        self.thread = threading.Thread(target=self._health_check_loop)
        self.thread.daemon = True
        self.thread.start()

        logger.info("GPU sağlık kontrolü başlatıldı")

    def stop_health_check(self):
        """GPU sağlık kontrolü thread'ini durdur."""
        self.running = False

        if self.thread:
            self.thread.join()
            self.thread = None

        logger.info("GPU sağlık kontrolü durduruldu")

    def _health_check_loop(self):
        """GPU sağlık kontrolü döngüsü."""
        interval = self.config['detection'].get('health_check_interval', 60)

        while self.running:
            try:
                # Tüm GPU'lar için sağlık kontrolü yap
                for gpu_id in list(self.gpus.keys()):
                    try:
                        # GPU sağlık durumunu kontrol et
                        healthy = self.check_gpu_health(gpu_id)

                        # GPU sağlıksızsa ve rezerve edilmemişse, durumunu güncelle
                        if not healthy and self.gpus[gpu_id].status == "AVAILABLE":
                            self.gpus[gpu_id].status = "UNHEALTHY"
                            logger.warning(f"GPU {gpu_id} sağlıksız olarak işaretlendi")

                        # GPU sağlıklıysa ve sağlıksız olarak işaretlenmişse, durumunu güncelle
                        if healthy and self.gpus[gpu_id].status == "UNHEALTHY":
                            self.gpus[gpu_id].status = "AVAILABLE"
                            logger.info(f"GPU {gpu_id} tekrar kullanılabilir olarak işaretlendi")
                    except Exception as e:
                        logger.error(f"GPU {gpu_id} sağlık kontrolü başarısız: {str(e)}")

                # Bekle
                time.sleep(interval)
            except Exception as e:
                logger.error(f"Sağlık kontrolü döngüsü hatası: {str(e)}")
                time.sleep(interval)
