# ALT_LAS Projesi Geliştirme Planı (Mayıs 2025)

Bu plan, ALT_LAS projesinin tamamlanması amacıyla, daha önce oluşturulan boşluk analizi raporu (`gap_analysis_report.md`) ve projenin genel hedefleri doğrultusunda önceliklendirilmiş geliştirme adımlarını içermektedir.

## Genel Yaklaşım

Geliştirme süreci, aşağıdaki temel prensiplere dayanacaktır:

1.  **Aşamalı Geliştirme**: Proje, mantıksal modüller ve işlevler halinde aşama aşama geliştirilecektir.
2.  **Önceliklendirme**: En kritik ve temel işlevselliği sağlayan eksiklikler ilk olarak ele alınacaktır.
3.  **Sürekli Entegrasyon ve Test**: Her geliştirme aşamasından sonra kapsamlı testler yapılacak ve entegrasyon sağlanacaktır.
4.  **Düzenli Güncelleme ve Geri Bildirim**: Kullanıcı, her önemli kilometre taşında bilgilendirilecek ve geri bildirimleri alınacaktır.
5.  **Dokümantasyon**: Tüm geliştirme süreçleri boyunca dokümantasyon (kod içi ve harici) güncel tutulacaktır.

## Önceliklendirilmiş Geliştirme Aşamaları

Boşluk analizi raporunda belirtilen eksiklikler dikkate alınarak aşağıdaki geliştirme sırası ve öncelikler belirlenmiştir:

### Aşama 1: Temel Çekirdek Servislerin Tamamlanması ve Stabilizasyonu

Bu aşamanın amacı, projenin temel işlevlerini yerine getirebilmesi için en kritik eksiklikleri gidermektir.

1.  **Segmentation Service Kaynak Kodlarının Geliştirilmesi ve Entegrasyonu**:
    *   **Görev**: `segmentation-service/src` dizini oluşturulacak, `enhanced_main.py` ve diğer gerekli Python/FastAPI kaynak kodları geliştirilecektir.
    *   **Hedef**: Komut ayrıştırma, `*.alt` dosyası oluşturma, Mod ve Persona sistemlerinin tam işlevselliğe kavuşturulması.
    *   **Bağımlılıklar**: API Gateway, Runner Service ile entegrasyon.
    *   **Tahmini Süre**: 2-3 Hafta.

2.  **AI Orchestrator Temel Entegrasyonlarının Güçlendirilmesi**:
    *   **Görev**: Mevcut AI Orchestrator yapısının gözden geçirilmesi, temel model yönetimi ve diğer servislerle (özellikle Segmentation ve Runner) entegrasyonunun sorunsuz çalışır hale getirilmesi.
    *   **Hedef**: Temel LLM ve diğer basit AI görevlerinin güvenilir bir şekilde orkestre edilebilmesi.
    *   **Tahmini Süre**: 1-2 Hafta.

3.  **Genel Sistem Stabilizasyonu ve Testleri**:
    *   **Görev**: Aşama 1.1 ve 1.2 tamamlandıktan sonra, temel servislerin (API Gateway, Workflow Engine, Segmentation, Runner, Archive, OS Integration, AI Orchestrator) birbirleriyle uyumlu çalıştığından emin olmak için kapsamlı entegrasyon testleri yapılacaktır.
    *   **Hedef**: Temel bir kullanıcı senaryosunun (komut girişi -> segmentasyon -> yürütme -> arşivleme) sorunsuz çalışması.
    *   **Tahmini Süre**: 1 Hafta.

### Aşama 2: Güvenlik Katmanının Oluşturulması

Bu aşama, sistemin güvenliğini sağlamak için mimaride tanımlanan Güvenlik Katmanı bileşenlerinin geliştirilmesine odaklanacaktır.

1.  **Policy Enforcement Service Geliştirilmesi (Rust)**:
    *   **Görev**: Güvenlik politikalarını tanımlama ve uygulama altyapısının oluşturulması.
    *   **Hedef**: Temel erişim kontrol ve yetkilendirme politikalarının uygulanabilmesi.
    *   **Tahmini Süre**: 2-3 Hafta.

2.  **Sandbox Manager Service Geliştirilmesi (Go)**:
    *   **Görev**: Görevlerin ve AI modellerinin izole ortamlarda çalıştırılması için sandbox yönetimi altyapısının oluşturulması.
    *   **Hedef**: Temel görev izolasyonunun sağlanması.
    *   **Tahmini Süre**: 2-3 Hafta.

3.  **Audit Service Geliştirilmesi (Go)**:
    *   **Görev**: Sistemdeki önemli olayların ve güvenlik günlüklerinin kaydedilmesi için denetim servisinin oluşturulması.
    *   **Hedef**: Temel denetim kayıtlarının toplanması ve saklanması.
    *   **Tahmini Süre**: 1-2 Hafta.

### Aşama 3: Kullanıcı Arayüzlerinin Geliştirilmesi ve Tamamlanması

Bu aşama, kullanıcıların platformla etkileşim kurabileceği arayüzlerin geliştirilmesine ve mevcutların tamamlanmasına odaklanacaktır.

1.  **Desktop UI Entegrasyonunun Tamamlanması**:
    *   **Görev**: Mevcut Electron/React Desktop UI uygulamasının tüm backend servisleriyle tam entegrasyonunun sağlanması ve tüm temel işlevlerin (görev gönderme, izleme, ayarlar vb.) çalışır hale getirilmesi.
    *   **Tahmini Süre**: 3-4 Hafta.

2.  **Web Dashboard Geliştirilmesi (React)**:
    *   **Görev**: `ui/web` altında sıfırdan bir Web Dashboard uygulaması geliştirilecektir. Görev izleme, analitik, kullanıcı yönetimi ve sistem ayarları gibi temel özellikleri içerecektir.
    *   **Tahmini Süre**: 4-6 Hafta.

3.  **Mobil Companion Uygulaması Geliştirilmesi (React Native)**:
    *   **Görev**: `ui/mobile` altında sıfırdan bir Mobil Companion uygulaması geliştirilecektir. Temel bildirimler, uzaktan görev tetikleme ve durum izleme gibi özellikleri içerecektir.
    *   **Tahmini Süre**: 4-6 Hafta (Web Dashboard sonrası başlanabilir).

### Aşama 4: Gelişmiş AI Yetenekleri ve Workflow İyileştirmeleri

Bu aşama, platformun AI yeteneklerini artırmaya ve Workflow Engine'i daha güçlü hale getirmeye odaklanacaktır.

1.  **Gelişmiş AI Model Entegrasyonları (AI Orchestrator)**:
    *   **Görev**: Computer Vision (OpenCV, Tesseract) ve Ses İşleme (Whisper, MIT lisanslı TTS alternatifi) yeteneklerinin tam entegrasyonu. Bağlam anlama ve sürdürme yeteneklerinin geliştirilmesi.
    *   **Tahmini Süre**: 3-5 Hafta.

2.  **Workflow Engine İyileştirmeleri**:
    *   **Görev**: Koşullu mantık, döngüler gibi karmaşık iş akışları için destek eklenmesi. Daha fazla entegrasyon "parçası" (piece) geliştirilmesi. UI tarafında görsel iş akışı tasarım arayüzü için altyapı (API desteği).
    *   **Tahmini Süre**: 2-4 Hafta.

### Aşama 5: Diğer Entegrasyon Servisleri ve Sonlandırma

Bu aşama, mimaride belirtilen diğer entegrasyon servislerinin geliştirilmesini ve projenin genel olarak sonlandırılmasını kapsar.

1.  **Device Control Service Geliştirilmesi (Python)**:
    *   **Görev**: Donanım kontrolü, sensör verileri ve çevre birimleri ile etkileşim için servis geliştirilmesi.
    *   **Tahmini Süre**: 2-3 Hafta (Projenin genel ilerleyişine göre önceliği ayarlanabilir).

2.  **Network Service Geliştirilmesi (Go)**:
    *   **Görev**: Ağ yönetimi, cihaz keşfi ve güvenlik duvarı kontrolü için servis geliştirilmesi.
    *   **Tahmini Süre**: 2-3 Hafta (Projenin genel ilerleyişine göre önceliği ayarlanabilir).

3.  **Kapsamlı Test, Optimizasyon ve Dokümantasyon Son Kontrolleri**:
    *   **Görev**: Tüm sistemin uçtan uca test edilmesi, performans optimizasyonları, güvenlik denetimleri ve tüm dokümantasyonun son kez gözden geçirilmesi.
    *   **Tahmini Süre**: 2-4 Hafta.

## Sonraki Adımlar

Bu geliştirme planı, projenin genel bir yol haritasını sunmaktadır. İlk olarak **Aşama 1: Temel Çekirdek Servislerin Tamamlanması ve Stabilizasyonu** ile başlanacaktır. Özellikle **Segmentation Service kaynak kodlarının geliştirilmesi** ilk öncelikli görev olacaktır.

Her aşamanın başında ve sonunda kullanıcıya detaylı bilgi verilecek ve gerekirse plan üzerinde güncellemeler yapılacaktır.
