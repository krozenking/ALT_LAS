import React, { createContext, useState, useContext, useMemo, useEffect } from "react";

// Define API service interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface CommandRequest {
  command: string;
  mode?: string; // Optional: Normal, Dream, Explore, Chaos
  persona?: string; // Optional: technical_expert, etc.
  metadata?: Record<string, any>;
}

export interface CommandResponseData {
  id: string; // Task ID or similar identifier from backend
  status: string;
  message?: string;
  alt_file?: string; // From Segmentation Service via API Gateway
  segments_count?: number;
  result?: any; // Could be *.last file content or a summary
}

// Define Login credentials and response
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  userId: string;
  username: string;
  // any other user details
}

interface ApiServiceContextProps {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  sendCommand: (payload: CommandRequest) => Promise<ApiResponse<CommandResponseData>>;
  getCommandStatus: (taskId: string) => Promise<ApiResponse<CommandResponseData>>;
  isConnected: boolean;
  checkConnection: () => Promise<boolean>;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<ApiResponse<LoginResponseData>>;
  logout: () => void;
  currentUser: LoginResponseData | null; // Store current user details
}

const ApiServiceContext = createContext<ApiServiceContextProps | undefined>(undefined);

export const useApiService = () => {
  const context = useContext(ApiServiceContext);
  if (!context) {
    throw new Error("useApiService must be used within an ApiServiceProvider");
  }
  return context;
};

interface ApiServiceProviderProps {
  children: React.ReactNode;
  defaultApiBaseUrl?: string;
}

export const ApiServiceProvider: React.FC<ApiServiceProviderProps> = ({ 
  children,
  defaultApiBaseUrl = "http://localhost:3000/api" // Default API Gateway URL
}) => {
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(defaultApiBaseUrl);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<LoginResponseData | null>(null);

  const setApiBaseUrl = (url: string) => {
    setApiBaseUrlState(url);
    localStorage.setItem("apiBaseUrl", url);
  };

  const setAuthToken = (token: string | null) => {
    setAuthTokenState(token);
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser"); // Also clear user on logout
      setCurrentUser(null); // Clear current user state
    }
  };

  useEffect(() => {
    const storedApiBaseUrl = localStorage.getItem("apiBaseUrl");
    if (storedApiBaseUrl) {
      setApiBaseUrlState(storedApiBaseUrl);
    }
    const storedAuthToken = localStorage.getItem("authToken");
    if (storedAuthToken) {
      setAuthTokenState(storedAuthToken);
      // If token exists, try to load user data (or this could be done after a successful login)
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
            setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
            localStorage.removeItem("currentUser"); // Clear if invalid JSON
        }
      }
    }
    checkConnection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const connected = response.ok;
      setIsConnected(connected);
      if (!connected) console.error("API Connection Check Failed:", response.status, await response.text());
      return connected;
    } catch (error) {
      console.error("API connection check failed:", error);
      setIsConnected(false);
      return false;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponseData>> => {
    setIsConnected(false); // Reset connection status before login attempt
    try {
      // MOCK API CALL - Replace with actual API call to your backend /auth/login endpoint
      // const response = await fetch(`${apiBaseUrl}/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(credentials),
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   return { success: false, error: data.message || "Login failed", statusCode: response.status };
      // }
      // const userData: LoginResponseData = { token: data.token, userId: data.userId, username: data.username };
      // setAuthToken(userData.token);
      // setCurrentUser(userData);
      // localStorage.setItem("currentUser", JSON.stringify(userData));
      // setIsConnected(true); // Assume connection is fine after successful login
      // return { success: true, data: userData, statusCode: response.status };

      // Current Mock Implementation:
      return new Promise<ApiResponse<LoginResponseData>>((resolve) => {
        setTimeout(() => {
          if (credentials.username === "admin" && credentials.password === "password") {
            const mockUserData: LoginResponseData = {
              token: "mock-jwt-token-" + Date.now(),
              userId: "user-123",
              username: "admin",
            };
            setAuthToken(mockUserData.token);
            setCurrentUser(mockUserData);
            localStorage.setItem("currentUser", JSON.stringify(mockUserData));
            setIsConnected(true); // Simulate connection on successful mock login
            resolve({ success: true, data: mockUserData, statusCode: 200 });
          } else {
            resolve({ success: false, error: "Invalid mock username or password", statusCode: 401 });
          }
        }, 1000);
      });
    } catch (error) {
      console.error("Login API call failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error during login", statusCode: 0 };
    }
  };

  const logout = () => {
    setAuthToken(null); // This already clears localStorage and currentUser
    // Optionally, call a backend /auth/logout endpoint if it exists
  };

  const sendCommand = async (payload: CommandRequest): Promise<ApiResponse<CommandResponseData>> => {
    if (!authToken) return { success: false, error: "Not authenticated", statusCode: 401 };
    if (!isConnected && !(await checkConnection())) {
        return { success: false, error: "API not connected. Please check settings.", statusCode: 0 };
    }
    try {
      const response = await fetch(`${apiBaseUrl}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok) {
        return { success: false, error: responseData.message || responseData.error || "Command submission failed", statusCode: response.status };
      }
      return { success: true, data: responseData, statusCode: response.status };
    } catch (error) {
      console.error("API sendCommand failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error during command submission", statusCode: 0 };
    }
  };
  
  const getCommandStatus = async (taskId: string): Promise<ApiResponse<CommandResponseData>> => {
    if (!authToken) return { success: false, error: "Not authenticated", statusCode: 401 };
    if (!isConnected && !(await checkConnection())) {
        return { success: false, error: "API not connected.", statusCode: 0 };
    }
    try {
        const response = await fetch(`${apiBaseUrl}/results/${taskId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
        });
        const responseData = await response.json();
        if (!response.ok) {
            return { success: false, error: responseData.message || "Failed to get command status", statusCode: response.status };
        }
        return { success: true, data: responseData, statusCode: response.status };
    } catch (error) {
        console.error("API getCommandStatus failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching status", statusCode: 0 };
    }
  };

  const value = useMemo(() => ({
    apiBaseUrl,
    setApiBaseUrl,
    sendCommand,
    getCommandStatus,
    isConnected,
    checkConnection,
    authToken,
    setAuthToken,
    login,
    logout,
    currentUser,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [apiBaseUrl, isConnected, authToken, currentUser]);

  return (
    <ApiServiceContext.Provider value={value}>
      {children}
    </ApiServiceContext.Provider>
  );
};
