describe('Advanced Chat Scenarios', () => {
  beforeEach(() => {
    // Ana sayfayı ziyaret et
    cy.visit('/');
    
    // Sayfanın yüklenmesini bekle
    cy.get('[data-testid="chat-container"]').should('be.visible');
  });

  it('should handle long conversations with pagination', () => {
    // Birden fazla mesaj gönder
    for (let i = 0; i < 10; i++) {
      cy.sendMessage(`Test mesajı ${i + 1}`);
      
      // AI yanıtının gelmesini bekle
      cy.get('[data-testid^="message-"]')
        .should('have.length.at.least', (i + 1) * 2);
    }
    
    // Sayfalama kontrollerinin görüntülendiğini kontrol et
    cy.get('[data-testid="pagination-controls"]').should('be.visible');
    
    // Önceki sayfa düğmesine tıkla
    cy.get('[data-testid="previous-page-button"]').click();
    
    // Önceki mesajların görüntülendiğini kontrol et
    cy.contains('Test mesajı 1').should('be.visible');
  });

  it('should handle network errors gracefully', () => {
    // Ağ hatası simülasyonu
    cy.intercept('POST', '**/api/chat', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('chatError');
    
    // Mesaj gönder
    cy.sendMessage('Bu mesaj bir hata alacak');
    
    // Hata mesajının görüntülendiğini kontrol et
    cy.contains('Bir hata oluştu').should('be.visible');
    
    // Yeniden gönder düğmesinin görüntülendiğini kontrol et
    cy.get('[data-testid="resend-button"]').should('be.visible');
    
    // Ağ bağlantısını düzelt
    cy.intercept('POST', '**/api/chat', {
      statusCode: 200,
      body: { text: 'Başarılı yanıt', model: 'gpt-4' }
    }).as('chatSuccess');
    
    // Yeniden gönder düğmesine tıkla
    cy.get('[data-testid="resend-button"]').click();
    
    // Başarılı yanıtın görüntülendiğini kontrol et
    cy.contains('Başarılı yanıt').should('be.visible');
  });

  it('should handle different file types', () => {
    // Görsel dosyası yükle
    cy.uploadFile('test-image.jpg', 'image/jpeg', 'test-image-content');
    
    // Görsel önizlemesinin görüntülendiğini kontrol et
    cy.get('[data-testid="image-preview"]').should('be.visible');
    
    // Mesaj gönder
    cy.get('[data-testid="send-button"]').click();
    
    // Görsel mesajının görüntülendiğini kontrol et
    cy.get('[data-testid^="message-"]')
      .last()
      .find('[data-testid="image-attachment"]')
      .should('be.visible');
    
    // PDF dosyası yükle
    cy.uploadFile('test-document.pdf', 'application/pdf', 'test-pdf-content');
    
    // PDF önizlemesinin görüntülendiğini kontrol et
    cy.get('[data-testid="pdf-preview"]').should('be.visible');
    
    // Mesaj gönder
    cy.get('[data-testid="send-button"]').click();
    
    // PDF mesajının görüntülendiğini kontrol et
    cy.get('[data-testid^="message-"]')
      .last()
      .find('[data-testid="pdf-attachment"]')
      .should('be.visible');
  });

  it('should handle markdown content correctly', () => {
    // Markdown içerikli mesaj gönder
    cy.sendMessage('# Başlık\n\n**Kalın metin** ve *italik metin*\n\n```javascript\nconsole.log("Merhaba Dünya!");\n```');
    
    // AI yanıtının gelmesini bekle
    cy.get('[data-testid^="message-"]')
      .should('have.length.at.least', 2);
    
    // Markdown içeriğinin doğru şekilde işlendiğini kontrol et
    cy.get('[data-testid^="message-"]')
      .last()
      .within(() => {
        cy.get('h1').should('contain', 'Başlık');
        cy.get('strong').should('contain', 'Kalın metin');
        cy.get('em').should('contain', 'italik metin');
        cy.get('code').should('contain', 'console.log');
      });
  });

  it('should persist chat history across page reloads', () => {
    // Mesaj gönder
    cy.sendMessage('Bu mesaj sayfa yenilendikten sonra da görünmeli');
    
    // AI yanıtının gelmesini bekle
    cy.get('[data-testid^="message-"]')
      .should('have.length.at.least', 2);
    
    // Sayfayı yenile
    cy.reload();
    
    // Sayfanın yüklenmesini bekle
    cy.get('[data-testid="chat-container"]').should('be.visible');
    
    // Önceki mesajların görüntülendiğini kontrol et
    cy.contains('Bu mesaj sayfa yenilendikten sonra da görünmeli').should('be.visible');
  });

  it('should handle multiple AI models', () => {
    // Model seçicisini aç
    cy.get('[data-testid="model-selector"]').click();
    
    // GPT-3.5 modelini seç
    cy.contains('GPT-3.5').click();
    
    // Mesaj gönder
    cy.sendMessage('Bu mesaj GPT-3.5 modeline gönderilecek');
    
    // AI yanıtının gelmesini bekle
    cy.get('[data-testid^="message-"]')
      .should('have.length.at.least', 2);
    
    // Yanıtın GPT-3.5 modelinden geldiğini kontrol et
    cy.get('[data-testid^="message-"]')
      .last()
      .find('[data-testid="message-model-badge"]')
      .should('contain', 'GPT-3.5');
    
    // Model seçicisini aç
    cy.get('[data-testid="model-selector"]').click();
    
    // GPT-4 modelini seç
    cy.contains('GPT-4').click();
    
    // Mesaj gönder
    cy.sendMessage('Bu mesaj GPT-4 modeline gönderilecek');
    
    // AI yanıtının gelmesini bekle
    cy.get('[data-testid^="message-"]')
      .should('have.length.at.least', 4);
    
    // Yanıtın GPT-4 modelinden geldiğini kontrol et
    cy.get('[data-testid^="message-"]')
      .last()
      .find('[data-testid="message-model-badge"]')
      .should('contain', 'GPT-4');
  });

  it('should handle API key management', () => {
    // Ayarlar düğmesine tıkla
    cy.get('[data-testid="settings-button"]').click();
    
    // API anahtarları sekmesine tıkla
    cy.contains('API Anahtarları').click();
    
    // OpenAI API anahtarını gir
    cy.get('[data-testid="openai-api-key-input"]')
      .clear()
      .type('test-openai-api-key');
    
    // Kaydet düğmesine tıkla
    cy.get('[data-testid="save-api-keys-button"]').click();
    
    // Başarı mesajının görüntülendiğini kontrol et
    cy.contains('API anahtarları başarıyla kaydedildi').should('be.visible');
    
    // Ayarları kapat
    cy.get('[data-testid="close-settings-button"]').click();
    
    // Mesaj gönder
    cy.sendMessage('Bu mesaj yeni API anahtarı ile gönderilecek');
    
    // AI yanıtının gelmesini bekle
    cy.get('[data-testid^="message-"]')
      .should('have.length.at.least', 2);
  });

  it('should handle user profile management', () => {
    // Profil düğmesine tıkla
    cy.get('[data-testid="user-profile-button"]').click();
    
    // Kullanıcı adını değiştir
    cy.get('[data-testid="user-name-input"]')
      .clear()
      .type('Test Kullanıcısı');
    
    // Profil resmini değiştir
    cy.get('[data-testid="user-avatar-upload"]').attachFile('test-avatar.jpg');
    
    // Kaydet düğmesine tıkla
    cy.get('[data-testid="save-profile-button"]').click();
    
    // Başarı mesajının görüntülendiğini kontrol et
    cy.contains('Profil başarıyla güncellendi').should('be.visible');
    
    // Profili kapat
    cy.get('[data-testid="close-profile-button"]').click();
    
    // Mesaj gönder
    cy.sendMessage('Bu mesaj yeni profil ile gönderilecek');
    
    // Kullanıcı mesajının yeni profil bilgileriyle görüntülendiğini kontrol et
    cy.get('[data-testid^="message-"]')
      .first()
      .find('[data-testid="message-sender-name"]')
      .should('contain', 'Test Kullanıcısı');
  });
});
