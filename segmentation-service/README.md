# Segmentation Service Dokümantasyonu

## Genel Bakış

Segmentation Service, ALT_LAS platformunun komut segmentasyonu ve görev analizi bileşenidir. Bu servis, kullanıcı komutlarını alır, analiz eder ve bunları ALT_LAS sisteminin işleyebileceği görev segmentlerine dönüştürür.

## Mimari

Segmentation Service, aşağıdaki bileşenlerden oluşur:

1. **FastAPI Uygulaması**: RESTful API sağlayan ana uygulama
2. **Komut Ayrıştırıcı**: Doğal dil komutlarını yapılandırılmış görevlere dönüştürür
3. **DSL Şeması**: Görev segmentlerinin veri modelini tanımlar
4. **ALT Dosya İşleyici**: *.alt dosyalarını okuma, yazma ve yönetme işlevleri sağlar
5. **Görev Önceliklendirme**: Görevleri önem ve bağımlılıklarına göre sıralar
6. **Performans Optimizasyonu**: Servisin performansını iyileştiren araçlar sağlar
7. **Hata İşleme**: Yapılandırılmış hata yanıtları ve loglama sağlar

## API Referansı

### Kök Endpoint

```
GET /
```

Servisin durumunu ve sürüm bilgisini döndürür.

### Sağlık Kontrolü

```
GET /health
```

Servisin sağlık durumunu kontrol eder.

### Komut Segmentasyonu

```
POST /segment
```

Bir komutu segmentlere ayırır ve bir ALT dosyası oluşturur.

**İstek Gövdesi**:
```json
{
  "command": "Dosyaları sırala ve en büyük 10 tanesini göster",
  "mode": "Normal",
  "persona": "technical_expert",
  "metadata": {
    "user_id": "12345",
    "session_id": "abcdef"
  }
}
```

**Yanıt**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "alt_file": "task_550e8400-e29b-41d4-a716-446655440000.alt.yaml",
  "language": "tr",
  "segments_count": 2,
  "metadata": {
    "timestamp": "2025-04-26T06:49:00.000Z",
    "mode": "Normal",
    "persona": "technical_expert",
    "parse_time_seconds": 0.1234,
    "user_id": "12345",
    "session_id": "abcdef"
  }
}
```

### Segmentasyon Durumu

```
GET /segment/{task_id}
```

Bir segmentasyon görevinin durumunu döndürür.

### ALT Dosyaları Listesi

```
GET /alt-files
```

Mevcut tüm ALT dosyalarının listesini döndürür.

### ALT Dosyası Alma

```
GET /alt-files/{filename}
```

Belirtilen ALT dosyasının içeriğini döndürür.

### ALT Dosyası Silme

```
DELETE /alt-files/{filename}
```

Belirtilen ALT dosyasını siler.

### Desteklenen Diller

```
GET /languages
```

Desteklenen dillerin listesini döndürür.

### Desteklenen Modlar

```
GET /modes
```

Desteklenen modların listesini döndürür.

## Veri Modelleri

### SegmentationRequest

```python
class SegmentationRequest(BaseModel):
    command: str
    mode: Optional[str] = "Normal"
    persona: Optional[str] = "technical_expert"
    metadata: Optional[Dict[str, Any]] = None
```

### SegmentationResponse

```python
class SegmentationResponse(BaseModel):
    id: str
    status: str
    alt_file: str
    language: str
    segments_count: int
    metadata: Dict[str, Any]
```

### AltFile

```python
class AltFile(BaseModel):
    id: str
    command: str
    language: str
    mode: str
    persona: str
    chaos_level: Optional[int] = None
    segments: List[TaskSegment]
    metadata: Dict[str, Any] = {}
```

### TaskSegment

```python
class TaskSegment(BaseModel):
    id: str
    task_type: str
    content: str
    parameters: List[TaskParameter] = []
    dependencies: List[str] = []
    metadata: Dict[str, Any] = {}
```

### TaskParameter

```python
class TaskParameter(BaseModel):
    name: str
    value: Any
    type: str
    required: bool = False
    description: Optional[str] = None
```

## Kurulum ve Çalıştırma

### Gereksinimler

```
fastapi==0.104.1
pydantic==2.4.2
uvicorn==0.23.2
pyparsing==3.1.1
nltk==3.8.1
pyyaml==6.0.1
```

### Kurulum

```bash
# Depoyu klonla
git clone https://github.com/krozenking/ALT_LAS.git

# Segmentation Service dizinine git
cd ALT_LAS/segmentation-service

# Bağımlılıkları yükle
pip install -r requirements_updated.txt

# NLTK verilerini indir
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

### Çalıştırma

```bash
# Geliştirme sunucusu
uvicorn enhanced_main:app --reload

# Üretim sunucusu
uvicorn enhanced_main:app --host 0.0.0.0 --port 8000
```

### Docker ile Çalıştırma

```bash
# Docker imajı oluştur
docker build -t alt-las/segmentation-service .

# Docker konteynerini çalıştır
docker run -p 8000:8000 alt-las/segmentation-service
```

## Performans Optimizasyonu

Segmentation Service, yüksek performans için çeşitli optimizasyon teknikleri kullanır:

1. **Önbellek (Memoization)**: Tekrarlanan işlemlerin sonuçları önbelleklenir.
2. **Paralel İşleme**: Çoklu görevler paralel olarak işlenir.
3. **Asenkron İşleme**: Uzun süren işlemler arka planda asenkron olarak yürütülür.
4. **Bellek Optimizasyonu**: Bellek kullanımı izlenir ve optimize edilir.

Detaylı performans metrikleri ve benchmark sonuçları için `performance_improvements.md` dosyasına bakın.

## Hata İşleme

Segmentation Service, yapılandırılmış hata yanıtları ve kapsamlı loglama sağlar:

1. **Hata Kodları**: Her hata türü için özel hata kodları
2. **İstek Kimliği**: Her istek için benzersiz bir kimlik
3. **Detaylı Hata Mesajları**: Sorun gidermeyi kolaylaştıran açıklayıcı mesajlar
4. **Loglama**: Tüm istekler, yanıtlar ve hatalar loglanır

## Test

Segmentation Service, kapsamlı birim ve entegrasyon testleri içerir:

```bash
# Tüm testleri çalıştır
python -m pytest

# Belirli bir test dosyasını çalıştır
python -m pytest test_dsl_schema.py

# Kapsam raporu ile çalıştır
python -m pytest --cov=. --cov-report=html
```

## CI/CD Entegrasyonu

Segmentation Service, GitHub Actions kullanarak sürekli entegrasyon ve dağıtım sağlar:

1. **Otomatik Testler**: Her commit için testler otomatik olarak çalıştırılır
2. **Kod Kalitesi**: Linting ve kod formatı kontrolleri
3. **Docker İmajı**: Başarılı testlerden sonra Docker imajı oluşturulur
4. **Otomatik Dağıtım**: Ana dala yapılan commitler otomatik olarak dağıtılır

## Katkıda Bulunma

Segmentation Service'e katkıda bulunmak için:

1. Depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

ALT_LAS Segmentation Service, MIT lisansı altında lisanslanmıştır.
