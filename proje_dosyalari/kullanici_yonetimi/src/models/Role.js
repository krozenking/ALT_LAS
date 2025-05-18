// ALT_LAS Rol Modeli

/**
 * Rol veri modeli
 */
class Role {
  /**
   * Rol nesnesini oluşturur
   * @param {Object} roleData - Rol verileri
   */
  constructor(roleData = {}) {
    this.id = roleData.id || null;
    this.name = roleData.name || '';
    this.description = roleData.description || '';
    this.permissions = roleData.permissions || [];
    this.createdAt = roleData.createdAt || new Date();
    this.updatedAt = roleData.updatedAt || new Date();
    this.isSystem = roleData.isSystem || false;
  }
  
  /**
   * Rolün belirli bir izne sahip olup olmadığını kontrol eder
   * @param {string} permission - Kontrol edilecek izin
   * @returns {boolean} - İzin varsa true, yoksa false
   */
  hasPermission(permission) {
    return this.permissions.includes(permission);
  }
  
  /**
   * Role yeni bir izin ekler
   * @param {string} permission - Eklenecek izin
   * @returns {boolean} - Ekleme başarılı ise true, izin zaten varsa false
   */
  addPermission(permission) {
    if (this.hasPermission(permission)) {
      return false;
    }
    
    this.permissions.push(permission);
    this.updatedAt = new Date();
    return true;
  }
  
  /**
   * Rolden bir izni kaldırır
   * @param {string} permission - Kaldırılacak izin
   * @returns {boolean} - Kaldırma başarılı ise true, izin yoksa false
   */
  removePermission(permission) {
    if (!this.hasPermission(permission)) {
      return false;
    }
    
    this.permissions = this.permissions.filter(p => p !== permission);
    this.updatedAt = new Date();
    return true;
  }
  
  /**
   * Rol nesnesini JSON formatına dönüştürür
   * @returns {Object} - JSON formatında rol verisi
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      permissions: [...this.permissions],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isSystem: this.isSystem
    };
  }
  
  /**
   * JSON verisinden rol nesnesi oluşturur
   * @param {Object} json - JSON formatında rol verisi
   * @returns {Role} - Rol nesnesi
   */
  static fromJSON(json) {
    return new Role(json);
  }
}

module.exports = Role;
