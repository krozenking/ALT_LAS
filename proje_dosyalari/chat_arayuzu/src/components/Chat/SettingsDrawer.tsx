import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Divider,
  Text,
  Box,
  useColorMode,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, InfoIcon } from '@chakra-ui/icons';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  aiModel: string;
  onAiModelChange: (model: string) => void;
  availableModels: { id: string; name: string }[];
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  aiModel,
  onAiModelChange,
  availableModels
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [fontSize, setFontSize] = React.useState<number>(14);
  const [showTooltip, setShowTooltip] = React.useState<boolean>(false);
  const [notifications, setNotifications] = React.useState<boolean>(true);
  const [autoScroll, setAutoScroll] = React.useState<boolean>(true);
  const [markdownEnabled, setMarkdownEnabled] = React.useState<boolean>(true);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent bg={bgColor} color={textColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
          Ayarlar
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={6} align="stretch" py={4}>
            {/* Tema Ayarları */}
            <Box>
              <Text fontWeight="bold" fontSize="lg" mb={4}>
                Görünüm
              </Text>
              
              <Stack spacing={4}>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel htmlFor="theme-toggle" mb="0">
                    <HStack>
                      <Icon as={colorMode === 'light' ? SunIcon : MoonIcon} />
                      <Text>{colorMode === 'light' ? 'Aydınlık Tema' : 'Karanlık Tema'}</Text>
                    </HStack>
                  </FormLabel>
                  <Switch
                    id="theme-toggle"
                    isChecked={colorMode === 'dark'}
                    onChange={toggleColorMode}
                    colorScheme="blue"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="font-size">Yazı Boyutu: {fontSize}px</FormLabel>
                  <Slider
                    id="font-size"
                    min={12}
                    max={20}
                    step={1}
                    value={fontSize}
                    onChange={(val) => setFontSize(val)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    colorScheme="blue"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="blue.500"
                      color="white"
                      placement="top"
                      isOpen={showTooltip}
                      label={`${fontSize}px`}
                    >
                      <SliderThumb />
                    </Tooltip>
                  </Slider>
                </FormControl>
              </Stack>
            </Box>
            
            <Divider />
            
            {/* AI Modeli Ayarları */}
            <Box>
              <Text fontWeight="bold" fontSize="lg" mb={4}>
                AI Modeli
              </Text>
              
              <FormControl>
                <FormLabel htmlFor="ai-model">AI Modeli Seçin</FormLabel>
                <Select
                  id="ai-model"
                  value={aiModel}
                  onChange={(e) => onAiModelChange(e.target.value)}
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <Box mt={4} p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                <HStack>
                  <InfoIcon color="blue.500" />
                  <Text fontSize="sm">
                    Farklı AI modelleri farklı yeteneklere ve performans özelliklerine sahiptir.
                  </Text>
                </HStack>
              </Box>
            </Box>
            
            <Divider />
            
            {/* Bildirim Ayarları */}
            <Box>
              <Text fontWeight="bold" fontSize="lg" mb={4}>
                Bildirimler ve Davranış
              </Text>
              
              <Stack spacing={4}>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel htmlFor="notifications" mb="0">
                    Bildirimler
                  </FormLabel>
                  <Switch
                    id="notifications"
                    isChecked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    colorScheme="blue"
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel htmlFor="auto-scroll" mb="0">
                    Otomatik Kaydırma
                  </FormLabel>
                  <Switch
                    id="auto-scroll"
                    isChecked={autoScroll}
                    onChange={() => setAutoScroll(!autoScroll)}
                    colorScheme="blue"
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel htmlFor="markdown" mb="0">
                    Markdown Desteği
                    <Badge ml={2} colorScheme="green" fontSize="0.7em">
                      Beta
                    </Badge>
                  </FormLabel>
                  <Switch
                    id="markdown"
                    isChecked={markdownEnabled}
                    onChange={() => setMarkdownEnabled(!markdownEnabled)}
                    colorScheme="blue"
                  />
                </FormControl>
              </Stack>
            </Box>
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose}>
            Kapat
          </Button>
          <Button colorScheme="blue">Kaydet</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer;
