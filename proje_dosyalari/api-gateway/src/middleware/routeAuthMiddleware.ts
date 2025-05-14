import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import authorizationService from '../services/authorizationService';
import logger from '../utils/logger';

// Route bazlı yetkilendirme için arayüz
export interface RoutePermission {
  path: string;
  method: string;
  roles?: string[];
  permissions?: string[];
  resourceAction?: {
    resource: string;
    action: string;
  };
}

// Route izinleri için sınıf
export class RouteAuthorizationManager {
  private routePermissions: RoutePermission[] = [];

  /**
   * Yeni bir route izni ekler
   * @param routePermission Route izni
   */
  addRoutePermission(routePermission: RoutePermission): void {
    // Aynı path ve method için var olan izni kontrol et
    const existingIndex = this.routePermissions.findIndex(
      rp => rp.path === routePermission.path && rp.method === routePermission.method
    );

    if (existingIndex !== -1) {
      // Var olan izni güncelle
      this.routePermissions[existingIndex] = routePermission;
      logger.info(`Route izni güncellendi: ${routePermission.method} ${routePermission.path}`);
    } else {
      // Yeni izin ekle
      this.routePermissions.push(routePermission);
      logger.info(`Yeni route izni eklendi: ${routePermission.method} ${routePermission.path}`);
    }
  }

  /**
   * Bir route iznini kaldırır
   * @param path Route path
   * @param method HTTP method
   */
  removeRoutePermission(path: string, method: string): void {
    const initialLength = this.routePermissions.length;
    this.routePermissions = this.routePermissions.filter(
      rp => !(rp.path === path && rp.method === method)
    );

    if (initialLength !== this.routePermissions.length) {
      logger.info(`Route izni kaldırıldı: ${method} ${path}`);
    } else {
      logger.warn(`Kaldırılacak route izni bulunamadı: ${method} ${path}`);
    }
  }

  /**
   * Tüm route izinlerini döndürür
   * @returns Route izinleri
   */
  getRoutePermissions(): RoutePermission[] {
    return [...this.routePermissions];
  }

  /**
   * Belirli bir route için izin kontrolü yapar
   * @param path Route path
   * @param method HTTP method
   * @param userRoles Kullanıcı rolleri
   * @param userPermissions Kullanıcı izinleri
   * @returns İzin var mı
   */
  checkRouteAuthorization(
    path: string, 
    method: string, 
    userRoles: string[] = [], 
    userPermissions: string[] = []
  ): boolean {
    // Admin rolü her zaman erişebilir
    if (userRoles.includes('admin')) {
      return true;
    }

    // Path'e en uygun route iznini bul
    // Exact match veya pattern match (örn. /users/:userId)
    const matchingRoutes = this.routePermissions.filter(rp => {
      // Exact match
      if (rp.path === path && rp.method === method) {
        return true;
      }

      // Pattern match için path'i parçalara ayır
      const routeParts = rp.path.split('/');
      const requestParts = path.split('/');

      // Parça sayısı aynı değilse eşleşme yok
      if (routeParts.length !== requestParts.length || rp.method !== method) {
        return false;
      }

      // Her parçayı kontrol et
      return routeParts.every((part, index) => {
        // Parametre ise (:userId gibi) veya tam eşleşme varsa true
        return part.startsWith(':') || part === requestParts[index];
      });
    });

    // Eşleşen route yoksa, varsayılan olarak erişime izin verme
    if (matchingRoutes.length === 0) {
      logger.warn(`Route izni bulunamadı: ${method} ${path}`);
      return false;
    }

    // En spesifik eşleşmeyi bul (en az parametre içeren)
    const mostSpecificRoute = matchingRoutes.reduce((prev, curr) => {
      const prevParams = prev.path.split('/').filter(p => p.startsWith(':')).length;
      const currParams = curr.path.split('/').filter(p => p.startsWith(':')).length;
      return prevParams <= currParams ? prev : curr;
    });

    // Rol kontrolü
    if (mostSpecificRoute.roles && mostSpecificRoute.roles.length > 0) {
      const hasRole = mostSpecificRoute.roles.some(role => userRoles.includes(role));
      if (!hasRole) {
        logger.warn(`Rol izni reddedildi: ${method} ${path}, Gerekli roller: ${mostSpecificRoute.roles.join(', ')}`);
        return false;
      }
    }

    // İzin kontrolü
    if (mostSpecificRoute.permissions && mostSpecificRoute.permissions.length > 0) {
      const hasPermission = mostSpecificRoute.permissions.some(permission => 
        userPermissions.includes(permission)
      );
      if (!hasPermission) {
        logger.warn(`İzin reddedildi: ${method} ${path}, Gerekli izinler: ${mostSpecificRoute.permissions.join(', ')}`);
        return false;
      }
    }

    // Kaynak-işlem kontrolü
    if (mostSpecificRoute.resourceAction) {
      const { resource, action } = mostSpecificRoute.resourceAction;
      const hasResourcePermission = authorizationService.hasResourcePermission(
        userRoles, 
        resource, 
        action
      );
      if (!hasResourcePermission) {
        logger.warn(`Kaynak izni reddedildi: ${method} ${path}, Gerekli: ${resource}:${action}`);
        return false;
      }
    }

    // Tüm kontrolleri geçtiyse erişime izin ver
    return true;
  }

  /**
   * Belirli bir route için izin kontrolü yapar ve sonucu döndürür
   * @param req Request nesnesi
   * @param path Route path
   * @param method HTTP method
   * @returns İzin sonucu
   */
  checkRouteAuthorizationWithDetails(
    req: Request,
    path: string,
    method: string
  ): { 
    authorized: boolean; 
    reason?: string;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    requiredResource?: string;
    requiredAction?: string;
  } {
    if (!req.user) {
      return { 
        authorized: false, 
        reason: 'Kimlik doğrulaması yapılmamış' 
      };
    }

    const userRoles = req.user.roles || [];
    const userPermissions = req.user.permissions || [];

    // Admin rolü her zaman erişebilir
    if (userRoles.includes('admin')) {
      return { authorized: true };
    }

    // Path'e en uygun route iznini bul
    const matchingRoutes = this.routePermissions.filter(rp => {
      // Exact match
      if (rp.path === path && rp.method === method) {
        return true;
      }

      // Pattern match için path'i parçalara ayır
      const routeParts = rp.path.split('/');
      const requestParts = path.split('/');

      // Parça sayısı aynı değilse eşleşme yok
      if (routeParts.length !== requestParts.length || rp.method !== method) {
        return false;
      }

      // Her parçayı kontrol et
      return routeParts.every((part, index) => {
        // Parametre ise (:userId gibi) veya tam eşleşme varsa true
        return part.startsWith(':') || part === requestParts[index];
      });
    });

    // Eşleşen route yoksa, varsayılan olarak erişime izin verme
    if (matchingRoutes.length === 0) {
      return { 
        authorized: false, 
        reason: 'Route izni bulunamadı' 
      };
    }

    // En spesifik eşleşmeyi bul (en az parametre içeren)
    const mostSpecificRoute = matchingRoutes.reduce((prev, curr) => {
      const prevParams = prev.path.split('/').filter(p => p.startsWith(':')).length;
      const currParams = curr.path.split('/').filter(p => p.startsWith(':')).length;
      return prevParams <= currParams ? prev : curr;
    });

    // Rol kontrolü
    if (mostSpecificRoute.roles && mostSpecificRoute.roles.length > 0) {
      const hasRole = mostSpecificRoute.roles.some(role => userRoles.includes(role));
      if (!hasRole) {
        return { 
          authorized: false, 
          reason: 'Gerekli role sahip değil', 
          requiredRoles: mostSpecificRoute.roles 
        };
      }
    }

    // İzin kontrolü
    if (mostSpecificRoute.permissions && mostSpecificRoute.permissions.length > 0) {
      const hasPermission = mostSpecificRoute.permissions.some(permission => 
        userPermissions.includes(permission)
      );
      if (!hasPermission) {
        return { 
          authorized: false, 
          reason: 'Gerekli izne sahip değil', 
          requiredPermissions: mostSpecificRoute.permissions 
        };
      }
    }

    // Kaynak-işlem kontrolü
    if (mostSpecificRoute.resourceAction) {
      const { resource, action } = mostSpecificRoute.resourceAction;
      const hasResourcePermission = authorizationService.hasResourcePermission(
        userRoles, 
        resource, 
        action
      );
      if (!hasResourcePermission) {
        return { 
          authorized: false, 
          reason: 'Kaynak izni yok', 
          requiredResource: resource,
          requiredAction: action
        };
      }
    }

    // Tüm kontrolleri geçtiyse erişime izin ver
    return { authorized: true };
  }
}

// Singleton instance
export const routeAuthManager = new RouteAuthorizationManager();

/**
 * Route bazlı yetkilendirme middleware'i
 */
export const routeAuthorization = (req: Request, res: Response, next: NextFunction): void => {
  // Kimlik doğrulaması yapılmamışsa geç
  if (!req.user) {
    return next();
  }

  // Construct the full path for matching against route permissions
  // req.route.path provides the pattern (e.g., /:sessionId), req.baseUrl provides the mount point (e.g., /api/v1/sessions)
  const routePattern = req.route?.path; // e.g., "/" or "/:sessionId"
  const basePath = req.baseUrl; // e.g., "/api/v1/sessions"
  
  // Combine base path and route pattern if route exists, otherwise use originalUrl as fallback
  // Ensure trailing slashes are handled consistently (e.g., remove trailing slash from basePath if routePattern is '/')
  let fullPathPattern = req.originalUrl.split('?')[0]; // Fallback
  if (req.route) {
      if (routePattern === '/' && basePath.length > 0) {
          fullPathPattern = basePath;
      } else if (routePattern) {
          fullPathPattern = basePath + routePattern;
      }
  }

  const method = req.method.toLowerCase();
  const userRoles = req.user.roles || [];
  const userPermissions = req.user.permissions || [];

  // Route izin kontrolü
  const isAuthorized = routeAuthManager.checkRouteAuthorization(
    fullPathPattern, // Use the constructed full path pattern
    method,
    userRoles,
    userPermissions
  );

  if (!isAuthorized) {
    // Log details for debugging
    logger.warn(`Authorization failed for user ${req.user.username} (${userRoles.join(',')}) accessing ${method.toUpperCase()} ${fullPathPattern}`);
    return next(new ForbiddenError(`Bu route için yetkiniz yok: ${method.toUpperCase()} ${fullPathPattern}`));
  }

  next();
};

/**
 * Dinamik izin kontrolü için yardımcı fonksiyon
 * @param req Request nesnesi
 * @param resource Kaynak adı
 * @param action İşlem (read, write, delete)
 * @returns İzin var mı
 */
export const checkDynamicPermission = (
  req: Request,
  resource: string,
  action: string
): boolean => {
  if (!req.user) {
    return false;
  }

  const userRoles = req.user.roles || [];
  return authorizationService.hasResourcePermission(userRoles, resource, action);
};

/**
 * Belirli bir route için yetkilendirme middleware'i oluşturur
 * @param routePermission Route izni
 * @returns Middleware fonksiyonu
 */
export const authorizeRoute = (routePermission: RoutePermission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Kimlik doğrulaması gerekli'));
    }

    const userRoles = req.user.roles || [];
    const userPermissions = req.user.permissions || [];

    // Rol kontrolü
    if (routePermission.roles && routePermission.roles.length > 0) {
      const hasRole = routePermission.roles.some(role => userRoles.includes(role));
      if (!hasRole) {
        return next(new ForbiddenError(`Bu işlem için gerekli role sahip değilsiniz. Gerekli roller: ${routePermission.roles.join(', ')}`));
      }
    }

    // İzin kontrolü
    if (routePermission.permissions && routePermission.permissions.length > 0) {
      const hasPermission = routePermission.permissions.some(permission => 
        userPermissions.includes(permission)
      );
      if (!hasPermission) {
        return next(new ForbiddenError(`Bu işlem için gerekli izne sahip değilsiniz. Gerekli izinler: ${routePermission.permissions.join(', ')}`));
      }
    }

    // Kaynak-işlem kontrolü
    if (routePermission.resourceAction) {
      const { resource, action } = routePermission.resourceAction;
      const hasResourcePermission = authorizationService.hasResourcePermission(
        userRoles, 
        resource, 
        action
      );
      if (!hasResourcePermission) {
        return next(new ForbiddenError(`Bu işlem için '${resource}' kaynağı üzerinde '${action}' izni gerekli`));
      }
    }

    // Tüm kontrolleri geçtiyse erişime izin ver
    next();
  };
};

export default routeAuthManager;
