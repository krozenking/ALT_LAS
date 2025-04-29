import request from 'supertest';
import app from '../src/index'; // Adjust the path if necessary

// --- Test Data ---
const testUser = {
    username: `basic_test_${Date.now()}`,
    password: 'password123',
    email: `basic_${Date.now()}@example.com`,
};
const adminUser = {
    username: 'admin',
    password: 'password' // Assuming default admin password
};

let userAuthToken = '';
let adminAuthToken = '';
let testUserId = '';

describe('Basic API Gateway Functionality Tests', () => {

    // 1. Health Check
    it('GET /api/health - should return API Gateway health status', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('ok');
    });

    // 2. User Registration
    it('POST /api/auth/register - should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        testUserId = res.body.data.id; // Save user ID
    });

    // 3. User Login
    it('POST /api/auth/login - should log in the registered user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: testUser.username, password: testUser.password });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        userAuthToken = res.body.data.token; // Save user token
    });

    // 4. Authenticated Route Access (User)
    it('GET /api/auth/profile - should allow authenticated user to access profile', async () => {
        expect(userAuthToken).not.toBe(''); // Ensure token exists
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${userAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toEqual(testUserId);
    });

    // 5. Admin Login
    it('POST /api/auth/login - should log in the admin user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: adminUser.username, password: adminUser.password });
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        adminAuthToken = res.body.data.token; // Save admin token
    });

    // 6. Authorization Check (Admin Route)
    it('GET /api/auth/users - should allow admin access', async () => {
        expect(adminAuthToken).not.toBe(''); // Ensure token exists
        const res = await request(app)
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${adminAuthToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // 7. Authorization Check (User trying Admin Route)
    it('GET /api/auth/users - should deny non-admin access', async () => {
        expect(userAuthToken).not.toBe(''); // Ensure token exists
        const res = await request(app)
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${userAuthToken}`);
        expect(res.statusCode).toEqual(403); // Forbidden
        expect(res.body.success).toBe(false);
    });

});

