#!/bin/bash

# OS Integration Service Test Script
# Bu script, OS Integration Service'in temel işlevlerini test eder

echo "OS Integration Service Test Başlatılıyor..."
echo "----------------------------------------"

# Test dizini oluştur
TEST_DIR="/tmp/os_integration_test"
mkdir -p $TEST_DIR
echo "Test dizini oluşturuldu: $TEST_DIR"

# Servis çalışıyor mu kontrol et
echo "Servis durumu kontrol ediliyor..."
if pgrep -f "os_integration_service" > /dev/null; then
    echo "Servis zaten çalışıyor."
else
    echo "Servis başlatılıyor..."
    cd $(dirname $0)/..
    cargo run &
    CARGO_PID=$!
    echo "Servis başlatıldı (PID: $CARGO_PID)"
    # Servisin başlaması için bekle
    sleep 5
fi

# API temel URL'i
API_URL="http://localhost:8080/api"

# Platform bilgilerini test et
echo -e "\n1. Platform Bilgileri Testi"
echo "-----------------------------"
curl -s $API_URL/platform/info | jq .

# İşlem listesini test et
echo -e "\n2. İşlem Listesi Testi"
echo "----------------------"
curl -s "$API_URL/platform/processes?name=rust" | jq '.[:3]'

# Dosya sistemi listesini test et
echo -e "\n3. Dosya Sistemi Listesi Testi"
echo "------------------------------"
curl -s "$API_URL/fs/list?path=/tmp" | jq '.[:3]'

# Dosya yazma ve okuma testi
echo -e "\n4. Dosya Yazma ve Okuma Testi"
echo "------------------------------"
TEST_FILE="$TEST_DIR/test_file.txt"
TEST_CONTENT="Bu bir test dosyasıdır. $(date)"

echo "Dosya yazılıyor: $TEST_FILE"
curl -s -X POST $API_URL/fs/write \
  -H "Content-Type: application/json" \
  -d "{\"path\":\"$TEST_FILE\",\"content\":\"$TEST_CONTENT\"}" | jq .

echo "Dosya okunuyor: $TEST_FILE"
curl -s "$API_URL/fs/read?path=$TEST_FILE" | jq .

# Dizin oluşturma testi
echo -e "\n5. Dizin Oluşturma Testi"
echo "-------------------------"
TEST_DIR_NEW="$TEST_DIR/new_dir"
echo "Dizin oluşturuluyor: $TEST_DIR_NEW"
curl -s -X POST $API_URL/fs/mkdir \
  -H "Content-Type: application/json" \
  -d "{\"path\":\"$TEST_DIR_NEW\"}" | jq .

# Dosya kopyalama testi
echo -e "\n6. Dosya Kopyalama Testi"
echo "-------------------------"
TEST_FILE_COPY="$TEST_DIR_NEW/test_file_copy.txt"
echo "Dosya kopyalanıyor: $TEST_FILE -> $TEST_FILE_COPY"
curl -s -X POST $API_URL/fs/copy \
  -H "Content-Type: application/json" \
  -d "{\"path\":\"$TEST_FILE\",\"new_path\":\"$TEST_FILE_COPY\"}" | jq .

# İşlem çalıştırma testi
echo -e "\n7. İşlem Çalıştırma Testi"
echo "--------------------------"
echo "İşlem çalıştırılıyor: echo"
PROCESS_RESPONSE=$(curl -s -X POST $API_URL/platform/run \
  -H "Content-Type: application/json" \
  -d "{\"command\":\"echo\",\"args\":[\"Merhaba Dünya\"],\"working_dir\":\"$TEST_DIR\"}")
echo $PROCESS_RESPONSE | jq .

# İşlem ID'sini al
PROCESS_ID=$(echo $PROCESS_RESPONSE | jq -r '.id')

if [ "$PROCESS_ID" != "null" ]; then
    echo "İşlem çıktısı alınıyor: $PROCESS_ID"
    sleep 1
    curl -s "$API_URL/platform/output/$PROCESS_ID" | jq .
fi

# Ekran görüntüsü alma testi
echo -e "\n8. Ekran Görüntüsü Alma Testi"
echo "-----------------------------"
SCREENSHOT_FILE="$TEST_DIR/screenshot.png"
echo "Ekran görüntüsü alınıyor: $SCREENSHOT_FILE"
curl -s "$API_URL/screenshot?output_dir=$TEST_DIR&format=png" | jq .

# Temizlik
echo -e "\n9. Test Temizliği"
echo "----------------"
echo "Test dosyaları siliniyor..."
rm -rf $TEST_DIR
echo "Test dizini silindi: $TEST_DIR"

echo -e "\nOS Integration Service Test Tamamlandı"
echo "----------------------------------------"
