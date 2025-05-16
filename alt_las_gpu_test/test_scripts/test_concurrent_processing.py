# test_concurrent_processing.py
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
logger = logging.getLogger('test_concurrent_processing')

def test_concurrent_processing():
    """Eşzamanlı işlem testi."""
    logger.info("Eşzamanlı İşlem Testi Başlıyor...")

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
        test_config = config['test']['concurrent_processing']
        concurrent_tasks = test_config.get('concurrent_tasks', 4)
        task_count = test_config.get('task_count', 20)
        input_size = test_config.get('input_size', 1024)
        output_size = test_config.get('output_size', 1024)
        duration = test_config.get('duration', 2)

        logger.info(f"Test Parametreleri: concurrent_tasks={concurrent_tasks}, task_count={task_count}, input_size={input_size}, output_size={output_size}, duration={duration}")

        # Test görevlerini oluştur
        task_ids = []

        for i in range(task_count):
            params = {
                'text': f'Bu test metni {i}',
                'max_length': 128,
                'temperature': 0.7,
                'input_size': input_size,
                'output_size': output_size,
                'duration': duration
            }

            # Görevi oluştur
            task_id = workload_distributor.create_task('text_generation', params)
            task_ids.append(task_id)

            logger.info(f"Görev oluşturuldu: {task_id}")

        # Görevlerin tamamlanmasını bekle
        logger.info("Görevlerin tamamlanması bekleniyor...")

        max_wait_time = duration * task_count + 30  # Tahmini toplam süre + 30 saniye
        wait_time = 0
        wait_interval = 0.5

        while wait_time < max_wait_time:
            # Tüm görevlerin durumunu kontrol et
            all_completed = True
            completed_count = 0
            failed_count = 0

            for task_id in task_ids:
                task_status = workload_distributor.get_task_status(task_id)

                if task_status['status'] == "COMPLETED":
                    completed_count += 1
                elif task_status['status'] == "FAILED":
                    failed_count += 1
                else:
                    all_completed = False

            # Durumu yazdır
            logger.info(f"Durum: {completed_count}/{task_count} tamamlandı, {failed_count} başarısız")

            if all_completed:
                logger.info("Tüm görevler tamamlandı!")
                break

            time.sleep(wait_interval)
            wait_time += wait_interval

        if wait_time >= max_wait_time:
            logger.error("Görevler zaman aşımına uğradı!")
            return False

        # Sonuçları analiz et
        task_results = []

        for task_id in task_ids:
            task_status = workload_distributor.get_task_status(task_id)
            task_results.append(task_status)

        # Başarı oranını hesapla
        success_count = sum(1 for task in task_results if task['status'] == "COMPLETED")
        success_rate = success_count / task_count

        logger.info(f"\nSonuçlar:")
        logger.info(f"  Toplam Görev Sayısı: {task_count}")
        logger.info(f"  Başarılı Görev Sayısı: {success_count}")
        logger.info(f"  Başarı Oranı: {success_rate:.2%}")

        # Ortalama çalışma süresini hesapla
        execution_times = [task['completed_at'] - task['started_at'] for task in task_results if task['status'] == "COMPLETED" and task['completed_at'] is not None and task['started_at'] is not None]

        if execution_times:
            avg_execution_time = sum(execution_times) / len(execution_times)
            logger.info(f"  Ortalama Çalışma Süresi: {avg_execution_time:.2f} saniye")

        # GPU durumunu kontrol et
        logger.info("\nGPU Durumu:")
        for gpu_id in gpu_manager.gpus:
            gpu_info = gpu_manager.get_gpu_info(gpu_id)
            logger.info(f"  GPU {gpu_id} ({gpu_info.name}):")
            logger.info(f"    Bellek: {gpu_info.memory_used / (1024**2):.2f} MB / {gpu_info.memory_total / (1024**2):.2f} MB")
            logger.info(f"    Kullanım Oranı: {gpu_info.utilization}%")
            logger.info(f"    Sıcaklık: {gpu_info.temperature}°C")
            logger.info(f"    Durum: {gpu_info.status}")

        logger.info("\nEşzamanlı İşlem Testi Başarılı!")
        return True
    except Exception as e:
        logger.error(f"Eşzamanlı İşlem Testi Başarısız: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_concurrent_processing()
