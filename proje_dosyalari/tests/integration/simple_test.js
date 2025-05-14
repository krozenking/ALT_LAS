/**
 * ALT_LAS Basit Test
 * 
 * Bu test, ALT_LAS sisteminin temel işlevselliğini test eder:
 * 1. API Gateway'e bağlanma
 */

const axios = require('axios');

// Test yapılandırması
const config = {
  apiGatewayUrl: process.env.API_GATEWAY_URL || 'http://localhost:3000'
};

/**
 * API Gateway'e bağlanma ve sağlık kontrolü
 */
async function testApiGatewayConnection() {
  console.log('API Gateway bağlantısı test ediliyor...');

  try {
    const response = await axios.get(`${config.apiGatewayUrl}/`);
    console.log('✓ API Gateway bağlantısı başarılı');
    console.log('Yanıt:', response.data);
    return true;
  } catch (error) {
    console.error('✗ API Gateway bağlantısı başarısız:', error.message);
    return false;
  }
}

/**
 * Ana test fonksiyonu
 */
async function runTests() {
  console.log('ALT_LAS Basit Test Başlıyor...');
  console.log('------------------------------');

  try {
    const success = await testApiGatewayConnection();
    
    if (success) {
      console.log('------------------------------');
      console.log('✅ Test başarıyla tamamlandı!');
      process.exit(0);
    } else {
      console.log('------------------------------');
      console.error('❌ Test başarısız oldu!');
      process.exit(1);
    }
  } catch (error) {
    console.log('------------------------------');
    console.error('❌ Test başarısız oldu:', error.message);
    process.exit(1);
  }
}

// Testleri çalıştır
runTests();
