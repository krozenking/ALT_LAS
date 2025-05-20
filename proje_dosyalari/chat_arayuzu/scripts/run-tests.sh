#!/bin/bash

# Test çalıştırma scripti
TEST_TYPE=${1:-"all"}
WATCH=false
COVERAGE=false
TEST_FILE=""

# Parametreleri işle
for arg in "$@"
do
    case $arg in
        --watch)
        WATCH=true
        shift
        ;;
        --coverage)
        COVERAGE=true
        shift
        ;;
        --file=*)
        TEST_FILE="${arg#*=}"
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
echo -e "${GREEN}ALT_LAS Chat Arayüzü Test Çalıştırıcı${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "${YELLOW}Test Tipi: $TEST_TYPE${NC}"
echo -e "${YELLOW}İzleme Modu: $WATCH${NC}"
echo -e "${YELLOW}Kapsam Raporu: $COVERAGE${NC}"
if [ -n "$TEST_FILE" ]; then
    echo -e "${YELLOW}Test Dosyası: $TEST_FILE${NC}"
fi
echo -e "${GREEN}=====================================${NC}"

# Çalışma dizinini kontrol et
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
echo -e "${CYAN}Çalışma dizini: $PROJECT_ROOT${NC}"

# Birim testlerini çalıştır
run_unit_tests() {
    echo -e "\n${CYAN}Birim testleri çalıştırılıyor...${NC}"
    
    VITEST_COMMAND="npx vitest run"
    
    if [ "$WATCH" = true ]; then
        VITEST_COMMAND="npx vitest"
    fi
    
    if [ "$COVERAGE" = true ]; then
        VITEST_COMMAND="$VITEST_COMMAND --coverage"
    fi
    
    if [ -n "$TEST_FILE" ]; then
        VITEST_COMMAND="$VITEST_COMMAND $TEST_FILE"
    fi
    
    echo -e "${YELLOW}Komut: $VITEST_COMMAND${NC}"
    eval "$VITEST_COMMAND"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Birim testleri başarısız oldu!${NC}"
        return 1
    else
        echo -e "${GREEN}Birim testleri başarıyla tamamlandı!${NC}"
        return 0
    fi
}

# E2E testlerini çalıştır
run_e2e_tests() {
    echo -e "\n${CYAN}E2E testleri çalıştırılıyor...${NC}"
    
    CYPRESS_COMMAND="npx cypress run"
    
    if [ "$WATCH" = true ]; then
        CYPRESS_COMMAND="npx cypress open"
    fi
    
    if [ -n "$TEST_FILE" ]; then
        CYPRESS_COMMAND="$CYPRESS_COMMAND --spec \"$TEST_FILE\""
    fi
    
    echo -e "${YELLOW}Komut: $CYPRESS_COMMAND${NC}"
    eval "$CYPRESS_COMMAND"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}E2E testleri başarısız oldu!${NC}"
        return 1
    else
        echo -e "${GREEN}E2E testleri başarıyla tamamlandı!${NC}"
        return 0
    fi
}

# Statik analiz çalıştır
run_static_analysis() {
    echo -e "\n${CYAN}Statik analiz çalıştırılıyor...${NC}"
    
    # ESLint
    echo -e "${YELLOW}ESLint çalıştırılıyor...${NC}"
    npx eslint --ext .ts,.tsx src
    ESLINT_RESULT=$?
    
    # TypeScript
    echo -e "${YELLOW}TypeScript tip kontrolü çalıştırılıyor...${NC}"
    npx tsc --noEmit
    TSC_RESULT=$?
    
    if [ $ESLINT_RESULT -ne 0 ] || [ $TSC_RESULT -ne 0 ]; then
        echo -e "${RED}Statik analiz başarısız oldu!${NC}"
        return 1
    else
        echo -e "${GREEN}Statik analiz başarıyla tamamlandı!${NC}"
        return 0
    fi
}

# Testleri çalıştır
SUCCESS=true

case $TEST_TYPE in
    "unit")
        run_unit_tests
        SUCCESS=$?
        ;;
    "e2e")
        run_e2e_tests
        SUCCESS=$?
        ;;
    "static")
        run_static_analysis
        SUCCESS=$?
        ;;
    "all")
        run_unit_tests
        UNIT_SUCCESS=$?
        
        run_e2e_tests
        E2E_SUCCESS=$?
        
        run_static_analysis
        STATIC_SUCCESS=$?
        
        if [ $UNIT_SUCCESS -ne 0 ] || [ $E2E_SUCCESS -ne 0 ] || [ $STATIC_SUCCESS -ne 0 ]; then
            SUCCESS=1
        else
            SUCCESS=0
        fi
        ;;
    *)
        echo -e "${RED}Geçersiz test tipi: $TEST_TYPE${NC}"
        echo -e "${YELLOW}Geçerli tipler: unit, e2e, static, all${NC}"
        exit 1
        ;;
esac

# Sonuç
echo -e "\n${GREEN}=====================================${NC}"
if [ $SUCCESS -eq 0 ]; then
    echo -e "${GREEN}Tüm testler başarıyla tamamlandı!${NC}"
    exit 0
else
    echo -e "${RED}Bazı testler başarısız oldu!${NC}"
    exit 1
fi
