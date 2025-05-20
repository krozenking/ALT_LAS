import React, { useState, useRef, useEffect, useId } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  IconButton, 
  useColorMode,
  Text,
  Tooltip,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Kbd
} from '@chakra-ui/react';
import { 
  MdDragIndicator, 
  MdClose, 
  MdSettings, 
  MdFullscreen, 
  MdFullscreenExit,
  MdMinimize,
  MdOutlineMaximize
} from 'react-icons/md';
import { glassmorphism } from '../../styles/theme';
import { motion, AnimatePresence } from 'framer-motion';

export interface PanelProps {
  title: string;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  headerActions?: React.ReactNode;
  isDraggable?: boolean;
  isResizable?: boolean;
  minWidth?: string;
  minHeight?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  children?: React.ReactNode;
  ariaLabel?: string;
  id?: string;
  shortcutKey?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const EnhancedPanel: React.FC<PanelProps> = ({
  title,
  headerLevel = 'h3',
  headerActions,
  isDraggable = true,
  isResizable = true,
  minWidth = '200px',
  minHeight = '150px',
  onDragStart,
  onDragEnd,
  children,
  ariaLabel,
  id: externalId,
  shortcutKey,
  onClose,
  onMinimize,
  onMaximize,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const generatedId = useId();
  const panelId = externalId || generatedId;
  const headerId = title ? `${panelId}-header` : undefined;
  const contentId = `${panelId}-content`;
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.75, 15, 1)
    : glassmorphism.createDark(0.75, 15, 1);

  // Handle drag start/end
  const handleDragStart = () => {
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
  };

  // Handle maximize/restore
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (onMaximize) onMaximize();
  };

  // Focus panel when shortcut key is pressed
  useEffect(() => {
    if (!shortcutKey) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+[shortcutKey]
      if (e.ctrlKey && e.shiftKey && e.key === shortcutKey) {
        e.preventDefault();
        panelRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey]);

  // Animation variants for panel
  const panelVariants = {
    normal: { 
      scale: 1,
      opacity: 1,
      transition: { duration: 0.2 }
    },
    dragging: { 
      scale: 1.02,
      opacity: 0.9,
      transition: { duration: 0.2 }
    },
    maximized: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: 1000,
      width: '100vw',
      height: '100vh',
      transition: { duration: 0.3 }
    }
  };

  // Render the header based on the specified level
  const HeaderComponent = ({ as, children, ...props }: any) => {
    const Component = as || 'h3';
    return <Component {...props}>{children}</Component>;
  };

  return (
    <motion.div
      ref={panelRef}
      variants={panelVariants}
      animate={isMaximized ? 'maximized' : isDragging ? 'dragging' : 'normal'}
      tabIndex={0}
      role="region"
      aria-labelledby={headerId}
      style={{ 
        minWidth, 
        minHeight,
        position: isMaximized ? 'fixed' : 'relative',
        zIndex: isMaximized ? 1000 : 'auto'
      }}
    >
      <Box
        sx={{
          ...glassStyle,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: isDragging 
            ? '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 8px 10px 0 rgba(0, 0, 0, 0.1)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'box-shadow 0.2s ease-in-out',
          outline: 'none',
          '&:focus-visible': {
            boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(66, 153, 225, 0.6)' : 'rgba(99, 179, 237, 0.6)'}`,
          }
        }}
        {...rest}
      >
        {/* Panel Header */}
        <Flex
          ref={dragHandleRef}
          className="panel-header"
          px={3}
          py={2}
          alignItems="center"
          bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'}
          borderBottom="1px solid"
          borderColor={colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}
          cursor={isDraggable ? 'move' : 'default'}
          onMouseDown={isDraggable ? handleDragStart : undefined}
          onMouseUp={isDraggable ? handleDragEnd : undefined}
          id={headerId}
        >
          {isDraggable && (
            <Box mr={2} color="gray.500">
              <MdDragIndicator />
            </Box>
          )}
          
          <HeaderComponent
            as={headerLevel}
            flex="1"
            fontSize="sm"
            fontWeight="medium"
            m={0}
            isTruncated
          >
            {title}
            {shortcutKey && (
              <Text as="span" ml={2} fontSize="xs" opacity={0.7}>
                <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+<Kbd>{shortcutKey}</Kbd>
              </Text>
            )}
          </HeaderComponent>
          
          <Flex>
            {headerActions}
            
            {onMinimize && (
              <Tooltip label="Minimize">
                <IconButton
                  aria-label="Minimize panel"
                  icon={<MdMinimize />}
                  size="sm"
                  variant="ghost"
                  onClick={onMinimize}
                />
              </Tooltip>
            )}
            
            {isResizable && (
              <Tooltip label={isMaximized ? "Restore" : "Maximize"}>
                <IconButton
                  aria-label={isMaximized ? "Restore panel" : "Maximize panel"}
                  icon={isMaximized ? <MdFullscreenExit /> : <MdFullscreen />}
                  size="sm"
                  variant="ghost"
                  onClick={toggleMaximize}
                />
              </Tooltip>
            )}
            
            {onClose && (
              <Tooltip label="Close">
                <IconButton
                  aria-label="Close panel"
                  icon={<MdClose />}
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                />
              </Tooltip>
            )}
          </Flex>
        </Flex>
        
        {/* Panel Content */}
        <Box
          id={contentId}
          flex="1"
          p={3}
          overflowY="auto"
          role="document"
          aria-label={ariaLabel || `${title} content`}
        >
          {children}
        </Box>
      </Box>
    </motion.div>
  );
};

export default EnhancedPanel;
