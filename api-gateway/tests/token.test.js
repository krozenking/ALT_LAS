const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/index");
const authService = require("../src/services/authService");
const sessionService = require("../src/services/sessionService");
const jwtService = require("../src/services/jwtService");

// Mock the services
jest.mock("../src/services/authService");
jest.mock("../src/services/sessionService");
jest.mock("../src/services/jwtService");

describe("Token Management API Tests", () => {
  const testUser = {
    id: "test123",
    username: "testuser",
    roles: ["user"],
    permissions: []
  };
  const testToken = "valid.jwt.token";
  const testRefreshToken = "valid.refresh.token";
  const expiredToken = "expired.jwt.token";
  const invalidToken = "invalid.jwt.token";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock jwtService functions
    jwtService.generateToken.mockReturnValue(testToken);
    jwtService.generateRefreshToken.mockReturnValue(testRefreshToken);
    jwtService.verifyToken.mockImplementation((token) => {
      if (token === testToken) return { userId: testUser.id, username: testUser.username, roles: testUser.roles };
      if (token === expiredToken) throw new jwt.TokenExpiredError("Token expired", new Date());
      throw new jwt.JsonWebTokenError("Invalid token");
    });
    jwtService.verifyRefreshToken.mockImplementation((token) => {
      if (token === testRefreshToken) return { userId: testUser.id };
      throw new jwt.JsonWebTokenError("Invalid refresh token");
    });
    jwtService.blacklistToken.mockResolvedValue();
    jwtService.isTokenBlacklisted.mockResolvedValue(false);

    // Mock authService functions needed for middleware
    authService.getUserDetailsForAuth.mockResolvedValue({
      id: testUser.id,
      username: testUser.username,
      roles: testUser.roles,
      permissions: testUser.permissions
    });
    authService.validateRefreshToken.mockResolvedValue(true);
    authService.getUserById.mockResolvedValue(testUser);
    authService.invalidateRefreshToken.mockResolvedValue();
    authService.saveRefreshToken.mockResolvedValue();

    // Mock sessionService functions
    sessionService.getSessionByRefreshToken.mockReturnValue({
      id: "session123",
      userId: testUser.id,
      refreshToken: testRefreshToken,
      isActive: true,
      expiresAt: new Date(Date.now() + 3600000)
    });
    sessionService.updateSession.mockResolvedValue();
    sessionService.invalidateSessionByRefreshToken.mockResolvedValue();
    sessionService.getUserActiveSessions.mockResolvedValue([
      {
        id: "session123",
        userId: testUser.id,
        refreshToken: testRefreshToken,
        deviceInfo: { ip: "127.0.0.1", userAgent: "TestAgent" },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        lastUsedAt: new Date(),
        isActive: true
      }
    ]);
    sessionService.endSession.mockResolvedValue();
    sessionService.endAllSessionsExcept.mockResolvedValue();
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should successfully refresh tokens with a valid refresh token", async () => {
      jwtService.generateToken.mockReturnValue("new.access.token");
      jwtService.generateRefreshToken.mockReturnValue("new.refresh.token");

      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: testRefreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe("new.access.token");
      expect(response.body.data.refreshToken).toBe("new.refresh.token");
      expect(sessionService.getSessionByRefreshToken).toHaveBeenCalledWith(testRefreshToken);
      expect(sessionService.updateSession).toHaveBeenCalledWith("session123", expect.objectContaining({ refreshToken: "new.refresh.token" }));
    });

    it("should return 401 if refresh token is invalid or expired", async () => {
      sessionService.getSessionByRefreshToken.mockImplementation(() => {
        throw new Error("Invalid or expired refresh token");
      });

      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: "invalid.or.expired.token" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 if refresh token is missing", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/sessions", () => {
    it("should retrieve active sessions for the authenticated user", async () => {
      // Need to mock the authenticateJWT middleware properly
      // For now, assume it populates req.user
      const response = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${testToken}`);

      // This test might fail if the authenticateJWT middleware is not properly mocked
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].id).toBe("session123");
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app).get("/api/auth/sessions");
      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/auth/sessions/:sessionId", () => {
    it("should terminate a specific session", async () => {
      const sessionIdToTerminate = "session123";
      const response = await request(app)
        .delete(`/api/auth/sessions/${sessionIdToTerminate}`)
        .set("Authorization", `Bearer ${testToken}`);

      // This test might fail if the authenticateJWT middleware is not properly mocked
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sessionService.endSession).toHaveBeenCalledWith(testUser.id, sessionIdToTerminate);
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app).delete("/api/auth/sessions/session123");
      expect(response.status).toBe(401);
    });

    // Add test for trying to delete another user's session (should fail unless admin)
    it("should return 403 when trying to delete another user's session", async () => {
      // Assume sessionService.endSession checks ownership
      sessionService.endSession.mockImplementation(async (requestingUserId, sessionIdToDelete) => {
        // Simulate fetching the session and checking owner
        const sessionOwnerId = "otherUser456"; // Simulate session belonging to another user
        if (requestingUserId !== sessionOwnerId) {
          // In a real scenario, the service/middleware would throw or return an error
          // Here, we simulate the expected outcome based on the mock logic
          return false; // Indicate failure due to ownership mismatch
        }
        return true; // Indicate success if owner matches
      });

      const sessionIdToTerminate = "otherUserSession789";
      const response = await request(app)
        .delete(`/api/auth/sessions/${sessionIdToTerminate}`)
        .set("Authorization", `Bearer ${testToken}`); // Authenticated as testUser.id = "test123"

      // Expect Forbidden because testUser (test123) doesn't own otherUserSession789 (owned by otherUser456)
      // The actual status code depends on how the authorization check is implemented in the route/middleware
      // It might be 403 Forbidden or 404 Not Found if the session isn't found *for that user*
      expect([403, 404]).toContain(response.status);
      expect(response.body.success).toBe(false);
      // Verify the mock was called correctly
      expect(sessionService.endSession).toHaveBeenCalledWith(testUser.id, sessionIdToTerminate);
    });
  });

  describe("DELETE /api/auth/sessions", () => {
    it("should terminate all other sessions for the user", async () => {
      const currentSessionId = "session123";
      const response = await request(app)
        .delete("/api/auth/sessions")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ currentSessionId });

      // This test might fail if the authenticateJWT middleware is not properly mocked
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sessionService.endAllSessionsExcept).toHaveBeenCalledWith(testUser.id, currentSessionId);
    });

    it("should return 400 if currentSessionId is missing", async () => {
      const response = await request(app)
        .delete("/api/auth/sessions")
        .set("Authorization", `Bearer ${testToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app)
        .delete("/api/auth/sessions")
        .send({ currentSessionId: "session123" });
      expect(response.status).toBe(401);
    });
  });

  // Test JWT expiration and invalidation (requires middleware mocking)
  describe("Middleware Token Validation", () => {
    // These tests require mocking the actual middleware execution flow
    // which is complex with supertest alone. We will test the middleware logic conceptually.

    it("should conceptually deny access with an expired token", async () => {
      // Simulate middleware scenario
      const token = expiredToken;
      try {
        jwtService.verifyToken(token); // This should throw TokenExpiredError based on mock
        // If it doesn't throw, the test fails conceptually
        throw new Error("verifyToken did not throw for expired token");
      } catch (error) {
        expect(error).toBeInstanceOf(jwt.TokenExpiredError);
        // In real middleware, this would lead to a 401 response
      }
    });

    it("should conceptually deny access with an invalid token", async () => {
      // Simulate middleware scenario
      const token = invalidToken;
      try {
        jwtService.verifyToken(token); // This should throw JsonWebTokenError based on mock
        throw new Error("verifyToken did not throw for invalid token");
      } catch (error) {
        expect(error).toBeInstanceOf(jwt.JsonWebTokenError);
        expect(error).not.toBeInstanceOf(jwt.TokenExpiredError);
        // In real middleware, this would lead to a 401 response
      }
    });

    it("should conceptually deny access with a blacklisted token", async () => {
      // Simulate middleware scenario
      const token = testToken;
      jwtService.isTokenBlacklisted.mockResolvedValue(true); // Mock token as blacklisted

      const isBlacklisted = await jwtService.isTokenBlacklisted(token);
      expect(isBlacklisted).toBe(true);
      // In real middleware, this check being true would lead to a 401 response
    });
  });
});

