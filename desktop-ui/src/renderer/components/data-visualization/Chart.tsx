import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  BoxProps,
  useColorMode,
  useTheme,
  Spinner,
  Text,
  Flex,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { glassmorphism } from '../../styles/themes/creator';

// Chart types
export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'doughnut' 
  | 'radar' 
  | 'polarArea' 
  | 'scatter' 
  | 'bubble' 
  | 'area' 
  | 'mixed';

// Chart data point
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
  tooltip?: string;
  [key: string]: any;
}

// Chart dataset
export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  color?: string;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointBorderWidth?: number;
  pointHoverBackgroundColor?: string | string[];
  pointHoverBorderColor?: string | string[];
  pointHoverBorderWidth?: number;
  pointStyle?: string | string[];
  showLine?: boolean;
  spanGaps?: boolean;
  stepped?: boolean | 'before' | 'after' | 'middle';
  hidden?: boolean;
  [key: string]: any;
}

// Chart data
export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

// Chart options
export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
  resizeDelay?: number;
  devicePixelRatio?: number;
  plugins?: {
    title?: {
      display?: boolean;
      text?: string;
      position?: 'top' | 'bottom' | 'left' | 'right';
      align?: 'start' | 'center' | 'end';
      color?: string;
      font?: {
        family?: string;
        size?: number;
        style?: 'normal' | 'italic' | 'oblique';
        weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
        lineHeight?: number | string;
      };
      padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
    };
    subtitle?: {
      display?: boolean;
      text?: string;
      position?: 'top' | 'bottom' | 'left' | 'right';
      align?: 'start' | 'center' | 'end';
      color?: string;
      font?: {
        family?: string;
        size?: number;
        style?: 'normal' | 'italic' | 'oblique';
        weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
        lineHeight?: number | string;
      };
      padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
    };
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
      align?: 'start' | 'center' | 'end';
      maxHeight?: number;
      maxWidth?: number;
      fullSize?: boolean;
      reverse?: boolean;
      rtl?: boolean;
      textDirection?: 'ltr' | 'rtl';
      labels?: {
        color?: string;
        font?: {
          family?: string;
          size?: number;
          style?: 'normal' | 'italic' | 'oblique';
          weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
          lineHeight?: number | string;
        };
        padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
        boxWidth?: number;
        boxHeight?: number;
        borderRadius?: number;
        usePointStyle?: boolean;
        pointStyle?: string;
        textAlign?: 'left' | 'right' | 'center';
      };
      onClick?: (event: MouseEvent, legendItem: any) => void;
      onHover?: (event: MouseEvent, legendItem: any) => void;
      onLeave?: (event: MouseEvent, legendItem: any) => void;
    };
    tooltip?: {
      enabled?: boolean;
      position?: 'average' | 'nearest';
      backgroundColor?: string;
      titleColor?: string;
      titleFont?: {
        family?: string;
        size?: number;
        style?: 'normal' | 'italic' | 'oblique';
        weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
        lineHeight?: number | string;
      };
      titleAlign?: 'left' | 'right' | 'center';
      titleSpacing?: number;
      titleMarginBottom?: number;
      bodyColor?: string;
      bodyFont?: {
        family?: string;
        size?: number;
        style?: 'normal' | 'italic' | 'oblique';
        weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
        lineHeight?: number | string;
      };
      bodyAlign?: 'left' | 'right' | 'center';
      bodySpacing?: number;
      footerColor?: string;
      footerFont?: {
        family?: string;
        size?: number;
        style?: 'normal' | 'italic' | 'oblique';
        weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
        lineHeight?: number | string;
      };
      footerAlign?: 'left' | 'right' | 'center';
      footerSpacing?: number;
      footerMarginTop?: number;
      padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
      caretPadding?: number;
      caretSize?: number;
      cornerRadius?: number;
      boxWidth?: number;
      boxHeight?: number;
      usePointStyle?: boolean;
      borderColor?: string;
      borderWidth?: number;
      rtl?: boolean;
      textDirection?: 'ltr' | 'rtl';
      xAlign?: 'left' | 'right' | 'center';
      yAlign?: 'top' | 'bottom' | 'center';
    };
  };
  scales?: {
    x?: {
      type?: 'linear' | 'logarithmic' | 'category' | 'time' | 'timeseries';
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
      offset?: boolean;
      title?: {
        display?: boolean;
        text?: string;
        color?: string;
        font?: {
          family?: string;
          size?: number;
          style?: 'normal' | 'italic' | 'oblique';
          weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
          lineHeight?: number | string;
        };
        padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
      };
      grid?: {
        display?: boolean;
        color?: string;
        borderColor?: string;
        tickColor?: string;
        borderDash?: number[];
        borderDashOffset?: number;
        lineWidth?: number;
        drawBorder?: boolean;
        drawOnChartArea?: boolean;
        drawTicks?: boolean;
        tickLength?: number;
        offset?: boolean;
      };
      ticks?: {
        display?: boolean;
        color?: string;
        font?: {
          family?: string;
          size?: number;
          style?: 'normal' | 'italic' | 'oblique';
          weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
          lineHeight?: number | string;
        };
        padding?: number;
        showLabelBackdrop?: boolean;
        backdropColor?: string;
        backdropPadding?: number | { top?: number; bottom?: number; left?: number; right?: number };
        align?: 'start' | 'center' | 'end';
        crossAlign?: 'near' | 'center' | 'far';
        sampleSize?: number;
        autoSkip?: boolean;
        autoSkipPadding?: number;
        labelOffset?: number;
        maxRotation?: number;
        minRotation?: number;
        mirror?: boolean;
        padding?: number;
      };
    };
    y?: {
      type?: 'linear' | 'logarithmic' | 'category' | 'time' | 'timeseries';
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
      offset?: boolean;
      title?: {
        display?: boolean;
        text?: string;
        color?: string;
        font?: {
          family?: string;
          size?: number;
          style?: 'normal' | 'italic' | 'oblique';
          weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
          lineHeight?: number | string;
        };
        padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
      };
      grid?: {
        display?: boolean;
        color?: string;
        borderColor?: string;
        tickColor?: string;
        borderDash?: number[];
        borderDashOffset?: number;
        lineWidth?: number;
        drawBorder?: boolean;
        drawOnChartArea?: boolean;
        drawTicks?: boolean;
        tickLength?: number;
        offset?: boolean;
      };
      ticks?: {
        display?: boolean;
        color?: string;
        font?: {
          family?: string;
          size?: number;
          style?: 'normal' | 'italic' | 'oblique';
          weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
          lineHeight?: number | string;
        };
        padding?: number;
        showLabelBackdrop?: boolean;
        backdropColor?: string;
        backdropPadding?: number | { top?: number; bottom?: number; left?: number; right?: number };
        align?: 'start' | 'center' | 'end';
        crossAlign?: 'near' | 'center' | 'far';
        sampleSize?: number;
        autoSkip?: boolean;
        autoSkipPadding?: number;
        labelOffset?: number;
        maxRotation?: number;
        minRotation?: number;
        mirror?: boolean;
        padding?: number;
      };
    };
  };
  animation?: {
    duration?: number;
    easing?: string;
    delay?: number;
    loop?: boolean;
  };
  layout?: {
    padding?: number | { top?: number; bottom?: number; left?: number; right?: number };
  };
  [key: string]: any;
}

// Chart component props
export interface ChartProps extends BoxProps {
  /**
   * Chart type
   */
  type: ChartType;
  /**
   * Chart data
   */
  data: ChartData;
  /**
   * Chart options
   */
  options?: ChartOptions;
  /**
   * Chart width
   */
  width?: number | string;
  /**
   * Chart height
   */
  height?: number | string;
  /**
   * Whether to use glassmorphism effect
   */
  useGlassmorphism?: boolean;
  /**
   * Whether to show loading spinner
   */
  isLoading?: boolean;
  /**
   * Whether to show error message
   */
  isError?: boolean;
  /**
   * Error message
   */
  errorMessage?: string;
  /**
   * Whether to show empty message
   */
  isEmpty?: boolean;
  /**
   * Empty message
   */
  emptyMessage?: string;
  /**
   * Whether to show title
   */
  showTitle?: boolean;
  /**
   * Chart title
   */
  title?: string;
  /**
   * Whether to show subtitle
   */
  showSubtitle?: boolean;
  /**
   * Chart subtitle
   */
  subtitle?: string;
  /**
   * Whether to show legend
   */
  showLegend?: boolean;
  /**
   * Legend position
   */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Whether to show tooltip
   */
  showTooltip?: boolean;
  /**
   * Whether to show grid
   */
  showGrid?: boolean;
  /**
   * Whether to show animation
   */
  showAnimation?: boolean;
  /**
   * Animation duration
   */
  animationDuration?: number;
  /**
   * Whether to show download button
   */
  showDownloadButton?: boolean;
  /**
   * Whether to show fullscreen button
   */
  showFullscreenButton?: boolean;
  /**
   * Whether to show refresh button
   */
  showRefreshButton?: boolean;
  /**
   * Whether to show settings button
   */
  showSettingsButton?: boolean;
  /**
   * Whether to show info button
   */
  showInfoButton?: boolean;
  /**
   * Whether to show help button
   */
  showHelpButton?: boolean;
  /**
   * Whether to show print button
   */
  showPrintButton?: boolean;
  /**
   * Whether to show export button
   */
  showExportButton?: boolean;
  /**
   * Whether to show share button
   */
  showShareButton?: boolean;
  /**
   * Whether to show zoom button
   */
  showZoomButton?: boolean;
  /**
   * Whether to show pan button
   */
  showPanButton?: boolean;
  /**
   * Whether to show reset button
   */
  showResetButton?: boolean;
  /**
   * On download click callback
   */
  onDownloadClick?: () => void;
  /**
   * On fullscreen click callback
   */
  onFullscreenClick?: () => void;
  /**
   * On refresh click callback
   */
  onRefreshClick?: () => void;
  /**
   * On settings click callback
   */
  onSettingsClick?: () => void;
  /**
   * On info click callback
   */
  onInfoClick?: () => void;
  /**
   * On help click callback
   */
  onHelpClick?: () => void;
  /**
   * On print click callback
   */
  onPrintClick?: () => void;
  /**
   * On export click callback
   */
  onExportClick?: () => void;
  /**
   * On share click callback
   */
  onShareClick?: () => void;
  /**
   * On zoom click callback
   */
  onZoomClick?: () => void;
  /**
   * On pan click callback
   */
  onPanClick?: () => void;
  /**
   * On reset click callback
   */
  onResetClick?: () => void;
  /**
   * On chart click callback
   */
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /**
   * On chart hover callback
   */
  onHover?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /**
   * On chart leave callback
   */
  onLeave?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /**
   * On data point click callback
   */
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number, dataset: ChartDataset, datasetIndex: number) => void;
  /**
   * On data point hover callback
   */
  onDataPointHover?: (dataPoint: ChartDataPoint, index: number, dataset: ChartDataset, datasetIndex: number) => void;
  /**
   * On data point leave callback
   */
  onDataPointLeave?: (dataPoint: ChartDataPoint, index: number, dataset: ChartDataset, datasetIndex: number) => void;
  /**
   * On legend click callback
   */
  onLegendClick?: (dataset: ChartDataset, index: number) => void;
  /**
   * On legend hover callback
   */
  onLegendHover?: (dataset: ChartDataset, index: number) => void;
  /**
   * On legend leave callback
   */
  onLegendLeave?: (dataset: ChartDataset, index: number) => void;
}

/**
 * Chart component
 */
const Chart: React.FC<ChartProps> = ({
  type,
  data,
  options,
  width = '100%',
  height = '300px',
  useGlassmorphism = true,
  isLoading = false,
  isError = false,
  errorMessage = 'An error occurred while loading the chart.',
  isEmpty = false,
  emptyMessage = 'No data available.',
  showTitle = true,
  title,
  showSubtitle = true,
  subtitle,
  showLegend = true,
  legendPosition = 'top',
  showTooltip = true,
  showGrid = true,
  showAnimation = true,
  animationDuration = 1000,
  showDownloadButton = false,
  showFullscreenButton = false,
  showRefreshButton = false,
  showSettingsButton = false,
  showInfoButton = false,
  showHelpButton = false,
  showPrintButton = false,
  showExportButton = false,
  showShareButton = false,
  showZoomButton = false,
  showPanButton = false,
  showResetButton = false,
  onDownloadClick,
  onFullscreenClick,
  onRefreshClick,
  onSettingsClick,
  onInfoClick,
  onHelpClick,
  onPrintClick,
  onExportClick,
  onShareClick,
  onZoomClick,
  onPanClick,
  onResetClick,
  onClick,
  onHover,
  onLeave,
  onDataPointClick,
  onDataPointHover,
  onDataPointLeave,
  onLegendClick,
  onLegendHover,
  onLegendLeave,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);

  // Apply glassmorphism effect based on color mode
  const glassStyle = useGlassmorphism
    ? colorMode === 'light'
      ? glassmorphism.create(0.7, 10, 1)
      : glassmorphism.createDark(0.7, 10, 1)
    : {};

  // Merge default options with provided options
  const mergedOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: showTitle && !!title,
        text: title,
        color: colorMode === 'light' ? theme.colors.gray[800] : theme.colors.gray[200],
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      subtitle: {
        display: showSubtitle && !!subtitle,
        text: subtitle,
        color: colorMode === 'light' ? theme.colors.gray[600] : theme.colors.gray[400],
        font: {
          size: 14,
        },
      },
      legend: {
        display: showLegend,
        position: legendPosition,
        labels: {
          color: colorMode === 'light' ? theme.colors.gray[800] : theme.colors.gray[200],
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: showTooltip,
        backgroundColor: colorMode === 'light' ? theme.colors.white : theme.colors.gray[800],
        titleColor: colorMode === 'light' ? theme.colors.gray[800] : theme.colors.gray[200],
        bodyColor: colorMode === 'light' ? theme.colors.gray[600] : theme.colors.gray[400],
        borderColor: colorMode === 'light' ? theme.colors.gray[200] : theme.colors.gray[600],
        borderWidth: 1,
        cornerRadius: 4,
        padding: 8,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: colorMode === 'light' ? theme.colors.gray[200] : theme.colors.gray[700],
        },
        ticks: {
          color: colorMode === 'light' ? theme.colors.gray[600] : theme.colors.gray[400],
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        grid: {
          display: showGrid,
          color: colorMode === 'light' ? theme.colors.gray[200] : theme.colors.gray[700],
        },
        ticks: {
          color: colorMode === 'light' ? theme.colors.gray[600] : theme.colors.gray[400],
          font: {
            size: 12,
          },
        },
      },
    },
    animation: {
      duration: showAnimation ? animationDuration : 0,
    },
    ...options,
  };

  // Initialize chart
  useEffect(() => {
    if (chartRef.current && !isLoading && !isError && !isEmpty) {
      // Import Chart.js dynamically to avoid SSR issues
      import('chart.js').then((ChartJS) => {
        // Register required components
        ChartJS.Chart.register(
          ChartJS.CategoryScale,
          ChartJS.LinearScale,
          ChartJS.PointElement,
          ChartJS.LineElement,
          ChartJS.BarElement,
          ChartJS.ArcElement,
          ChartJS.RadarElement,
          ChartJS.PolarAreaElement,
          ChartJS.BubbleElement,
          ChartJS.ScatterElement,
          ChartJS.Filler,
          ChartJS.Tooltip,
          ChartJS.Legend,
          ChartJS.Title,
          ChartJS.SubTitle
        );

        // Destroy existing chart instance
        if (chartInstance) {
          chartInstance.destroy();
        }

        // Create new chart instance
        const newChartInstance = new ChartJS.Chart(chartRef.current, {
          type,
          data,
          options: mergedOptions,
        });

        // Set chart instance
        setChartInstance(newChartInstance);

        // Return cleanup function
        return () => {
          newChartInstance.destroy();
        };
      });
    }
  }, [chartRef, type, data, mergedOptions, isLoading, isError, isEmpty, colorMode]);

  // Render loading state
  if (isLoading) {
    return (
      <Box
        width={width}
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
        {...glassStyle}
        {...rest}
      >
        <Spinner size="xl" color={colorMode === 'light' ? 'blue.500' : 'blue.300'} />
      </Box>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Box
        width={width}
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
        {...glassStyle}
        {...rest}
      >
        <Text color={colorMode === 'light' ? 'red.500' : 'red.300'} fontSize="lg" fontWeight="medium">
          {errorMessage}
        </Text>
      </Box>
    );
  }

  // Render empty state
  if (isEmpty) {
    return (
      <Box
        width={width}
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
        {...glassStyle}
        {...rest}
      >
        <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'} fontSize="lg" fontWeight="medium">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  // Render chart
  return (
    <Box
      width={width}
      height={height}
      position="relative"
      borderRadius="md"
      overflow="hidden"
      {...glassStyle}
      {...rest}
    >
      {/* Chart toolbar */}
      {(showDownloadButton || showFullscreenButton || showRefreshButton || showSettingsButton || 
        showInfoButton || showHelpButton || showPrintButton || showExportButton || 
        showShareButton || showZoomButton || showPanButton || showResetButton) && (
        <Flex
          position="absolute"
          top={2}
          right={2}
          zIndex={1}
          bg={colorMode === 'light' ? 'whiteAlpha.800' : 'blackAlpha.800'}
          borderRadius="md"
          p={1}
        >
          {showDownloadButton && (
            <Tooltip label="Download">
              <IconButton
                aria-label="Download"
                icon={'⬇️'}
                size="sm"
                variant="ghost"
                onClick={onDownloadClick}
              />
            </Tooltip>
          )}
          {showFullscreenButton && (
            <Tooltip label="Fullscreen">
              <IconButton
                aria-label="Fullscreen"
                icon={'⛶'}
                size="sm"
                variant="ghost"
                onClick={onFullscreenClick}
              />
            </Tooltip>
          )}
          {showRefreshButton && (
            <Tooltip label="Refresh">
              <IconButton
                aria-label="Refresh"
                icon={'🔄'}
                size="sm"
                variant="ghost"
                onClick={onRefreshClick}
              />
            </Tooltip>
          )}
          {showSettingsButton && (
            <Tooltip label="Settings">
              <IconButton
                aria-label="Settings"
                icon={'⚙️'}
                size="sm"
                variant="ghost"
                onClick={onSettingsClick}
              />
            </Tooltip>
          )}
          {showInfoButton && (
            <Tooltip label="Info">
              <IconButton
                aria-label="Info"
                icon={'ℹ️'}
                size="sm"
                variant="ghost"
                onClick={onInfoClick}
              />
            </Tooltip>
          )}
          {showHelpButton && (
            <Tooltip label="Help">
              <IconButton
                aria-label="Help"
                icon={'❓'}
                size="sm"
                variant="ghost"
                onClick={onHelpClick}
              />
            </Tooltip>
          )}
          {showPrintButton && (
            <Tooltip label="Print">
              <IconButton
                aria-label="Print"
                icon={'🖨️'}
                size="sm"
                variant="ghost"
                onClick={onPrintClick}
              />
            </Tooltip>
          )}
          {showExportButton && (
            <Tooltip label="Export">
              <IconButton
                aria-label="Export"
                icon={'📤'}
                size="sm"
                variant="ghost"
                onClick={onExportClick}
              />
            </Tooltip>
          )}
          {showShareButton && (
            <Tooltip label="Share">
              <IconButton
                aria-label="Share"
                icon={'🔗'}
                size="sm"
                variant="ghost"
                onClick={onShareClick}
              />
            </Tooltip>
          )}
          {showZoomButton && (
            <Tooltip label="Zoom">
              <IconButton
                aria-label="Zoom"
                icon={'🔍'}
                size="sm"
                variant="ghost"
                onClick={onZoomClick}
              />
            </Tooltip>
          )}
          {showPanButton && (
            <Tooltip label="Pan">
              <IconButton
                aria-label="Pan"
                icon={'✋'}
                size="sm"
                variant="ghost"
                onClick={onPanClick}
              />
            </Tooltip>
          )}
          {showResetButton && (
            <Tooltip label="Reset">
              <IconButton
                aria-label="Reset"
                icon={'🔄'}
                size="sm"
                variant="ghost"
                onClick={onResetClick}
              />
            </Tooltip>
          )}
        </Flex>
      )}

      {/* Chart canvas */}
      <canvas
        ref={chartRef}
        onClick={onClick}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      />
    </Box>
  );
};

export default Chart;
