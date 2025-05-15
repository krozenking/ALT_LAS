import React, { useState } from 'react';
import GpuPerformanceChart from './GpuPerformanceChart';
import PercentileResponseTimeChart from './PercentileResponseTimeChart';
import './DashboardExample.css';

/**
 * Dashboard Example Component
 * 
 * A sample dashboard layout with GPU performance and response time charts.
 * 
 * @component
 */
const DashboardExample = () => {
  // State for filter settings
  const [filters, setFilters] = useState({
    timeRange: 300, // 5 minutes
    serviceId: 'ai-orchestrator',
    deviceId: 0,
    refreshInterval: 1000, // 1 second
  });
  
  // Available services for filter
  const services = [
    { id: 'ai-orchestrator', name: 'AI Orchestrator' },
    { id: 'segmentation-service', name: 'Segmentation Service' },
    { id: 'api-gateway', name: 'API Gateway' },
  ];
  
  // Available GPUs for filter
  const gpus = [
    { id: 0, name: 'GPU 0' },
    { id: 1, name: 'GPU 1' },
  ];
  
  // Available time ranges for filter
  const timeRanges = [
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 86400, label: '24 hours' },
  ];
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'deviceId' || name === 'timeRange' ? parseInt(value, 10) : value,
    }));
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>ALT_LAS Performance Dashboard</h1>
        <div className="filter-panel">
          <div className="filter-group">
            <label htmlFor="serviceId">Service:</label>
            <select
              id="serviceId"
              name="serviceId"
              value={filters.serviceId}
              onChange={handleFilterChange}
            >
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="deviceId">GPU:</label>
            <select
              id="deviceId"
              name="deviceId"
              value={filters.deviceId}
              onChange={handleFilterChange}
            >
              {gpus.map(gpu => (
                <option key={gpu.id} value={gpu.id}>
                  {gpu.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="timeRange">Time Range:</label>
            <select
              id="timeRange"
              name="timeRange"
              value={filters.timeRange}
              onChange={handleFilterChange}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        <section className="dashboard-row">
          <div className="dashboard-card full-width">
            <PercentileResponseTimeChart
              serviceId={filters.serviceId}
              timeRange={filters.timeRange}
              refreshInterval={filters.refreshInterval}
              showSla={true}
              slaP95={200}
              slaP99={500}
            />
          </div>
        </section>
        
        <section className="dashboard-row">
          <div className="dashboard-card">
            <GpuPerformanceChart
              deviceId={filters.deviceId}
              metric="utilization"
              timeRange={filters.timeRange}
              refreshInterval={filters.refreshInterval}
              showThreshold={true}
              thresholdValue={80}
            />
          </div>
          
          <div className="dashboard-card">
            <GpuPerformanceChart
              deviceId={filters.deviceId}
              metric="memory"
              timeRange={filters.timeRange}
              refreshInterval={filters.refreshInterval}
              showThreshold={true}
              thresholdValue={14000} // ~14GB
            />
          </div>
        </section>
        
        <section className="dashboard-row">
          <div className="dashboard-card">
            <GpuPerformanceChart
              deviceId={filters.deviceId}
              metric="temperature"
              timeRange={filters.timeRange}
              refreshInterval={filters.refreshInterval}
              showThreshold={true}
              thresholdValue={85}
            />
          </div>
          
          <div className="dashboard-card">
            <div className="stats-container">
              <h3>Performance Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Avg. Response Time</div>
                  <div className="stat-value">125 ms</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">P95 Response Time</div>
                  <div className="stat-value">187 ms</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">P99 Response Time</div>
                  <div className="stat-value">432 ms</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Requests/sec</div>
                  <div className="stat-value">42.5</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">GPU Utilization</div>
                  <div className="stat-value">67%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">GPU Memory</div>
                  <div className="stat-value">8.2 GB</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Error Rate</div>
                  <div className="stat-value">0.02%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Uptime</div>
                  <div className="stat-value">99.98%</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="dashboard-footer">
        <p>ALT_LAS Performance Dashboard | Last updated: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
};

export default DashboardExample;
