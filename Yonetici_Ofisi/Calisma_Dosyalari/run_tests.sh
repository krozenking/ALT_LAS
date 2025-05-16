#!/bin/bash
# GPU Test Senaryolarını Çalıştırma Betiği
# Bu betik, GPU test senaryolarını çalıştırmak için kullanılır.

set -e

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test türü (fonksiyonel, performans, uyumluluk)
TEST_TYPE=${1:-"all"}

# Test sonuçları dizini
RESULTS_DIR="/app/test_results"
mkdir -p ${RESULTS_DIR}

# GPU bilgilerini al
echo -e "${BLUE}GPU Bilgileri:${NC}"
nvidia-smi

# CUDA sürümünü kontrol et
echo -e "${BLUE}CUDA Sürümü:${NC}"
nvcc --version

# Python sürümünü kontrol et
echo -e "${BLUE}Python Sürümü:${NC}"
python --version

# Sistem bilgilerini al
echo -e "${BLUE}Sistem Bilgileri:${NC}"
lscpu | grep "Model name"
free -h | grep "Mem:"
df -h | grep "/app"

# Test ortamını hazırla
echo -e "${BLUE}Test ortamı hazırlanıyor...${NC}"
python -m pip install -e /app

# Test başlangıç zamanı
START_TIME=$(date +%s)
echo -e "${BLUE}Test başlangıç zamanı: $(date)${NC}"

# Fonksiyonel testleri çalıştır
run_functional_tests() {
    echo -e "${YELLOW}Fonksiyonel testler çalıştırılıyor...${NC}"
    
    # Temel işlevsellik testleri
    echo -e "${BLUE}Temel işlevsellik testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/functional/test_basic_functionality.py -v \
        --html=${RESULTS_DIR}/functional_basic_report.html \
        --self-contained-html
    
    # Model yükleme testleri
    echo -e "${BLUE}Model yükleme testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/functional/test_model_loading.py -v \
        --html=${RESULTS_DIR}/functional_model_loading_report.html \
        --self-contained-html
    
    # Çıkarım testleri
    echo -e "${BLUE}Çıkarım testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/functional/test_inference.py -v \
        --html=${RESULTS_DIR}/functional_inference_report.html \
        --self-contained-html
    
    # Eğitim testleri
    echo -e "${BLUE}Eğitim testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/functional/test_training.py -v \
        --html=${RESULTS_DIR}/functional_training_report.html \
        --self-contained-html
    
    # GPU İstek Yönlendirme testleri
    echo -e "${BLUE}GPU İstek Yönlendirme testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/functional/test_gpu_request_routing.py -v \
        --html=${RESULTS_DIR}/functional_gpu_request_routing_report.html \
        --self-contained-html
    
    # Bellek yönetimi testleri
    echo -e "${BLUE}Bellek yönetimi testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/functional/test_memory_management.py -v \
        --html=${RESULTS_DIR}/functional_memory_management_report.html \
        --self-contained-html
    
    echo -e "${GREEN}Fonksiyonel testler tamamlandı.${NC}"
}

# Performans testlerini çalıştır
run_performance_tests() {
    echo -e "${YELLOW}Performans testleri çalıştırılıyor...${NC}"
    
    # Çıkarım hızı testleri
    echo -e "${BLUE}Çıkarım hızı testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/performance/test_inference_speed.py -v \
        --benchmark-json=${RESULTS_DIR}/inference_speed_benchmark.json \
        --html=${RESULTS_DIR}/performance_inference_speed_report.html \
        --self-contained-html
    
    # Çıkarım gecikmesi testleri
    echo -e "${BLUE}Çıkarım gecikmesi testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/performance/test_inference_latency.py -v \
        --benchmark-json=${RESULTS_DIR}/inference_latency_benchmark.json \
        --html=${RESULTS_DIR}/performance_inference_latency_report.html \
        --self-contained-html
    
    # Bellek kullanımı testleri
    echo -e "${BLUE}Bellek kullanımı testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/performance/test_memory_usage.py -v \
        --benchmark-json=${RESULTS_DIR}/memory_usage_benchmark.json \
        --html=${RESULTS_DIR}/performance_memory_usage_report.html \
        --self-contained-html
    
    # GPU kullanımı testleri
    echo -e "${BLUE}GPU kullanımı testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/performance/test_gpu_utilization.py -v \
        --benchmark-json=${RESULTS_DIR}/gpu_utilization_benchmark.json \
        --html=${RESULTS_DIR}/performance_gpu_utilization_report.html \
        --self-contained-html
    
    # Yük testleri
    echo -e "${BLUE}Yük testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/performance/test_load.py -v \
        --benchmark-json=${RESULTS_DIR}/load_benchmark.json \
        --html=${RESULTS_DIR}/performance_load_report.html \
        --self-contained-html
    
    echo -e "${GREEN}Performans testleri tamamlandı.${NC}"
}

# Uyumluluk testlerini çalıştır
run_compatibility_tests() {
    echo -e "${YELLOW}Uyumluluk testleri çalıştırılıyor...${NC}"
    
    # CUDA sürüm uyumluluğu testleri
    echo -e "${BLUE}CUDA sürüm uyumluluğu testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/compatibility/test_cuda_version.py -v \
        --html=${RESULTS_DIR}/compatibility_cuda_version_report.html \
        --self-contained-html
    
    # Sürücü sürüm uyumluluğu testleri
    echo -e "${BLUE}Sürücü sürüm uyumluluğu testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/compatibility/test_driver_version.py -v \
        --html=${RESULTS_DIR}/compatibility_driver_version_report.html \
        --self-contained-html
    
    # Konteyner uyumluluğu testleri
    echo -e "${BLUE}Konteyner uyumluluğu testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/compatibility/test_container.py -v \
        --html=${RESULTS_DIR}/compatibility_container_report.html \
        --self-contained-html
    
    # Mimari özellik uyumluluğu testleri
    echo -e "${BLUE}Mimari özellik uyumluluğu testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/compatibility/test_architecture_features.py -v \
        --html=${RESULTS_DIR}/compatibility_architecture_features_report.html \
        --self-contained-html
    
    # Bellek boyutu uyumluluğu testleri
    echo -e "${BLUE}Bellek boyutu uyumluluğu testleri çalıştırılıyor...${NC}"
    python -m pytest /app/test_scripts/compatibility/test_memory_size.py -v \
        --html=${RESULTS_DIR}/compatibility_memory_size_report.html \
        --self-contained-html
    
    echo -e "${GREEN}Uyumluluk testleri tamamlandı.${NC}"
}

# Test sonuçlarını birleştir
combine_test_results() {
    echo -e "${YELLOW}Test sonuçları birleştiriliyor...${NC}"
    
    # Test sonuçlarını birleştir
    python /app/test_scripts/utils/combine_reports.py \
        --input-dir=${RESULTS_DIR} \
        --output-file=${RESULTS_DIR}/combined_report.html
    
    echo -e "${GREEN}Test sonuçları birleştirildi: ${RESULTS_DIR}/combined_report.html${NC}"
}

# Test türüne göre testleri çalıştır
case ${TEST_TYPE} in
    "functional")
        run_functional_tests
        ;;
    "performance")
        run_performance_tests
        ;;
    "compatibility")
        run_compatibility_tests
        ;;
    "all")
        run_functional_tests
        run_performance_tests
        run_compatibility_tests
        ;;
    *)
        echo -e "${RED}Geçersiz test türü: ${TEST_TYPE}${NC}"
        echo -e "${YELLOW}Kullanım: $0 [functional|performance|compatibility|all]${NC}"
        exit 1
        ;;
esac

# Test sonuçlarını birleştir
combine_test_results

# Test bitiş zamanı
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo -e "${BLUE}Test bitiş zamanı: $(date)${NC}"
echo -e "${BLUE}Test süresi: $((DURATION / 60)) dakika $((DURATION % 60)) saniye${NC}"

# Test sonuçlarını göster
echo -e "${YELLOW}Test sonuçları: ${RESULTS_DIR}/combined_report.html${NC}"

# Test sonuçlarını dışa aktar
if [ -n "${EXPORT_RESULTS_DIR}" ]; then
    echo -e "${BLUE}Test sonuçları dışa aktarılıyor: ${EXPORT_RESULTS_DIR}${NC}"
    mkdir -p ${EXPORT_RESULTS_DIR}
    cp -r ${RESULTS_DIR}/* ${EXPORT_RESULTS_DIR}/
    echo -e "${GREEN}Test sonuçları dışa aktarıldı: ${EXPORT_RESULTS_DIR}${NC}"
fi

echo -e "${GREEN}Testler tamamlandı.${NC}"
exit 0
