# test_performance.py
import os
import sys
import yaml
import json
import time
import logging
import matplotlib.pyplot as plt
import numpy as np

# Ana dizini ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Logger oluştur
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('test_performance')

def test_performance():
    """Performans testi."""
    logger.info("Performans Testi Başlıyor...")
    
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
        test_config = config['test']['performance']
        scenarios = test_config.get('scenarios', [])
        
        if not scenarios:
            logger.error("Performans testi için senaryo bulunamadı!")
            return False
        
        logger.info(f"Performans Testi Senaryoları: {len(scenarios)}")
        
        # Her senaryo için performans testi yap
        results = {}
        
        for scenario in scenarios:
            scenario_name = scenario.get('name', 'unknown')
            input_size = scenario.get('input_size', 1024)
            output_size = scenario.get('output_size', 1024)
            duration = scenario.get('duration', 5)
            
            logger.info(f"\nSenaryo: {scenario_name}")
            logger.info(f"  Parametreler: input_size={input_size}, output_size={output_size}, duration={duration}")
            
            # GPU metriklerini izlemek için
            gpu_metrics = []
            
            # GPU izleme thread'i
            def monitor_gpu():
                start_time = time.time()
                
                while time.time() - start_time < duration + 2:  # Görev süresi + 2 saniye
                    metrics = {}
                    
                    for gpu_id in gpu_manager.gpus:
                        gpu_info = gpu_manager.get_gpu_info(gpu_id)
                        metrics[gpu_id] = {
                            'timestamp': time.time() - start_time,
                            'memory_used': gpu_info.memory_used,
                            'memory_total': gpu_info.memory_total,
                            'utilization': gpu_info.utilization,
                            'temperature': gpu_info.temperature,
                            'power_usage': gpu_info.power_usage
                        }
                    
                    gpu_metrics.append(metrics)
                    time.sleep(0.1)  # 100ms aralıklarla ölçüm
            
            import threading
            monitor_thread = threading.Thread(target=monitor_gpu)
            monitor_thread.daemon = True
            
            # Test görevi oluştur
            params = {
                'text': f'Bu bir {scenario_name} test metnidir.',
                'max_length': 128,
                'temperature': 0.7,
                'input_size': input_size,
                'output_size': output_size,
                'duration': duration
            }
            
            # GPU izleme thread'ini başlat
            monitor_thread.start()
            
            # Görevi oluştur ve çalıştır
            start_time = time.time()
            
            task_id = workload_distributor.create_task('text_generation', params)
            logger.info(f"  Görev oluşturuldu: {task_id}")
            
            gpu_id = workload_distributor.distribute_task(task_id)
            
            if gpu_id is None:
                logger.error("  Görev dağıtılamadı: Kullanılabilir GPU yok")
                return False
            
            logger.info(f"  Görev GPU {gpu_id}'ye dağıtıldı")
            
            # Görevin tamamlanmasını bekle
            logger.info("  Görevin tamamlanması bekleniyor...")
            
            max_wait_time = duration + 5  # Görev süresi + 5 saniye
            wait_time = 0
            wait_interval = 0.1
            
            while wait_time < max_wait_time:
                task_status = workload_distributor.get_task_status(task_id)
                
                if task_status['status'] == "COMPLETED":
                    end_time = time.time()
                    logger.info(f"  Görev tamamlandı: {task_status}")
                    break
                elif task_status['status'] == "FAILED":
                    logger.error(f"  Görev başarısız oldu: {task_status}")
                    return False
                
                time.sleep(wait_interval)
                wait_time += wait_interval
            
            if wait_time >= max_wait_time:
                logger.error(f"  Görev zaman aşımına uğradı: {task_status}")
                return False
            
            # GPU izleme thread'inin tamamlanmasını bekle
            monitor_thread.join()
            
            # Sonuçları kaydet
            task_status = workload_distributor.get_task_status(task_id)
            
            results[scenario_name] = {
                'task_id': task_id,
                'gpu_id': gpu_id,
                'input_size': input_size,
                'output_size': output_size,
                'duration': duration,
                'execution_time': end_time - start_time,
                'gpu_metrics': gpu_metrics
            }
            
            logger.info(f"  Çalışma Süresi: {end_time - start_time:.2f} saniye")
        
        # Sonuçları analiz et ve görselleştir
        logger.info("\nPerformans Testi Sonuçları:")
        
        for scenario_name, result in results.items():
            logger.info(f"\nSenaryo: {scenario_name}")
            logger.info(f"  Giriş Boyutu: {result['input_size']}")
            logger.info(f"  Çıkış Boyutu: {result['output_size']}")
            logger.info(f"  Görev Süresi: {result['duration']} saniye")
            logger.info(f"  Çalışma Süresi: {result['execution_time']:.2f} saniye")
            
            # GPU metriklerini analiz et
            gpu_id = result['gpu_id']
            timestamps = [m[gpu_id]['timestamp'] for m in result['gpu_metrics']]
            memory_used = [m[gpu_id]['memory_used'] / (1024**2) for m in result['gpu_metrics']]  # MB cinsinden
            utilization = [m[gpu_id]['utilization'] for m in result['gpu_metrics']]
            temperature = [m[gpu_id]['temperature'] for m in result['gpu_metrics']]
            power_usage = [m[gpu_id]['power_usage'] for m in result['gpu_metrics']]
            
            # Ortalama değerleri hesapla
            avg_memory_used = sum(memory_used) / len(memory_used) if memory_used else 0
            avg_utilization = sum(utilization) / len(utilization) if utilization else 0
            avg_temperature = sum(temperature) / len(temperature) if temperature else 0
            avg_power_usage = sum(power_usage) / len(power_usage) if power_usage else 0
            
            # Maksimum değerleri bul
            max_memory_used = max(memory_used) if memory_used else 0
            max_utilization = max(utilization) if utilization else 0
            max_temperature = max(temperature) if temperature else 0
            max_power_usage = max(power_usage) if power_usage else 0
            
            logger.info(f"  GPU {gpu_id} Metrikleri:")
            logger.info(f"    Ortalama Bellek Kullanımı: {avg_memory_used:.2f} MB")
            logger.info(f"    Maksimum Bellek Kullanımı: {max_memory_used:.2f} MB")
            logger.info(f"    Ortalama GPU Kullanımı: {avg_utilization:.2f}%")
            logger.info(f"    Maksimum GPU Kullanımı: {max_utilization:.2f}%")
            logger.info(f"    Ortalama Sıcaklık: {avg_temperature:.2f}°C")
            logger.info(f"    Maksimum Sıcaklık: {max_temperature:.2f}°C")
            logger.info(f"    Ortalama Güç Kullanımı: {avg_power_usage:.2f}W")
            logger.info(f"    Maksimum Güç Kullanımı: {max_power_usage:.2f}W")
        
        logger.info("\nPerformans Testi Başarılı!")
        return True
    except Exception as e:
        logger.error(f"Performans Testi Başarısız: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_performance()
