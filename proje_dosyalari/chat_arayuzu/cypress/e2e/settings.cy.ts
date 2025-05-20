describe('Settings Interface', () => {
  beforeEach(() => {
    // Uygulamayı ziyaret et
    cy.visit('/');
    
    // Yükleme tamamlanana kadar bekle
    cy.get('[data-testid="loading-indicator"]', { timeout: 10000 }).should('not.exist');
    
    // Ayarlar düğmesine tıkla
    cy.get('[data-testid="settings-button"]').click();
    
    // Ayarlar çekmecesinin açıldığını kontrol et
    cy.contains('Ayarlar').should('be.visible');
  });
  
  it('displays all settings sections', () => {
    // Görünüm bölümünün görüntülendiğini kontrol et
    cy.contains('Görünüm').should('be.visible');
    
    // AI Modeli bölümünün görüntülendiğini kontrol et
    cy.contains('AI Modeli').should('be.visible');
    
    // Bildirimler ve Davranış bölümünün görüntülendiğini kontrol et
    cy.contains('Bildirimler ve Davranış').should('be.visible');
  });
  
  it('allows changing theme', () => {
    // Tema değiştirme düğmesini bul
    cy.get('#theme-toggle').should('be.visible');
    
    // Tema değiştir
    cy.get('#theme-toggle').click();
    
    // Ayarlar çekmecesini kapat
    cy.contains('Kapat').click();
    
    // Temanın değiştiğini kontrol et
    cy.get('body').should('have.class', 'chakra-ui-dark');
  });
  
  it('allows changing font size', () => {
    // Yazı boyutu kaydırıcısını bul
    cy.get('#font-size').should('be.visible');
    
    // Yazı boyutunu değiştir (kaydırıcıyı sağa kaydır)
    cy.get('#font-size').parent().find('[role="slider"]')
      .type('{rightarrow}{rightarrow}{rightarrow}');
    
    // Ayarları kaydet
    cy.contains('Kaydet').click();
    
    // Ayarlar çekmecesini kapat
    cy.contains('Kapat').click();
  });
  
  it('allows changing AI model', () => {
    // AI modeli seçicisini bul
    cy.get('#ai-model').should('be.visible');
    
    // Modeli değiştir
    cy.get('#ai-model').select('openai-gpt35');
    
    // Ayarları kaydet
    cy.contains('Kaydet').click();
    
    // Ayarlar çekmecesini kapat
    cy.contains('Kapat').click();
    
    // Mesaj gönder
    cy.sendMessage('Merhaba, sen kimsin?');
    
    // AI yanıtının görüntülendiğini kontrol et
    cy.get('[data-testid="ai-message"]', { timeout: 10000 }).should('be.visible');
  });
  
  it('allows toggling notifications', () => {
    // Bildirimler düğmesini bul
    cy.get('#notifications').should('be.visible');
    
    // Bildirimleri kapat
    cy.get('#notifications').click();
    
    // Ayarları kaydet
    cy.contains('Kaydet').click();
    
    // Ayarlar çekmecesini kapat
    cy.contains('Kapat').click();
  });
  
  it('allows toggling auto-scroll', () => {
    // Otomatik kaydırma düğmesini bul
    cy.get('#auto-scroll').should('be.visible');
    
    // Otomatik kaydırmayı kapat
    cy.get('#auto-scroll').click();
    
    // Ayarları kaydet
    cy.contains('Kaydet').click();
    
    // Ayarlar çekmecesini kapat
    cy.contains('Kapat').click();
  });
  
  it('allows toggling markdown support', () => {
    // Markdown desteği düğmesini bul
    cy.get('#markdown').should('be.visible');
    
    // Markdown desteğini kapat
    cy.get('#markdown').click();
    
    // Ayarları kaydet
    cy.contains('Kaydet').click();
    
    // Ayarlar çekmecesini kapat
    cy.contains('Kapat').click();
  });
});
