# test_error_handling.py
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
logger = logging.getLogger('test_error_handling')

def test_error_handling():
    """Hata durumu testi."""
    logger.info("Hata Durumu Testi Başlıyor...")
    
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
        test_config = config['test']['error_handling']
        scenarios = test_config.get('scenarios', [])
        
        if not scenarios:
            logger.error("Hata durumu testi için senaryo bulunamadı!")
            return False
        
        logger.info(f"Hata Durumu Testi Senaryoları: {len(scenarios)}")
        
        # Her senaryo için hata durumu testi yap
        for scenario in scenarios:
            scenario_name = scenario.get('name', 'unknown')
            
            logger.info(f"\nSenaryo: {scenario_name}")
            
            if scenario_name == "gpu_overload":
                # GPU aşırı yükleme senaryosu
                concurrent_tasks = scenario.get('concurrent_tasks', 10)
                input_size = scenario.get('input_size', 16384)
                output_size = scenario.get('output_size', 16384)
                duration = scenario.get('duration', 10)
                
                logger.info(f"  GPU Aşırı Yükleme Senaryosu")
                logger.info(f"  Parametreler: concurrent_tasks={concurrent_tasks}, input_size={input_size}, output_size={output_size}, duration={duration}")
                
                # Çok sayıda görev oluştur
                task_ids = []
                
                for i in range(concurrent_tasks):
                    params = {
                        'text': f'Bu bir GPU aşırı yükleme test metnidir {i}.',
                        'max_length': 128,
                        'temperature': 0.7,
                        'input_size': input_size,
                        'output_size': output_size,
                        'duration': duration
                    }
                    
                    # Görevi oluştur
                    task_id = workload_distributor.create_task('text_generation', params)
                    task_ids.append(task_id)
                    
                    logger.info(f"  Görev oluşturuldu: {task_id}")
                
                # Görevlerin tamamlanmasını bekle
                logger.info("  Görevlerin tamamlanması bekleniyor...")
                
                max_wait_time = duration + 10  # Görev süresi + 10 saniye
                wait_time = 0
                wait_interval = 0.5
                
                while wait_time < max_wait_time:
                    # Tüm görevlerin durumunu kontrol et
                    all_completed_or_failed = True
                    completed_count = 0
                    failed_count = 0
                    
                    for task_id in task_ids:
                        task_status = workload_distributor.get_task_status(task_id)
                        
                        if task_status['status'] == "COMPLETED":
                            completed_count += 1
                        elif task_status['status'] == "FAILED":
                            failed_count += 1
                        else:
                            all_completed_or_failed = False
                    
                    # Durumu yazdır
                    logger.info(f"  Durum: {completed_count}/{concurrent_tasks} tamamlandı, {failed_count}/{concurrent_tasks} başarısız")
                    
                    if all_completed_or_failed:
                        logger.info("  Tüm görevler tamamlandı veya başarısız oldu!")
                        break
                    
                    time.sleep(wait_interval)
                    wait_time += wait_interval
                
                # GPU durumunu kontrol et
                logger.info("\n  GPU Durumu:")
                for gpu_id in gpu_manager.gpus:
                    gpu_info = gpu_manager.get_gpu_info(gpu_id)
                    logger.info(f"    GPU {gpu_id} ({gpu_info.name}):")
                    logger.info(f"      Bellek: {gpu_info.memory_used / (1024**2):.2f} MB / {gpu_info.memory_total / (1024**2):.2f} MB")
                    logger.info(f"      Kullanım Oranı: {gpu_info.utilization}%")
                    logger.info(f"      Sıcaklık: {gpu_info.temperature}°C")
                    logger.info(f"      Durum: {gpu_info.status}")
                
                # Sonuçları analiz et
                logger.info("\n  Sonuçlar:")
                logger.info(f"    Tamamlanan Görev Sayısı: {completed_count}/{concurrent_tasks}")
                logger.info(f"    Başarısız Görev Sayısı: {failed_count}/{concurrent_tasks}")
                
                # Başarısız görevlerin hata mesajlarını kontrol et
                if failed_count > 0:
                    logger.info("\n  Başarısız Görevlerin Hata Mesajları:")
                    for task_id in task_ids:
                        task_status = workload_distributor.get_task_status(task_id)
                        if task_status['status'] == "FAILED":
                            logger.info(f"    Görev {task_id}: {task_status.get('error', 'Hata mesajı yok')}")
            
            elif scenario_name == "task_timeout":
                # Görev zaman aşımı senaryosu
                input_size = scenario.get('input_size', 8192)
                output_size = scenario.get('output_size', 8192)
                duration = scenario.get('duration', 310)  # Zaman aşımı süresi (300s) üzerinde
                
                logger.info(f"  Görev Zaman Aşımı Senaryosu")
                logger.info(f"  Parametreler: input_size={input_size}, output_size={output_size}, duration={duration}")
                
                # Uzun süreli görev oluştur
                params = {
                    'text': 'Bu bir görev zaman aşımı test metnidir.',
                    'max_length': 128,
                    'temperature': 0.7,
                    'input_size': input_size,
                    'output_size': output_size,
                    'duration': duration
                }
                
                # Görevi oluştur
                task_id = workload_distributor.create_task('text_generation', params)
                logger.info(f"  Görev oluşturuldu: {task_id}")
                
                # Görevi dağıt
                gpu_id = workload_distributor.distribute_task(task_id)
                
                if gpu_id is None:
                    logger.error("  Görev dağıtılamadı: Kullanılabilir GPU yok")
                    return False
                
                logger.info(f"  Görev GPU {gpu_id}'ye dağıtıldı")
                
                # Görevin durumunu kontrol et
                logger.info("  Görevin durumu kontrol ediliyor...")
                
                # Zaman aşımı süresinin yarısı kadar bekle
                timeout = config['gpu']['workload'].get('timeout', 300)
                wait_time = timeout / 2
                
                logger.info(f"  {wait_time} saniye bekleniyor...")
                time.sleep(wait_time)
                
                # Görev durumunu kontrol et
                task_status = workload_distributor.get_task_status(task_id)
                logger.info(f"  Görev Durumu: {task_status['status']}")
                
                # Görevi iptal et
                logger.info(f"  Görev iptal ediliyor...")
                result = workload_distributor.cancel_task(task_id)
                
                if result:
                    logger.info(f"  Görev başarıyla iptal edildi")
                else:
                    logger.error(f"  Görev iptal edilemedi")
                
                # Son durumu kontrol et
                task_status = workload_distributor.get_task_status(task_id)
                logger.info(f"  Son Görev Durumu: {task_status['status']}")
                
                # GPU durumunu kontrol et
                gpu_info = gpu_manager.get_gpu_info(gpu_id)
                logger.info(f"\n  GPU {gpu_id} Durumu:")
                logger.info(f"    İsim: {gpu_info.name}")
                logger.info(f"    Bellek: {gpu_info.memory_used / (1024**2):.2f} MB / {gpu_info.memory_total / (1024**2):.2f} MB")
                logger.info(f"    Kullanım Oranı: {gpu_info.utilization}%")
                logger.info(f"    Sıcaklık: {gpu_info.temperature}°C")
                logger.info(f"    Durum: {gpu_info.status}")
        
        logger.info("\nHata Durumu Testi Başarılı!")
        return True
    except Exception as e:
        logger.error(f"Hata Durumu Testi Başarısız: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_error_handling()
