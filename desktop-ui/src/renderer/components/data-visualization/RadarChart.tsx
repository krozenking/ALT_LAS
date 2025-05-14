import React from 'react';
import Chart, { ChartProps, ChartDataPoint, ChartDataset, ChartData, ChartOptions } from './Chart';
import { useColorMode, useTheme } from '@chakra-ui/react';

export interface RadarChartProps extends Omit<ChartProps, 'type' | 'data'> {
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
   * Whether to show data labels
   */
  showDataLabels?: boolean;
  /**
   * Data label position
   */
  dataLabelPosition?: 'center' | 'outside';
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
  dataLabelFormatter?: (value: number) => string;
  /**
   * Whether to show angle lines
   */
  showAngleLines?: boolean;
  /**
   * Angle line color
   */
  angleLineColor?: string;
  /**
   * Angle line width
   */
  angleLineWidth?: number;
  /**
   * Whether to show grid lines
   */
  showGridLines?: boolean;
  /**
   * Grid line color
   */
  gridLineColor?: string;
  /**
   * Grid line width
   */
  gridLineWidth?: number;
  /**
   * Whether to show ticks
   */
  showTicks?: boolean;
  /**
   * Tick color
   */
  tickColor?: string;
  /**
   * Tick font size
   */
  tickFontSize?: number;
  /**
   * Tick padding
   */
  tickPadding?: number;
  /**
   * Whether to show point labels
   */
  showPointLabels?: boolean;
  /**
   * Point label color
   */
  pointLabelColor?: string;
  /**
   * Point label font size
   */
  pointLabelFontSize?: number;
  /**
   * Point label font weight
   */
  pointLabelFontWeight?: string | number;
  /**
   * Start angle
   */
  startAngle?: number;
}

/**
 * Radar chart component
 */
const RadarChart: React.FC<RadarChartProps> = ({
  dataPoints,
  datasets,
  data,
  labels,
  showArea = true,
  useCurvedLines = false,
  showPoints = true,
  tension = 0,
  pointRadius = 3,
  pointHoverRadius = 5,
  borderWidth = 2,
  useDashedLines = false,
  borderDash = [5, 5],
  borderDashOffset = 0,
  useGradient = false,
  gradientStartColor,
  gradientEndColor,
  gradientStartOpacity = 0.6,
  gradientEndOpacity = 0.1,
  showDataLabels = false,
  dataLabelPosition = 'center',
  dataLabelColor,
  dataLabelFontSize = 12,
  dataLabelFontWeight = 'bold',
  dataLabelFormatter = (value) => `${value}`,
  showAngleLines = true,
  angleLineColor,
  angleLineWidth = 1,
  showGridLines = true,
  gridLineColor,
  gridLineWidth = 1,
  showTicks = true,
  tickColor,
  tickFontSize = 12,
  tickPadding = 5,
  showPointLabels = true,
  pointLabelColor,
  pointLabelFontSize = 12,
  pointLabelFontWeight = 'bold',
  startAngle = 0,
  options,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();

  // Default colors for datasets
  const defaultColors = [
    { bg: theme.colors.blue[500], bgDark: theme.colors.blue[300], border: theme.colors.blue[600], borderDark: theme.colors.blue[400] },
    { bg: theme.colors.green[500], bgDark: theme.colors.green[300], border: theme.colors.green[600], borderDark: theme.colors.green[400] },
    { bg: theme.colors.purple[500], bgDark: theme.colors.purple[300], border: theme.colors.purple[600], borderDark: theme.colors.purple[400] },
    { bg: theme.colors.orange[500], bgDark: theme.colors.orange[300], border: theme.colors.orange[600], borderDark: theme.colors.orange[400] },
    { bg: theme.colors.red[500], bgDark: theme.colors.red[300], border: theme.colors.red[600], borderDark: theme.colors.red[400] },
    { bg: theme.colors.teal[500], bgDark: theme.colors.teal[300], border: theme.colors.teal[600], borderDark: theme.colors.teal[400] },
    { bg: theme.colors.yellow[500], bgDark: theme.colors.yellow[300], border: theme.colors.yellow[600], borderDark: theme.colors.yellow[400] },
    { bg: theme.colors.cyan[500], bgDark: theme.colors.cyan[300], border: theme.colors.cyan[600], borderDark: theme.colors.cyan[400] },
    { bg: theme.colors.pink[500], bgDark: theme.colors.pink[300], border: theme.colors.pink[600], borderDark: theme.colors.pink[400] },
    { bg: theme.colors.gray[500], bgDark: theme.colors.gray[300], border: theme.colors.gray[600], borderDark: theme.colors.gray[400] },
  ];

  // Prepare chart data
  const chartData: ChartData = data || {
    labels: labels || [],
    datasets: datasets || (dataPoints ? [
      {
        label: 'Data',
        data: dataPoints.map(point => typeof point === 'object' ? (point as ChartDataPoint).y : point as number),
        backgroundColor: showArea
          ? colorMode === 'light'
            ? `${theme.colors.blue[500]}40`
            : `${theme.colors.blue[300]}40`
          : 'transparent',
        borderColor: colorMode === 'light' ? theme.colors.blue[500] : theme.colors.blue[300],
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
      },
    ] : []),
  };

  // Apply colors to datasets if not provided
  if (!data && !datasets && chartData.datasets.length > 1) {
    chartData.datasets = chartData.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || (showArea
        ? colorMode === 'light'
          ? `${defaultColors[index % defaultColors.length].bg}40`
          : `${defaultColors[index % defaultColors.length].bgDark}40`
        : 'transparent'),
      borderColor: dataset.borderColor || (colorMode === 'light'
        ? defaultColors[index % defaultColors.length].bg
        : defaultColors[index % defaultColors.length].bgDark),
      pointBackgroundColor: dataset.pointBackgroundColor || (colorMode === 'light'
        ? defaultColors[index % defaultColors.length].bg
        : defaultColors[index % defaultColors.length].bgDark),
      pointBorderColor: dataset.pointBorderColor || (colorMode === 'light'
        ? theme.colors.white
        : theme.colors.gray[800]),
    }));
  }

  // Prepare chart options
  const chartOptions: ChartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        angleLines: {
          display: showAngleLines,
          color: angleLineColor || (colorMode === 'light' ? theme.colors.gray[300] : theme.colors.gray[600]),
          lineWidth: angleLineWidth,
        },
        grid: {
          display: showGridLines,
          color: gridLineColor || (colorMode === 'light' ? theme.colors.gray[200] : theme.colors.gray[700]),
          lineWidth: gridLineWidth,
        },
        ticks: {
          display: showTicks,
          color: tickColor || (colorMode === 'light' ? theme.colors.gray[600] : theme.colors.gray[400]),
          font: {
            size: tickFontSize,
          },
          padding: tickPadding,
        },
        pointLabels: {
          display: showPointLabels,
          color: pointLabelColor || (colorMode === 'light' ? theme.colors.gray[700] : theme.colors.gray[300]),
          font: {
            size: pointLabelFontSize,
            weight: pointLabelFontWeight,
          },
        },
        startAngle,
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
        formatter: dataLabelFormatter,
        anchor: dataLabelPosition === 'outside' ? 'end' : 'center',
        align: dataLabelPosition === 'outside' ? 'end' : 'center',
        offset: dataLabelPosition === 'outside' ? 8 : 0,
      },
    };
  }

  // Apply gradient if needed
  if (useGradient && chartData.datasets.length > 0) {
    chartData.datasets = chartData.datasets.map((dataset, index) => {
      const originalDataset = { ...dataset };
      const colorIndex = index % defaultColors.length;
      const startColor = gradientStartColor || (colorMode === 'light' ? defaultColors[colorIndex].bg : defaultColors[colorIndex].bgDark);
      const endColor = gradientEndColor || (colorMode === 'light' ? defaultColors[colorIndex].border : defaultColors[colorIndex].borderDark);
      
      return {
        ...dataset,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          
          if (!chartArea) {
            return originalDataset.backgroundColor as string;
          }
          
          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = (chartArea.top + chartArea.bottom) / 2;
          const radius = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) / 2;
          
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          gradient.addColorStop(0, `${startColor}${Math.round(gradientStartOpacity * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${endColor}${Math.round(gradientEndOpacity * 255).toString(16).padStart(2, '0')}`);
          
          return gradient;
        },
      };
    });
  }

  return (
    <Chart
      type="radar"
      data={chartData}
      options={chartOptions}
      {...rest}
    />
  );
};

export default RadarChart;
