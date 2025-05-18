// ALT_LAS Yetkilendirme Servisi

const User = require('../models/User');
const Role = require('../models/Role');

/**
 * Yetkilendirme işlemlerini yöneten servis
 */
class AuthorizationService {
  /**
   * Yetkilendirme servisini başlatır
   * @param {Object} config - Servis yapılandırması
   */
  constructor(config = {}) {
    this.config = {
      superAdminRole: 'admin',
      ...config
    };
    
    this.userRepository = null;
    this.roleRepository = null;
    this.permissionCache = new Map();
  }
  
  /**
   * Repository'leri ayarlar
   * @param {Object} repositories - Repository'ler
   */
  setRepositories(repositories) {
    this.userRepository = repositories.userRepository;
    this.roleRepository = repositories.roleRepository;
  }
  
  /**
   * Kullanıcının belirli bir izne sahip olup olmadığını kontrol eder
   * @param {User|string} user - Kullanıcı veya kullanıcı ID
   * @param {string} permission - Kontrol edilecek izin
   * @returns {Promise<boolean>} - İzin varsa true, yoksa false
   */
  async hasPermission(user, permission) {
    // Kullanıcı ID ise kullanıcıyı bul
    if (typeof user === 'string') {
      if (!this.userRepository) {
        throw new Error('Kullanıcı repository\'si ayarlanmamış');
      }
      
      user = await this.userRepository.findById(user);
      if (!user) {
        return false;
      }
    }
    
    // Kullanıcı aktif değilse izin yok
    if (!user.isActive) {
      return false;
    }
    
    // Süper admin her zaman tüm izinlere sahiptir
    if (user.hasRole(this.config.superAdminRole)) {
      return true;
    }
    
    // Kullanıcının rollerini kontrol et
    for (const roleName of user.roles) {
      // Rol izinlerini cache'den al veya yükle
      let permissions = this.permissionCache.get(roleName);
      
      if (!permissions) {
        if (!this.roleRepository) {
          throw new Error('Rol repository\'si ayarlanmamış');
        }
        
        const role = await this.roleRepository.findByName(roleName);
        if (!role) {
          continue;
        }
        
        permissions = role.permissions;
        this.permissionCache.set(roleName, permissions);
      }
      
      // İzni kontrol et
      if (permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
   * @param {User|string} user - Kullanıcı veya kullanıcı ID
   * @param {string} role - Kontrol edilecek rol
   * @returns {Promise<boolean>} - Rol varsa true, yoksa false
   */
  async hasRole(user, role) {
    // Kullanıcı ID ise kullanıcıyı bul
    if (typeof user === 'string') {
      if (!this.userRepository) {
        throw new Error('Kullanıcı repository\'si ayarlanmamış');
      }
      
      user = await this.userRepository.findById(user);
      if (!user) {
        return false;
      }
    }
    
    // Kullanıcı aktif değilse rol yok
    if (!user.isActive) {
      return false;
    }
    
    return user.hasRole(role);
  }
  
  /**
   * Kullanıcıya rol atar
   * @param {User|string} user - Kullanıcı veya kullanıcı ID
   * @param {string} role - Atanacak rol
   * @returns {Promise<boolean>} - Atama başarılı ise true, değilse false
   */
  async assignRole(user, role) {
    // Kullanıcı ID ise kullanıcıyı bul
    if (typeof user === 'string') {
      if (!this.userRepository) {
        throw new Error('Kullanıcı repository\'si ayarlanmamış');
      }
      
      user = await this.userRepository.findById(user);
      if (!user) {
        return false;
      }
    }
    
    // Kullanıcı aktif değilse işlem yapma
    if (!user.isActive) {
      return false;
    }
    
    // Rol varsa kontrol et
    if (this.roleRepository) {
      const roleExists = await this.roleRepository.findByName(role);
      if (!roleExists) {
        return false;
      }
    }
    
    // Rolü ekle
    const result = user.addRole(role);
    
    // Başarılı ise kullanıcıyı kaydet
    if (result && this.userRepository) {
      await this.userRepository.save(user);
    }
    
    return result;
  }
  
  /**
   * Kullanıcıdan rol kaldırır
   * @param {User|string} user - Kullanıcı veya kullanıcı ID
   * @param {string} role - Kaldırılacak rol
   * @returns {Promise<boolean>} - Kaldırma başarılı ise true, değilse false
   */
  async removeRole(user, role) {
    // Kullanıcı ID ise kullanıcıyı bul
    if (typeof user === 'string') {
      if (!this.userRepository) {
        throw new Error('Kullanıcı repository\'si ayarlanmamış');
      }
      
      user = await this.userRepository.findById(user);
      if (!user) {
        return false;
      }
    }
    
    // Kullanıcı aktif değilse işlem yapma
    if (!user.isActive) {
      return false;
    }
    
    // Süper admin rolünü kaldırmaya çalışıyorsa ve başka süper admin yoksa izin verme
    if (role === this.config.superAdminRole) {
      if (this.userRepository) {
        const adminCount = await this.userRepository.countByRole(this.config.superAdminRole);
        if (adminCount <= 1) {
          return false;
        }
      }
    }
    
    // Rolü kaldır
    const result = user.removeRole(role);
    
    // Başarılı ise kullanıcıyı kaydet
    if (result && this.userRepository) {
      await this.userRepository.save(user);
    }
    
    return result;
  }
  
  /**
   * Role izin ekler
   * @param {Role|string} role - Rol veya rol adı
   * @param {string} permission - Eklenecek izin
   * @returns {Promise<boolean>} - Ekleme başarılı ise true, değilse false
   */
  async addPermission(role, permission) {
    // Rol adı ise rolü bul
    if (typeof role === 'string') {
      if (!this.roleRepository) {
        throw new Error('Rol repository\'si ayarlanmamış');
      }
      
      role = await this.roleRepository.findByName(role);
      if (!role) {
        return false;
      }
    }
    
    // İzni ekle
    const result = role.addPermission(permission);
    
    // Başarılı ise rolü kaydet
    if (result && this.roleRepository) {
      await this.roleRepository.save(role);
      
      // Cache'i güncelle
      this.permissionCache.set(role.name, role.permissions);
    }
    
    return result;
  }
  
  /**
   * Rolden izin kaldırır
   * @param {Role|string} role - Rol veya rol adı
   * @param {string} permission - Kaldırılacak izin
   * @returns {Promise<boolean>} - Kaldırma başarılı ise true, değilse false
   */
  async removePermission(role, permission) {
    // Rol adı ise rolü bul
    if (typeof role === 'string') {
      if (!this.roleRepository) {
        throw new Error('Rol repository\'si ayarlanmamış');
      }
      
      role = await this.roleRepository.findByName(role);
      if (!role) {
        return false;
      }
    }
    
    // İzni kaldır
    const result = role.removePermission(permission);
    
    // Başarılı ise rolü kaydet
    if (result && this.roleRepository) {
      await this.roleRepository.save(role);
      
      // Cache'i güncelle
      this.permissionCache.set(role.name, role.permissions);
    }
    
    return result;
  }
  
  /**
   * Yeni rol oluşturur
   * @param {Object} roleData - Rol verileri
   * @returns {Promise<Role>} - Oluşturulan rol
   */
  async createRole(roleData) {
    if (!this.roleRepository) {
      throw new Error('Rol repository\'si ayarlanmamış');
    }
    
    // Gerekli alanları kontrol et
    if (!roleData.name) {
      throw new Error('Rol adı gereklidir');
    }
    
    // Rol adı benzersizliğini kontrol et
    const existingRole = await this.roleRepository.findByName(roleData.name);
    if (existingRole) {
      throw new Error('Bu rol adı zaten kullanılıyor');
    }
    
    // Yeni rol oluştur
    const newRole = new Role({
      name: roleData.name,
      description: roleData.description || '',
      permissions: roleData.permissions || [],
      isSystem: false
    });
    
    // Rolü kaydet
    return await this.roleRepository.save(newRole);
  }
  
  /**
   * Rolü siler
   * @param {string} roleName - Rol adı
   * @returns {Promise<boolean>} - Silme başarılı ise true, değilse false
   */
  async deleteRole(roleName) {
    if (!this.roleRepository) {
      throw new Error('Rol repository\'si ayarlanmamış');
    }
    
    // Rolü bul
    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      return false;
    }
    
    // Sistem rollerini silmeye izin verme
    if (role.isSystem) {
      return false;
    }
    
    // Rolü sil
    const result = await this.roleRepository.delete(role.id);
    
    // Cache'den kaldır
    this.permissionCache.delete(roleName);
    
    return result;
  }
  
  /**
   * Cache'i temizler
   */
  clearCache() {
    this.permissionCache.clear();
  }
}

module.exports = AuthorizationService;
