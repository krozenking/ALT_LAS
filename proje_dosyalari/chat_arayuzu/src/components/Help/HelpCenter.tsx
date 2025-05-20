import React, { useState } from 'react';
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, Heading, Input, InputGroup, InputLeftElement, Link, List, ListItem, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useColorModeValue, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Code, Divider, Badge } from '@chakra-ui/react';
import { SearchIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import useTranslation from '../../hooks/useTranslation';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Renk değişkenleri
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const linkColor = useColorModeValue('blue.500', 'blue.300');
  
  // SSS verileri
  const faqData = [
    {
      question: t('help.faq.q1'),
      answer: t('help.faq.a1')
    },
    {
      question: t('help.faq.q2'),
      answer: t('help.faq.a2')
    },
    {
      question: t('help.faq.q3'),
      answer: t('help.faq.a3')
    },
    {
      question: t('help.faq.q4'),
      answer: t('help.faq.a4')
    },
    {
      question: t('help.faq.q5'),
      answer: t('help.faq.a5')
    },
    {
      question: t('help.faq.q6'),
      answer: t('help.faq.a6')
    },
    {
      question: t('help.faq.q7'),
      answer: t('help.faq.a7')
    },
    {
      question: t('help.faq.q8'),
      answer: t('help.faq.a8')
    }
  ];
  
  // Filtrelenmiş SSS
  const filteredFaq = searchQuery
    ? faqData.filter(
        item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData;
  
  // Klavye kısayolları
  const keyboardShortcuts = [
    { key: 'Ctrl + /', description: t('help.shortcuts.focusInput') },
    { key: 'Ctrl + K', description: t('help.shortcuts.focusInput') },
    { key: 'Shift + ?', description: t('help.shortcuts.openHelp') },
    { key: 'Ctrl + ,', description: t('help.shortcuts.openSettings') },
    { key: 'Escape', description: t('help.shortcuts.closeModals') },
    { key: 'Ctrl + Shift + N', description: t('help.shortcuts.newConversation') },
    { key: 'Ctrl + S', description: t('help.shortcuts.saveConversation') },
    { key: 'Ctrl + O', description: t('help.shortcuts.openConversation') },
    { key: 'Ctrl + Alt + A', description: t('help.shortcuts.toggleAccessibility') },
    { key: 'Ctrl + Shift + T', description: t('help.shortcuts.toggleTheme') }
  ];
  
  // Öğreticiler
  const tutorials = [
    {
      title: t('help.tutorials.basic.title'),
      items: [
        { title: t('help.tutorials.basic.item1'), id: 'getting-started' },
        { title: t('help.tutorials.basic.item2'), id: 'sending-messages' },
        { title: t('help.tutorials.basic.item3'), id: 'file-upload' },
        { title: t('help.tutorials.basic.item4'), id: 'voice-messages' }
      ]
    },
    {
      title: t('help.tutorials.advanced.title'),
      items: [
        { title: t('help.tutorials.advanced.item1'), id: 'conversation-management' },
        { title: t('help.tutorials.advanced.item2'), id: 'customizing-interface' },
        { title: t('help.tutorials.advanced.item3'), id: 'keyboard-shortcuts' },
        { title: t('help.tutorials.advanced.item4'), id: 'accessibility-features' }
      ]
    }
  ];
  
  // Seçilen öğretici
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  
  // Öğretici içeriği
  const getTutorialContent = (id: string) => {
    switch (id) {
      case 'getting-started':
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>{t('help.tutorials.basic.item1')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.gettingStarted.intro')}</Text>
            <List spacing={2} mb={4}>
              <ListItem>{t('help.tutorialContent.gettingStarted.step1')}</ListItem>
              <ListItem>{t('help.tutorialContent.gettingStarted.step2')}</ListItem>
              <ListItem>{t('help.tutorialContent.gettingStarted.step3')}</ListItem>
            </List>
            <Text>{t('help.tutorialContent.gettingStarted.conclusion')}</Text>
          </Box>
        );
      case 'sending-messages':
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>{t('help.tutorials.basic.item2')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.sendingMessages.intro')}</Text>
            <List spacing={2} mb={4}>
              <ListItem>{t('help.tutorialContent.sendingMessages.step1')}</ListItem>
              <ListItem>{t('help.tutorialContent.sendingMessages.step2')}</ListItem>
              <ListItem>{t('help.tutorialContent.sendingMessages.step3')}</ListItem>
            </List>
            <Text mb={4}>{t('help.tutorialContent.sendingMessages.tips')}</Text>
            <Box p={3} bg="gray.50" borderRadius="md" _dark={{ bg: 'gray.700' }}>
              <Text fontWeight="bold" mb={2}>{t('help.tutorialContent.sendingMessages.example')}</Text>
              <Text fontStyle="italic">"{t('help.tutorialContent.sendingMessages.exampleText')}"</Text>
            </Box>
          </Box>
        );
      case 'file-upload':
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>{t('help.tutorials.basic.item3')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.fileUpload.intro')}</Text>
            <List spacing={2} mb={4}>
              <ListItem>{t('help.tutorialContent.fileUpload.step1')}</ListItem>
              <ListItem>{t('help.tutorialContent.fileUpload.step2')}</ListItem>
              <ListItem>{t('help.tutorialContent.fileUpload.step3')}</ListItem>
              <ListItem>{t('help.tutorialContent.fileUpload.step4')}</ListItem>
            </List>
            <Text mb={2}>{t('help.tutorialContent.fileUpload.supportedFormats')}:</Text>
            <Flex wrap="wrap" gap={2} mb={4}>
              <Badge colorScheme="blue">PNG</Badge>
              <Badge colorScheme="blue">JPG</Badge>
              <Badge colorScheme="blue">PDF</Badge>
              <Badge colorScheme="blue">TXT</Badge>
              <Badge colorScheme="blue">DOCX</Badge>
              <Badge colorScheme="blue">XLSX</Badge>
              <Badge colorScheme="blue">CSV</Badge>
            </Flex>
          </Box>
        );
      case 'voice-messages':
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>{t('help.tutorials.basic.item4')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.voiceMessages.intro')}</Text>
            <List spacing={2} mb={4}>
              <ListItem>{t('help.tutorialContent.voiceMessages.step1')}</ListItem>
              <ListItem>{t('help.tutorialContent.voiceMessages.step2')}</ListItem>
              <ListItem>{t('help.tutorialContent.voiceMessages.step3')}</ListItem>
              <ListItem>{t('help.tutorialContent.voiceMessages.step4')}</ListItem>
            </List>
            <Text>{t('help.tutorialContent.voiceMessages.tips')}</Text>
          </Box>
        );
      case 'conversation-management':
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>{t('help.tutorials.advanced.item1')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.conversationManagement.intro')}</Text>
            <Heading as="h4" size="sm" mb={2}>{t('help.tutorialContent.conversationManagement.saving')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.conversationManagement.savingDesc')}</Text>
            <Heading as="h4" size="sm" mb={2}>{t('help.tutorialContent.conversationManagement.loading')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.conversationManagement.loadingDesc')}</Text>
            <Heading as="h4" size="sm" mb={2}>{t('help.tutorialContent.conversationManagement.exporting')}</Heading>
            <Text>{t('help.tutorialContent.conversationManagement.exportingDesc')}</Text>
          </Box>
        );
      case 'customizing-interface':
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>{t('help.tutorials.advanced.item2')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.customizingInterface.intro')}</Text>
            <List spacing={4} mb={4}>
              <ListItem>
                <Text fontWeight="bold">{t('help.tutorialContent.customizingInterface.theme.title')}</Text>
                <Text>{t('help.tutorialContent.customizingInterface.theme.desc')}</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">{t('help.tutorialContent.customizingInterface.language.title')}</Text>
                <Text>{t('help.tutorialContent.customizingInterface.language.desc')}</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">{t('help.tutorialContent.customizingInterface.accessibility.title')}</Text>
                <Text>{t('help.tutorialContent.customizingInterface.accessibility.desc')}</Text>
              </ListItem>
            </List>
          </Box>
        );
      case 'keyboard-shortcuts':
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>{t('help.tutorials.advanced.item3')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.keyboardShortcuts.intro')}</Text>
            <Box mb={4}>
              {keyboardShortcuts.map((shortcut, index) => (
                <Flex key={index} mb={2} justify="space-between">
                  <Code fontWeight="bold" px={2}>{shortcut.key}</Code>
                  <Text flex="1" ml={4}>{shortcut.description}</Text>
                </Flex>
              ))}
            </Box>
            <Text>{t('help.tutorialContent.keyboardShortcuts.customizing')}</Text>
          </Box>
        );
      case 'accessibility-features':
        return (
          <Box>
            <Heading as="h3" size="md" mb={4}>{t('help.tutorials.advanced.item4')}</Heading>
            <Text mb={4}>{t('help.tutorialContent.accessibilityFeatures.intro')}</Text>
            <List spacing={4} mb={4}>
              <ListItem>
                <Text fontWeight="bold">{t('help.tutorialContent.accessibilityFeatures.contrast.title')}</Text>
                <Text>{t('help.tutorialContent.accessibilityFeatures.contrast.desc')}</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">{t('help.tutorialContent.accessibilityFeatures.fontSize.title')}</Text>
                <Text>{t('help.tutorialContent.accessibilityFeatures.fontSize.desc')}</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">{t('help.tutorialContent.accessibilityFeatures.motion.title')}</Text>
                <Text>{t('help.tutorialContent.accessibilityFeatures.motion.desc')}</Text>
              </ListItem>
              <ListItem>
                <Text fontWeight="bold">{t('help.tutorialContent.accessibilityFeatures.screenReader.title')}</Text>
                <Text>{t('help.tutorialContent.accessibilityFeatures.screenReader.desc')}</Text>
              </ListItem>
            </List>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="lg"
    >
      <DrawerOverlay />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
          {t('help.title')}
        </DrawerHeader>

        <DrawerBody>
          <InputGroup mb={6}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder={t('help.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Tabs isFitted variant="enclosed" index={activeTab} onChange={setActiveTab}>
            <TabList mb="1em">
              <Tab>{t('help.faqTab')}</Tab>
              <Tab>{t('help.tutorialsTab')}</Tab>
              <Tab>{t('help.shortcutsTab')}</Tab>
              <Tab>{t('help.supportTab')}</Tab>
            </TabList>
            
            <TabPanels>
              {/* SSS Sekmesi */}
              <TabPanel>
                <Heading as="h3" size="md" mb={4} color={headingColor}>
                  {t('help.frequentlyAskedQuestions')}
                </Heading>
                
                {filteredFaq.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    {t('help.noResults')}
                  </Text>
                ) : (
                  <Accordion allowMultiple>
                    {filteredFaq.map((item, index) => (
                      <AccordionItem key={index}>
                        <h2>
                          <AccordionButton py={3}>
                            <Box flex="1" textAlign="left" fontWeight="medium">
                              {item.question}
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          {item.answer}
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabPanel>
              
              {/* Öğreticiler Sekmesi */}
              <TabPanel>
                <Heading as="h3" size="md" mb={4} color={headingColor}>
                  {t('help.tutorials.title')}
                </Heading>
                
                {selectedTutorial ? (
                  <Box>
                    <Button 
                      variant="link" 
                      mb={4} 
                      leftIcon={<ExternalLinkIcon />}
                      onClick={() => setSelectedTutorial(null)}
                    >
                      {t('help.backToTutorials')}
                    </Button>
                    
                    {getTutorialContent(selectedTutorial)}
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={6}>
                    {tutorials.map((section, sectionIndex) => (
                      <Box key={sectionIndex}>
                        <Heading as="h4" size="sm" mb={3}>
                          {section.title}
                        </Heading>
                        <List spacing={3}>
                          {section.items.map((item, itemIndex) => (
                            <ListItem key={itemIndex}>
                              <Link 
                                color={linkColor} 
                                onClick={() => setSelectedTutorial(item.id)}
                              >
                                {item.title}
                              </Link>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))}
                  </VStack>
                )}
              </TabPanel>
              
              {/* Klavye Kısayolları Sekmesi */}
              <TabPanel>
                <Heading as="h3" size="md" mb={4} color={headingColor}>
                  {t('help.keyboardShortcuts')}
                </Heading>
                
                <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <React.Fragment key={index}>
                      <Flex 
                        p={3} 
                        justify="space-between" 
                        bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}
                      >
                        <Code fontWeight="bold" px={2}>{shortcut.key}</Code>
                        <Text flex="1" ml={4}>{shortcut.description}</Text>
                      </Flex>
                      {index < keyboardShortcuts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
                
                <Text mt={4}>
                  {t('help.customizeShortcuts')}
                </Text>
              </TabPanel>
              
              {/* Destek Sekmesi */}
              <TabPanel>
                <Heading as="h3" size="md" mb={4} color={headingColor}>
                  {t('help.support.title')}
                </Heading>
                
                <VStack align="stretch" spacing={6}>
                  <Box>
                    <Heading as="h4" size="sm" mb={3}>
                      {t('help.support.contact.title')}
                    </Heading>
                    <Text mb={2}>{t('help.support.contact.description')}</Text>
                    <List spacing={2}>
                      <ListItem>
                        <Text fontWeight="bold">{t('help.support.contact.email')}:</Text>
                        <Link color={linkColor} href="mailto:support@altlas.com">
                          support@altlas.com
                        </Link>
                      </ListItem>
                      <ListItem>
                        <Text fontWeight="bold">{t('help.support.contact.phone')}:</Text>
                        <Link color={linkColor} href="tel:+901234567890">
                          +90 123 456 7890
                        </Link>
                      </ListItem>
                    </List>
                  </Box>
                  
                  <Box>
                    <Heading as="h4" size="sm" mb={3}>
                      {t('help.support.resources.title')}
                    </Heading>
                    <List spacing={2}>
                      <ListItem>
                        <Link color={linkColor} href="#" isExternal>
                          {t('help.support.resources.documentation')}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </ListItem>
                      <ListItem>
                        <Link color={linkColor} href="#" isExternal>
                          {t('help.support.resources.community')}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </ListItem>
                      <ListItem>
                        <Link color={linkColor} href="#" isExternal>
                          {t('help.support.resources.blog')}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </ListItem>
                    </List>
                  </Box>
                  
                  <Box>
                    <Heading as="h4" size="sm" mb={3}>
                      {t('help.support.feedback.title')}
                    </Heading>
                    <Text>
                      {t('help.support.feedback.description')}
                    </Text>
                    <Button mt={3} colorScheme="blue">
                      {t('help.support.feedback.button')}
                    </Button>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button onClick={onClose}>
            {t('common.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default HelpCenter;
