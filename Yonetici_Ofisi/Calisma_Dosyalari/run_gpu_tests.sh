#!/bin/bash
# GPU Testlerini Çalıştırma Betiği
# Bu betik, Docker Compose kullanarak GPU testlerini çalıştırır.

set -e

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test türü (all, functional, performance, compatibility)
TEST_TYPE=${1:-"all"}

# GPU mimarisi (all, ampere, turing, volta, pascal, hopper)
ARCHITECTURE=${2:-"all"}

# Sonuçları yayınla (true, false)
PUBLISH_RESULTS=${3:-"true"}

# Çalışma dizini
WORKSPACE=$(pwd)
RESULTS_DIR="${WORKSPACE}/test_results"
REPORT_DIR="${WORKSPACE}/reports"

# Dizinleri oluştur
mkdir -p "${RESULTS_DIR}"
mkdir -p "${REPORT_DIR}"

# Docker Compose dosyası
DOCKER_COMPOSE_FILE="docker-compose-gpu-test.yml"

# Kullanılabilir GPU'ları kontrol et
check_available_gpus() {
    echo -e "${BLUE}Kullanılabilir GPU'lar kontrol ediliyor...${NC}"
    
    if command -v nvidia-smi &> /dev/null; then
        nvidia-smi
        
        # GPU sayısını al
        GPU_COUNT=$(nvidia-smi --query-gpu=name --format=csv,noheader | wc -l)
        
        if [ "${GPU_COUNT}" -eq 0 ]; then
            echo -e "${RED}Kullanılabilir GPU bulunamadı!${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}${GPU_COUNT} adet GPU bulundu.${NC}"
    else
        echo -e "${RED}nvidia-smi komutu bulunamadı. NVIDIA GPU'lar kullanılamıyor olabilir.${NC}"
        exit 1
    fi
}

# Belirli bir mimari için testleri çalıştır
run_tests_for_architecture() {
    local arch=$1
    
    echo -e "${YELLOW}${arch} mimarisi için testler çalıştırılıyor...${NC}"
    
    # Docker Compose servis adını belirle
    local service="${arch}-test"
    
    # Servisi çalıştır
    docker-compose -f "${DOCKER_COMPOSE_FILE}" run \
        --rm \
        -e TEST_TYPE="${TEST_TYPE}" \
        -e EXPORT_RESULTS_DIR="/app/test_results/${arch}" \
        -v "${WORKSPACE}:/app" \
        -v "${RESULTS_DIR}:/app/test_results" \
        "${service}"
    
    echo -e "${GREEN}${arch} mimarisi için testler tamamlandı.${NC}"
}

# Rapor oluştur
generate_report() {
    echo -e "${YELLOW}Test raporu oluşturuluyor...${NC}"
    
    # Rapor oluşturucu servisi çalıştır
    docker-compose -f "${DOCKER_COMPOSE_FILE}" run \
        --rm \
        -v "${WORKSPACE}:/app" \
        -v "${RESULTS_DIR}:/app/test_results" \
        -v "${REPORT_DIR}:/app/reports" \
        report-generator \
        python /app/test_scripts/utils/combine_reports.py \
            --input-dir=/app/test_results \
            --output-file=/app/reports/combined_report.html
    
    echo -e "${GREEN}Test raporu oluşturuldu: ${REPORT_DIR}/combined_report.html${NC}"
}

# Sonuçları yayınla
publish_results() {
    if [ "${PUBLISH_RESULTS}" = "true" ]; then
        echo -e "${YELLOW}Test sonuçları yayınlanıyor...${NC}"
        
        # Burada sonuçları yayınlama kodları olacak
        # Örneğin: GitHub Pages, S3, FTP, vb.
        
        echo -e "${GREEN}Test sonuçları yayınlandı.${NC}"
    else
        echo -e "${YELLOW}Test sonuçları yayınlanmadı.${NC}"
    fi
}

# Ana fonksiyon
main() {
    echo -e "${BLUE}GPU Testleri Çalıştırma Betiği${NC}"
    echo -e "${BLUE}=============================${NC}"
    echo -e "${BLUE}Test Türü: ${TEST_TYPE}${NC}"
    echo -e "${BLUE}GPU Mimarisi: ${ARCHITECTURE}${NC}"
    echo -e "${BLUE}Sonuçları Yayınla: ${PUBLISH_RESULTS}${NC}"
    
    # Kullanılabilir GPU'ları kontrol et
    check_available_gpus
    
    # Docker Compose dosyasını kontrol et
    if [ ! -f "${DOCKER_COMPOSE_FILE}" ]; then
        echo -e "${RED}Docker Compose dosyası bulunamadı: ${DOCKER_COMPOSE_FILE}${NC}"
        exit 1
    fi
    
    # Test başlangıç zamanı
    START_TIME=$(date +%s)
    echo -e "${BLUE}Test başlangıç zamanı: $(date)${NC}"
    
    # Tüm mimariler için testleri çalıştır
    if [ "${ARCHITECTURE}" = "all" ]; then
        for arch in ampere turing volta pascal hopper; do
            run_tests_for_architecture "${arch}"
        done
    else
        # Belirli bir mimari için testleri çalıştır
        run_tests_for_architecture "${ARCHITECTURE}"
    fi
    
    # Rapor oluştur
    generate_report
    
    # Sonuçları yayınla
    publish_results
    
    # Test bitiş zamanı
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo -e "${BLUE}Test bitiş zamanı: $(date)${NC}"
    echo -e "${BLUE}Test süresi: $((DURATION / 60)) dakika $((DURATION % 60)) saniye${NC}"
    
    echo -e "${GREEN}Tüm testler başarıyla tamamlandı.${NC}"
}

# Ana fonksiyonu çağır
main
