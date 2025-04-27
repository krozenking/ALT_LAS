## İşçi 2: Segmentation Uzmanı - Yapılacaklar Listesi

Bu liste, İşçi 2 (Segmentation Uzmanı) için `updated_worker_tasks.md` ve `detailed_worker_roadmaps.md` belgelerine ve mevcut kod tabanına dayalı olarak oluşturulmuştur.

### Görevler

**1. Temel Altyapı Doğrulama (Hafta 1-2)**
- [x] **Görev 2.1-2.5:** Proje kurulumunu (FastAPI, Python 3.10+, Pydantic 2.0+), API yapılandırmasını, loglamayı, hata işlemeyi ve temel veri modellerini (Pydantic) gözden geçir. `requirements.txt` dosyasını kontrol et ve bağımlılıkları güncelle.
- [ ] **(Ek Görev):** Temel birim testlerinin (`pytest`) mevcut durumunu kontrol et ve eksikleri tamamla.

**2. DSL & Ayrıştırma İyileştirme (Hafta 3-4)**
- [x] **Görev 2.6:** DSL şemasını (`dsl_schema.py`, `enhanced_dsl_schema.py`) gözden geçir ve belgelendir (`dsl_documentation.md` oluşturuldu).
- [x] **Görev 2.7:** Komut ayrıştırma algoritmasını (`command_parser.py`) incele, doğruluğunu test et ve iyileştir (`enhanced_command_parser.py` oluşturuldu).
- [x] **Görev 2.8:** NLP entegrasyonunu (`language_processor.py`, `enhanced_language_processor.py`) kontrol et (spaCy/NLTK kullanımı, NER, dependency parsing vb.). Gerekirse modelleri güncelle/eğit (`enhanced_language_processor.py` oluşturuldu ve `enhanced_command_parser.py` içine entegre edildi).
- [ ] **Görev 2.9:** `*.alt` dosya formatı işleme (`alt_file_handler.py`?) mekanizmasını doğrula. (Not: Bu işlevsellik `dsl_schema.py` ve `enhanced_dsl_schema.py` içinde görünüyor).
- [ ] **Görev 2.10:** Ayrıştırma testlerinin (`test_command_parser.py`?, `test_dsl_schema.py`?) kapsamını ve doğruluğunu artır.

**3. Mod & Persona Sistemi Tamamlama (Hafta 5-6)**
- [ ] **Görev 2.11:** Çalışma modlarının (Normal, Dream, Explore, Chaos) ayrıştırma ve segmentasyon üzerindeki etkisini kodda (`enhanced_command_parser.py`?) doğrula ve/veya implemente et.
- [ ] **Görev 2.12:** Chaos level parametresinin işlenmesini doğrula/implemente et.
- [ ] **Görev 2.13:** Persona sisteminin etkisini doğrula/implemente et.
- [ ] **Görev 2.14:** Mod ve persona ile ilgili metadata'nın `*.alt` dosyasına doğru şekilde eklendiğini kontrol et.
- [ ] **Görev 2.15:** Mod ve persona davranışlarını test eden yeni test senaryoları ekle.

**4. Segmentasyon & Metadata Geliştirme (Hafta 7-8)**
- [ ] **Görev 2.16:** Ana komut segmentasyon algoritmasını (atomik görevlere ayırma, bağımlılık belirleme) incele, test et ve iyileştir (`enhanced_command_parser.py` içinde kısmen yapıldı, daha fazla iyileştirme gerekebilir).
- [ ] **Görev 2.17:** Otomatik metadata ekleme ve etiketleme sistemini gözden geçir/geliştir.
- [ ] **Görev 2.18:** Bağlam analizi ve referans çözümleme yeteneklerini ekle/iyileştir (`enhanced_language_processor.py` veya `enhanced_command_parser.py`?).
- [ ] **Görev 2.19:** Komut içindeki değişkenlerin çıkarılması ve işlenmesini sağla (`enhanced_command_parser.py` içinde temel başlangıç yapıldı).
- [ ] **Görev 2.20:** Kapsamlı segmentasyon testleri (karmaşık komutlar, kenar durumlar) ekle.

**5. API & Entegrasyon Doğrulama (Hafta 9-10)**
- [ ] **Görev 2.21:** API Gateway ile entegrasyonu (`enhanced_main.py` endpointleri) doğrula.
- [ ] **Görev 2.22:** Runner Service ile entegrasyonu (`integration_module.py`?) kontrol et ve test et (segment gönderme, durum alma).
- [ ] **Görev 2.23:** API dokümantasyonunu (FastAPI/Swagger) gözden geçir ve güncelle.
- [ ] **Görev 2.24:** Entegrasyon testlerini (`test_integration.py`) gözden geçir ve genişlet.
- [ ] **Görev 2.25:** Performans optimizasyonu (mevcut optimizasyon dosyalarını incele ve uygula).

**6. İleri Özellikler & Stabilizasyon (Hafta 11-12)**
- [ ] **Görev 2.26:** Çoklu dil desteğini (`enhanced_language_processor.py`) test et ve iyileştir (örn. Türkçe spaCy modeli ekleme).
- [ ] **Görev 2.27:** Task Prioritization Modülü (`task_prioritization.py`) işlevselliğini doğrula ve Worker 4 ile entegrasyonu netleştir.
- [ ] **Görev 2.28:** Hata ayıklama ve genel performans iyileştirmeleri yap.
- [ ] **Görev 2.29:** Kod içi dokümantasyonu (docstrings) ve README dosyasını güncelle.
- [ ] **Görev 2.30:** CI/CD pipeline'ının (Worker 8'in sorumluluğu) servis ile uyumlu çalıştığından emin ol.

