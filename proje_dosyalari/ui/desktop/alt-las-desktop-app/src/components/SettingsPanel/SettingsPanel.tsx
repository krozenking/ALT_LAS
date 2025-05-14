import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useApiService } from "../../services/ApiService"; // For API URL and logout
import "./SettingsPanel.css";

// Define available personas
const availablePersonas = [
  { id: "default", name: "Default" },
  { id: "technical_expert", name: "Technical Expert" },
  { id: "creative_writer", name: "Creative Writer" },
  { id: "code_assistant", name: "Code Assistant" },
  { id: "data_analyst", name: "Data Analyst" },
];

const SettingsPanel: React.FC = () => {
  const { theme, setTheme, operatingMode, setOperatingMode, availableThemes, availableModes } = useTheme();
  const { apiBaseUrl, setApiBaseUrl, logout, authToken, currentUser, checkConnection, isConnected } = useApiService();
  const [currentApiUrlInput, setCurrentApiUrlInput] = useState(apiBaseUrl);
  const [persona, setPersonaState] = useState<string>(localStorage.getItem("selectedPersona") || "default");

  useEffect(() => {
    setCurrentApiUrlInput(apiBaseUrl);
  }, [apiBaseUrl]);

  useEffect(() => {
    localStorage.setItem("selectedPersona", persona);
    // Optionally, inform other parts of the app about persona change via context or events
  }, [persona]);

  const handleApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentApiUrlInput(event.target.value);
  };

  const handleApiUrlSave = async () => {
    setApiBaseUrl(currentApiUrlInput);
    // Re-check connection after URL change
    await checkConnection(); 
  };

  const handleLogout = () => {
    logout();
    // LoginForm will be shown by App.tsx
  };

  return (
    <div className="settings-panel-container" role="form" aria-labelledby="settings-panel-header">
      <h3 id="settings-panel-header" className="sr-only">Application Settings</h3>

      {authToken && currentUser && (
        <div className="user-info-section setting-group">
          <h4>User Information</h4>
          <p><strong>Logged in as:</strong> {currentUser.username} (ID: {currentUser.userId})</p>
          <button onClick={handleLogout} className="settings-button logout-button">Logout</button>
        </div>
      )}

      <div className="setting-group">
        <label htmlFor="theme-select">Theme Mode:</label>
        <select id="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)} className="settings-select">
          {availableThemes.map(th => (
            <option key={th.id} value={th.id}>{th.name}</option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="mode-select">Operating Mode:</label>
        <select id="mode-select" value={operatingMode} onChange={(e) => setOperatingMode(e.target.value)} className="settings-select">
          {availableModes.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="persona-select">Persona:</label>
        <select id="persona-select" value={persona} onChange={(e) => setPersonaState(e.target.value)} className="settings-select">
          {availablePersonas.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="api-url-input">API Gateway URL:</label>
        <div className="api-url-controls">
            <input 
                type="text" 
                id="api-url-input" 
                value={currentApiUrlInput} 
                onChange={handleApiUrlChange} 
                className="settings-input"
                aria-describedby="api-status-desc"
            />
            <button onClick={handleApiUrlSave} className="settings-button save-button">Save</button>
        </div>
        <p id="api-status-desc" className={`api-status ${isConnected ? "connected" : "disconnected"}`}>
            Status: {isConnected ? "Connected" : "Disconnected"}
        </p>
      </div>

      {/* Add more settings here as needed, e.g., language, notifications */}
    </div>
  );
};

export default SettingsPanel;

