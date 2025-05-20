import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import FilePreview from '../FilePreview/FilePreview';
import { Attachment } from '../../types';
import { useChat } from '../../context/ChatContext';

interface FileUploadProps {
  onFilesUploaded: (attachments: Attachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar',
}) => {
  const { uploadFile } = useChat();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  // Handle file selection
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    setError(null);
    
    // Check if max files limit is reached
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`En fazla ${maxFiles} dosya yükleyebilirsiniz.`);
      return;
    }
    
    // Convert FileList to array and filter out invalid files
    const newFiles = Array.from(selectedFiles).filter(file => {
      // Check file size
      if (file.size > maxFileSize) {
        setError(`Dosya boyutu ${formatFileSize(maxFileSize)} sınırını aşıyor.`);
        return false;
      }
      
      return true;
    });
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };
  
  // Handle file removal
  const handleFileRemove = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setError(null);
  };
  
  // Handle file upload
  const handleFileUpload = async (file: File): Promise<Attachment> => {
    try {
      const attachment = await uploadFile(file);
      return {
        id: attachment.url,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: attachment.url,
        name: attachment.name,
        size: attachment.size,
        mimeType: attachment.mimeType,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  // Handle upload all files
  const handleUploadAll = async () => {
    if (files.length === 0) return;
    
    try {
      const uploadPromises = files.map(file => handleFileUpload(file));
      const attachments = await Promise.all(uploadPromises);
      
      onFilesUploaded(attachments);
      setFiles([]);
    } catch (error) {
      setError('Dosyalar yüklenirken bir hata oluştu.');
      console.error('Error uploading files:', error);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
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
  
  // Handle drag events
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer) {
        handleFileSelect(e.dataTransfer.files);
      }
    };
    
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    
    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [files.length, maxFiles, maxFileSize]);
  
  return (
    <Container>
      <DropArea 
        ref={dropAreaRef}
        isDragging={isDragging}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          accept={acceptedFileTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        <DropIcon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </DropIcon>
        
        <DropText>
          Dosyaları buraya sürükleyin veya tıklayın
        </DropText>
        
        <DropSubtext>
          En fazla {maxFiles} dosya, her biri {formatFileSize(maxFileSize)} boyutunda
        </DropSubtext>
      </DropArea>
      
      {error && <ErrorText>{error}</ErrorText>}
      
      {files.length > 0 && (
        <FileList>
          {files.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              onRemove={() => handleFileRemove(index)}
              onUpload={handleFileUpload}
            />
          ))}
        </FileList>
      )}
      
      {files.length > 0 && (
        <Actions>
          <CancelButton onClick={() => setFiles([])}>
            İptal
          </CancelButton>
          <UploadButton onClick={handleUploadAll}>
            Tümünü Yükle ({files.length})
          </UploadButton>
        </Actions>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface DropAreaProps {
  isDragging: boolean;
}

const DropArea = styled.div<DropAreaProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed ${props => props.isDragging ? '#0084ff' : '#e0e0e0'};
  border-radius: 8px;
  background-color: ${props => props.isDragging ? '#e6f2ff' : '#f5f7fb'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #0084ff;
    background-color: #e6f2ff;
  }
`;

const DropIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #0084ff;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DropText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #050505;
  margin-bottom: 8px;
`;

const DropSubtext = styled.div`
  font-size: 12px;
  color: #65676b;
`;

const ErrorText = styled.div`
  font-size: 12px;
  color: #ff3b30;
  margin-top: 8px;
`;

const FileList = styled.div`
  margin-top: 16px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #65676b;
  cursor: pointer;
  
  &:hover {
    color: #050505;
  }
`;

const UploadButton = styled.button`
  background-color: #0084ff;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background-color: #0077e6;
  }
`;

export default FileUpload;
