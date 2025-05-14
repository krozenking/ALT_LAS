import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
  Code,
  useColorMode,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { glassmorphism } from '../../styles/themes/creator';
import { useNotification } from './NotificationContext';
import { NotificationPosition, NotificationType } from './types';

// Notification demo component
const NotificationDemo: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const {
    notify,
    info,
    success,
    warning,
    error,
    state,
    dispatch,
    toggleNotificationCenter,
  } = useNotification();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // State for notification form
  const [title, setTitle] = useState('Notification Title');
  const [message, setMessage] = useState('This is a notification message.');
  const [type, setType] = useState<NotificationType>('info');
  const [duration, setDuration] = useState(5000);
  const [position, setPosition] = useState<NotificationPosition>('top-right');
  const [isPersistent, setIsPersistent] = useState(false);
  const [hasAction, setHasAction] = useState(false);
  const [actionLabel, setActionLabel] = useState('Action');
  
  // Handle notification submit
  const handleNotificationSubmit = () => {
    const options = {
      duration,
      persistent: isPersistent,
      action: hasAction ? {
        label: actionLabel,
        onClick: () => {
          info('Action Clicked', `You clicked the "${actionLabel}" button.`);
        },
      } : undefined,
    };
    
    switch (type) {
      case 'info':
        info(title, message, options);
        break;
      case 'success':
        success(title, message, options);
        break;
      case 'warning':
        warning(title, message, options);
        break;
      case 'error':
        error(title, message, options);
        break;
      default:
        notify(title, message, { ...options, type });
    }
  };
  
  // Get unread notification count
  const getUnreadCount = () => {
    return state.notifications.filter(notification => notification.status === 'unread').length;
  };
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('common.notifications')}</Heading>
        
        <Text>
          {t('common.notificationsDescription')}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('common.notificationsInfo')}
          </AlertDescription>
        </Alert>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>{t('common.demo')}</Tab>
            <Tab>{t('common.code')}</Tab>
            <Tab>{t('common.api')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md">{t('common.notificationDemo')}</Heading>
                  
                  <HStack spacing={4} justify="space-between">
                    <Button
                      colorScheme="blue"
                      leftIcon={'🔔'}
                      onClick={toggleNotificationCenter}
                    >
                      {t('common.toggleNotificationCenter')}
                      {getUnreadCount() > 0 && (
                        <Badge ml={2} colorScheme="red" borderRadius="full">
                          {getUnreadCount()}
                        </Badge>
                      )}
                    </Button>
                    
                    <HStack>
                      <Button
                        colorScheme="blue"
                        onClick={() => info('Info Notification', 'This is an info notification.')}
                      >
                        Info
                      </Button>
                      <Button
                        colorScheme="green"
                        onClick={() => success('Success Notification', 'This is a success notification.')}
                      >
                        Success
                      </Button>
                      <Button
                        colorScheme="orange"
                        onClick={() => warning('Warning Notification', 'This is a warning notification.')}
                      >
                        Warning
                      </Button>
                      <Button
                        colorScheme="red"
                        onClick={() => error('Error Notification', 'This is an error notification.')}
                      >
                        Error
                      </Button>
                    </HStack>
                  </HStack>
                  
                  <Divider />
                  
                  <Heading size="md">{t('common.customNotification')}</Heading>
                  
                  <FormControl>
                    <FormLabel>{t('common.title')}</FormLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>{t('common.message')}</FormLabel>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>{t('common.type')}</FormLabel>
                    <Select
                      value={type}
                      onChange={(e) => setType(e.target.value as NotificationType)}
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>{t('common.position')}</FormLabel>
                    <Select
                      value={position}
                      onChange={(e) => setPosition(e.target.value as NotificationPosition)}
                    >
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-center">Top Center</option>
                      <option value="bottom-center">Bottom Center</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>{t('common.duration')} (ms)</FormLabel>
                    <NumberInput
                      value={duration}
                      onChange={(_, value) => setDuration(value)}
                      min={1000}
                      max={20000}
                      step={1000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">{t('common.persistent')}</FormLabel>
                    <Switch
                      isChecked={isPersistent}
                      onChange={(e) => setIsPersistent(e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">{t('common.hasAction')}</FormLabel>
                    <Switch
                      isChecked={hasAction}
                      onChange={(e) => setHasAction(e.target.checked)}
                    />
                  </FormControl>
                  
                  {hasAction && (
                    <FormControl>
                      <FormLabel>{t('common.actionLabel')}</FormLabel>
                      <Input
                        value={actionLabel}
                        onChange={(e) => setActionLabel(e.target.value)}
                      />
                    </FormControl>
                  )}
                  
                  <Button
                    colorScheme="blue"
                    onClick={handleNotificationSubmit}
                  >
                    {t('common.showNotification')}
                  </Button>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.code')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.basicUsage')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { useNotification } from '@/components/notifications';

const MyComponent = () => {
  const { info, success, warning, error } = useNotification();
  
  return (
    <div>
      <button onClick={() => info('Info Title', 'Info message')}>
        Show Info
      </button>
      <button onClick={() => success('Success Title', 'Success message')}>
        Show Success
      </button>
      <button onClick={() => warning('Warning Title', 'Warning message')}>
        Show Warning
      </button>
      <button onClick={() => error('Error Title', 'Error message')}>
        Show Error
      </button>
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.advancedUsage')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { useNotification } from '@/components/notifications';

const MyComponent = () => {
  const { notify, toggleNotificationCenter } = useNotification();
  
  const showCustomNotification = () => {
    notify('Custom Notification', 'This is a custom notification', {
      type: 'info',
      duration: 5000,
      persistent: false,
      action: {
        label: 'View',
        onClick: () => {
          console.log('Action clicked');
        },
      },
    });
  };
  
  return (
    <div>
      <button onClick={showCustomNotification}>
        Show Custom Notification
      </button>
      <button onClick={toggleNotificationCenter}>
        Toggle Notification Center
      </button>
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.providerSetup')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { NotificationProvider } from '@/components/notifications';

const App = () => {
  return (
    <NotificationProvider>
      <YourApp />
    </NotificationProvider>
  );
};`}
                    </Code>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.api')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.notificationContext')}</Heading>
                    <Text>
                      The notification context provides methods and state for managing notifications.
                    </Text>
                    <Text mt={2}>
                      <strong>{t('common.methods')}:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>notify(title, message, options)</strong>: Show a notification with custom options</Text>
                      <Text>• <strong>info(title, message, options)</strong>: Show an info notification</Text>
                      <Text>• <strong>success(title, message, options)</strong>: Show a success notification</Text>
                      <Text>• <strong>warning(title, message, options)</strong>: Show a warning notification</Text>
                      <Text>• <strong>error(title, message, options)</strong>: Show an error notification</Text>
                      <Text>• <strong>remove(id)</strong>: Remove a notification by ID</Text>
                      <Text>• <strong>markAsRead(id)</strong>: Mark a notification as read</Text>
                      <Text>• <strong>markAsUnread(id)</strong>: Mark a notification as unread</Text>
                      <Text>• <strong>archive(id)</strong>: Archive a notification</Text>
                      <Text>• <strong>delete(id)</strong>: Delete a notification</Text>
                      <Text>• <strong>clearAll()</strong>: Clear all notifications</Text>
                      <Text>• <strong>toggleNotificationCenter()</strong>: Toggle the notification center</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.notificationOptions')}</Heading>
                    <Text>
                      Options that can be passed to notification methods.
                    </Text>
                    <Text mt={2}>
                      <strong>{t('common.properties')}:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>type</strong>: Notification type ('info', 'success', 'warning', 'error')</Text>
                      <Text>• <strong>duration</strong>: Duration in milliseconds</Text>
                      <Text>• <strong>persistent</strong>: Whether the notification should persist</Text>
                      <Text>• <strong>icon</strong>: Custom icon</Text>
                      <Text>• <strong>action</strong>: Action button configuration (label and onClick)</Text>
                      <Text>• <strong>dismissible</strong>: Whether the notification can be dismissed</Text>
                      <Text>• <strong>source</strong>: Source of the notification</Text>
                      <Text>• <strong>category</strong>: Category of the notification</Text>
                      <Text>• <strong>priority</strong>: Priority of the notification ('low', 'normal', 'high', 'urgent')</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.components')}</Heading>
                    <Text>
                      Components provided by the notification system.
                    </Text>
                    <Text mt={2}>
                      <strong>{t('common.componentsList')}:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>NotificationProvider</strong>: Provider component for the notification system</Text>
                      <Text>• <strong>NotificationList</strong>: Component for displaying notifications</Text>
                      <Text>• <strong>NotificationCenter</strong>: Component for displaying the notification center</Text>
                      <Text>• <strong>NotificationItem</strong>: Component for displaying a single notification</Text>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>{t('common.details')}</Heading>
          
          <VStack align="stretch" spacing={3}>
            <Text>
              {t('common.notificationsDetails')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>{t('common.toastNotifications')}</strong>: {t('common.toastNotificationsDescription')}</Text>
              <Text>• <strong>{t('common.notificationCenter')}</strong>: {t('common.notificationCenterDescription')}</Text>
              <Text>• <strong>{t('common.notificationHistory')}</strong>: {t('common.notificationHistoryDescription')}</Text>
              <Text>• <strong>{t('common.notificationActions')}</strong>: {t('common.notificationActionsDescription')}</Text>
              <Text>• <strong>{t('common.notificationSettings')}</strong>: {t('common.notificationSettingsDescription')}</Text>
            </Box>
            
            <Text>
              {t('common.notificationsFeatures')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.differentTypes')}</Text>
              <Text>• {t('common.customPositioning')}</Text>
              <Text>• {t('common.customDuration')}</Text>
              <Text>• {t('common.actionButtons')}</Text>
              <Text>• {t('common.persistentNotifications')}</Text>
              <Text>• {t('common.notificationFiltering')}</Text>
              <Text>• {t('common.notificationSorting')}</Text>
              <Text>• {t('common.notificationGrouping')}</Text>
              <Text>• {t('common.desktopNotifications')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default NotificationDemo;
