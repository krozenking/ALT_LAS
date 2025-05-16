# test_gpu_detection.py
import os
import sys
import yaml
import json
import logging

# Ana dizini ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Logger oluştur
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('test_gpu_detection')

def test_gpu_detection():
    """GPU algılama testi."""
    logger.info("GPU Algılama Testi Başlıyor...")
    
    try:
        # Konfigürasyon dosyasını yükle
        config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config.yaml')
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        # GPU Havuzu Yöneticisi'ni oluştur
        from gpu_pool_manager import NVMLGPUPoolManager
        gpu_manager = NVMLGPUPoolManager(config['gpu'])
        
        # Kullanılabilir GPU'ları al
        available_gpus = gpu_manager.discover_gpus()
        logger.info(f"Kullanılabilir GPU'lar: {available_gpus}")
        
        if not available_gpus:
            logger.error("Kullanılabilir GPU bulunamadı!")
            return False
        
        # Her GPU için bilgileri al
        for gpu_id in available_gpus:
            gpu_info = gpu_manager.get_gpu_info(gpu_id)
            
            logger.info(f"\nGPU {gpu_id} Bilgileri:")
            logger.info(f"  İsim: {gpu_info.name}")
            logger.info(f"  Hesaplama Yeteneği: {gpu_info.compute_capability}")
            logger.info(f"  Bellek: {gpu_info.memory_used / (1024**2):.2f} MB / {gpu_info.memory_total / (1024**2):.2f} MB")
            logger.info(f"  Kullanım Oranı: {gpu_info.utilization}%")
            logger.info(f"  Sıcaklık: {gpu_info.temperature}°C")
            logger.info(f"  Güç Kullanımı: {gpu_info.power_usage:.2f}W")
            logger.info(f"  Durum: {gpu_info.status}")
            logger.info(f"  Çalışan Süreçler: {len(gpu_info.processes)}")
            
            # Çalışan süreçleri yazdır
            if gpu_info.processes:
                logger.info("  Çalışan Süreçler:")
                for process in gpu_info.processes:
                    logger.info(f"    PID: {process['pid']}, İsim: {process['name']}, Bellek: {process['memory_used'] / (1024**2):.2f} MB")
        
        # GPU sağlık kontrolü
        logger.info("\nGPU Sağlık Kontrolü:")
        for gpu_id in available_gpus:
            healthy = gpu_manager.check_gpu_health(gpu_id)
            logger.info(f"  GPU {gpu_id}: {'Sağlıklı' if healthy else 'Sağlıksız'}")
        
        logger.info("\nGPU Algılama Testi Başarılı!")
        return True
    except Exception as e:
        logger.error(f"GPU Algılama Testi Başarısız: {str(e)}")
        return False

if __name__ == "__main__":
    test_gpu_detection()
