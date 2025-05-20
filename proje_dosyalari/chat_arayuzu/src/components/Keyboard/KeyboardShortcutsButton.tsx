import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import { FiCommand } from 'react-icons/fi';
import KeyboardShortcutsManager from './KeyboardShortcutsManager';
import useTranslation from '../../hooks/useTranslation';

// Klavye kısayolu tipi
interface KeyboardShortcut {
  id: string;
  key: string;
  description: string;
  category: string;
  isEnabled: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

interface KeyboardShortcutsButtonProps {
  size?: 'sm' | 'md' | 'lg';
}

const KeyboardShortcutsButton: React.FC<KeyboardShortcutsButtonProps> = ({ size = 'sm' }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  
  // Varsayılan kısayollar
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      id: 'shortcut-1',
      key: '/',
      description: t('keyboard.focusMessageInput'),
      category: 'chat',
      isEnabled: true,
      ctrlKey: true
    },
    {
      id: 'shortcut-2',
      key: 'k',
      description: t('keyboard.focusMessageInput'),
      category: 'chat',
      isEnabled: true,
      ctrlKey: true
    },
    {
      id: 'shortcut-3',
      key: '?',
      description: t('keyboard.openHelp'),
      category: 'system',
      isEnabled: true,
      shiftKey: true
    },
    {
      id: 'shortcut-4',
      key: ',',
      description: t('keyboard.openSettings'),
      category: 'system',
      isEnabled: true,
      ctrlKey: true
    },
    {
      id: 'shortcut-5',
      key: 'Escape',
      description: t('keyboard.closeModals'),
      category: 'system',
      isEnabled: true
    },
    {
      id: 'shortcut-6',
      key: 'n',
      description: t('keyboard.newConversation'),
      category: 'chat',
      isEnabled: true,
      ctrlKey: true,
      shiftKey: true
    },
    {
      id: 'shortcut-7',
      key: 's',
      description: t('keyboard.saveConversation'),
      category: 'chat',
      isEnabled: true,
      ctrlKey: true
    },
    {
      id: 'shortcut-8',
      key: 'o',
      description: t('keyboard.openConversation'),
      category: 'chat',
      isEnabled: true,
      ctrlKey: true
    },
    {
      id: 'shortcut-9',
      key: 'a',
      description: t('keyboard.toggleAccessibility'),
      category: 'accessibility',
      isEnabled: true,
      ctrlKey: true,
      altKey: true
    },
    {
      id: 'shortcut-10',
      key: 't',
      description: t('keyboard.toggleTheme'),
      category: 'system',
      isEnabled: true,
      ctrlKey: true,
      shiftKey: true
    }
  ];
  
  // Yerel depolamadan kısayolları yükle
  useEffect(() => {
    try {
      const savedShortcuts = localStorage.getItem('keyboard_shortcuts');
      if (savedShortcuts) {
        setShortcuts(JSON.parse(savedShortcuts));
      } else {
        setShortcuts(defaultShortcuts);
      }
    } catch (error) {
      console.error('Klavye kısayolları yüklenirken hata:', error);
      setShortcuts(defaultShortcuts);
    }
  }, []);
  
  // Kısayolları yerel depolamaya kaydet
  useEffect(() => {
    if (shortcuts.length > 0) {
      try {
        localStorage.setItem('keyboard_shortcuts', JSON.stringify(shortcuts));
      } catch (error) {
        console.error('Klavye kısayolları kaydedilirken hata:', error);
      }
    }
  }, [shortcuts]);
  
  // Kısayol güncelleme
  const handleUpdateShortcut = (id: string, updates: Partial<KeyboardShortcut>) => {
    setShortcuts(prev => 
      prev.map(shortcut => 
        shortcut.id === id ? { ...shortcut, ...updates } : shortcut
      )
    );
  };
  
  // Kısayol etkinleştirme/devre dışı bırakma
  const handleToggleShortcut = (id: string, isEnabled: boolean) => {
    setShortcuts(prev => 
      prev.map(shortcut => 
        shortcut.id === id ? { ...shortcut, isEnabled } : shortcut
      )
    );
  };
  
  // Kısayolları sıfırlama
  const handleResetShortcuts = () => {
    setShortcuts(defaultShortcuts);
  };
  
  // Kısayol ekleme
  const handleAddShortcut = (shortcut: Omit<KeyboardShortcut, 'id'>) => {
    const newShortcut: KeyboardShortcut = {
      ...shortcut,
      id: `shortcut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setShortcuts(prev => [...prev, newShortcut]);
  };
  
  // Kısayol silme
  const handleRemoveShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(shortcut => shortcut.id !== id));
  };
  
  return (
    <>
      <Tooltip label={t('keyboard.manager')}>
        <IconButton
          aria-label={t('keyboard.manager')}
          icon={<FiCommand />}
          size={size}
          variant="ghost"
          onClick={onOpen}
        />
      </Tooltip>
      
      <KeyboardShortcutsManager
        isOpen={isOpen}
        onClose={onClose}
        shortcuts={shortcuts}
        onUpdateShortcut={handleUpdateShortcut}
        onToggleShortcut={handleToggleShortcut}
        onResetShortcuts={handleResetShortcuts}
        onAddShortcut={handleAddShortcut}
        onRemoveShortcut={handleRemoveShortcut}
      />
    </>
  );
};

export default KeyboardShortcutsButton;
