import React from 'react';
import {
  IconButton,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import { QuestionIcon } from '@chakra-ui/icons';
import HelpCenter from './HelpCenter';
import useTranslation from '../../hooks/useTranslation';

interface HelpButtonProps {
  size?: 'sm' | 'md' | 'lg';
}

const HelpButton: React.FC<HelpButtonProps> = ({ size = 'sm' }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  
  return (
    <>
      <Tooltip label={t('help.title')}>
        <IconButton
          aria-label={t('help.title')}
          icon={<QuestionIcon />}
          size={size}
          variant="ghost"
          onClick={onOpen}
        />
      </Tooltip>
      
      <HelpCenter isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default HelpButton;
