import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  useColorMode, 
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Switch,
  Select,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  CheckboxGroup,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton
} from '@chakra-ui/react';
import { animations } from '@styles/animations';

// Ayarlar arayüzü
export interface SettingsGroup {
  id: string;
  name: string;
  icon: string;
  settings: Setting[];
}

export interface Setting {
  id: string;
  name: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'slider' | 'radio' | 'checkbox' | 'textarea';
  value: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  advanced?: boolean;
}

// Ayarlar paneli özellikleri
interface SettingsPanelProps {
  initialSettings?: SettingsGroup[];
  onSettingChange?: (groupId: string, settingId: string, value: any) => void;
  onResetDefaults?: () => void;
  onExportSettings?: () => void;
  onImportSettings?: (settings: SettingsGroup[]) => void;
}

// Ayarlar paneli bileşeni
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialSettings = [],
  onSettingChange,
  onResetDefaults,
  onExportSettings,
  onImportSettings
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, setColorMode } = useColorMode(); // Added setColorMode
  const [settings, setSettings] = useState<SettingsGroup[]>(initialSettings);
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const importFileRef = useRef<HTMLInputElement>(null);
  
  // Demo ayarlar
  useEffect(() => {
    if (settings.length === 0) {
      const demoSettings: SettingsGroup[] = [
        {
          id: 'general',
          name: 'Genel',
          icon: '⚙️',
          settings: [
            {
              id: 'language',
              name: 'Dil',
              description: 'Uygulama arayüzü dili',
              type: 'select',
              value: 'tr',
              options: [
                { value: 'tr', label: 'Türkçe' },
                { value: 'en', label: 'İngilizce' },
                { value: 'de', label: 'Almanca' },
                { value: 'fr', label: 'Fransızca' },
                { value: 'es', label: 'İspanyolca' }
              ]
            },
            {
              id: 'notifications',
              name: 'Bildirimler',
              description: 'Sistem bildirimleri',
              type: 'toggle',
              value: true
            },
            {
              id: 'autoUpdate',
              name: 'Otomatik Güncelleme',
              description: 'Uygulamanın otomatik güncellenmesi',
              type: 'toggle',
              value: true
            },
            {
              id: 'telemetry',
              name: 'Telemetri',
              description: 'Anonim kullanım verilerinin gönderilmesi',
              type: 'toggle',
              value: false,
              advanced: true
            }
          ]
        },
        {
          id: 'appearance',
          name: 'Görünüm',
          icon: '🎨',
          settings: [
            {
              id: 'theme',
              name: 'Tema',
              description: 'Uygulama teması',
              type: 'radio',
              value: 'system',
              options: [
                { value: 'light', label: 'Açık' },
                { value: 'dark', label: 'Koyu' },
                { value: 'system', label: 'Sistem' }
              ]
            },
            {
              id: 'fontSize',
              name: 'Yazı Boyutu',
              description: 'Arayüz yazı boyutu',
              type: 'slider',
              value: 14,
              min: 10,
              max: 20,
              step: 1
            },
            {
              id: 'animations',
              name: 'Animasyonlar',
              description: 'Arayüz animasyonları',
              type: 'toggle',
              value: true
            },
            {
              id: 'customCss',
              name: 'Özel CSS',
              description: 'Arayüz için özel CSS kodları',
              type: 'textarea',
              value: '',
              placeholder: '/* Özel CSS kodlarınızı buraya yazın */',
              advanced: true
            }
          ]
        },
        {
          id: 'accessibility',
          name: 'Erişilebilirlik',
          icon: '♿',
          settings: [
            {
              id: 'highContrast',
              name: 'Yüksek Kontrast',
              description: 'Yüksek kontrast modu',
              type: 'toggle',
              value: false
            },
            {
              id: 'reducedMotion',
              name: 'Azaltılmış Hareket',
              description: 'Animasyon ve geçişleri azalt',
              type: 'toggle',
              value: false
            },
            {
              id: 'screenReader',
              name: 'Ekran Okuyucu Optimizasyonu',
              description: 'Ekran okuyucular için ek açıklamalar',
              type: 'toggle',
              value: true
            },
            {
              id: 'keyboardNavigation',
              name: 'Klavye Navigasyonu',
              description: 'Gelişmiş klavye navigasyonu',
              type: 'toggle',
              value: true
            }
          ]
        },
        {
          id: 'performance',
          name: 'Performans',
          icon: '⚡',
          settings: [
            {
              id: 'hardwareAcceleration',
              name: 'Donanım Hızlandırma',
              description: 'GPU hızlandırma kullan',
              type: 'toggle',
              value: true
            },
            {
              id: 'backgroundProcesses',
              name: 'Arka Plan İşlemleri',
              description: 'Arka planda çalışacak işlemler',
              type: 'checkbox',
              value: ['sync', 'indexing'],
              options: [
                { value: 'sync', label: 'Senkronizasyon' },
                { value: 'indexing', label: 'İndeksleme' },
                { value: 'analytics', label: 'Analitik' },
                { value: 'updates', label: 'Güncellemeler' }
              ]
            },
            {
              id: 'memoryLimit',
              name: 'Bellek Limiti',
              description: 'Maksimum bellek kullanımı (MB)',
              type: 'input',
              value: '1024',
              advanced: true
            },
            {
              id: 'logLevel',
              name: 'Günlük Seviyesi',
              description: 'Günlük kayıt detay seviyesi',
              type: 'select',
              value: 'error',
              options: [
                { value: 'debug', label: 'Hata Ayıklama' },
                { value: 'info', label: 'Bilgi' },
                { value: 'warn', label: 'Uyarı' },
                { value: 'error', label: 'Hata' }
              ],
              advanced: true
            }
          ]
        },
        {
          id: 'privacy',
          name: 'Gizlilik',
          icon: '🔒',
          settings: [
            {
              id: 'dataSaving',
              name: 'Veri Tasarrufu',
              description: 'Veri kullanımını azalt',
              type: 'toggle',
              value: false
            },
            {
              id: 'cookies',
              name: 'Çerezler',
              description: 'Çerez kullanımı',
              type: 'radio',
              value: 'essential',
              options: [
                { value: 'all', label: 'Tümüne İzin Ver' },
                { value: 'essential', label: 'Sadece Gerekli' },
                { value: 'none', label: 'Hiçbiri' }
              ]
            },
            {
              id: 'dataRetention',
              name: 'Veri Saklama',
              description: 'Verilerin saklanma süresi',
              type: 'select',
              value: '30',
              options: [
                { value: '7', label: '7 gün' },
                { value: '30', label: '30 gün' },
                { value: '90', label: '90 gün' },
                { value: '365', label: '1 yıl' },
                { value: 'forever', label: 'Süresiz' }
              ]
            },
            {
              id: 'deleteData',
              name: 'Tüm Verileri Sil',
              description: 'Tüm kullanıcı verilerini kalıcı olarak sil',
              type: 'input',
              value: '',
              placeholder: 'Onaylamak için "SİL" yazın',
              advanced: true
            }
          ]
        }
      ];
      
      setSettings(demoSettings);
      if (demoSettings.length > 0) {
        setActiveGroup(demoSettings[0].id);
      }
    }
  }, []);
  
  // Ayar değişikliği
  const handleSettingChange = (groupId: string, settingId: string, value: any) => {
    setSettings(prevSettings => {
      const newSettings = [...prevSettings];
      const groupIndex = newSettings.findIndex(g => g.id === groupId);
      
      if (groupIndex !== -1) {
        const settingIndex = newSettings[groupIndex].settings.findIndex(s => s.id === settingId);
        
        if (settingIndex !== -1) {
          newSettings[groupIndex].settings[settingIndex].value = value;
        }
      }
      
      return newSettings;
    });
    
    if (onSettingChange) {
      onSettingChange(groupId, settingId, value);
    }
    
    // Update color mode if high contrast setting is changed
    if (groupId === 'accessibility' && settingId === 'highContrast') {
      setColorMode(value ? 'highContrast' : 'dark'); // Toggle between highContrast and dark
    }
  };
  
  // Varsayılanlara sıfırla
  const handleResetDefaults = () => {
    // Burada varsayılan ayarları yükleyebilirsiniz
    if (onResetDefaults) {
      onResetDefaults();
    }
  };
  
  // Ayarları dışa aktar
  const handleExportSettings = () => {
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alt_las_settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onExportSettings) {
      onExportSettings();
    }
  };
  
  // Ayarları içe aktar
  const handleImportClick = () => {
    if (importFileRef.current) {
      importFileRef.current.click();
    }
  };
  
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        
        if (onImportSettings) {
          onImportSettings(importedSettings);
        }
      } catch (error) {
        console.error('Ayarlar içe aktarılırken hata oluştu:', error);
      }
    };
    reader.readAsText(file);
    
    // Dosya seçiciyi sıfırla
    if (event.target) {
      event.target.value = '';
    }
  };
  
  // Ayarları filtrele
  const filteredSettings = settings.map(group => {
    const filteredGroupSettings = group.settings.filter(setting => {
      const matchesSearch = 
        setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setting.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAdvanced = showAdvanced || !setting.advanced;
      
      return matchesSearch && matchesAdvanced;
    });
    
    return {
      ...group,
      settings: filteredGroupSettings,
      hasMatchingSettings: filteredGroupSettings.length > 0
    };
  });
  
  // Aktif grup ayarları
  const activeGroupSettings = filteredSettings.find(g => g.id === activeGroup)?.settings || [];
  
  // Ayar bileşeni
  const SettingControl = ({ setting, groupId }: { setting: Setting, groupId: string }) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <FormControl 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            isDisabled={setting.disabled}
          >
            <Box>
              <FormLabel htmlFor={setting.id} mb="0">{setting.name}</FormLabel>
              <FormHelperText>{setting.description}</FormHelperText>
            </Box>
            <Switch
              id={setting.id}
              isChecked={setting.value}
              onChange={(e) => handleSettingChange(groupId, setting.id, e.target.checked)}
              colorScheme="blue"
              size="md"
            />
          </FormControl>
        );
        
      case 'select':
        return (
          <FormControl isDisabled={setting.disabled}>
            <FormLabel htmlFor={setting.id}>{setting.name}</FormLabel>
            <Select
              id={setting.id}
              value={setting.value}
              onChange={(e) => handleSettingChange(groupId, setting.id, e.target.value)}
            >
              {setting.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FormHelperText>{setting.description}</FormHelperText>
          </FormControl>
        );
        
      case 'input':
        return (
          <FormControl isDisabled={setting.disabled}>
            <FormLabel htmlFor={setting.id}>{setting.name}</FormLabel>
            <Input
              id={setting.id}
              value={setting.value}
              onChange={(e) => handleSettingChange(groupId, setting.id, e.target.value)}
              placeholder={setting.placeholder}
            />
            <FormHelperText>{setting.description}</FormHelperText>
          </FormControl>
        );
        
      case 'slider':
        return (
          <FormControl isDisabled={setting.disabled}>
            <FormLabel htmlFor={setting.id}>{setting.name}</FormLabel>
            <Flex>
              <Slider
                id={setting.id}
                value={setting.value}
                min={setting.min}
                max={setting.max}
                step={setting.step}
                onChange={(val) => handleSettingChange(groupId, setting.id, val)}
                flex="1"
                mr={4}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6} />
              </Slider>
              <Text fontWeight="medium" minWidth="40px" textAlign="center">
                {setting.value}
              </Text>
            </Flex>
            <FormHelperText>{setting.description}</FormHelperText>
          </FormControl>
        );
        
      case 'radio':
        return (
          <FormControl isDisabled={setting.disabled}>
            <FormLabel htmlFor={setting.id}>{setting.name}</FormLabel>
            <RadioGroup
              id={setting.id}
              value={setting.value}
              onChange={(val) => handleSettingChange(groupId, setting.id, val)}
            >
              <Stack direction="column">
                {setting.options?.map(option => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            <FormHelperText>{setting.description}</FormHelperText>
          </FormControl>
        );
        
      case 'checkbox':
        return (
          <FormControl isDisabled={setting.disabled}>
            <FormLabel htmlFor={setting.id}>{setting.name}</FormLabel>
            <CheckboxGroup
              value={setting.value}
              onChange={(val) => handleSettingChange(groupId, setting.id, val)}
            >
              <Stack direction="column">
                {setting.options?.map(option => (
                  <Checkbox key={option.value} value={option.value}>
                    {option.label}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
            <FormHelperText>{setting.description}</FormHelperText>
          </FormControl>
        );
        
      case 'textarea':
        return (
          <FormControl isDisabled={setting.disabled}>
            <FormLabel htmlFor={setting.id}>{setting.name}</FormLabel>
            <Textarea
              id={setting.id}
              value={setting.value}
              onChange={(e) => handleSettingChange(groupId, setting.id, e.target.value)}
              placeholder={setting.placeholder}
              size="sm"
              rows={4}
            />
            <FormHelperText>{setting.description}</FormHelperText>
          </FormControl>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <>
      {/* Ayarlar Paneli Açma Butonu */}
      <Tooltip label="Ayarlar" aria-label="Ayarlar">
        <IconButton
          aria-label="Ayarlar"
          icon={<Box fontSize="xl">⚙️</Box>}
          variant="glass"
          onClick={onOpen}
          {...animations.performanceUtils.forceGPU}
        />
      </Tooltip>
      
      {/* Ayarlar Paneli Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="xl"
        aria-labelledby="settings-panel-header"
      >
        <DrawerOverlay />
        <DrawerContent
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          borderLeftRadius="md"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" fontWeight="bold" id="settings-panel-header">Ayarlar</Text>
              <HStack>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="show-advanced" mb="0" fontSize="sm">
                    Gelişmiş
                  </FormLabel>
                  <Switch
                    id="show-advanced"
                    size="sm"
                    isChecked={showAdvanced}
                    onChange={(e) => setShowAdvanced(e.target.checked)}
                  />
                </FormControl>
              </HStack>
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={0}>
            <Flex height="100%">
              {/* Sol Menü */}
              <Box 
                width="200px" 
                borderRightWidth="1px" 
                height="100%" 
                overflowY="auto"
                p={4}
              >
                <InputGroup mb={4} size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Box color="gray.500">🔍</Box>
                  </InputLeftElement>
                  <Input
                    placeholder="Ayarları ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Ayarları ara"
                  />
                </InputGroup>
                
                <VStack align="stretch" spacing={1}>
                  {filteredSettings.map(group => (
                    group.hasMatchingSettings && (
                      <Button
                        key={group.id}
                        leftIcon={<Box>{group.icon}</Box>}
                        justifyContent="flex-start"
                        variant={activeGroup === group.id ? 'solid' : 'ghost'}
                        size="md"
                        onClick={() => setActiveGroup(group.id)}
                        mb={1}
                      >
                        {group.name}
                      </Button>
                    )
                  ))}
                </VStack>
                
                <Divider my={4} />
                
                <VStack align="stretch" spacing={2}>
                  <Button 
                    leftIcon={<Box>🔄</Box>} 
                    size="sm" 
                    variant="outline"
                    onClick={handleResetDefaults}
                  >
                    Varsayılanlara Sıfırla
                  </Button>
                  <Button 
                    leftIcon={<Box>📤</Box>} 
                    size="sm" 
                    variant="outline"
                    onClick={handleExportSettings}
                  >
                    Ayarları Dışa Aktar
                  </Button>
                  <Button 
                    leftIcon={<Box>📥</Box>} 
                    size="sm" 
                    variant="outline"
                    onClick={handleImportClick}
                  >
                    Ayarları İçe Aktar
                  </Button>
                  <input
                    type="file"
                    ref={importFileRef}
                    style={{ display: 'none' }}
                    accept=".json"
                    onChange={handleImportSettings}
                  />
                </VStack>
              </Box>
              
              {/* Sağ İçerik */}
              <Box flex="1" p={6} overflowY="auto">
                {activeGroupSettings.length > 0 ? (
                  <VStack align="stretch" spacing={6}>
                    {activeGroupSettings.map(setting => (
                      <Box 
                        key={setting.id} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md"
                        bg={colorMode === 'light' ? 'white' : 'gray.700'}
                        boxShadow="sm"
                        position="relative"
                      >
                        {setting.advanced && (
                          <Badge 
                            position="absolute" 
                            top="2" 
                            right="2" 
                            colorScheme="purple"
                          >
                            Gelişmiş
                          </Badge>
                        )}
                        <SettingControl setting={setting} groupId={activeGroup} />
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Flex 
                    height="100%" 
                    alignItems="center" 
                    justifyContent="center" 
                    p={8}
                  >
                    <Text color="gray.500">
                      {searchQuery 
                        ? 'Arama kriterlerine uygun ayar bulunamadı' 
                        : 'Bu kategoride ayar bulunamadı'}
                    </Text>
                  </Flex>
                )}
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SettingsPanel;
