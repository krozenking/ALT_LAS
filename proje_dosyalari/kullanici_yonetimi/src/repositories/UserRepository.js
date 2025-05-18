// ALT_LAS Kullanıcı Repository

const Repository = require('./Repository');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

/**
 * Kullanıcı repository sınıfı
 * @extends Repository<User>
 */
class UserRepository extends Repository {
  /**
   * Kullanıcı repository'sini başlatır
   * @param {Object} options - Repository seçenekleri
   */
  constructor(options = {}) {
    super(options);
    
    // Veritabanı bağlantısı (gerçek uygulamada DB bağlantısı olacak)
    this.db = options.db || null;
    
    // In-memory storage (geçici, geliştirme amaçlı)
    this.users = new Map();
    
    // Örnek kullanıcılar ekle (geliştirme amaçlı)
    if (options.addSampleData) {
      this._addSampleUsers();
    }
  }
  
  /**
   * ID'ye göre kullanıcı bulur
   * @param {string} id - Kullanıcı ID
   * @returns {Promise<User|null>} - Bulunan kullanıcı veya null
   */
  async findById(id) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const userData = await this.db.users.findOne({ id });
        return userData ? new User(userData) : null;
      } catch (error) {
        console.error('Kullanıcı bulunurken hata oluştu:', error);
        return null;
      }
    }
    
    // In-memory storage kullan
    return this.users.has(id) ? new User(this.users.get(id)) : null;
  }
  
  /**
   * Kullanıcı adı veya e-posta ile kullanıcı bulur
   * @param {string} username - Kullanıcı adı
   * @param {string} email - E-posta
   * @returns {Promise<User|null>} - Bulunan kullanıcı veya null
   */
  async findByUsernameOrEmail(username, email) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const userData = await this.db.users.findOne({
          $or: [{ username }, { email }]
        });
        return userData ? new User(userData) : null;
      } catch (error) {
        console.error('Kullanıcı bulunurken hata oluştu:', error);
        return null;
      }
    }
    
    // In-memory storage kullan
    for (const userData of this.users.values()) {
      if (userData.username === username || userData.email === email) {
        return new User(userData);
      }
    }
    
    return null;
  }
  
  /**
   * E-posta ile kullanıcı bulur
   * @param {string} email - E-posta
   * @returns {Promise<User|null>} - Bulunan kullanıcı veya null
   */
  async findByEmail(email) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const userData = await this.db.users.findOne({ email });
        return userData ? new User(userData) : null;
      } catch (error) {
        console.error('Kullanıcı bulunurken hata oluştu:', error);
        return null;
      }
    }
    
    // In-memory storage kullan
    for (const userData of this.users.values()) {
      if (userData.email === email) {
        return new User(userData);
      }
    }
    
    return null;
  }
  
  /**
   * Kullanıcı adı ile kullanıcı bulur
   * @param {string} username - Kullanıcı adı
   * @returns {Promise<User|null>} - Bulunan kullanıcı veya null
   */
  async findByUsername(username) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const userData = await this.db.users.findOne({ username });
        return userData ? new User(userData) : null;
      } catch (error) {
        console.error('Kullanıcı bulunurken hata oluştu:', error);
        return null;
      }
    }
    
    // In-memory storage kullan
    for (const userData of this.users.values()) {
      if (userData.username === username) {
        return new User(userData);
      }
    }
    
    return null;
  }
  
  /**
   * Tüm kullanıcıları bulur
   * @param {Object} filter - Filtreleme kriterleri
   * @param {Object} options - Sorgu seçenekleri (sıralama, sayfalama vb.)
   * @returns {Promise<Array<User>>} - Kullanıcı listesi
   */
  async findAll(filter = {}, options = {}) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const query = this.db.users.find(filter);
        
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
        
        const usersData = await query.toArray();
        return usersData.map(userData => new User(userData));
      } catch (error) {
        console.error('Kullanıcılar bulunurken hata oluştu:', error);
        return [];
      }
    }
    
    // In-memory storage kullan
    let users = Array.from(this.users.values());
    
    // Filtreleme
    if (filter) {
      users = users.filter(user => {
        for (const [key, value] of Object.entries(filter)) {
          if (user[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Sıralama
    if (options.sort) {
      const [field, order] = Object.entries(options.sort)[0];
      users.sort((a, b) => {
        if (a[field] < b[field]) return order === 1 ? -1 : 1;
        if (a[field] > b[field]) return order === 1 ? 1 : -1;
        return 0;
      });
    }
    
    // Sayfalama
    if (options.skip) {
      users = users.slice(options.skip);
    }
    
    if (options.limit) {
      users = users.slice(0, options.limit);
    }
    
    return users.map(userData => new User(userData));
  }
  
  /**
   * Kullanıcıyı kaydeder (oluşturur veya günceller)
   * @param {User} user - Kaydedilecek kullanıcı
   * @returns {Promise<User>} - Kaydedilen kullanıcı
   */
  async save(user) {
    // ID yoksa yeni kullanıcı oluştur
    if (!user.id) {
      user.id = uuidv4();
      user.createdAt = new Date();
    }
    
    // Güncelleme zamanını ayarla
    user.updatedAt = new Date();
    
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const userData = user.toJSON(true);
        
        await this.db.users.updateOne(
          { id: user.id },
          { $set: userData },
          { upsert: true }
        );
        
        return user;
      } catch (error) {
        console.error('Kullanıcı kaydedilirken hata oluştu:', error);
        throw error;
      }
    }
    
    // In-memory storage kullan
    this.users.set(user.id, user.toJSON(true));
    
    return user;
  }
  
  /**
   * Kullanıcıyı siler
   * @param {string} id - Silinecek kullanıcı ID
   * @returns {Promise<boolean>} - Silme başarılı ise true, değilse false
   */
  async delete(id) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        const result = await this.db.users.deleteOne({ id });
        return result.deletedCount > 0;
      } catch (error) {
        console.error('Kullanıcı silinirken hata oluştu:', error);
        return false;
      }
    }
    
    // In-memory storage kullan
    return this.users.delete(id);
  }
  
  /**
   * Belirli bir role sahip kullanıcı sayısını döndürür
   * @param {string} role - Rol adı
   * @returns {Promise<number>} - Kullanıcı sayısı
   */
  async countByRole(role) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        return await this.db.users.countDocuments({
          roles: role
        });
      } catch (error) {
        console.error('Kullanıcı sayısı hesaplanırken hata oluştu:', error);
        return 0;
      }
    }
    
    // In-memory storage kullan
    let count = 0;
    
    for (const userData of this.users.values()) {
      if (userData.roles && userData.roles.includes(role)) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Belirli bir koşula göre kullanıcı sayısını döndürür
   * @param {Object} filter - Filtreleme kriterleri
   * @returns {Promise<number>} - Kullanıcı sayısı
   */
  async count(filter = {}) {
    // Veritabanı bağlantısı varsa kullan
    if (this.db) {
      try {
        return await this.db.users.countDocuments(filter);
      } catch (error) {
        console.error('Kullanıcı sayısı hesaplanırken hata oluştu:', error);
        return 0;
      }
    }
    
    // In-memory storage kullan
    if (Object.keys(filter).length === 0) {
      return this.users.size;
    }
    
    let count = 0;
    
    for (const userData of this.users.values()) {
      let match = true;
      
      for (const [key, value] of Object.entries(filter)) {
        if (userData[key] !== value) {
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
   * Belirli bir koşula göre kullanıcının varlığını kontrol eder
   * @param {Object} filter - Filtreleme kriterleri
   * @returns {Promise<boolean>} - Kullanıcı varsa true, yoksa false
   */
  async exists(filter = {}) {
    return (await this.count(filter)) > 0;
  }
  
  /**
   * Örnek kullanıcılar ekler (geliştirme amaçlı)
   * @private
   */
  _addSampleUsers() {
    const adminUser = new User({
      id: 'admin-1',
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: 'hashed_password', // Gerçek uygulamada güvenli bir şekilde hashlenmiş olmalı
      firstName: 'Admin',
      lastName: 'User',
      roles: ['admin', 'user'],
      isActive: true,
      isEmailVerified: true
    });
    
    const regularUser = new User({
      id: 'user-1',
      username: 'user',
      email: 'user@example.com',
      passwordHash: 'hashed_password', // Gerçek uygulamada güvenli bir şekilde hashlenmiş olmalı
      firstName: 'Regular',
      lastName: 'User',
      roles: ['user'],
      isActive: true,
      isEmailVerified: true
    });
    
    this.users.set(adminUser.id, adminUser.toJSON(true));
    this.users.set(regularUser.id, regularUser.toJSON(true));
  }
}

module.exports = UserRepository;
