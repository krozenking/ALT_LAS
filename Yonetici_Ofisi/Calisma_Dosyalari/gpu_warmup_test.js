import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Custom metrics
const errorRate = new Rate('error_rate');
const p95Trend = new Trend('p95');
const p99Trend = new Trend('p99');
const gpuMemoryTrend = new Trend('gpu_memory_mb');
const gpuUtilizationTrend = new Trend('gpu_utilization_percent');

// Load test data
const testData = new SharedArray('test_data', function() {
  return JSON.parse(open('./test_data.json')).slice(0, 1000);
});

// Test configuration
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
    ramp_up: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      stages: [
        { duration: '1m', target: 5 },
        { duration: '2m', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 10 },
      ],
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    error_rate: ['rate<0.01'],
  },
};

// Setup function - runs once at the beginning of the test
export function setup() {
  console.log(`Starting GPU warmup test in ${__ENV.TEST_TYPE} mode`);
  
  // Check if the service is ready
  const healthCheck = http.get('http://ai-orchestrator.altlas.local/health');
  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
    'service is ready': (r) => r.json().status === 'ok',
  });
  
  // Get initial GPU metrics
  const gpuMetrics = http.get('http://ai-orchestrator.altlas.local/api/v1/gpu/status');
  check(gpuMetrics, {
    'GPU metrics status is 200': (r) => r.status === 200,
  });
  
  if (gpuMetrics.status === 200) {
    const metrics = gpuMetrics.json();
    console.log(`Initial GPU memory: ${metrics.gpu_info.memory_used_mb} MB`);
    console.log(`Initial GPU utilization: ${metrics.gpu_info.utilization_percent}%`);
  }
  
  return { startTime: new Date().toISOString() };
}

// Default function - called for each VU
export default function(data) {
  // Get a random test sample
  const testSample = testData[Math.floor(Math.random() * testData.length)];
  
  // Prepare request payload
  const payload = JSON.stringify({
    text: testSample.text,
    max_length: testSample.max_length || 128,
    temperature: testSample.temperature || 0.7,
  });
  
  // Set request headers
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': `k6-test-${__VU}-${__ITER}`,
    },
  };
  
  // Send request to the API
  const response = http.post('http://ai-orchestrator.altlas.local/api/v1/predict', payload, params);
  
  // Check if the request was successful
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has meta data': (r) => r.json().meta !== undefined,
  });
  
  // Record error rate
  errorRate.add(!success);
  
  // If the request was successful, record performance metrics
  if (success) {
    const responseBody = response.json();
    const meta = responseBody.meta;
    
    // Record processing time metrics
    if (meta && meta.processing_time) {
      p95Trend.add(meta.processing_time.total_ms);
      
      // Calculate and record p99 (this is a simplification, actual p99 calculation would be done in the analysis phase)
      p99Trend.add(meta.processing_time.total_ms * 1.2); // Simplified approximation for this example
    }
    
    // Record GPU resource metrics
    if (meta && meta.gpu_resources) {
      gpuMemoryTrend.add(meta.gpu_resources.memory_used_mb);
      gpuUtilizationTrend.add(meta.gpu_resources.utilization_percent);
    }
  }
  
  // Add some think time between requests
  sleep(1);
}

// Teardown function - runs once at the end of the test
export function teardown(data) {
  console.log(`Completed GPU warmup test in ${__ENV.TEST_TYPE} mode`);
  console.log(`Test duration: ${(new Date() - new Date(data.startTime)) / 1000} seconds`);
  
  // Get final GPU metrics
  const gpuMetrics = http.get('http://ai-orchestrator.altlas.local/api/v1/gpu/status');
  
  if (gpuMetrics.status === 200) {
    const metrics = gpuMetrics.json();
    console.log(`Final GPU memory: ${metrics.gpu_info.memory_used_mb} MB`);
    console.log(`Final GPU utilization: ${metrics.gpu_info.utilization_percent}%`);
  }
}

// Generate HTML report
export function handleSummary(data) {
  return {
    "gpu_warmup_test_summary.html": htmlReport(data),
    "gpu_warmup_test_summary.json": JSON.stringify(data),
  };
}
