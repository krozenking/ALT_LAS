// ALT_LAS Rol Repository

const Repository = require('./Repository');
const Role = require('../models/Role');
const { v4: uuidv4 } = require('uuid');

/**
 * Rol repository sınıfı
 * @extends Repository<Role>
 */
class RoleRepository extends Repository {
  /**
   * Rol repository'sini başlatır
   * @param {Object} options - Repository seçenekleri
   */
  constructor(options = {}) {
    super(options);
    
    // Veritabanı bağlantısı (gerçek uygulamada DB bağlantısı olacak)
    this.db = options.db || null;
    
    // In-memory storage (geçici, geliştirme amaçlı)
    this.roles = new Map();
    
    // Örnek roller ekle (geliştirme amaçlı)
    if (options.addSampleData) {
      this._addSampleRoles();
    }
  }
  
  /**
   * ID'ye göre rol bulur
   * @param {string} id - Rol ID
   * @returns {Promise<Role|null>} - Bulunan rol veya null
   */
  async findById(id) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const roleData = await this.db.roles.findOne({ id });
        return roleData ? new Role(roleData) : null;
      } catch (error) {
        console.error('Rol bulunurken hata oluştu:', error);
        return null;
      }
    }
    
    // In-memory storage kullan
    return this.roles.has(id) ? new Role(this.roles.get(id)) : null;
  }
  
  /**
   * Rol adına göre rol bulur
   * @param {string} name - Rol adı
   * @returns {Promise<Role|null>} - Bulunan rol veya null
   */
  async findByName(name) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const roleData = await this.db.roles.findOne({ name });
        return roleData ? new Role(roleData) : null;
      } catch (error) {
        console.error('Rol bulunurken hata oluştu:', error);
        return null;
      }
    }
    
    // In-memory storage kullan
    for (const roleData of this.roles.values()) {
      if (roleData.name === name) {
        return new Role(roleData);
      }
    }
    
    return null;
  }
  
  /**
   * Tüm rolleri bulur
   * @param {Object} filter - Filtreleme kriterleri
   * @param {Object} options - Sorgu seçenekleri (sıralama, sayfalama vb.)
   * @returns {Promise<Array<Role>>} - Rol listesi
   */
  async findAll(filter = {}, options = {}) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const query = this.db.roles.find(filter);
        
        // Sıralama
        if (options.sort) {
          query.sort(options.sort);
        }
        
        // Sayfalama
        if (options.skip) {
          query.skip(options.skip);
        }
        
        if (options.limit) {
          query.limit(options.limit);
        }
        
        const rolesData = await query.toArray();
        return rolesData.map(roleData => new Role(roleData));
      } catch (error) {
        console.error('Roller bulunurken hata oluştu:', error);
        return [];
      }
    }
    
    // In-memory storage kullan
    let roles = Array.from(this.roles.values());
    
    // Filtreleme
    if (filter) {
      roles = roles.filter(role => {
        for (const [key, value] of Object.entries(filter)) {
          if (role[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Sıralama
    if (options.sort) {
      const [field, order] = Object.entries(options.sort)[0];
      roles.sort((a, b) => {
        if (a[field] < b[field]) return order === 1 ? -1 : 1;
        if (a[field] > b[field]) return order === 1 ? 1 : -1;
        return 0;
      });
    }
    
    // Sayfalama
    if (options.skip) {
      roles = roles.slice(options.skip);
    }
    
    if (options.limit) {
      roles = roles.slice(0, options.limit);
    }
    
    return roles.map(roleData => new Role(roleData));
  }
  
  /**
   * Rolü kaydeder (oluşturur veya günceller)
   * @param {Role} role - Kaydedilecek rol
   * @returns {Promise<Role>} - Kaydedilen rol
   */
  async save(role) {
    // ID yoksa yeni rol oluştur
    if (!role.id) {
      role.id = uuidv4();
      role.createdAt = new Date();
    }
    
    // Güncelleme zamanını ayarla
    role.updatedAt = new Date();
    
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const roleData = role.toJSON();
        
        await this.db.roles.updateOne(
          { id: role.id },
          { $set: roleData },
          { upsert: true }
        );
        
        return role;
      } catch (error) {
        console.error('Rol kaydedilirken hata oluştu:', error);
        throw error;
      }
    }
    
    // In-memory storage kullan
    this.roles.set(role.id, role.toJSON());
    
    return role;
  }
  
  /**
   * Rolü siler
   * @param {string} id - Silinecek rol ID
   * @returns {Promise<boolean>} - Silme başarılı ise true, değilse false
   */
  async delete(id) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const result = await this.db.roles.deleteOne({ id });
        return result.deletedCount > 0;
      } catch (error) {
        console.error('Rol silinirken hata oluştu:', error);
        return false;
      }
    }
    
    // In-memory storage kullan
    return this.roles.delete(id);
  }
  
  /**
   * Belirli bir koşula göre rol sayısını döndürür
   * @param {Object} filter - Filtreleme kriterleri
   * @returns {Promise<number>} - Rol sayısı
   */
  async count(filter = {}) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        return await this.db.roles.countDocuments(filter);
      } catch (error) {
        console.error('Rol sayısı hesaplanırken hata oluştu:', error);
        return 0;
      }
    }
    
    // In-memory storage kullan
    if (Object.keys(filter).length === 0) {
      return this.roles.size;
    }
    
    let count = 0;
    
    for (const roleData of this.roles.values()) {
      let match = true;
      
      for (const [key, value] of Object.entries(filter)) {
        if (roleData[key] !== value) {
          match = false;
          break;
        }
      }
      
      if (match) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Belirli bir koşula göre rolün varlığını kontrol eder
   * @param {Object} filter - Filtreleme kriterleri
   * @returns {Promise<boolean>} - Rol varsa true, yoksa false
   */
  async exists(filter = {}) {
    return (await this.count(filter)) > 0;
  }
  
  /**
   * Örnek roller ekler (geliştirme amaçlı)
   * @private
   */
  _addSampleRoles() {
    const adminRole = new Role({
      id: 'admin-role',
      name: 'admin',
      description: 'Sistem yöneticisi',
      permissions: [
        'user:create', 'user:read', 'user:update', 'user:delete',
        'role:create', 'role:read', 'role:update', 'role:delete',
        'system:manage'
      ],
      isSystem: true
    });
    
    const userRole = new Role({
      id: 'user-role',
      name: 'user',
      description: 'Standart kullanıcı',
      permissions: [
        'profile:read', 'profile:update',
        'message:create', 'message:read'
      ],
      isSystem: true
    });
    
    const moderatorRole = new Role({
      id: 'moderator-role',
      name: 'moderator',
      description: 'İçerik moderatörü',
      permissions: [
        'profile:read',
        'message:create', 'message:read', 'message:update', 'message:delete',
        'content:moderate'
      ],
      isSystem: true
    });
    
    this.roles.set(adminRole.id, adminRole.toJSON());
    this.roles.set(userRole.id, userRole.toJSON());
    this.roles.set(moderatorRole.id, moderatorRole.toJSON());
  }
}

module.exports = RoleRepository;
