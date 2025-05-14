# ALT_LAS Desktop UI Bileşen Kütüphanesi

## İçindekiler

1. [Giriş](#giriş)
2. [Tasarım Sistemi](#tasarım-sistemi)
3. [Temel Bileşenler](#temel-bileşenler)
4. [Kompozisyon Bileşenleri](#kompozisyon-bileşenleri)
5. [Özellik Bileşenleri](#özellik-bileşenleri)
6. [Düzen Bileşenleri](#düzen-bileşenleri)
7. [Hook'lar](#hooklar)
8. [Yardımcı Fonksiyonlar](#yardımcı-fonksiyonlar)

## Giriş

ALT_LAS Desktop UI, Atomic Design prensibine dayalı bir bileşen kütüphanesi kullanır. Bu dokümantasyon, uygulamada kullanılan bileşenleri, hook'ları ve yardımcı fonksiyonları açıklar.

### Bileşen Organizasyonu

Bileşenler, aşağıdaki kategorilere ayrılmıştır:

- **Temel Bileşenler (Core)**: Atomik, yeniden kullanılabilir UI bileşenleri
- **Kompozisyon Bileşenleri (Composition)**: Temel bileşenlerden oluşan daha karmaşık bileşenler
- **Özellik Bileşenleri (Feature)**: Belirli bir özelliği veya iş mantığını uygulayan bileşenler
- **Düzen Bileşenleri (Layouts)**: Sayfa düzenini ve yapısını tanımlayan bileşenler

## Tasarım Sistemi

ALT_LAS Desktop UI, Chakra UI üzerine inşa edilmiş özel bir tema kullanır.

### Tema Yapılandırması

Tema, `src/renderer/styles/theme.ts` dosyasında tanımlanmıştır:

```typescript
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0080ff', // Ana marka rengi
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
    // Diğer renkler...
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  // Diğer tema ayarları...
});

export default theme;
```

### Tema Kullanımı

Bileşenlerde tema değişkenlerini kullanmak için:

```tsx
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

const MyComponent = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Box bg={bgColor} p={4} borderRadius="md">
      <Text color={textColor} fontSize="md">
        Merhaba Dünya!
      </Text>
    </Box>
  );
};
```

## Temel Bileşenler

Temel bileşenler, `src/renderer/components/core` dizininde bulunur.

### Button

Özelleştirilmiş buton bileşeni.

```tsx
import { Button } from '@/components/core/Button';

// Kullanım
<Button variant="primary" size="md" onClick={handleClick}>
  Tıkla
</Button>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link' | 'primary' | Buton varyantı |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'md' | Buton boyutu |
| isLoading | boolean | false | Yükleniyor durumu |
| isDisabled | boolean | false | Devre dışı durumu |
| leftIcon | ReactNode | - | Sol taraftaki simge |
| rightIcon | ReactNode | - | Sağ taraftaki simge |
| onClick | (event: React.MouseEvent) => void | - | Tıklama olayı işleyicisi |

### Input

Özelleştirilmiş input bileşeni.

```tsx
import { Input } from '@/components/core/Input';

// Kullanım
<Input
  label="E-posta"
  placeholder="E-posta adresinizi girin"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| label | string | - | Input etiketi |
| value | string | '' | Input değeri |
| placeholder | string | - | Placeholder metni |
| type | string | 'text' | Input tipi |
| error | string | - | Hata mesajı |
| isDisabled | boolean | false | Devre dışı durumu |
| isRequired | boolean | false | Zorunlu alan |
| onChange | (event: React.ChangeEvent<HTMLInputElement>) => void | - | Değişiklik olayı işleyicisi |

### Select

Özelleştirilmiş select bileşeni.

```tsx
import { Select } from '@/components/core/Select';

// Kullanım
<Select
  label="Kategori"
  options={[
    { value: 'design', label: 'Tasarım' },
    { value: 'development', label: 'Geliştirme' },
    { value: 'marketing', label: 'Pazarlama' },
  ]}
  value={category}
  onChange={(value) => setCategory(value)}
  error={errors.category}
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| label | string | - | Select etiketi |
| options | Array<{ value: string, label: string }> | [] | Seçenekler |
| value | string | '' | Seçili değer |
| placeholder | string | 'Seçiniz' | Placeholder metni |
| error | string | - | Hata mesajı |
| isDisabled | boolean | false | Devre dışı durumu |
| isRequired | boolean | false | Zorunlu alan |
| onChange | (value: string) => void | - | Değişiklik olayı işleyicisi |

### Checkbox

Özelleştirilmiş checkbox bileşeni.

```tsx
import { Checkbox } from '@/components/core/Checkbox';

// Kullanım
<Checkbox
  label="Beni hatırla"
  isChecked={rememberMe}
  onChange={(isChecked) => setRememberMe(isChecked)}
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| label | string | - | Checkbox etiketi |
| isChecked | boolean | false | Seçili durumu |
| isDisabled | boolean | false | Devre dışı durumu |
| onChange | (isChecked: boolean) => void | - | Değişiklik olayı işleyicisi |

### Modal

Özelleştirilmiş modal bileşeni.

```tsx
import { Modal } from '@/components/core/Modal';

// Kullanım
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Dosya Yükle"
  size="md"
>
  <ModalContent>
    {/* Modal içeriği */}
  </ModalContent>
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>İptal</Button>
    <Button variant="primary" onClick={handleUpload}>Yükle</Button>
  </ModalFooter>
</Modal>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| isOpen | boolean | false | Modal açık durumu |
| onClose | () => void | - | Kapatma olayı işleyicisi |
| title | string | - | Modal başlığı |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | 'md' | Modal boyutu |
| children | ReactNode | - | Modal içeriği |

### Card

Özelleştirilmiş kart bileşeni.

```tsx
import { Card } from '@/components/core/Card';

// Kullanım
<Card
  title="Proje Özeti"
  footer={<Button>Detaylar</Button>}
>
  <Text>Proje detayları burada görüntülenir.</Text>
</Card>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| title | string | - | Kart başlığı |
| subtitle | string | - | Kart alt başlığı |
| footer | ReactNode | - | Kart alt kısmı |
| children | ReactNode | - | Kart içeriği |

## Kompozisyon Bileşenleri

Kompozisyon bileşenleri, `src/renderer/components/composition` dizininde bulunur.

### FileUploader

Dosya yükleme bileşeni.

```tsx
import { FileUploader } from '@/components/composition/FileUploader';

// Kullanım
<FileUploader
  onUpload={handleUpload}
  maxFiles={5}
  maxSize={10 * 1024 * 1024} // 10MB
  acceptedFileTypes={['image/*', 'application/pdf']}
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| onUpload | (files: File[]) => void | - | Yükleme olayı işleyicisi |
| maxFiles | number | Infinity | Maksimum dosya sayısı |
| maxSize | number | Infinity | Maksimum dosya boyutu (byte) |
| acceptedFileTypes | string[] | [] | Kabul edilen dosya türleri |
| isDisabled | boolean | false | Devre dışı durumu |

### DataTable

Veri tablosu bileşeni.

```tsx
import { DataTable } from '@/components/composition/DataTable';

// Kullanım
<DataTable
  columns={[
    { id: 'name', header: 'Ad', accessor: 'name' },
    { id: 'email', header: 'E-posta', accessor: 'email' },
    { id: 'role', header: 'Rol', accessor: 'role' },
  ]}
  data={users}
  pagination={{ pageSize: 10 }}
  sorting={{ columns: ['name', 'email'] }}
  onRowClick={handleRowClick}
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| columns | Array<{ id: string, header: string, accessor: string }> | [] | Tablo sütunları |
| data | any[] | [] | Tablo verileri |
| pagination | { pageSize: number } | null | Sayfalama ayarları |
| sorting | { columns: string[] } | null | Sıralama ayarları |
| filtering | boolean | false | Filtreleme özelliği |
| onRowClick | (row: any) => void | - | Satır tıklama olayı işleyicisi |

### SearchBar

Arama çubuğu bileşeni.

```tsx
import { SearchBar } from '@/components/composition/SearchBar';

// Kullanım
<SearchBar
  placeholder="Dosya ara..."
  onSearch={handleSearch}
  advanced={true}
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| placeholder | string | 'Ara...' | Placeholder metni |
| onSearch | (query: string) => void | - | Arama olayı işleyicisi |
| advanced | boolean | false | Gelişmiş arama özelliği |
| initialValue | string | '' | Başlangıç değeri |

## Özellik Bileşenleri

Özellik bileşenleri, `src/renderer/components/feature` dizininde bulunur.

### ProjectList

Proje listesi bileşeni.

```tsx
import { ProjectList } from '@/components/feature/ProjectList';

// Kullanım
<ProjectList
  projects={projects}
  onProjectClick={handleProjectClick}
  onCreateProject={handleCreateProject}
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| projects | Project[] | [] | Projeler |
| onProjectClick | (project: Project) => void | - | Proje tıklama olayı işleyicisi |
| onCreateProject | () => void | - | Proje oluşturma olayı işleyicisi |
| isLoading | boolean | false | Yükleniyor durumu |

### TaskBoard

Görev tahtası bileşeni.

```tsx
import { TaskBoard } from '@/components/feature/TaskBoard';

// Kullanım
<TaskBoard
  tasks={tasks}
  onTaskClick={handleTaskClick}
  onTaskStatusChange={handleTaskStatusChange}
  onCreateTask={handleCreateTask}
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| tasks | Task[] | [] | Görevler |
| onTaskClick | (task: Task) => void | - | Görev tıklama olayı işleyicisi |
| onTaskStatusChange | (taskId: string, status: TaskStatus) => void | - | Görev durumu değişikliği olayı işleyicisi |
| onCreateTask | (status: TaskStatus) => void | - | Görev oluşturma olayı işleyicisi |
| isLoading | boolean | false | Yükleniyor durumu |

### FileExplorer

Dosya gezgini bileşeni.

```tsx
import { FileExplorer } from '@/components/feature/FileExplorer';

// Kullanım
<FileExplorer
  files={files}
  onFileClick={handleFileClick}
  onFolderClick={handleFolderClick}
  onUpload={handleUpload}
  onCreateFolder={handleCreateFolder}
  viewMode="grid"
/>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| files | File[] | [] | Dosyalar |
| onFileClick | (file: File) => void | - | Dosya tıklama olayı işleyicisi |
| onFolderClick | (folder: File) => void | - | Klasör tıklama olayı işleyicisi |
| onUpload | () => void | - | Yükleme olayı işleyicisi |
| onCreateFolder | () => void | - | Klasör oluşturma olayı işleyicisi |
| viewMode | 'list' \| 'grid' \| 'gallery' | 'list' | Görünüm modu |
| isLoading | boolean | false | Yükleniyor durumu |

## Düzen Bileşenleri

Düzen bileşenleri, `src/renderer/components/layouts` dizininde bulunur.

### MainLayout

Ana düzen bileşeni.

```tsx
import { MainLayout } from '@/components/layouts/MainLayout';

// Kullanım
<MainLayout>
  <Component {...pageProps} />
</MainLayout>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| children | ReactNode | - | Düzen içeriği |

### SidebarLayout

Kenar çubuğu düzeni bileşeni.

```tsx
import { SidebarLayout } from '@/components/layouts/SidebarLayout';

// Kullanım
<SidebarLayout
  sidebar={<Sidebar />}
  header={<Header />}
  footer={<Footer />}
>
  <Component {...pageProps} />
</SidebarLayout>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| sidebar | ReactNode | - | Kenar çubuğu içeriği |
| header | ReactNode | - | Üst kısım içeriği |
| footer | ReactNode | - | Alt kısım içeriği |
| children | ReactNode | - | Ana içerik |

### PanelLayout

Panel düzeni bileşeni.

```tsx
import { PanelLayout } from '@/components/layouts/PanelLayout';

// Kullanım
<PanelLayout
  leftPanel={<LeftPanel />}
  rightPanel={<RightPanel />}
  showLeftPanel={true}
  showRightPanel={true}
>
  <Component {...pageProps} />
</PanelLayout>
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| leftPanel | ReactNode | - | Sol panel içeriği |
| rightPanel | ReactNode | - | Sağ panel içeriği |
| showLeftPanel | boolean | true | Sol paneli göster/gizle |
| showRightPanel | boolean | true | Sağ paneli göster/gizle |
| children | ReactNode | - | Ana içerik |

## Hook'lar

Hook'lar, `src/renderer/hooks` dizininde bulunur.

### useAuth

Kimlik doğrulama hook'u.

```tsx
import { useAuth } from '@/hooks/useAuth';

// Kullanım
const { user, login, logout, isAuthenticated, isLoading } = useAuth();
```

#### Dönüş Değerleri

| Değer | Tip | Açıklama |
|-------|-----|----------|
| user | User \| null | Mevcut kullanıcı |
| login | (email: string, password: string) => Promise<User> | Giriş yapma fonksiyonu |
| logout | () => Promise<void> | Çıkış yapma fonksiyonu |
| isAuthenticated | boolean | Kimlik doğrulama durumu |
| isLoading | boolean | Yükleniyor durumu |

### useFiles

Dosya işlemleri hook'u.

```tsx
import { useFiles } from '@/hooks/useFiles';

// Kullanım
const { files, uploadFiles, downloadFile, deleteFiles, isLoading } = useFiles(folderId);
```

#### Parametreler

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| folderId | string | 'root' | Klasör ID'si |

#### Dönüş Değerleri

| Değer | Tip | Açıklama |
|-------|-----|----------|
| files | File[] | Dosyalar |
| uploadFiles | (files: File[], options?: UploadOptions) => Promise<File[]> | Dosya yükleme fonksiyonu |
| downloadFile | (fileId: string) => Promise<string> | Dosya indirme fonksiyonu |
| deleteFiles | (fileIds: string[]) => Promise<void> | Dosya silme fonksiyonu |
| isLoading | boolean | Yükleniyor durumu |

### useProjects

Proje işlemleri hook'u.

```tsx
import { useProjects } from '@/hooks/useProjects';

// Kullanım
const { projects, createProject, updateProject, deleteProject, isLoading } = useProjects();
```

#### Dönüş Değerleri

| Değer | Tip | Açıklama |
|-------|-----|----------|
| projects | Project[] | Projeler |
| createProject | (project: ProjectInput) => Promise<Project> | Proje oluşturma fonksiyonu |
| updateProject | (projectId: string, updates: Partial<ProjectInput>) => Promise<Project> | Proje güncelleme fonksiyonu |
| deleteProject | (projectId: string) => Promise<void> | Proje silme fonksiyonu |
| isLoading | boolean | Yükleniyor durumu |

### useTasks

Görev işlemleri hook'u.

```tsx
import { useTasks } from '@/hooks/useTasks';

// Kullanım
const { tasks, createTask, updateTask, deleteTask, isLoading } = useTasks(projectId);
```

#### Parametreler

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| projectId | string | - | Proje ID'si |

#### Dönüş Değerleri

| Değer | Tip | Açıklama |
|-------|-----|----------|
| tasks | Task[] | Görevler |
| createTask | (task: TaskInput) => Promise<Task> | Görev oluşturma fonksiyonu |
| updateTask | (taskId: string, updates: Partial<TaskInput>) => Promise<Task> | Görev güncelleme fonksiyonu |
| deleteTask | (taskId: string) => Promise<void> | Görev silme fonksiyonu |
| isLoading | boolean | Yükleniyor durumu |

## Yardımcı Fonksiyonlar

Yardımcı fonksiyonlar, `src/renderer/utils` dizininde bulunur.

### formatDate

Tarih formatlama fonksiyonu.

```tsx
import { formatDate } from '@/utils/formatDate';

// Kullanım
const formattedDate = formatDate(new Date(), 'dd.MM.yyyy');
```

### formatFileSize

Dosya boyutu formatlama fonksiyonu.

```tsx
import { formatFileSize } from '@/utils/formatFileSize';

// Kullanım
const formattedSize = formatFileSize(1024); // "1 KB"
```

### debounce

Debounce fonksiyonu.

```tsx
import { debounce } from '@/utils/debounce';

// Kullanım
const debouncedSearch = debounce((query) => {
  // Arama işlemi
}, 300);
```

### throttle

Throttle fonksiyonu.

```tsx
import { throttle } from '@/utils/throttle';

// Kullanım
const throttledScroll = throttle(() => {
  // Kaydırma işlemi
}, 100);
```
