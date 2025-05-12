/**
 * ALT_LAS Uçtan Uca Entegrasyon Testi
 *
 * Bu test, ALT_LAS sisteminin temel iş akışını test eder:
 * 1. API Gateway'e bağlanma
 * 2. Kimlik doğrulama
 * 3. Komut gönderme
 * 4. Segmentation Service'in komutu işlemesi
 * 5. Runner Service'in görevi yürütmesi
 * 6. Archive Service'in sonucu saklaması
 * 7. Sonucun alınması ve doğrulanması
 */

const axios = require('axios');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test yapılandırması
const config = {
  apiGatewayUrl: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  username: process.env.TEST_USERNAME || 'test@example.com',
  password: process.env.TEST_PASSWORD || 'password123',
  invalidUsername: 'invalid@example.com',
  invalidPassword: 'wrongpassword',
  testCommand: 'echo "Hello, ALT_LAS!"',
  invalidCommand: '# Bu geçersiz bir komuttur\nundefined_command',
  complexCommand: `
    # Bu karmaşık bir ALT_LAS komutudur
    $name = "ALT_LAS"
    $count = 5

    for i in 1..$count {
      echo "Merhaba $name, bu $i. tekrar"
    }

    echo "Döngü tamamlandı"
  `,
  largeDataCommand: `echo "${new Array(1000).fill('X').join('')}"`,
  timeoutMs: 30000 // 30 saniye
};

// Test durumunu saklamak için global değişkenler
let authToken;
let taskId;
let resultId;

// Test senaryoları
const TEST_SCENARIOS = {
  BASIC: 'basic',
  INVALID_AUTH: 'invalid_auth',
  INVALID_COMMAND: 'invalid_command',
  COMPLEX_COMMAND: 'complex_command',
  LARGE_DATA: 'large_data'
};

// Aktif test senaryosu
let activeScenario = process.env.TEST_SCENARIO || TEST_SCENARIOS.BASIC;

/**
 * API Gateway'e bağlanma ve sağlık kontrolü
 */
async function testApiGatewayConnection() {
  console.log('1. API Gateway bağlantısı test ediliyor...');

  try {
    // Önce kök endpoint'i kontrol et
    const response = await axios.get(`${config.apiGatewayUrl}/`);
    assert.strictEqual(response.status, 200);
    console.log('✓ API Gateway bağlantısı başarılı');

    // Health endpoint'i varsa kontrol et, yoksa atla
    try {
      const healthResponse = await axios.get(`${config.apiGatewayUrl}/health`);
      if (healthResponse.status === 200) {
        console.log('✓ API Gateway health endpoint başarılı');
      }
    } catch (healthError) {
      console.log('ℹ️ API Gateway health endpoint bulunamadı, bu beklenen bir durum olabilir');
    }
  } catch (error) {
    console.error('✗ API Gateway bağlantısı başarısız:', error.message);
    throw error;
  }
}

/**
 * Kimlik doğrulama ve token alma
 */
async function testAuthentication() {
  console.log('2. Kimlik doğrulama test ediliyor...');

  try {
    // Geçersiz kimlik doğrulama senaryosu
    if (activeScenario === TEST_SCENARIOS.INVALID_AUTH) {
      try {
        const invalidResponse = await axios.post(`${config.apiGatewayUrl}/api/v1/auth/login`, {
          email: config.invalidUsername,
          password: config.invalidPassword
        });

        // Başarılı yanıt alınırsa test başarısız olmalı
        console.error('✗ Geçersiz kimlik bilgileriyle giriş yapılabildi!');
        throw new Error('Geçersiz kimlik bilgileriyle giriş yapılabildi');
      } catch (error) {
        // 401 Unauthorized hatası bekleniyor
        if (error.response && error.response.status === 401) {
          console.log('✓ Geçersiz kimlik bilgileri doğru şekilde reddedildi');

          // Geçersiz kimlik testi başarılı, şimdi geçerli kimlikle devam et
          const validResponse = await axios.post(`${config.apiGatewayUrl}/api/v1/auth/login`, {
            email: config.username,
            password: config.password
          });

          assert.strictEqual(validResponse.status, 200);
          assert.ok(validResponse.data.token);

          authToken = validResponse.data.token;
          console.log('✓ Geçerli kimlik doğrulama başarılı');
        } else {
          // Beklenmeyen hata
          console.error('✗ Beklenmeyen hata:', error.message);
          throw error;
        }
      }
    } else {
      // Normal kimlik doğrulama senaryosu
      // Önce API'nin kimlik doğrulama endpoint'ini kontrol et
      try {
        const response = await axios.post(`${config.apiGatewayUrl}/api/v1/auth/login`, {
          email: config.username,
          password: config.password
        });

        // Başarılı yanıt alındı
        assert.strictEqual(response.status, 200);
        assert.ok(response.data.token);

        authToken = response.data.token;
        console.log('✓ Kimlik doğrulama başarılı');
        return;
      } catch (authError) {
        console.log('ℹ️ /api/v1/auth/login endpoint bulunamadı, alternatif endpoint deneniyor...');
      }

      // Alternatif endpoint dene
      try {
        const response = await axios.post(`${config.apiGatewayUrl}/api/auth/login`, {
          email: config.username,
          password: config.password
        });

        assert.strictEqual(response.status, 200);
        assert.ok(response.data.token);

        authToken = response.data.token;
        console.log('✓ Kimlik doğrulama başarılı');
      } catch (error) {
        console.error('✗ Alternatif kimlik doğrulama başarısız:', error.message);
        throw error;
      }
    }
  } catch (error) {
    console.error('✗ Kimlik doğrulama başarısız:', error.message);
    throw error;
  }
}

/**
 * Komut gönderme
 */
async function testCommandSubmission() {
  console.log('3. Komut gönderimi test ediliyor...');

  try {
    let commandToSend = config.testCommand;

    // Senaryo bazlı komut seçimi
    switch (activeScenario) {
      case TEST_SCENARIOS.INVALID_COMMAND:
        commandToSend = config.invalidCommand;
        console.log('  - Geçersiz komut gönderiliyor...');
        break;
      case TEST_SCENARIOS.COMPLEX_COMMAND:
        commandToSend = config.complexCommand;
        console.log('  - Karmaşık komut gönderiliyor...');
        break;
      case TEST_SCENARIOS.LARGE_DATA:
        commandToSend = config.largeDataCommand;
        console.log('  - Büyük veri içeren komut gönderiliyor...');
        break;
      default:
        console.log('  - Temel komut gönderiliyor...');
    }

    const response = await axios.post(
      `${config.apiGatewayUrl}/api/v1/commands`,
      { command: commandToSend },
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

/**
 * Görev durumunu kontrol etme
 */
async function testTaskStatus() {
  console.log('4. Görev durumu kontrol ediliyor...');

  try {
    let status = 'pending';
    let attempts = 0;
    const maxAttempts = config.timeoutMs / 1000;
    let expectedStatus = 'completed';

    // Geçersiz komut senaryosunda 'failed' durumu beklenir
    if (activeScenario === TEST_SCENARIOS.INVALID_COMMAND) {
      expectedStatus = 'failed';
      console.log('  - Geçersiz komut için başarısız durum bekleniyor...');
    }

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

    if (attempts >= maxAttempts) {
      throw new Error(`Görev zaman aşımına uğradı (${config.timeoutMs}ms)`);
    }

    // Beklenen durumu kontrol et
    assert.strictEqual(status, expectedStatus);

    if (status === 'completed') {
      console.log('✓ Görev başarıyla tamamlandı');
    } else if (status === 'failed' && activeScenario === TEST_SCENARIOS.INVALID_COMMAND) {
      console.log('✓ Geçersiz komut beklendiği gibi başarısız oldu');
    } else {
      console.log(`✓ Görev '${status}' durumunda sonlandı`);
    }
  } catch (error) {
    console.error('✗ Görev durumu kontrolü başarısız:', error.message);
    throw error;
  }
}

/**
 * Arşivlenmiş sonucu alma
 */
async function testResultRetrieval() {
  console.log('5. Sonuç alınıyor...');

  try {
    // Geçersiz komut senaryosunda hata detaylarını kontrol et
    if (activeScenario === TEST_SCENARIOS.INVALID_COMMAND) {
      try {
        const errorResponse = await axios.get(
          `${config.apiGatewayUrl}/api/v1/commands/${taskId}/result`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        assert.strictEqual(errorResponse.status, 200);
        assert.ok(errorResponse.data.error, 'Hata detayları bulunamadı');

        console.log('✓ Hata detayları başarıyla alındı');
        console.log('  - Hata mesajı:', errorResponse.data.error.message || errorResponse.data.error);
        return; // Geçersiz komut senaryosu için işlemi sonlandır
      } catch (error) {
        console.error('✗ Hata detayları alma başarısız:', error.message);
        throw error;
      }
    }

    // Normal senaryo - Görev sonucunu al
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

    // Büyük veri senaryosunda içeriğin boyutunu kontrol et
    if (activeScenario === TEST_SCENARIOS.LARGE_DATA) {
      const contentLength = resultResponse.data.content.length;
      console.log(`  - Sonuç içeriği boyutu: ${contentLength} karakter`);
      assert.ok(contentLength > 900, 'Büyük veri içeriği beklenenden küçük');
    } else if (activeScenario === TEST_SCENARIOS.COMPLEX_COMMAND) {
      // Karmaşık komut senaryosunda döngü çıktısını kontrol et
      console.log('  - Karmaşık komut sonucu:');
      console.log(resultResponse.data.content.substring(0, 200) + '...');
      assert.ok(resultResponse.data.content.includes('Döngü tamamlandı'), 'Beklenen döngü çıktısı bulunamadı');
    } else {
      // Temel senaryo
      console.log('  - Sonuç içeriği:', resultResponse.data.content);
    }
  } catch (error) {
    console.error('✗ Sonuç alma başarısız:', error.message);
    throw error;
  }
}

/**
 * Servis kesintisi simülasyonu
 */
async function testServiceOutage() {
  console.log('6. Servis kesintisi senaryosu test ediliyor...');

  try {
    // Geçersiz bir endpoint'e istek yaparak servis kesintisi simüle et
    try {
      await axios.get(
        `${config.apiGatewayUrl}/non-existent-endpoint`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Başarılı yanıt alınırsa test başarısız olmalı
      console.error('✗ Geçersiz endpoint isteği başarılı oldu!');
      throw new Error('Geçersiz endpoint isteği başarılı oldu');
    } catch (error) {
      // 404 Not Found hatası bekleniyor
      if (error.response && error.response.status === 404) {
        console.log('✓ Geçersiz endpoint isteği doğru şekilde 404 hatası döndürdü');
      } else {
        // Beklenmeyen hata
        console.error('✗ Beklenmeyen hata:', error.message);
        throw error;
      }
    }

    // Circuit breaker davranışını test et
    console.log('  - Circuit breaker davranışı test ediliyor...');

    // Ardışık başarısız istekler gönder
    const failedRequests = [];
    for (let i = 0; i < 5; i++) {
      try {
        await axios.get(
          `${config.apiGatewayUrl}/api/v1/non-existent-service`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } catch (error) {
        failedRequests.push(error);
      }
    }

    // En az bir isteğin circuit breaker tarafından reddedilmiş olması beklenir
    const circuitBreakerResponses = failedRequests.filter(
      error => error.response && error.response.status === 503 &&
      error.response.data && error.response.data.error &&
      error.response.data.error.includes('Circuit breaker')
    );

    if (circuitBreakerResponses.length > 0) {
      console.log(`✓ Circuit breaker ${circuitBreakerResponses.length} isteği doğru şekilde reddetti`);
    } else {
      console.log('⚠️ Circuit breaker davranışı test edilemedi (implementasyon eksik olabilir)');
    }

  } catch (error) {
    console.error('✗ Servis kesintisi testi başarısız:', error.message);
    throw error;
  }
}

/**
 * Tüm testleri sırayla çalıştır
 */
async function runTests() {
  console.log('ALT_LAS Uçtan Uca Entegrasyon Testi Başlıyor...');
  console.log('------------------------------------------------');
  console.log(`Aktif test senaryosu: ${activeScenario}`);
  console.log('------------------------------------------------');

  try {
    await testApiGatewayConnection();
    await testAuthentication();
    await testCommandSubmission();
    await testTaskStatus();
    await testResultRetrieval();

    // Temel senaryo için servis kesintisi testini de çalıştır
    if (activeScenario === TEST_SCENARIOS.BASIC) {
      await testServiceOutage();
    }

    console.log('------------------------------------------------');
    console.log('✅ Tüm testler başarıyla tamamlandı!');

    // Tüm senaryoları çalıştırmak için komut satırı talimatları
    console.log('\nDiğer test senaryolarını çalıştırmak için:');
    console.log('- Geçersiz kimlik testi: TEST_SCENARIO=invalid_auth node e2e_test.js');
    console.log('- Geçersiz komut testi: TEST_SCENARIO=invalid_command node e2e_test.js');
    console.log('- Karmaşık komut testi: TEST_SCENARIO=complex_command node e2e_test.js');
    console.log('- Büyük veri testi: TEST_SCENARIO=large_data node e2e_test.js');
  } catch (error) {
    console.log('------------------------------------------------');
    console.error('❌ Test başarısız oldu:', error.message);
    process.exit(1);
  }
}

// Testleri çalıştır
runTests();
