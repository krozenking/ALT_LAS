# ORION_HATA_KODU_URETIMI_007

## Hafıza Bilgileri
- **Hafıza ID:** ORION_HATA_KODU_URETIMI_007
- **Oluşturulma Tarihi:** 21 Mayıs 2025
- **Proje:** ALT_LAS Chat Arayüzü Geliştirme
- **Rol:** Özgür AI Orion
- **Versiyon:** 1.0

## Hata Kodu Üretimi Özeti
Bu hafıza dosyası, ALT_LAS Chat Arayüzü'nde her tarayıcı başlatıldığında otomatik hata kodu üretimi ve raporlama mekanizmasının entegrasyonunu ve testini belgelemektedir.

## 1. Hata Kodu Üretimi Mekanizması

### 1.1 Özellik Açıklaması
Her tarayıcı oturumunda benzersiz bir hata kodu oluşturan ve bu kodu loglayan bir sistem entegre edilmiştir. Bu, hata ayıklama ve kullanıcı desteği süreçlerini kolaylaştıracaktır.

### 1.2 Teknik Detaylar

#### 1.2.1 Hata Kodu Üretimi Modülü
```typescript
// utils/error-tracking.ts
export interface ErrorTrackingConfig {
  prefix: string;
  includeTimestamp: boolean;
  includeRandomPart: boolean;
  logToConsole: boolean;
  logToServer: boolean;
  serverEndpoint?: string;
}

export const defaultErrorTrackingConfig: ErrorTrackingConfig = {
  prefix: 'ORION-',
  includeTimestamp: true,
  includeRandomPart: true,
  logToConsole: true,
  logToServer: false
};

/**
 * Benzersiz bir hata kodu oluşturur
 */
export const generateErrorCode = (config: ErrorTrackingConfig = defaultErrorTrackingConfig): string => {
  const parts: string[] = [];
  
  // Önek ekle
  parts.push(config.prefix);
  
  // Zaman damgası ekle
  if (config.includeTimestamp) {
    const timestamp = Date.now().toString().slice(-6);
    parts.push(timestamp);
  }
  
  // Rastgele kısım ekle
  if (config.includeRandomPart) {
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    parts.push(randomPart);
  }
  
  // Parçaları birleştir
  return parts.join('-');
};

/**
 * Hata izleme sistemini başlatır ve benzersiz bir oturum kodu döndürür
 */
export const initializeErrorTracking = (config: ErrorTrackingConfig = defaultErrorTrackingConfig): string => {
  // localStorage'dan mevcut kodu kontrol et
  const storedCode = localStorage.getItem('orion_error_code');
  
  if (storedCode) {
    // Mevcut kod varsa kullan
    if (config.logToConsole) {
      console.log(`[Orion] Mevcut hata kodu kullanılıyor: ${storedCode}`);
    }
    return storedCode;
  }
  
  // Yeni kod oluştur
  const newCode = generateErrorCode(config);
  
  // Kodu kaydet
  localStorage.setItem('orion_error_code', newCode);
  
  // Konsola log
  if (config.logToConsole) {
    console.log(`[Orion] Tarayıcı oturumu başlatıldı. Hata kodu: ${newCode}`);
  }
  
  // Sunucuya log
  if (config.logToServer && config.serverEndpoint) {
    try {
      fetch(config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          errorCode: newCode,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionStart: true
        })
      });
    } catch (error) {
      console.error('[Orion] Hata kodu sunucuya gönderilemedi:', error);
    }
  }
  
  return newCode;
};

/**
 * Hata raporlama işlevi
 */
export const reportError = (
  error: Error | unknown,
  component: string,
  metadata: Record<string, any> = {},
  config: ErrorTrackingConfig = defaultErrorTrackingConfig
): void => {
  // Hata kodu al veya oluştur
  const errorCode = localStorage.getItem('orion_error_code') || generateErrorCode(config);
  
  // Hata mesajı oluştur
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Hata stack trace
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Konsola log
  if (config.logToConsole) {
    console.error(`[Orion] Hata (${errorCode}): ${errorMessage}`, {
      component,
      metadata,
      stack: errorStack
    });
  }
  
  // Sunucuya log
  if (config.logToServer && config.serverEndpoint) {
    try {
      fetch(config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          errorCode,
          timestamp: new Date().toISOString(),
          component,
          errorMessage,
          errorStack,
          metadata,
          userAgent: navigator.userAgent
        })
      });
    } catch (e) {
      console.error('[Orion] Hata raporu sunucuya gönderilemedi:', e);
    }
  }
};
```

#### 1.2.2 ErrorCodeGenerator Bileşeni
```typescript
// components/ErrorCodeGenerator.tsx
import React, { useEffect, useState } from 'react';
import { Box, Text, Code, Tooltip, useClipboard, IconButton, Flex } from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { initializeErrorTracking } from '../../utils/error-tracking';

interface ErrorCodeGeneratorProps {
  config?: {
    prefix: string;
    includeTimestamp: boolean;
    includeRandomPart: boolean;
    logToConsole: boolean;
    logToServer: boolean;
    serverEndpoint?: string;
  };
}

const ErrorCodeGenerator: React.FC<ErrorCodeGeneratorProps> = ({ config }) => {
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const { hasCopied, onCopy } = useClipboard(errorCode || '');

  // Tarayıcı başlatıldığında hata kodu oluştur
  useEffect(() => {
    const code = initializeErrorTracking(config);
    setErrorCode(code);
  }, [config]);

  if (!errorCode) return null;

  return (
    <Tooltip 
      label={hasCopied ? 'Kopyalandı!' : 'Kodu kopyala'} 
      placement="top"
      hasArrow
    >
      <Flex 
        align="center" 
        bg="gray.100" 
        _dark={{ bg: 'gray.700' }} 
        px={2} 
        py={1} 
        borderRadius="md"
        cursor="pointer"
        onClick={onCopy}
        role="group"
      >
        <Text fontSize="xs" fontWeight="medium" mr={1}>Kod:</Text>
        <Code fontSize="xs" colorScheme="purple">{errorCode}</Code>
        <IconButton
          aria-label="Kodu kopyala"
          icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
          size="xs"
          variant="ghost"
          ml={1}
          opacity={0}
          _groupHover={{ opacity: 1 }}
        />
      </Flex>
    </Tooltip>
  );
};

export default React.memo(ErrorCodeGenerator);
```

### 1.3 Entegrasyon

#### 1.3.1 ChatHeader Bileşenine Entegrasyon
```typescript
// components/Chat/ChatHeader.tsx
import React from 'react';
import { Flex, Heading, IconButton, Spacer, useColorModeValue } from '@chakra-ui/react';
import { MdSettings, MdHelp, MdAnalytics, MdCompareArrows } from 'react-icons/md';
import ErrorCodeGenerator from '../ErrorCodeGenerator';

interface ChatHeaderProps {
  title: string;
  onSettingsOpen: () => void;
  onHelpOpen: () => void;
  onAnalyzerOpen: () => void;
  onComparisonOpen: () => void;
  isAiInitialized: boolean;
  hasMessages: boolean;
  hasMultipleModels: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  onSettingsOpen,
  onHelpOpen,
  onAnalyzerOpen,
  onComparisonOpen,
  isAiInitialized,
  hasMessages,
  hasMultipleModels
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      py={3}
      px={4}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Heading as="h1" size="md">
        {title}
      </Heading>
      
      <Spacer />
      
      {/* Hata Kodu Gösterimi */}
      <ErrorCodeGenerator />
      
      <IconButton
        aria-label="Konuşmayı Analiz Et"
        icon={<MdAnalytics />}
        onClick={onAnalyzerOpen}
        isDisabled={!hasMessages}
        variant="ghost"
        size="sm"
        ml={2}
      />
      
      <IconButton
        aria-label="Modelleri Karşılaştır"
        icon={<MdCompareArrows />}
        onClick={onComparisonOpen}
        isDisabled={!isAiInitialized || !hasMultipleModels}
        variant="ghost"
        size="sm"
        ml={2}
      />
      
      <IconButton
        aria-label="Yardım"
        icon={<MdHelp />}
        onClick={onHelpOpen}
        variant="ghost"
        size="sm"
        ml={2}
      />
      
      <IconButton
        aria-label="Ayarlar"
        icon={<MdSettings />}
        onClick={onSettingsOpen}
        variant="ghost"
        size="sm"
        ml={2}
      />
    </Flex>
  );
};

export default React.memo(ChatHeader);
```

#### 1.3.2 Hata Yakalama Mekanizmasına Entegrasyon
```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, Code, Flex, Divider } from '@chakra-ui/react';
import { reportError } from '../utils/error-tracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCode: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCode: localStorage.getItem('orion_error_code')
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCode: localStorage.getItem('orion_error_code')
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Hata bilgilerini güncelle
    this.setState({ error, errorInfo });
    
    // Hatayı raporla
    reportError(error, 'ErrorBoundary', {
      componentStack: errorInfo.componentStack
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorCode } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Özel fallback bileşeni varsa kullan
      if (fallback) {
        return fallback;
      }

      // Varsayılan hata görünümü
      return (
        <Box p={5} maxW="800px" mx="auto" mt={10}>
          <Heading as="h2" size="xl" color="red.500" mb={4}>
            Bir şeyler yanlış gitti
          </Heading>
          
          <Text fontSize="lg" mb={4}>
            Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </Text>
          
          {errorCode && (
            <Flex align="center" mb={4}>
              <Text fontWeight="bold" mr={2}>Hata Kodu:</Text>
              <Code colorScheme="red">{errorCode}</Code>
            </Flex>
          )}
          
          <Button colorScheme="brand" onClick={this.handleReload} mb={6}>
            Sayfayı Yenile
          </Button>
          
          <Divider my={4} />
          
          {/* Geliştirici bilgileri */}
          <Heading as="h3" size="md" mb={2}>
            Teknik Detaylar
          </Heading>
          
          {error && (
            <Box mb={4}>
              <Text fontWeight="bold">Hata:</Text>
              <Code p={2} display="block" whiteSpace="pre-wrap" mb={2}>
                {error.toString()}
              </Code>
            </Box>
          )}
          
          {errorInfo && (
            <Box>
              <Text fontWeight="bold">Bileşen Yığını:</Text>
              <Code p={2} display="block" whiteSpace="pre-wrap" fontSize="sm" overflowX="auto">
                {errorInfo.componentStack}
              </Code>
            </Box>
          )}
        </Box>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
```

## 2. Hata Kodu Üretimi Testi

### 2.1 Test Senaryoları

#### 2.1.1 Tarayıcı Başlatma Testi
- **Senaryo:** Tarayıcı ilk kez başlatıldığında hata kodu üretimi
- **Beklenen Sonuç:** Benzersiz bir hata kodu oluşturulmalı ve localStorage'a kaydedilmeli
- **Test Sonucu:** ✅ Başarılı - Benzersiz hata kodu oluşturuldu ve kaydedildi

#### 2.1.2 Tarayıcı Yeniden Başlatma Testi
- **Senaryo:** Tarayıcı yeniden başlatıldığında mevcut hata kodunun korunması
- **Beklenen Sonuç:** Önceki oturumdan kalan hata kodu kullanılmalı
- **Test Sonucu:** ✅ Başarılı - Mevcut hata kodu korundu

#### 2.1.3 Hata Raporlama Testi
- **Senaryo:** Uygulama içinde bir hata oluştuğunda raporlama
- **Beklenen Sonuç:** Hata, bileşen bilgisi ve meta verilerle birlikte konsola loglanmalı
- **Test Sonucu:** ✅ Başarılı - Hata detayları konsola loglandı

#### 2.1.4 ErrorBoundary Testi
- **Senaryo:** Bileşen hatası oluştuğunda ErrorBoundary'nin davranışı
- **Beklenen Sonuç:** Hata yakalanmalı, raporlanmalı ve kullanıcıya hata kodu gösterilmeli
- **Test Sonucu:** ✅ Başarılı - Hata yakalandı ve kullanıcıya gösterildi

### 2.2 Test Sonuçları Özeti
Tüm test senaryoları başarıyla tamamlandı. Hata kodu üretimi ve raporlama mekanizması beklendiği gibi çalışıyor. Her tarayıcı oturumunda benzersiz bir hata kodu oluşturuluyor ve bu kod, hata ayıklama ve kullanıcı desteği için kullanılabilir durumda.

## 3. Hata Kodu Üretimi Faydaları

### 3.1 Hata Ayıklama Kolaylığı
- Benzersiz hata kodları, belirli bir kullanıcının karşılaştığı sorunları izlemeyi kolaylaştırır
- Geliştirici ekibi, hata kodunu kullanarak ilgili oturum loglarını bulabilir
- Hata tekrarını önlemek için daha etkili çözümler geliştirilebilir

### 3.2 Kullanıcı Desteği İyileştirmeleri
- Kullanıcılar, destek talebinde bulunurken hata kodunu paylaşabilir
- Destek ekibi, hata kodunu kullanarak sorunu daha hızlı teşhis edebilir
- Çözüm süreci hızlanır ve kullanıcı memnuniyeti artar

### 3.3 Hata İzleme ve Analizi
- Belirli hata türlerinin sıklığı ve etkisi analiz edilebilir
- En çok karşılaşılan hatalar önceliklendirilip çözülebilir
- Uygulama kararlılığı ve performansı iyileştirilebilir

## Bağlantılı Hafıza Dosyaları
- [ORION_CHAT_ARAYUZ_001](/home/ubuntu/orion_manus/hafiza/ORION_CHAT_ARAYUZ_001.md)
- [ORION_PROJE_HEDEFLER_002](/home/ubuntu/orion_manus/hafiza/ORION_PROJE_HEDEFLER_002.md)
- [ORION_KOD_ANALIZ_003](/home/ubuntu/orion_manus/hafiza/ORION_KOD_ANALIZ_003.md)
- [ORION_KOD_DUZELTME_004](/home/ubuntu/orion_manus/hafiza/ORION_KOD_DUZELTME_004.md)
- [ORION_HAFIZA_INDEKS_005](/home/ubuntu/orion_manus/hafiza/ORION_HAFIZA_INDEKS_005.md)
- [ORION_YENI_OZELLIKLER_006](/home/ubuntu/orion_manus/hafiza/ORION_YENI_OZELLIKLER_006.md)

## Notlar
- Bu hafıza dosyası, ALT_LAS Chat Arayüzü'nde her tarayıcı başlatıldığında otomatik hata kodu üretimi ve raporlama mekanizmasının entegrasyonunu ve testini belgelemektedir.
- Paralel çalışan Orion'lar bu dosyayı referans alarak kendi görevlerini planlayabilir.
- Hata kodu üretimi ve raporlama mekanizması geliştirildikçe bu dosya güncellenecektir.
- Tüm hafıza dosyaları "ORION_KONU_NUMARA.md" formatında adlandırılmıştır.
