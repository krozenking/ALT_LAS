// ALT_LAS Kimlik Doğrulama Servisi

const crypto = require('crypto');
const User = require('../models/User');

/**
 * Kimlik doğrulama işlemlerini yöneten servis
 */
class AuthService {
  /**
   * Kimlik doğrulama servisini başlatır
   * @param {Object} config - Servis yapılandırması
   */
  constructor(config = {}) {
    this.config = {
      passwordMinLength: 8,
      passwordMaxLength: 128,
      saltRounds: 10,
      tokenExpiry: 24 * 60 * 60 * 1000, // 24 saat
      ...config
    };
    
    this.userRepository = null;
  }
  
  /**
   * Kullanıcı repository'sini ayarlar
   * @param {Object} repository - Kullanıcı repository'si
   */
  setUserRepository(repository) {
    this.userRepository = repository;
  }
  
  /**
   * Kullanıcı kaydı yapar
   * @param {Object} userData - Kullanıcı verileri
   * @returns {Promise<User>} - Oluşturulan kullanıcı
   */
  async register(userData) {
    // Kullanıcı repository'sinin varlığını kontrol et
    if (!this.userRepository) {
      throw new Error('Kullanıcı repository\'si ayarlanmamış');
    }
    
    // Gerekli alanları kontrol et
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Kullanıcı adı, e-posta ve parola gereklidir');
    }
    
    // Parola geçerliliğini kontrol et
    this._validatePassword(userData.password);
    
    // Kullanıcı adı ve e-posta benzersizliğini kontrol et
    const existingUser = await this.userRepository.findByUsernameOrEmail(userData.username, userData.email);
    if (existingUser) {
      throw new Error('Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor');
    }
    
    // Parolayı hashle
    const passwordHash = await this._hashPassword(userData.password);
    
    // Yeni kullanıcı oluştur
    const newUser = new User({
      username: userData.username,
      email: userData.email,
      passwordHash,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      roles: ['user'],
      isActive: true,
      isEmailVerified: false
    });
    
    // Kullanıcıyı kaydet
    const savedUser = await this.userRepository.save(newUser);
    
    // Hassas bilgileri temizle
    delete savedUser.passwordHash;
    
    return savedUser;
  }
  
  /**
   * Kullanıcı girişi yapar
   * @param {string} usernameOrEmail - Kullanıcı adı veya e-posta
   * @param {string} password - Parola
   * @returns {Promise<Object>} - Giriş bilgileri
   */
  async login(usernameOrEmail, password) {
    // Kullanıcı repository'sinin varlığını kontrol et
    if (!this.userRepository) {
      throw new Error('Kullanıcı repository\'si ayarlanmamış');
    }
    
    // Kullanıcıyı bul
    const user = await this.userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
    if (!user) {
      throw new Error('Geçersiz kullanıcı adı/e-posta veya parola');
    }
    
    // Kullanıcının aktif olup olmadığını kontrol et
    if (!user.isActive) {
      throw new Error('Bu hesap devre dışı bırakılmış');
    }
    
    // Parolayı doğrula
    const isPasswordValid = await this._verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Geçersiz kullanıcı adı/e-posta veya parola');
    }
    
    // İki faktörlü kimlik doğrulama kontrolü
    if (user.twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        userId: user.id,
        message: 'İki faktörlü kimlik doğrulama kodu gerekli'
      };
    }
    
    // Son giriş zamanını güncelle
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
    
    // Oturum token'ı oluştur
    const token = this._generateToken(user);
    
    return {
      token,
      user: user.toJSON(false),
      expiresAt: new Date(Date.now() + this.config.tokenExpiry)
    };
  }
  
  /**
   * İki faktörlü kimlik doğrulama yapar
   * @param {string} userId - Kullanıcı ID
   * @param {string} code - Doğrulama kodu
   * @returns {Promise<Object>} - Giriş bilgileri
   */
  async verifyTwoFactor(userId, code) {
    // Kullanıcı repository'sinin varlığını kontrol et
    if (!this.userRepository) {
      throw new Error('Kullanıcı repository\'si ayarlanmamış');
    }
    
    // Kullanıcıyı bul
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive || !user.twoFactorEnabled) {
      throw new Error('Geçersiz kullanıcı veya iki faktörlü kimlik doğrulama etkin değil');
    }
    
    // Kodu doğrula
    const isCodeValid = this._verifyTwoFactorCode(code, user.twoFactorSecret);
    if (!isCodeValid) {
      throw new Error('Geçersiz doğrulama kodu');
    }
    
    // Son giriş zamanını güncelle
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
    
    // Oturum token'ı oluştur
    const token = this._generateToken(user);
    
    return {
      token,
      user: user.toJSON(false),
      expiresAt: new Date(Date.now() + this.config.tokenExpiry)
    };
  }
  
  /**
   * Parola sıfırlama talebi oluşturur
   * @param {string} email - E-posta adresi
   * @returns {Promise<Object>} - Sıfırlama bilgileri
   */
  async requestPasswordReset(email) {
    // Kullanıcı repository'sinin varlığını kontrol et
    if (!this.userRepository) {
      throw new Error('Kullanıcı repository\'si ayarlanmamış');
    }
    
    // Kullanıcıyı bul
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      // Güvenlik için kullanıcı bulunamasa bile başarılı yanıt döndür
      return {
        success: true,
        message: 'Parola sıfırlama talimatları e-posta adresinize gönderildi'
      };
    }
    
    // Sıfırlama token'ı oluştur
    const resetToken = this._generateResetToken();
    const resetTokenHash = this._hashResetToken(resetToken);
    
    // Token'ı kullanıcı meta verisine kaydet
    user.updateMetadata('resetTokenHash', resetTokenHash);
    user.updateMetadata('resetTokenExpiry', new Date(Date.now() + 60 * 60 * 1000)); // 1 saat
    await this.userRepository.save(user);
    
    // Gerçek uygulamada e-posta gönderme işlemi burada yapılır
    
    return {
      success: true,
      message: 'Parola sıfırlama talimatları e-posta adresinize gönderildi',
      // Geliştirme amaçlı, gerçek uygulamada bu bilgiler döndürülmez
      resetToken,
      userId: user.id
    };
  }
  
  /**
   * Parolayı sıfırlar
   * @param {string} userId - Kullanıcı ID
   * @param {string} resetToken - Sıfırlama token'ı
   * @param {string} newPassword - Yeni parola
   * @returns {Promise<Object>} - Sıfırlama sonucu
   */
  async resetPassword(userId, resetToken, newPassword) {
    // Kullanıcı repository'sinin varlığını kontrol et
    if (!this.userRepository) {
      throw new Error('Kullanıcı repository\'si ayarlanmamış');
    }
    
    // Kullanıcıyı bul
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('Geçersiz kullanıcı');
    }
    
    // Token'ı doğrula
    const resetTokenHash = user.getMetadata('resetTokenHash');
    const resetTokenExpiry = user.getMetadata('resetTokenExpiry');
    
    if (!resetTokenHash || !resetTokenExpiry) {
      throw new Error('Geçersiz veya süresi dolmuş sıfırlama token\'ı');
    }
    
    // Token süresini kontrol et
    if (new Date(resetTokenExpiry) < new Date()) {
      throw new Error('Sıfırlama token\'ının süresi dolmuş');
    }
    
    // Token hash'ini doğrula
    const isTokenValid = this._verifyResetToken(resetToken, resetTokenHash);
    if (!isTokenValid) {
      throw new Error('Geçersiz sıfırlama token\'ı');
    }
    
    // Yeni parolayı doğrula
    this._validatePassword(newPassword);
    
    // Yeni parolayı hashle
    const passwordHash = await this._hashPassword(newPassword);
    
    // Parolayı güncelle
    user.passwordHash = passwordHash;
    
    // Sıfırlama token'ını temizle
    user.updateMetadata('resetTokenHash', null);
    user.updateMetadata('resetTokenExpiry', null);
    
    // Kullanıcıyı kaydet
    await this.userRepository.save(user);
    
    return {
      success: true,
      message: 'Parolanız başarıyla sıfırlandı'
    };
  }
  
  /**
   * Token'ı doğrular
   * @param {string} token - Doğrulanacak token
   * @returns {Promise<User|null>} - Token geçerli ise kullanıcı, değilse null
   */
  async verifyToken(token) {
    try {
      // Token'ı çöz
      const decoded = this._decodeToken(token);
      
      // Token süresini kontrol et
      if (decoded.exp < Date.now() / 1000) {
        return null;
      }
      
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        return null;
      }
      
      return user;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Parolayı doğrular
   * @param {string} password - Parola
   * @private
   */
  _validatePassword(password) {
    if (!password) {
      throw new Error('Parola gereklidir');
    }
    
    if (password.length < this.config.passwordMinLength) {
      throw new Error(`Parola en az ${this.config.passwordMinLength} karakter olmalıdır`);
    }
    
    if (password.length > this.config.passwordMaxLength) {
      throw new Error(`Parola en fazla ${this.config.passwordMaxLength} karakter olmalıdır`);
    }
    
    // Güvenlik gereksinimleri
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      throw new Error('Parola en az bir büyük harf, bir küçük harf ve bir rakam içermelidir');
    }
    
    if (!hasSpecialChars) {
      throw new Error('Parola en az bir özel karakter içermelidir');
    }
  }
  
  /**
   * Parolayı hashler
   * @param {string} password - Hashlenecek parola
   * @returns {Promise<string>} - Hashlenmiş parola
   * @private
   */
  async _hashPassword(password) {
    // Gerçek uygulamada bcrypt veya argon2 kullanılır
    // Bu örnekte basit bir hash kullanıyoruz
    return new Promise((resolve) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      resolve(`${salt}:${hash}`);
    });
  }
  
  /**
   * Parolayı doğrular
   * @param {string} password - Doğrulanacak parola
   * @param {string} hash - Hashlenmiş parola
   * @returns {Promise<boolean>} - Parola doğru ise true, değilse false
   * @private
   */
  async _verifyPassword(password, hash) {
    return new Promise((resolve) => {
      const [salt, storedHash] = hash.split(':');
      const calculatedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      resolve(storedHash === calculatedHash);
    });
  }
  
  /**
   * Token oluşturur
   * @param {User} user - Kullanıcı
   * @returns {string} - Oluşturulan token
   * @private
   */
  _generateToken(user) {
    // Gerçek uygulamada JWT kullanılır
    // Bu örnekte basit bir token kullanıyoruz
    const payload = {
      userId: user.id,
      username: user.username,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.config.tokenExpiry) / 1000)
    };
    
    const payloadStr = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', 'secret_key').update(payloadStr).digest('hex');
    
    return Buffer.from(`${payloadStr}:${signature}`).toString('base64');
  }
  
  /**
   * Token'ı çözer
   * @param {string} token - Çözülecek token
   * @returns {Object} - Token payload
   * @private
   */
  _decodeToken(token) {
    const decoded = Buffer.from(token, 'base64').toString();
    const [payloadStr, signature] = decoded.split(':');
    
    const calculatedSignature = crypto.createHmac('sha256', 'secret_key').update(payloadStr).digest('hex');
    
    if (signature !== calculatedSignature) {
      throw new Error('Geçersiz token imzası');
    }
    
    return JSON.parse(payloadStr);
  }
  
  /**
   * Sıfırlama token'ı oluşturur
   * @returns {string} - Oluşturulan token
   * @private
   */
  _generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Sıfırlama token'ını hashler
   * @param {string} token - Hashlenecek token
   * @returns {string} - Hashlenmiş token
   * @private
   */
  _hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  
  /**
   * Sıfırlama token'ını doğrular
   * @param {string} token - Doğrulanacak token
   * @param {string} hash - Hashlenmiş token
   * @returns {boolean} - Token doğru ise true, değilse false
   * @private
   */
  _verifyResetToken(token, hash) {
    const calculatedHash = this._hashResetToken(token);
    return hash === calculatedHash;
  }
  
  /**
   * İki faktörlü kimlik doğrulama kodunu doğrular
   * @param {string} code - Doğrulanacak kod
   * @param {string} secret - Kullanıcı gizli anahtarı
   * @returns {boolean} - Kod doğru ise true, değilse false
   * @private
   */
  _verifyTwoFactorCode(code, secret) {
    // Gerçek uygulamada TOTP algoritması kullanılır
    // Bu örnekte basit bir doğrulama kullanıyoruz
    
    // Simüle edilmiş doğrulama
    return code === '123456'; // Gerçek uygulamada bu şekilde yapılmaz
  }
}

module.exports = AuthService;
