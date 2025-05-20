import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { socketService } from '../../services/socket';
import { Attachment } from '../../types';
import FileUploadModal from '../FileUploadModal/FileUploadModal';
import { offlineManager } from '../../services/offlineManager';
import { useLanguage } from '../../context/LanguageContext';

interface MessageInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  onFileUpload: (file: File) => void;
  disabled?: boolean;
  conversationId?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onFileUpload,
  disabled = false,
  conversationId
}) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!offlineManager.isNetworkOnline());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for online/offline status changes
  useEffect(() => {
    const handleStatusChange = (online: boolean) => {
      setIsOffline(!online);
    };

    offlineManager.addEventListener('statusChange', handleStatusChange);

    return () => {
      offlineManager.removeEventListener('statusChange', handleStatusChange);
    };
  }, []);

  // Send typing status
  useEffect(() => {
    if (!conversationId || disabled) return;

    if (message && !isTyping) {
      setIsTyping(true);
      socketService.sendTyping(conversationId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketService.sendStopTyping(conversationId);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, conversationId, disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() || attachments.length > 0) {
      // If offline, queue the message
      if (isOffline && conversationId) {
        // Queue message for sending when back online
        offlineManager.queueMessage({
          text: message.trim(),
          senderId: 'currentUserId', // This would come from auth context in a real app
          conversationId,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        // Clear input
        setMessage('');
        setAttachments([]);
      } else {
        // Send message normally
        onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
        setMessage('');
        setAttachments([]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    // Show file upload modal instead of triggering file input directly
    setShowFileUploadModal(true);
  };

  // Handle files uploaded from modal
  const handleFilesUploaded = (newAttachments: Attachment[]) => {
    setAttachments(prevAttachments => [...prevAttachments, ...newAttachments]);
    setShowFileUploadModal(false);
  };

  // Remove attachment
  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prevAttachments =>
      prevAttachments.filter(attachment => attachment.id !== attachmentId)
    );
  };

  return (
    <Container>
      {attachments.length > 0 && (
        <AttachmentList>
          {attachments.map(attachment => (
            <AttachmentItem key={attachment.id}>
              {attachment.type === 'image' ? (
                <AttachmentImage src={attachment.url} alt={attachment.name} />
              ) : (
                <AttachmentFile>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <AttachmentName>{attachment.name}</AttachmentName>
                </AttachmentFile>
              )}
              <RemoveAttachmentButton onClick={() => handleRemoveAttachment(attachment.id)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </RemoveAttachmentButton>
            </AttachmentItem>
          ))}
        </AttachmentList>
      )}

      <Form onSubmit={handleSubmit}>
        <FileInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          disabled={disabled}
        />
        <AttachButton type="button" onClick={triggerFileInput} disabled={disabled}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.88584 21.3658 3.76 20.24C2.63416 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63416 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42975 14.0991 2.00129 15.16 2.00129C16.2209 2.00129 17.2394 2.42975 17.99 3.18C18.7403 3.93063 19.1687 4.94913 19.1687 6.01C19.1687 7.07088 18.7403 8.08938 17.99 8.84L9.41 17.41C9.03472 17.7853 8.52573 17.9961 7.995 17.9961C7.46427 17.9961 6.95528 17.7853 6.58 17.41C6.20472 17.0347 5.99389 16.5257 5.99389 15.995C5.99389 15.4643 6.20472 14.9553 6.58 14.58L15.07 6.1" stroke="#8e8e8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </AttachButton>
        <TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Lütfen bir kullanıcı seçin" : "Bir mesaj yazın..."}
          rows={1}
          disabled={disabled}
        />
        <SendButton
          type="submit"
          disabled={((!message.trim() && attachments.length === 0) || disabled)}
          title={isOffline ? t('chat', 'offlineMessageQueued') : t('common', 'send')}
        >
          {isOffline ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="18" cy="18" r="6" fill="#f7b928" stroke="#ffffff" strokeWidth="1" />
              <path d="M16 18L20 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </SendButton>
      </Form>

      {showFileUploadModal && (
        <FileUploadModal
          isOpen={showFileUploadModal}
          onClose={() => setShowFileUploadModal(false)}
          onFilesUploaded={handleFilesUploaded}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
`;

const Form = styled.form`
  display: flex;
  align-items: center;
`;

const FileInput = styled.input`
  display: none;
`;

const AttachButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e8e;

  &:hover {
    color: #0084ff;
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  border: none;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 14px;
  resize: none;
  background-color: #f0f2f5;
  margin: 0 8px;

  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0084ff;

  &:disabled {
    color: #8e8e8e;
    cursor: not-allowed;
  }
`;

const AttachmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f5f7fb;
  border-radius: 8px;
`;

const AttachmentItem = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #e6f2ff;
`;

const AttachmentImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AttachmentFile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 8px;
  color: #0084ff;
`;

const AttachmentName = styled.div`
  font-size: 10px;
  color: #050505;
  margin-top: 4px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const RemoveAttachmentButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

export default MessageInput;
