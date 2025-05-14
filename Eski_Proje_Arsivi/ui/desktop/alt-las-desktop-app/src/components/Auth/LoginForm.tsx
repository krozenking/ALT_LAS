import React, { useState } from "react";
import { useApiService } from "../../services/ApiService";
import "./LoginForm.css";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthToken, apiBaseUrl } = useApiService(); // Assuming login will be handled by ApiService

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, you would call an actual login endpoint.
      // const response = await apiService.login({ username, password });
      // For now, we simulate a login call and token reception.
      const mockLoginApiCall = async (user: string, pass: string) => {
        return new Promise<{ success: boolean; token?: string; error?: string }>((resolve) => {
          setTimeout(() => {
            if (user === "admin" && pass === "password") { // Mock credentials
              resolve({ success: true, token: "mock-jwt-token-" + Date.now() });
            } else {
              resolve({ success: false, error: "Invalid username or password" });
            }
          }, 1000);
        });
      };

      const loginResponse = await mockLoginApiCall(username, password);

      if (loginResponse.success && loginResponse.token) {
        setAuthToken(loginResponse.token);
        onLoginSuccess();
      } else {
        setError(loginResponse.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred during login.");
    }
    setIsLoading(false);
  };

  return (
    <div className="login-form-overlay">
      <div className="login-form-container">
        <h2>ALT_LAS Login</h2>
        <p className="api-info">Connecting to: {apiBaseUrl}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

