import React, { useState, useEffect, useRef } from "react";
import { useApiService, CommandRequest } from "../../services/ApiService";
import { useTheme } from "../../contexts/ThemeContext";
import { useHotkeys } from "react-hotkeys-hook";
import "./CommandBar.css";

interface CommandBarProps {
  onNewCommandResponse: (response: any) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ onNewCommandResponse }) => {
  const [commandInput, setCommandInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendCommand, isConnected, checkConnection, apiBaseUrl, authToken } = useApiService();
  const { operatingMode } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys("ctrl+shift+c", () => inputRef.current?.focus(), { preventDefault: true });

  useEffect(() => {
    if (authToken) {
        checkConnection();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkConnection, apiBaseUrl, authToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (commandInput.trim() && !isLoading && authToken) {
      setIsLoading(true);
      setError(null);

      const selectedPersona = localStorage.getItem("selectedPersona") || "default";

      const commandPayload: CommandRequest = {
        command: commandInput.trim(),
        mode: operatingMode,
        persona: selectedPersona === "default" ? undefined : selectedPersona, // Send persona if not default
        metadata: {
          timestamp: new Date().toISOString(),
          source: "alt-las-desktop-app",
        },
      };

      const response = await sendCommand(commandPayload);
      setIsLoading(false);

      if (response.success && response.data) {
        console.log("Command sent successfully:", response.data);
        onNewCommandResponse({ type: "command_submitted", payload: response.data });
        setCommandInput("");
      } else {
        console.error("Command submission failed:", response.error, "Status:", response.statusCode);
        let errorMessage = response.error || "Failed to send command.";
        if (response.statusCode === 401) {
            errorMessage = "Authentication error. Please re-login.";
        } else if (response.statusCode === 0) {
            errorMessage = "API connection failed. Please check settings and network.";
        }
        setError(errorMessage);
        onNewCommandResponse({ type: "command_error", payload: errorMessage });
      }
    } else if (!authToken) {
        setError("You must be logged in to send commands.");
    }
  };

  const placeholderText = !authToken 
    ? "Please login to use the command bar."
    : !isConnected 
    ? "API Disconnected. Check Settings."
    : `Enter command (Mode: ${operatingMode}, Persona: ${localStorage.getItem("selectedPersona") || "Default"}) (Ctrl+Shift+C)`;

  return (
    <div className="command-bar-wrapper" role="search" aria-label="Command input area">
      {authToken && !isConnected && (
        <div className="api-status-indicator error">
          API Disconnected. Check Settings &amp; Network.
        </div>
      )}
      <form className="command-bar-container" onSubmit={handleSubmit} aria-labelledby="command-bar-label">
        <label htmlFor="command-bar-input" id="command-bar-label" className="sr-only">Enter your command</label>
        <input
          ref={inputRef}
          type="text"
          id="command-bar-input"
          className="command-input"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder={placeholderText}
          disabled={isLoading || !isConnected || !authToken}
          aria-label="Command input field"
          aria-describedby={error ? "command-error-desc" : undefined}
          aria-invalid={!!error}
        />
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading || !isConnected || !authToken}
          aria-label="Send command"
        >
          {isLoading ? "Processing..." : "Send"}
        </button>
      </form>
      {error && <div id="command-error-desc" className="command-error-message" role="alert">Error: {error}</div>}
    </div>
  );
};

export default CommandBar;

