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
  Select,
  FormControl,
  FormLabel,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Grid,
  GridItem,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { glassmorphism } from '../../styles/themes/creator';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import RadarChart from './RadarChart';

// Chart demo component
const ChartDemo: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // State for chart settings
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'radar'>('line');
  const [showArea, setShowArea] = useState(true);
  const [useCurvedLines, setUseCurvedLines] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [useGradient, setUseGradient] = useState(true);
  const [stacked, setStacked] = useState(false);
  const [horizontal, setHorizontal] = useState(false);
  const [doughnut, setDoughnut] = useState(false);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationDuration, setAnimationDuration] = useState(1000);
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderRadius, setBorderRadius] = useState(4);
  const [tension, setTension] = useState(0.4);
  
  // Sample data for charts
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [12, 19, 3, 5, 2, 3, 15, 20, 18, 10, 12, 25],
      },
      {
        label: 'Expenses',
        data: [8, 12, 5, 4, 1, 2, 10, 15, 10, 8, 9, 15],
      },
    ],
  };
  
  const categoryData = {
    labels: ['Electronics', 'Clothing', 'Food', 'Books', 'Services'],
    datasets: [
      {
        label: 'Sales',
        data: [35, 25, 20, 10, 15],
      },
    ],
  };
  
  const skillsData = {
    labels: ['Coding', 'Design', 'Communication', 'Problem Solving', 'Teamwork', 'Leadership'],
    datasets: [
      {
        label: 'Current Skills',
        data: [85, 70, 75, 80, 65, 60],
      },
      {
        label: 'Target Skills',
        data: [95, 85, 85, 90, 80, 75],
      },
    ],
  };
  
  // Handle refresh click
  const handleRefreshClick = () => {
    toast({
      title: 'Chart refreshed',
      description: 'Chart data has been refreshed',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Handle download click
  const handleDownloadClick = () => {
    toast({
      title: 'Chart downloaded',
      description: 'Chart has been downloaded as an image',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Render chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart
            data={monthlyData}
            showArea={showArea}
            useCurvedLines={useCurvedLines}
            showPoints={showPoints}
            useGradient={useGradient}
            stacked={stacked}
            tension={tension}
            borderWidth={borderWidth}
            showLegend={showLegend}
            showGrid={showGrid}
            showAnimation={showAnimation}
            animationDuration={animationDuration}
            showDataLabels={showDataLabels}
            showRefreshButton
            showDownloadButton
            onRefreshClick={handleRefreshClick}
            onDownloadClick={handleDownloadClick}
            height="300px"
          />
        );
      case 'bar':
        return (
          <BarChart
            data={monthlyData}
            horizontal={horizontal}
            stacked={stacked}
            useGradient={useGradient}
            borderWidth={borderWidth}
            borderRadius={borderRadius}
            showLegend={showLegend}
            showGrid={showGrid}
            showAnimation={showAnimation}
            animationDuration={animationDuration}
            showDataLabels={showDataLabels}
            showRefreshButton
            showDownloadButton
            onRefreshClick={handleRefreshClick}
            onDownloadClick={handleDownloadClick}
            height="300px"
          />
        );
      case 'pie':
        return (
          <PieChart
            data={categoryData}
            doughnut={doughnut}
            useGradient={useGradient}
            borderWidth={borderWidth}
            showLegend={showLegend}
            showAnimation={showAnimation}
            animationDuration={animationDuration}
            showDataLabels={showDataLabels}
            showPercentage={true}
            showRefreshButton
            showDownloadButton
            onRefreshClick={handleRefreshClick}
            onDownloadClick={handleDownloadClick}
            height="300px"
          />
        );
      case 'radar':
        return (
          <RadarChart
            data={skillsData}
            showArea={showArea}
            useGradient={useGradient}
            showPoints={showPoints}
            borderWidth={borderWidth}
            showLegend={showLegend}
            showAnimation={showAnimation}
            animationDuration={animationDuration}
            showDataLabels={showDataLabels}
            showRefreshButton
            showDownloadButton
            onRefreshClick={handleRefreshClick}
            onDownloadClick={handleDownloadClick}
            height="300px"
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('common.dataVisualization')}</Heading>
        
        <Text>
          {t('common.dataVisualizationDescription')}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('common.dataVisualizationInfo')}
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
                  <Heading size="md">{t('common.chartDemo')}</Heading>
                  
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>{t('common.chartType')}</FormLabel>
                        <Select
                          value={chartType}
                          onChange={(e) => setChartType(e.target.value as any)}
                        >
                          <option value="line">{t('common.lineChart')}</option>
                          <option value="bar">{t('common.barChart')}</option>
                          <option value="pie">{t('common.pieChart')}</option>
                          <option value="radar">{t('common.radarChart')}</option>
                        </Select>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">{t('common.showLegend')}</FormLabel>
                        <Switch
                          isChecked={showLegend}
                          onChange={(e) => setShowLegend(e.target.checked)}
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">{t('common.showGrid')}</FormLabel>
                        <Switch
                          isChecked={showGrid}
                          onChange={(e) => setShowGrid(e.target.checked)}
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">{t('common.showDataLabels')}</FormLabel>
                        <Switch
                          isChecked={showDataLabels}
                          onChange={(e) => setShowDataLabels(e.target.checked)}
                        />
                      </FormControl>
                    </GridItem>
                    
                    {(chartType === 'line' || chartType === 'radar') && (
                      <GridItem>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">{t('common.showArea')}</FormLabel>
                          <Switch
                            isChecked={showArea}
                            onChange={(e) => setShowArea(e.target.checked)}
                          />
                        </FormControl>
                      </GridItem>
                    )}
                    
                    {(chartType === 'line') && (
                      <GridItem>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">{t('common.useCurvedLines')}</FormLabel>
                          <Switch
                            isChecked={useCurvedLines}
                            onChange={(e) => setUseCurvedLines(e.target.checked)}
                          />
                        </FormControl>
                      </GridItem>
                    )}
                    
                    {(chartType === 'line' || chartType === 'radar') && (
                      <GridItem>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">{t('common.showPoints')}</FormLabel>
                          <Switch
                            isChecked={showPoints}
                            onChange={(e) => setShowPoints(e.target.checked)}
                          />
                        </FormControl>
                      </GridItem>
                    )}
                    
                    <GridItem>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">{t('common.useGradient')}</FormLabel>
                        <Switch
                          isChecked={useGradient}
                          onChange={(e) => setUseGradient(e.target.checked)}
                        />
                      </FormControl>
                    </GridItem>
                    
                    {(chartType === 'line' || chartType === 'bar') && (
                      <GridItem>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">{t('common.stacked')}</FormLabel>
                          <Switch
                            isChecked={stacked}
                            onChange={(e) => setStacked(e.target.checked)}
                          />
                        </FormControl>
                      </GridItem>
                    )}
                    
                    {chartType === 'bar' && (
                      <GridItem>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">{t('common.horizontal')}</FormLabel>
                          <Switch
                            isChecked={horizontal}
                            onChange={(e) => setHorizontal(e.target.checked)}
                          />
                        </FormControl>
                      </GridItem>
                    )}
                    
                    {chartType === 'pie' && (
                      <GridItem>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">{t('common.doughnut')}</FormLabel>
                          <Switch
                            isChecked={doughnut}
                            onChange={(e) => setDoughnut(e.target.checked)}
                          />
                        </FormControl>
                      </GridItem>
                    )}
                    
                    <GridItem>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">{t('common.showAnimation')}</FormLabel>
                        <Switch
                          isChecked={showAnimation}
                          onChange={(e) => setShowAnimation(e.target.checked)}
                        />
                      </FormControl>
                    </GridItem>
                    
                    {showAnimation && (
                      <GridItem>
                        <FormControl>
                          <FormLabel>{t('common.animationDuration')}</FormLabel>
                          <NumberInput
                            value={animationDuration}
                            onChange={(_, value) => setAnimationDuration(value)}
                            min={0}
                            max={2000}
                            step={100}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </GridItem>
                    )}
                    
                    <GridItem>
                      <FormControl>
                        <FormLabel>{t('common.borderWidth')}</FormLabel>
                        <NumberInput
                          value={borderWidth}
                          onChange={(_, value) => setBorderWidth(value)}
                          min={0}
                          max={10}
                          step={1}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                    
                    {chartType === 'bar' && (
                      <GridItem>
                        <FormControl>
                          <FormLabel>{t('common.borderRadius')}</FormLabel>
                          <NumberInput
                            value={borderRadius}
                            onChange={(_, value) => setBorderRadius(value)}
                            min={0}
                            max={20}
                            step={1}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </GridItem>
                    )}
                    
                    {(chartType === 'line' && useCurvedLines) && (
                      <GridItem>
                        <FormControl>
                          <FormLabel>{t('common.tension')}</FormLabel>
                          <Slider
                            value={tension}
                            onChange={(value) => setTension(value)}
                            min={0}
                            max={1}
                            step={0.1}
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                        </FormControl>
                      </GridItem>
                    )}
                  </Grid>
                  
                  <Box mt={4} borderRadius="md" overflow="hidden">
                    {renderChart()}
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.code')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.lineChart')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { LineChart } from '@/components/data-visualization';

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [12, 19, 3, 5, 2, 3],
    },
    {
      label: 'Expenses',
      data: [8, 12, 5, 4, 1, 2],
    },
  ],
};

<LineChart
  data={data}
  showArea={true}
  useCurvedLines={true}
  showPoints={true}
  useGradient={true}
  height="300px"
/>`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.barChart')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { BarChart } from '@/components/data-visualization';

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [12, 19, 3, 5, 2, 3],
    },
  ],
};

<BarChart
  data={data}
  horizontal={false}
  stacked={false}
  useGradient={true}
  borderRadius={4}
  height="300px"
/>`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.pieChart')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { PieChart } from '@/components/data-visualization';

const data = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
  datasets: [
    {
      data: [12, 19, 3, 5, 2],
    },
  ],
};

<PieChart
  data={data}
  doughnut={true}
  showPercentage={true}
  height="300px"
/>`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.radarChart')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { RadarChart } from '@/components/data-visualization';

const data = {
  labels: ['Coding', 'Design', 'Communication', 'Problem Solving', 'Teamwork', 'Leadership'],
  datasets: [
    {
      label: 'Current Skills',
      data: [85, 70, 75, 80, 65, 60],
    },
    {
      label: 'Target Skills',
      data: [95, 85, 85, 90, 80, 75],
    },
  ],
};

<RadarChart
  data={data}
  showArea={true}
  useGradient={true}
  height="300px"
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
                    <Heading size="sm" mb={2}>{t('common.chartComponents')}</Heading>
                    <Text>
                      {t('common.chartComponentsDescription')}
                    </Text>
                    <Text mt={2}>
                      <strong>{t('common.components')}:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>Chart</strong>: {t('common.chartDescription')}</Text>
                      <Text>• <strong>LineChart</strong>: {t('common.lineChartDescription')}</Text>
                      <Text>• <strong>BarChart</strong>: {t('common.barChartDescription')}</Text>
                      <Text>• <strong>PieChart</strong>: {t('common.pieChartDescription')}</Text>
                      <Text>• <strong>RadarChart</strong>: {t('common.radarChartDescription')}</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.commonProps')}</Heading>
                    <Text>
                      {t('common.commonPropsDescription')}
                    </Text>
                    <Text mt={2}>
                      <strong>{t('common.props')}:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>data</strong>: {t('common.dataDescription')}</Text>
                      <Text>• <strong>width/height</strong>: {t('common.dimensionsDescription')}</Text>
                      <Text>• <strong>showLegend</strong>: {t('common.showLegendDescription')}</Text>
                      <Text>• <strong>showGrid</strong>: {t('common.showGridDescription')}</Text>
                      <Text>• <strong>showAnimation</strong>: {t('common.showAnimationDescription')}</Text>
                      <Text>• <strong>showDataLabels</strong>: {t('common.showDataLabelsDescription')}</Text>
                      <Text>• <strong>useGradient</strong>: {t('common.useGradientDescription')}</Text>
                      <Text>• <strong>borderWidth</strong>: {t('common.borderWidthDescription')}</Text>
                      <Text>• <strong>onClick/onHover</strong>: {t('common.eventHandlersDescription')}</Text>
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
              {t('common.dataVisualizationDetails')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>{t('common.responsiveCharts')}</strong>: {t('common.responsiveChartsDescription')}</Text>
              <Text>• <strong>{t('common.interactiveCharts')}</strong>: {t('common.interactiveChartsDescription')}</Text>
              <Text>• <strong>{t('common.customizableCharts')}</strong>: {t('common.customizableChartsDescription')}</Text>
              <Text>• <strong>{t('common.accessibleCharts')}</strong>: {t('common.accessibleChartsDescription')}</Text>
              <Text>• <strong>{t('common.animatedCharts')}</strong>: {t('common.animatedChartsDescription')}</Text>
            </Box>
            
            <Text>
              {t('common.dataVisualizationFeatures')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.chartTypes')}</Text>
              <Text>• {t('common.chartCustomization')}</Text>
              <Text>• {t('common.chartInteractivity')}</Text>
              <Text>• {t('common.chartExport')}</Text>
              <Text>• {t('common.chartAccessibility')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ChartDemo;
