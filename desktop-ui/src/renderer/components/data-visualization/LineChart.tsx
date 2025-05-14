import React from 'react';
import Chart, { ChartProps, ChartDataPoint, ChartDataset, ChartData, ChartOptions } from './Chart';
import { useColorMode, useTheme } from '@chakra-ui/react';

export interface LineChartProps extends Omit<ChartProps, 'type' | 'data'> {
  /**
   * Chart data points
   */
  dataPoints?: ChartDataPoint[];
  /**
   * Chart datasets
   */
  datasets?: ChartDataset[];
  /**
   * Chart data
   */
  data?: ChartData;
  /**
   * Chart labels
   */
  labels?: string[];
  /**
   * Whether to show area
   */
  showArea?: boolean;
  /**
   * Whether to use curved lines
   */
  useCurvedLines?: boolean;
  /**
   * Whether to show points
   */
  showPoints?: boolean;
  /**
   * Whether to use stepped lines
   */
  useStepped?: boolean | 'before' | 'after' | 'middle';
  /**
   * Whether to span gaps
   */
  spanGaps?: boolean;
  /**
   * Line tension
   */
  tension?: number;
  /**
   * Point radius
   */
  pointRadius?: number;
  /**
   * Point hover radius
   */
  pointHoverRadius?: number;
  /**
   * Border width
   */
  borderWidth?: number;
  /**
   * Whether to use dashed lines
   */
  useDashedLines?: boolean;
  /**
   * Border dash pattern
   */
  borderDash?: number[];
  /**
   * Border dash offset
   */
  borderDashOffset?: number;
  /**
   * Whether to use gradient
   */
  useGradient?: boolean;
  /**
   * Gradient start color
   */
  gradientStartColor?: string;
  /**
   * Gradient end color
   */
  gradientEndColor?: string;
  /**
   * Gradient start opacity
   */
  gradientStartOpacity?: number;
  /**
   * Gradient end opacity
   */
  gradientEndOpacity?: number;
  /**
   * Whether to stack datasets
   */
  stacked?: boolean;
  /**
   * Whether to normalize data
   */
  normalized?: boolean;
  /**
   * Whether to show min value
   */
  showMinValue?: boolean;
  /**
   * Whether to show max value
   */
  showMaxValue?: boolean;
  /**
   * Whether to show average value
   */
  showAverageValue?: boolean;
  /**
   * Whether to show trend line
   */
  showTrendLine?: boolean;
  /**
   * Whether to show threshold line
   */
  showThresholdLine?: boolean;
  /**
   * Threshold value
   */
  thresholdValue?: number;
  /**
   * Threshold line color
   */
  thresholdLineColor?: string;
  /**
   * Threshold line width
   */
  thresholdLineWidth?: number;
  /**
   * Threshold line dash
   */
  thresholdLineDash?: number[];
  /**
   * Whether to show target line
   */
  showTargetLine?: boolean;
  /**
   * Target value
   */
  targetValue?: number;
  /**
   * Target line color
   */
  targetLineColor?: string;
  /**
   * Target line width
   */
  targetLineWidth?: number;
  /**
   * Target line dash
   */
  targetLineDash?: number[];
  /**
   * Whether to show annotations
   */
  showAnnotations?: boolean;
  /**
   * Annotations
   */
  annotations?: {
    type: 'line' | 'box' | 'point' | 'ellipse';
    xMin?: number | string;
    xMax?: number | string;
    yMin?: number;
    yMax?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderDash?: number[];
    borderRadius?: number;
    label?: {
      content: string;
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
      backgroundColor?: string;
      color?: string;
      font?: {
        family?: string;
        size?: number;
        style?: 'normal' | 'italic' | 'oblique';
        weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
      };
      padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
    };
  }[];
}

/**
 * Line chart component
 */
const LineChart: React.FC<LineChartProps> = ({
  dataPoints,
  datasets,
  data,
  labels,
  showArea = false,
  useCurvedLines = true,
  showPoints = true,
  useStepped = false,
  spanGaps = true,
  tension = 0.4,
  pointRadius = 3,
  pointHoverRadius = 5,
  borderWidth = 2,
  useDashedLines = false,
  borderDash = [5, 5],
  borderDashOffset = 0,
  useGradient = false,
  gradientStartColor,
  gradientEndColor,
  gradientStartOpacity = 0.8,
  gradientEndOpacity = 0.2,
  stacked = false,
  normalized = false,
  showMinValue = false,
  showMaxValue = false,
  showAverageValue = false,
  showTrendLine = false,
  showThresholdLine = false,
  thresholdValue = 0,
  thresholdLineColor = 'red',
  thresholdLineWidth = 1,
  thresholdLineDash = [5, 5],
  showTargetLine = false,
  targetValue = 0,
  targetLineColor = 'green',
  targetLineWidth = 1,
  targetLineDash = [5, 5],
  showAnnotations = false,
  annotations = [],
  options,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();

  // Prepare chart data
  const chartData: ChartData = data || {
    labels: labels || [],
    datasets: datasets || (dataPoints ? [
      {
        label: 'Data',
        data: dataPoints,
        borderColor: colorMode === 'light' ? theme.colors.blue[500] : theme.colors.blue[300],
        backgroundColor: showArea
          ? colorMode === 'light'
            ? `${theme.colors.blue[500]}40`
            : `${theme.colors.blue[300]}40`
          : 'transparent',
        borderWidth,
        tension: useCurvedLines ? tension : 0,
        pointRadius: showPoints ? pointRadius : 0,
        pointHoverRadius: showPoints ? pointHoverRadius : 0,
        pointBackgroundColor: colorMode === 'light' ? theme.colors.blue[500] : theme.colors.blue[300],
        pointBorderColor: colorMode === 'light' ? theme.colors.white : theme.colors.gray[800],
        pointBorderWidth: 1,
        fill: showArea,
        borderDash: useDashedLines ? borderDash : [],
        borderDashOffset: useDashedLines ? borderDashOffset : 0,
        stepped: useStepped,
        spanGaps,
      },
    ] : []),
  };

  // Prepare chart options
  const chartOptions: ChartOptions = {
    scales: {
      x: {
        stacked,
      },
      y: {
        stacked,
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    ...options,
  };

  // Add annotations if needed
  if (showAnnotations && annotations.length > 0) {
    chartOptions.plugins = {
      ...chartOptions.plugins,
      annotation: {
        annotations: annotations.reduce((acc, annotation, index) => {
          acc[`annotation-${index}`] = annotation;
          return acc;
        }, {}),
      },
    };
  }

  // Add threshold line if needed
  if (showThresholdLine) {
    chartOptions.plugins = {
      ...chartOptions.plugins,
      annotation: {
        ...chartOptions.plugins?.annotation,
        annotations: {
          ...chartOptions.plugins?.annotation?.annotations,
          thresholdLine: {
            type: 'line',
            yMin: thresholdValue,
            yMax: thresholdValue,
            borderColor: thresholdLineColor,
            borderWidth: thresholdLineWidth,
            borderDash: thresholdLineDash,
            label: {
              content: `Threshold: ${thresholdValue}`,
              position: 'end',
              backgroundColor: thresholdLineColor,
            },
          },
        },
      },
    };
  }

  // Add target line if needed
  if (showTargetLine) {
    chartOptions.plugins = {
      ...chartOptions.plugins,
      annotation: {
        ...chartOptions.plugins?.annotation,
        annotations: {
          ...chartOptions.plugins?.annotation?.annotations,
          targetLine: {
            type: 'line',
            yMin: targetValue,
            yMax: targetValue,
            borderColor: targetLineColor,
            borderWidth: targetLineWidth,
            borderDash: targetLineDash,
            label: {
              content: `Target: ${targetValue}`,
              position: 'end',
              backgroundColor: targetLineColor,
            },
          },
        },
      },
    };
  }

  // Add min, max, and average values if needed
  if (showMinValue || showMaxValue || showAverageValue) {
    // Calculate min, max, and average values
    const allValues = chartData.datasets.flatMap(dataset => dataset.data.map(point => typeof point === 'object' ? (point as ChartDataPoint).y : point as number));
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const averageValue = allValues.reduce((sum, value) => sum + value, 0) / allValues.length;

    // Add annotations
    chartOptions.plugins = {
      ...chartOptions.plugins,
      annotation: {
        ...chartOptions.plugins?.annotation,
        annotations: {
          ...chartOptions.plugins?.annotation?.annotations,
          ...(showMinValue ? {
            minLine: {
              type: 'line',
              yMin: minValue,
              yMax: minValue,
              borderColor: colorMode === 'light' ? theme.colors.blue[500] : theme.colors.blue[300],
              borderWidth: 1,
              borderDash: [2, 2],
              label: {
                content: `Min: ${minValue}`,
                position: 'start',
                backgroundColor: colorMode === 'light' ? theme.colors.blue[500] : theme.colors.blue[300],
              },
            },
          } : {}),
          ...(showMaxValue ? {
            maxLine: {
              type: 'line',
              yMin: maxValue,
              yMax: maxValue,
              borderColor: colorMode === 'light' ? theme.colors.green[500] : theme.colors.green[300],
              borderWidth: 1,
              borderDash: [2, 2],
              label: {
                content: `Max: ${maxValue}`,
                position: 'start',
                backgroundColor: colorMode === 'light' ? theme.colors.green[500] : theme.colors.green[300],
              },
            },
          } : {}),
          ...(showAverageValue ? {
            avgLine: {
              type: 'line',
              yMin: averageValue,
              yMax: averageValue,
              borderColor: colorMode === 'light' ? theme.colors.orange[500] : theme.colors.orange[300],
              borderWidth: 1,
              borderDash: [2, 2],
              label: {
                content: `Avg: ${averageValue.toFixed(2)}`,
                position: 'start',
                backgroundColor: colorMode === 'light' ? theme.colors.orange[500] : theme.colors.orange[300],
              },
            },
          } : {}),
        },
      },
    };
  }

  // Add trend line if needed
  if (showTrendLine && dataPoints && dataPoints.length > 1) {
    // Calculate trend line using linear regression
    const xValues = dataPoints.map((_, i) => i);
    const yValues = dataPoints.map(point => typeof point === 'object' ? (point as ChartDataPoint).y : point as number);
    
    const n = xValues.length;
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const startY = intercept;
    const endY = slope * (n - 1) + intercept;
    
    // Add trend line dataset
    chartData.datasets.push({
      label: 'Trend',
      data: [
        { x: 0, y: startY },
        { x: n - 1, y: endY },
      ],
      borderColor: colorMode === 'light' ? theme.colors.purple[500] : theme.colors.purple[300],
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      tension: 0,
    });
  }

  // Apply gradient if needed
  if (useGradient && chartData.datasets.length > 0) {
    const originalDataset = { ...chartData.datasets[0] };
    
    chartData.datasets[0].backgroundColor = (context) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      
      if (!chartArea) {
        return originalDataset.backgroundColor as string;
      }
      
      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient.addColorStop(0, `${gradientEndColor || originalDataset.borderColor}${Math.round(gradientEndOpacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${gradientStartColor || originalDataset.borderColor}${Math.round(gradientStartOpacity * 255).toString(16).padStart(2, '0')}`);
      
      return gradient;
    };
  }

  return (
    <Chart
      type="line"
      data={chartData}
      options={chartOptions}
      {...rest}
    />
  );
};

export default LineChart;
