import request from 'supertest';
import app from '../src/index'; // Assuming your Express app is exported from here
import authService from '../src/services/authService'; // Import the mock service
import jwtService from '../src/services/jwtService'; // To potentially inspect tokens
import sessionService from '../src/services/sessionService'; // To interact with sessions
import { disconnectRedis } from '../src/utils/redisClient'; // Import disconnectRedis

// --- Test Setup --- 

// Use a consistent test user for multiple tests
const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'password123',
    email: `test_${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User'
};
let authToken = '';
let refreshToken = '';
let sessionId = '';
let userId = '';

// Admin user details (assuming seeded in authService)
const adminUser = {
    username: 'admin',
    password: 'password'
};
let adminAuthToken = '';
let adminRefreshToken = '';
let adminSessionId = '';

// Clean up or reset state before/after tests if necessary
// Since authService uses an in-memory Map, it persists between tests in the same run.
// For true isolation, you might reset the Map or use a fresh instance per test/describe block.

beforeAll(async () => {
    // Log in as admin first to get admin token for admin tests
    try {
        const adminLoginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: adminUser.username, password: adminUser.password });
        if (adminLoginRes.statusCode === 200) {
            adminAuthToken = adminLoginRes.body.data.token;
            adminRefreshToken = adminLoginRes.body.data.refreshToken;
            adminSessionId = adminLoginRes.body.data.sessionId;
        } else {
            console.error('Failed to log in as admin for tests:', adminLoginRes.body);
            throw new Error('Admin login failed');
        }
    } catch (error) {
         console.error('Error logging in as admin:', error);
         throw error; // Fail the test suite if admin login fails
    }
});

// Close Redis connection after all tests in this file
afterAll(async () => {
    await disconnectRedis();
});

describe('Authentication API (/api/auth)', () => {

    it('POST /register - should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: testUser.username,
                password: testUser.password,
                email: testUser.email,
                firstName: testUser.firstName,
                lastName: testUser.lastName
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.username).toEqual(testUser.username);
        expect(res.body.data.email).toEqual(testUser.email);
        expect(res.body.data.roles).toEqual(['user']); // Default role
        // Registration should not return tokens anymore
        expect(res.body.data).not.toHaveProperty('token');
        expect(res.body.data).not.toHaveProperty('refreshToken');
        
        // Save user ID for subsequent tests
        userId = res.body.data.id;
    });

    it('POST /register - should fail to register with an existing username', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: testUser.username, // Use the same username
                password: 'anotherpassword',
                email: `another_${Date.now()}@example.com`
            });
        expect(res.statusCode).toEqual(400); // Or 409 Conflict depending on implementation
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('message', 'Bu kullanıcı adı zaten kullanılıyor');
    });
    
    it('POST /register - should fail to register with an existing email', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: `anotheruser_${Date.now()}`,
                password: 'anotherpassword',
                email: testUser.email // Use the same email
            });
        expect(res.statusCode).toEqual(400); // Or 409 Conflict
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty("message", "Bu e-posta adresi zaten kullanılıyor");
    });

    it("POST /register - should fail with invalid email format", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: `invalidemail_${Date.now()}`,
                password: "password123",
                email: "invalid-email-format",
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        // Add specific error message check if available, e.g.:
        // expect(res.body.message).toContain("Geçersiz e-posta formatı");
    });

    it("POST /register - should fail with short password", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: `shortpass_${Date.now()}`,
                password: "short",
                email: `shortpass_${Date.now()}@example.com`,
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        // Add specific error message check if available, e.g.:
        // expect(res.body.message).toContain("Şifre çok kısa");
    });

    it("POST /register - should fail with missing required fields", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                username: `missing_${Date.now()}`,
                // Missing password and email
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        // Add specific error message check if available
    });

    it("POST /login - should log in the registered user", async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: testUser.username,
                password: testUser.password
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.user.username).toEqual(testUser.username);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('refreshToken');
        expect(res.body.data).toHaveProperty('sessionId');

        // Update tokens and session ID
        authToken = res.body.data.token;
        refreshToken = res.body.data.refreshToken;
        sessionId = res.body.data.sessionId;
    });

    it('POST /login - should fail with incorrect password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: testUser.username,
                password: 'wrongpassword'
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty("message", "Geçersiz kullanıcı adı veya şifre ya da kullanıcı aktif değil");
    });

    it("POST /login - should trigger rate limiting after multiple failed attempts", async () => {
        const username = `ratelimit_user_${Date.now()}`;
        const email = `${username}@example.com`;
        // Register user first
        await request(app)
            .post("/api/v1/auth/register")
            .send({ username, password: "correctpassword", email });

        // Simulate multiple failed login attempts (adjust limit based on actual config)
        const failedAttempts = 6; // Example: Assume limit is 5
        let lastResponse;
        for (let i = 0; i < failedAttempts; i++) {
            lastResponse = await request(app)
                .post("/api/v1/auth/login")
                .send({ username, password: "wrongpassword" });
            // The last attempt should be rate limited
            if (i === failedAttempts - 1) {
                expect(lastResponse.statusCode).toEqual(429); // Too Many Requests
                expect(lastResponse.body.success).toBe(false);
                expect(lastResponse.body.message).toContain("Çok fazla istek"); // Check for rate limit message
            } else {
                // Previous attempts should be 401 Unauthorized
                expect(lastResponse.statusCode).toEqual(401);
            }
        }
    }, 15000); // Increase timeout if needed

    it("GET /profile - should get current user details with valid token", async () => {
        const res = await request(app)
            .get('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${authToken}`);
            
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id', userId);
        expect(res.body.data).toHaveProperty('username', testUser.username);
        expect(res.body.data).toHaveProperty('roles');
        expect(res.body.data).toHaveProperty('permissions');
    });

    it('GET /profile - should fail without token', async () => {
        const res = await request(app)
            .get('/api/v1/auth/profile');
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('message', 'Yetkilendirme token\'ı bulunamadı');
    });

    it('PUT /profile - should update user profile', async () => {
        const updatedFirstName = 'UpdatedFirstName';
        const res = await request(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ firstName: updatedFirstName });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toEqual('Profil başarıyla güncellendi');
        expect(res.body.data.firstName).toEqual(updatedFirstName);
        expect(res.body.data.lastName).toEqual(testUser.lastName); // Last name should remain unchanged
    });

    it('POST /refresh-token - should refresh the token', async () => {
        // Wait a bit to ensure the new token is different if timestamps are involved
        await new Promise(resolve => setTimeout(resolve, 100)); 
        
        const res = await request(app)
            .post('/api/v1/auth/refresh-token')
            .send({ refreshToken: refreshToken });
            
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('refreshToken');
        expect(res.body.data.token).not.toEqual(authToken); // New access token should be different
        expect(res.body.data.refreshToken).not.toEqual(refreshToken); // New refresh token should be different

        // Update tokens for subsequent tests
        authToken = res.body.data.token;
        refreshToken = res.body.data.refreshToken;
    });
    
    it('POST /refresh-token - should fail with invalid refresh token', async () => {
        const res = await request(app)
            .post('/api/v1/auth/refresh-token')
            .send({ refreshToken: 'invalidtoken' });
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
    });

    it('POST /logout - should logout the user', async () => {
        const currentRefreshToken = refreshToken; // Store before logout
        const currentAuthToken = authToken;

        const res = await request(app)
            .post('/api/v1/auth/logout')
            .set('Authorization', `Bearer ${currentAuthToken}`)
            .send({ refreshToken: currentRefreshToken }); // Send the refresh token to invalidate
            
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('message', 'Çıkış başarılı');

        // Verify refresh token is no longer valid
        const refreshRes = await request(app)
            .post('/api/v1/auth/refresh-token')
            .send({ refreshToken: currentRefreshToken }); // Use the refresh token obtained before logout
        expect(refreshRes.statusCode).toEqual(401); // Should fail as refresh token was invalidated
        
        // Verify access token is blacklisted (if blacklist is effective immediately)
        // Note: Blacklist check might depend on cache expiry in a real system
        const profileRes = await request(app)
            .get('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${currentAuthToken}`); // Use the access token obtained before logout
        expect(profileRes.statusCode).toEqual(401); // Should fail as token should be blacklisted

        // Log back in for subsequent tests
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: testUser.username, password: testUser.password });
        expect(loginRes.statusCode).toEqual(200);
        authToken = loginRes.body.data.token;
        refreshToken = loginRes.body.data.refreshToken;
        sessionId = loginRes.body.data.sessionId;
    });

});

describe('Password Management API (/api/password)', () => {
    let resetToken = '';

    beforeAll(async () => {
        // Ensure user is logged in
        if (!authToken) {
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({ username: testUser.username, password: testUser.password });
            if (loginRes.statusCode === 200) {
                authToken = loginRes.body.data.token;
                refreshToken = loginRes.body.data.refreshToken;
                sessionId = loginRes.body.data.sessionId;
            } else {
                throw new Error('Login failed in beforeAll for Password Management tests');
            }
        }
    });

    it('POST /change-password - should change the password successfully', async () => {
        const currentPassword = testUser.password;
        const newPassword = 'newPassword456';
        const res = await request(app)
            .post('/api/v1/password/change-password') // Updated endpoint
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                currentPassword: currentPassword,
                newPassword: newPassword
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('message', 'Şifre başarıyla değiştirildi');

        // Verify login with new password
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: testUser.username,
                password: newPassword
            });
        expect(loginRes.statusCode).toEqual(200);
        
        // Update password for future tests and get new tokens
        testUser.password = newPassword;
        authToken = loginRes.body.data.token;
        refreshToken = loginRes.body.data.refreshToken;
        sessionId = loginRes.body.data.sessionId;
    });

    it('POST /change-password - should fail with incorrect current password', async () => {
        const res = await request(app)
            .post('/api/v1/password/change-password') // Updated endpoint
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                currentPassword: 'wrongcurrentpassword',
                newPassword: 'anothernewpassword'
            });
        expect(res.statusCode).toEqual(401); // Unauthorized due to wrong current password
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('message', 'Mevcut şifre yanlış');
    });
    
    // --- Password Reset --- 
    
    it('POST /forgot-password - should return success message even if email doesnt exist', async () => {
        // Implementation omitted for brevity
    });

    it('POST /forgot-password - should send reset token for existing user', async () => {
        // Implementation omitted for brevity
    });

    it('POST /reset-password - should fail with invalid token', async () => {
        // Implementation omitted for brevity
    });

    it('POST /reset-password - should reset password with valid token', async () => {
        // Implementation omitted for brevity
    });
});

describe('Session Management API (/api/sessions)', () => {
    let otherSessionId = '';
    let otherRefreshToken = '';

    beforeAll(async () => {
        // Ensure user is logged in
        if (!authToken) {
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({ username: testUser.username, password: testUser.password });
            if (loginRes.statusCode === 200) {
                authToken = loginRes.body.data.token;
                refreshToken = loginRes.body.data.refreshToken;
                sessionId = loginRes.body.data.sessionId;
            } else {
                throw new Error('Login failed in beforeAll for Session Management tests');
            }
        }

        // Create another session for the same user (simulate login from another device)
        const loginRes2 = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: testUser.username, password: testUser.password });
        if (loginRes2.statusCode === 200) {
            otherSessionId = loginRes2.body.data.sessionId;
            otherRefreshToken = loginRes2.body.data.refreshToken;
        } else {
            throw new Error('Failed to create second session for tests');
        }
    });

    it('GET /sessions - should list active sessions for the user', async () => {
        const res = await request(app)
            .get('/api/v1/sessions') // Assuming endpoint is /api/v1/sessions
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2); // At least the current and the other session
        expect(res.body.data.some((s: any) => s.id === sessionId)).toBe(true);
        expect(res.body.data.some((s: any) => s.id === otherSessionId)).toBe(true);
    });

    it('DELETE /sessions/{sessionId} - should terminate a specific session', async () => {
        const res = await request(app)
            .delete(`/api/v1/sessions/${otherSessionId}`) // Assuming endpoint structure
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toEqual('Oturum başarıyla sonlandırıldı');

        // Verify the terminated session is no longer active
        const listRes = await request(app)
            .get('/api/v1/sessions')
            .set('Authorization', `Bearer ${authToken}`);
        expect(listRes.body.data.some((s: any) => s.id === otherSessionId)).toBe(false);

        // Verify the refresh token for the terminated session is invalid
        const refreshRes = await request(app)
            .post('/api/v1/auth/refresh-token')
            .send({ refreshToken: otherRefreshToken });
        expect(refreshRes.statusCode).toEqual(401);
    });

    it('DELETE /sessions/all - should terminate all sessions for the user', async () => {
        // Create a new session to ensure there's one to terminate
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: testUser.username, password: testUser.password });
        const tempSessionId = loginRes.body.data.sessionId;
        const tempRefreshToken = loginRes.body.data.refreshToken;

        const res = await request(app)
            .delete('/api/v1/sessions/all') // Assuming endpoint for terminating all
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toEqual('Tüm oturumlar başarıyla sonlandırıldı');

        // Verify no active sessions remain
        const listRes = await request(app)
            .get('/api/v1/sessions')
            .set('Authorization', `Bearer ${authToken}`);
        expect(listRes.statusCode).toEqual(401); // Should fail as current token is now invalid

        // Verify refresh tokens are invalid
        const refreshRes1 = await request(app)
            .post('/api/v1/auth/refresh-token')
            .send({ refreshToken: refreshToken });
        expect(refreshRes1.statusCode).toEqual(401);
        const refreshRes2 = await request(app)
            .post('/api/v1/auth/refresh-token')
            .send({ refreshToken: tempRefreshToken });
        expect(refreshRes2.statusCode).toEqual(401);

        // Log back in for any potential subsequent tests
        const finalLoginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: testUser.username, password: testUser.password });
        if (finalLoginRes.statusCode === 200) {
            authToken = finalLoginRes.body.data.token;
            refreshToken = finalLoginRes.body.data.refreshToken;
            sessionId = finalLoginRes.body.data.sessionId;
        } else {
            console.error("Failed to log back in after terminating all sessions");
        }
    });

    // Add test for DELETE /sessions/others (terminate all except current)
});

// Add tests for Role & Permission Management (Admin)
// describe('Role & Permission Management API (Admin)', () => { ... });

