# ALT_LAS Arayüz Geliştirme Planı - Genişletilmiş Versiyon

Bu genişletilmiş plan, mevcut ALT_LAS arayüz geliştirme planına ek olarak, geri bildirimlerde belirtilen geliştirme alanlarını ve önerileri içermektedir.

## 1. UI Kütüphanesi Entegrasyonu

### 1.1 Material-UI Entegrasyonu

```tsx
// src/theme/mui-theme.ts
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import { useTheme } from '../hooks/useTheme';

// CSS değişkenlerini MUI temasına aktaran fonksiyon
export const createMuiTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? 'var(--color-primary)' : 'var(--color-primary-dark)',
      },
      secondary: {
        main: mode === 'light' ? 'var(--color-secondary)' : 'var(--color-secondary-dark)',
      },
      background: {
        default: mode === 'light' ? 'var(--color-background)' : 'var(--color-background-dark)',
        paper: mode === 'light' ? 'var(--color-surface)' : 'var(--color-surface-dark)',
      },
      text: {
        primary: mode === 'light' ? 'var(--color-text-primary)' : 'var(--color-text-primary-dark)',
        secondary: mode === 'light' ? 'var(--color-text-secondary)' : 'var(--color-text-secondary-dark)',
      },
    },
    typography: {
      fontFamily: 'var(--font-family)',
      fontSize: 16,
      h1: {
        fontSize: 'var(--font-size-xxl)',
        fontWeight: 'var(--font-weight-bold)',
      },
      h2: {
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-bold)',
      },
      h3: {
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-medium)',
      },
      h4: {
        fontSize: 'var(--font-size-md)',
        fontWeight: 'var(--font-weight-medium)',
      },
      button: {
        textTransform: 'none',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--border-radius-medium)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--border-radius-medium)',
            boxShadow: 'var(--shadow-small)',
          },
        },
      },
      // Diğer bileşen override'ları
    },
  });
};

// MUI ThemeProvider wrapper bileşeni
export const MaterialThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeMode } = useTheme();
  const theme = createMuiTheme(themeMode);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
```

### 1.2 Tailwind CSS Entegrasyonu

```js
// tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // 'media' veya 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          light: 'var(--color-primary)',
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          light: 'var(--color-secondary)',
          DEFAULT: 'var(--color-secondary)',
          dark: 'var(--color-secondary-dark)',
        },
        // Diğer renkler
      },
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif'],
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-md)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-xxl)',
      },
      borderRadius: {
        'sm': 'var(--border-radius-small)',
        DEFAULT: 'var(--border-radius-medium)',
        'lg': 'var(--border-radius-large)',
      },
      boxShadow: {
        'sm': 'var(--shadow-small)',
        DEFAULT: 'var(--shadow-medium)',
        'lg': 'var(--shadow-large)',
      },
    },
  },
  plugins: [],
};
```

```tsx
// src/components/common/Button/Button.tsx (Tailwind CSS versiyonu)
import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  type = 'button',
}) => {
  // Tailwind sınıflarını oluştur
  const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark focus-visible:ring-secondary',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary',
    text: 'bg-transparent text-primary hover:bg-primary/10 focus-visible:ring-primary p-0',
  };
  
  const sizeClasses = {
    small: 'text-sm py-1.5 px-3',
    medium: 'text-base py-2 px-4',
    large: 'text-lg py-2.5 px-5',
  };
  
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    variant !== 'text' ? sizeClasses[size] : '',
    disabledClasses,
    widthClasses,
  ].join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
```

## 2. Detaylı Modül Örnekleri

### 2.1 Görev Yönetimi Modülü

#### 2.1.1 Görev Oluşturma Formu

```tsx
// src/features/tasks/components/TaskForm.tsx
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import InputField from '../../../components/forms/InputField';
import SelectField from '../../../components/forms/SelectField';
import DatePickerField from '../../../components/forms/DatePickerField';
import Button from '../../../components/common/Button';
import { createTask, updateTask } from '../taskSlice';
import { selectUsers } from '../../users/usersSlice';
import { Task } from '../../../types';
import { TASK_STATUS, TASK_PRIORITY } from '../../../constants';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  initialValues?: Partial<Task>;
  isEditing?: boolean;
}

const TaskSchema = Yup.object().shape({
  title: Yup.string().required('Görev başlığı gerekli'),
  description: Yup.string(),
  status: Yup.string().oneOf(Object.values(TASK_STATUS)).required('Durum gerekli'),
  priority: Yup.string().oneOf(Object.values(TASK_PRIORITY)).required('Öncelik gerekli'),
  dueDate: Yup.date().nullable(),
  assigneeId: Yup.string().nullable(),
});

const TaskForm: React.FC<TaskFormProps> = ({
  initialValues = {
    title: '',
    description: '',
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: null,
    assigneeId: null,
  },
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);

  const handleSubmit = async (values: Partial<Task>) => {
    try {
      if (isEditing && initialValues.id) {
        await dispatch(updateTask({ id: initialValues.id, ...values }));
      } else {
        await dispatch(createTask(values));
      }
      navigate('/tasks');
    } catch (error) {
      console.error('Task save failed:', error);
    }
  };

  const statusOptions = Object.values(TASK_STATUS).map(status => ({
    value: status,
    label: t(`tasks.statusOptions.${status}`),
  }));

  const priorityOptions = Object.values(TASK_PRIORITY).map(priority => ({
    value: priority,
    label: t(`tasks.priorityOptions.${priority}`),
  }));

  const userOptions = [
    { value: '', label: t('common.none') },
    ...users.map(user => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    })),
  ];

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        {isEditing ? t('tasks.editTask') : t('tasks.createTask')}
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={TaskSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={styles.form}>
            <InputField name="title" label={t('tasks.taskTitle')} />
            
            <InputField
              name="description"
              label={t('tasks.taskDescription')}
              multiline
              rows={4}
            />
            
            <div className={styles.formRow}>
              <SelectField
                name="status"
                label={t('tasks.taskStatus')}
                options={statusOptions}
              />
              
              <SelectField
                name="priority"
                label={t('tasks.taskPriority')}
                options={priorityOptions}
              />
            </div>
            
            <div className={styles.formRow}>
              <DatePickerField
                name="dueDate"
                label={t('tasks.taskDueDate')}
              />
              
              <SelectField
                name="assigneeId"
                label={t('tasks.taskAssignee')}
                options={userOptions}
              />
            </div>
            
            <div className={styles.formActions}>
              <Button
                variant="outline"
                onClick={() => navigate('/tasks')}
                type="button"
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t('common.saving')
                  : isEditing
                    ? t('common.update')
                    : t('common.create')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TaskForm;
```

#### 2.1.2 Görev Detay Sayfası

```tsx
// src/features/tasks/pages/TaskDetailPage.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../../components/layout/MainLayout';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { fetchTaskById, deleteTask, selectTaskById, selectTaskLoading } from '../taskSlice';
import { formatDate } from '../../../utils/dateUtils';
import { TASK_STATUS, TASK_PRIORITY } from '../../../constants';
import { APP_ROUTES } from '../../../constants/routes';
import styles from './TaskDetailPage.module.css';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const task = useSelector(state => selectTaskById(state, id));
  const isLoading = useSelector(selectTaskLoading);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
  }, [dispatch, id]);
  
  const handleEdit = () => {
    navigate(`${APP_ROUTES.EDIT_TASK}/${id}`);
  };
  
  const handleDelete = async () => {
    if (window.confirm(t('tasks.confirmDelete'))) {
      try {
        await dispatch(deleteTask(id));
        navigate(APP_ROUTES.TASKS);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }
  
  if (!task) {
    return (
      <MainLayout>
        <div className={styles.notFound}>
          <h2>{t('tasks.taskNotFound')}</h2>
          <Button onClick={() => navigate(APP_ROUTES.TASKS)}>
            {t('tasks.backToTasks')}
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case TASK_STATUS.TODO:
        return 'gray';
      case TASK_STATUS.IN_PROGRESS:
        return 'blue';
      case TASK_STATUS.REVIEW:
        return 'orange';
      case TASK_STATUS.DONE:
        return 'green';
      default:
        return 'gray';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TASK_PRIORITY.LOW:
        return 'green';
      case TASK_PRIORITY.MEDIUM:
        return 'blue';
      case TASK_PRIORITY.HIGH:
        return 'orange';
      case TASK_PRIORITY.URGENT:
        return 'red';
      default:
        return 'gray';
    }
  };
  
  return (
    <MainLayout>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{task.title}</h1>
          <div className={styles.badges}>
            <Badge
              label={t(`tasks.statusOptions.${task.status}`)}
              color={getStatusColor(task.status)}
            />
            <Badge
              label={t(`tasks.priorityOptions.${task.priority}`)}
              color={getPriorityColor(task.priority)}
            />
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button variant="outline" onClick={handleEdit}>
            {t('common.edit')}
          </Button>
          <Button variant="outline" color="error" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </div>
      
      <Card className={styles.detailCard}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('tasks.taskDescription')}</h3>
          <p className={styles.description}>
            {task.description || t('tasks.noDescription')}
          </p>
        </div>
        
        <div className={styles.metaSection}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('tasks.taskDueDate')}</span>
            <span className={styles.metaValue}>
              {task.dueDate ? formatDate(task.dueDate) : t('common.none')}
            </span>
          </div>
          
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('tasks.taskAssignee')}</span>
            <span className={styles.metaValue}>
              {task.assignee ? task.assignee.name : t('common.unassigned')}
            </span>
          </div>
          
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('tasks.taskCreatedAt')}</span>
            <span className={styles.metaValue}>
              {formatDate(task.createdAt)}
            </span>
          </div>
          
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('tasks.taskUpdatedAt')}</span>
            <span className={styles.metaValue}>
              {formatDate(task.updatedAt)}
            </span>
          </div>
        </div>
      </Card>
      
      {/* Burada görev yorumları, aktivite geçmişi gibi ek bölümler eklenebilir */}
    </MainLayout>
  );
};

export default TaskDetailPage;
```

### 2.2 Raporlama ve Analiz Modülü

#### 2.2.1 Rapor Grafik Bileşeni

```tsx
// src/features/reports/components/ChartComponent.tsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useTheme } from '../../../hooks/useTheme';
import styles from './ChartComponent.module.css';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export type ChartType = 'line' | 'bar' | 'pie';

interface ChartComponentProps {
  type: ChartType;
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  options?: any;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  type,
  title,
  data,
  options = {},
}) => {
  const { theme, themeMode } = useTheme();
  
  // Tema renklerini kullan
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.colors.text.primary,
        },
      },
      title: {
        display: true,
        text: title,
        color: theme.colors.text.primary,
      },
      tooltip: {
        backgroundColor: themeMode === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        titleColor: themeMode === 'light' ? '#fff' : '#000',
        bodyColor: themeMode === 'light' ? '#fff' : '#000',
      },
    },
    scales: type !== 'pie' ? {
      x: {
        grid: {
          color: themeMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: theme.colors.text.primary,
        },
      },
      y: {
        grid: {
          color: themeMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: theme.colors.text.primary,
        },
      },
    } : undefined,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={mergedOptions} />;
      case 'bar':
        return <Bar data={data} options={mergedOptions} />;
      case 'pie':
        return <Pie data={data} options={mergedOptions} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };
  
  return (
    <div className={styles.chartContainer}>
      {renderChart()}
    </div>
  );
};

export default ChartComponent;
```

#### 2.2.2 Rapor Oluşturma Sayfası

```tsx
// src/features/reports/pages/ReportGeneratorPage.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../../components/layout/MainLayout';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import SelectField from '../../../components/forms/SelectField';
import DateRangePickerField from '../../../components/forms/DateRangePickerField';
import ChartComponent from '../components/ChartComponent';
import { generateReport, selectReportData, selectReportLoading } from '../reportsSlice';
import { REPORT_TYPES } from '../../../constants';
import styles from './ReportGeneratorPage.module.css';

const ReportSchema = Yup.object().shape({
  type: Yup.string().oneOf(Object.values(REPORT_TYPES)).required('Rapor türü gerekli'),
  startDate: Yup.date().required('Başlangıç tarihi gerekli'),
  endDate: Yup.date().min(
    Yup.ref('startDate'),
    'Bitiş tarihi başlangıç tarihinden sonra olmalı'
  ).required('Bitiş tarihi gerekli'),
});

const ReportGeneratorPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reportData = useSelector(selectReportData);
  const isLoading = useSelector(selectReportLoading);
  const [activeChartType, setActiveChartType] = useState<'line' | 'bar' | 'pie'>('bar');
  
  const handleSubmit = async (values: any) => {
    try {
      await dispatch(generateReport(values));
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };
  
  const reportTypeOptions = Object.values(REPORT_TYPES).map(type => ({
    value: type,
    label: t(`reports.types.${type}`),
  }));
  
  const chartTypeOptions = [
    { value: 'bar', label: t('reports.chartTypes.bar') },
    { value: 'line', label: t('reports.chartTypes.line') },
    { value: 'pie', label: t('reports.chartTypes.pie') },
  ];
  
  const handleExportCSV = () => {
    // CSV dışa aktarma mantığı
  };
  
  const handleExportPDF = () => {
    // PDF dışa aktarma mantığı
  };
  
  return (
    <MainLayout>
      <h1 className={styles.pageTitle}>{t('reports.generateReport')}</h1>
      
      <div className={styles.container}>
        <Card className={styles.formCard}>
          <h2 className={styles.cardTitle}>{t('reports.filters')}</h2>
          
          <Formik
            initialValues={{
              type: REPORT_TYPES.TASK_COMPLETION,
              startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
              endDate: new Date(),
            }}
            validationSchema={ReportSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className={styles.form}>
                <SelectField
                  name="type"
                  label={t('reports.reportType')}
                  options={reportTypeOptions}
                />
                
                <DateRangePickerField
                  startDateName="startDate"
                  endDateName="endDate"
                  startDateLabel={t('reports.startDate')}
                  endDateLabel={t('reports.endDate')}
                />
                
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  fullWidth
                >
                  {isSubmitting || isLoading
                    ? t('reports.generating')
                    : t('reports.generateReport')}
                </Button>
              </Form>
            )}
          </Formik>
        </Card>
        
        {reportData && (
          <Card className={styles.reportCard}>
            <div className={styles.reportHeader}>
              <h2 className={styles.cardTitle}>{t('reports.results')}</h2>
              
              <div className={styles.chartTypeSelector}>
                {chartTypeOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={activeChartType === option.value ? 'primary' : 'outline'}
                    size="small"
                    onClick={() => setActiveChartType(option.value as any)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className={styles.chartContainer}>
              <ChartComponent
                type={activeChartType}
                title={reportData.title}
                data={reportData.data}
              />
            </div>
            
            <div className={styles.exportActions}>
              <Button variant="outline" onClick={handleExportCSV}>
                {t('reports.exportCSV')}
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                {t('reports.exportPDF')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportGeneratorPage;
```

## 3. Test Yapılandırması ve Örnekleri

### 3.1 Jest ve React Testing Library Yapılandırması

```js
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
};
```

```tsx
// src/setupTests.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Test konfigürasyonu
configure({
  testIdAttribute: 'data-testid',
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));
```

### 3.2 Bileşen Test Örneği

```tsx
// src/components/common/Button/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    render(<Button>Test Button</Button>);
    
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button-primary');
    expect(button).toHaveClass('button-medium');
    expect(button).not.toHaveClass('button-fullWidth');
    expect(button).not.toBeDisabled();
  });
  
  test('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-primary');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-secondary');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-outline');
    
    rerender(<Button variant="text">Text</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-text');
  });
  
  test('applies size classes correctly', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-small');
    
    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-medium');
    
    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-large');
  });
  
  test('applies fullWidth class when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-fullWidth');
  });
  
  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('does not call onClick handler when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  test('renders with correct button type', () => {
    const { rerender } = render(<Button type="button">Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    
    rerender(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    
    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });
});
```

### 3.3 Redux Slice Test Örneği

```tsx
// src/features/auth/__tests__/authSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  logout,
  clearError,
  selectCurrentUser,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '../authSlice';
import authService from '../services/authService';

// Mock authService
jest.mock('../services/authService');

describe('Auth Slice', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    
    // localStorage mock'unu temizle
    localStorage.clear();
  });
  
  test('should handle initial state', () => {
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  });
  
  test('should handle login.pending', () => {
    store.dispatch({ type: login.pending.type });
    expect(store.getState().auth.loading).toBe(true);
    expect(store.getState().auth.error).toBe(null);
  });
  
  test('should handle login.fulfilled', () => {
    const user = { id: '1', name: 'Test User', email: 'test@example.com' };
    const token = 'test-token';
    
    store.dispatch({
      type: login.fulfilled.type,
      payload: { user, token },
    });
    
    expect(store.getState().auth.loading).toBe(false);
    expect(store.getState().auth.user).toEqual(user);
    expect(store.getState().auth.token).toBe(token);
    expect(store.getState().auth.error).toBe(null);
    expect(localStorage.getItem('token')).toBe(null); // Action'dan değil, thunk'tan gelir
  });
  
  test('should handle login.rejected', () => {
    const errorMessage = 'Invalid credentials';
    
    store.dispatch({
      type: login.rejected.type,
      payload: errorMessage,
    });
    
    expect(store.getState().auth.loading).toBe(false);
    expect(store.getState().auth.user).toBe(null);
    expect(store.getState().auth.token).toBe(null);
    expect(store.getState().auth.error).toBe(errorMessage);
  });
  
  test('should handle logout', () => {
    // İlk olarak kullanıcı giriş yapmış durumda olsun
    store.dispatch({
      type: login.fulfilled.type,
      payload: {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        token: 'test-token',
      },
    });
    
    // localStorage'a token ekleyelim
    localStorage.setItem('token', 'test-token');
    
    // Logout action'ını dispatch edelim
    store.dispatch(logout());
    
    // State ve localStorage kontrol edilir
    expect(store.getState().auth.user).toBe(null);
    expect(store.getState().auth.token).toBe(null);
    expect(localStorage.getItem('token')).toBe(null);
  });
  
  test('should handle clearError', () => {
    // İlk olarak bir hata durumu oluşturalım
    store.dispatch({
      type: login.rejected.type,
      payload: 'Test error',
    });
    
    // Hata durumunu kontrol edelim
    expect(store.getState().auth.error).toBe('Test error');
    
    // clearError action'ını dispatch edelim
    store.dispatch(clearError());
    
    // Hata durumunun temizlendiğini kontrol edelim
    expect(store.getState().auth.error).toBe(null);
  });
  
  test('should handle login thunk', async () => {
    const user = { id: '1', name: 'Test User', email: 'test@example.com' };
    const token = 'test-token';
    const credentials = { email: 'test@example.com', password: 'password' };
    
    // Mock authService.login
    (authService.login as jest.Mock).mockResolvedValue({ user, token });
    
    // login thunk'ını dispatch edelim
    await store.dispatch(login(credentials));
    
    // State ve localStorage kontrol edilir
    expect(store.getState().auth.user).toEqual(user);
    expect(store.getState().auth.token).toBe(token);
    expect(localStorage.getItem('token')).toBe(token);
  });
  
  test('should handle login thunk error', async () => {
    const credentials = { email: 'test@example.com', password: 'wrong-password' };
    const errorMessage = 'Invalid credentials';
    
    // Mock authService.login error
    (authService.login as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });
    
    // login thunk'ını dispatch edelim
    await store.dispatch(login(credentials));
    
    // State kontrol edilir
    expect(store.getState().auth.loading).toBe(false);
    expect(store.getState().auth.user).toBe(null);
    expect(store.getState().auth.token).toBe(null);
    expect(store.getState().auth.error).toBe(errorMessage);
  });
  
  test('selectors should work correctly', () => {
    const user = { id: '1', name: 'Test User', email: 'test@example.com' };
    const token = 'test-token';
    const error = 'Test error';
    
    // State'i hazırlayalım
    store.dispatch({
      type: login.fulfilled.type,
      payload: { user, token },
    });
    
    // Hata ekleyelim
    store.getState().auth.error = error;
    
    // Selector'ları test edelim
    expect(selectCurrentUser(store.getState())).toEqual(user);
    expect(selectAuthLoading(store.getState())).toBe(false);
    expect(selectAuthError(store.getState())).toBe(error);
    expect(selectIsAuthenticated(store.getState())).toBe(true);
    
    // Logout yapıp tekrar test edelim
    store.dispatch(logout());
    expect(selectCurrentUser(store.getState())).toBe(null);
    expect(selectIsAuthenticated(store.getState())).toBe(false);
  });
});
```

## 4. Animasyonlar ve Geçişler

### 4.1 Framer Motion Entegrasyonu

```tsx
// src/components/common/AnimatedCard/AnimatedCard.tsx
import React from 'react';
import { motion, Variants } from 'framer-motion';
import styles from './AnimatedCard.module.css';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      className={`${styles.card} ${className}`}
      initial="hidden"
      animate="visible"
      custom={delay}
      variants={cardVariants}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
```

### 4.2 Sayfa Geçiş Animasyonları

```tsx
// src/components/layout/PageTransition/PageTransition.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 10,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
```

```tsx
// src/routes/AnimatedRoutes.tsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';

// Auth Pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
// ... diğer sayfalar

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
          }
        />
        {/* ... diğer rotalar */}
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
```

## 5. Bildirim Merkezi

### 5.1 Toast Notification Sistemi

```tsx
// src/components/common/Toast/Toast.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };
  
  return (
    <motion.div
      className={`${styles.toast} ${styles[`toast-${type}`]}`}
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      layout
    >
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.message}>{message}</div>
      <button
        className={styles.closeButton}
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ✕
      </button>
    </motion.div>
  );
};

export default Toast;
```

### 5.2 Toast Context ve Hook

```tsx
// src/context/ToastContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Toast, { ToastType } from '../components/common/Toast/Toast';
import styles from './ToastContext.module.css';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Omit<ToastItem, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string };

interface ToastContextType {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastReducer = (state: ToastItem[], action: ToastAction): ToastItem[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, { id: uuidv4(), ...action.payload }];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  
  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    dispatch({ type: 'ADD_TOAST', payload: toast });
  };
  
  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
```

### 5.3 Bildirim Merkezi Bileşeni

```tsx
// src/components/layout/NotificationCenter/NotificationCenter.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../../common/Badge';
import {
  fetchNotifications,
  markAsRead,
  selectUnreadNotifications,
  selectAllNotifications,
} from '../../../features/notifications/notificationsSlice';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import styles from './NotificationCenter.module.css';

const NotificationCenter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const allNotifications = useSelector(selectAllNotifications);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    dispatch(fetchNotifications());
    
    // Polling for new notifications
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 60000); // Her dakika
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };
  
  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };
  
  const handleMarkAllAsRead = () => {
    unreadNotifications.forEach(notification => {
      dispatch(markAsRead(notification.id));
    });
  };
  
  const getLocale = () => {
    return i18n.language === 'tr' ? tr : enUS;
  };
  
  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: getLocale(),
    });
  };
  
  return (
    <div className={styles.notificationCenter}>
      <button
        className={styles.notificationButton}
        onClick={toggleNotificationCenter}
        aria-label={t('notifications.toggle')}
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadNotifications.length > 0 && (
          <Badge
            label={unreadNotifications.length.toString()}
            color="error"
            className={styles.badge}
          />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.notificationPanel}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className={styles.notificationHeader}>
              <h3>{t('notifications.title')}</h3>
              {unreadNotifications.length > 0 && (
                <button
                  className={styles.markAllButton}
                  onClick={handleMarkAllAsRead}
                >
                  {t('notifications.markAllAsRead')}
                </button>
              )}
            </div>
            
            <div className={styles.notificationList}>
              {allNotifications.length === 0 ? (
                <div className={styles.emptyState}>
                  {t('notifications.noNotifications')}
                </div>
              ) : (
                allNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      !notification.read ? styles.unread : ''
                    }`}
                  >
                    <div className={styles.notificationContent}>
                      <p className={styles.notificationMessage}>
                        {notification.message}
                      </p>
                      <span className={styles.notificationTime}>
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    {!notification.read && (
                      <button
                        className={styles.markReadButton}
                        onClick={() => handleMarkAsRead(notification.id)}
                        aria-label={t('notifications.markAsRead')}
                      >
                        ✓
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
```

## 6. Performans Optimizasyonu

### 6.1 React.memo, useMemo ve useCallback Kullanımı

```tsx
// src/components/common/DataTable/DataTable.tsx
import React, { useMemo, useCallback } from 'react';
import styles from './DataTable.module.css';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: keyof T) => void;
}

function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
}: DataTableProps<T>) {
  // Sıralama işlevi
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [data, sortKey, sortDirection]);
  
  // Sıralama işleyicisi
  const handleSort = useCallback(
    (key: keyof T) => {
      if (onSort) {
        onSort(key);
      }
    },
    [onSort]
  );
  
  // Satır tıklama işleyicisi
  const handleRowClick = useCallback(
    (item: T) => {
      if (onRowClick) {
        onRowClick(item);
      }
    },
    [onRowClick]
  );
  
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key.toString()}
                className={`${styles.tableHeader} ${
                  column.sortable ? styles.sortable : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                {column.header}
                {sortKey === column.key && (
                  <span className={styles.sortIcon}>
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map(item => (
            <tr
              key={keyExtractor(item)}
              className={styles.tableRow}
              onClick={() => handleRowClick(item)}
            >
              {columns.map(column => (
                <td key={column.key.toString()} className={styles.tableCell}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className={styles.emptyState}>No data available</div>
      )}
    </div>
  );
}

// React.memo ile sarmalayarak gereksiz yeniden render'ları önlüyoruz
export default React.memo(DataTable) as typeof DataTable;
```

### 6.2 React.lazy ve Suspense ile Code Splitting

```tsx
// src/routes/AppRoutes.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from './ProtectedRoute';

// Lazy-loaded components
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const TasksPage = lazy(() => import('../features/tasks/pages/TasksPage'));
const TaskDetailPage = lazy(() => import('../features/tasks/pages/TaskDetailPage'));
const CreateTaskPage = lazy(() => import('../features/tasks/pages/CreateTaskPage'));
const EditTaskPage = lazy(() => import('../features/tasks/pages/EditTaskPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage'));

const AppRoutes: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="page-loader"><LoadingSpinner /></div>}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute>
                <TaskDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/create"
            element={
              <ProtectedRoute>
                <CreateTaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/edit/:id"
            element={
              <ProtectedRoute>
                <EditTaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to dashboard or login */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* 404 - Not Found */}
          <Route path="*" element={<div>Sayfa Bulunamadı</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
```

Bu genişletilmiş plan, ALT_LAS arayüz geliştirme planına ek olarak, geri bildirimlerde belirtilen geliştirme alanlarını ve önerileri içermektedir. UI kütüphanesi entegrasyonu, detaylı modül örnekleri, test yapılandırması, animasyonlar ve bildirim merkezi gibi konular detaylı kod örnekleriyle ele alınmıştır.
