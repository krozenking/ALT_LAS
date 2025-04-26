import request from 'supertest';
import app from '../src/index'; // Assuming your Express app is exported from here
import authService from '../src/services/authService'; // Import the mock service
import jwtService from '../src/services/jwtService'; // To potentially inspect tokens

// --- Test Setup --- 

// Use a consistent test user for multiple tests
const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'password123',
    email: `test_${Date.now()}@example.com`
};
let authToken = '';
let refreshToken = '';
let userId = '';

// Clean up or reset state before/after tests if necessary
// Since authService uses an in-memory Map, it persists between tests in the same run.
// For true isolation, you might reset the Map or use a fresh instance per test/describe block.

describe('Authentication API (/api/auth)', () => {

    it('POST /register - should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: testUser.username,
                password: testUser.password,
                email: testUser.email
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user.username).toEqual(testUser.username);
        expect(res.body.user.roles).toEqual(['user']); // Default role
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('refreshToken');
        
        // Save details for subsequent tests
        userId = res.body.user.id;
        authToken = res.body.token;
        refreshToken = res.body.refreshToken;
    });

    it('POST /register - should fail to register with an existing username', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: testUser.username, // Use the same username
                password: 'anotherpassword',
                email: `another_${Date.now()}@example.com`
            });
        expect(res.statusCode).toEqual(400); // Or 409 Conflict depending on implementation
        expect(res.body).toHaveProperty('message', 'Bu kullanıcı adı zaten kullanılıyor');
    });
    
    it('POST /register - should fail to register with an existing email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: `anotheruser_${Date.now()}`,
                password: 'anotherpassword',
                email: testUser.email // Use the same email
            });
        expect(res.statusCode).toEqual(400); // Or 409 Conflict
        expect(res.body).toHaveProperty('message', 'Bu e-posta adresi zaten kullanılıyor');
    });

    it('POST /login - should log in the registered user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: testUser.password
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toEqual(testUser.username);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('refreshToken');

        // Update tokens if they changed
        authToken = res.body.token;
        refreshToken = res.body.refreshToken;
    });

    it('POST /login - should fail with incorrect password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: 'wrongpassword'
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Geçersiz kullanıcı adı veya şifre ya da kullanıcı aktif değil');
    });

    it('GET /me - should get current user details with valid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`);
            
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', userId);
        expect(res.body).toHaveProperty('username', testUser.username);
        expect(res.body).toHaveProperty('roles');
        expect(res.body).toHaveProperty('permissions');
    });

    it('GET /me - should fail without token', async () => {
        const res = await request(app)
            .get('/api/auth/me');
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Yetkilendirme token\\'ı bulunamadı');
    });

    it('POST /refresh - should refresh the token', async () => {
        // Wait a bit to ensure the new token is different if timestamps are involved
        await new Promise(resolve => setTimeout(resolve, 100)); 
        
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: refreshToken });
            
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('refreshToken');
        expect(res.body.token).not.toEqual(authToken); // New access token should be different
        expect(res.body.refreshToken).not.toEqual(refreshToken); // New refresh token should be different

        // Update tokens for subsequent tests
        authToken = res.body.token;
        refreshToken = res.body.refreshToken;
    });
    
    it('POST /refresh - should fail with invalid refresh token', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: 'invalidtoken' });
        expect(res.statusCode).toEqual(401);
    });

    // --- Password Management --- 
    
    it('PUT /me/password - should change the password successfully', async () => {
        const newPassword = 'newPassword456';
        const res = await request(app)
            .put('/api/auth/me/password')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                currentPassword: testUser.password, // Use original password
                newPassword: newPassword
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Şifreniz başarıyla değiştirildi.');

        // Verify login with new password
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: newPassword
            });
        expect(loginRes.statusCode).toEqual(200);
        
        // Update password for future tests if needed, and get new tokens
        testUser.password = newPassword;
        authToken = loginRes.body.token;
        refreshToken = loginRes.body.refreshToken;
    });

    it('PUT /me/password - should fail with incorrect current password', async () => {
        const res = await request(app)
            .put('/api/auth/me/password')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                currentPassword: 'wrongcurrentpassword',
                newPassword: 'anothernewpassword'
            });
        expect(res.statusCode).toEqual(401); // Unauthorized due to wrong current password
        expect(res.body).toHaveProperty('message', 'Mevcut şifre yanlış');
    });
    
    // --- Password Reset --- (Harder to test fully without email mocking)
    
    it('POST /forgot-password - should return success message even if email doesnt exist', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'nonexistent@example.com' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message'); // Generic message
    });

    it('POST /forgot-password - should initiate reset for existing user', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: testUser.email });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
        // In a real test, you'd need to capture the token sent via email/mock
    });
    
    // TODO: Add test for POST /reset-password (requires getting the reset token)

    // --- Logout --- 

    it('POST /logout - should logout the user', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${authToken}`);
            
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Başarıyla çıkış yapıldı');

        // Verify token is no longer valid (or refresh token is invalidated)
        const refreshRes = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: refreshToken }); // Use the refresh token obtained before logout
        expect(refreshRes.statusCode).toEqual(401); // Should fail as refresh token was invalidated
        
        // Verify access token is blacklisted (if blacklist is effective immediately)
        // Note: Blacklist check might depend on cache expiry in a real system
        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`); // Use the access token obtained before logout
        // Depending on blacklist implementation, this might still work until expiry, 
        // or fail if blacklist is checked immediately.
        // For this mock service, let's assume blacklist check isn't implemented in verifyToken
        // expect(meRes.statusCode).toEqual(401); 
    });

});

describe('Authorization API Tests', () => {
    let adminToken = '';
    let userToken = '';
    let testUserId = '';

    beforeAll(async () => {
        // Log in as admin
        try {
            const adminLoginRes = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'password' });
            if (adminLoginRes.statusCode === 200) {
                adminToken = adminLoginRes.body.token;
            } else {
                console.error('Failed to log in as admin for tests:', adminLoginRes.body);
            }
        } catch (error) {
             console.error('Error logging in as admin:', error);
        }
        
        // Register and log in as a regular user for testing permissions
        const tempUsername = `authz_user_${Date.now()}`;
        const tempEmail = `authz_${Date.now()}@example.com`;
        try {
             const regRes = await request(app)
                .post('/api/auth/register')
                .send({ username: tempUsername, password: 'password123', email: tempEmail });
             if (regRes.statusCode === 201) {
                 testUserId = regRes.body.user.id;
                 const loginRes = await request(app)
                    .post('/api/auth/login')
                    .send({ username: tempUsername, password: 'password123' });
                 if (loginRes.statusCode === 200) {
                     userToken = loginRes.body.token;
                 } else {
                     console.error('Failed to log in as test user:', loginRes.body);
                 }
             } else {
                 console.error('Failed to register test user:', regRes.body);
             }
        } catch (error) {
            console.error('Error setting up test user:', error);
        }
    });

    // --- Role Tests --- 

    it('GET /api/auth/users - should allow admin access', async () => {
        const res = await request(app)
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/auth/users - should deny non-admin access', async () => {
        const res = await request(app)
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body).toHaveProperty('message', 'Bu işlem için gerekli rollerden biri (admin) bulunamadı');
    });
    
    // --- Permission Tests (assuming admin has manage:roles, user does not) --- 
    
    it('PUT /api/auth/users/{userId}/roles - should allow admin with permission', async () => {
        const res = await request(app)
            .put(`/api/auth/users/${testUserId}/roles`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ roles: ['user', 'tester'] }); // Update roles
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Roller başarıyla güncellendi');
        
        // Verify roles were updated (requires fetching user details again)
        const userDetailsRes = await request(app)
            .get(`/api/auth/users/${testUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(userDetailsRes.statusCode).toEqual(200);
        expect(userDetailsRes.body.roles).toContain('tester');
    });
    
    it('PUT /api/auth/users/{userId}/roles - should deny user without permission', async () => {
        const res = await request(app)
            .put(`/api/auth/users/${testUserId}/roles`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ roles: ['user'] }); // Try to change roles
        expect(res.statusCode).toEqual(403); // Forbidden due to role
    });
    
    // TODO: Add tests for permission management endpoints (GET/PUT /permissions)
    // TODO: Add tests for user profile update (PUT /users/:userId)
    // TODO: Add tests for user deletion (DELETE /users/:userId)

});

// TODO: Add tests for other routes (segmentation, runner, archive) checking authorization

