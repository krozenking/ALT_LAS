import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Box,
  Flex,
  Text,
  Avatar,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  Switch,
  useColorModeValue,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  useToast
} from '@chakra-ui/react';
import useTranslation from '../../hooks/useTranslation';

// Kullanıcı arayüzü
interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  lastActive?: string;
  conversations?: string[];
}

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const [editedUser, setEditedUser] = useState<User>({ ...user });
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    newMessages: true,
    mentions: true,
    updates: false,
    sounds: true
  });
  const [privacy, setPrivacy] = useState({
    shareActivity: false,
    showOnlineStatus: true,
    allowDataCollection: true
  });

  const { t } = useTranslation();
  const toast = useToast();

  // Renk değişkenleri
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Kullanıcı değiştiğinde editedUser'ı güncelle
  useEffect(() => {
    setEditedUser({ ...user });
  }, [user]);

  // Düzenleme modunu aç/kapat
  const toggleEditing = () => {
    if (isEditing) {
      // Değişiklikleri iptal et
      setEditedUser({ ...user });
    }
    setIsEditing(!isEditing);
  };

  // Kullanıcı bilgilerini güncelle
  const handleUpdateUser = () => {
    // Boş isim kontrolü
    if (!editedUser.name.trim()) {
      toast({
        title: t('user.nameRequired'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    onUpdateUser(editedUser);
    setIsEditing(false);

    toast({
      title: t('user.profileUpdated'),
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  // Bildirim ayarlarını güncelle
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));

    // Gerçek uygulamada burada API çağrısı yapılır
    toast({
      title: t('user.preferencesUpdated'),
      status: 'success',
      duration: 2000,
      isClosable: true
    });
  };

  // Gizlilik ayarlarını güncelle
  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));

    // Gerçek uygulamada burada API çağrısı yapılır
    toast({
      title: t('user.preferencesUpdated'),
      status: 'success',
      duration: 2000,
      isClosable: true
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
          {t('user.profile')}
        </DrawerHeader>

        <DrawerBody>
          <Tabs isFitted variant="enclosed" colorScheme="blue">
            <TabList mb="1em">
              <Tab>{t('user.profile')}</Tab>
              <Tab>{t('user.preferences')}</Tab>
              <Tab>{t('user.privacy')}</Tab>
            </TabList>

            <TabPanels>
              {/* Profil Sekmesi */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Profil Başlığı */}
                  <Flex direction="column" align="center" mb={4}>
                    <Avatar
                      size="xl"
                      name={editedUser.name}
                      src={editedUser.avatar || undefined}
                      mb={3}
                    />

                    {isEditing ? (
                      <FormControl>
                        <Input
                          value={editedUser.name}
                          onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                          textAlign="center"
                          fontWeight="bold"
                          size="lg"
                        />
                      </FormControl>
                    ) : (
                      <Text fontSize="xl" fontWeight="bold">{editedUser.name}</Text>
                    )}

                    <Text color={mutedColor} fontSize="sm">{editedUser.email}</Text>

                    <Badge colorScheme="green" mt={2}>
                      {t('common.online')}
                    </Badge>
                  </Flex>

                  <Divider />

                  {/* Kullanıcı Bilgileri */}
                  <Box>
                    <Text fontWeight="bold" mb={3}>{t('user.personalInfo')}</Text>

                    <FormControl mb={4}>
                      <FormLabel>{t('user.email')}</FormLabel>
                      {isEditing ? (
                        <Input
                          value={editedUser.email}
                          onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                          type="email"
                        />
                      ) : (
                        <Text>{editedUser.email}</Text>
                      )}
                    </FormControl>

                    <FormControl mb={4}>
                      <FormLabel>{t('user.role')}</FormLabel>
                      <Text>{t('user.defaultRole')}</Text>
                    </FormControl>

                    <FormControl mb={4}>
                      <FormLabel>{t('user.joinDate')}</FormLabel>
                      <Text>{new Date().toLocaleDateString()}</Text>
                    </FormControl>
                  </Box>

                  <Divider />

                  {/* Düzenleme Düğmeleri */}
                  <Flex justify="flex-end">
                    <Button
                      variant="outline"
                      mr={3}
                      onClick={toggleEditing}
                    >
                      {isEditing ? t('common.cancel') : t('common.edit')}
                    </Button>

                    {isEditing && (
                      <Button
                        colorScheme="blue"
                        onClick={handleUpdateUser}
                      >
                        {t('common.save')}
                      </Button>
                    )}
                  </Flex>
                </VStack>
              </TabPanel>

              {/* Tercihler Sekmesi */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Text fontWeight="bold" mb={2}>{t('user.notifications')}</Text>

                  <FormControl display="flex" alignItems="center" mb={2}>
                    <Switch
                      id="new-messages"
                      isChecked={notifications.newMessages}
                      onChange={(e) => handleNotificationChange('newMessages', e.target.checked)}
                      mr={3}
                      colorScheme="blue"
                    />
                    <FormLabel htmlFor="new-messages" mb="0">
                      {t('user.notifyNewMessages')}
                    </FormLabel>
                  </FormControl>

                  <FormControl display="flex" alignItems="center" mb={2}>
                    <Switch
                      id="mentions"
                      isChecked={notifications.mentions}
                      onChange={(e) => handleNotificationChange('mentions', e.target.checked)}
                      mr={3}
                      colorScheme="blue"
                    />
                    <FormLabel htmlFor="mentions" mb="0">
                      {t('user.notifyMentions')}
                    </FormLabel>
                  </FormControl>

                  <FormControl display="flex" alignItems="center" mb={2}>
                    <Switch
                      id="updates"
                      isChecked={notifications.updates}
                      onChange={(e) => handleNotificationChange('updates', e.target.checked)}
                      mr={3}
                      colorScheme="blue"
                    />
                    <FormLabel htmlFor="updates" mb="0">
                      {t('user.notifyUpdates')}
                    </FormLabel>
                  </FormControl>

                  <FormControl display="flex" alignItems="center" mb={2}>
                    <Switch
                      id="sounds"
                      isChecked={notifications.sounds}
                      onChange={(e) => handleNotificationChange('sounds', e.target.checked)}
                      mr={3}
                      colorScheme="blue"
                    />
                    <FormLabel htmlFor="sounds" mb="0">
                      {t('user.notifySounds')}
                    </FormLabel>
                  </FormControl>

                  <Divider my={4} />

                  <Text fontWeight="bold" mb={2}>{t('user.chatPreferences')}</Text>

                  <FormControl mb={4}>
                    <FormLabel>{t('user.messageDisplay')}</FormLabel>
                    <HStack spacing={4}>
                      <Button size="sm" colorScheme="blue">{t('user.compact')}</Button>
                      <Button size="sm" variant="outline">{t('user.comfortable')}</Button>
                    </HStack>
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* Gizlilik Sekmesi */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Text fontWeight="bold" mb={2}>{t('user.privacySettings')}</Text>

                  <FormControl display="flex" alignItems="center" mb={2}>
                    <Switch
                      id="share-activity"
                      isChecked={privacy.shareActivity}
                      onChange={(e) => handlePrivacyChange('shareActivity', e.target.checked)}
                      mr={3}
                      colorScheme="blue"
                    />
                    <Box>
                      <FormLabel htmlFor="share-activity" mb="0">
                        {t('user.shareActivity')}
                      </FormLabel>
                      <FormHelperText>{t('user.shareActivityHelp')}</FormHelperText>
                    </Box>
                  </FormControl>

                  <FormControl display="flex" alignItems="center" mb={2}>
                    <Switch
                      id="online-status"
                      isChecked={privacy.showOnlineStatus}
                      onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                      mr={3}
                      colorScheme="blue"
                    />
                    <Box>
                      <FormLabel htmlFor="online-status" mb="0">
                        {t('user.showOnlineStatus')}
                      </FormLabel>
                      <FormHelperText>{t('user.showOnlineStatusHelp')}</FormHelperText>
                    </Box>
                  </FormControl>

                  <FormControl display="flex" alignItems="center" mb={2}>
                    <Switch
                      id="data-collection"
                      isChecked={privacy.allowDataCollection}
                      onChange={(e) => handlePrivacyChange('allowDataCollection', e.target.checked)}
                      mr={3}
                      colorScheme="blue"
                    />
                    <Box>
                      <FormLabel htmlFor="data-collection" mb="0">
                        {t('user.allowDataCollection')}
                      </FormLabel>
                      <FormHelperText>{t('user.allowDataCollectionHelp')}</FormHelperText>
                    </Box>
                  </FormControl>

                  <Divider my={4} />

                  <Box>
                    <Button colorScheme="red" variant="outline" size="sm">
                      {t('user.deleteAccount')}
                    </Button>
                    <Text fontSize="xs" color={mutedColor} mt={2}>
                      {t('user.deleteAccountWarning')}
                    </Text>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose}>
            {t('common.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default UserProfileDrawer;
