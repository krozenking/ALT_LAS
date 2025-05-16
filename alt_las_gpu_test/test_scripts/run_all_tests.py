# run_all_tests.py
import os
import sys
import yaml
import logging
import time

# Ana dizini ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Logger oluştur
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('run_all_tests')

def run_all_tests():
    """Tüm testleri çalıştır."""
    logger.info("Tüm Testler Başlıyor...")
    
    try:
        # Konfigürasyon dosyasını yükle
        config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config.yaml')
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        # Test sonuçları
        results = {}
        
        # GPU Algılama Testi
        if config['test']['detection'].get('enabled', True):
            logger.info("\n=== GPU Algılama Testi ===")
            from test_gpu_detection import test_gpu_detection
            start_time = time.time()
            results['gpu_detection'] = test_gpu_detection()
            end_time = time.time()
            logger.info(f"GPU Algılama Testi: {'Başarılı' if results['gpu_detection'] else 'Başarısız'} ({end_time - start_time:.2f}s)")
        
        # Temel İşlevsellik Testi
        if config['test']['basic_functionality'].get('enabled', True):
            logger.info("\n=== Temel İşlevsellik Testi ===")
            from test_basic_functionality import test_basic_functionality
            start_time = time.time()
            results['basic_functionality'] = test_basic_functionality()
            end_time = time.time()
            logger.info(f"Temel İşlevsellik Testi: {'Başarılı' if results['basic_functionality'] else 'Başarısız'} ({end_time - start_time:.2f}s)")
        
        # Eşzamanlı İşlem Testi
        if config['test']['concurrent_processing'].get('enabled', True):
            logger.info("\n=== Eşzamanlı İşlem Testi ===")
            from test_concurrent_processing import test_concurrent_processing
            start_time = time.time()
            results['concurrent_processing'] = test_concurrent_processing()
            end_time = time.time()
            logger.info(f"Eşzamanlı İşlem Testi: {'Başarılı' if results['concurrent_processing'] else 'Başarısız'} ({end_time - start_time:.2f}s)")
        
        # Performans Testi
        if config['test']['performance'].get('enabled', True):
            logger.info("\n=== Performans Testi ===")
            from test_performance import test_performance
            start_time = time.time()
            results['performance'] = test_performance()
            end_time = time.time()
            logger.info(f"Performans Testi: {'Başarılı' if results['performance'] else 'Başarısız'} ({end_time - start_time:.2f}s)")
        
        # Hata Durumu Testi
        if config['test']['error_handling'].get('enabled', True):
            logger.info("\n=== Hata Durumu Testi ===")
            from test_error_handling import test_error_handling
            start_time = time.time()
            results['error_handling'] = test_error_handling()
            end_time = time.time()
            logger.info(f"Hata Durumu Testi: {'Başarılı' if results['error_handling'] else 'Başarısız'} ({end_time - start_time:.2f}s)")
        
        # Sonuçları özetle
        logger.info("\n=== Test Sonuçları ===")
        all_passed = True
        
        for test_name, result in results.items():
            logger.info(f"{test_name}: {'Başarılı' if result else 'Başarısız'}")
            all_passed = all_passed and result
        
        logger.info(f"\nTüm Testler: {'Başarılı' if all_passed else 'Başarısız'}")
        
        return all_passed
    except Exception as e:
        logger.error(f"Testler çalıştırılırken hata oluştu: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    run_all_tests()
