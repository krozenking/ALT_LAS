import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Custom metrics
const chatMessagesSent = new Counter('chat_messages_sent');
const chatResponsesReceived = new Counter('chat_responses_received');
const chatResponseTime = new Trend('chat_response_time');
const failedRequests = new Rate('failed_requests');
const memoryUsage = new Trend('memory_usage');

// Test configuration
export const options = {
  // Simulate a full day with varying load
  stages: [
    { duration: '1h', target: 10 },    // Early morning (low load)
    { duration: '2h', target: 30 },    // Morning ramp-up
    { duration: '3h', target: 50 },    // Morning peak
    { duration: '2h', target: 40 },    // Midday
    { duration: '3h', target: 60 },    // Afternoon peak
    { duration: '2h', target: 30 },    // Evening
    { duration: '3h', target: 10 },    // Night (low load)
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
    'chat_response_time': ['p(95)<3000'], // 95% of chat responses should be below 3000ms
    'failed_requests': ['rate<0.01'],  // Less than 1% of requests should fail
    'memory_usage': ['max<100'],       // Memory usage should be below 100MB
  },
};

// Test data
const models = [
  'gpt-3.5-turbo',
  'gpt-4',
  'claude-3-opus',
  'claude-3-sonnet',
  'llama-3-70b',
  'mistral-large'
];

const messages = [
  'Hello, how are you?',
  'Tell me a joke',
  'What is the capital of France?',
  'Write a short poem about nature',
  'Explain quantum computing in simple terms',
  'What are the benefits of exercise?',
  'How do I make a chocolate cake?',
  'What is the meaning of life?',
  'Tell me about the history of the internet',
  'What are the best practices for software development?'
];

// Utility functions
function getRandomModel() {
  return models[Math.floor(Math.random() * models.length)];
}

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Setup function (runs once per VU)
export function setup() {
  console.log('Setting up endurance test');
  
  // Check if the API is available
  const res = http.get('http://localhost:3000/api/health');
  if (res.status !== 200) {
    throw new Error('API is not available');
  }
  
  return {
    baseUrl: 'http://localhost:3000',
    apiKey: 'test-api-key'
  };
}

// Default function (runs for each VU)
export default function(data) {
  const baseUrl = data.baseUrl;
  const apiKey = data.apiKey;
  
  // Generate a unique user ID for this VU
  const userId = `user_${__VU}_${randomString(8)}`;
  
  // Simulate a user session
  group('User Session', function() {
    // 1. Health check
    group('Health Check', function() {
      const res = http.get(`${baseUrl}/api/health`);
      
      check(res, {
        'health check status is 200': (r) => r.status === 200
      }) || failedRequests.add(1);
      
      sleep(1);
    });
    
    // 2. Get available models
    group('Get Available Models', function() {
      const res = http.get(`${baseUrl}/api/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      check(res, {
        'get models status is 200': (r) => r.status === 200
      }) || failedRequests.add(1);
      
      sleep(1);
    });
    
    // 3. Send multiple chat messages
    const numMessages = randomIntBetween(1, 5); // Random number of messages per session
    
    for (let i = 0; i < numMessages; i++) {
      group(`Chat Message ${i+1}`, function() {
        const model = getRandomModel();
        const message = getRandomMessage();
        
        const payload = JSON.stringify({
          message: message,
          model: model,
          userId: userId
        });
        
        const res = http.post(`${baseUrl}/api/chat`, payload, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        chatMessagesSent.add(1);
        
        const success = check(res, {
          'chat status is 200': (r) => r.status === 200,
          'chat response has text': (r) => {
            try {
              const body = JSON.parse(r.body);
              return body.text && body.text.length > 0;
            } catch (e) {
              return false;
            }
          }
        });
        
        if (!success) {
          failedRequests.add(1);
        } else {
          chatResponsesReceived.add(1);
          chatResponseTime.add(res.timings.duration);
        }
        
        // Simulate user reading the response and thinking about next message
        sleep(randomIntBetween(5, 15));
      });
    }
    
    // 4. Get chat history
    group('Get Chat History', function() {
      const res = http.get(`${baseUrl}/api/chat/history?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      check(res, {
        'history status is 200': (r) => r.status === 200
      }) || failedRequests.add(1);
      
      sleep(1);
    });
    
    // 5. Clear chat history (sometimes)
    if (Math.random() < 0.3) { // 30% chance to clear history
      group('Clear Chat History', function() {
        const res = http.del(`${baseUrl}/api/chat/history?userId=${userId}`, null, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        check(res, {
          'clear history status is 200': (r) => r.status === 200
        }) || failedRequests.add(1);
        
        sleep(1);
      });
    }
    
    // Simulate user taking a break between sessions
    sleep(randomIntBetween(10, 60));
  });
  
  // Record memory usage (this is a placeholder - in a real test, you would get this from the server)
  memoryUsage.add(randomIntBetween(50, 100));
}

// Generate HTML report
export function handleSummary(data) {
  return {
    'endurance-summary.html': htmlReport(data),
    'endurance-summary.json': JSON.stringify(data),
  };
}
