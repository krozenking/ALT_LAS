import { useState } from 'react';
import { Message } from '../types';
import { logErrorToService } from '../utils/errorHandler';

/**
 * Error Test Component
 *
 * This component is used to test the error handling system.
 * It provides buttons to trigger different types of errors.
 */
const ErrorTest: React.FC = () => {
  const [showTest, setShowTest] = useState(false);

  // Function to trigger a runtime error
  const triggerRuntimeError = () => {
    try {
      // @ts-ignore - Intentionally causing an error
      const obj = null;
      obj.nonExistentMethod();
    } catch (error) {
      // Log the error before re-throwing it
      logErrorToService(error, { type: 'runtime.error', source: 'ErrorTest.tsx' });
      throw error; // Re-throw to test global handler
    }
  };

  // Function to trigger a type error
  const triggerTypeError = () => {
    try {
      // Intentionally create a Message with missing required fields
      const invalidMessage: Message = {
        // @ts-ignore - Intentionally missing required fields
        content: 'Test message'
      };
      console.log('Invalid message created:', invalidMessage);
    } catch (error) {
      console.error('Type error occurred:', error);
      logErrorToService(error, { type: 'type.error', source: 'ErrorTest.tsx' });
    }
  };

  // Function to trigger a network error
  const triggerNetworkError = () => {
    fetch('/non-existent-endpoint')
      .then(response => response.json())
      .catch(error => {
        console.error('Network error:', error);
        logErrorToService(error, { type: 'network.error', source: 'ErrorTest.tsx' });
      });
  };

  // Function to trigger a console.error
  const triggerConsoleError = () => {
    const errorMessage = 'This is a test console.error message';
    console.error(errorMessage);
    console.log('DEBUG: Before calling logErrorToService in triggerConsoleError');

    // Manuel olarak fetch ile hata gönderme
    console.log('DEBUG: Sending error to server with direct fetch');

    // Hata mesajını oluştur
    const errorData = {
      message: errorMessage,
      type: 'console.error',
      source: 'ErrorTest.tsx',
      timestamp: new Date().toISOString()
    };

    console.log('DEBUG: Error data:', errorData);

    // Fetch options
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(errorData),
      headers: { 'Content-Type': 'application/json' }
    };

    console.log('DEBUG: Fetch options:', fetchOptions);

    // Fetch isteği gönder
    fetch('http://localhost:3000/log-client-error', fetchOptions)
    .then(response => {
      console.log('DEBUG: Fetch response received');
      console.log('DEBUG: Fetch response status:', response.status);
      console.log('DEBUG: Fetch response headers:', response.headers);
      return response.text();
    })
    .then(text => {
      console.log('DEBUG: Fetch response text:', text);
    })
    .catch(err => {
      console.error('DEBUG: Fetch error:', err);
      console.error('DEBUG: Fetch error type:', err.name);
      console.error('DEBUG: Fetch error message:', err.message);
      if (err.stack) {
        console.error('DEBUG: Fetch error stack:', err.stack);
      }
    });

    // Ayrıca normal logErrorToService fonksiyonunu da çağıralım
    logErrorToService(errorMessage, { type: 'console.error', source: 'ErrorTest.tsx' });
    console.log('DEBUG: After calling logErrorToService in triggerConsoleError');
  };

  if (!showTest) {
    return (
      <button
        onClick={() => setShowTest(true)}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        Show Error Test Panel
      </button>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow-md mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Error Test Panel</h2>
        <button
          onClick={() => setShowTest(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-2">
          Click the buttons below to test different types of errors.
          Check the browser console and server logs to see the results.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={triggerRuntimeError}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
          >
            Trigger Runtime Error
          </button>

          <button
            onClick={triggerTypeError}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
          >
            Trigger Type Error
          </button>

          <button
            onClick={triggerNetworkError}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Trigger Network Error
          </button>

          <button
            onClick={triggerConsoleError}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
          >
            Trigger Console.Error
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorTest;
