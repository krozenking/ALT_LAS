import React from 'react';
import styled from 'styled-components';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Ara...' }) => {
  return (
    <Container>
      <SearchIcon>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </SearchIcon>
      <Input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
      />
      {value && (
        <ClearButton onClick={() => onChange('')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ClearButton>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f2f5;
  border-radius: 20px;
  padding: 0 12px;
  height: 36px;
  position: relative;
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676b;
  margin-right: 8px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #050505;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #8e8e8e;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65676b;
  
  &:hover {
    color: #050505;
  }
`;

export default SearchBar;
