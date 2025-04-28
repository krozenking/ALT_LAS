# Mod ve Persona Sistemi Tasarımı

## 1. Giriş

Bu belge, ALT_LAS Segmentation Service için Mod ve Persona sisteminin tasarımını detaylandırmaktadır. Amaç, komut ayrıştırma ve segmentasyon sürecini kullanıcının seçtiği moda ve personaya göre uyarlayarak daha esnek ve çeşitli çıktılar üretmektir. Bu tasarım, `mod_persona_analysis.md` dosyasındaki analizlere dayanmaktadır.

## 2. Mod Tasarımı

Farklı modlar, komutların yorumlanma ve işlenme şeklini temelden değiştirecektir.

### 2.1 Normal Mod
- **Açıklama**: Standart, deterministik ayrıştırma ve segmentasyon. Mevcut (düzeltilmiş) davranış korunacaktır.
- **Etkilenen Metotlar**: Tüm metotlar (`_split_into_subtasks`, `_identify_task_type`, `_extract_parameters`, `_identify_dependencies`) standart şekilde çalışır.

### 2.2 Dream Mod
- **Açıklama**: Daha yaratıcı ve soyut yorumlama. Komutla ilgili ancak açıkça belirtilmeyen alt görevler veya parametreler eklenebilir. Daha serbest çağrışımlı veya mecazi yorumlamalar yapılabilir.
- **Etkilenen Metotlar**:
  - `_split_into_subtasks`: Daha gevşek bağlaçlarla veya tematik bağlantılarla bölme yapabilir.
  - `_identify_task_type`: Daha az yaygın veya daha yaratıcı görev türleri (örn. "imagine", "visualize") önerebilir.
  - `_extract_parameters`: Komutun ruhuna uygun ek parametreler (örn. stil, ton) ekleyebilir veya mevcut parametreleri yaratıcı şekilde yorumlayabilir.
  - `_identify_dependencies`: Daha az belirgin veya tematik bağımlılıklar kurabilir.

### 2.3 Explore Mod
- **Açıklama**: Komutun kapsamını genişleten, ilgili kavramları araştıran veya alternatif yaklaşımlar sunan yorumlama. Alternatif görev segmentleri veya parametre önerileri üretebilir.
- **Etkilenen Metotlar**:
  - `_split_into_subtasks`: Komutu farklı alt görev kombinasyonlarına ayırmayı deneyebilir.
  - `_identify_task_type`: Benzer veya ilgili görev türlerini alternatif olarak önerebilir.
  - `_extract_parameters`: İlgili veya alternatif parametreler önerebilir (örn. "AI" araması için "machine learning" veya "deep learning" gibi ilgili terimler).
  - `_identify_dependencies`: Alternatif görev akışları veya bağımlılıklar önerebilir.

### 2.4 Chaos Mod
- **Açıklama**: `chaos_level` (1-10) parametresine bağlı olarak rastgelelik ve öngörülemezlik ekler. Seviye arttıkça kaos artar.
- **Etkilenen Metotlar**: Tüm metotlar etkilenebilir.
  - `_split_into_subtasks`: Rastgele bölme veya birleştirme yapabilir.
  - `_identify_task_type`: Rastgele görev türü atayabilir.
  - `_extract_parameters`: Rastgele parametre ekleyebilir/çıkarabilir/değiştirebilir.
  - `_identify_dependencies`: Rastgele bağımlılık ekleyebilir/çıkarabilir.
- **Chaos Level Kullanımı**: `chaos_level / 10` olasılıkla her adımda rastgele bir değişiklik uygulanır.

## 3. Persona Tasarımı

Personalar, komutların yorumlanmasında ve segmentlerin detaylandırılmasında belirli bir bakış açısını veya tarzı temsil eder.

### 3.1 technical_expert (Varsayılan)
- **Açıklama**: Hassasiyet, teknik detaylar ve spesifik parametrelere odaklanır.
- **Etkisi**: Parametre çıkarma daha detaylı olur, teknik terimler korunur.

### 3.2 creative_writer
- **Açıklama**: Anlatı, stil ve betimleyici unsurlara odaklanır. Görevleri yeniden ifade edebilir.
- **Etkisi**: Segment içerikleri daha betimleyici olabilir, stil veya ton gibi ek parametreler eklenebilir.

### 3.3 researcher
- **Açıklama**: Bilgi toplama, analiz ve kaynak göstermeye odaklanır. Görevleri araştırma adımlarına bölebilir.
- **Etkisi**: Analiz veya araştırma görevleri daha belirgin hale gelir, kaynak veya yöntem gibi parametreler eklenebilir.

### 3.4 project_manager
- **Açıklama**: Görev yönetimi, zaman çizelgesi ve kaynaklara odaklanır.
- **Etkisi**: Zamanlama, önceliklendirme veya atama ile ilgili parametreler veya alt görevler eklenebilir.

## 4. Uygulama Planı

1.  **`CommandParser` Güncellemesi**:
    *   `segment_command` metodu `mode`, `persona` ve `chaos_level` parametrelerini alacak şekilde güncellenecek.
    *   Standart segmentasyon yapıldıktan sonra, moda ve personaya göre segmentleri değiştirecek `_apply_mode_effects` ve `_apply_persona_effects` metotları eklenecek.
    *   Chaos modu için `_apply_chaos_effects` metodu eklenecek ve `chaos_level` kullanılacak.
2.  **Yardımcı Fonksiyonlar/Sınıflar**: Her mod ve persona için özel mantığı kapsülleyen yardımcı fonksiyonlar veya sınıflar oluşturulabilir (örn. `ModeHandler`, `PersonaHandler`).
3.  **Metadata Güncellemesi**: `TaskSegment` metadata alanına, segmentin hangi mod ve persona tarafından nasıl etkilendiğine dair bilgi eklenecek (örn. `metadata["applied_mode"] = "Dream"`, `metadata["applied_persona"] = "creative_writer"`).
4.  **Chaos Fonksiyonları**: Chaos modu için rastgele değişiklikler uygulayan fonksiyonlar (`_randomly_swap_task_type`, `_randomly_modify_params` vb.) oluşturulacak.

## 5. Gelecek Değerlendirmeler

- Daha fazla mod ve persona tanımlanabilir.
- Mod ve persona etkileşimleri daha detaylı modellenebilir.
- Kullanıcıların özel modlar veya personalar tanımlamasına izin verilebilir.
