import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ForbiddenError } from '../utils/errors';

// Rol ve izin modeli için arayüzler
export interface Role {
  name: string;
  permissions: string[];
  description?: string;
}

export interface Permission {
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

// Varsayılan roller ve izinler
const defaultPermissions: Record<string, Permission> = {
  'read:users': { 
    name: 'read:users', 
    description: 'Kullanıcı bilgilerini okuma izni',
    resource: 'users',
    action: 'read'
  },
  'write:users': { 
    name: 'write:users', 
    description: 'Kullanıcı bilgilerini düzenleme izni',
    resource: 'users',
    action: 'write'
  },
  'delete:users': { 
    name: 'delete:users', 
    description: 'Kullanıcı silme izni',
    resource: 'users',
    action: 'delete'
  },
  'read:services': { 
    name: 'read:services', 
    description: 'Servis bilgilerini okuma izni',
    resource: 'services',
    action: 'read'
  },
  'write:services': { 
    name: 'write:services', 
    description: 'Servis bilgilerini düzenleme izni',
    resource: 'services',
    action: 'write'
  },
  'read:segmentation': { 
    name: 'read:segmentation', 
    description: 'Segmentasyon işlemlerini okuma izni',
    resource: 'segmentation',
    action: 'read'
  },
  'write:segmentation': { 
    name: 'write:segmentation', 
    description: 'Segmentasyon işlemlerini başlatma izni',
    resource: 'segmentation',
    action: 'write'
  },
  'read:runner': { 
    name: 'read:runner', 
    description: 'Runner işlemlerini okuma izni',
    resource: 'runner',
    action: 'read'
  },
  'write:runner': { 
    name: 'write:runner', 
    description: 'Runner işlemlerini başlatma izni',
    resource: 'runner',
    action: 'write'
  },
  'read:archive': { 
    name: 'read:archive', 
    description: 'Arşiv kayıtlarını okuma izni',
    resource: 'archive',
    action: 'read'
  },
  'write:archive': { 
    name: 'write:archive', 
    description: 'Arşivleme işlemlerini başlatma izni',
    resource: 'archive',
    action: 'write'
  },
  'admin': { 
    name: 'admin', 
    description: 'Tam yönetici izni',
    resource: '*',
    action: '*'
  }
};

const defaultRoles: Record<string, Role> = {
  'admin': {
    name: 'admin',
    description: 'Sistem yöneticisi',
    permissions: Object.keys(defaultPermissions)
  },
  'user': {
    name: 'user',
    description: 'Standart kullanıcı',
    permissions: [
      'read:users', 
      'read:services', 
      'read:segmentation', 
      'write:segmentation',
      'read:runner',
      'write:runner',
      'read:archive',
      'write:archive'
    ]
  },
  'service': {
    name: 'service',
    description: 'Servis hesabı',
    permissions: [
      'read:services',
      'read:segmentation',
      'read:runner',
      'read:archive'
    ]
  },
  'guest': {
    name: 'guest',
    description: 'Misafir kullanıcı',
    permissions: [
      'read:services'
    ]
  }
};

// Rol ve izin yönetimi için sınıf
export class AuthorizationService {
  private roles: Record<string, Role>;
  private permissions: Record<string, Permission>;

  constructor() {
    this.roles = { ...defaultRoles };
    this.permissions = { ...defaultPermissions };
    logger.info('Yetkilendirme servisi başlatıldı');
  }

  /**
   * Yeni bir rol ekler
   * @param role Eklenecek rol
   */
  addRole(role: Role): void {
    if (this.roles[role.name]) {
      logger.warn(`Rol zaten mevcut: ${role.name}`);
      return;
    }

    // Rol izinlerinin geçerliliğini kontrol et
    const validPermissions = role.permissions.filter(p => this.permissions[p]);
    if (validPermissions.length !== role.permissions.length) {
      const invalidPermissions = role.permissions.filter(p => !this.permissions[p]);
      logger.warn(`Geçersiz izinler: ${invalidPermissions.join(', ')}`);
      role.permissions = validPermissions;
    }

    this.roles[role.name] = role;
    logger.info(`Yeni rol eklendi: ${role.name}`);
  }

  /**
   * Yeni bir izin ekler
   * @param permission Eklenecek izin
   */
  addPermission(permission: Permission): void {
    if (this.permissions[permission.name]) {
      logger.warn(`İzin zaten mevcut: ${permission.name}`);
      return;
    }

    this.permissions[permission.name] = permission;
    logger.info(`Yeni izin eklendi: ${permission.name}`);
  }

  /**
   * Bir role izin ekler
   * @param roleName Rol adı
   * @param permissionName İzin adı
   */
  addPermissionToRole(roleName: string, permissionName: string): void {
    const role = this.roles[roleName];
    if (!role) {
      logger.warn(`Rol bulunamadı: ${roleName}`);
      return;
    }

    const permission = this.permissions[permissionName];
    if (!permission) {
      logger.warn(`İzin bulunamadı: ${permissionName}`);
      return;
    }

    if (role.permissions.includes(permissionName)) {
      logger.warn(`Rol zaten bu izne sahip: ${roleName} -> ${permissionName}`);
      return;
    }

    role.permissions.push(permissionName);
    logger.info(`Role izin eklendi: ${roleName} -> ${permissionName}`);
  }

  /**
   * Bir rolden izin kaldırır
   * @param roleName Rol adı
   * @param permissionName İzin adı
   */
  removePermissionFromRole(roleName: string, permissionName: string): void {
    const role = this.roles[roleName];
    if (!role) {
      logger.warn(`Rol bulunamadı: ${roleName}`);
      return;
    }

    const index = role.permissions.indexOf(permissionName);
    if (index === -1) {
      logger.warn(`Rol bu izne sahip değil: ${roleName} -> ${permissionName}`);
      return;
    }

    role.permissions.splice(index, 1);
    logger.info(`Rolden izin kaldırıldı: ${roleName} -> ${permissionName}`);
  }

  /**
   * Bir rolü siler
   * @param roleName Rol adı
   */
  removeRole(roleName: string): void {
    if (!this.roles[roleName]) {
      logger.warn(`Rol bulunamadı: ${roleName}`);
      return;
    }

    delete this.roles[roleName];
    logger.info(`Rol silindi: ${roleName}`);
  }

  /**
   * Bir izni siler
   * @param permissionName İzin adı
   */
  removePermission(permissionName: string): void {
    if (!this.permissions[permissionName]) {
      logger.warn(`İzin bulunamadı: ${permissionName}`);
      return;
    }

    // İzni kullanan rolleri güncelle
    Object.values(this.roles).forEach(role => {
      const index = role.permissions.indexOf(permissionName);
      if (index !== -1) {
        role.permissions.splice(index, 1);
        logger.info(`İzin rolden kaldırıldı: ${role.name} -> ${permissionName}`);
      }
    });

    delete this.permissions[permissionName];
    logger.info(`İzin silindi: ${permissionName}`);
  }

  /**
   * Bir kullanıcının belirli bir izne sahip olup olmadığını kontrol eder
   * @param userRoles Kullanıcı rolleri
   * @param requiredPermission Gerekli izin
   * @returns İzin var mı
   */
  hasPermission(userRoles: string[], requiredPermission: string): boolean {
    // Admin rolü tüm izinlere sahiptir
    if (userRoles.includes('admin')) {
      return true;
    }

    // Kullanıcının rollerini kontrol et
    for (const roleName of userRoles) {
      const role = this.roles[roleName];
      if (role && (role.permissions.includes(requiredPermission) || role.permissions.includes('admin'))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Bir kullanıcının belirli bir kaynağa erişim izni olup olmadığını kontrol eder
   * @param userRoles Kullanıcı rolleri
   * @param resource Kaynak adı
   * @param action İşlem (read, write, delete)
   * @returns İzin var mı
   */
  hasResourcePermission(userRoles: string[], resource: string, action: string): boolean {
    // Admin rolü tüm kaynaklara erişebilir
    if (userRoles.includes('admin')) {
      return true;
    }

    // Kullanıcının rollerini kontrol et
    for (const roleName of userRoles) {
      const role = this.roles[roleName];
      if (!role) continue;

      // Rol izinlerini kontrol et
      for (const permissionName of role.permissions) {
        const permission = this.permissions[permissionName];
        if (!permission) continue;

        // Tam eşleşme
        if (permission.resource === resource && permission.action === action) {
          return true;
        }

        // Wildcard eşleşme
        if (permission.resource === '*' || permission.action === '*') {
          return true;
        }

        // Resource wildcard eşleşme
        if (permission.resource === '*' && permission.action === action) {
          return true;
        }

        // Action wildcard eşleşme
        if (permission.resource === resource && permission.action === '*') {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Tüm rolleri döndürür
   * @returns Roller
   */
  getRoles(): Record<string, Role> {
    return { ...this.roles };
  }

  /**
   * Tüm izinleri döndürür
   * @returns İzinler
   */
  getPermissions(): Record<string, Permission> {
    return { ...this.permissions };
  }

  /**
   * Belirli bir rolü döndürür
   * @param roleName Rol adı
   * @returns Rol
   */
  getRole(roleName: string): Role | undefined {
    return this.roles[roleName];
  }

  /**
   * Belirli bir izni döndürür
   * @param permissionName İzin adı
   * @returns İzin
   */
  getPermission(permissionName: string): Permission | undefined {
    return this.permissions[permissionName];
  }
}

// Singleton instance
const authorizationService = new AuthorizationService();

/**
 * İzin tabanlı yetkilendirme middleware'i
 * @param permission Gerekli izin
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Yetkilendirme gerekli');
    }

    const userRoles = req.user.roles || [];
    
    if (!authorizationService.hasPermission(userRoles, permission)) {
      logger.warn(`İzin reddedildi: ${req.user.username} -> ${permission}`);
      throw new ForbiddenError(`Bu işlem için '${permission}' izni gerekli`);
    }

    next();
  };
};

/**
 * Kaynak tabanlı yetkilendirme middleware'i
 * @param resource Kaynak adı
 * @param action İşlem (read, write, delete)
 */
export const requireResourcePermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Yetkilendirme gerekli');
    }

    const userRoles = req.user.roles || [];
    
    if (!authorizationService.hasResourcePermission(userRoles, resource, action)) {
      logger.warn(`Kaynak izni reddedildi: ${req.user.username} -> ${resource}:${action}`);
      throw new ForbiddenError(`Bu işlem için '${resource}' kaynağı üzerinde '${action}' izni gerekli`);
    }

    next();
  };
};

export default authorizationService;
