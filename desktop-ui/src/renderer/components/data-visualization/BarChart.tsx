import React from 'react';
import Chart, { ChartProps, ChartDataPoint, ChartDataset, ChartData, ChartOptions } from './Chart';
import { useColorMode, useTheme } from '@chakra-ui/react';

export interface BarChartProps extends Omit<ChartProps, 'type' | 'data'> {
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
   * Whether to use horizontal bars
   */
  horizontal?: boolean;
  /**
   * Whether to stack bars
   */
  stacked?: boolean;
  /**
   * Whether to use grouped bars
   */
  grouped?: boolean;
  /**
   * Bar thickness
   */
  barThickness?: number | 'flex';
  /**
   * Maximum bar thickness
   */
  maxBarThickness?: number;
  /**
   * Minimum bar length
   */
  minBarLength?: number;
  /**
   * Bar percentage
   */
  barPercentage?: number;
  /**
   * Category percentage
   */
  categoryPercentage?: number;
  /**
   * Bar border width
   */
  borderWidth?: number;
  /**
   * Bar border radius
   */
  borderRadius?: number;
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
   * Whether to show data labels
   */
  showDataLabels?: boolean;
  /**
   * Data label position
   */
  dataLabelPosition?: 'top' | 'center' | 'bottom';
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
 * Bar chart component
 */
const BarChart: React.FC<BarChartProps> = ({
  dataPoints,
  datasets,
  data,
  labels,
  horizontal = false,
  stacked = false,
  grouped = false,
  barThickness,
  maxBarThickness,
  minBarLength,
  barPercentage = 0.9,
  categoryPercentage = 0.8,
  borderWidth = 1,
  borderRadius = 4,
  useGradient = false,
  gradientStartColor,
  gradientEndColor,
  showDataLabels = false,
  dataLabelPosition = 'top',
  dataLabelColor,
  dataLabelFontSize = 12,
  dataLabelFontWeight = 'bold',
  dataLabelFormatter = (value) => `${value}`,
  showMinValue = false,
  showMaxValue = false,
  showAverageValue = false,
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
        data: dataPoints,
        backgroundColor: colorMode === 'light' ? theme.colors.blue[500] : theme.colors.blue[300],
        borderColor: colorMode === 'light' ? theme.colors.blue[600] : theme.colors.blue[400],
        borderWidth,
        borderRadius,
        barPercentage,
        categoryPercentage,
        barThickness,
        maxBarThickness,
        minBarLength,
      },
    ] : []),
  };

  // Apply colors to datasets if not provided
  if (!data && !datasets) {
    chartData.datasets = chartData.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || (colorMode === 'light' ? defaultColors[index % defaultColors.length].bg : defaultColors[index % defaultColors.length].bgDark),
      borderColor: dataset.borderColor || (colorMode === 'light' ? defaultColors[index % defaultColors.length].border : defaultColors[index % defaultColors.length].borderDark),
    }));
  }

  // Prepare chart options
  const chartOptions: ChartOptions = {
    indexAxis: horizontal ? 'y' : 'x',
    scales: {
      x: {
        stacked: stacked || !grouped,
        grid: {
          display: !horizontal,
        },
      },
      y: {
        stacked: stacked || !grouped,
        beginAtZero: true,
        grid: {
          display: horizontal,
        },
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
        anchor: dataLabelPosition === 'center' ? 'center' : dataLabelPosition === 'bottom' ? 'end' : 'start',
        align: dataLabelPosition === 'center' ? 'center' : dataLabelPosition === 'bottom' ? 'bottom' : 'top',
      },
    };
  }

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
            ...(horizontal ? {
              xMin: thresholdValue,
              xMax: thresholdValue,
            } : {
              yMin: thresholdValue,
              yMax: thresholdValue,
            }),
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
            ...(horizontal ? {
              xMin: targetValue,
              xMax: targetValue,
            } : {
              yMin: targetValue,
              yMax: targetValue,
            }),
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
              ...(horizontal ? {
                xMin: minValue,
                xMax: minValue,
              } : {
                yMin: minValue,
                yMax: minValue,
              }),
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
              ...(horizontal ? {
                xMin: maxValue,
                xMax: maxValue,
              } : {
                yMin: maxValue,
                yMax: maxValue,
              }),
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
              ...(horizontal ? {
                xMin: averageValue,
                xMax: averageValue,
              } : {
                yMin: averageValue,
                yMax: averageValue,
              }),
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
          
          const gradient = horizontal
            ? ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
            : ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          
          gradient.addColorStop(0, startColor);
          gradient.addColorStop(1, endColor);
          
          return gradient;
        },
      };
    });
  }

  return (
    <Chart
      type="bar"
      data={chartData}
      options={chartOptions}
      {...rest}
    />
  );
};

export default BarChart;
