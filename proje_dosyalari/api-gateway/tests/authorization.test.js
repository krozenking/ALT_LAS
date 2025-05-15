const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const { routeAuthManager } = require('../src/middleware/routeAuthMiddleware');
const authorizationService = require('../src/services/authorizationService');

// Mock authorization services
jest.mock('../src/middleware/routeAuthMiddleware');
jest.mock('../src/services/authorizationService');

describe('Authorization Middleware', () => {
  let token;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock token for authenticated routes
    token = jwt.sign({ 
      userId: '123', 
      roles: ['user'], 
      permissions: ['read:test'] 
    }, 'default_jwt_secret_change_in_production');
  });

  describe('Route-based Authorization', () => {
    it('should allow access to routes with matching permissions', async () => {
      // Mock route authorization check
      routeAuthManager.checkRouteAuthorization.mockReturnValue(true);
      
      // Create a test route with route authorization
      app.get('/api/test/authorized', (req, res, next) => {
        req.user = { id: '123', roles: ['user'], permissions: ['read:test'] };
        next();
      }, (req, res) => {
        res.json({ success: true });
      });
      
      const response = await request(app)
        .get('/api/test/authorized')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
    
    it('should deny access to routes without matching permissions', async () => {
      // Mock route authorization check
      routeAuthManager.checkRouteAuthorization.mockReturnValue(false);
      
      // Create a test route with route authorization
      app.get('/api/test/unauthorized', (req, res, next) => {
        req.user = { id: '123', roles: ['user'], permissions: [] };
        next();
      }, (req, res) => {
        res.json({ success: true });
      });
      
      const response = await request(app)
        .get('/api/test/unauthorized')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
    });
  });

  describe('Dynamic Permission Control', () => {
    it('should check dynamic permissions correctly', () => {
      // Setup test
      const req = { 
        user: { 
          id: '123', 
          roles: ['user'], 
          permissions: ['read:test'] 
        } 
      };
      
      // Mock authorization service
      authorizationService.hasResourcePermission.mockImplementation((roles, resource, action) => {
        if (resource === 'test' && action === 'read' && roles.includes('user')) {
          return true;
        }
        return false;
      });
      
      // Import the function to test
      const { checkDynamicPermission } = require('../src/middleware/routeAuthMiddleware');
      
      // Test with valid permission
      const hasReadPermission = checkDynamicPermission(req, 'test', 'read');
      expect(hasReadPermission).toBe(true);
      
      // Test with invalid permission
      const hasWritePermission = checkDynamicPermission(req, 'test', 'write');
      expect(hasWritePermission).toBe(false);
    });
  });

  describe('RouteAuthorizationManager', () => {
    it('should add route permissions correctly', () => {
      // Import the class to test
      const { RouteAuthorizationManager } = require('../src/middleware/routeAuthMiddleware');
      
      // Create instance
      const manager = new RouteAuthorizationManager();
      
      // Add route permission
      const routePermission = {
        path: '/api/test',
        method: 'get',
        roles: ['user'],
        permissions: ['read:test']
      };
      
      manager.addRoutePermission(routePermission);
      
      // Get all permissions
      const permissions = manager.getRoutePermissions();
      
      expect(permissions).toHaveLength(1);
      expect(permissions[0]).toEqual(routePermission);
    });
    
    it('should update existing route permissions', () => {
      // Import the class to test
      const { RouteAuthorizationManager } = require('../src/middleware/routeAuthMiddleware');
      
      // Create instance
      const manager = new RouteAuthorizationManager();
      
      // Add initial route permission
      const initialPermission = {
        path: '/api/test',
        method: 'get',
        roles: ['user'],
        permissions: ['read:test']
      };
      
      manager.addRoutePermission(initialPermission);
      
      // Update with new permission
      const updatedPermission = {
        path: '/api/test',
        method: 'get',
        roles: ['user', 'admin'],
        permissions: ['read:test', 'write:test']
      };
      
      manager.addRoutePermission(updatedPermission);
      
      // Get all permissions
      const permissions = manager.getRoutePermissions();
      
      expect(permissions).toHaveLength(1);
      expect(permissions[0]).toEqual(updatedPermission);
    });
    
    it('should remove route permissions', () => {
      // Import the class to test
      const { RouteAuthorizationManager } = require('../src/middleware/routeAuthMiddleware');
      
      // Create instance
      const manager = new RouteAuthorizationManager();
      
      // Add route permission
      const routePermission = {
        path: '/api/test',
        method: 'get',
        roles: ['user'],
        permissions: ['read:test']
      };
      
      manager.addRoutePermission(routePermission);
      
      // Remove permission
      manager.removeRoutePermission('/api/test', 'get');
      
      // Get all permissions
      const permissions = manager.getRoutePermissions();
      
      expect(permissions).toHaveLength(0);
    });
  });
});
