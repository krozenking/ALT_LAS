#!/bin/bash

# Docker ile test çalıştırma scripti
TEST_TYPE=${1:-"all"}
WATCH=false
BUILD_IMAGE=false

# Parametreleri işle
for arg in "$@"
do
    case $arg in
        --watch)
        WATCH=true
        shift
        ;;
        --build-image)
        BUILD_IMAGE=true
        shift
        ;;
    esac
done

# Renkli çıktı için fonksiyonlar
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Başlık göster
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}ALT_LAS Chat Arayüzü Docker Test Çalıştırıcı${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "${YELLOW}Test Tipi: $TEST_TYPE${NC}"
echo -e "${YELLOW}İzleme Modu: $WATCH${NC}"
echo -e "${YELLOW}Image Oluştur: $BUILD_IMAGE${NC}"
echo -e "${GREEN}=====================================${NC}"

# Çalışma dizinini kontrol et
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
echo -e "${CYAN}Çalışma dizini: $PROJECT_ROOT${NC}"

# Docker Compose servisini belirle
SERVICE="test"
if [ "$WATCH" = true ]; then
    SERVICE="test-watch"
elif [ "$TEST_TYPE" = "e2e" ]; then
    SERVICE="test-e2e"
elif [ "$TEST_TYPE" = "static" ]; then
    SERVICE="test-static"
fi

# Docker Compose komutu oluştur
DOCKER_COMPOSE_COMMAND="docker-compose -f docker-compose.test.yml"

# Eğer image oluşturulacaksa
if [ "$BUILD_IMAGE" = true ]; then
    echo -e "${CYAN}Docker image oluşturuluyor...${NC}"
    eval "$DOCKER_COMPOSE_COMMAND build $SERVICE"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Docker image oluşturma başarısız oldu!${NC}"
        exit 1
    fi
fi

# Testleri çalıştır
echo -e "${CYAN}Docker ile testler çalıştırılıyor...${NC}"
eval "$DOCKER_COMPOSE_COMMAND run --rm $SERVICE"

# Sonuç
if [ $? -ne 0 ]; then
    echo -e "${RED}Testler başarısız oldu!${NC}"
    exit 1
else
    echo -e "${GREEN}Testler başarıyla tamamlandı!${NC}"
    exit 0
fi
