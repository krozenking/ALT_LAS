// ALT_LAS Kullanıcı Servisi API

const UserRepository = require('../repositories/UserRepository');
const RoleRepository = require('../repositories/RoleRepository');
const DatabaseManager = require('../db/DatabaseManager');
const { hashPassword, verifyPassword } = require('../utils/PasswordUtils');
const { generateToken, verifyToken } = require('../auth/TokenService');
const { v4: uuidv4 } = require('uuid');

/**
 * Kullanıcı servisi
 * Bu servis, kullanıcı yönetimi için API sağlar.
 */
class UserService {
  /**
   * Kullanıcı servisini başlatır
   * @param {Object} options - Servis seçenekleri
   */
  constructor(options = {}) {
    // Veritabanı yöneticisi
    this.dbManager = options.dbManager || new DatabaseManager(options.dbConfig);
    
    // Repository'ler
    this.userRepository = null;
    this.roleRepository = null;
    
    // Servis durumu
    this.isInitialized = false;
  }
  
  /**
   * Servisi başlatır
   * @returns {Promise<boolean>} - Başlatma başarılı ise true, değilse false
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Veritabanına bağlan
      const connected = await this.dbManager.connect();
      
      if (!connected) {
        throw new Error('Veritabanına bağlanılamadı');
      }
      
      // Repository'leri oluştur
      this.userRepository = new UserRepository({
        db: this.dbManager.getRepositoryConnection('users'),
        addSampleData: true
      });
      
      this.roleRepository = new RoleRepository({
        db: this.dbManager.getRepositoryConnection('roles'),
        addSampleData: true
      });
      
      this.isInitialized = true;
      console.log('Kullanıcı servisi başlatıldı');
      return true;
    } catch (error) {
      console.error('Kullanıcı servisi başlatılırken hata oluştu:', error);
      return false;
    }
  }
  
  /**
   * Servisi durdurur
   * @returns {Promise<boolean>} - Durdurma başarılı ise true, değilse false
   */
  async shutdown() {
    if (!this.isInitialized) {
      return true;
    }
    
    try {
      // Veritabanı bağlantısını kapat
      await this.dbManager.disconnect();
      
      this.userRepository = null;
      this.roleRepository = null;
      this.isInitialized = false;
      
      console.log('Kullanıcı servisi durduruldu');
      return true;
    } catch (error) {
      console.error('Kullanıcı servisi durdurulurken hata oluştu:', error);
      return false;
    }
  }
  
  /**
   * Kullanıcı kaydı yapar
   * @param {Object} userData - Kullanıcı verileri
   * @returns {Promise<Object>} - Kayıt sonucu
   */
  async register(userData) {
    this._checkInitialized();
    
    try {
      // Kullanıcı adı veya e-posta zaten kullanılıyor mu?
      const existingUser = await this.userRepository.findByUsernameOrEmail(
        userData.username,
        userData.email
      );
      
      if (existingUser) {
        return {
          success: false,
          error: 'Kullanıcı adı veya e-posta zaten kullanılıyor'
        };
      }
      
      // Şifreyi hashle
      const passwordHash = await hashPassword(userData.password);
      
      // Kullanıcı nesnesini oluştur
      const user = {
        id: uuidv4(),
        username: userData.username,
        email: userData.email,
        passwordHash,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        roles: ['user'], // Varsayılan rol
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isEmailVerified: false
      };
      
      // Kullanıcıyı kaydet
      const savedUser = await this.userRepository.save(user);
      
      // Hassas bilgileri çıkar
      const { passwordHash: _, ...userWithoutPassword } = savedUser.toJSON();
      
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Kullanıcı kaydı sırasında hata oluştu:', error);
      return {
        success: false,
        error: 'Kullanıcı kaydı sırasında bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcı girişi yapar
   * @param {string} usernameOrEmail - Kullanıcı adı veya e-posta
   * @param {string} password - Şifre
   * @returns {Promise<Object>} - Giriş sonucu
   */
  async login(usernameOrEmail, password) {
    this._checkInitialized();
    
    try {
      // Kullanıcıyı bul
      const user = await this.userRepository.findByUsernameOrEmail(
        usernameOrEmail,
        usernameOrEmail
      );
      
      if (!user) {
        return {
          success: false,
          error: 'Kullanıcı adı veya şifre hatalı'
        };
      }
      
      // Kullanıcı aktif mi?
      if (!user.isActive) {
        return {
          success: false,
          error: 'Hesap devre dışı bırakılmış'
        };
      }
      
      // Şifreyi doğrula
      const isPasswordValid = await verifyPassword(password, user.passwordHash);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Kullanıcı adı veya şifre hatalı'
        };
      }
      
      // Son giriş zamanını güncelle
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
      
      // Token oluştur
      const token = generateToken({
        id: user.id,
        username: user.username,
        roles: user.roles
      });
      
      // Hassas bilgileri çıkar
      const { passwordHash: _, ...userWithoutPassword } = user.toJSON();
      
      return {
        success: true,
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Kullanıcı girişi sırasında hata oluştu:', error);
      return {
        success: false,
        error: 'Kullanıcı girişi sırasında bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcı bilgilerini getirir
   * @param {string} userId - Kullanıcı ID
   * @returns {Promise<Object>} - Kullanıcı bilgileri
   */
  async getUserInfo(userId) {
    this._checkInitialized();
    
    try {
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'Kullanıcı bulunamadı'
        };
      }
      
      // Hassas bilgileri çıkar
      const { passwordHash: _, ...userWithoutPassword } = user.toJSON();
      
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata oluştu:', error);
      return {
        success: false,
        error: 'Kullanıcı bilgileri alınırken bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcı bilgilerini günceller
   * @param {string} userId - Kullanıcı ID
   * @param {Object} userData - Güncellenecek kullanıcı verileri
   * @returns {Promise<Object>} - Güncelleme sonucu
   */
  async updateUserInfo(userId, userData) {
    this._checkInitialized();
    
    try {
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'Kullanıcı bulunamadı'
        };
      }
      
      // Güncellenebilir alanlar
      const updatableFields = [
        'firstName',
        'lastName',
        'email',
        'preferences'
      ];
      
      // Alanları güncelle
      let isUpdated = false;
      
      for (const field of updatableFields) {
        if (field in userData && userData[field] !== undefined) {
          // E-posta güncellenmesi durumunda benzersizlik kontrolü
          if (field === 'email' && userData.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            
            if (existingUser) {
              return {
                success: false,
                error: 'Bu e-posta adresi zaten kullanılıyor'
              };
            }
            
            user.isEmailVerified = false;
          }
          
          // Alanı güncelle
          user[field] = userData[field];
          isUpdated = true;
        }
      }
      
      if (!isUpdated) {
        return {
          success: false,
          error: 'Güncellenecek alan bulunamadı'
        };
      }
      
      // Güncelleme zamanını ayarla
      user.updatedAt = new Date();
      
      // Kullanıcıyı kaydet
      const updatedUser = await this.userRepository.save(user);
      
      // Hassas bilgileri çıkar
      const { passwordHash: _, ...userWithoutPassword } = updatedUser.toJSON();
      
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Kullanıcı bilgileri güncellenirken hata oluştu:', error);
      return {
        success: false,
        error: 'Kullanıcı bilgileri güncellenirken bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcı şifresini değiştirir
   * @param {string} userId - Kullanıcı ID
   * @param {string} currentPassword - Mevcut şifre
   * @param {string} newPassword - Yeni şifre
   * @returns {Promise<Object>} - Şifre değiştirme sonucu
   */
  async changePassword(userId, currentPassword, newPassword) {
    this._checkInitialized();
    
    try {
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'Kullanıcı bulunamadı'
        };
      }
      
      // Mevcut şifreyi doğrula
      const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Mevcut şifre hatalı'
        };
      }
      
      // Yeni şifreyi hashle
      const passwordHash = await hashPassword(newPassword);
      
      // Şifreyi güncelle
      user.passwordHash = passwordHash;
      user.updatedAt = new Date();
      
      // Kullanıcıyı kaydet
      await this.userRepository.save(user);
      
      return {
        success: true,
        message: 'Şifre başarıyla değiştirildi'
      };
    } catch (error) {
      console.error('Şifre değiştirilirken hata oluştu:', error);
      return {
        success: false,
        error: 'Şifre değiştirilirken bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcıya rol ekler
   * @param {string} userId - Kullanıcı ID
   * @param {string} roleName - Rol adı
   * @returns {Promise<Object>} - Rol ekleme sonucu
   */
  async addRoleToUser(userId, roleName) {
    this._checkInitialized();
    
    try {
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'Kullanıcı bulunamadı'
        };
      }
      
      // Rolü bul
      const role = await this.roleRepository.findByName(roleName);
      
      if (!role) {
        return {
          success: false,
          error: 'Rol bulunamadı'
        };
      }
      
      // Kullanıcı zaten bu role sahip mi?
      if (user.hasRole(roleName)) {
        return {
          success: false,
          error: 'Kullanıcı zaten bu role sahip'
        };
      }
      
      // Rolü ekle
      user.addRole(roleName);
      
      // Kullanıcıyı kaydet
      await this.userRepository.save(user);
      
      return {
        success: true,
        message: 'Rol başarıyla eklendi'
      };
    } catch (error) {
      console.error('Rol eklenirken hata oluştu:', error);
      return {
        success: false,
        error: 'Rol eklenirken bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcıdan rol kaldırır
   * @param {string} userId - Kullanıcı ID
   * @param {string} roleName - Rol adı
   * @returns {Promise<Object>} - Rol kaldırma sonucu
   */
  async removeRoleFromUser(userId, roleName) {
    this._checkInitialized();
    
    try {
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'Kullanıcı bulunamadı'
        };
      }
      
      // Kullanıcı bu role sahip mi?
      if (!user.hasRole(roleName)) {
        return {
          success: false,
          error: 'Kullanıcı bu role sahip değil'
        };
      }
      
      // Rolü kaldır
      user.removeRole(roleName);
      
      // Kullanıcıyı kaydet
      await this.userRepository.save(user);
      
      return {
        success: true,
        message: 'Rol başarıyla kaldırıldı'
      };
    } catch (error) {
      console.error('Rol kaldırılırken hata oluştu:', error);
      return {
        success: false,
        error: 'Rol kaldırılırken bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcı hesabını devre dışı bırakır
   * @param {string} userId - Kullanıcı ID
   * @returns {Promise<Object>} - Devre dışı bırakma sonucu
   */
  async deactivateUser(userId) {
    this._checkInitialized();
    
    try {
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'Kullanıcı bulunamadı'
        };
      }
      
      // Kullanıcı zaten devre dışı mı?
      if (!user.isActive) {
        return {
          success: false,
          error: 'Kullanıcı zaten devre dışı'
        };
      }
      
      // Kullanıcıyı devre dışı bırak
      user.isActive = false;
      user.updatedAt = new Date();
      
      // Kullanıcıyı kaydet
      await this.userRepository.save(user);
      
      return {
        success: true,
        message: 'Kullanıcı hesabı devre dışı bırakıldı'
      };
    } catch (error) {
      console.error('Kullanıcı devre dışı bırakılırken hata oluştu:', error);
      return {
        success: false,
        error: 'Kullanıcı devre dışı bırakılırken bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcı hesabını etkinleştirir
   * @param {string} userId - Kullanıcı ID
   * @returns {Promise<Object>} - Etkinleştirme sonucu
   */
  async activateUser(userId) {
    this._checkInitialized();
    
    try {
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'Kullanıcı bulunamadı'
        };
      }
      
      // Kullanıcı zaten etkin mi?
      if (user.isActive) {
        return {
          success: false,
          error: 'Kullanıcı zaten etkin'
        };
      }
      
      // Kullanıcıyı etkinleştir
      user.isActive = true;
      user.updatedAt = new Date();
      
      // Kullanıcıyı kaydet
      await this.userRepository.save(user);
      
      return {
        success: true,
        message: 'Kullanıcı hesabı etkinleştirildi'
      };
    } catch (error) {
      console.error('Kullanıcı etkinleştirilirken hata oluştu:', error);
      return {
        success: false,
        error: 'Kullanıcı etkinleştirilirken bir hata oluştu'
      };
    }
  }
  
  /**
   * Kullanıcı listesini getirir
   * @param {Object} filter - Filtreleme kriterleri
   * @param {Object} options - Sorgu seçenekleri (sıralama, sayfalama vb.)
   * @returns {Promise<Object>} - Kullanıcı listesi
   */
  async listUsers(filter = {}, options = {}) {
    this._checkInitialized();
    
    try {
      // Toplam kullanıcı sayısını al
      const totalCount = await this.userRepository.count(filter);
      
      // Kullanıcıları getir
      const users = await this.userRepository.findAll(filter, options);
      
      // Hassas bilgileri çıkar
      const usersWithoutPassword = users.map(user => {
        const { passwordHash: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
      });
      
      return {
        success: true,
        users: usersWithoutPassword,
        totalCount,
        page: options.skip ? Math.floor(options.skip / options.limit) + 1 : 1,
        pageSize: options.limit || users.length,
        totalPages: options.limit ? Math.ceil(totalCount / options.limit) : 1
      };
    } catch (error) {
      console.error('Kullanıcı listesi alınırken hata oluştu:', error);
      return {
        success: false,
        error: 'Kullanıcı listesi alınırken bir hata oluştu'
      };
    }
  }
  
  /**
   * Servisin başlatılıp başlatılmadığını kontrol eder
   * @private
   * @throws {Error} - Servis başlatılmamışsa hata fırlatır
   */
  _checkInitialized() {
    if (!this.isInitialized) {
      throw new Error('Kullanıcı servisi başlatılmamış');
    }
  }
}

module.exports = UserService;
