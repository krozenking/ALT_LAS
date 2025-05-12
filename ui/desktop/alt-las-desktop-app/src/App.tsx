import React from 'react';
import './App.css';
import MainLayout from './components/MainLayout/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { ApiServiceProvider } from './services/ApiService'; // Import ApiServiceProvider

function App() {
  return (
    <ApiServiceProvider> {/* Wrap with ApiServiceProvider */}
      <ThemeProvider>
        <div className="App">
          <MainLayout />
        </div>
      </ThemeProvider>
    </ApiServiceProvider>
  );
}

export default App;

