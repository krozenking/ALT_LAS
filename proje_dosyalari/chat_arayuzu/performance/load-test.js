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

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp-up to 10 users over 1 minute
    { duration: '3m', target: 10 },   // Stay at 10 users for 3 minutes
    { duration: '1m', target: 50 },   // Ramp-up to 50 users over 1 minute
    { duration: '3m', target: 50 },   // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 },  // Ramp-up to 100 users over 1 minute
    { duration: '3m', target: 100 },  // Stay at 100 users for 3 minutes
    { duration: '1m', target: 0 },    // Ramp-down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
    'chat_response_time': ['p(95)<3000'], // 95% of chat responses should be below 3000ms
    'failed_requests': ['rate<0.01'],  // Less than 1% of requests should fail
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
  console.log('Setting up load test');
  
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

// Teardown function (runs once after all VUs are done)
export function teardown(data) {
  console.log('Teardown load test');
}

// Default function (runs for each VU)
export default function(data) {
  const baseUrl = data.baseUrl;
  const apiKey = data.apiKey;
  
  // Generate a unique user ID for this VU
  const userId = `user_${__VU}_${randomString(8)}`;
  
  // 1. Health check
  group('Health Check', function() {
    const res = http.get(`${baseUrl}/api/health`);
    
    check(res, {
      'health check status is 200': (r) => r.status === 200,
      'health check response time < 200ms': (r) => r.timings.duration < 200,
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
      'get models status is 200': (r) => r.status === 200,
      'get models response time < 500ms': (r) => r.timings.duration < 500,
      'get models response has models': (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body.models) && body.models.length > 0;
      }
    }) || failedRequests.add(1);
    
    sleep(1);
  });
  
  // 3. Send chat message
  group('Send Chat Message', function() {
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
        const body = JSON.parse(r.body);
        return body.text && body.text.length > 0;
      },
      'chat response has model': (r) => {
        const body = JSON.parse(r.body);
        return body.model && body.model.length > 0;
      }
    });
    
    if (!success) {
      failedRequests.add(1);
    } else {
      chatResponsesReceived.add(1);
      chatResponseTime.add(res.timings.duration);
    }
    
    // Simulate user reading the response
    sleep(randomIntBetween(3, 10));
  });
  
  // 4. Get chat history
  group('Get Chat History', function() {
    const res = http.get(`${baseUrl}/api/chat/history?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    check(res, {
      'history status is 200': (r) => r.status === 200,
      'history response time < 500ms': (r) => r.timings.duration < 500,
      'history response has messages': (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body.messages);
      }
    }) || failedRequests.add(1);
    
    sleep(1);
  });
  
  // 5. Clear chat history
  group('Clear Chat History', function() {
    const res = http.del(`${baseUrl}/api/chat/history?userId=${userId}`, null, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    check(res, {
      'clear history status is 200': (r) => r.status === 200,
      'clear history response time < 500ms': (r) => r.timings.duration < 500
    }) || failedRequests.add(1);
    
    sleep(1);
  });
}

// Generate HTML report
export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
    'summary.json': JSON.stringify(data),
  };
}
