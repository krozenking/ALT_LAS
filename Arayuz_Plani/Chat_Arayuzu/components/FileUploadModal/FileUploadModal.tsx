import React, { useEffect } from 'react';
import styled from 'styled-components';
import FileUpload from '../FileUpload/FileUpload';
import { Attachment } from '../../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded: (attachments: Attachment[]) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onFilesUploaded }) => {
  // Handle file upload
  const handleFilesUploaded = (attachments: Attachment[]) => {
    onFilesUploaded(attachments);
    onClose();
  };
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Dosya Yükle</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FileUpload onFilesUploaded={handleFilesUploaded} />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #050505;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #65676b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  
  &:hover {
    color: #050505;
  }
`;

const ModalBody = styled.div`
  padding: 16px;
  overflow-y: auto;
`;

export default FileUploadModal;
