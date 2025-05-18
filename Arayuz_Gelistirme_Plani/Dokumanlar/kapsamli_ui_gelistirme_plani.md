# ALT_LAS Projesi Kapsamlı Kullanıcı Arayüzü (UI) Geliştirme Planı

Bu belge, ALT_LAS projesi için yeni kullanıcı arayüzü (UI) geliştirme planını kapsamlı bir şekilde sunmaktadır. Plan, tüm personaların görev ve sorumluluklarını makro, mikro ve atlas seviyesinde detaylandırmakta ve Yönetici Ofisi kurallarına tam uyum sağlamaktadır.

## Yönetim Özeti

ALT_LAS projesi için yeni kullanıcı arayüzü (UI) geliştirme planı, modern ve kullanıcı dostu bir arayüz oluşturmayı hedeflemektedir. Bu plan, aşağıdaki ana bileşenleri içermektedir:

1. **Genel Mimari ve Entegrasyon Planlaması**: Mevcut ALT_LAS servisleriyle entegrasyon noktalarının belirlenmesi ve yeni UI mimarisinin tasarlanması.
2. **Tasarım Sistemi ve Prototip Geliştirme**: Tutarlı bir kullanıcı deneyimi sağlamak için tasarım sistemi oluşturulması ve interaktif prototiplerin geliştirilmesi.
3. **Frontend Framework ve Kütüphane Seçimleri**: Uygun teknolojilerin seçilmesi ve versiyon politikalarının belirlenmesi.
4. **CI/CD Pipeline ve Otomasyon**: Sürekli entegrasyon ve dağıtım süreçlerinin otomatikleştirilmesi.
5. **Chat Sekmesi Geliştirmesi**: Örnek bir modül olarak chat sekmesinin tasarlanması, geliştirilmesi ve test edilmesi.

Bu plan, 7 teknik persona (Proje Yöneticisi, UI/UX Tasarımcısı, Kıdemli Frontend Geliştirici, Kıdemli Backend Geliştirici, Yazılım Mimarı, QA Mühendisi ve DevOps Mühendisi) için detaylı görev kırılımları içermektedir.

## Personalar ve Sorumluluklar

### Proje Yöneticisi (AI)
- Görev koordinasyonu ve takibi
- Kilometre taşı onay süreçlerinin yönetimi
- Paydaş iletişimi ve raporlama
- Oylama mekanizmalarının koordinasyonu
- Giriş/çıkış kriterlerinin tanımlanması

### UI/UX Tasarımcısı (Elif Aydın)
- Kullanıcı ihtiyaç analizi
- Tasarım konseptleri ve wireframe'ler
- Tasarım sistemi oluşturulması
- İnteraktif prototip hazırlama
- Kullanılabilirlik testleri
- Chat sekmesi detaylı tasarımı

### Kıdemli Frontend Geliştirici (Zeynep Aydın)
- Bileşen kütüphanesi geliştirme
- Frontend framework ve kütüphane versiyon politikaları
- Chat sekmesi frontend geliştirmesi
- Frontend birim testleri
- Backend entegrasyonu (frontend tarafı)

### Kıdemli Backend Geliştirici (Ahmet Çelik)
- API endpointleri ve veri modelleri tanımlama
- Backend entegrasyonu
- Backend birim ve entegrasyon testleri
- Real-time iletişim altyapısı (WebSocket/SSE)

### Yazılım Mimarı (Elif Yılmaz)
- Genel mimari planlama
- ALT_LAS servisleriyle entegrasyon noktaları
- Kimlik doğrulama ve yetkilendirme mekanizmaları
- Frontend framework versiyon politikaları (danışman)
- API kontratları (danışman)

### QA Mühendisi (Ayşe Kaya)
- Kullanıcı testleri (gözlemci)
- Kabul kriterleri tanımlama
- Test senaryoları oluşturma
- Birim ve entegrasyon testleri
- Kullanılabilirlik ve kullanıcı kabul testleri

### DevOps Mühendisi (Can Tekin)
- CI/CD pipeline tasarımları
- Otomasyon planı
- Test/Staging ortamı yapılandırması
- Dağıtım (deployment) stratejileri

## Kilometre Taşları ve Zaman Çizelgesi

### Kilometre Taşı 0 (KM0): Temel Hazırlık ve Planlama
- **Tahmini Süre**: 8 gün
- **Ana Çıktılar**:
  - Arayüzün genel mimarisi ve entegrasyon noktaları
  - Tasarım sistemi ve stil rehberi
  - İnteraktif prototip ve kullanıcı test sonuçları
  - Frontend framework ve kütüphane seçimleri
  - CI/CD pipeline tasarımı

### Kilometre Taşı 1 (KM1): Chat Sekmesi Geliştirmesi
- **Tahmini Süre**: 10 gün
- **Ana Çıktılar**:
  - Chat sekmesi detaylı tasarımı
  - Chat sekmesi backend API ve veri modelleri
  - Chat sekmesi frontend geliştirmesi
  - Chat sekmesi test ve onayı

## Detaylı Görev Planları

Her persona için detaylı görev planları ayrı dokümanlarda sunulmuştur:

1. [Proje Yöneticisi Görev Planı](/Arayuz_Gelistirme_Plani/Persona_Planlari/proje_yoneticisi_gorev_plani.md)
2. [UI/UX Tasarımcısı Görev Planı](/Arayuz_Gelistirme_Plani/Persona_Planlari/ui_ux_tasarimcisi_gorev_plani.md)
3. [Kıdemli Frontend Geliştirici Görev Planı](/Arayuz_Gelistirme_Plani/Persona_Planlari/kidemli_frontend_gelistirici_gorev_plani.md)
4. [Kıdemli Backend Geliştirici Görev Planı](/Arayuz_Gelistirme_Plani/Persona_Planlari/kidemli_backend_gelistirici_gorev_plani.md)
5. [Yazılım Mimarı Görev Planı](/Arayuz_Gelistirme_Plani/Persona_Planlari/yazilim_mimari_gorev_plani.md)
6. [QA Mühendisi Görev Planı](/Arayuz_Gelistirme_Plani/Persona_Planlari/qa_muhendisi_gorev_plani.md)
7. [DevOps Mühendisi Görev Planı](/Arayuz_Gelistirme_Plani/Persona_Planlari/devops_muhendisi_gorev_plani.md)

## Yönetici Ofisi Kurallarına Uyum

Bu plan, Yönetici Ofisi kurallarına tam uyum sağlamaktadır. Tüm görevler makro, mikro ve atlas seviyesinde detaylandırılmış, sorumluluklar, zaman tahminleri, çıktılar, bağımlılıklar, dokümantasyon gereksinimleri, onay süreçleri ve test/doğrulama adımları açıkça belirtilmiştir.

Detaylı uyum kontrolü için [Yönetici Ofisi Kuralları Uyum Kontrolü](/Arayuz_Gelistirme_Plani/Dokumanlar/yonetici_ofisi_kurallari_uyum_kontrolu.md) dokümanına bakınız.

## Riskler ve Azaltma Stratejileri

1. **Entegrasyon Zorlukları**
   - **Risk**: Mevcut ALT_LAS servisleriyle entegrasyon sorunları
   - **Azaltma**: Erken prototipleme ve API kontrat testleri

2. **Teknoloji Seçimi Riskleri**
   - **Risk**: Seçilen frontend framework ve kütüphanelerin uyumsuzluğu
   - **Azaltma**: Kapsamlı değerlendirme ve POC (Proof of Concept) çalışmaları

3. **Zaman Aşımı Riskleri**
   - **Risk**: Karmaşık özelliklerin tahmin edilenden uzun sürmesi
   - **Azaltma**: Modüler yaklaşım ve önceliklendirme

4. **Kullanıcı Kabul Riskleri**
   - **Risk**: Yeni arayüzün kullanıcılar tarafından benimsenmemesi
   - **Azaltma**: Erken ve sık kullanıcı testleri, geri bildirim döngüleri

## Teknik Uygulama Detayları

Bu bölüm, ALT_LAS arayüz geliştirme planının teknik uygulama detaylarını içermektedir. Aşağıdaki başlıklar, modern web geliştirme standartlarına uygun olarak hazırlanmış kapsamlı teknik detayları sunmaktadır.

### 1. UI Kütüphanesi Entegrasyonu

#### 1.1 Material-UI Entegrasyonu

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

#### 1.2 Tailwind CSS Entegrasyonu

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

### 2. Detaylı Modül Örnekleri

#### 2.1 Görev Yönetimi Modülü

##### 2.1.1 Görev Oluşturma Formu

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

#### 2.2 Raporlama ve Analiz Modülü

##### 2.2.1 Rapor Grafik Bileşeni

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

### 3. Test Yapılandırması ve Örnekleri

#### 3.1 Jest ve React Testing Library Yapılandırması

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

#### 3.2 Bileşen Test Örneği

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
  
  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 4. Animasyonlar ve Geçişler

#### 4.1 Framer Motion Entegrasyonu

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

#### 4.2 Sayfa Geçiş Animasyonları

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

### 5. Bildirim Merkezi

#### 5.1 Toast Notification Sistemi

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

### 6. Performans Optimizasyonu

#### 6.1 React.memo, useMemo ve useCallback Kullanımı

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

#### 6.2 React.lazy ve Suspense ile Code Splitting

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
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const TasksPage = lazy(() => import('../features/tasks/pages/TasksPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));

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
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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

## Sonuç

Bu kapsamlı plan, ALT_LAS projesi için yeni kullanıcı arayüzü (UI) geliştirme sürecini detaylı bir şekilde tanımlamaktadır. Tüm personaların görev ve sorumlulukları, zaman çizelgesi, çıktılar, bağımlılıklar ve riskler açıkça belirtilmiştir. Plan, Yönetici Ofisi kurallarına tam uyum sağlamakta ve projenin başarılı bir şekilde yürütülmesi için gerekli tüm detayları içermektedir.

Eklenen teknik uygulama detayları, modern web geliştirme standartlarına uygun olarak hazırlanmış ve arayüz geliştirme sürecinde kullanılacak teknolojilerin, bileşenlerin ve yaklaşımların kapsamlı örneklerini sunmaktadır. Bu detaylar, geliştirme ekibinin ALT_LAS arayüzünü daha verimli ve etkili bir şekilde oluşturmasına yardımcı olacaktır.
