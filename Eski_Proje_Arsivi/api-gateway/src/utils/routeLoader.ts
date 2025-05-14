import { Express, Router } from 'express';
import fs from 'fs';
import path from 'path';
import logger from './logger';
import { routeAuthManager, RoutePermission } from '../middleware/routeAuthMiddleware';

// Interface for permissions defined within a route file, path is relative to the router's base
interface SubRoutePermissionDefinition extends Omit<RoutePermission, 'path'> {
  path: string; // Relative path for this specific permission, e.g., '/details' or '/:id/delete'
}

interface RouteFileDefinition {
  path: string; // Base path for this router within the module, e.g., '/' or '/users'
  router: Router;
  permissions?: SubRoutePermissionDefinition[];
}

interface ModuleExport {
  default?: Router | RouteFileDefinition[];
  routes?: RouteFileDefinition[];
}

const loadRoutes = (app: Express, modulesDir: string = path.join(__dirname, '../modules')) => {
  logger.info(`Starting to load dynamic routes from: ${modulesDir}`);
  try {
    const moduleNames = fs.readdirSync(modulesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of moduleNames) {
      const routesPath = path.join(modulesDir, moduleName, 'routes');
      if (fs.existsSync(routesPath) && fs.lstatSync(routesPath).isDirectory()) {
        const routeFiles = fs.readdirSync(routesPath)
          .filter(file => (file.endsWith('.routes.ts') || file.endsWith('.routes.js')) && !file.startsWith('_'));

        for (const routeFile of routeFiles) {
          try {
            const routeModulePath = path.join(routesPath, routeFile);
            const routeModule: ModuleExport = require(routeModulePath);

            const processRouteDefinitions = (definitions: RouteFileDefinition[], isDefaultExport: boolean) => {
              for (const def of definitions) {
                const baseRoutePathForModule = `/api/v1/${moduleName}`;
                let fullRouterPath = baseRoutePathForModule;
                if (def.path && def.path !== '/') {
                    fullRouterPath = `${baseRoutePathForModule}${def.path.startsWith('/') ? def.path : '/' + def.path}`;
                }
                
                app.use(fullRouterPath, def.router);
                logger.info(`Successfully loaded router for module ${moduleName} at ${fullRouterPath} from ${routeModulePath} (export: ${isDefaultExport ? 'default' : 'routes'})`);

                if (def.permissions && Array.isArray(def.permissions)) {
                  for (const permDef of def.permissions) { // permDef is SubRoutePermissionDefinition
                    let permissionFullPath = `${fullRouterPath}${permDef.path.startsWith('/') ? permDef.path : '/' + permDef.path}`;
                    if (permissionFullPath.length > 1 && permissionFullPath.endsWith('/')) {
                        permissionFullPath = permissionFullPath.slice(0, -1);
                    }
                    
                    const routePermissionEntry: RoutePermission = {
                      // Spread all properties from permDef (roles, permissions, resourceAction, method)
                      // and explicitly set the calculated absolute path.
                      roles: permDef.roles,
                      permissions: permDef.permissions,
                      resourceAction: permDef.resourceAction,
                      method: permDef.method.toLowerCase(), 
                      path: permissionFullPath, // This is the absolute path for routeAuthManager
                    };
                    routeAuthManager.addRoutePermission(routePermissionEntry);
                  }
                }
              }
            };

            if (routeModule && routeModule.default) {
              if (typeof routeModule.default === 'function') { 
                const routerInstance = routeModule.default as Router;
                const baseRoutePath = `/api/v1/${moduleName}`;
                app.use(baseRoutePath, routerInstance);
                logger.info(`Successfully loaded default exported router from ${routeModulePath} at ${baseRoutePath}`);
              } else if (Array.isArray(routeModule.default)) { 
                processRouteDefinitions(routeModule.default as RouteFileDefinition[], true);
              }
            } else if (routeModule && Array.isArray(routeModule.routes)) { 
              processRouteDefinitions(routeModule.routes, false);
            }
             else {
              logger.warn(`No suitable export (default Router, default RouteFileDefinition[], or named 'routes' RouteFileDefinition[]) found in ${routeModulePath}.`);
            }
          } catch (err) {
            if (err instanceof Error) {
                logger.error(`Error loading route file ${routeFile} in module ${moduleName}: ${err.message}`, { stack: err.stack });
            } else {
                logger.error(`Unknown error loading route file ${routeFile} in module ${moduleName}.`);
            }
          }
        }
      } else {
        // logger.debug(`No 'routes' directory found in module ${moduleName}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
        logger.error(`Error reading modules directory ${modulesDir}: ${error.message}`, { stack: error.stack });
    } else {
        logger.error(`Unknown error reading modules directory ${modulesDir}.`);
    }
  }
  logger.info('Finished loading dynamic routes.');
};

export default loadRoutes;

