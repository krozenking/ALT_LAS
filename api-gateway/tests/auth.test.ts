import request from 'supertest';
import app from '../src/index'; // Assuming your Express app is exported from here
import authService from '../src/services/authService'; // Import the mock service
import jwtService from '../src/services/jwtService'; // To potentially inspect tokens
import sessionService from '../src/services/sessionService'; // To interact with sessions

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
        const res = await request(app)
            .post('/api/v1/password/forgot-password') // Updated endpoint
            .send({ email: 'nonexistent@example.com' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('message'); // Generic message
    });

    it('POST /forgot-password - should initiate reset for existing user and return token (for testing)', async () => {
        const res = await request(app)
            .post('/api/v1/password/forgot-password') // Updated endpoint
            .send({ email: testUser.email });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('message');
        // In dev/test, we might return the token for easier testing
        expect(res.body.data).toHaveProperty('resetToken'); 
        resetToken = res.body.data.resetToken;
    });
    
    it('POST /reset-password - should reset password with valid token', async () => {
        const newPassword = 'resetPassword789';
        expect(resetToken).not.toBe(''); // Ensure reset token was obtained

        const res = await request(app)
            .post('/api/v1/password/reset-password') // Updated endpoint
            .send({ 
                resetToken: resetToken,
                newPassword: newPassword
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('message', 'Şifre başarıyla sıfırlandı');

        // Verify login with the newly reset password
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: testUser.username,
                password: newPassword
            });
        expect(loginRes.statusCode).toEqual(200);

        // Update password and tokens
        testUser.password = newPassword;
        authToken = loginRes.body.data.token;
        refreshToken = loginRes.body.data.refreshToken;
        sessionId = loginRes.body.data.sessionId;
    });

    it('POST /reset-password - should fail with invalid token', async () => {
        const res = await request(app)
            .post('/api/v1/password/reset-password') // Updated endpoint
            .send({ 
                resetToken: 'invalidResetToken',
                newPassword: 'anotherPassword'
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('message', 'Geçersiz veya süresi dolmuş şifre sıfırlama tokenı');
    });

});

describe('User Roles & Permissions API (/api/user-roles)', () => {

    beforeAll(async () => {
        // Ensure user is logged in
        if (!authToken) {
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({ username: testUser.username, password: testUser.password });
            if (loginRes.statusCode === 200) {
                authToken = loginRes.body.data.token;
            } else {
                throw new Error('Login failed in beforeAll for User Roles tests');
            }
        }
        // Ensure admin is logged in
        if (!adminAuthToken) {
             const adminLoginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({ username: adminUser.username, password: adminUser.password });
            if (adminLoginRes.statusCode === 200) {
                adminAuthToken = adminLoginRes.body.data.token;
            } else {
                throw new Error('Admin login failed in beforeAll for User Roles tests');
            }
        }
    });

    it('GET /my-roles - should get current user roles', async () => {
        const res = await request(app)
            .get('/api/user-roles/my-roles')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('roles');
        expect(Array.isArray(res.body.data.roles)).toBe(true);
        // Check if the default 'user' role exists
        expect(res.body.data.roles.some((r: any) => r.name === 'user')).toBe(true);
    });

    it('GET /my-permissions - should get current user permissions', async () => {
        const res = await request(app)
            .get('/api/user-roles/my-permissions')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('permissions');
        expect(Array.isArray(res.body.data.permissions)).toBe(true);
        // User role might not have direct permissions initially
    });

    it('POST /check-permission - should check if user has a specific permission (negative case)', async () => {
        const res = await request(app)
            .post('/api/user-roles/check-permission')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ permission: 'nonexistent:permission' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.hasPermission).toBe(false);
    });

    it("POST /check-permission - should check if admin has admin permission (positive case)", async () => {
        // Assuming admin role implicitly has certain permissions or a specific one like 'admin:access'
        const res = await request(app)
            .post("/api/user-roles/check-permission")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ permission: "admin:manage:users" }); // Check a typical admin permission
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        // This depends on whether the 'admin' role actually has this permission assigned
        // Adjust the expected value based on actual service implementation
        expect(res.body.data.hasPermission).toBe(true); 
    });

    // --- Admin Management --- 

    it('GET /users/{userId}/roles - should allow admin to get user roles', async () => {
        const res = await request(app)
            .get(`/api/user-roles/users/${userId}/roles`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.userId).toEqual(userId);
        expect(res.body.data.roles.some((r: any) => r.name === 'user')).toBe(true);
    });

    it('GET /users/{userId}/roles - should deny non-admin access', async () => {
        const res = await request(app)
            .get(`/api/user-roles/users/${userId}/roles`)
            .set('Authorization', `Bearer ${authToken}`); // Use regular user token
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body.success).toBe(false);
    });

    it('PUT /users/{userId}/roles - should allow admin to update user roles', async () => {
        // Add a new role first (requires admin permission)
        const newRoleName = `testrole_${Date.now()}`;
        await request(app)
            .post('/api/v1/auth/roles')
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .send({ name: newRoleName, permissions: [] });

        const res = await request(app)
            .put(`/api/user-roles/users/${userId}/roles`)
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .send({ roles: ['user', newRoleName] }); // Update roles
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toEqual('Kullanıcı rolleri başarıyla güncellendi');
        expect(res.body.data.roles).toContain(newRoleName);
        expect(res.body.data.roles).toContain('user');

        // Verify roles were updated by fetching again
        const userDetailsRes = await request(app)
            .get(`/api/user-roles/users/${userId}/roles`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(userDetailsRes.statusCode).toEqual(200);
        expect(userDetailsRes.body.data.roles.some((r: any) => r.name === newRoleName)).toBe(true);
    });

    it('PUT /users/{userId}/roles - should deny non-admin access', async () => {
        const res = await request(app)
            .put(`/api/user-roles/users/${userId}/roles`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ roles: ['user'] }); // Try to change roles
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body.success).toBe(false);
    });

    // TODO: Add tests for GET/PUT /users/{userId}/permissions
    // TODO: Add tests for check-resource-permission

});

describe('Admin User Management API (/api/v1/auth/users)', () => {
    let tempUserId = '';

    beforeAll(async () => {
        // Ensure admin is logged in
        if (!adminAuthToken) {
             const adminLoginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({ username: adminUser.username, password: adminUser.password });
            if (adminLoginRes.statusCode === 200) {
                adminAuthToken = adminLoginRes.body.data.token;
            } else {
                throw new Error('Admin login failed in beforeAll for Admin User Management tests');
            }
        }
        // Create a temporary user for manipulation
        const tempUsername = `temp_admin_test_${Date.now()}`;
        const tempEmail = `temp_admin_${Date.now()}@example.com`;
        const regRes = await request(app)
            .post('/api/v1/auth/register')
            .send({ username: tempUsername, password: 'password123', email: tempEmail });
        if (regRes.statusCode === 201) {
            tempUserId = regRes.body.data.id;
        } else {
            throw new Error('Failed to create temp user for admin tests');
        }
    });

    it('GET /users - should allow admin to list users', async () => {
        const res = await request(app)
            .get('/api/v1/auth/users')
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2); // admin + testUser + tempUser
    });

    it("GET /users - should deny non-admin access", async () => {
        const res = await request(app)
            .get("/api/v1/auth/users")
            .set("Authorization", `Bearer ${authToken}`); // Use regular user token
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body.success).toBe(false);
    });

    it("GET /users/{userId} - should deny non-admin access", async () => {
        const res = await request(app)
            .get(`/api/v1/auth/users/${userId}`)
            .set("Authorization", `Bearer ${authToken}`); // Use regular user token
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body.success).toBe(false);
    });

    it("PUT /users/{userId} - should deny non-admin access", async () => {
        const res = await request(app)
            .put(`/api/v1/auth/users/${userId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ firstName: "AttemptUpdate" });
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body.success).toBe(false);
    });

    it("DELETE /users/{userId} - should deny non-admin access", async () => {
        // Create a temporary user for deletion attempt
        const tempUsername = `temp_nonadmin_delete_${Date.now()}`;
        const tempEmail = `${tempUsername}@example.com`;
        const regRes = await request(app)
            .post("/api/v1/auth/register")
            .send({ username: tempUsername, password: "password123", email: tempEmail });
        const tempUserIdToDelete = regRes.body.data.id;

        const res = await request(app)
            .delete(`/api/v1/auth/users/${tempUserIdToDelete}`)
            .set("Authorization", `Bearer ${authToken}`); // Use regular user token
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body.success).toBe(false);

        // Clean up: Admin deletes the user
        await request(app)
            .delete(`/api/v1/auth/users/${tempUserIdToDelete}`)
            .set("Authorization", `Bearer ${adminAuthToken}`);
    });

    it("GET /users/{userId} - should allow admin to get specific user details", async () => {
        const res = await request(app)
            .get(`/api/v1/auth/users/${tempUserId}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toEqual(tempUserId);
    });

    it('PUT /users/{userId} - should allow admin to update user details', async () => {
        const updatedFirstName = 'AdminUpdated';
        const res = await request(app)
            .put(`/api/v1/auth/users/${tempUserId}`)
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .send({ firstName: updatedFirstName, isActive: false });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.firstName).toEqual(updatedFirstName);
        expect(res.body.data.isActive).toBe(false);
    });

    it('DELETE /users/{userId} - should allow admin to delete a user', async () => {
        const res = await request(app)
            .delete(`/api/v1/auth/users/${tempUserId}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toEqual('Kullanıcı başarıyla silindi');

        // Verify user is deleted
        const getRes = await request(app)
            .get(`/api/v1/auth/users/${tempUserId}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(getRes.statusCode).toEqual(404); // Not Found
    });

    it('DELETE /users/{userId} - should prevent deleting the admin user', async () => {
        // Find admin user ID
        const usersRes = await request(app).get('/api/v1/auth/users').set('Authorization', `Bearer ${adminAuthToken}`);
        const admin = usersRes.body.data.find((u: any) => u.username === 'admin');
        expect(admin).toBeDefined();

        const res = await request(app)
            .delete(`/api/v1/auth/users/${admin.id}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body.message).toEqual('Admin kullanıcısı silinemez.');
    });

});

describe('Admin Roles & Permissions Management API (/api/v1/auth/roles, /api/v1/auth/permissions)', () => {
    const newRoleName = `testrole_${Date.now()}`;
    const newPermissionName = `test:permission_${Date.now()}`;

    beforeAll(async () => {
        // Ensure admin is logged in
        if (!adminAuthToken) {
             const adminLoginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({ username: adminUser.username, password: adminUser.password });
            if (adminLoginRes.statusCode === 200) {
                adminAuthToken = adminLoginRes.body.data.token;
            } else {
                throw new Error('Admin login failed in beforeAll for Roles/Permissions tests');
            }
        }
    });

    // Permissions
    it("POST /permissions - should deny non-admin access", async () => {
        const res = await request(app)
            .post("/api/v1/auth/permissions")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "nonadmin_perm", description: "Attempt" });
        expect(res.statusCode).toEqual(403);
    });

    it("GET /permissions - should deny non-admin access", async () => {
        const res = await request(app)
            .get("/api/v1/auth/permissions")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(403);
    });

    it("DELETE /permissions/{permissionName} - should deny non-admin access", async () => {
        // Admin creates a permission first
        const tempPermName = `temp_perm_delete_attempt_${Date.now()}`;
        await request(app)
            .post("/api/v1/auth/permissions")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: tempPermName });

        const res = await request(app)
            .delete(`/api/v1/auth/permissions/${encodeURIComponent(tempPermName)}`)
            .set("Authorization", `Bearer ${authToken}`); // Use regular user token
        expect(res.statusCode).toEqual(403);

        // Clean up: Admin deletes the permission
        await request(app)
            .delete(`/api/v1/auth/permissions/${encodeURIComponent(tempPermName)}`)
            .set("Authorization", `Bearer ${adminAuthToken}`);
    });

    // Roles
    it("POST /roles - should deny non-admin access", async () => {
        const res = await request(app)
            .post("/api/v1/auth/roles")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ name: "nonadmin_role", permissions: [] });
        expect(res.statusCode).toEqual(403);
    });

    it("GET /roles - should deny non-admin access", async () => {
        const res = await request(app)
            .get("/api/v1/auth/roles")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(403);
    });

    it("PUT /roles/{roleName} - should deny non-admin access", async () => {
        // Admin creates a role first
        const tempRoleName = `temp_role_update_attempt_${Date.now()}`;
        await request(app)
            .post("/api/v1/auth/roles")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: tempRoleName });

        const res = await request(app)
            .put(`/api/v1/auth/roles/${tempRoleName}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ description: "Attempt Update" });
        expect(res.statusCode).toEqual(403);

        // Clean up: Admin deletes the role
        await request(app)
            .delete(`/api/v1/auth/roles/${tempRoleName}`)
            .set("Authorization", `Bearer ${adminAuthToken}`);
    });

    it("DELETE /roles/{roleName} - should deny non-admin access", async () => {
        // Admin creates a role first
        const tempRoleName = `temp_role_delete_attempt_${Date.now()}`;
        await request(app)
            .post("/api/v1/auth/roles")
            .set("Authorization", `Bearer ${adminAuthToken}`)
            .send({ name: tempRoleName });

        const res = await request(app)
            .delete(`/api/v1/auth/roles/${tempRoleName}`)
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(403);

        // Clean up: Admin deletes the role
        await request(app)
            .delete(`/api/v1/auth/roles/${tempRoleName}`)
            .set("Authorization", `Bearer ${adminAuthToken}`);
    });

    it("POST /permissions - should allow admin to create a permission", async () => {
        const res = await request(app)
            .post('/api/v1/auth/permissions')
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .send({ name: newPermissionName, description: 'Test permission' });
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toEqual(newPermissionName);
    });

    it('GET /permissions - should allow admin to list permissions', async () => {
        const res = await request(app)
            .get('/api/v1/auth/permissions')
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty(newPermissionName);
    });

    it('GET /permissions/{permissionName} - should allow admin to get specific permission', async () => {
        const res = await request(app)
            .get(`/api/v1/auth/permissions/${encodeURIComponent(newPermissionName)}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toEqual(newPermissionName);
    });

    // Roles
    it('POST /roles - should allow admin to create a role with the new permission', async () => {
        const res = await request(app)
            .post('/api/v1/auth/roles')
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .send({ name: newRoleName, description: 'Test role', permissions: [newPermissionName] });
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toEqual(newRoleName);
        expect(res.body.data.permissions).toContain(newPermissionName);
    });

    it('GET /roles - should allow admin to list roles', async () => {
        const res = await request(app)
            .get('/api/v1/auth/roles')
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty(newRoleName);
    });

    it('GET /roles/{roleName} - should allow admin to get specific role', async () => {
        const res = await request(app)
            .get(`/api/v1/auth/roles/${newRoleName}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toEqual(newRoleName);
    });

    it('PUT /roles/{roleName} - should allow admin to update a role', async () => {
        const updatedDescription = 'Updated Test Role Description';
        const res = await request(app)
            .put(`/api/v1/auth/roles/${newRoleName}`)
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .send({ description: updatedDescription, permissions: [] }); // Update description and remove permission
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.description).toEqual(updatedDescription);
        expect(res.body.data.permissions).toEqual([]);
    });

    it('DELETE /roles/{roleName} - should allow admin to delete a role', async () => {
        const res = await request(app)
            .delete(`/api/v1/auth/roles/${newRoleName}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        // Verify role is deleted
        const getRes = await request(app)
            .get(`/api/v1/auth/roles/${newRoleName}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(getRes.statusCode).toEqual(404);
    });

    it('DELETE /permissions/{permissionName} - should allow admin to delete a permission', async () => {
        const res = await request(app)
            .delete(`/api/v1/auth/permissions/${encodeURIComponent(newPermissionName)}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        // Verify permission is deleted
        const getRes = await request(app)
            .get(`/api/v1/auth/permissions/${encodeURIComponent(newPermissionName)}`)
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(getRes.statusCode).toEqual(404);
    });

});

// TODO: Add tests for other routes (segmentation, runner, archive, health) checking authorization

