#!/bin/bash

# Kubernetes ile test çalıştırma scripti
NAMESPACE="default"
DOCKER_REGISTRY="localhost:5000"
IMAGE_TAG="latest"
BUILD_IMAGE=false
PUSH_IMAGE=false
SCHEDULED=false

# Parametreleri işle
for arg in "$@"
do
    case $arg in
        --namespace=*)
        NAMESPACE="${arg#*=}"
        shift
        ;;
        --docker-registry=*)
        DOCKER_REGISTRY="${arg#*=}"
        shift
        ;;
        --image-tag=*)
        IMAGE_TAG="${arg#*=}"
        shift
        ;;
        --build-image)
        BUILD_IMAGE=true
        shift
        ;;
        --push-image)
        PUSH_IMAGE=true
        shift
        ;;
        --scheduled)
        SCHEDULED=true
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
echo -e "${GREEN}ALT_LAS Chat Arayüzü Kubernetes Test Çalıştırıcı${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "${YELLOW}Namespace: $NAMESPACE${NC}"
echo -e "${YELLOW}Docker Registry: $DOCKER_REGISTRY${NC}"
echo -e "${YELLOW}Image Tag: $IMAGE_TAG${NC}"
echo -e "${YELLOW}Image Oluştur: $BUILD_IMAGE${NC}"
echo -e "${YELLOW}Image Push: $PUSH_IMAGE${NC}"
echo -e "${YELLOW}Zamanlanmış: $SCHEDULED${NC}"
echo -e "${GREEN}=====================================${NC}"

# Çalışma dizinini kontrol et
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
echo -e "${CYAN}Çalışma dizini: $PROJECT_ROOT${NC}"

# Docker image adı
IMAGE_NAME="$DOCKER_REGISTRY/chat-arayuzu-test:$IMAGE_TAG"

# Eğer image oluşturulacaksa
if [ "$BUILD_IMAGE" = true ]; then
    echo -e "${CYAN}Docker image oluşturuluyor: $IMAGE_NAME${NC}"
    docker build -t $IMAGE_NAME -f Dockerfile.test .
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Docker image oluşturma başarısız oldu!${NC}"
        exit 1
    fi
    
    # Eğer image push edilecekse
    if [ "$PUSH_IMAGE" = true ]; then
        echo -e "${CYAN}Docker image push ediliyor: $IMAGE_NAME${NC}"
        docker push $IMAGE_NAME
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Docker image push başarısız oldu!${NC}"
            exit 1
        fi
    fi
fi

# Kubernetes YAML dosyasını belirle
K8S_FILE="kubernetes/test-job.yaml"
if [ "$SCHEDULED" = true ]; then
    K8S_FILE="kubernetes/test-cronjob.yaml"
fi

# Kubernetes YAML dosyasını oku ve değişkenleri değiştir
echo -e "${CYAN}Kubernetes YAML dosyası hazırlanıyor...${NC}"
sed -e "s|\${DOCKER_REGISTRY}|$DOCKER_REGISTRY|g" -e "s|\${IMAGE_TAG}|$IMAGE_TAG|g" $K8S_FILE > /tmp/k8s-test.yaml

# Kubernetes job'ı oluştur
echo -e "${CYAN}Kubernetes job oluşturuluyor...${NC}"
kubectl apply -f /tmp/k8s-test.yaml -n $NAMESPACE

if [ $? -ne 0 ]; then
    echo -e "${RED}Kubernetes job oluşturma başarısız oldu!${NC}"
    rm /tmp/k8s-test.yaml
    exit 1
fi

# Geçici dosyayı sil
rm /tmp/k8s-test.yaml

# Eğer zamanlanmış job değilse, job'ın tamamlanmasını bekle
if [ "$SCHEDULED" = false ]; then
    JOB_NAME="chat-arayuzu-test"
    
    echo -e "${CYAN}Job tamamlanana kadar bekleniyor: $JOB_NAME${NC}"
    kubectl wait --for=condition=complete job/$JOB_NAME -n $NAMESPACE --timeout=300s
    
    # Job başarılı mı kontrol et
    if [ $? -ne 0 ]; then
        echo -e "${RED}Job başarısız oldu veya zaman aşımına uğradı!${NC}"
        
        # Job loglarını göster
        echo -e "${CYAN}Job logları:${NC}"
        kubectl logs job/$JOB_NAME -n $NAMESPACE
        
        # Job'ı temizle
        kubectl delete job $JOB_NAME -n $NAMESPACE
        
        exit 1
    fi
    
    # Job loglarını göster
    echo -e "${CYAN}Job logları:${NC}"
    kubectl logs job/$JOB_NAME -n $NAMESPACE
    
    # Job'ı temizle
    kubectl delete job $JOB_NAME -n $NAMESPACE
    
    echo -e "${GREEN}Testler başarıyla tamamlandı!${NC}"
else
    echo -e "${GREEN}Zamanlanmış test job'ı başarıyla oluşturuldu!${NC}"
fi

exit 0
