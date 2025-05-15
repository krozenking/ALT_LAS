import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import './GpuPerformanceChart.css';

/**
 * GPU Performance Chart Component
 * 
 * A real-time line chart for visualizing GPU performance metrics.
 * 
 * @component
 * @example
 * ```jsx
 * <GpuPerformanceChart 
 *   deviceId={0}
 *   metric="utilization"
 *   timeRange={300}
 *   height={300}
 *   width={600}
 *   refreshInterval={1000}
 * />
 * ```
 */
const GpuPerformanceChart = ({
  deviceId,
  metric,
  timeRange,
  height,
  width,
  refreshInterval,
  showThreshold,
  thresholdValue,
  title,
  className,
}) => {
  // State for storing the time series data
  const [data, setData] = useState([]);
  
  // Refs for D3 elements
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  const pathRef = useRef(null);
  const thresholdRef = useRef(null);
  
  // State for tracking the chart dimensions
  const [dimensions, setDimensions] = useState({
    width: width,
    height: height,
    margin: { top: 30, right: 30, bottom: 50, left: 60 }
  });
  
  // Effect for handling window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const containerWidth = svgRef.current.parentElement.clientWidth;
        setDimensions(prev => ({
          ...prev,
          width: containerWidth || width
        }));
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);
  
  // Effect for fetching data
  useEffect(() => {
    let intervalId;
    
    const fetchData = async () => {
      try {
        // In a real application, this would be an API call
        // For this example, we'll generate random data
        const now = new Date();
        const newDataPoint = {
          timestamp: now,
          value: getMetricValue(metric)
        };
        
        setData(prevData => {
          // Add new data point
          const newData = [...prevData, newDataPoint];
          
          // Remove data points outside the time range
          const cutoff = new Date(now.getTime() - timeRange * 1000);
          return newData.filter(d => d.timestamp > cutoff);
        });
      } catch (error) {
        console.error('Error fetching GPU metrics:', error);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Set up interval for real-time updates
    intervalId = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [deviceId, metric, timeRange, refreshInterval]);
  
  // Effect for drawing the chart
  useEffect(() => {
    if (!data.length || !svgRef.current) return;
    
    const { width, height, margin } = dimensions;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain([
        d3.min(data, d => d.timestamp),
        d3.max(data, d => d.timestamp)
      ])
      .range([0, chartWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, getMetricMaxValue(metric)])
      .range([chartHeight, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.timeFormat('%H:%M:%S'));
    
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => getMetricFormatter(metric)(d));
    
    // Draw axes
    d3.select(xAxisRef.current)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    d3.select(yAxisRef.current)
      .call(yAxis);
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
    
    // Draw line
    d3.select(pathRef.current)
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', getMetricColor(metric))
      .attr('stroke-width', 2);
    
    // Draw threshold line if enabled
    if (showThreshold && thresholdRef.current) {
      d3.select(thresholdRef.current)
        .attr('x1', 0)
        .attr('y1', yScale(thresholdValue))
        .attr('x2', chartWidth)
        .attr('y2', yScale(thresholdValue))
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,5');
    }
  }, [data, dimensions, metric, showThreshold, thresholdValue]);
  
  // Helper function to get random metric values (for demo purposes)
  const getMetricValue = (metricName) => {
    switch (metricName) {
      case 'utilization':
        return Math.random() * 100;
      case 'memory':
        return Math.random() * 16384; // 16 GB in MB
      case 'temperature':
        return 50 + Math.random() * 40; // 50-90°C
      default:
        return Math.random() * 100;
    }
  };
  
  // Helper function to get the maximum value for a metric
  const getMetricMaxValue = (metricName) => {
    switch (metricName) {
      case 'utilization':
        return 100; // 0-100%
      case 'memory':
        return 16384; // 16 GB in MB
      case 'temperature':
        return 100; // 0-100°C
      default:
        return 100;
    }
  };
  
  // Helper function to get the color for a metric
  const getMetricColor = (metricName) => {
    switch (metricName) {
      case 'utilization':
        return '#4CAF50'; // Green
      case 'memory':
        return '#2196F3'; // Blue
      case 'temperature':
        return '#FF5722'; // Orange
      default:
        return '#9C27B0'; // Purple
    }
  };
  
  // Helper function to get the formatter for a metric
  const getMetricFormatter = (metricName) => {
    switch (metricName) {
      case 'utilization':
        return d => `${d.toFixed(0)}%`;
      case 'memory':
        return d => `${(d / 1024).toFixed(1)} GB`;
      case 'temperature':
        return d => `${d.toFixed(0)}°C`;
      default:
        return d => d.toFixed(0);
    }
  };
  
  // Helper function to get the title for a metric
  const getMetricTitle = (metricName) => {
    switch (metricName) {
      case 'utilization':
        return 'GPU Utilization';
      case 'memory':
        return 'GPU Memory Usage';
      case 'temperature':
        return 'GPU Temperature';
      default:
        return 'GPU Metric';
    }
  };
  
  const { margin } = dimensions;
  const chartTitle = title || `${getMetricTitle(metric)} - GPU ${deviceId}`;
  
  return (
    <div className={`gpu-performance-chart ${className || ''}`}>
      <h3 className="chart-title">{chartTitle}</h3>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="chart-svg"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          <g
            ref={xAxisRef}
            transform={`translate(0,${dimensions.height - margin.top - margin.bottom})`}
            className="x-axis"
          />
          <g
            ref={yAxisRef}
            className="y-axis"
          />
          <path
            ref={pathRef}
            className="line-path"
          />
          {showThreshold && (
            <line
              ref={thresholdRef}
              className="threshold-line"
            />
          )}
        </g>
      </svg>
      <div className="chart-legend">
        <div className="legend-item">
          <div 
            className="legend-color" 
            style={{ backgroundColor: getMetricColor(metric) }}
          />
          <span>{getMetricTitle(metric)}</span>
        </div>
        {showThreshold && (
          <div className="legend-item">
            <div className="legend-color threshold-color" />
            <span>Threshold: {getMetricFormatter(metric)(thresholdValue)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

GpuPerformanceChart.propTypes = {
  /** GPU device ID */
  deviceId: PropTypes.number,
  /** Metric to display (utilization, memory, temperature) */
  metric: PropTypes.oneOf(['utilization', 'memory', 'temperature']),
  /** Time range in seconds */
  timeRange: PropTypes.number,
  /** Chart height in pixels */
  height: PropTypes.number,
  /** Chart width in pixels (or null for responsive) */
  width: PropTypes.number,
  /** Data refresh interval in milliseconds */
  refreshInterval: PropTypes.number,
  /** Whether to show threshold line */
  showThreshold: PropTypes.bool,
  /** Threshold value */
  thresholdValue: PropTypes.number,
  /** Chart title (optional) */
  title: PropTypes.string,
  /** Additional CSS class name */
  className: PropTypes.string,
};

GpuPerformanceChart.defaultProps = {
  deviceId: 0,
  metric: 'utilization',
  timeRange: 300, // 5 minutes
  height: 300,
  width: 600,
  refreshInterval: 1000, // 1 second
  showThreshold: false,
  thresholdValue: 80,
  title: '',
  className: '',
};

export default GpuPerformanceChart;
