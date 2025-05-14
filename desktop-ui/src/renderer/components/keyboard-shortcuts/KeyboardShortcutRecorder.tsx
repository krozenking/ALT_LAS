import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  useColorMode,
  BoxProps,
} from '@chakra-ui/react';
import { useKeyboardShortcuts } from './KeyboardShortcutContext';
import { KeyboardShortcut } from './types';
import { glassmorphism } from '../../styles/themes/creator';

// Keyboard shortcut recorder props
export interface KeyboardShortcutRecorderProps extends BoxProps {
  /**
   * Shortcut ID
   */
  shortcutId: string;
  /**
   * On change callback
   */
  onChange?: (shortcutId: string, shortcut: KeyboardShortcut) => void;
  /**
   * On reset callback
   */
  onReset?: (shortcutId: string) => void;
}

/**
 * Keyboard shortcut recorder component
 */
const KeyboardShortcutRecorder: React.FC<KeyboardShortcutRecorderProps> = ({
  shortcutId,
  onChange,
  onReset,
  ...rest
}) => {
  const {
    state,
    getShortcut,
    startRecording,
    stopRecording,
    resetShortcut,
    formatShortcut,
  } = useKeyboardShortcuts();
  const { colorMode } = useColorMode();
  
  // Local state
  const [isRecording, setIsRecording] = useState(false);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Get shortcut
  const shortcut = getShortcut(shortcutId);
  
  // Update recording state when recording shortcut changes
  useEffect(() => {
    setIsRecording(state.recordingShortcut === shortcutId);
  }, [state.recordingShortcut, shortcutId]);
  
  // Handle start recording
  const handleStartRecording = () => {
    startRecording(shortcutId);
    setIsRecording(true);
  };
  
  // Handle stop recording
  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
  };
  
  // Handle reset
  const handleReset = () => {
    resetShortcut(shortcutId);
    
    if (onReset) {
      onReset(shortcutId);
    }
  };
  
  // Handle change
  useEffect(() => {
    if (shortcut && onChange) {
      onChange(shortcutId, shortcut);
    }
  }, [shortcut, shortcutId, onChange]);
  
  return (
    <Box
      p={2}
      borderRadius="md"
      borderWidth="1px"
      borderColor={isRecording ? 'blue.500' : colorMode === 'light' ? 'gray.200' : 'gray.700'}
      bg={isRecording ? (colorMode === 'light' ? 'blue.50' : 'blue.900') : 'transparent'}
      {...glassStyle}
      {...rest}
    >
      <HStack spacing={2} justifyContent="space-between">
        <Box flex="1">
          {isRecording ? (
            <Text fontStyle="italic" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
              Press any key combination...
            </Text>
          ) : shortcut ? (
            <Text fontWeight="medium">
              {formatShortcut(shortcut, { useSymbols: true, usePlatformSpecificSymbols: true })}
            </Text>
          ) : (
            <Text fontStyle="italic" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
              No shortcut assigned
            </Text>
          )}
        </Box>
        
        <HStack spacing={1}>
          {isRecording ? (
            <Button
              size="xs"
              colorScheme="blue"
              onClick={handleStopRecording}
            >
              Cancel
            </Button>
          ) : (
            <Button
              size="xs"
              colorScheme="blue"
              onClick={handleStartRecording}
            >
              Record
            </Button>
          )}
          
          {shortcut && shortcut.isCustom && (
            <Button
              size="xs"
              colorScheme="red"
              variant="outline"
              onClick={handleReset}
            >
              Reset
            </Button>
          )}
        </HStack>
      </HStack>
    </Box>
  );
};

export default KeyboardShortcutRecorder;
