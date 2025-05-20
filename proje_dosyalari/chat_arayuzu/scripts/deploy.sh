#!/bin/bash

# ALT_LAS Chat Botu Dağıtım Betiği
# Bu betik, ALT_LAS Chat Botu'nu belirtilen ortama dağıtır.

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}! $1${NC}"
}

print_info() {
  echo -e "${BLUE}i $1${NC}"
}

# Kullanım bilgisi
usage() {
  echo "Kullanım: $0 [seçenekler]"
  echo ""
  echo "Seçenekler:"
  echo "  -e, --environment <ortam>   Dağıtım ortamı (development, test, production) (varsayılan: production)"
  echo "  -t, --tag <etiket>          Docker imaj etiketi (varsayılan: latest)"
  echo "  -b, --build                 İmajları yeniden oluştur"
  echo "  -p, --pull                  İmajları çek"
  echo "  -c, --clean                 Dağıtımdan önce konteynerleri temizle"
  echo "  -h, --help                  Bu yardım mesajını göster"
  exit 1
}

# Varsayılan değerler
ENVIRONMENT="production"
TAG="latest"
BUILD=false
PULL=false
CLEAN=false

# Komut satırı argümanlarını işle
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -t|--tag)
      TAG="$2"
      shift 2
      ;;
    -b|--build)
      BUILD=true
      shift
      ;;
    -p|--pull)
      PULL=true
      shift
      ;;
    -c|--clean)
      CLEAN=true
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Bilinmeyen seçenek: $1"
      usage
      ;;
  esac
done

# Ortam doğrulama
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "test" && "$ENVIRONMENT" != "production" ]]; then
  print_error "Geçersiz ortam: $ENVIRONMENT. Geçerli değerler: development, test, production"
  exit 1
fi

# Başlık
print_header "ALT_LAS Chat Botu Dağıtımı"
print_info "Ortam: $ENVIRONMENT"
print_info "Etiket: $TAG"

# Proje dizinine git
cd "$(dirname "$0")/.." || exit 1
print_info "Çalışma dizini: $(pwd)"

# Ortam değişkenlerini ayarla
export ENVIRONMENT=$ENVIRONMENT
export TAG=$TAG

# Temizleme
if [ "$CLEAN" = true ]; then
  print_header "Konteynerleri Temizleme"
  docker-compose down -v
  print_success "Konteynerler temizlendi"
fi

# İmajları çek
if [ "$PULL" = true ]; then
  print_header "İmajları Çekme"
  docker-compose pull
  print_success "İmajlar çekildi"
fi

# İmajları oluştur
if [ "$BUILD" = true ]; then
  print_header "İmajları Oluşturma"
  docker-compose build --no-cache
  print_success "İmajlar oluşturuldu"
fi

# Dağıtım
print_header "Dağıtım Başlatılıyor"
docker-compose up -d

# Durum kontrolü
print_header "Konteyner Durumu"
docker-compose ps

print_success "ALT_LAS Chat Botu başarıyla dağıtıldı!"
print_info "Frontend: http://localhost:${FRONTEND_PORT:-80}"
print_info "API: http://localhost:${API_PORT:-3000}"
print_info "AI Servisi: http://localhost:${AI_PORT:-5000}"

exit 0
