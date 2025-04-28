# OS Integration Service - Yeni Özellikler Dokümantasyonu

Bu dokümantasyon, OS Integration Service'e eklenen yeni özellikleri ve platform entegrasyonlarını açıklamaktadır.

## 1. Dosya Sistemi İzleme (Filesystem Monitoring)

Dosya sistemi izleme özelliği, belirtilen bir dizindeki değişiklikleri gerçek zamanlı olarak takip etmenizi sağlar. Bu özellik, tüm büyük işletim sistemlerinde (Windows, macOS, Linux) desteklenmektedir.

### API Endpointleri

- `POST /api/monitor/start`: Bir dizini izlemeye başlar
  ```json
  {
    "path": "/path/to/directory"
  }
  ```
  Yanıt:
  ```json
  {
    "watcher_id": "unique-watcher-id"
  }
  ```

- `POST /api/monitor/stop`: Bir izleyiciyi durdurur
  ```json
  {
    "watcher_id": "unique-watcher-id"
  }
  ```

- `GET /api/monitor/events`: Kaydedilen değişiklik olaylarını alır

### Platform Uygulamaları

- **Windows**: ReadDirectoryChangesW API'si kullanılarak uygulanmıştır
- **Linux**: inotify API'si kullanılarak uygulanmıştır
- **macOS**: FSEvents API'si kullanılarak uygulanmıştır

### Olay Türleri

Dosya sistemi izleme, aşağıdaki olay türlerini raporlar:

- `Created`: Yeni bir dosya veya dizin oluşturulduğunda
- `Modified`: Bir dosya değiştirildiğinde
- `Deleted`: Bir dosya veya dizin silindiğinde
- `Renamed`: Bir dosya veya dizin yeniden adlandırıldığında (eski ve yeni yol bilgisi içerir)

## 2. Uygulama Kontrolü (Application Control)

Uygulama kontrolü özelliği, sistemdeki pencereleri listelemenizi, bulmanızı ve kontrol etmenizi sağlar. Bu özellik, işletim sistemine özgü API'ler kullanılarak uygulanmıştır.

### API Endpointleri

- `POST /api/app/find`: Başlığa göre pencere bulur
  ```json
  {
    "title": "Pencere Başlığı"
  }
  ```

- `POST /api/app/send_message`: Bir pencereye senkron mesaj gönderir (Windows'a özgü)
  ```json
  {
    "hwnd": 12345,
    "message": 274,
    "wparam": 0,
    "lparam": 0
  }
  ```

- `POST /api/app/post_message`: Bir pencereye asenkron mesaj gönderir (Windows'a özgü)
  ```json
  {
    "hwnd": 12345,
    "message": 274,
    "wparam": 0,
    "lparam": 0
  }
  ```

- `POST /api/app/close`: Bir pencereyi kapatır
  ```json
  {
    "hwnd": 12345
  }
  ```

- `GET /api/app/list`: Tüm görünür pencereleri listeler

### Platform Uygulamaları

- **Windows**: Win32 API'leri (FindWindow, SendMessage, PostMessage, EnumWindows) kullanılarak uygulanmıştır
- **macOS**: Cocoa ve CoreGraphics API'leri kullanılarak uygulanmıştır
- **Linux**: X11/Wayland için temel destek (wmctrl aracı kullanılarak) uygulanmıştır

## 3. Registry Erişimi (Windows'a Özgü)

Registry erişimi özelliği, Windows Registry'sine okuma ve yazma işlemleri yapmanızı sağlar. Bu özellik yalnızca Windows platformunda desteklenmektedir.

### API Endpointleri

- `POST /api/registry/read_string`: Registry'den string değer okur
  ```json
  {
    "root_key": "HKEY_CURRENT_USER",
    "sub_key": "Software\\Microsoft\\Windows\\CurrentVersion",
    "value_name": "ProgramFilesDir"
  }
  ```

- `POST /api/registry/read_dword`: Registry'den DWORD değer okur
  ```json
  {
    "root_key": "HKEY_CURRENT_USER",
    "sub_key": "Control Panel\\Desktop",
    "value_name": "MenuShowDelay"
  }
  ```

- `POST /api/registry/write_string`: Registry'ye string değer yazar
  ```json
  {
    "root_key": "HKEY_CURRENT_USER",
    "sub_key": "Software\\MyApp",
    "value_name": "ConfigPath",
    "data": "C:\\Config"
  }
  ```

- `POST /api/registry/write_dword`: Registry'ye DWORD değer yazar
  ```json
  {
    "root_key": "HKEY_CURRENT_USER",
    "sub_key": "Software\\MyApp",
    "value_name": "MaxConnections",
    "data": 10
  }
  ```

- `POST /api/registry/delete_value`: Registry'den değer siler
  ```json
  {
    "root_key": "HKEY_CURRENT_USER",
    "sub_key": "Software\\MyApp",
    "value_name": "OldSetting"
  }
  ```

### Platform Uygulaması

- **Windows**: Windows Registry API'leri (RegOpenKeyEx, RegQueryValueEx, RegSetValueEx, RegDeleteValue) kullanılarak uygulanmıştır
- **macOS/Linux**: Bu platformlarda desteklenmemektedir (API çağrıları uygun hata mesajlarıyla başarısız olur)

## 4. Kullanım Örnekleri

### Dosya Sistemi İzleme Örneği

```python
import requests
import time

# Bir dizini izlemeye başla
response = requests.post("http://localhost:8080/api/monitor/start", json={
    "path": "/path/to/watch"
})
watcher_id = response.json()["watcher_id"]

# Belirli aralıklarla olayları kontrol et
while True:
    events = requests.get("http://localhost:8080/api/monitor/events").json()
    for event in events:
        print(f"Event: {event}")
    time.sleep(1)

# İzlemeyi durdur
requests.post("http://localhost:8080/api/monitor/stop", json={
    "watcher_id": watcher_id
})
```

### Uygulama Kontrolü Örneği

```python
import requests

# Tüm pencereleri listele
windows = requests.get("http://localhost:8080/api/app/list").json()
for window in windows:
    print(f"Window: {window['title']} (ID: {window['id']}, PID: {window['process_id']})")

# Belirli bir pencereyi bul
response = requests.post("http://localhost:8080/api/app/find", json={
    "title": "Notepad"
})
hwnd = response.json()["hwnd"]

# Pencereyi kapat
requests.post("http://localhost:8080/api/app/close", json={
    "hwnd": hwnd
})
```

### Registry Erişimi Örneği (Windows)

```python
import requests

# Registry değeri oku
response = requests.post("http://localhost:8080/api/registry/read_string", json={
    "root_key": "HKEY_CURRENT_USER",
    "sub_key": "Software\\Microsoft\\Windows\\CurrentVersion\\Explorer",
    "value_name": "ShellState"
})
print(f"Value: {response.json()['value']}")

# Registry değeri yaz
requests.post("http://localhost:8080/api/registry/write_string", json={
    "root_key": "HKEY_CURRENT_USER",
    "sub_key": "Software\\MyApp",
    "value_name": "LastRun",
    "data": "2023-04-28"
})
```

## 5. Güvenlik Notları

- Dosya sistemi izleme, yüksek sayıda değişiklik olan dizinlerde yüksek CPU ve bellek kullanımına neden olabilir
- Uygulama kontrolü ve Registry erişimi, yalnızca servisin çalıştığı kullanıcının izinlerine sahip işlemleri gerçekleştirebilir
- Registry değişiklikleri sistem kararlılığını etkileyebilir, dikkatli kullanılmalıdır
- Tüm API'ler, uygun yetkilendirme ve doğrulama mekanizmalarıyla korunmalıdır

## 6. Sınırlamalar ve Bilinen Sorunlar

- Linux'ta uygulama kontrolü sınırlıdır ve X11/Wayland'a bağlıdır
- macOS'ta FSEvents API'si, inotify veya ReadDirectoryChangesW kadar ayrıntılı olay bilgisi sağlamayabilir
- Windows'ta ReadDirectoryChangesW, ağ sürücülerinde sınırlı çalışabilir
- Registry erişimi yalnızca Windows'ta desteklenmektedir

## 7. Gelecek Geliştirmeler

- Linux için daha kapsamlı pencere yönetimi (X11/Wayland doğrudan entegrasyonu)
- macOS için AppleScript entegrasyonu ile gelişmiş uygulama kontrolü
- WebSocket desteği ile gerçek zamanlı dosya sistemi olayları
- Daha ayrıntılı hata işleme ve raporlama
- Performans iyileştirmeleri ve bellek optimizasyonları
