import React from 'react';
import styled from 'styled-components';
import { Message, User } from '../../types';
import { formatTime } from '../../utils/dateUtils';

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
};

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  user?: User;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, user }) => {
  const time = formatTime(new Date(message.timestamp));

  return (
    <Container isOwnMessage={isOwnMessage}>
      {!isOwnMessage && user && (
        <Avatar src={user.avatar} alt={user.name} />
      )}
      <MessageContent isOwnMessage={isOwnMessage}>
        {!isOwnMessage && user && (
          <SenderName>{user.name}</SenderName>
        )}
        <MessageText isOwnMessage={isOwnMessage}>
          {message.text}

          {message.attachments && message.attachments.length > 0 && (
            <AttachmentContainer>
              {message.attachments.map(attachment => (
                <Attachment key={attachment.id}>
                  {attachment.type === 'image' ? (
                    <ImageAttachment src={attachment.url} alt={attachment.name} />
                  ) : (
                    <FileAttachment href={attachment.url} target="_blank" rel="noopener noreferrer">
                      <FileIcon>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </FileIcon>
                      <FileInfo>
                        <FileName>{attachment.name}</FileName>
                        <FileSize>{formatFileSize(attachment.size)}</FileSize>
                      </FileInfo>
                    </FileAttachment>
                  )}
                </Attachment>
              ))}
            </AttachmentContainer>
          )}
        </MessageText>
        <MessageTime isOwnMessage={isOwnMessage}>
          {time}
          {isOwnMessage && (
            <ReadStatus read={message.read}>
              {message.read ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12L7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 17L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12L7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </ReadStatus>
          )}
        </MessageTime>
      </MessageContent>
    </Container>
  );
};

interface ContainerProps {
  isOwnMessage: boolean;
}

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: ${props => props.isOwnMessage ? 'row-reverse' : 'row'};
  align-items: flex-end;
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

interface MessageContentProps {
  isOwnMessage: boolean;
}

const MessageContent = styled.div<MessageContentProps>`
  display: flex;
  flex-direction: column;
  max-width: 70%;
  ${props => props.isOwnMessage ? 'align-items: flex-end;' : ''}
`;

const SenderName = styled.span`
  font-size: 12px;
  color: #8e8e8e;
  margin-bottom: 4px;
`;

interface MessageTextProps {
  isOwnMessage: boolean;
}

const MessageText = styled.div<MessageTextProps>`
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${props => props.isOwnMessage ? '#0084ff' : '#e4e6eb'};
  color: ${props => props.isOwnMessage ? '#ffffff' : '#050505'};
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
`;

interface MessageTimeProps {
  isOwnMessage: boolean;
}

const MessageTime = styled.div<MessageTimeProps>`
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #8e8e8e;
  margin-top: 4px;
  ${props => props.isOwnMessage ? 'margin-right: 4px;' : 'margin-left: 4px;'}
`;

interface ReadStatusProps {
  read: boolean;
}

const ReadStatus = styled.span<ReadStatusProps>`
  display: inline-flex;
  margin-left: 4px;
  color: ${props => props.read ? '#0084ff' : '#8e8e8e'};
`;

const AttachmentContainer = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Attachment = styled.div`
  max-width: 100%;
`;

const ImageAttachment = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
`;

const FileAttachment = styled.a`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #0084ff;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileName = styled.span`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  color: #050505;
`;

const FileSize = styled.span`
  font-size: 12px;
  color: #65676b;
`;

export default MessageItem;
