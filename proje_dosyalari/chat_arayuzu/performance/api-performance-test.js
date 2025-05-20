/**
 * API Performance Test
 * 
 * This test measures the performance of the chat API under various load conditions.
 * It tests the API's response time, throughput, and error rate.
 */

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Custom metrics
const apiCalls = new Counter('api_calls');
const successfulResponses = new Counter('successful_responses');
const failedResponses = new Counter('failed_responses');
const responseTime = new Trend('response_time');
const errorRate = new Rate('error_rate');
const tokenProcessingRate = new Trend('token_processing_rate');

// Test configuration
export const options = {
  scenarios: {
    // Scenario 1: Constant load
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
      tags: { scenario: 'constant_load' }
    },
    
    // Scenario 2: Ramp-up load
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 }
      ],
      tags: { scenario: 'ramp_up' }
    },
    
    // Scenario 3: Spike test
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 0 },
        { duration: '10s', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 0 }
      ],
      tags: { scenario: 'spike' }
    }
  },
  thresholds: {
    'response_time': ['p(95)<3000'], // 95% of requests should be below 3000ms
    'error_rate': ['rate<0.05'],     // Less than 5% of requests should fail
    'token_processing_rate': ['p(95)>10'], // 95% of requests should process at least 10 tokens per second
  }
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
  'Explain quantum computing in simple terms'
];

// Utility functions
function getRandomModel() {
  return models[Math.floor(Math.random() * models.length)];
}

function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Estimate token count in a string (very rough approximation)
function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

// Setup function (runs once per VU)
export function setup() {
  console.log('Setting up API performance test');
  
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
  
  group('Chat API Performance', function() {
    // Select a random model and message
    const model = getRandomModel();
    const message = getRandomMessage();
    
    // Prepare the request payload
    const payload = JSON.stringify({
      message: message,
      model: model,
      userId: userId
    });
    
    // Record the start time
    const startTime = new Date();
    
    // Send the request
    const res = http.post(`${baseUrl}/api/chat`, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Record the end time
    const endTime = new Date();
    const duration = endTime - startTime;
    
    // Increment the API calls counter
    apiCalls.add(1);
    
    // Check if the request was successful
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'has response text': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.text && body.text.length > 0;
        } catch (e) {
          return false;
        }
      }
    });
    
    // Record metrics based on the response
    if (success) {
      successfulResponses.add(1);
      responseTime.add(duration);
      
      try {
        const body = JSON.parse(res.body);
        const responseTokens = estimateTokenCount(body.text);
        const promptTokens = estimateTokenCount(message);
        const totalTokens = responseTokens + promptTokens;
        
        // Calculate tokens per second
        const tokensPerSecond = totalTokens / (duration / 1000);
        tokenProcessingRate.add(tokensPerSecond);
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    } else {
      failedResponses.add(1);
      errorRate.add(1);
    }
    
    // Add some think time to simulate real user behavior
    sleep(randomIntBetween(1, 3));
  });
}

// Generate HTML report
export function handleSummary(data) {
  return {
    'api-performance-summary.html': htmlReport(data),
    'api-performance-summary.json': JSON.stringify(data),
  };
}
