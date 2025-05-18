# Mock Servis Altyapısı Kurulum Dosyası

Bu dosya, ALT_LAS projesinin yeni kullanıcı arayüzü (UI) geliştirme planında kullanılacak mock servis altyapısının kurulumu için gerekli adımları içermektedir.

## 1. Proje Yapılandırması

```javascript
// package.json
{
  "name": "alt-las-mock-services",
  "version": "1.0.0",
  "description": "Mock servisler ve API simülasyonu için altyapı",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "msw": "^1.2.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "swagger-ui-express": "^4.6.3",
    "yamljs": "^0.3.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  }
}
```

## 2. Proje Yapısı

```
/mock_servisler
  /src
    /handlers
      auth.js
      users.js
      tasks.js
      notifications.js
      files.js
    /models
      user.js
      task.js
      notification.js
      file.js
    /utils
      response.js
      error.js
    index.js
    server.js
  /api
    openapi.yaml
  /tests
    auth.test.js
    users.test.js
    tasks.test.js
  package.json
  README.md
```

## 3. OpenAPI Şema Yapısı

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: ALT_LAS API
  description: ALT_LAS projesi için API dokümantasyonu
  version: 1.0.0
servers:
  - url: http://localhost:3000/api
    description: Geliştirme sunucusu
  - url: https://api.alt-las.example.com
    description: Üretim sunucusu
tags:
  - name: auth
    description: Kimlik doğrulama işlemleri
  - name: users
    description: Kullanıcı yönetimi işlemleri
  - name: tasks
    description: Görev yönetimi işlemleri
  - name: notifications
    description: Bildirim sistemi işlemleri
  - name: files
    description: Dosya yönetimi işlemleri
paths:
  /auth/login:
    post:
      tags:
        - auth
      summary: Kullanıcı girişi
      description: Kullanıcı adı ve şifre ile giriş yapma
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - username
                - password
              properties:
                username:
                  type: string
                  example: johndoe
                password:
                  type: string
                  format: password
                  example: "********"
      responses:
        '200':
          description: Başarılı giriş
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: Geçersiz kimlik bilgileri
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  /users:
    get:
      tags:
        - users
      summary: Kullanıcıları listele
      description: Tüm kullanıcıları listeler
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          description: Sayfa numarası
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          description: Sayfa başına kayıt sayısı
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          description: Yetkisiz erişim
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  /tasks:
    get:
      tags:
        - tasks
      summary: Görevleri listele
      description: Tüm görevleri listeler
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          description: Sayfa numarası
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          description: Sayfa başına kayıt sayısı
          schema:
            type: integer
            default: 10
        - name: status
          in: query
          description: Görev durumu
          schema:
            type: string
            enum: [pending, in_progress, completed, cancelled]
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Task'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          description: Yetkisiz erişim
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        username:
          type: string
          example: "johndoe"
        email:
          type: string
          format: email
          example: "john.doe@example.com"
        firstName:
          type: string
          example: "John"
        lastName:
          type: string
          example: "Doe"
        role:
          type: string
          enum: [admin, manager, user]
          example: "user"
        createdAt:
          type: string
          format: date-time
          example: "2023-01-01T00:00:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2023-01-01T00:00:00Z"
    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        title:
          type: string
          example: "Rapor hazırlama"
        description:
          type: string
          example: "Aylık satış raporu hazırlanacak"
        status:
          type: string
          enum: [pending, in_progress, completed, cancelled]
          example: "pending"
        priority:
          type: string
          enum: [low, medium, high, urgent]
          example: "medium"
        assignedTo:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        createdBy:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        dueDate:
          type: string
          format: date-time
          example: "2023-01-31T23:59:59Z"
        createdAt:
          type: string
          format: date-time
          example: "2023-01-01T00:00:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2023-01-01T00:00:00Z"
    Notification:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        userId:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        title:
          type: string
          example: "Yeni görev atandı"
        message:
          type: string
          example: "Size yeni bir görev atandı: Rapor hazırlama"
        type:
          type: string
          enum: [task, system, message]
          example: "task"
        read:
          type: boolean
          example: false
        createdAt:
          type: string
          format: date-time
          example: "2023-01-01T00:00:00Z"
    Pagination:
      type: object
      properties:
        page:
          type: integer
          example: 1
        limit:
          type: integer
          example: 10
        totalItems:
          type: integer
          example: 100
        totalPages:
          type: integer
          example: 10
    Error:
      type: object
      properties:
        code:
          type: string
          example: "UNAUTHORIZED"
        message:
          type: string
          example: "Yetkisiz erişim"
        details:
          type: object
          example: null
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## 4. Mock Servis Handlers

```javascript
// src/handlers/auth.js
const { rest } = require('msw');
const { createSuccessResponse, createErrorResponse } = require('../utils/response');
const { users } = require('../models/user');

const authHandlers = [
  // Login endpoint
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { username, password } = req.body;

    // Simulate authentication
    const user = users.find(u => u.username === username);
    
    if (!user || user.password !== password) {
      return res(
        ctx.status(401),
        ctx.json(createErrorResponse('UNAUTHORIZED', 'Geçersiz kullanıcı adı veya şifre'))
      );
    }

    // Create a token (in a real app, this would be a JWT)
    const token = `mock-jwt-token-${user.id}`;

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    return res(
      ctx.status(200),
      ctx.json(createSuccessResponse({
        token,
        user: userWithoutPassword
      }))
    );
  }),

  // Logout endpoint
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(createSuccessResponse({ message: 'Başarıyla çıkış yapıldı' }))
    );
  }),

  // Refresh token endpoint
  rest.post('/api/auth/refresh-token', (req, res, ctx) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('BAD_REQUEST', 'Refresh token gerekli'))
      );
    }

    // In a real app, validate the refresh token
    // For mock, just return a new token
    const newToken = `mock-jwt-token-refreshed-${Date.now()}`;

    return res(
      ctx.status(200),
      ctx.json(createSuccessResponse({
        token: newToken
      }))
    );
  })
];

module.exports = authHandlers;
```

```javascript
// src/handlers/users.js
const { rest } = require('msw');
const { createSuccessResponse, createErrorResponse } = require('../utils/response');
const { users } = require('../models/user');

const userHandlers = [
  // Get all users
  rest.get('/api/users', (req, res, ctx) => {
    // Get pagination parameters
    const page = parseInt(req.url.searchParams.get('page')) || 1;
    const limit = parseInt(req.url.searchParams.get('limit')) || 10;
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    // Remove passwords from user objects
    const sanitizedUsers = paginatedUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return res(
      ctx.status(200),
      ctx.json(createSuccessResponse({
        data: sanitizedUsers,
        pagination: {
          page,
          limit,
          totalItems: users.length,
          totalPages: Math.ceil(users.length / limit)
        }
      }))
    );
  }),

  // Get user by ID
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res(
        ctx.status(404),
        ctx.json(createErrorResponse('NOT_FOUND', 'Kullanıcı bulunamadı'))
      );
    }
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return res(
      ctx.status(200),
      ctx.json(createSuccessResponse(userWithoutPassword))
    );
  }),

  // Create user
  rest.post('/api/users', (req, res, ctx) => {
    const { username, email, firstName, lastName, role, password } = req.body;
    
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('BAD_REQUEST', 'Bu kullanıcı adı zaten kullanılıyor'))
      );
    }
    
    if (users.some(u => u.email === email)) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('BAD_REQUEST', 'Bu e-posta adresi zaten kullanılıyor'))
      );
    }
    
    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      firstName,
      lastName,
      role: role || 'user',
      password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to users array (in a real app, this would be saved to a database)
    users.push(newUser);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res(
      ctx.status(201),
      ctx.json(createSuccessResponse(userWithoutPassword))
    );
  }),

  // Update user
  rest.put('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { username, email, firstName, lastName, role } = req.body;
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json(createErrorResponse('NOT_FOUND', 'Kullanıcı bulunamadı'))
      );
    }
    
    // Check if username or email already exists (excluding current user)
    if (username && users.some(u => u.username === username && u.id !== id)) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('BAD_REQUEST', 'Bu kullanıcı adı zaten kullanılıyor'))
      );
    }
    
    if (email && users.some(u => u.email === email && u.id !== id)) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('BAD_REQUEST', 'Bu e-posta adresi zaten kullanılıyor'))
      );
    }
    
    // Update user
    const updatedUser = {
      ...users[userIndex],
      username: username || users[userIndex].username,
      email: email || users[userIndex].email,
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      role: role || users[userIndex].role,
      updatedAt: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    return res(
      ctx.status(200),
      ctx.json(createSuccessResponse(userWithoutPassword))
    );
  }),

  // Delete user
  rest.delete('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json(createErrorResponse('NOT_FOUND', 'Kullanıcı bulunamadı'))
      );
    }
    
    // Remove user from array
    users.splice(userIndex, 1);
    
    return res(
      ctx.status(200),
      ctx.json(createSuccessResponse({ message: 'Kullanıcı başarıyla silindi' }))
    );
  })
];

module.exports = userHandlers;
```

## 5. Mock Veri Modelleri

```javascript
// src/models/user.js
// Mock user data
const users = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    password: 'admin123', // In a real app, this would be hashed
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    username: 'manager',
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
    password: 'manager123',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  },
  {
    id: 'user-3',
    username: 'user',
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
    password: 'user123',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z'
  }
];

module.exports = { users };
```

```javascript
// src/models/task.js
// Mock task data
const tasks = [
  {
    id: 'task-1',
    title: 'Rapor hazırlama',
    description: 'Aylık satış raporu hazırlanacak',
    status: 'pending',
    priority: 'high',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    dueDate: '2023-01-31T23:59:59Z',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-01-15T10:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Müşteri görüşmesi',
    description: 'ABC Şirketi ile yeni proje hakkında görüşme',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    dueDate: '2023-01-20T14:00:00Z',
    createdAt: '2023-01-10T09:00:00Z',
    updatedAt: '2023-01-16T11:30:00Z'
  },
  {
    id: 'task-3',
    title: 'Yazılım güncellemesi',
    description: 'Sistem yazılımının güncellenmesi',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'user-3',
    createdBy: 'user-2',
    dueDate: '2023-01-18T17:00:00Z',
    createdAt: '2023-01-12T13:00:00Z',
    updatedAt: '2023-01-17T16:45:00Z'
  }
];

module.exports = { tasks };
```

## 6. Yardımcı Fonksiyonlar

```javascript
// src/utils/response.js
/**
 * Create a success response object
 * @param {*} data - Response data
 * @returns {Object} Success response object
 */
const createSuccessResponse = (data) => {
  return {
    success: true,
    data
  };
};

/**
 * Create an error response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {*} details - Error details
 * @returns {Object} Error response object
 */
const createErrorResponse = (code, message, details = null) => {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
};

module.exports = {
  createSuccessResponse,
  createErrorResponse
};
```

```javascript
// src/utils/error.js
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} details - Error details
   */
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = {
  ApiError
};
```

## 7. Ana Uygulama Dosyaları

```javascript
// src/index.js
const { setupServer } = require('msw/node');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Import handlers
const authHandlers = require('./handlers/auth');
const userHandlers = require('./handlers/users');
const taskHandlers = require('./handlers/tasks');
// Import other handlers as needed

// Combine all handlers
const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...taskHandlers,
  // Add other handlers here
];

// Create MSW server
const server = setupServer(...handlers);

// Start MSW server
server.listen({ onUnhandledRequest: 'bypass' });
console.log('🔶 Mock Service Worker server started');

// Create Express server for Swagger UI
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load OpenAPI spec
const swaggerDocument = YAML.load(path.resolve(__dirname, '../api/openapi.yaml'));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Swagger UI available at http://localhost:${PORT}/api-docs`);
});

// Handle shutdown
process.on('SIGINT', () => {
  server.close();
  process.exit();
});
```

## 8. Kurulum ve Çalıştırma Talimatları

1. Proje dizinine geçin:
   ```bash
   cd /home/ubuntu/mock_servisler
   ```

2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```

3. Mock servisleri başlatın:
   ```bash
   npm start
   ```

4. Swagger UI'a erişin:
   ```
   http://localhost:3000/api-docs
   ```

5. Geliştirme modunda çalıştırmak için:
   ```bash
   npm run dev
   ```

6. Testleri çalıştırmak için:
   ```bash
   npm test
   ```
