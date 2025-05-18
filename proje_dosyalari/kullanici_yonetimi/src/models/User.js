// ALT_LAS Kullanıcı Modeli

/**
 * Kullanıcı veri modeli
 */
class User {
  /**
   * Kullanıcı nesnesini oluşturur
   * @param {Object} userData - Kullanıcı verileri
   */
  constructor(userData = {}) {
    this.id = userData.id || null;
    this.username = userData.username || '';
    this.email = userData.email || '';
    this.passwordHash = userData.passwordHash || '';
    this.firstName = userData.firstName || '';
    this.lastName = userData.lastName || '';
    this.roles = userData.roles || ['user'];
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
    this.lastLoginAt = userData.lastLoginAt || null;
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.isEmailVerified = userData.isEmailVerified || false;
    this.twoFactorEnabled = userData.twoFactorEnabled || false;
    this.twoFactorSecret = userData.twoFactorSecret || null;
    this.preferences = userData.preferences || {};
    this.metadata = userData.metadata || {};
  }
  
  /**
   * Kullanıcının tam adını döndürür
   * @returns {string} - Tam ad
   */
  getFullName() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    } else if (this.firstName) {
      return this.firstName;
    } else if (this.lastName) {
      return this.lastName;
    } else {
      return this.username;
    }
  }
  
  /**
   * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
   * @param {string} role - Kontrol edilecek rol
   * @returns {boolean} - Rol varsa true, yoksa false
   */
  hasRole(role) {
    return this.roles.includes(role);
  }
  
  /**
   * Kullanıcıya yeni bir rol ekler
   * @param {string} role - Eklenecek rol
   * @returns {boolean} - Ekleme başarılı ise true, rol zaten varsa false
   */
  addRole(role) {
    if (this.hasRole(role)) {
      return false;
    }
    
    this.roles.push(role);
    this.updatedAt = new Date();
    return true;
  }
  
  /**
   * Kullanıcıdan bir rolü kaldırır
   * @param {string} role - Kaldırılacak rol
   * @returns {boolean} - Kaldırma başarılı ise true, rol yoksa false
   */
  removeRole(role) {
    if (!this.hasRole(role)) {
      return false;
    }
    
    this.roles = this.roles.filter(r => r !== role);
    this.updatedAt = new Date();
    return true;
  }
  
  /**
   * Kullanıcı tercihini günceller
   * @param {string} key - Tercih anahtarı
   * @param {any} value - Tercih değeri
   */
  updatePreference(key, value) {
    this.preferences[key] = value;
    this.updatedAt = new Date();
  }
  
  /**
   * Kullanıcı tercihini döndürür
   * @param {string} key - Tercih anahtarı
   * @param {any} defaultValue - Varsayılan değer
   * @returns {any} - Tercih değeri
   */
  getPreference(key, defaultValue = null) {
    return key in this.preferences ? this.preferences[key] : defaultValue;
  }
  
  /**
   * Kullanıcı meta verisini günceller
   * @param {string} key - Meta veri anahtarı
   * @param {any} value - Meta veri değeri
   */
  updateMetadata(key, value) {
    this.metadata[key] = value;
    this.updatedAt = new Date();
  }
  
  /**
   * Kullanıcı meta verisini döndürür
   * @param {string} key - Meta veri anahtarı
   * @param {any} defaultValue - Varsayılan değer
   * @returns {any} - Meta veri değeri
   */
  getMetadata(key, defaultValue = null) {
    return key in this.metadata ? this.metadata[key] : defaultValue;
  }
  
  /**
   * Kullanıcı nesnesini JSON formatına dönüştürür
   * @param {boolean} includeSecrets - Gizli alanları dahil et
   * @returns {Object} - JSON formatında kullanıcı verisi
   */
  toJSON(includeSecrets = false) {
    const json = {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      roles: [...this.roles],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      twoFactorEnabled: this.twoFactorEnabled,
      preferences: { ...this.preferences }
    };
    
    // Gizli alanları dahil et
    if (includeSecrets) {
      json.passwordHash = this.passwordHash;
      json.twoFactorSecret = this.twoFactorSecret;
      json.metadata = { ...this.metadata };
    }
    
    return json;
  }
  
  /**
   * JSON verisinden kullanıcı nesnesi oluşturur
   * @param {Object} json - JSON formatında kullanıcı verisi
   * @returns {User} - Kullanıcı nesnesi
   */
  static fromJSON(json) {
    return new User(json);
  }
}

module.exports = User;
