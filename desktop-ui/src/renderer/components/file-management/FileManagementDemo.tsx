import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
  Code,
  useColorMode,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { glassmorphism } from '../../styles/themes/creator';
import FileUploader from './FileUploader';
import FileViewer from './FileViewer';
import FileList, { FileItem } from './FileList';
import FileDownloader from './FileDownloader';

// Sample files
const sampleFiles: FileItem[] = [
  {
    id: '1',
    name: 'document.pdf',
    type: 'application/pdf',
    size: 1024 * 1024 * 2.5, // 2.5MB
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    url: 'https://example.com/document.pdf',
  },
  {
    id: '2',
    name: 'image.jpg',
    type: 'image/jpeg',
    size: 1024 * 1024 * 1.2, // 1.2MB
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    url: 'https://example.com/image.jpg',
    thumbnailUrl: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    name: 'spreadsheet.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024 * 1024 * 3.7, // 3.7MB
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    url: 'https://example.com/spreadsheet.xlsx',
  },
  {
    id: '4',
    name: 'presentation.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 1024 * 1024 * 5.1, // 5.1MB
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    url: 'https://example.com/presentation.pptx',
  },
  {
    id: '5',
    name: 'video.mp4',
    type: 'video/mp4',
    size: 1024 * 1024 * 15.8, // 15.8MB
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    url: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://via.placeholder.com/100',
  },
];

// File management demo component
const FileManagementDemo: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // State
  const [files, setFiles] = useState<FileItem[]>(sampleFiles);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false);
  
  // Handle file upload
  const handleFileUpload = async (uploadedFiles: File[]) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add uploaded files to the list
    const newFiles: FileItem[] = uploadedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      lastModified: new Date(file.lastModified),
      url: URL.createObjectURL(file),
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    
    setFiles(prevFiles => [...newFiles, ...prevFiles]);
    
    toast({
      title: 'Files uploaded',
      description: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle file view
  const handleFileView = (file: FileItem) => {
    setSelectedFile(file);
    setIsViewerOpen(true);
  };
  
  // Handle file download
  const handleFileDownload = (file: FileItem) => {
    setSelectedFile(file);
    setIsDownloaderOpen(true);
  };
  
  // Handle file delete
  const handleFileDelete = (file: FileItem) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));
    
    toast({
      title: 'File deleted',
      description: `Successfully deleted ${file.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('common.fileManagement')}</Heading>
        
        <Text>
          {t('common.fileManagementDescription')}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('common.fileManagementInfo')}
          </AlertDescription>
        </Alert>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>{t('common.demo')}</Tab>
            <Tab>{t('common.code')}</Tab>
            <Tab>{t('common.api')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md">{t('common.fileUploader')}</Heading>
                  <FileUploader
                    onFileUpload={handleFileUpload}
                    multiple
                    accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.*"
                    maxSize={1024 * 1024 * 50} // 50MB
                    autoUpload={false}
                  />
                  
                  <Divider my={4} />
                  
                  <Heading size="md">{t('common.fileList')}</Heading>
                  <FileList
                    files={files}
                    onFileView={handleFileView}
                    onFileDownload={handleFileDownload}
                    onFileDelete={handleFileDelete}
                  />
                  
                  <Divider my={4} />
                  
                  <Heading size="md">{t('common.fileDownloader')}</Heading>
                  <FileDownloader
                    fileUrl="https://example.com/sample.pdf"
                    fileName="sample.pdf"
                    fileSize={1024 * 1024 * 10} // 10MB
                    autoStart={false}
                  />
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.code')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.fileUploader')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { FileUploader } from '@/components/file-management';

<FileUploader
  onFileUpload={handleFileUpload}
  multiple
  accept="image/*,application/pdf"
  maxSize={1024 * 1024 * 50} // 50MB
  autoUpload={false}
/>`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.fileList')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { FileList } from '@/components/file-management';

const files = [
  {
    id: '1',
    name: 'document.pdf',
    type: 'application/pdf',
    size: 1024 * 1024 * 2.5, // 2.5MB
    lastModified: new Date(),
    url: 'https://example.com/document.pdf',
  },
  // ...
];

<FileList
  files={files}
  onFileView={handleFileView}
  onFileDownload={handleFileDownload}
  onFileDelete={handleFileDelete}
/>`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.fileViewer')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { FileViewer } from '@/components/file-management';

<FileViewer
  fileUrl="https://example.com/document.pdf"
  fileName="document.pdf"
  fileType="application/pdf"
  fileSize={1024 * 1024 * 2.5} // 2.5MB
  lastModified={new Date()}
  showFileInfo
  showDownloadButton
  showPrintButton
  showFullscreenButton
/>`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.fileDownloader')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { FileDownloader } from '@/components/file-management';

<FileDownloader
  fileUrl="https://example.com/document.pdf"
  fileName="document.pdf"
  fileSize={1024 * 1024 * 2.5} // 2.5MB
  autoStart={false}
  showFileInfo
  showProgress
  showSpeed
  showTimeRemaining
/>`}
                    </Code>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.api')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.fileUploader')}</Heading>
                    <Text>
                      A component for uploading files with drag and drop support, progress tracking, and file validation.
                    </Text>
                    <Text mt={2}>
                      <strong>Props:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>onFileSelect</strong>: Callback when files are selected</Text>
                      <Text>• <strong>onFileUpload</strong>: Callback to handle file upload</Text>
                      <Text>• <strong>multiple</strong>: Whether to allow multiple file selection</Text>
                      <Text>• <strong>accept</strong>: Accepted file types</Text>
                      <Text>• <strong>maxSize</strong>: Maximum file size in bytes</Text>
                      <Text>• <strong>autoUpload</strong>: Whether to automatically upload files after selection</Text>
                      <Text>• <strong>showPreview</strong>: Whether to show file preview</Text>
                      <Text>• <strong>showProgress</strong>: Whether to show upload progress</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.fileList')}</Heading>
                    <Text>
                      A component for displaying a list of files with sorting, filtering, and pagination.
                    </Text>
                    <Text mt={2}>
                      <strong>Props:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>files</strong>: Array of file objects</Text>
                      <Text>• <strong>showThumbnail</strong>: Whether to show file thumbnails</Text>
                      <Text>• <strong>showSize</strong>: Whether to show file sizes</Text>
                      <Text>• <strong>showType</strong>: Whether to show file types</Text>
                      <Text>• <strong>showLastModified</strong>: Whether to show last modified dates</Text>
                      <Text>• <strong>showActions</strong>: Whether to show file actions</Text>
                      <Text>• <strong>showSelection</strong>: Whether to show file selection checkboxes</Text>
                      <Text>• <strong>onFileSelect</strong>: Callback when a file is selected</Text>
                      <Text>• <strong>onFileDownload</strong>: Callback when a file is downloaded</Text>
                      <Text>• <strong>onFileView</strong>: Callback when a file is viewed</Text>
                      <Text>• <strong>onFileDelete</strong>: Callback when a file is deleted</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.fileViewer')}</Heading>
                    <Text>
                      A component for viewing files with support for different file types, zooming, and rotation.
                    </Text>
                    <Text mt={2}>
                      <strong>Props:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>fileUrl</strong>: URL of the file to view</Text>
                      <Text>• <strong>fileName</strong>: Name of the file</Text>
                      <Text>• <strong>fileType</strong>: MIME type of the file</Text>
                      <Text>• <strong>fileSize</strong>: Size of the file in bytes</Text>
                      <Text>• <strong>lastModified</strong>: Last modified date of the file</Text>
                      <Text>• <strong>showFileInfo</strong>: Whether to show file information</Text>
                      <Text>• <strong>showDownloadButton</strong>: Whether to show download button</Text>
                      <Text>• <strong>showPrintButton</strong>: Whether to show print button</Text>
                      <Text>• <strong>showFullscreenButton</strong>: Whether to show fullscreen button</Text>
                      <Text>• <strong>showZoomButtons</strong>: Whether to show zoom buttons</Text>
                      <Text>• <strong>showRotateButtons</strong>: Whether to show rotate buttons</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.fileDownloader')}</Heading>
                    <Text>
                      A component for downloading files with progress tracking, speed calculation, and time estimation.
                    </Text>
                    <Text mt={2}>
                      <strong>Props:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>fileUrl</strong>: URL of the file to download</Text>
                      <Text>• <strong>fileName</strong>: Name of the file</Text>
                      <Text>• <strong>fileSize</strong>: Size of the file in bytes</Text>
                      <Text>• <strong>autoStart</strong>: Whether to automatically start the download</Text>
                      <Text>• <strong>showFileInfo</strong>: Whether to show file information</Text>
                      <Text>• <strong>showProgress</strong>: Whether to show download progress</Text>
                      <Text>• <strong>showSpeed</strong>: Whether to show download speed</Text>
                      <Text>• <strong>showTimeRemaining</strong>: Whether to show estimated time remaining</Text>
                      <Text>• <strong>showCancelButton</strong>: Whether to show cancel button</Text>
                      <Text>• <strong>showPauseButton</strong>: Whether to show pause button</Text>
                      <Text>• <strong>showResumeButton</strong>: Whether to show resume button</Text>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>{t('common.details')}</Heading>
          
          <VStack align="stretch" spacing={3}>
            <Text>
              {t('common.fileManagementDetails')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>{t('common.fileUpload')}</strong>: {t('common.fileUploadDescription')}</Text>
              <Text>• <strong>{t('common.fileViewing')}</strong>: {t('common.fileViewingDescription')}</Text>
              <Text>• <strong>{t('common.fileDownload')}</strong>: {t('common.fileDownloadDescription')}</Text>
              <Text>• <strong>{t('common.fileManagementList')}</strong>: {t('common.fileManagementListDescription')}</Text>
              <Text>• <strong>{t('common.fileManagementActions')}</strong>: {t('common.fileManagementActionsDescription')}</Text>
            </Box>
            
            <Text>
              {t('common.fileManagementFeatures')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.dragAndDrop')}</Text>
              <Text>• {t('common.filePreview')}</Text>
              <Text>• {t('common.fileValidation')}</Text>
              <Text>• {t('common.progressTracking')}</Text>
              <Text>• {t('common.fileSorting')}</Text>
              <Text>• {t('common.fileFiltering')}</Text>
              <Text>• {t('common.filePagination')}</Text>
              <Text>• {t('common.fileSelection')}</Text>
              <Text>• {t('common.bulkActions')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
      
      {/* File viewer modal */}
      <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent height="80vh">
          <ModalHeader>{selectedFile?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            {selectedFile && (
              <FileViewer
                fileUrl={selectedFile.url || ''}
                fileName={selectedFile.name}
                fileType={selectedFile.type}
                fileSize={selectedFile.size}
                lastModified={selectedFile.lastModified}
                height="100%"
                onCloseClick={() => setIsViewerOpen(false)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* File downloader modal */}
      <Modal isOpen={isDownloaderOpen} onClose={() => setIsDownloaderOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Download File</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedFile && (
              <FileDownloader
                fileUrl={selectedFile.url || ''}
                fileName={selectedFile.name}
                fileSize={selectedFile.size}
                autoStart={true}
                onDownloadComplete={() => {
                  setTimeout(() => setIsDownloaderOpen(false), 1000);
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FileManagementDemo;
