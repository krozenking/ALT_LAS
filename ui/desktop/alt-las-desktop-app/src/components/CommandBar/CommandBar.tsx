import React, { useState, useEffect } from "react";
import { useApiService, CommandRequest } from "../../services/ApiService";
import { useTheme } from "../../contexts/ThemeContext";
import "./CommandBar.css";

interface CommandBarProps {
  onNewCommandResponse: (response: any) => void; // Callback to send response to MainLayout
}

const CommandBar: React.FC<CommandBarProps> = ({ onNewCommandResponse }) => {
  const [commandInput, setCommandInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendCommand, isConnected, checkConnection, apiBaseUrl } = useApiService();
  const { operatingMode } = useTheme(); // Get current operating mode

  useEffect(() => {
    // Check connection when component mounts or apiBaseUrl changes
    checkConnection();
  }, [checkConnection, apiBaseUrl]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (commandInput.trim() && !isLoading) {
      setIsLoading(true);
      setError(null);

      const commandPayload: CommandRequest = {
        command: commandInput.trim(),
        mode: operatingMode, // Include operating mode
        // persona: "expert_ui_dev", // Example persona, can be made configurable
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
        console.error("Command submission failed:", response.error);
        setError(response.error || "Failed to send command. API not connected or error occurred.");
        onNewCommandResponse({ type: "command_error", payload: response.error });
      }
    }
  };

  return (
    <div className="command-bar-wrapper">
      {!isConnected && (
        <div className="api-status-indicator error">
          API Disconnected. Check Settings.
        </div>
      )}
      <form className="command-bar-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="command-input"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder={isConnected ? "Enter your command... (Mode: " + operatingMode + ")" : "API Disconnected. Check Settings."}
          disabled={isLoading || !isConnected}
        />
        <button type="submit" className="submit-button" disabled={isLoading || !isConnected}>
          {isLoading ? "Processing..." : "Send"}
        </button>
      </form>
      {error && <div className="command-error-message">Error: {error}</div>}
    </div>
  );
};

export default CommandBar;

