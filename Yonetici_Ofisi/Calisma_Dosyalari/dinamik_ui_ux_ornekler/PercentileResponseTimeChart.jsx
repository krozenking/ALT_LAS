import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import './PercentileResponseTimeChart.css';

/**
 * Percentile Response Time Chart Component
 * 
 * A line chart for visualizing 95th and 99th percentile response times.
 * 
 * @component
 * @example
 * ```jsx
 * <PercentileResponseTimeChart 
 *   serviceId="ai-orchestrator"
 *   timeRange={3600}
 *   height={300}
 *   width={600}
 *   refreshInterval={5000}
 *   showSla={true}
 *   slaP95={200}
 *   slaP99={500}
 * />
 * ```
 */
const PercentileResponseTimeChart = ({
  serviceId,
  timeRange,
  height,
  width,
  refreshInterval,
  showSla,
  slaP95,
  slaP99,
  title,
  className,
}) => {
  // State for storing the time series data
  const [data, setData] = useState([]);
  
  // Refs for D3 elements
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  const p95PathRef = useRef(null);
  const p99PathRef = useRef(null);
  const slaP95Ref = useRef(null);
  const slaP99Ref = useRef(null);
  
  // State for tracking the chart dimensions
  const [dimensions, setDimensions] = useState({
    width: width,
    height: height,
    margin: { top: 30, right: 50, bottom: 50, left: 60 }
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
          p95: getRandomResponseTime(150, 250),
          p99: getRandomResponseTime(350, 550)
        };
        
        setData(prevData => {
          // Add new data point
          const newData = [...prevData, newDataPoint];
          
          // Remove data points outside the time range
          const cutoff = new Date(now.getTime() - timeRange * 1000);
          return newData.filter(d => d.timestamp > cutoff);
        });
      } catch (error) {
        console.error('Error fetching response time metrics:', error);
      }
    };
    
    // Generate initial data
    const generateInitialData = () => {
      const now = new Date();
      const initialData = [];
      
      // Generate data points for the past timeRange seconds
      for (let i = timeRange; i >= 0; i -= Math.floor(refreshInterval / 1000)) {
        const timestamp = new Date(now.getTime() - i * 1000);
        initialData.push({
          timestamp,
          p95: getRandomResponseTime(150, 250),
          p99: getRandomResponseTime(350, 550)
        });
      }
      
      setData(initialData);
    };
    
    // Generate initial data
    generateInitialData();
    
    // Set up interval for real-time updates
    intervalId = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [serviceId, timeRange, refreshInterval]);
  
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
    
    // Find the maximum value for y-scale
    const maxP95 = d3.max(data, d => d.p95);
    const maxP99 = d3.max(data, d => d.p99);
    const maxSla = Math.max(slaP95, slaP99);
    const yMax = Math.max(maxP95, maxP99, maxSla) * 1.2; // Add 20% padding
    
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([chartHeight, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.timeFormat('%H:%M:%S'));
    
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d} ms`);
    
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
    
    // Create line generators
    const p95Line = d3.line()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.p95))
      .curve(d3.curveMonotoneX);
    
    const p99Line = d3.line()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.p99))
      .curve(d3.curveMonotoneX);
    
    // Draw lines
    d3.select(p95PathRef.current)
      .datum(data)
      .attr('d', p95Line)
      .attr('fill', 'none')
      .attr('stroke', '#4CAF50') // Green
      .attr('stroke-width', 2);
    
    d3.select(p99PathRef.current)
      .datum(data)
      .attr('d', p99Line)
      .attr('fill', 'none')
      .attr('stroke', '#FF9800') // Orange
      .attr('stroke-width', 2);
    
    // Draw SLA lines if enabled
    if (showSla) {
      if (slaP95Ref.current) {
        d3.select(slaP95Ref.current)
          .attr('x1', 0)
          .attr('y1', yScale(slaP95))
          .attr('x2', chartWidth)
          .attr('y2', yScale(slaP95))
          .attr('stroke', '#4CAF50') // Green
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '5,5');
      }
      
      if (slaP99Ref.current) {
        d3.select(slaP99Ref.current)
          .attr('x1', 0)
          .attr('y1', yScale(slaP99))
          .attr('x2', chartWidth)
          .attr('y2', yScale(slaP99))
          .attr('stroke', '#FF9800') // Orange
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '5,5');
      }
    }
  }, [data, dimensions, showSla, slaP95, slaP99]);
  
  // Helper function to generate random response times
  const getRandomResponseTime = (min, max) => {
    return Math.floor(min + Math.random() * (max - min));
  };
  
  const { margin } = dimensions;
  const chartTitle = title || `Response Time Percentiles - ${serviceId}`;
  
  return (
    <div className={`percentile-response-time-chart ${className || ''}`}>
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
            ref={p95PathRef}
            className="line-path p95-line"
          />
          <path
            ref={p99PathRef}
            className="line-path p99-line"
          />
          {showSla && (
            <>
              <line
                ref={slaP95Ref}
                className="sla-line p95-sla"
              />
              <line
                ref={slaP99Ref}
                className="sla-line p99-sla"
              />
            </>
          )}
        </g>
      </svg>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color p95-color" />
          <span>95th Percentile</span>
        </div>
        <div className="legend-item">
          <div className="legend-color p99-color" />
          <span>99th Percentile</span>
        </div>
        {showSla && (
          <>
            <div className="legend-item">
              <div className="legend-color p95-sla-color" />
              <span>P95 SLA: {slaP95} ms</span>
            </div>
            <div className="legend-item">
              <div className="legend-color p99-sla-color" />
              <span>P99 SLA: {slaP99} ms</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

PercentileResponseTimeChart.propTypes = {
  /** Service ID */
  serviceId: PropTypes.string.isRequired,
  /** Time range in seconds */
  timeRange: PropTypes.number,
  /** Chart height in pixels */
  height: PropTypes.number,
  /** Chart width in pixels (or null for responsive) */
  width: PropTypes.number,
  /** Data refresh interval in milliseconds */
  refreshInterval: PropTypes.number,
  /** Whether to show SLA lines */
  showSla: PropTypes.bool,
  /** 95th percentile SLA in milliseconds */
  slaP95: PropTypes.number,
  /** 99th percentile SLA in milliseconds */
  slaP99: PropTypes.number,
  /** Chart title (optional) */
  title: PropTypes.string,
  /** Additional CSS class name */
  className: PropTypes.string,
};

PercentileResponseTimeChart.defaultProps = {
  timeRange: 3600, // 1 hour
  height: 300,
  width: 600,
  refreshInterval: 5000, // 5 seconds
  showSla: true,
  slaP95: 200,
  slaP99: 500,
  title: '',
  className: '',
};

export default PercentileResponseTimeChart;
