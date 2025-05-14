import React from 'react';
import { Box, Text, Link, Heading, UnorderedList, ListItem, Divider } from '@chakra-ui/react';

/**
 * Accessibility Documentation Component
 * 
 * This component provides documentation about the accessibility features
 * implemented in the ALT_LAS UI, including WCAG 2.1 AA compliance details
 * and high contrast mode implementation.
 */
const AccessibilityDocumentation: React.FC = () => {
  return (
    <Box maxWidth="800px" margin="0 auto" padding="6">
      <Heading as="h1" size="xl" mb="6">ALT_LAS UI Erişilebilirlik Dokümantasyonu</Heading>
      
      <Text mb="4">
        ALT_LAS UI, WCAG 2.1 AA uyumluluğunu sağlamak için çeşitli erişilebilirlik özellikleri içerir.
        Bu dokümantasyon, uygulamadaki erişilebilirlik özelliklerini ve bunların nasıl kullanılacağını açıklar.
      </Text>
      
      <Divider my="6" />
      
      <Heading as="h2" size="lg" mb="4">ARIA Rolleri ve Özellikleri</Heading>
      <Text mb="3">
        Tüm UI bileşenleri, ekran okuyucular ve diğer yardımcı teknolojilerle uyumlu çalışmak için uygun ARIA rolleri ve özellikleri ile donatılmıştır:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>Tüm etkileşimli öğeler (düğmeler, bağlantılar, giriş alanları) uygun ARIA rolleri ile işaretlenmiştir</ListItem>
        <ListItem>Görsel öğeler <code>aria-hidden="true"</code> ile işaretlenmiştir</ListItem>
        <ListItem>Form elemanları <code>aria-required</code>, <code>aria-invalid</code> ve <code>aria-describedby</code> özelliklerini kullanır</ListItem>
        <ListItem>Hata mesajları <code>role="alert"</code> ve <code>aria-live="assertive"</code> ile işaretlenmiştir</ListItem>
        <ListItem>İkonlu düğmeler her zaman <code>aria-label</code> içerir</ListItem>
      </UnorderedList>
      
      <Heading as="h2" size="lg" mb="4">Klavye Navigasyonu</Heading>
      <Text mb="3">
        ALT_LAS UI, fare kullanmadan tam klavye erişimi sağlar:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>Tüm etkileşimli öğeler Tab tuşu ile erişilebilir</ListItem>
        <ListItem>Odak göstergeleri yüksek kontrastlı ve belirgindir</ListItem>
        <ListItem>Devre dışı bırakılmış öğeler tab sırasından çıkarılmıştır (<code>tabIndex={-1}</code>)</ListItem>
        <ListItem>Klavye kısayolları tutarlı ve öngörülebilirdir</ListItem>
        <ListItem>Klavye tuzakları (focus traps) yoktur</ListItem>
      </UnorderedList>
      
      <Heading as="h2" size="lg" mb="4">Renk Kontrastı</Heading>
      <Text mb="3">
        Tüm metin ve etkileşimli öğeler, WCAG 2.1 AA gereksinimlerini karşılayan kontrast oranlarına sahiptir:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>Normal metin için minimum 4.5:1 kontrast oranı</ListItem>
        <ListItem>Büyük metin için minimum 3:1 kontrast oranı</ListItem>
        <ListItem>Etkileşimli öğeler ve görsel bilgiler için minimum 3:1 kontrast oranı</ListItem>
        <ListItem>Odak göstergeleri için minimum 3:1 kontrast oranı</ListItem>
      </UnorderedList>
      
      <Heading as="h2" size="lg" mb="4">Yüksek Kontrast Modu</Heading>
      <Text mb="3">
        ALT_LAS UI, görme zorluğu yaşayan kullanıcılar için özel bir yüksek kontrast modu sunar:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>Siyah arka plan üzerinde beyaz metin (21:1 kontrast oranı)</ListItem>
        <ListItem>Sarı vurgu rengi (19.5:1 kontrast oranı)</ListItem>
        <ListItem>Siyan ikincil vurgu rengi (16.4:1 kontrast oranı)</ListItem>
        <ListItem>Belirgin kenarlıklar ve odak göstergeleri</ListItem>
        <ListItem>Animasyonlar ve geçişler devre dışı bırakılmıştır</ListItem>
        <ListItem>Arka plan görüntüleri kaldırılmıştır</ListItem>
      </UnorderedList>
      <Text mb="4">
        Yüksek kontrast modunu etkinleştirmek için sağ üst köşedeki "Yüksek Kontrast" düğmesini kullanın veya ayarlar menüsünden erişilebilirlik seçeneklerini açın.
      </Text>
      
      <Heading as="h2" size="lg" mb="4">Ekran Okuyucu Uyumluluğu</Heading>
      <Text mb="3">
        ALT_LAS UI, popüler ekran okuyucularla test edilmiş ve uyumlu hale getirilmiştir:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>NVDA (Windows)</ListItem>
        <ListItem>JAWS (Windows)</ListItem>
        <ListItem>VoiceOver (macOS)</ListItem>
        <ListItem>TalkBack (Android)</ListItem>
        <ListItem>VoiceOver (iOS)</ListItem>
      </UnorderedList>
      
      <Heading as="h2" size="lg" mb="4">Metin Boyutu ve Yakınlaştırma</Heading>
      <Text mb="3">
        ALT_LAS UI, metin boyutu değişikliklerine ve yakınlaştırmaya uyum sağlar:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>Tarayıcı metin boyutu %200'e kadar artırıldığında içerik ve işlevsellik korunur</ListItem>
        <ListItem>Sayfa %400'e kadar yakınlaştırıldığında yatay kaydırma gerekmez</ListItem>
        <ListItem>Tüm metin gerçek metindir, görüntü olarak sunulmaz</ListItem>
        <ListItem>Responsive tasarım, farklı ekran boyutlarına uyum sağlar</ListItem>
      </UnorderedList>
      
      <Heading as="h2" size="lg" mb="4">Hareket ve Animasyonlar</Heading>
      <Text mb="3">
        ALT_LAS UI, hareket duyarlılığı olan kullanıcılar için güvenlidir:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>Animasyonlar ve geçişler 5 saniyeden kısa sürer</ListItem>
        <ListItem>Yanıp sönen içerik saniyede 3 kereden az yanıp söner</ListItem>
        <ListItem>Hareket azaltma tercihi (<code>prefers-reduced-motion</code>) desteklenir</ListItem>
        <ListItem>Yüksek kontrast modunda animasyonlar devre dışı bırakılır</ListItem>
      </UnorderedList>
      
      <Heading as="h2" size="lg" mb="4">Erişilebilirlik Testleri</Heading>
      <Text mb="3">
        ALT_LAS UI, aşağıdaki yöntemlerle test edilmiştir:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>Otomatik testler (jest-axe)</ListItem>
        <ListItem>Klavye navigasyon testleri</ListItem>
        <ListItem>Ekran okuyucu testleri</ListItem>
        <ListItem>Kontrast analizi</ListItem>
        <ListItem>Hareket duyarlılığı testleri</ListItem>
      </UnorderedList>
      
      <Divider my="6" />
      
      <Heading as="h2" size="lg" mb="4">Geliştiriciler İçin</Heading>
      <Text mb="3">
        ALT_LAS UI'a katkıda bulunurken aşağıdaki erişilebilirlik prensiplerini izleyin:
      </Text>
      <UnorderedList mb="4" spacing="2">
        <ListItem>Tüm etkileşimli öğelere uygun ARIA rolleri ve özellikleri ekleyin</ListItem>
        <ListItem>Klavye erişimini her zaman test edin</ListItem>
        <ListItem>Renk kontrastını WCAG 2.1 AA gereksinimlerine göre doğrulayın</ListItem>
        <ListItem>Yüksek kontrast modunda bileşenlerin nasıl görüneceğini düşünün</ListItem>
        <ListItem>Ekran okuyucu uyumluluğunu test edin</ListItem>
        <ListItem>Erişilebilirlik testlerini otomatik test sürecinize dahil edin</ListItem>
      </UnorderedList>
      
      <Box mt="8" p="4" borderLeft="4px solid" borderColor="primary.500">
        <Text fontWeight="bold">Not:</Text>
        <Text>
          Bu dokümantasyon, WCAG 2.1 AA uyumluluğu hedeflenerek hazırlanmıştır. Erişilebilirlik konusunda geri bildirim veya önerileriniz için lütfen proje yöneticisiyle iletişime geçin.
        </Text>
      </Box>
      
      <Box mt="8">
        <Text fontSize="sm" color="gray.500">
          Son güncelleme: 28 Nisan 2025
        </Text>
      </Box>
    </Box>
  );
};

export default AccessibilityDocumentation;
