import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initErrorHandling } from './utils/errorHandler'

// Initialize global error handling
initErrorHandling();

// Log application startup
console.log('Application starting...');

// Hata yakalama işlemleri artık errorHandler.ts içinde merkezi olarak yönetiliyor
// window.onerror ve console.error override'ları kaldırıldı

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to render application:', error);
}
