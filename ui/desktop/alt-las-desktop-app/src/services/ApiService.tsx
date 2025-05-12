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
  // Potentially more fields from backend response
  result?: any; // Could be *.last file content or a summary
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
  // Placeholder for login/logout which would set/clear the token
  // login: (credentials: any) => Promise<ApiResponse<any>>;
  // logout: () => void;
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
  const [authToken, setAuthTokenState] = useState<string | null>(null); // Store JWT token

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
    }
    checkConnection(); // Check connection on initial load
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

  const sendCommand = async (payload: CommandRequest): Promise<ApiResponse<CommandResponseData>> => {
    if (!isConnected && !(await checkConnection())) {
        return { success: false, error: "API not connected. Please check settings.", statusCode: 0 };
    }
    try {
      // The API Gateway README (api-gateway/README.md) and its code (src/routes/commandRoutes.ts)
      // suggest a POST to /api/command for submitting commands.
      // The Segmentation Service (segmentation-service/README.md) expects mode, persona, metadata.
      const response = await fetch(`${apiBaseUrl}/command`, { // Assuming API Gateway routes /api/command to segmentation
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Bearer ${authToken}` }),
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || responseData.error || "Command submission failed",
          statusCode: response.status,
        };
      }
      return {
        success: true,
        data: responseData, // Assuming the gateway forwards the segmentation service response
        statusCode: response.status,
      };
    } catch (error) {
      console.error("API sendCommand failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during command submission",
        statusCode: 0,
      };
    }
  };
  
  // Placeholder for fetching command status - API Gateway might need a new endpoint for this
  // or it might proxy to a status endpoint on Runner or Archive service.
  const getCommandStatus = async (taskId: string): Promise<ApiResponse<CommandResponseData>> => {
    if (!isConnected && !(await checkConnection())) {
        return { success: false, error: "API not connected.", statusCode: 0 };
    }
    try {
        // Example: GET /api/command/{taskId}/status or /api/results/{taskId}
        const response = await fetch(`${apiBaseUrl}/results/${taskId}`, { // This endpoint is a guess, needs verification from backend docs
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authToken && { "Authorization": `Bearer ${authToken}` }),
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
  }), [apiBaseUrl, isConnected, authToken]);

  return (
    <ApiServiceContext.Provider value={value}>
      {children}
    </ApiServiceContext.Provider>
  );
};
