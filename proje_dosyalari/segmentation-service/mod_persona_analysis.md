# Mod ve Persona Sistemi Analizi

## Mevcut Durum

### DSL Schema (dsl_schema.py)
- `AltFile` sınıfında `mode`, `persona` ve `chaos_level` alanları tanımlanmış.
- Geçerli modlar: "Normal", "Dream", "Explore", "Chaos"
- Varsayılan mod: "Normal"
- Varsayılan persona: "technical_expert"
- `chaos_level` sadece "Chaos" modunda kullanılıyor (1-10 arası değer)
- Doğrulayıcılar (validator) mevcut:
  - `mode` için geçerli değerleri kontrol eden doğrulayıcı
  - `chaos_level` için mod ile uyumluluğu kontrol eden doğrulayıcı

### Command Parser (command_parser.py)
- `parse_command` metodu `mode` ve `persona` parametrelerini kabul ediyor
- "Chaos" modu için `chaos_level` parametresi metadata'dan alınıyor (varsayılan: 5)
- Ancak farklı modların ve personaların segmentasyon ve ayrıştırma davranışını nasıl etkilediğine dair bir uygulama yok

### Language Processor (language_processor.py)
- Çoklu dil desteği (İngilizce ve Türkçe) mevcut
- Farklı diller için görev anahtar kelimeleri, bağımlılık göstergeleri vb. tanımlanmış
- Mod ve persona ile ilgili herhangi bir özel işleme yok

## Eksiklikler ve İyileştirme Alanları

1. **Mod Etkisi İmplementasyonu**:
   - Farklı modların (Normal, Dream, Explore, Chaos) segmentasyon ve ayrıştırma davranışını nasıl etkileyeceği uygulanmamış
   - Her mod için özel davranışlar tanımlanmalı

2. **Persona Etkisi İmplementasyonu**:
   - Farklı personaların (technical_expert, creative_writer vb.) segmentasyon ve ayrıştırma davranışını nasıl etkileyeceği uygulanmamış
   - Her persona için özel davranışlar tanımlanmalı

3. **Chaos Level İşleme**:
   - `chaos_level` parametresi alınıyor ancak nasıl kullanılacağı uygulanmamış
   - Farklı chaos_level değerlerinin segmentasyon ve ayrıştırma davranışını nasıl etkileyeceği tanımlanmalı

4. **Mod ve Persona Metadata Entegrasyonu**:
   - Mod ve persona bilgilerinin segment metadata'sına nasıl yansıtılacağı uygulanmamış

5. **Test Eksikliği**:
   - Mod ve persona davranışlarını test eden birim testleri yok

## Önerilen Yaklaşım

1. **Mod Sistemi İmplementasyonu**:
   - Her mod için özel davranış stratejileri tanımla
   - `CommandParser` sınıfına mod-spesifik işleme ekle

2. **Persona Sistemi İmplementasyonu**:
   - Her persona için özel davranış stratejileri tanımla
   - `CommandParser` sınıfına persona-spesifik işleme ekle

3. **Chaos Level İşleme**:
   - Chaos level değerine göre rastgelelik ve yaratıcılık seviyesini ayarlayan bir mekanizma ekle

4. **Metadata Entegrasyonu**:
   - Segment metadata'sına mod ve persona bilgilerini ekle

5. **Test Geliştirme**:
   - Her mod ve persona kombinasyonu için birim testleri ekle
   - Chaos level'ın farklı değerleri için testler ekle
