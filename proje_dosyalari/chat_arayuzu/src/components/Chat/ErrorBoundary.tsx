import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Code, 
  VStack, 
  Collapse, 
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { logError } from '../../utils/errorHandler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Hata detaylarını gösteren bileşen
const ErrorDetails: React.FC<{ error: Error }> = ({ error }) => {
  const { isOpen, onToggle } = useDisclosure();
  
  return (
    <VStack align="stretch" spacing={4} mt={4}>
      <Alert status="error" variant="left-accent">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle fontSize="lg">{error.name}</AlertTitle>
          <AlertDescription display="block">
            {error.message}
          </AlertDescription>
        </Box>
      </Alert>
      
      <Button size="sm" onClick={onToggle} colorScheme="red" variant="outline">
        {isOpen ? 'Hata Detaylarını Gizle' : 'Hata Detaylarını Göster'}
      </Button>
      
      <Collapse in={isOpen} animateOpacity>
        <Box 
          p={4} 
          bg="gray.900" 
          color="white" 
          borderRadius="md" 
          fontSize="sm" 
          fontFamily="monospace"
          overflowX="auto"
        >
          <Code variant="subtle" colorScheme="red" whiteSpace="pre-wrap">
            {error.stack || 'Hata detayları mevcut değil'}
          </Code>
        </Box>
      </Collapse>
    </VStack>
  );
};

// Hata sınırı bileşeni
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Hata günlüğü
    logError(error, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo.componentStack
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Özel fallback bileşeni varsa onu kullan
      if (fallback) {
        return fallback;
      }

      // Varsayılan hata UI'ı
      return (
        <Box 
          p={6} 
          borderRadius="lg" 
          bg="white" 
          boxShadow="lg"
          maxW="800px" 
          mx="auto" 
          my={8}
          className="error-boundary-container"
        >
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <WarningTwoIcon boxSize={12} color="red.500" mb={4} />
              <Heading as="h2" size="lg" mb={2}>
                Bir Hata Oluştu
              </Heading>
              <Text color="gray.600">
                Uygulama beklenmeyen bir hata ile karşılaştı. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
              </Text>
            </Box>

            {error && <ErrorDetails error={error} />}

            <Box textAlign="center" mt={4}>
              <Button 
                colorScheme="blue" 
                onClick={this.handleReset}
                mr={4}
              >
                Yeniden Dene
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Sayfayı Yenile
              </Button>
            </Box>
          </VStack>
        </Box>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
