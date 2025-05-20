import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Custom metrics
const chatMessagesSent = new Counter('chat_messages_sent');
const chatResponsesReceived = new Counter('chat_responses_received');
const chatResponseTime = new Trend('chat_response_time');
const failedRequests = new Rate('failed_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp-up to 100 users over 2 minutes
    { duration: '5m', target: 100 },   // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 },   // Ramp-up to 200 users over 2 minutes
    { duration: '5m', target: 200 },   // Stay at 200 users for 5 minutes
    { duration: '2m', target: 300 },   // Ramp-up to 300 users over 2 minutes
    { duration: '5m', target: 300 },   // Stay at 300 users for 5 minutes
    { duration: '2m', target: 400 },   // Ramp-up to 400 users over 2 minutes
    { duration: '5m', target: 400 },   // Stay at 400 users for 5 minutes
    { duration: '2m', target: 0 },     // Ramp-down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests should be below 3000ms
    http_req_failed: ['rate<0.05'],    // Less than 5% of requests should fail
    'chat_response_time': ['p(95)<5000'], // 95% of chat responses should be below 5000ms
    'failed_requests': ['rate<0.05'],  // Less than 5% of requests should fail
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
  'What are the best practices for software development?',
  'Write a 500 word essay on climate change',
  'Explain the theory of relativity',
  'Compare and contrast different programming languages',
  'Write a short story about a robot who falls in love',
  'Describe the process of photosynthesis'
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
  console.log('Setting up stress test');
  
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
  
  // Send multiple chat messages in a row to simulate heavy usage
  for (let i = 0; i < 3; i++) {
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
      
      // Minimal sleep between messages to increase load
      sleep(1);
    });
  }
  
  // Get chat history
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
}

// Generate HTML report
export function handleSummary(data) {
  return {
    'stress-summary.html': htmlReport(data),
    'stress-summary.json': JSON.stringify(data),
  };
}
