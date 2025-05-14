import React, { useState } from 'react';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
import Panel from '@/components/composition/Panel';
import SplitView from '@/components/composition/SplitView';
import PanelContainer from '@/components/composition/PanelContainer';
import Button from '@/components/core/Button';
import Card from '@/components/core/Card';
import Input from '@/components/core/Input';
import IconButton from '@/components/core/IconButton';

export interface DemoLayoutProps {
  backgroundImage?: string;
}

export const DemoLayout: React.FC<DemoLayoutProps> = ({
  backgroundImage
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [showPanelContainer, setShowPanelContainer] = useState(false);
  
  // Sample panels for the PanelContainer demo
  const initialPanels = [
    {
      id: 'panel1',
      title: 'Görev Yöneticisi',
      content: (
        <Box p={2}>
          <Card variant="glass" mb={3} p={3}>
            <Box fontWeight="medium" mb={2}>Ekran Yakalama</Box>
            <Box fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
              Durum: Çalışıyor
            </Box>
            <Box mt={2} bg={colorMode === 'light' ? 'blue.100' : 'blue.900'} h="4px" w="70%" borderRadius="full" />
          </Card>
          
          <Card variant="glass" mb={3} p={3}>
            <Box fontWeight="medium" mb={2}>Görüntü Analizi</Box>
            <Box fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
              Durum: Analiz Ediliyor
            </Box>
            <Box mt={2} bg={colorMode === 'light' ? 'green.100' : 'green.900'} h="4px" w="40%" borderRadius="full" />
          </Card>
          
          <Card variant="glass" p={3}>
            <Box fontWeight="medium" mb={2}>Veri İşleme</Box>
            <Box fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
              Durum: %62 Tamamlandı
            </Box>
            <Box mt={2} bg={colorMode === 'light' ? 'purple.100' : 'purple.900'} h="4px" w="62%" borderRadius="full" />
          </Card>
        </Box>
      ),
      position: { x: 50, y: 50 },
      size: { width: 300, height: 300 }
    },
    {
      id: 'panel2',
      title: 'Sistem Durumu',
      content: (
        <Box p={2}>
          <Box mb={3}>
            <Box fontSize="sm" mb={1}>CPU Kullanımı: 35%</Box>
            <Box bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} h="6px" borderRadius="full">
              <Box bg="cyan.400" h="6px" w="35%" borderRadius="full" />
            </Box>
          </Box>
          
          <Box mb={3}>
            <Box fontSize="sm" mb={1}>Bellek Kullanımı: 48%</Box>
            <Box bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} h="6px" borderRadius="full">
              <Box bg="cyan.400" h="6px" w="48%" borderRadius="full" />
            </Box>
          </Box>
          
          <Box>
            <Box fontSize="sm" mb={1}>Disk Kullanımı: 62%</Box>
            <Box bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} h="6px" borderRadius="full">
              <Box bg="cyan.400" h="6px" w="62%" borderRadius="full" />
            </Box>
          </Box>
        </Box>
      ),
      position: { x: 400, y: 50 },
      size: { width: 300, height: 200 }
    }
  ];
  
  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column"
      backgroundImage={backgroundImage || (colorMode === 'light' 
        ? "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" 
        : "url('https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80')")}
      backgroundSize="cover"
      backgroundPosition="center"
      overflow="hidden"
    >
      {/* Header */}
      <Flex 
        p={4} 
        justifyContent="space-between" 
        alignItems="center"
        backdropFilter="blur(10px)"
        bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'}
        borderBottom="1px solid"
        borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}
      >
        <Box fontSize="2xl" fontWeight="bold">ALT_LAS</Box>
        <Flex>
          <Button 
            variant="glass" 
            size="sm" 
            mr={2}
            onClick={() => setShowPanelContainer(!showPanelContainer)}
          >
            {showPanelContainer ? 'Split View Göster' : 'Panel Container Göster'}
          </Button>
          <IconButton 
            variant="glass" 
            size="sm"
            icon={<Box>{colorMode === 'light' ? '🌙' : '☀️'}</Box>}
            ariaLabel="Tema Değiştir"
            onClick={toggleColorMode}
          />
        </Flex>
      </Flex>
      
      {/* Main Content */}
      <Box flex="1" p={4} overflow="hidden">
        {showPanelContainer ? (
          <PanelContainer 
            initialPanels={initialPanels}
            allowDragDrop={true}
            allowResize={true}
            allowCombine={true}
            height="100%"
          />
        ) : (
          <SplitView
            direction="horizontal"
            initialRatio={0.3}
            height="100%"
            leftOrTopContent={
              <Panel title="Görev Yöneticisi" height="100%">
                <Box p={2}>
                  <Card variant="glass" mb={3} p={3}>
                    <Box fontWeight="medium" mb={2}>Ekran Yakalama</Box>
                    <Box fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                      Durum: Çalışıyor
                    </Box>
                    <Box mt={2} bg={colorMode === 'light' ? 'blue.100' : 'blue.900'} h="4px" w="70%" borderRadius="full" />
                  </Card>
                  
                  <Card variant="glass" mb={3} p={3}>
                    <Box fontWeight="medium" mb={2}>Görüntü Analizi</Box>
                    <Box fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                      Durum: Analiz Ediliyor
                    </Box>
                    <Box mt={2} bg={colorMode === 'light' ? 'green.100' : 'green.900'} h="4px" w="40%" borderRadius="full" />
                  </Card>
                  
                  <Card variant="glass" p={3}>
                    <Box fontWeight="medium" mb={2}>Veri İşleme</Box>
                    <Box fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                      Durum: %62 Tamamlandı
                    </Box>
                    <Box mt={2} bg={colorMode === 'light' ? 'purple.100' : 'purple.900'} h="4px" w="62%" borderRadius="full" />
                  </Card>
                </Box>
              </Panel>
            }
            rightOrBottomContent={
              <SplitView
                direction="vertical"
                initialRatio={0.6}
                height="100%"
                leftOrTopContent={
                  <Panel title="Analiz Sonuçları" height="100%">
                    <Box p={3}>
                      <Input 
                        variant="glass" 
                        placeholder="Arama yap..." 
                        mb={4}
                        leftElement={<Box>🔍</Box>}
                      />
                      
                      <Card variant="glass" mb={3} p={3}>
                        <Box fontWeight="medium" mb={2}>Görüntü Analizi Sonuçları</Box>
                        <Box fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                          3 nesne tespit edildi
                        </Box>
                        <Flex mt={2} justifyContent="space-between">
                          <Button variant="glass-primary" size="sm">Detayları Göster</Button>
                          <Button variant="glass" size="sm">Rapor Oluştur</Button>
                        </Flex>
                      </Card>
                      
                      <Card variant="glass" p={3}>
                        <Box fontWeight="medium" mb={2}>Veri İşleme Sonuçları</Box>
                        <Box fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                          1.2GB veri işlendi
                        </Box>
                        <Flex mt={2} justifyContent="space-between">
                          <Button variant="glass-primary" size="sm">Detayları Göster</Button>
                          <Button variant="glass" size="sm">Rapor Oluştur</Button>
                        </Flex>
                      </Card>
                    </Box>
                  </Panel>
                }
                rightOrBottomContent={
                  <Panel title="Sistem Durumu" height="100%">
                    <Box p={3}>
                      <Box mb={3}>
                        <Box fontSize="sm" mb={1}>CPU Kullanımı: 35%</Box>
                        <Box bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} h="6px" borderRadius="full">
                          <Box bg="cyan.400" h="6px" w="35%" borderRadius="full" />
                        </Box>
                      </Box>
                      
                      <Box mb={3}>
                        <Box fontSize="sm" mb={1}>Bellek Kullanımı: 48%</Box>
                        <Box bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} h="6px" borderRadius="full">
                          <Box bg="cyan.400" h="6px" w="48%" borderRadius="full" />
                        </Box>
                      </Box>
                      
                      <Box>
                        <Box fontSize="sm" mb={1}>Disk Kullanımı: 62%</Box>
                        <Box bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} h="6px" borderRadius="full">
                          <Box bg="cyan.400" h="6px" w="62%" borderRadius="full" />
                        </Box>
                      </Box>
                    </Box>
                  </Panel>
                }
              />
            }
          />
        )}
      </Box>
      
      {/* Footer */}
      <Flex 
        p={3} 
        justifyContent="center" 
        alignItems="center"
        backdropFilter="blur(10px)"
        bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'}
        borderTop="1px solid"
        borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}
      >
        <IconButton 
          variant="glass" 
          size="md"
          icon={<Box>📷</Box>}
          ariaLabel="Ekran Yakalama"
          mr={4}
        />
        <IconButton 
          variant="glass" 
          size="md"
          icon={<Box>🔍</Box>}
          ariaLabel="Görüntü Analizi"
          mr={4}
        />
        <IconButton 
          variant="glass" 
          size="md"
          icon={<Box>⚙️</Box>}
          ariaLabel="Otomasyon"
          mr={4}
        />
        <IconButton 
          variant="glass" 
          size="md"
          icon={<Box>📊</Box>}
          ariaLabel="Veri İşleme"
          mr={4}
        />
        <IconButton 
          variant="glass" 
          size="md"
          icon={<Box>🧠</Box>}
          ariaLabel="AI"
        />
      </Flex>
    </Box>
  );
};

export default DemoLayout;
