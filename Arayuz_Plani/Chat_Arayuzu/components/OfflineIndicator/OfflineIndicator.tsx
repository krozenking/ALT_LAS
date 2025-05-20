import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { offlineManager } from '../../services/offlineManager';

interface OfflineIndicatorProps {
  onRetry?: () => void;
}

/**
 * OfflineIndicator component for showing offline status and sync information
 * 
 * @param onRetry - Function to retry sending failed messages
 */
const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(offlineManager.isNetworkOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [queuedMessages, setQueuedMessages] = useState(offlineManager.getQueuedMessages());
  const [syncStatus, setSyncStatus] = useState<{ successful?: number; failed?: number } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Listen for online/offline status changes
  useEffect(() => {
    const handleStatusChange = (online: boolean) => {
      setIsOnline(online);
    };
    
    const handleSyncStart = () => {
      setIsSyncing(true);
      setSyncStatus(null);
    };
    
    const handleSyncComplete = (status: { successful: number; failed: number }) => {
      setIsSyncing(false);
      setSyncStatus(status);
      setQueuedMessages(offlineManager.getQueuedMessages());
    };
    
    const handleSyncError = () => {
      setIsSyncing(false);
      setQueuedMessages(offlineManager.getQueuedMessages());
    };
    
    const handleMessageQueued = () => {
      setQueuedMessages(offlineManager.getQueuedMessages());
    };
    
    const handleMessageDequeued = () => {
      setQueuedMessages(offlineManager.getQueuedMessages());
    };
    
    // Add event listeners
    offlineManager.addEventListener('statusChange', handleStatusChange);
    offlineManager.addEventListener('syncStart', handleSyncStart);
    offlineManager.addEventListener('syncComplete', handleSyncComplete);
    offlineManager.addEventListener('syncError', handleSyncError);
    offlineManager.addEventListener('messageQueued', handleMessageQueued);
    offlineManager.addEventListener('messageDequeued', handleMessageDequeued);
    
    // Initial state
    setIsOnline(offlineManager.isNetworkOnline());
    setQueuedMessages(offlineManager.getQueuedMessages());
    
    // Remove event listeners on cleanup
    return () => {
      offlineManager.removeEventListener('statusChange', handleStatusChange);
      offlineManager.removeEventListener('syncStart', handleSyncStart);
      offlineManager.removeEventListener('syncComplete', handleSyncComplete);
      offlineManager.removeEventListener('syncError', handleSyncError);
      offlineManager.removeEventListener('messageQueued', handleMessageQueued);
      offlineManager.removeEventListener('messageDequeued', handleMessageDequeued);
    };
  }, []);
  
  // Handle retry button click
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      offlineManager.retryFailedMessages();
    }
  };
  
  // If online and no queued messages, don't show anything
  if (isOnline && queuedMessages.length === 0) {
    return null;
  }
  
  return (
    <Container>
      <StatusBar isOnline={isOnline} onClick={() => setShowDetails(!showDetails)}>
        <StatusIcon isOnline={isOnline}>
          {isOnline ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.72 11.06C17.5391 12.8537 17.6151 14.8971 16.9396 16.7601C16.2642 18.623 14.8897 20.1521 13.1396 21.0168C11.3896 21.8814 9.39 22.0241 7.53576 21.4153C5.68151 20.8066 4.1201 19.4925 3.2 17.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.41 12.0001C2.14086 10.6936 2.28325 9.33907 2.82 8.12005C3.53 6.43005 4.91 5.05005 6.6 4.35005C8.29 3.65005 10.17 3.65005 11.87 4.35005C13.56 5.05005 14.94 6.43005 15.65 8.12005" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </StatusIcon>
        <StatusText>
          {isOnline 
            ? `Çevrimiçi${queuedMessages.length > 0 ? ` - ${queuedMessages.length} mesaj senkronize ediliyor` : ''}`
            : 'Çevrimdışı - Mesajlar gönderildiğinde senkronize edilecek'}
        </StatusText>
        <ExpandButton>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={showDetails ? "M18 15L12 9L6 15" : "M6 9L12 15L18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ExpandButton>
      </StatusBar>
      
      {showDetails && (
        <Details>
          <DetailItem>
            <DetailLabel>Durum:</DetailLabel>
            <DetailValue>{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</DetailValue>
          </DetailItem>
          
          <DetailItem>
            <DetailLabel>Bekleyen Mesajlar:</DetailLabel>
            <DetailValue>{queuedMessages.length}</DetailValue>
          </DetailItem>
          
          {syncStatus && (
            <>
              <DetailItem>
                <DetailLabel>Son Senkronizasyon:</DetailLabel>
                <DetailValue>
                  {syncStatus.successful} başarılı, {syncStatus.failed} başarısız
                </DetailValue>
              </DetailItem>
            </>
          )}
          
          {queuedMessages.length > 0 && (
            <Actions>
              <ActionButton onClick={handleRetry} disabled={isSyncing}>
                {isSyncing ? 'Senkronize Ediliyor...' : 'Yeniden Dene'}
              </ActionButton>
            </Actions>
          )}
        </Details>
      )}
    </Container>
  );
};

interface StatusBarProps {
  isOnline: boolean;
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const StatusBar = styled.div<StatusBarProps>`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: ${props => props.isOnline ? '#e6f7ed' : '#fff3e6'};
  border-top: 1px solid ${props => props.isOnline ? '#31a24c' : '#f7b928'};
  cursor: pointer;
`;

interface StatusIconProps {
  isOnline: boolean;
}

const StatusIcon = styled.div<StatusIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.isOnline ? '#31a24c' : '#f7b928'};
  color: #ffffff;
  margin-right: 8px;
`;

const StatusText = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
`;

const ExpandButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #65676b;
`;

const Details = styled.div`
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 8px;
`;

const DetailLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #65676b;
  width: 150px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #050505;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  background-color: #0084ff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #0077e6;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #65676b;
    cursor: not-allowed;
  }
`;

export default OfflineIndicator;
