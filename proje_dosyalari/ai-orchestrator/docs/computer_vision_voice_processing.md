# Computer Vision ve Ses İşleme Servisleri Dokümantasyonu

Bu dokümantasyon, AI Orchestrator bileşeni için geliştirilen Computer Vision ve Ses İşleme servislerinin kullanımını ve özelliklerini açıklamaktadır.

## İçindekiler

1. [Computer Vision Servisi](#computer-vision-servisi)
   - [Genel Bakış](#genel-bakış)
   - [Özellikler](#özellikler)
   - [Kullanım Örnekleri](#kullanım-örnekleri)
   - [API Referansı](#api-referansı)
   - [Yapılandırma Seçenekleri](#yapılandırma-seçenekleri)

2. [Ses İşleme Servisi](#ses-i̇şleme-servisi)
   - [Genel Bakış](#genel-bakış-1)
   - [Özellikler](#özellikler-1)
   - [Kullanım Örnekleri](#kullanım-örnekleri-1)
   - [API Referansı](#api-referansı-1)
   - [Yapılandırma Seçenekleri](#yapılandırma-seçenekleri-1)

3. [Entegrasyon Kılavuzu](#entegrasyon-kılavuzu)
   - [Bağımlılıklar](#bağımlılıklar)
   - [Kurulum](#kurulum)
   - [Diğer Servislerle Entegrasyon](#diğer-servislerle-entegrasyon)

4. [Performans ve Optimizasyon](#performans-ve-optimizasyon)
   - [Önbellek Kullanımı](#önbellek-kullanımı)
   - [Kaynak Yönetimi](#kaynak-yönetimi)
   - [Ölçeklendirme](#ölçeklendirme)

5. [Hata Ayıklama ve Sorun Giderme](#hata-ayıklama-ve-sorun-giderme)

## Computer Vision Servisi

### Genel Bakış

Computer Vision Servisi, AI Orchestrator bileşeni için görüntü işleme, OCR (Optik Karakter Tanıma) ve nesne tanıma yetenekleri sağlar. Bu servis, OpenCV ve Tesseract gibi güçlü kütüphaneleri kullanarak çeşitli görüntü işleme görevlerini gerçekleştirir.

### Özellikler

- **Görüntü İşleme**:
  - Yeniden boyutlandırma
  - Kırpma
  - Gri tonlamaya dönüştürme
  - Bulanıklaştırma
  - Kenar tespiti
  - Parlaklık, kontrast ve keskinlik ayarlamaları

- **OCR (Optik Karakter Tanıma)**:
  - Görüntülerden metin çıkarma
  - Çoklu dil desteği
  - Metin bölgelerinin sınırlayıcı kutularını tespit etme
  - Ön işleme seçenekleri (eşikleme, gürültü azaltma)

- **Nesne Tanıma**:
  - YOLO modeli ile nesne tespiti
  - SSD modeli ile nesne tespiti
  - OpenCV'nin yerleşik Haar Cascade sınıflandırıcıları ile yüz ve göz tespiti
  - Sınırlayıcı kutuların çizimi

- **Genel Özellikler**:
  - Asenkron işlem desteği
  - Önbellek mekanizması
  - Kapsamlı hata işleme
  - İstatistik toplama ve raporlama
  - Çeşitli görüntü formatları desteği (JPEG, PNG, vb.)

### Kullanım Örnekleri

#### Görüntü İşleme

```python
import asyncio
from ai_orchestrator.src.services.computer_vision import ComputerVisionService

async def resize_image_example():
    # Servisi başlat
    cv_service = ComputerVisionService()
    await cv_service.initialize()
    
    # Görüntüyü yükle (dosya yolu, base64 veya numpy dizisi olabilir)
    image_path = "/path/to/image.jpg"
    
    # Görüntüyü yeniden boyutlandır
    result = await cv_service.process_image(
        image_path,
        operation="resize",
        parameters={"width": 800, "height": 600}
    )
    
    if result["success"]:
        # İşlenmiş görüntüyü kullan (base64 formatında)
        processed_image = result["processed_image"]
        print(f"Görüntü başarıyla yeniden boyutlandırıldı: {result['width']}x{result['height']}")
        print(f"İşlem süresi: {result['processing_time']} saniye")
    else:
        print(f"Hata: {result['error']}")

# Örneği çalıştır
asyncio.run(resize_image_example())
```

#### OCR (Optik Karakter Tanıma)

```python
import asyncio
from ai_orchestrator.src.services.computer_vision import ComputerVisionService

async def ocr_example():
    # Servisi başlat
    cv_service = ComputerVisionService()
    await cv_service.initialize()
    
    # Görüntüyü yükle
    image_path = "/path/to/text_image.jpg"
    
    # OCR işlemi gerçekleştir
    result = await cv_service.perform_ocr(
        image_path,
        parameters={
            "lang": "tur+eng",  # Türkçe ve İngilizce
            "preprocess": True,  # Ön işleme uygula
            "get_boxes": True    # Metin bölgelerinin konumlarını al
        }
    )
    
    if result["success"]:
        print(f"Tanınan metin: {result['text']}")
        
        if "boxes" in result:
            print(f"Metin bölgeleri sayısı: {len(result['boxes'])}")
            for i, box in enumerate(result['boxes']):
                print(f"Bölge {i+1}: '{box['text']}' - Güven: {box['conf']}")
        
        print(f"İşlem süresi: {result['processing_time']} saniye")
    else:
        print(f"Hata: {result['error']}")

# Örneği çalıştır
asyncio.run(ocr_example())
```

#### Nesne Tanıma

```python
import asyncio
from ai_orchestrator.src.services.computer_vision import ComputerVisionService

async def object_detection_example():
    # Servisi başlat
    cv_service = ComputerVisionService()
    await cv_service.initialize()
    
    # Görüntüyü yükle
    image_path = "/path/to/scene.jpg"
    
    # Nesne tanıma işlemi gerçekleştir
    result = await cv_service.detect_objects(
        image_path,
        parameters={
            "model": "yolo",
            "confidence_threshold": 0.5,
            "draw_boxes": True  # Sınırlayıcı kutuları çiz
        }
    )
    
    if result["success"]:
        print(f"Tespit edilen nesne sayısı: {result['count']}")
        
        for i, obj in enumerate(result['objects']):
            print(f"Nesne {i+1}: {obj['class']} - Güven: {obj['confidence']:.2f}")
            print(f"  Konum: x={obj['box'][0]}, y={obj['box'][1]}, w={obj['box'][2]}, h={obj['box'][3]}")
        
        # İşaretlenmiş görüntüyü kullan (base64 formatında)
        if "annotated_image" in result:
            annotated_image = result["annotated_image"]
            # Görüntüyü kaydet veya göster
        
        print(f"İşlem süresi: {result['processing_time']} saniye")
    else:
        print(f"Hata: {result['error']}")

# Örneği çalıştır
asyncio.run(object_detection_example())
```

### API Referansı

#### `ComputerVisionService`

```python
class ComputerVisionService:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Computer Vision Servisi'ni başlatır.
        
        Args:
            config: Yapılandırma sözlüğü
        """
        
    async def initialize(self) -> bool:
        """
        Servisi başlatır ve gerekli modelleri yükler.
        
        Returns:
            Başarılı ise True, değilse False
        """
        
    async def process_image(
        self, 
        image_data: Union[str, bytes, np.ndarray],
        operation: str = "enhance",
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Görüntüyü çeşitli işlemlerle işler.
        
        Args:
            image_data: Base64 string, bytes veya numpy dizisi olarak görüntü verisi
            operation: Gerçekleştirilecek işlem (enhance, resize, crop, grayscale, blur, edge_detection)
            parameters: İşleme özgü parametreler
            
        Returns:
            İşlenmiş görüntü ve metadata içeren sözlük
        """
        
    async def perform_ocr(
        self, 
        image_data: Union[str, bytes, np.ndarray],
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Görüntü üzerinde OCR (Optik Karakter Tanıma) gerçekleştirir.
        
        Args:
            image_data: Base64 string, bytes veya numpy dizisi olarak görüntü verisi
            parameters: OCR parametreleri
            
        Returns:
            OCR sonuçları ve metadata içeren sözlük
        """
        
    async def detect_objects(
        self, 
        image_data: Union[str, bytes, np.ndarray],
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Görüntüdeki nesneleri tespit eder.
        
        Args:
            image_data: Base64 string, bytes veya numpy dizisi olarak görüntü verisi
            parameters: Nesne tespiti parametreleri
            
        Returns:
            Tespit edilen nesneler ve metadata içeren sözlük
        """
        
    def get_stats(self) -> Dict[str, Any]:
        """
        Servis istatistiklerini döndürür.
        
        Returns:
            İstatistik sözlüğü
        """
```

### Yapılandırma Seçenekleri

Computer Vision Servisi, aşağıdaki yapılandırma seçeneklerini destekler:

```python
config = {
    "ocr": {
        "lang": "eng",                # Varsayılan OCR dili
        "config": "--psm 3",          # Tesseract yapılandırması
        "timeout": 30,                # Zaman aşımı (saniye)
        "cache_enabled": True,        # Önbellek etkin mi
        "cache_size": 100,            # Önbellek boyutu
        "tesseract_cmd": "/usr/bin/tesseract"  # Tesseract yolu (isteğe bağlı)
    },
    
    "object_detection": {
        "confidence_threshold": 0.5,  # Güven eşiği
        "nms_threshold": 0.4,         # Non-maximum suppression eşiği
        "model": "yolo",              # Varsayılan model (yolo veya ssd)
        "cache_enabled": True,        # Önbellek etkin mi
        "cache_size": 50,             # Önbellek boyutu
        "preload_models": False,      # Modelleri önceden yükle
        "weights_path": "models/yolov4.weights",  # YOLO ağırlıkları yolu
        "config_path": "models/yolov4.cfg",       # YOLO yapılandırma yolu
        "coco_names_path": "models/coco.names"    # COCO sınıf isimleri yolu
    },
    
    "image_processing": {
        "default_resize": (800, 600), # Varsayılan yeniden boyutlandırma
        "default_format": "JPEG",     # Varsayılan format
        "quality": 90,                # JPEG kalitesi
        "cache_enabled": True,        # Önbellek etkin mi
        "cache_size": 200             # Önbellek boyutu
    }
}

# Servisi yapılandırma ile başlat
cv_service = ComputerVisionService(config)
```

## Ses İşleme Servisi

### Genel Bakış

Ses İşleme Servisi, AI Orchestrator bileşeni için konuşma tanıma, metin-konuşma sentezi ve ses işleme yetenekleri sağlar. Bu servis, çeşitli ses işleme kütüphanelerini kullanarak ses verilerini işler ve dönüştürür.

### Özellikler

- **Konuşma Tanıma**:
  - Ses dosyalarından metin çıkarma
  - Çoklu dil desteği
  - Farklı tanıma motorları desteği (Google, Sphinx)

- **Metin-Konuşma Sentezi**:
  - Metinden ses üretme
  - Çoklu dil desteği
  - Konuşma hızı ayarı

- **Ses İşleme**:
  - Format dönüştürme
  - Ses kırpma
  - Ses normalleştirme
  - Hız değiştirme
  - Perde değiştirme

- **Genel Özellikler**:
  - Asenkron işlem desteği
  - Önbellek mekanizması
  - Kapsamlı hata işleme
  - İstatistik toplama ve raporlama
  - Çeşitli ses formatları desteği (WAV, MP3, vb.)

### Kullanım Örnekleri

#### Konuşma Tanıma

```python
import asyncio
from ai_orchestrator.src.services.voice_processing import VoiceProcessingService

async def speech_recognition_example():
    # Servisi başlat
    voice_service = VoiceProcessingService()
    await voice_service.initialize()
    
    # Ses dosyasını yükle
    audio_path = "/path/to/speech.wav"
    
    # Konuşma tanıma işlemi gerçekleştir
    result = await voice_service.recognize_speech(
        audio_path,
        parameters={
            "language": "tr-TR",  # Türkçe
            "engine": "google"    # Google Speech Recognition kullan
        }
    )
    
    if result["success"]:
        print(f"Tanınan metin: {result['text']}")
        print(f"Dil: {result['language']}")
        print(f"Motor: {result['engine']}")
        print(f"İşlem süresi: {result['processing_time']} saniye")
    else:
        print(f"Hata: {result['error']}")

# Örneği çalıştır
asyncio.run(speech_recognition_example())
```

#### Metin-Konuşma Sentezi

```python
import asyncio
from ai_orchestrator.src.services.voice_processing import VoiceProcessingService

async def text_to_speech_example():
    # Servisi başlat
    voice_service = VoiceProcessingService()
    await voice_service.initialize()
    
    # Metni konuşmaya dönüştür
    text = "Merhaba, bu bir test mesajıdır."
    
    result = await voice_service.synthesize_speech(
        text,
        parameters={
            "language": "tr",  # Türkçe
            "slow": False      # Normal hız
        }
    )
    
    if result["success"]:
        # Sentezlenen sesi kullan (base64 formatında)
        audio_data = result["audio"]
        print(f"Metin başarıyla sese dönüştürüldü")
        print(f"Format: {result['format']}")
        print(f"İşlem süresi: {result['processing_time']} saniye")
        
        # Sesi kaydet
        with open("output.mp3", "wb") as f:
            # Base64 önekini kaldır ve decode et
            audio_binary = audio_data.split(",")[1]
            import base64
            f.write(base64.b64decode(audio_binary))
            
        print("Ses dosyası kaydedildi: output.mp3")
    else:
        print(f"Hata: {result['error']}")

# Örneği çalıştır
asyncio.run(text_to_speech_example())
```

#### Ses İşleme

```python
import asyncio
from ai_orchestrator.src.services.voice_processing import VoiceProcessingService

async def audio_processing_example():
    # Servisi başlat
    voice_service = VoiceProcessingService()
    await voice_service.initialize()
    
    # Ses dosyasını yükle
    audio_path = "/path/to/audio.mp3"
    
    # Ses formatını dönüştür
    result = await voice_service.process_audio(
        audio_path,
        operation="convert",
        parameters={
            "format": "wav",
            "sample_rate": 16000,
            "channels": 1
        }
    )
    
    if result["success"]:
        # İşlenmiş sesi kullan (base64 formatında)
        processed_audio = result["audio"]
        print(f"Ses başarıyla dönüştürüldü")
        print(f"Format: {result['format']}")
        print(f"Örnekleme hızı: {result['sample_rate']} Hz")
        print(f"Kanal sayısı: {result['channels']}")
        print(f"İşlem süresi: {result['processing_time']} saniye")
        
        # Sesi kaydet
        with open("converted.wav", "wb") as f:
            # Base64 önekini kaldır ve decode et
            audio_binary = processed_audio.split(",")[1]
            import base64
            f.write(base64.b64decode(audio_binary))
            
        print("Ses dosyası kaydedildi: converted.wav")
    else:
        print(f"Hata: {result['error']}")

# Örneği çalıştır
asyncio.run(audio_processing_example())
```

### API Referansı

#### `VoiceProcessingService`

```python
class VoiceProcessingService:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Ses İşleme Servisi'ni başlatır.
        
        Args:
            config: Yapılandırma sözlüğü
        """
        
    async def initialize(self) -> bool:
        """
        Servisi başlatır ve gerekli bağımlılıkları kontrol eder.
        
        Returns:
            Başarılı ise True, değilse False
        """
        
    async def recognize_speech(
        self, 
        audio_data: Union[str, bytes, np.ndarray],
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Ses verisinden konuşmayı tanır.
        
        Args:
            audio_data: Base64 string, bytes veya numpy dizisi olarak ses verisi
            parameters: Tanıma parametreleri
            
        Returns:
            Tanıma sonuçları ve metadata içeren sözlük
        """
        
    async def synthesize_speech(
        self, 
        text: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Metinden konuşma sentezler.
        
        Args:
            text: Sentezlenecek metin
            parameters: Sentez parametreleri
            
        Returns:
            Sentezlenen ses ve metadata içeren sözlük
        """
        
    async def process_audio(
        self, 
        audio_data: Union[str, bytes, np.ndarray],
        operation: str = "convert",
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Ses verisini çeşitli işlemlerle işler.
        
        Args:
            audio_data: Base64 string, bytes veya numpy dizisi olarak ses verisi
            operation: Gerçekleştirilecek işlem (convert, trim, normalize, change_speed)
            parameters: İşleme özgü parametreler
            
        Returns:
            İşlenmiş ses ve metadata içeren sözlük
        """
        
    def get_stats(self) -> Dict[str, Any]:
        """
        Servis istatistiklerini döndürür.
        
        Returns:
            İstatistik sözlüğü
        """
```

### Yapılandırma Seçenekleri

Ses İşleme Servisi, aşağıdaki yapılandırma seçeneklerini destekler:

```python
config = {
    "speech_recognition": {
        "language": "en-US",          # Varsayılan tanıma dili
        "timeout": 10,                # Zaman aşımı (saniye)
        "phrase_time_limit": 10,      # Maksimum ifade süresi
        "energy_threshold": 300,      # Enerji eşiği
        "dynamic_energy_threshold": True,  # Dinamik enerji eşiği
        "pause_threshold": 0.8,       # Duraklama eşiği
        "cache_enabled": True,        # Önbellek etkin mi
        "cache_size": 50              # Önbellek boyutu
    },
    
    "text_to_speech": {
        "language": "en",             # Varsayılan sentez dili
        "slow": False,                # Yavaş konuşma
        "cache_enabled": True,        # Önbellek etkin mi
        "cache_size": 100             # Önbellek boyutu
    },
    
    "audio_processing": {
        "sample_rate": 16000,         # Varsayılan örnekleme hızı
        "channels": 1,                # Varsayılan kanal sayısı
        "format": "wav",              # Varsayılan format
        "cache_enabled": True,        # Önbellek etkin mi
        "cache_size": 50              # Önbellek boyutu
    }
}

# Servisi yapılandırma ile başlat
voice_service = VoiceProcessingService(config)
```

## Entegrasyon Kılavuzu

### Bağımlılıklar

Computer Vision ve Ses İşleme servisleri için aşağıdaki bağımlılıklar gereklidir:

#### Computer Vision Servisi Bağımlılıkları

```
opencv-python>=4.5.0
pytesseract>=0.3.8
numpy>=1.20.0
Pillow>=8.0.0
```

#### Ses İşleme Servisi Bağımlılıkları

```
SpeechRecognition>=3.8.1
pydub>=0.25.1
gTTS>=2.2.3
numpy>=1.20.0
```

### Kurulum

Bağımlılıkları pip ile kurabilirsiniz:

```bash
pip install opencv-python pytesseract numpy Pillow SpeechRecognition pydub gTTS
```

Ayrıca, OCR için Tesseract'ın sistem üzerinde kurulu olması gerekir:

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-tur  # Türkçe dil paketi

# macOS
brew install tesseract
brew install tesseract-lang  # Tüm dil paketleri

# Windows
# https://github.com/UB-Mannheim/tesseract/wiki adresinden indirip kurabilirsiniz
```

### Diğer Servislerle Entegrasyon

Computer Vision ve Ses İşleme servisleri, AI Orchestrator'ın diğer bileşenleriyle aşağıdaki şekilde entegre edilebilir:

#### Model Orchestrator ile Entegrasyon

```python
from ai_orchestrator.src.services.model_orchestrator import ModelOrchestrator
from ai_orchestrator.src.services.computer_vision import ComputerVisionService
from ai_orchestrator.src.services.voice_processing import VoiceProcessingService

async def setup_services():
    # Servisleri başlat
    cv_service = ComputerVisionService()
    voice_service = VoiceProcessingService()
    model_orchestrator = ModelOrchestrator()
    
    await cv_service.initialize()
    await voice_service.initialize()
    await model_orchestrator.initialize()
    
    # Computer Vision ve Ses İşleme servislerini Model Orchestrator'a kaydet
    model_orchestrator.register_service("computer_vision", cv_service)
    model_orchestrator.register_service("voice_processing", voice_service)
    
    return model_orchestrator

# Örnek kullanım
async def process_multimodal_input(model_orchestrator, image_path, audio_path):
    # Görüntüden metin çıkar
    cv_service = model_orchestrator.get_service("computer_vision")
    ocr_result = await cv_service.perform_ocr(image_path)
    
    # Sesten metin çıkar
    voice_service = model_orchestrator.get_service("voice_processing")
    speech_result = await voice_service.recognize_speech(audio_path)
    
    # Her iki modaliteden gelen metinleri birleştir
    combined_text = f"Görüntüden: {ocr_result['text']}\nSesten: {speech_result['text']}"
    
    # Model Orchestrator ile işle
    result = await model_orchestrator.process_text(combined_text)
    
    return result
```

#### API Gateway ile Entegrasyon

Computer Vision ve Ses İşleme servisleri için API Gateway'de aşağıdaki endpoint'ler tanımlanabilir:

```python
from fastapi import FastAPI, UploadFile, File, Form
from ai_orchestrator.src.services.computer_vision import ComputerVisionService
from ai_orchestrator.src.services.voice_processing import VoiceProcessingService

app = FastAPI()
cv_service = ComputerVisionService()
voice_service = VoiceProcessingService()

@app.on_event("startup")
async def startup_event():
    await cv_service.initialize()
    await voice_service.initialize()

# Computer Vision API endpoints
@app.post("/api/v1/vision/ocr")
async def perform_ocr(file: UploadFile = File(...), lang: str = Form("eng")):
    content = await file.read()
    result = await cv_service.perform_ocr(content, parameters={"lang": lang})
    return result

@app.post("/api/v1/vision/detect-objects")
async def detect_objects(file: UploadFile = File(...), confidence: float = Form(0.5)):
    content = await file.read()
    result = await cv_service.detect_objects(content, parameters={"confidence_threshold": confidence})
    return result

# Voice Processing API endpoints
@app.post("/api/v1/voice/recognize")
async def recognize_speech(file: UploadFile = File(...), language: str = Form("en-US")):
    content = await file.read()
    result = await voice_service.recognize_speech(content, parameters={"language": language})
    return result

@app.post("/api/v1/voice/synthesize")
async def synthesize_speech(text: str = Form(...), language: str = Form("en")):
    result = await voice_service.synthesize_speech(text, parameters={"language": language})
    return result
```

## Performans ve Optimizasyon

### Önbellek Kullanımı

Her iki servis de, tekrarlanan işlemleri hızlandırmak için önbellek mekanizması kullanır. Önbellek, aynı giriş verileri ve parametrelerle yapılan işlemlerin sonuçlarını saklar ve tekrar istendiğinde hesaplama yapmadan doğrudan döndürür.

Önbellek boyutu ve davranışı, servis yapılandırmasında ayarlanabilir:

```python
config = {
    "ocr": {
        "cache_enabled": True,  # Önbelleği etkinleştir/devre dışı bırak
        "cache_size": 100       # Maksimum önbellek öğe sayısı
    }
}
```

Önbellek boyutu, kullanılabilir bellek miktarına göre ayarlanmalıdır. Büyük görüntüler veya ses dosyaları için önbellek boyutu düşürülmelidir.

### Kaynak Yönetimi

Computer Vision ve Ses İşleme servisleri, yoğun işlem gerektiren görevler gerçekleştirir ve önemli miktarda sistem kaynağı kullanabilir. Verimli kaynak kullanımı için aşağıdaki öneriler dikkate alınmalıdır:

1. **Görüntü Boyutu Optimizasyonu**: İşlenmeden önce büyük görüntüleri uygun boyuta getirin.
2. **Batch İşleme**: Mümkünse, birden çok görüntü veya ses dosyasını tek seferde işlemek yerine batch olarak işleyin.
3. **Asenkron İşleme**: Uzun süren işlemler için asenkron API'leri kullanın.
4. **Önbellek Stratejisi**: Sık kullanılan işlemler için önbelleği etkinleştirin, nadir kullanılanlar için devre dışı bırakın.

### Ölçeklendirme

Yüksek yük altında, servisleri aşağıdaki şekillerde ölçeklendirebilirsiniz:

1. **Yatay Ölçeklendirme**: Birden çok servis örneği oluşturun ve yükü aralarında dağıtın.
2. **Dikey Ölçeklendirme**: Daha güçlü donanım kullanın, özellikle GPU desteği ekleyin.
3. **İş Kuyruğu**: Uzun süren işlemler için bir iş kuyruğu sistemi kullanın.

## Hata Ayıklama ve Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

1. **OCR Doğruluğu Düşük**:
   - Görüntüyü ön işleme tabi tutun (gri tonlama, eşikleme, gürültü azaltma)
   - Daha yüksek çözünürlüklü görüntüler kullanın
   - Doğru dil paketlerinin yüklü olduğundan emin olun

2. **Nesne Tanıma Başarısız**:
   - Güven eşiğini düşürün
   - Daha iyi aydınlatılmış görüntüler kullanın
   - Model dosyalarının doğru konumda olduğunu kontrol edin

3. **Konuşma Tanıma Hataları**:
   - Daha iyi ses kalitesi sağlayın
   - Doğru dil kodunu kullandığınızdan emin olun
   - İnternet bağlantısını kontrol edin (Google Speech Recognition için)

4. **Bellek Hataları**:
   - Önbellek boyutunu azaltın
   - Daha küçük görüntü/ses dosyaları kullanın
   - Batch işleme boyutunu azaltın

### Loglama

Her iki servis de, sorun gidermeye yardımcı olmak için kapsamlı loglama sağlar. Log seviyesini ayarlayarak daha fazla veya daha az ayrıntı alabilirsiniz:

```python
import logging

# Detaylı loglama için
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("ai_orchestrator.services.computer_vision")
logger.setLevel(logging.DEBUG)

# Sadece hata logları için
logger.setLevel(logging.ERROR)
```

### Performans İzleme

Her iki servis de, `get_stats()` metodu aracılığıyla performans istatistiklerini sağlar:

```python
stats = cv_service.get_stats()
print(f"Toplam istek sayısı: {stats['total_requests']}")
print(f"Başarılı istek sayısı: {stats['successful_requests']}")
print(f"Başarısız istek sayısı: {stats['failed_requests']}")
print(f"Ortalama işlem süresi: {stats['average_processing_time']} saniye")
```

Bu istatistikler, performans darboğazlarını belirlemeye ve servis davranışını optimize etmeye yardımcı olabilir.
