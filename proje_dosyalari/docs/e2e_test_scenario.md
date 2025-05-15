# ALT_LAS Uçtan Uca Test Senaryosu

**Tarih:** 09 Mayıs 2025
**Hazırlayan:** Yönetici

## Genel Bakış

Bu belge, ALT_LAS sisteminin uçtan uca test senaryosunu detaylandırmaktadır. Bu senaryo, sistemin tüm bileşenlerinin entegre bir şekilde çalıştığını doğrulamak için kullanılır.

## Test Ortamı

- **Docker Compose**: Tüm servisleri içeren docker-compose.yml dosyası
- **Test Kullanıcısı**: test@example.com / password123
- **Test Komutları**: Basit ve karmaşık test komutları
- **Test Araçları**: Node.js, Axios, Jest

## Test Senaryosu 1: Temel Komut İşleme

### Adım 1: API Gateway Bağlantısı

```javascript
// API Gateway'e bağlanma ve sağlık kontrolü
async function testApiGatewayConnection() {
  console.log('1. API Gateway bağlantısı test ediliyor...');
  
  try {
    const response = await axios.get(`${config.apiGatewayUrl}/health`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.status, 'ok');
    console.log('✓ API Gateway bağlantısı başarılı');
  } catch (error) {
    console.error('✗ API Gateway bağlantısı başarısız:', error.message);
    throw error;
  }
}
```

### Adım 2: Kimlik Doğrulama

```javascript
// Kimlik doğrulama ve token alma
async function testAuthentication() {
  console.log('2. Kimlik doğrulama test ediliyor...');
  
  try {
    const response = await axios.post(`${config.apiGatewayUrl}/api/v1/auth/login`, {
      email: config.username,
      password: config.password
    });
    
    assert.strictEqual(response.status, 200);
    assert.ok(response.data.token);
    
    authToken = response.data.token;
    console.log('✓ Kimlik doğrulama başarılı');
  } catch (error) {
    console.error('✗ Kimlik doğrulama başarısız:', error.message);
    throw error;
  }
}
```

### Adım 3: Komut Gönderme

```javascript
// Komut gönderme
async function testCommandSubmission() {
  console.log('3. Komut gönderimi test ediliyor...');
  
  try {
    const response = await axios.post(
      `${config.apiGatewayUrl}/api/v1/commands`,
      { command: config.testCommand },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    assert.strictEqual(response.status, 201);
    assert.ok(response.data.taskId);
    
    taskId = response.data.taskId;
    console.log(`✓ Komut gönderimi başarılı (Task ID: ${taskId})`);
  } catch (error) {
    console.error('✗ Komut gönderimi başarısız:', error.message);
    throw error;
  }
}
```

### Adım 4: Görev Durumu Kontrolü

```javascript
// Görev durumunu kontrol etme
async function testTaskStatus() {
  console.log('4. Görev durumu kontrol ediliyor...');
  
  try {
    let status = 'pending';
    let attempts = 0;
    const maxAttempts = config.timeoutMs / 1000;
    
    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      const response = await axios.get(
        `${config.apiGatewayUrl}/api/v1/commands/${taskId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      status = response.data.status;
      console.log(`  - Görev durumu: ${status}`);
      
      if (status === 'completed' || status === 'failed') {
        break;
      }
      
      // 1 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    assert.strictEqual(status, 'completed');
    console.log('✓ Görev başarıyla tamamlandı');
  } catch (error) {
    console.error('✗ Görev durumu kontrolü başarısız:', error.message);
    throw error;
  }
}
```

### Adım 5: Sonuç Alma

```javascript
// Arşivlenmiş sonucu alma
async function testResultRetrieval() {
  console.log('5. Sonuç alınıyor...');
  
  try {
    // Görev sonucunu al
    const taskResponse = await axios.get(
      `${config.apiGatewayUrl}/api/v1/commands/${taskId}/result`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    assert.strictEqual(taskResponse.status, 200);
    assert.ok(taskResponse.data.resultId);
    
    resultId = taskResponse.data.resultId;
    
    // Arşivden sonucu al
    const resultResponse = await axios.get(
      `${config.apiGatewayUrl}/api/v1/archive/results/${resultId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    assert.strictEqual(resultResponse.status, 200);
    assert.ok(resultResponse.data.content);
    
    console.log('✓ Sonuç başarıyla alındı');
    console.log('  - Sonuç içeriği:', resultResponse.data.content);
  } catch (error) {
    console.error('✗ Sonuç alma başarısız:', error.message);
    throw error;
  }
}
```

## Test Senaryosu 2: Karmaşık Komut İşleme

### Adım 1-2: API Gateway Bağlantısı ve Kimlik Doğrulama

Senaryo 1 ile aynı adımlar.

### Adım 3: Karmaşık Komut Gönderme

```javascript
// Karmaşık komut gönderme
async function testComplexCommandSubmission() {
  console.log('3. Karmaşık komut gönderimi test ediliyor...');
  
  try {
    const complexCommand = `
      # Bu bir karmaşık ALT_LAS komutudur
      
      # Değişken tanımlama
      $name = "ALT_LAS"
      $count = 5
      
      # Döngü
      for i in 1..$count {
        echo "Merhaba $name, bu $i. tekrar"
        
        # Koşul
        if $i % 2 == 0 {
          echo "Çift sayı: $i"
        } else {
          echo "Tek sayı: $i"
        }
      }
      
      # Sonuç
      echo "Döngü tamamlandı"
    `;
    
    const response = await axios.post(
      `${config.apiGatewayUrl}/api/v1/commands`,
      { command: complexCommand },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    assert.strictEqual(response.status, 201);
    assert.ok(response.data.taskId);
    
    taskId = response.data.taskId;
    console.log(`✓ Karmaşık komut gönderimi başarılı (Task ID: ${taskId})`);
  } catch (error) {
    console.error('✗ Karmaşık komut gönderimi başarısız:', error.message);
    throw error;
  }
}
```

### Adım 4-5: Görev Durumu Kontrolü ve Sonuç Alma

Senaryo 1 ile aynı adımlar.

## Test Senaryosu 3: Hata Durumu İşleme

### Adım 1-2: API Gateway Bağlantısı ve Kimlik Doğrulama

Senaryo 1 ile aynı adımlar.

### Adım 3: Hatalı Komut Gönderme

```javascript
// Hatalı komut gönderme
async function testInvalidCommandSubmission() {
  console.log('3. Hatalı komut gönderimi test ediliyor...');
  
  try {
    const invalidCommand = `
      # Bu bir hatalı ALT_LAS komutudur
      
      # Tanımlanmamış değişken kullanımı
      echo $undefinedVariable
      
      # Sözdizimi hatası
      for i in 1..5 {
        echo "Bu bir hata içeren döngü"
      } else {
        echo "Bu bir sözdizimi hatası"
      }
    `;
    
    const response = await axios.post(
      `${config.apiGatewayUrl}/api/v1/commands`,
      { command: invalidCommand },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    assert.strictEqual(response.status, 201);
    assert.ok(response.data.taskId);
    
    taskId = response.data.taskId;
    console.log(`✓ Hatalı komut gönderimi başarılı (Task ID: ${taskId})`);
  } catch (error) {
    console.error('✗ Hatalı komut gönderimi başarısız:', error.message);
    throw error;
  }
}
```

### Adım 4: Hata Durumu Kontrolü

```javascript
// Hata durumunu kontrol etme
async function testErrorStatus() {
  console.log('4. Hata durumu kontrol ediliyor...');
  
  try {
    let status = 'pending';
    let attempts = 0;
    const maxAttempts = config.timeoutMs / 1000;
    
    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      const response = await axios.get(
        `${config.apiGatewayUrl}/api/v1/commands/${taskId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      status = response.data.status;
      console.log(`  - Görev durumu: ${status}`);
      
      if (status === 'completed' || status === 'failed') {
        break;
      }
      
      // 1 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    // Hatalı komut için "failed" durumu beklenir
    assert.strictEqual(status, 'failed');
    console.log('✓ Hata durumu başarıyla tespit edildi');
  } catch (error) {
    console.error('✗ Hata durumu kontrolü başarısız:', error.message);
    throw error;
  }
}
```

### Adım 5: Hata Detaylarını Alma

```javascript
// Hata detaylarını alma
async function testErrorRetrieval() {
  console.log('5. Hata detayları alınıyor...');
  
  try {
    // Görev sonucunu al
    const taskResponse = await axios.get(
      `${config.apiGatewayUrl}/api/v1/commands/${taskId}/result`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    assert.strictEqual(taskResponse.status, 200);
    assert.ok(taskResponse.data.error);
    
    console.log('✓ Hata detayları başarıyla alındı');
    console.log('  - Hata mesajı:', taskResponse.data.error.message);
  } catch (error) {
    console.error('✗ Hata detayları alma başarısız:', error.message);
    throw error;
  }
}
```

## Test Çalıştırma Talimatları

1. Tüm servisleri Docker Compose ile başlatın:
   ```bash
   docker-compose up -d
   ```

2. Test scriptini çalıştırın:
   ```bash
   cd tests/integration
   npm install
   npm run test:e2e
   ```

3. Test sonuçlarını kontrol edin:
   ```
   ALT_LAS Uçtan Uca Entegrasyon Testi Başlıyor...
   ------------------------------------------------
   1. API Gateway bağlantısı test ediliyor...
   ✓ API Gateway bağlantısı başarılı
   2. Kimlik doğrulama test ediliyor...
   ✓ Kimlik doğrulama başarılı
   3. Komut gönderimi test ediliyor...
   ✓ Komut gönderimi başarılı (Task ID: 1234-5678-90ab-cdef)
   4. Görev durumu kontrol ediliyor...
     - Görev durumu: pending
     - Görev durumu: processing
     - Görev durumu: completed
   ✓ Görev başarıyla tamamlandı
   5. Sonuç alınıyor...
   ✓ Sonuç başarıyla alındı
     - Sonuç içeriği: Hello, ALT_LAS!
   ------------------------------------------------
   ✅ Tüm testler başarıyla tamamlandı!
   ```

## Beklenen Sonuçlar

1. **Temel Komut İşleme**: Basit komutun başarıyla işlenmesi ve sonucun alınması.
2. **Karmaşık Komut İşleme**: Karmaşık komutun başarıyla işlenmesi ve sonucun alınması.
3. **Hata Durumu İşleme**: Hatalı komutun tespit edilmesi ve uygun hata mesajının döndürülmesi.

## Sorun Giderme

- **API Gateway Bağlantı Hatası**: Docker Compose'un çalıştığından ve API Gateway servisinin ayakta olduğundan emin olun.
- **Kimlik Doğrulama Hatası**: Test kullanıcısının sistemde tanımlı olduğundan emin olun.
- **Zaman Aşımı Hatası**: `timeoutMs` değerini artırarak daha uzun bekleme süresi tanımlayın.
- **Servis Hatası**: Docker loglarını kontrol ederek servis hatalarını tespit edin.
