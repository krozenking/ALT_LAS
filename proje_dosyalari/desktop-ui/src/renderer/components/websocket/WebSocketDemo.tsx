import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Heading,
  Input,
  VStack,
  HStack,
  Badge,
  Divider,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useColorMode,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { WebSocketProvider, useWebSocketContext } from '../../contexts/WebSocketContext';
import { glassmorphism } from '@/styles/theme';

// Message type
interface Message {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  direction: 'in' | 'out';
}

// WebSocket connection component
const WebSocketConnection: React.FC = () => {
  const { colorMode } = useColorMode();
  const {
    status,
    lastMessage,
    lastError,
    connect,
    disconnect,
    isConnected,
    reconnectAttempt,
    send,
    request,
  } = useWebSocketContext();

  const [url, setUrl] = useState<string>('ws://localhost:8080');
  const [messageType, setMessageType] = useState<string>('message');
  const [messagePayload, setMessagePayload] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage) {
      const message: Message = {
        id: `in_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: lastMessage.type,
        payload: lastMessage.payload,
        timestamp: Date.now(),
        direction: 'in',
      };
      setMessages(prev => [message, ...prev].slice(0, 50));
    }
  }, [lastMessage]);

  // Handle errors
  useEffect(() => {
    if (lastError) {
      setError(lastError instanceof Error ? lastError.message : 'WebSocket error');
    }
  }, [lastError]);

  // Handle connect button click
  const handleConnect = useCallback(() => {
    setError(null);
    connect();
  }, [connect]);

  // Handle disconnect button click
  const handleDisconnect = useCallback(() => {
    setError(null);
    disconnect();
  }, [disconnect]);

  // Handle send button click
  const handleSend = useCallback(async () => {
    setError(null);
    try {
      let payload: any;
      try {
        payload = messagePayload ? JSON.parse(messagePayload) : undefined;
      } catch (e) {
        payload = messagePayload;
      }

      await send(messageType, payload);

      const message: Message = {
        id: `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: messageType,
        payload,
        timestamp: Date.now(),
        direction: 'out',
      };
      setMessages(prev => [message, ...prev].slice(0, 50));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    }
  }, [messageType, messagePayload, send]);

  // Handle request button click
  const handleRequest = useCallback(async () => {
    setError(null);
    try {
      let payload: any;
      try {
        payload = messagePayload ? JSON.parse(messagePayload) : undefined;
      } catch (e) {
        payload = messagePayload;
      }

      const response = await request(messageType, payload);

      const requestMessage: Message = {
        id: `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: messageType,
        payload,
        timestamp: Date.now(),
        direction: 'out',
      };

      const responseMessage: Message = {
        id: `in_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: `${messageType}_response`,
        payload: response,
        timestamp: Date.now() + 1,
        direction: 'in',
      };

      setMessages(prev => [responseMessage, requestMessage, ...prev].slice(0, 50));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    }
  }, [messageType, messagePayload, request]);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'green';
      case 'connecting':
        return 'blue';
      case 'closing':
        return 'orange';
      case 'closed':
        return 'gray';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        {/* Connection controls */}
        <Box p={4} borderRadius="md" {...glassStyle}>
          <VStack spacing={4} align="stretch">
            <Heading size="md">WebSocket Connection</Heading>
            
            <FormControl>
              <FormLabel>Server URL</FormLabel>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="ws://localhost:8080"
                isDisabled={isConnected}
              />
            </FormControl>
            
            <Flex justify="space-between" align="center">
              <HStack>
                <Badge colorScheme={getStatusColor()} px={2} py={1}>
                  {status.toUpperCase()}
                </Badge>
                {reconnectAttempt > 0 && (
                  <Badge colorScheme="blue" px={2} py={1}>
                    Reconnect: {reconnectAttempt}
                  </Badge>
                )}
              </HStack>
              
              <HStack>
                <Button
                  colorScheme="primary"
                  onClick={handleConnect}
                  isDisabled={isConnected}
                >
                  Connect
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDisconnect}
                  isDisabled={!isConnected}
                >
                  Disconnect
                </Button>
              </HStack>
            </Flex>
          </VStack>
        </Box>
        
        {/* Error alert */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setError(null)}
            />
          </Alert>
        )}
        
        {/* Message controls */}
        <Box p={4} borderRadius="md" {...glassStyle}>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Send Message</Heading>
            
            <FormControl>
              <FormLabel>Message Type</FormLabel>
              <Input
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                placeholder="message"
                isDisabled={!isConnected}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Payload (JSON)</FormLabel>
              <Textarea
                value={messagePayload}
                onChange={(e) => setMessagePayload(e.target.value)}
                placeholder='{"key": "value"}'
                isDisabled={!isConnected}
                rows={4}
              />
            </FormControl>
            
            <HStack>
              <Button
                colorScheme="primary"
                onClick={handleSend}
                isDisabled={!isConnected}
                flex={1}
              >
                Send
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleRequest}
                isDisabled={!isConnected}
                flex={1}
              >
                Request
              </Button>
            </HStack>
          </VStack>
        </Box>
        
        {/* Message history */}
        <Box
          p={4}
          borderRadius="md"
          {...glassStyle}
          flex={1}
          overflowY="auto"
        >
          <Heading size="md" mb={4}>Message History</Heading>
          
          {messages.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              No messages yet
            </Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {messages.map((message) => (
                <Box
                  key={message.id}
                  p={3}
                  borderRadius="md"
                  bg={colorMode === 'light'
                    ? message.direction === 'in' ? 'blue.50' : 'green.50'
                    : message.direction === 'in' ? 'blue.900' : 'green.900'
                  }
                  borderLeft="4px solid"
                  borderColor={message.direction === 'in' ? 'blue.500' : 'green.500'}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Badge colorScheme={message.direction === 'in' ? 'blue' : 'green'}>
                      {message.direction === 'in' ? 'RECEIVED' : 'SENT'}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Text>
                  </Flex>
                  
                  <Text fontWeight="bold" mb={1}>
                    Type: {message.type}
                  </Text>
                  
                  <Box
                    p={2}
                    borderRadius="md"
                    bg={colorMode === 'light' ? 'white' : 'gray.700'}
                    fontSize="sm"
                    fontFamily="monospace"
                    whiteSpace="pre-wrap"
                    overflowX="auto"
                  >
                    {typeof message.payload === 'object'
                      ? JSON.stringify(message.payload, null, 2)
                      : String(message.payload)
                    }
                  </Box>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

// Main WebSocket demo component
const WebSocketDemo: React.FC = () => {
  return (
    <WebSocketProvider url="ws://localhost:8080">
      <WebSocketConnection />
    </WebSocketProvider>
  );
};

export default WebSocketDemo;
