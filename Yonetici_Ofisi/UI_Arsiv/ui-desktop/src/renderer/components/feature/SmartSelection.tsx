import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  useColorMode,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Interface for a detected object (assuming structure from backend/core)
interface DetectedObject {
  id: string;
  label: string; // e.g., 'button', 'image', 'text_block'
  bounds: { x: number; y: number; width: number; height: number }; // Screen coordinates
  confidence?: number;
}

// Props for the SmartSelection component
interface SmartSelectionProps {
  // Props to interact with the core object detection logic
  onActivate?: () => Promise<DetectedObject[]>; // Function to call when activating selection
  onSelectObject?: (object: DetectedObject) => void; // Callback when an object is selected
  onRefineSelection?: (object: DetectedObject) => void; // Callback for refinement tools
}

export const SmartSelection: React.FC<SmartSelectionProps> = memo(({
  onActivate,
  onSelectObject,
  onRefineSelection
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // For potential modal/overlay
  const { colorMode } = useColorMode();
  const btnRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const [isSelecting, setIsSelecting] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Function to handle activation of smart selection mode
  const handleActivateSelection = useCallback(async () => {
    setIsSelecting(true);
    setIsLoading(true);
    setError(null);
    setDetectedObjects([]); // Clear previous objects
    setSelectedObjectId(null);
    console.log('Activating Smart Object Selection...');

    if (onActivate) {
      try {
        // Simulate or call the actual detection logic
        // In a real scenario, this might involve taking a screenshot,
        // sending it to a backend, and getting results.
        // For now, let's use mock data after a delay.
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        const mockObjects: DetectedObject[] = [
          { id: 'obj1', label: 'Button', bounds: { x: 100, y: 150, width: 80, height: 30 } },
          { id: 'obj2', label: 'Image', bounds: { x: 200, y: 200, width: 150, height: 100 } },
          { id: 'obj3', label: 'Text Block', bounds: { x: 50, y: 350, width: 300, height: 50 } },
          { id: 'obj4', label: 'Input Field', bounds: { x: 100, y: 450, width: 200, height: 25 } },
        ];
        setDetectedObjects(mockObjects);
        toast({
          title: "Nesneler algılandı",
          description: `${mockObjects.length} nesne bulundu. Seçmek için tıklayın.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom"
        });
      } catch (err) {
        console.error("Error detecting objects:", err);
        setError("Nesneler algılanırken bir hata oluştu.");
        toast({
          title: "Hata",
          description: "Nesneler algılanırken bir hata oluştu.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // No onActivate provided, maybe just toggle UI state
      setIsLoading(false);
      console.warn("onActivate prop not provided to SmartSelection");
      // Potentially show mock objects anyway for UI development
      const mockObjects: DetectedObject[] = [
        { id: 'obj1', label: 'Button', bounds: { x: 100, y: 150, width: 80, height: 30 } },
        { id: 'obj2', label: 'Image', bounds: { x: 200, y: 200, width: 150, height: 100 } },
      ];
      setDetectedObjects(mockObjects);
    }
    // In a real implementation, we might show an overlay here
    // onOpen(); 

  }, [onActivate, toast]);

  // Function to handle deactivation
  const handleDeactivateSelection = useCallback(() => {
    setIsSelecting(false);
    setDetectedObjects([]);
    setSelectedObjectId(null);
    setError(null);
    setIsLoading(false);
    onClose(); // Close any overlay/modal
    console.log('Deactivating Smart Object Selection.');
  }, [onClose]);

  // Handle clicking on a detected object overlay
  const handleObjectClick = useCallback((object: DetectedObject) => {
    setSelectedObjectId(object.id);
    console.log(`Object selected: ${object.label} (ID: ${object.id})`);
    if (onSelectObject) {
      onSelectObject(object);
    }
    // Potentially close the selection mode after selection
    // handleDeactivateSelection(); 
  }, [onSelectObject]);

  // Placeholder for refinement UI trigger
  const handleRefineClick = useCallback((e: React.MouseEvent, object: DetectedObject) => {
    e.stopPropagation(); // Prevent selecting the object when clicking refine
    console.log(`Refine requested for: ${object.label} (ID: ${object.id})`);
    if (onRefineSelection) {
      onRefineSelection(object);
    }
    // Here you would typically open a more detailed refinement UI
  }, [onRefineSelection]);

  // Render overlay with detected objects
  const renderSelectionOverlay = () => (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.1)" // Slight overlay tint
      zIndex="overlay"
      cursor="crosshair"
      onClick={handleDeactivateSelection} // Click outside objects to deactivate
    >
      {isLoading && (
        <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" direction="column" align="center">
          <Spinner size="xl" color="purple.500" />
          <Text mt={4} color="white" fontWeight="bold">Nesneler Algılanıyor...</Text>
        </Flex>
      )}
      {error && (
         <Alert 
            status="error" 
            position="absolute" 
            top="20px" 
            left="50%" 
            transform="translateX(-50%)" 
            maxWidth="400px"
            borderRadius="md"
          >
          <AlertIcon />
          <AlertTitle mr={2}>Algılama Hatası!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button size="sm" onClick={handleDeactivateSelection} ml="auto">Kapat</Button>
        </Alert>
      )}
      {!isLoading && !error && detectedObjects.map(obj => (
        <Box
          key={obj.id}
          position="absolute"
          left={`${obj.bounds.x}px`}
          top={`${obj.bounds.y}px`}
          width={`${obj.bounds.width}px`}
          height={`${obj.bounds.height}px`}
          border="2px solid"
          borderColor={selectedObjectId === obj.id ? "green.400" : "purple.400"}
          bg={selectedObjectId === obj.id ? "rgba(0, 255, 0, 0.2)" : "rgba(128, 0, 128, 0.2)"}
          borderRadius="sm"
          cursor="pointer"
          transition="all 0.1s ease-in-out"
          _hover={{
            borderColor: "green.400",
            bg: "rgba(0, 255, 0, 0.2)"
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent deactivating when clicking object
            handleObjectClick(obj);
          }}
          title={`${obj.label} (Seçmek için tıkla)`}
          role="button"
          aria-label={`Algılanan nesne: ${obj.label}`}
        >
          <Text 
            position="absolute" 
            bottom="100%" 
            left="0" 
            bg="purple.500" 
            color="white" 
            fontSize="xs" 
            px={1} 
            py="1px" 
            borderRadius="sm"
            mb="2px"
          >
            {obj.label}
          </Text>
          {/* Placeholder for refinement button */} 
          {/* <IconButton 
            aria-label="Seçimi İyileştir"
            icon={<Box>🔧</Box>} 
            size="xs"
            position="absolute"
            top="-10px"
            right="-10px"
            colorScheme="yellow"
            onClick={(e) => handleRefineClick(e, obj)}
          /> */} 
        </Box>
      ))}
      {!isLoading && !error && (
         <Button 
            position="absolute"
            bottom="20px"
            left="50%"
            transform="translateX(-50%)"
            colorScheme="red"
            onClick={handleDeactivateSelection}
          >
            Seçimi İptal Et
          </Button>
      )}
    </Box>
  );

  return (
    <>
      <Tooltip label="Akıllı Nesne Seçimi" aria-label="Akıllı Nesne Seçimi">
        <IconButton
          ref={btnRef}
          aria-label="Akıllı Nesne Seçimini Başlat"
          icon={<Box fontSize="xl" aria-hidden="true">🎯</Box>}
          variant="glass"
          onClick={handleActivateSelection}
          isLoading={isLoading}
          isDisabled={isSelecting} // Disable button while selecting
          {...animations.performanceUtils.forceGPU}
        />
      </Tooltip>

      {/* Render the overlay when isSelecting is true */} 
      {isSelecting && renderSelectionOverlay()}

      {/* Optional: Modal alternative for displaying results or errors */}
      {/* <Modal isOpen={isOpen} onClose={handleDeactivateSelection}> ... </Modal> */}
    </>
  );
});

SmartSelection.displayName = 'SmartSelection';

export default SmartSelection;

