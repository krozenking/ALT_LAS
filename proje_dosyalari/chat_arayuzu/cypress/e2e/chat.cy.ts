describe('Chat Functionality', () => {
  beforeEach(() => {
    // Ana sayfayı ziyaret et
    cy.visit('/');
    
    // Sayfanın yüklenmesini bekle
    cy.get('[data-testid="chat-container"]').should('be.visible');
  });

  it('should send and receive messages', () => {
    // Mesaj gönder
    cy.sendMessage('Merhaba, dünya!');
    
    // Kullanıcı mesajının görüntülendiğini kontrol et
    cy.contains('Merhaba, dünya!').should('be.visible');
    
    // AI yanıtının görüntülendiğini kontrol et
    cy.get('[data-testid^="message-"]')
      .should('have.length.at.least', 2);
  });

  it('should upload a file', () => {
    // Dosya yükle
    cy.uploadFile('test.txt', 'text/plain', 'Bu bir test dosyasıdır.');
    
    // Dosyanın görüntülendiğini kontrol et
    cy.contains('test.txt').should('be.visible');
  });

  it('should change language', () => {
    // Dili İngilizce'ye değiştir
    cy.changeLanguage('en');
    
    // Arayüz dilinin değiştiğini kontrol et
    cy.contains('Type your message...').should('be.visible');
    
    // Dili Türkçe'ye değiştir
    cy.changeLanguage('tr');
    
    // Arayüz dilinin değiştiğini kontrol et
    cy.contains('Mesajınızı yazın...').should('be.visible');
  });

  it('should change theme', () => {
    // Temayı karanlık moda değiştir
    cy.changeTheme('dark');
    
    // Temanın değiştiğini kontrol et
    cy.get('body').should('have.class', 'chakra-ui-dark');
    
    // Temayı aydınlık moda değiştir
    cy.changeTheme('light');
    
    // Temanın değiştiğini kontrol et
    cy.get('body').should('have.class', 'chakra-ui-light');
  });

  it('should change accessibility settings', () => {
    // Erişilebilirlik ayarlarını değiştir
    cy.changeAccessibility({
      fontSize: 'lg',
      highContrast: true,
      reduceMotion: true
    });
    
    // Ayarların değiştiğini kontrol et
    cy.get('html').should('have.attr', 'data-font-size', 'lg');
    cy.get('html').should('have.attr', 'data-high-contrast', 'true');
    cy.get('html').should('have.attr', 'data-reduce-motion', 'true');
  });

  it('should save and load conversations', () => {
    // Mesaj gönder
    cy.sendMessage('Bu bir test konuşmasıdır.');
    
    // Konuşmayı kaydet
    cy.get('[data-testid="save-conversation-button"]').click();
    cy.get('[data-testid="conversation-title-input"]').type('Test Konuşması');
    cy.get('[data-testid="save-button"]').click();
    
    // Yeni konuşma başlat
    cy.get('[data-testid="new-conversation-button"]').click();
    
    // Konuşmanın temizlendiğini kontrol et
    cy.get('[data-testid^="message-"]').should('have.length', 0);
    
    // Kaydedilmiş konuşmayı yükle
    cy.get('[data-testid="load-conversation-button"]').click();
    cy.contains('Test Konuşması').click();
    
    // Konuşmanın yüklendiğini kontrol et
    cy.contains('Bu bir test konuşmasıdır.').should('be.visible');
  });

  it('should handle voice recording', () => {
    // Ses kayıt düğmesine tıkla
    cy.get('[data-testid="voice-record-button"]').click();
    
    // Kayıt arayüzünün görüntülendiğini kontrol et
    cy.get('[data-testid="recording-interface"]').should('be.visible');
    
    // Kaydı durdur
    cy.get('[data-testid="stop-recording-button"]').click();
    
    // Kaydın tamamlandığını kontrol et
    cy.get('[data-testid="message-input"]').should('not.be.empty');
  });

  it('should show notifications', () => {
    // Bildirim düğmesine tıkla
    cy.get('[data-testid="notification-button"]').click();
    
    // Bildirim listesinin görüntülendiğini kontrol et
    cy.get('[data-testid="notification-list"]').should('be.visible');
    
    // Bildirimleri temizle
    cy.contains('Tümünü Temizle').click();
    
    // Bildirimlerin temizlendiğini kontrol et
    cy.contains('Bildirim bulunmuyor').should('be.visible');
  });

  it('should open help center', () => {
    // Yardım düğmesine tıkla
    cy.get('[data-testid="help-button"]').click();
    
    // Yardım merkezinin görüntülendiğini kontrol et
    cy.get('[data-testid="help-center"]').should('be.visible');
    
    // SSS sekmesine tıkla
    cy.contains('SSS').click();
    
    // SSS içeriğinin görüntülendiğini kontrol et
    cy.contains('Sık Sorulan Sorular').should('be.visible');
  });

  it('should manage keyboard shortcuts', () => {
    // Klavye kısayolları düğmesine tıkla
    cy.get('[data-testid="keyboard-shortcuts-button"]').click();
    
    // Klavye kısayolları yöneticisinin görüntülendiğini kontrol et
    cy.get('[data-testid="keyboard-shortcuts-manager"]').should('be.visible');
    
    // Kısayol ekle
    cy.get('[data-testid="add-shortcut-button"]').click();
    cy.get('[data-testid="shortcut-key-input"]').click();
    cy.get('body').type('{ctrl}b');
    cy.get('[data-testid="shortcut-description-input"]').type('Kalın yazı');
    cy.get('[data-testid="add-button"]').click();
    
    // Kısayolun eklendiğini kontrol et
    cy.contains('Kalın yazı').should('be.visible');
  });
});
