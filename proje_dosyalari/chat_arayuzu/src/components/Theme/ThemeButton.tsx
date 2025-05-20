import React from 'react';
import {
  IconButton,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import { FiSliders } from 'react-icons/fi';
import ThemeCustomizer from './ThemeCustomizer';
import useTranslation from '../../hooks/useTranslation';

interface ThemeButtonProps {
  size?: 'sm' | 'md' | 'lg';
}

const ThemeButton: React.FC<ThemeButtonProps> = ({ size = 'sm' }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  
  return (
    <>
      <Tooltip label={t('theme.customizer')}>
        <IconButton
          aria-label={t('theme.customizer')}
          icon={<FiSliders />}
          size={size}
          variant="ghost"
          onClick={onOpen}
        />
      </Tooltip>
      
      <ThemeCustomizer isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default ThemeButton;
