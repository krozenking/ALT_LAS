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
  Badge,
  Switch,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { glassmorphism } from '../../styles/themes/creator';
import Table from './Table';
import TableToolbar from './TableToolbar';
import TablePagination from './TablePagination';
import { TableColumn } from './types';

// Sample data type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

// Sample data
const sampleData: User[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  role: ['Admin', 'User', 'Editor', 'Viewer'][Math.floor(Math.random() * 4)],
  status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)] as 'active' | 'inactive' | 'pending',
  lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
}));

// Table demo component
const TableDemo: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // State for table settings
  const [isStriped, setIsStriped] = useState(true);
  const [isHoverable, setIsHoverable] = useState(true);
  const [isBordered, setIsBordered] = useState(false);
  const [isStickyHeader, setIsStickyHeader] = useState(true);
  const [isSelectable, setIsSelectable] = useState(true);
  const [isPaginated, setIsPaginated] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [tableSize, setTableSize] = useState<'sm' | 'md' | 'lg'>('md');
  
  // Table columns
  const columns: TableColumn<User>[] = [
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
      width: '80px',
      align: 'center',
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      sortable: true,
      filterable: true,
    },
    {
      id: 'role',
      header: 'Role',
      accessor: 'role',
      sortable: true,
      filterable: true,
      cell: (value) => (
        <Badge
          colorScheme={
            value === 'Admin'
              ? 'red'
              : value === 'Editor'
                ? 'green'
                : value === 'User'
                  ? 'blue'
                  : 'gray'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      filterable: true,
      cell: (value) => (
        <Badge
          colorScheme={
            value === 'active'
              ? 'green'
              : value === 'inactive'
                ? 'red'
                : 'yellow'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      id: 'lastLogin',
      header: 'Last Login',
      accessor: 'lastLogin',
      sortable: true,
      type: 'date',
    },
    {
      id: 'createdAt',
      header: 'Created At',
      accessor: 'createdAt',
      sortable: true,
      type: 'date',
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '120px',
      cell: (_, row) => (
        <HStack spacing={2}>
          <Button
            size="xs"
            colorScheme="blue"
            onClick={() => handleEditClick(row)}
          >
            Edit
          </Button>
          <Button
            size="xs"
            colorScheme="red"
            onClick={() => handleDeleteClick(row)}
          >
            Delete
          </Button>
        </HStack>
      ),
    },
  ];
  
  // Handle row click
  const handleRowClick = (row: User) => {
    toast({
      title: 'Row clicked',
      description: `You clicked on ${row.name}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Handle edit click
  const handleEditClick = (row: User) => {
    toast({
      title: 'Edit clicked',
      description: `You want to edit ${row.name}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Handle delete click
  const handleDeleteClick = (row: User) => {
    toast({
      title: 'Delete clicked',
      description: `You want to delete ${row.name}`,
      status: 'warning',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Handle refresh click
  const handleRefreshClick = () => {
    toast({
      title: 'Refreshing data',
      description: 'Table data is being refreshed',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Handle export click
  const handleExportClick = () => {
    toast({
      title: 'Exporting data',
      description: 'Table data is being exported',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('common.tables')}</Heading>
        
        <Text>
          {t('common.tablesDescription')}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('common.tablesInfo')}
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
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.tableDemo')}</Heading>
                  
                  <HStack spacing={4} wrap="wrap">
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel mb="0" mr={2}>Striped</FormLabel>
                      <Switch
                        isChecked={isStriped}
                        onChange={(e) => setIsStriped(e.target.checked)}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel mb="0" mr={2}>Hoverable</FormLabel>
                      <Switch
                        isChecked={isHoverable}
                        onChange={(e) => setIsHoverable(e.target.checked)}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel mb="0" mr={2}>Bordered</FormLabel>
                      <Switch
                        isChecked={isBordered}
                        onChange={(e) => setIsBordered(e.target.checked)}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel mb="0" mr={2}>Sticky Header</FormLabel>
                      <Switch
                        isChecked={isStickyHeader}
                        onChange={(e) => setIsStickyHeader(e.target.checked)}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel mb="0" mr={2}>Selectable</FormLabel>
                      <Switch
                        isChecked={isSelectable}
                        onChange={(e) => setIsSelectable(e.target.checked)}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel mb="0" mr={2}>Paginated</FormLabel>
                      <Switch
                        isChecked={isPaginated}
                        onChange={(e) => setIsPaginated(e.target.checked)}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel mb="0" mr={2}>Toolbar</FormLabel>
                      <Switch
                        isChecked={showToolbar}
                        onChange={(e) => setShowToolbar(e.target.checked)}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel mb="0" mr={2}>Size</FormLabel>
                      <select
                        value={tableSize}
                        onChange={(e) => setTableSize(e.target.value as 'sm' | 'md' | 'lg')}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid',
                          borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600',
                        }}
                      >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                      </select>
                    </FormControl>
                  </HStack>
                  
                  <Box
                    borderRadius="md"
                    overflow="hidden"
                    height={isPaginated ? '500px' : '600px'}
                    display="flex"
                    flexDirection="column"
                  >
                    <Table
                      columns={columns}
                      data={sampleData}
                      isStriped={isStriped}
                      isHoverable={isHoverable}
                      isBordered={isBordered}
                      isStickyHeader={isStickyHeader}
                      isSelectable={isSelectable}
                      size={tableSize}
                      onRowClick={handleRowClick}
                      toolbar={
                        showToolbar ? (
                          <TableToolbar
                            title="Users"
                            onRefreshClick={handleRefreshClick}
                            onExportClick={handleExportClick}
                          />
                        ) : undefined
                      }
                      pagination={
                        isPaginated ? (
                          <TablePagination />
                        ) : undefined
                      }
                      flex={1}
                    />
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.code')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>Basic Table</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { Table } from '@/components/table';

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
  },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
  },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
];

<Table
  columns={columns}
  data={data}
  isStriped
  isHoverable
  isStickyHeader
/>`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>Advanced Table</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { Table, TableToolbar, TablePagination } from '@/components/table';

<Table
  columns={columns}
  data={data}
  isStriped
  isHoverable
  isStickyHeader
  isSelectable
  toolbar={
    <TableToolbar
      title="Users"
      onRefreshClick={handleRefreshClick}
      onExportClick={handleExportClick}
    />
  }
  pagination={
    <TablePagination
      pageSizes={[10, 25, 50, 100]}
      showPageSizeSelector
      showPageInfo
    />
  }
  onRowClick={handleRowClick}
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
                    <Heading size="sm" mb={2}>Table Component</Heading>
                    <Text>
                      A flexible and feature-rich table component for displaying, sorting, filtering, and paginating data.
                    </Text>
                    <Text mt={2}>
                      <strong>Props:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>columns</strong>: Table column definitions</Text>
                      <Text>• <strong>data</strong>: Table data</Text>
                      <Text>• <strong>isStriped</strong>: Whether to use striped rows</Text>
                      <Text>• <strong>isHoverable</strong>: Whether to use hover effect</Text>
                      <Text>• <strong>isBordered</strong>: Whether to use bordered table</Text>
                      <Text>• <strong>isStickyHeader</strong>: Whether to use sticky header</Text>
                      <Text>• <strong>isSelectable</strong>: Whether to use selectable rows</Text>
                      <Text>• <strong>isPaginated</strong>: Whether to use pagination</Text>
                      <Text>• <strong>size</strong>: Table size (sm, md, lg)</Text>
                      <Text>• <strong>toolbar</strong>: Table toolbar component</Text>
                      <Text>• <strong>pagination</strong>: Table pagination component</Text>
                      <Text>• <strong>onRowClick</strong>: On row click callback</Text>
                      <Text>• <strong>onCellClick</strong>: On cell click callback</Text>
                      <Text>• <strong>onSortChange</strong>: On sort change callback</Text>
                      <Text>• <strong>onFilterChange</strong>: On filter change callback</Text>
                      <Text>• <strong>onSelectionChange</strong>: On selection change callback</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>TableToolbar Component</Heading>
                    <Text>
                      A toolbar component for the table with search, column visibility, export, and other actions.
                    </Text>
                    <Text mt={2}>
                      <strong>Props:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>title</strong>: Table title</Text>
                      <Text>• <strong>showSearch</strong>: Whether to show search input</Text>
                      <Text>• <strong>showColumnVisibility</strong>: Whether to show column visibility menu</Text>
                      <Text>• <strong>showExport</strong>: Whether to show export button</Text>
                      <Text>• <strong>showRefresh</strong>: Whether to show refresh button</Text>
                      <Text>• <strong>actions</strong>: Custom actions</Text>
                      <Text>• <strong>onSearchChange</strong>: On search change callback</Text>
                      <Text>• <strong>onExportClick</strong>: On export click callback</Text>
                      <Text>• <strong>onRefreshClick</strong>: On refresh click callback</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>TablePagination Component</Heading>
                    <Text>
                      A pagination component for the table with page size selector and navigation controls.
                    </Text>
                    <Text mt={2}>
                      <strong>Props:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>pageSizes</strong>: Page sizes</Text>
                      <Text>• <strong>showPageSizeSelector</strong>: Whether to show page size selector</Text>
                      <Text>• <strong>showPageInfo</strong>: Whether to show page info</Text>
                      <Text>• <strong>showFirstLastButtons</strong>: Whether to show first and last page buttons</Text>
                      <Text>• <strong>showPrevNextButtons</strong>: Whether to show previous and next page buttons</Text>
                      <Text>• <strong>showPageButtons</strong>: Whether to show page buttons</Text>
                      <Text>• <strong>onPageChange</strong>: On page change callback</Text>
                      <Text>• <strong>onPageSizeChange</strong>: On page size change callback</Text>
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
              {t('common.tablesDetails')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>{t('common.responsiveTables')}</strong>: {t('common.responsiveTablesDescription')}</Text>
              <Text>• <strong>{t('common.sortableTables')}</strong>: {t('common.sortableTablesDescription')}</Text>
              <Text>• <strong>{t('common.filterableTables')}</strong>: {t('common.filterableTablesDescription')}</Text>
              <Text>• <strong>{t('common.paginatedTables')}</strong>: {t('common.paginatedTablesDescription')}</Text>
              <Text>• <strong>{t('common.selectableTables')}</strong>: {t('common.selectableTablesDescription')}</Text>
            </Box>
            
            <Text>
              {t('common.tablesFeatures')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.tableToolbar')}</Text>
              <Text>• {t('common.tablePagination')}</Text>
              <Text>• {t('common.tableColumnVisibility')}</Text>
              <Text>• {t('common.tableExport')}</Text>
              <Text>• {t('common.tableSearch')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default TableDemo;
