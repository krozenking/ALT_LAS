#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Çoklu GPU Desteği Test Çalıştırma Betiği

Bu betik, çoklu GPU desteği için tüm testleri çalıştırır.
"""

import unittest
import sys
import os
import argparse
import time

# Modül yolunu ekle
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Test modüllerini içe aktar
import test_gpu_pool_manager
import test_gpu_selection_strategy
import test_workload_distributor
import test_api_extensions
import test_integration
import test_performance

def run_unit_tests():
    """Birim testlerini çalıştır."""
    print("\n=== Birim Testleri ===\n")
    
    # Test süitlerini oluştur
    test_suites = [
        unittest.TestLoader().loadTestsFromModule(test_gpu_pool_manager),
        unittest.TestLoader().loadTestsFromModule(test_gpu_selection_strategy),
        unittest.TestLoader().loadTestsFromModule(test_workload_distributor),
        unittest.TestLoader().loadTestsFromModule(test_api_extensions)
    ]
    
    # Tüm test süitlerini birleştir
    all_tests = unittest.TestSuite(test_suites)
    
    # Testleri çalıştır
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(all_tests)
    
    return result.wasSuccessful()

def run_integration_tests():
    """Entegrasyon testlerini çalıştır."""
    print("\n=== Entegrasyon Testleri ===\n")
    
    # Test süitini oluştur
    test_suite = unittest.TestLoader().loadTestsFromModule(test_integration)
    
    # Testleri çalıştır
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result.wasSuccessful()

def run_performance_tests():
    """Performans testlerini çalıştır."""
    print("\n=== Performans Testleri ===\n")
    
    # Test süitini oluştur
    test_suite = unittest.TestLoader().loadTestsFromModule(test_performance)
    
    # Testleri çalıştır
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result.wasSuccessful()

def run_all_tests():
    """Tüm testleri çalıştır."""
    print("\n=== Tüm Testler ===\n")
    
    # Başlangıç zamanını kaydet
    start_time = time.time()
    
    # Birim testlerini çalıştır
    unit_tests_success = run_unit_tests()
    
    # Entegrasyon testlerini çalıştır
    integration_tests_success = run_integration_tests()
    
    # Performans testlerini çalıştır
    performance_tests_success = run_performance_tests()
    
    # Bitiş zamanını kaydet
    end_time = time.time()
    
    # Toplam süreyi hesapla
    total_time = end_time - start_time
    
    # Sonuçları yazdır
    print("\n=== Test Sonuçları ===\n")
    print(f"Birim Testleri: {'Başarılı' if unit_tests_success else 'Başarısız'}")
    print(f"Entegrasyon Testleri: {'Başarılı' if integration_tests_success else 'Başarısız'}")
    print(f"Performans Testleri: {'Başarılı' if performance_tests_success else 'Başarısız'}")
    print(f"Toplam Süre: {total_time:.2f} saniye")
    
    # Tüm testlerin başarılı olup olmadığını döndür
    return unit_tests_success and integration_tests_success and performance_tests_success

if __name__ == '__main__':
    # Komut satırı argümanlarını ayrıştır
    parser = argparse.ArgumentParser(description='Çoklu GPU Desteği Testleri')
    parser.add_argument('--unit', action='store_true', help='Sadece birim testlerini çalıştır')
    parser.add_argument('--integration', action='store_true', help='Sadece entegrasyon testlerini çalıştır')
    parser.add_argument('--performance', action='store_true', help='Sadece performans testlerini çalıştır')
    parser.add_argument('--all', action='store_true', help='Tüm testleri çalıştır')
    
    args = parser.parse_args()
    
    # Hiçbir argüman belirtilmemişse, tüm testleri çalıştır
    if not (args.unit or args.integration or args.performance or args.all):
        args.all = True
        
    # Testleri çalıştır
    success = True
    
    if args.unit:
        success = success and run_unit_tests()
        
    if args.integration:
        success = success and run_integration_tests()
        
    if args.performance:
        success = success and run_performance_tests()
        
    if args.all:
        success = run_all_tests()
        
    # Çıkış kodu belirle
    sys.exit(0 if success else 1)
