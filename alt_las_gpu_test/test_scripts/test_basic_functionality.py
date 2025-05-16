# test_basic_functionality.py
import os
import sys
import yaml
import json
import time
import logging

# Ana dizini ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Logger oluştur
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('test_basic_functionality')

def test_basic_functionality():
    """Temel işlevsellik testi."""
    logger.info("Temel İşlevsellik Testi Başlıyor...")
    
    try:
        # Konfigürasyon dosyasını yükle
        config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config.yaml')
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        # GPU Havuzu Yöneticisi'ni oluştur
        from gpu_pool_manager import NVMLGPUPoolManager
        gpu_manager = NVMLGPUPoolManager(config['gpu'])
        
        # Strateji Seçici'yi oluştur
        from gpu_selection_strategy import StrategySelector
        strategy_selector = StrategySelector(config['gpu'])
        
        # İş Yükü Dağıtıcı'yı oluştur
        from workload_distributor import WorkloadDistributor
        workload_distributor = WorkloadDistributor(gpu_manager, strategy_selector, config['gpu'])
        
        # Test parametrelerini al
        test_config = config['test']['basic_functionality']
        input_size = test_config.get('input_size', 1024)
        output_size = test_config.get('output_size', 1024)
        duration = test_config.get('duration', 5)
        
        logger.info(f"Test Parametreleri: input_size={input_size}, output_size={output_size}, duration={duration}")
        
        # Test görevi oluştur
        params = {
            'text': 'Bu bir test metnidir.',
            'max_length': 128,
            'temperature': 0.7,
            'input_size': input_size,
            'output_size': output_size,
            'duration': duration
        }
        
        # Görevi oluştur
        task_id = workload_distributor.create_task('text_generation', params)
        logger.info(f"Görev oluşturuldu: {task_id}")
        
        # Görevi dağıt
        gpu_id = workload_distributor.distribute_task(task_id)
        
        if gpu_id is None:
            logger.error("Görev dağıtılamadı: Kullanılabilir GPU yok")
            return False
        
        logger.info(f"Görev GPU {gpu_id}'ye dağıtıldı")
        
        # Görev durumunu kontrol et
        task_status = workload_distributor.get_task_status(task_id)
        logger.info(f"Görev Durumu: {task_status['status']}")
        
        # Görevin tamamlanmasını bekle
        logger.info("Görevin tamamlanması bekleniyor...")
        
        max_wait_time = duration + 5  # Görev süresi + 5 saniye
        wait_time = 0
        wait_interval = 0.5
        
        while wait_time < max_wait_time:
            task_status = workload_distributor.get_task_status(task_id)
            
            if task_status['status'] == "COMPLETED":
                logger.info(f"Görev tamamlandı: {task_status}")
                break
            elif task_status['status'] == "FAILED":
                logger.error(f"Görev başarısız oldu: {task_status}")
                return False
            
            time.sleep(wait_interval)
            wait_time += wait_interval
        
        if wait_time >= max_wait_time:
            logger.error(f"Görev zaman aşımına uğradı: {task_status}")
            return False
        
        # GPU durumunu kontrol et
        gpu_info = gpu_manager.get_gpu_info(gpu_id)
        logger.info(f"\nGPU {gpu_id} Durumu:")
        logger.info(f"  İsim: {gpu_info.name}")
        logger.info(f"  Bellek: {gpu_info.memory_used / (1024**2):.2f} MB / {gpu_info.memory_total / (1024**2):.2f} MB")
        logger.info(f"  Kullanım Oranı: {gpu_info.utilization}%")
        logger.info(f"  Sıcaklık: {gpu_info.temperature}°C")
        logger.info(f"  Durum: {gpu_info.status}")
        
        logger.info("\nTemel İşlevsellik Testi Başarılı!")
        return True
    except Exception as e:
        logger.error(f"Temel İşlevsellik Testi Başarısız: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_basic_functionality()
