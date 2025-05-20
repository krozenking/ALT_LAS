import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  UnorderedList,
  ListItem,
  Divider,
  Kbd,
  Flex,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Link,
  Icon
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          ALT_LAS Asistan Yardım
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Box mb={6}>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              ALT_LAS Asistan Nedir?
            </Text>
            <Text mb={4}>
              ALT_LAS Asistan, ALT_LAS projesi hakkında bilgi almanıza, sorular sormanıza ve proje ile ilgili yardım almanıza olanak tanıyan bir yapay zeka asistanıdır.
            </Text>
            <Text>
              Asistan, ALT_LAS'ın özellikleri, vizyonu, teknik detayları ve kullanım senaryoları hakkında bilgi sağlayabilir.
            </Text>
          </Box>

          <Divider my={6} />

          <Accordion allowMultiple defaultIndex={[0]}>
            <AccordionItem border="none">
              <h2>
                <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                  <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                    Nasıl Kullanılır?
                  </Box>
                  <AccordionIcon color={accentColor} />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pl={4}>
                <UnorderedList spacing={3}>
                  <ListItem>
                    <Text fontWeight="medium">Soru Sorma:</Text>
                    <Text>Metin kutusuna sorunuzu yazın ve gönderin. Asistan en kısa sürede yanıt verecektir.</Text>
                  </ListItem>
                  <ListItem>
                    <Text fontWeight="medium">Önerilen Konular:</Text>
                    <Text>Sohbet başlangıcında önerilen konulardan birini seçerek hızlıca bilgi alabilirsiniz.</Text>
                  </ListItem>
                  <ListItem>
                    <Text fontWeight="medium">AI Modeli Değiştirme:</Text>
                    <Text>Sağ üst köşedeki model seçiciden farklı AI modellerini seçebilirsiniz.</Text>
                  </ListItem>
                  <ListItem>
                    <Text fontWeight="medium">Ayarlar:</Text>
                    <Text>Sağ üst köşedeki ayarlar simgesine tıklayarak tema, bildirimler ve diğer tercihleri değiştirebilirsiniz.</Text>
                  </ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none">
              <h2>
                <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                  <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                    Klavye Kısayolları
                  </Box>
                  <AccordionIcon color={accentColor} />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pl={4}>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Kısayol</Th>
                        <Th>İşlev</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>
                          <Flex align="center">
                            <Kbd>Enter</Kbd>
                          </Flex>
                        </Td>
                        <Td>Mesaj gönder</Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Flex align="center">
                            <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd>
                          </Flex>
                        </Td>
                        <Td>Yeni satır ekle</Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Flex align="center">
                            <Kbd>Ctrl</Kbd> + <Kbd>/</Kbd>
                          </Flex>
                        </Td>
                        <Td>Yardım menüsünü aç</Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Flex align="center">
                            <Kbd>Esc</Kbd>
                          </Flex>
                        </Td>
                        <Td>Açık menüleri kapat</Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Flex align="center">
                            <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
                          </Flex>
                        </Td>
                        <Td>Mesaj kutusuna odaklan</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none">
              <h2>
                <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                  <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                    Sık Sorulan Sorular
                  </Box>
                  <AccordionIcon color={accentColor} />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} pl={4}>
                <Accordion allowMultiple>
                  <AccordionItem>
                    <h3>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Asistan hangi konularda yardımcı olabilir?
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h3>
                    <AccordionPanel pb={4}>
                      ALT_LAS Asistan, ALT_LAS projesi hakkında genel bilgiler, teknik detaylar, kullanım senaryoları, özellikler ve proje vizyonu konularında yardımcı olabilir.
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h3>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Asistan çevrimdışı çalışabilir mi?
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h3>
                    <AccordionPanel pb={4}>
                      Şu anda asistan çevrimiçi çalışmaktadır. Gelecek sürümlerde sınırlı çevrimdışı yetenekler eklenecektir.
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h3>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Konuşma geçmişim kaydediliyor mu?
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h3>
                    <AccordionPanel pb={4}>
                      Konuşma geçmişiniz yalnızca mevcut oturum boyunca tarayıcınızda saklanır. Sayfa yenilendiğinde veya tarayıcı kapatıldığında konuşma geçmişi silinir. Gelecek sürümlerde, kullanıcı tercihine bağlı olarak konuşma geçmişini kaydetme seçeneği eklenecektir.
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Divider my={6} />

          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Daha Fazla Bilgi
            </Text>
            <UnorderedList spacing={3}>
              <ListItem>
                <Link href="#" isExternal color={accentColor}>
                  ALT_LAS Proje Dokümantasyonu <Icon as={ExternalLinkIcon} mx="2px" />
                </Link>
              </ListItem>
              <ListItem>
                <Link href="#" isExternal color={accentColor}>
                  Kullanım Kılavuzu <Icon as={ExternalLinkIcon} mx="2px" />
                </Link>
              </ListItem>
              <ListItem>
                <Link href="#" isExternal color={accentColor}>
                  Gizlilik Politikası <Icon as={ExternalLinkIcon} mx="2px" />
                </Link>
              </ListItem>
            </UnorderedList>
          </Box>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button colorScheme="blue" onClick={onClose}>
            Kapat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HelpModal;
