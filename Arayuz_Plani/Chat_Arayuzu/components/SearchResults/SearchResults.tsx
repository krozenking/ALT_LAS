import React from 'react';
import styled from 'styled-components';
import { SearchResult } from '../../types';
import { useChat } from '../../context/ChatContext';
import { formatDate } from '../../utils/dateUtils';

interface SearchResultsProps {
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ onClose }) => {
  const { searchResults, isSearching, selectConversation, clearSearch } = useChat();
  
  // Group search results by type
  const userResults = searchResults.filter(result => result.type === 'user');
  const conversationResults = searchResults.filter(result => result.type === 'conversation');
  const messageResults = searchResults.filter(result => result.type === 'message');
  
  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (result.conversationId) {
      selectConversation(result.conversationId);
      clearSearch();
      onClose();
    } else if (result.type === 'user' && result.id) {
      // Create or select direct conversation with this user
      // This will be handled in the context
      clearSearch();
      onClose();
    }
  };
  
  if (isSearching) {
    return (
      <Container>
        <LoadingText>Aranıyor...</LoadingText>
      </Container>
    );
  }
  
  if (searchResults.length === 0) {
    return (
      <Container>
        <EmptyText>Sonuç bulunamadı</EmptyText>
      </Container>
    );
  }
  
  return (
    <Container>
      {userResults.length > 0 && (
        <ResultSection>
          <SectionTitle>Kullanıcılar</SectionTitle>
          {userResults.map(result => (
            <ResultItem key={result.id} onClick={() => handleResultClick(result)}>
              {result.avatar && <ResultAvatar src={result.avatar} alt={result.name || ''} />}
              <ResultContent>
                <ResultName>{result.name}</ResultName>
              </ResultContent>
            </ResultItem>
          ))}
        </ResultSection>
      )}
      
      {conversationResults.length > 0 && (
        <ResultSection>
          <SectionTitle>Sohbetler</SectionTitle>
          {conversationResults.map(result => (
            <ResultItem key={result.id} onClick={() => handleResultClick(result)}>
              {result.avatar && <ResultAvatar src={result.avatar} alt={result.name || ''} />}
              <ResultContent>
                <ResultName>{result.name}</ResultName>
              </ResultContent>
            </ResultItem>
          ))}
        </ResultSection>
      )}
      
      {messageResults.length > 0 && (
        <ResultSection>
          <SectionTitle>Mesajlar</SectionTitle>
          {messageResults.map(result => (
            <ResultItem key={result.id} onClick={() => handleResultClick(result)}>
              <ResultContent>
                <ResultName>{result.name}</ResultName>
                <ResultText>{result.text}</ResultText>
                {result.timestamp && (
                  <ResultTime>{formatDate(new Date(result.timestamp))}</ResultTime>
                )}
              </ResultContent>
            </ResultItem>
          ))}
        </ResultSection>
      )}
    </Container>
  );
};

const Container = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  width: 100%;
`;

const ResultSection = styled.div`
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #65676b;
  padding: 8px 16px;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ResultAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const ResultContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #050505;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultText = styled.div`
  font-size: 12px;
  color: #65676b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const ResultTime = styled.div`
  font-size: 11px;
  color: #8e8e8e;
  margin-top: 2px;
`;

const LoadingText = styled.div`
  color: #8e8e8e;
  font-size: 14px;
  text-align: center;
  padding: 16px;
`;

const EmptyText = styled.div`
  color: #8e8e8e;
  font-size: 14px;
  text-align: center;
  padding: 16px;
`;

export default SearchResults;
