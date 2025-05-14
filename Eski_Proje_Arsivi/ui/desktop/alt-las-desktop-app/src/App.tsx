import React from "react";
import "./App.css";
import MainLayout from "./components/MainLayout/MainLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ApiServiceProvider, useApiService } from "./services/ApiService";
import LoginForm from "./components/Auth/LoginForm";

const AppContent: React.FC = () => {
  const { authToken, currentUser } = useApiService();

  if (!authToken) {
    // If there's no auth token, render the LoginForm
    // The onLoginSuccess callback is handled internally by ApiService setting the token
    // and AppContent re-rendering due to context change.
    return <LoginForm onLoginSuccess={() => { /* Optionally do something here, but context handles re-render */ }} />;
  }

  // If authenticated, render the main application layout
  return (
    <div className="App">
      {/* currentUser could be passed down or used in a header component */}
      {currentUser && <div className="user-greeting">Welcome, {currentUser.username}!</div>}
      <MainLayout />
    </div>
  );
};

function App() {
  return (
    // ApiServiceProvider must be outside any component that uses useApiService
    <ApiServiceProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ApiServiceProvider>
  );
}

export default App;

