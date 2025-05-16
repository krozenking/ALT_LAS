#!/bin/bash
# GPU Test Konteynerlarını Oluşturma Betiği
# Bu betik, farklı GPU mimarileri için test konteynerlarını oluşturur.

set -e

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Docker registry
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"registry.alt-las.com"}
PROJECT_NAME=${PROJECT_NAME:-"gpu-test"}

# GPU mimarisi (ampere, turing, volta, pascal, hopper, all)
ARCHITECTURE=${1:-"all"}

# CUDA sürümlerini tanımla
declare -A CUDA_VERSIONS=(
    ["ampere"]="11.4"
    ["turing"]="11.1"
    ["volta"]="10.2"
    ["pascal"]="10.0"
    ["hopper"]="11.8"
)

# Konteyner oluştur
build_container() {
    local arch=$1
    local cuda_version=${CUDA_VERSIONS[$arch]}
    
    echo -e "${BLUE}${arch} mimarisi için test konteyneri oluşturuluyor (CUDA ${cuda_version})...${NC}"
    
    docker build \
        -t ${DOCKER_REGISTRY}/${PROJECT_NAME}:${arch}-cuda-${cuda_version} \
        --build-arg CUDA_VERSION=${cuda_version} \
        -f gpu_test_ortami_dockerfile .
    
    echo -e "${GREEN}${arch} mimarisi için test konteyneri oluşturuldu.${NC}"
}

# Rapor oluşturucu konteynerini oluştur
build_report_generator() {
    echo -e "${BLUE}Rapor oluşturucu konteyneri oluşturuluyor...${NC}"
    
    docker build \
        -t ${DOCKER_REGISTRY}/${PROJECT_NAME}:report-generator \
        --build-arg CUDA_VERSION=11.4 \
        -f gpu_test_ortami_dockerfile .
    
    echo -e "${GREEN}Rapor oluşturucu konteyneri oluşturuldu.${NC}"
}

# Docker registry'ye giriş yap
docker_login() {
    echo -e "${BLUE}Docker registry'ye giriş yapılıyor...${NC}"
    
    if [ -z "${DOCKER_USERNAME}" ] || [ -z "${DOCKER_PASSWORD}" ]; then
        echo -e "${YELLOW}Docker kullanıcı adı ve şifresi belirtilmedi, giriş yapılmayacak.${NC}"
        return
    fi
    
    echo "${DOCKER_PASSWORD}" | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USERNAME} --password-stdin
    
    echo -e "${GREEN}Docker registry'ye giriş yapıldı.${NC}"
}

# Konteynerleri registry'ye gönder
push_containers() {
    local arch=$1
    local cuda_version=${CUDA_VERSIONS[$arch]}
    
    echo -e "${BLUE}${arch} mimarisi için test konteyneri gönderiliyor...${NC}"
    
    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}:${arch}-cuda-${cuda_version}
    
    echo -e "${GREEN}${arch} mimarisi için test konteyneri gönderildi.${NC}"
}

# Rapor oluşturucu konteynerini registry'ye gönder
push_report_generator() {
    echo -e "${BLUE}Rapor oluşturucu konteyneri gönderiliyor...${NC}"
    
    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}:report-generator
    
    echo -e "${GREEN}Rapor oluşturucu konteyneri gönderildi.${NC}"
}

# Ana fonksiyon
main() {
    echo -e "${BLUE}GPU Test Konteynerları Oluşturma Betiği${NC}"
    echo -e "${BLUE}=======================================${NC}"
    
    # Docker registry'ye giriş yap
    docker_login
    
    # Tüm mimariler için konteyner oluştur
    if [ "${ARCHITECTURE}" == "all" ]; then
        for arch in "${!CUDA_VERSIONS[@]}"; do
            build_container ${arch}
            push_containers ${arch}
        done
    else
        # Belirli bir mimari için konteyner oluştur
        if [ -z "${CUDA_VERSIONS[${ARCHITECTURE}]}" ]; then
            echo -e "${RED}Geçersiz mimari: ${ARCHITECTURE}${NC}"
            echo -e "${YELLOW}Geçerli mimariler: ampere, turing, volta, pascal, hopper, all${NC}"
            exit 1
        fi
        
        build_container ${ARCHITECTURE}
        push_containers ${ARCHITECTURE}
    fi
    
    # Rapor oluşturucu konteynerini oluştur
    build_report_generator
    push_report_generator
    
    echo -e "${GREEN}Tüm konteynerler başarıyla oluşturuldu ve gönderildi.${NC}"
}

# Ana fonksiyonu çağır
main
