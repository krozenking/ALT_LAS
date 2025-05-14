import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, Code, Flex, Divider, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { ErrorData } from '../../../main/services/ErrorTrackingService';

export interface ErrorBoundaryProps {
  /**
   * Children components
   */
  children: ReactNode;
  /**
   * Fallback component
   */
  fallback?: ReactNode;
  /**
   * Error callback
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Capture error function
   */
  captureError?: (error: Error | string, additionalData?: Record<string, any>, source?: string, handled?: boolean) => Promise<void>;
  /**
   * Whether to reset on error
   */
  resetOnError?: boolean;
  /**
   * Reset timeout in milliseconds
   */
  resetTimeout?: number;
}

export interface ErrorBoundaryState {
  /**
   * Whether an error occurred
   */
  hasError: boolean;
  /**
   * Error object
   */
  error: Error | null;
  /**
   * Error info
   */
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * Default props
   */
  static defaultProps = {
    resetOnError: false,
    resetTimeout: 5000,
  };

  /**
   * Constructor
   * @param props Component props
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Derive state from error
   * @param error Error object
   * @returns New state
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * Component did catch
   * @param error Error object
   * @param errorInfo Error info
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state
    this.setState({
      errorInfo,
    });

    // Call error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Capture error
    if (this.props.captureError) {
      this.props.captureError(
        error,
        { componentStack: errorInfo.componentStack },
        'renderer',
        true
      );
    }

    // Reset on error
    if (this.props.resetOnError) {
      setTimeout(() => {
        this.handleReset();
      }, this.props.resetTimeout);
    }
  }

  /**
   * Handle reset
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Render component
   * @returns Component JSX
   */
  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    // Return children if no error
    if (!hasError) {
      return children;
    }

    // Return fallback if provided
    if (fallback) {
      return fallback;
    }

    // Return default error UI
    return (
      <Box p={4} borderRadius="md" bg="red.50" color="red.900">
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>An error occurred</AlertTitle>
          <AlertDescription>
            The application encountered an unexpected error.
          </AlertDescription>
        </Alert>

        <Heading size="md" mb={2}>Error Details</Heading>
        <Text mb={2}>{error?.message}</Text>
        <Code p={2} mb={4} display="block" whiteSpace="pre-wrap" overflowX="auto">
          {error?.stack}
        </Code>

        <Divider my={4} />

        <Heading size="md" mb={2}>Component Stack</Heading>
        <Code p={2} mb={4} display="block" whiteSpace="pre-wrap" overflowX="auto">
          {errorInfo?.componentStack}
        </Code>

        <Flex justify="flex-end">
          <Button colorScheme="red" onClick={this.handleReset}>
            Reset
          </Button>
        </Flex>
      </Box>
    );
  }
}

export default ErrorBoundary;
