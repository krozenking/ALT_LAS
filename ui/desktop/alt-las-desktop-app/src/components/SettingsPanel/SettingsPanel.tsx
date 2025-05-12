import React from 'react';
import { useTheme, ThemeMode, OperatingMode } from '../../contexts/ThemeContext';
import './SettingsPanel.css';

const SettingsPanel: React.FC = () => {
  const { 
    themeMode, 
    setThemeMode, 
    operatingMode, 
    setOperatingMode, 
    toggleThemeMode 
  } = useTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setThemeMode(event.target.value as ThemeMode);
  };

  const handleOperatingModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOperatingMode(event.target.value as OperatingMode);
  };

  return (
    <div className="settings-panel-container">
      <h4>Settings</h4>

      <div className="setting-group">
        <label htmlFor="theme-select">Theme Mode:</label>
        <select id="theme-select" value={themeMode} onChange={handleThemeChange}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="glassmorphism-dark">Glassmorphism Dark</option>
          <option value="glassmorphism-light">Glassmorphism Light</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="opmode-select">Operating Mode:</label>
        <select id="opmode-select" value={operatingMode} onChange={handleOperatingModeChange}>
          <option value="Normal">Normal</option>
          <option value="Dream">Dream</option>
          <option value="Explore">Explore</option>
          <option value="Chaos">Chaos</option>
        </select>
      </div>

      <button onClick={toggleThemeMode} className="settings-button">
        Toggle Next Theme
      </button>

      <div className="info-group">
        <p>Current Theme: <strong>{themeMode}</strong></p>
        <p>Current Operating Mode: <strong>{operatingMode}</strong></p>
      </div>

      {/* Placeholder for other settings like API endpoints, etc. */}
      <h5>Advanced Settings (Placeholder)</h5>
      <div className="setting-group">
        <label htmlFor="api-endpoint">API Gateway Endpoint:</label>
        <input type="text" id="api-endpoint" defaultValue="http://localhost:3000/api" />
      </div>
      
      <h5>UI/UX Plan Reminders:</h5>
      <ul>
        <li>Task 1.1: Enhanced visual feedback for panel drag/resize.</li>
        <li>Task 1.2: Keyboard shortcuts for panels.</li>
        <li>Task 2.1: Glassmorphism style guide.</li>
        <li>Task 2.2: WCAG review for glassmorphism.</li>
        <li>Task 3.1: Distinct visual variations for operating modes in theme.</li>
      </ul>

    </div>
  );
};

export default SettingsPanel;

