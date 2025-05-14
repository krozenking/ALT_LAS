import React from 'react';
import Chart, { ChartProps, ChartDataPoint, ChartDataset, ChartData, ChartOptions } from './Chart';
import { useColorMode, useTheme } from '@chakra-ui/react';

export interface PieChartProps extends Omit<ChartProps, 'type' | 'data'> {
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
   * Whether to use doughnut chart
   */
  doughnut?: boolean;
  /**
   * Doughnut cutout percentage
   */
  cutoutPercentage?: number;
  /**
   * Rotation angle in degrees
   */
  rotation?: number;
  /**
   * Circumference angle in degrees
   */
  circumference?: number;
  /**
   * Radius percentage
   */
  radiusPercentage?: number;
  /**
   * Border width
   */
  borderWidth?: number;
  /**
   * Border color
   */
  borderColor?: string;
  /**
   * Border align
   */
  borderAlign?: 'center' | 'inner';
  /**
   * Spacing between segments
   */
  spacing?: number;
  /**
   * Whether to use custom colors
   */
  useCustomColors?: boolean;
  /**
   * Custom colors
   */
  customColors?: string[];
  /**
   * Whether to show data labels
   */
  showDataLabels?: boolean;
  /**
   * Data label position
   */
  dataLabelPosition?: 'inside' | 'outside' | 'border';
  /**
   * Data label color
   */
  dataLabelColor?: string;
  /**
   * Data label font size
   */
  dataLabelFontSize?: number;
  /**
   * Data label font weight
   */
  dataLabelFontWeight?: string | number;
  /**
   * Data label formatter
   */
  dataLabelFormatter?: (value: number, label?: string) => string;
  /**
   * Whether to show percentage
   */
  showPercentage?: boolean;
  /**
   * Whether to show value
   */
  showValue?: boolean;
  /**
   * Whether to show label
   */
  showLabel?: boolean;
  /**
   * Whether to show total
   */
  showTotal?: boolean;
  /**
   * Whether to highlight segments on hover
   */
  hoverEffects?: boolean;
  /**
   * Hover offset
   */
  hoverOffset?: number;
  /**
   * Whether to animate rotation
   */
  animateRotation?: boolean;
  /**
   * Whether to animate scale
   */
  animateScale?: boolean;
  /**
   * Whether to use semi-circle
   */
  useSemiCircle?: boolean;
  /**
   * Whether to use polar area chart
   */
  usePolarArea?: boolean;
}

/**
 * Pie chart component
 */
const PieChart: React.FC<PieChartProps> = ({
  dataPoints,
  datasets,
  data,
  labels,
  doughnut = false,
  cutoutPercentage = 50,
  rotation = 0,
  circumference = 360,
  radiusPercentage = 100,
  borderWidth = 2,
  borderColor,
  borderAlign = 'center',
  spacing = 0,
  useCustomColors = false,
  customColors,
  showDataLabels = false,
  dataLabelPosition = 'inside',
  dataLabelColor,
  dataLabelFontSize = 12,
  dataLabelFontWeight = 'bold',
  dataLabelFormatter = (value, label) => label ? `${label}: ${value}` : `${value}`,
  showPercentage = false,
  showValue = true,
  showLabel = true,
  showTotal = false,
  hoverEffects = true,
  hoverOffset = 10,
  animateRotation = true,
  animateScale = false,
  useSemiCircle = false,
  usePolarArea = false,
  options,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();

  // Default colors for datasets
  const defaultColors = [
    theme.colors.blue[500],
    theme.colors.green[500],
    theme.colors.purple[500],
    theme.colors.orange[500],
    theme.colors.red[500],
    theme.colors.teal[500],
    theme.colors.yellow[500],
    theme.colors.cyan[500],
    theme.colors.pink[500],
    theme.colors.gray[500],
  ];

  const defaultColorsDark = [
    theme.colors.blue[300],
    theme.colors.green[300],
    theme.colors.purple[300],
    theme.colors.orange[300],
    theme.colors.red[300],
    theme.colors.teal[300],
    theme.colors.yellow[300],
    theme.colors.cyan[300],
    theme.colors.pink[300],
    theme.colors.gray[300],
  ];

  // Prepare chart data
  const chartData: ChartData = data || {
    labels: labels || [],
    datasets: datasets || (dataPoints ? [
      {
        data: dataPoints.map(point => typeof point === 'object' ? (point as ChartDataPoint).y : point as number),
        backgroundColor: useCustomColors
          ? customColors
          : colorMode === 'light'
            ? defaultColors
            : defaultColorsDark,
        borderColor: borderColor || (colorMode === 'light' ? theme.colors.white : theme.colors.gray[800]),
        borderWidth,
        borderAlign,
        hoverOffset: hoverEffects ? hoverOffset : 0,
      },
    ] : []),
  };

  // Calculate total if needed
  let total = 0;
  if (showTotal && dataPoints) {
    total = dataPoints.reduce((sum, point) => sum + (typeof point === 'object' ? (point as ChartDataPoint).y : point as number), 0);
  }

  // Prepare chart options
  const chartOptions: ChartOptions = {
    cutout: doughnut ? `${cutoutPercentage}%` : 0,
    radius: `${radiusPercentage}%`,
    rotation: (rotation * Math.PI) / 180,
    circumference: (circumference * Math.PI) / 180,
    spacing,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const dataset = context.dataset;
            const total = dataset.data.reduce((sum, val) => sum + (val as number), 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            let result = '';
            if (showLabel) result += label;
            if (showLabel && (showValue || showPercentage)) result += ': ';
            if (showValue) result += value;
            if (showValue && showPercentage) result += ' (';
            if (showPercentage) result += `${percentage}%`;
            if (showValue && showPercentage) result += ')';
            
            return result;
          },
          footer: (tooltipItems) => {
            if (!showTotal) return '';
            
            const total = tooltipItems[0].dataset.data.reduce((sum, val) => sum + (val as number), 0);
            return `Total: ${total}`;
          },
        },
      },
    },
    animation: {
      animateRotate: animateRotation,
      animateScale: animateScale,
    },
    ...options,
  };

  // Add data labels if needed
  if (showDataLabels) {
    chartOptions.plugins = {
      ...chartOptions.plugins,
      datalabels: {
        display: true,
        color: dataLabelColor || (colorMode === 'light' ? theme.colors.gray[800] : theme.colors.gray[200]),
        font: {
          size: dataLabelFontSize,
          weight: dataLabelFontWeight,
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels?.[context.dataIndex] || '';
          const dataset = context.chart.data.datasets[context.datasetIndex];
          const total = dataset.data.reduce((sum, val) => sum + (val as number), 0);
          const percentage = ((value / total) * 100).toFixed(1);
          
          if (showPercentage && !showValue && !showLabel) {
            return `${percentage}%`;
          }
          
          return dataLabelFormatter(value, label);
        },
        anchor: dataLabelPosition === 'outside' ? 'end' : dataLabelPosition === 'border' ? 'center' : 'center',
        align: dataLabelPosition === 'outside' ? 'end' : dataLabelPosition === 'border' ? 'center' : 'center',
        offset: dataLabelPosition === 'outside' ? 8 : 0,
      },
    };
  }

  // Apply semi-circle if needed
  if (useSemiCircle) {
    chartOptions.rotation = -Math.PI;
    chartOptions.circumference = Math.PI;
  }

  return (
    <Chart
      type={usePolarArea ? 'polarArea' : doughnut ? 'doughnut' : 'pie'}
      data={chartData}
      options={chartOptions}
      {...rest}
    />
  );
};

export default PieChart;
