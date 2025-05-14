# ALT_LAS UI Bileşenleri Dokümantasyonu

Bu dokümantasyon, ALT_LAS uygulamasının UI bileşenlerini, kullanımlarını ve API'lerini detaylı olarak açıklamaktadır.

## İçindekiler

1. [Temel Bileşenler](#temel-bileşenler)
   - [Button](#button)
   - [IconButton](#iconbutton)
   - [Input](#input)
   - [Card](#card)
2. [Kompozisyon Bileşenleri](#kompozisyon-bileşenleri)
   - [Panel](#panel)
   - [SplitView](#splitview)
   - [DropZone](#dropzone)
3. [Özellik Bileşenleri](#özellik-bileşenleri)
   - [FileManager](#filemanager)
   - [TaskManager](#taskmanager)
   - [NotificationCenter](#notificationcenter)
   - [FocusMode](#focusmode)
   - [SmartSelection](#smartselection)
   - [ScreenRecorder](#screenrecorder)
4. [Düzen Bileşenleri](#düzen-bileşenleri)
   - [LayoutManager](#layoutmanager)
5. [Stil ve Tema](#stil-ve-tema)
   - [Tema Sistemi](#tema-sistemi)
   - [Yüksek Kontrast Tema](#yüksek-kontrast-tema)
   - [Animasyonlar](#animasyonlar)
   - [Responsive Tasarım](#responsive-tasarım)
6. [En İyi Uygulamalar](#en-iyi-uygulamalar)
   - [Erişilebilirlik](#erişilebilirlik)
   - [Performans Optimizasyonu](#performans-optimizasyonu)
   - [Bileşen Kompozisyonu](#bileşen-kompozisyonu)

---

## Temel Bileşenler

### Button

Standart buton bileşeni, kullanıcı etkileşimleri için temel bir UI öğesidir.

#### Kullanım

```tsx
import { Button } from '@/components/core/Button';

function Example() {
  return (
    <Button 
      variant="primary" 
      size="md" 
      onClick={() => console.log('Tıklandı!')}
      aria-label="Örnek Buton"
    >
      Tıkla Bana
    </Button>
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` | Butonun görsel stili |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Butonun boyutu |
| `isLoading` | `boolean` | `false` | Yükleniyor durumunu gösterir |
| `isDisabled` | `boolean` | `false` | Butonu devre dışı bırakır |
| `leftIcon` | `ReactNode` | - | Butonun sol tarafında gösterilecek ikon |
| `rightIcon` | `ReactNode` | - | Butonun sağ tarafında gösterilecek ikon |
| `onClick` | `(event: React.MouseEvent) => void` | - | Tıklama olayı işleyicisi |

#### Erişilebilirlik

- Butonlar, `aria-label` veya içerik metni ile erişilebilir etiketlere sahiptir
- Klavye ile odaklanabilir ve Enter/Space tuşları ile etkinleştirilebilir
- Yükleniyor durumunda `aria-busy` özelliği otomatik olarak ayarlanır
- Devre dışı durumunda `aria-disabled` özelliği otomatik olarak ayarlanır

### IconButton

Sadece ikon içeren buton bileşeni.

#### Kullanım

```tsx
import { IconButton } from '@/components/core/IconButton';

function Example() {
  return (
    <IconButton
      aria-label="Dosyayı Sil"
      icon={<TrashIcon />}
      variant="outline"
      colorScheme="red"
      onClick={handleDelete}
    />
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `aria-label` | `string` | **Gerekli** | Butonun erişilebilir etiketi (zorunlu) |
| `icon` | `ReactNode` | **Gerekli** | Gösterilecek ikon |
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'link'` | `'solid'` | Butonun görsel stili |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Butonun boyutu |
| `isRound` | `boolean` | `false` | Yuvarlak şekil için |
| `colorScheme` | `string` | `'primary'` | Renk şeması |

#### Erişilebilirlik

- `aria-label` prop'u **zorunludur** ve butonun amacını açıkça belirtmelidir
- Klavye ile odaklanabilir ve Enter/Space tuşları ile etkinleştirilebilir
- Yüksek kontrast modunda otomatik olarak uygun renk kontrastı sağlar

### Input

Metin girişi için kullanılan bileşen.

#### Kullanım

```tsx
import { Input } from '@/components/core/Input';

function Example() {
  const [value, setValue] = useState('');
  
  return (
    <Input
      id="email"
      label="E-posta Adresi"
      placeholder="ornek@email.com"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      type="email"
      isRequired
    />
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `id` | `string` | **Gerekli** | Input için benzersiz ID |
| `label` | `string` | - | Input etiketi |
| `value` | `string` | - | Input değeri |
| `onChange` | `(event: React.ChangeEvent<HTMLInputElement>) => void` | - | Değer değişikliği olayı işleyicisi |
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| ...` | `'text'` | Input tipi |
| `placeholder` | `string` | - | Placeholder metni |
| `isDisabled` | `boolean` | `false` | Input'u devre dışı bırakır |
| `isReadOnly` | `boolean` | `false` | Input'u salt okunur yapar |
| `isRequired` | `boolean` | `false` | Input'u zorunlu yapar |
| `isInvalid` | `boolean` | `false` | Hatalı durumu gösterir |
| `errorMessage` | `string` | - | Hata mesajı |
| `helperText` | `string` | - | Yardımcı metin |

#### Erişilebilirlik

- Label ve input, `id` ile ilişkilendirilmiştir
- Hata durumları `aria-invalid` ve `aria-describedby` ile belirtilir
- Yardımcı metin ve hata mesajları ekran okuyucular tarafından okunabilir

### Card

İçeriği gruplamak için kullanılan kart bileşeni.

#### Kullanım

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/core/Card';

function Example() {
  return (
    <Card>
      <CardHeader>Başlık</CardHeader>
      <CardBody>
        <p>Kart içeriği burada yer alır.</p>
      </CardBody>
      <CardFooter>
        <Button>Tamam</Button>
      </CardFooter>
    </Card>
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `variant` | `'elevated' \| 'outline' \| 'filled' \| 'unstyled'` | `'elevated'` | Kart stili |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Kart boyutu |
| `direction` | `'column' \| 'row'` | `'column'` | İçerik yönü |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'start'` | Dikey hizalama |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between'` | `'start'` | Yatay hizalama |

#### Erişilebilirlik

- Kart bileşeni, `role="region"` özelliği ile bir bölge olarak işaretlenir
- CardHeader, `aria-labelledby` ile kart içeriğini etiketler

---

## Kompozisyon Bileşenleri

### Panel

Sürüklenebilir ve yeniden boyutlandırılabilir panel bileşeni.

#### Kullanım

```tsx
import { Panel } from '@/components/composition/Panel';

function Example() {
  return (
    <Panel 
      title="Dosya Gezgini"
      isResizable
      defaultSize={{ width: '300px', height: '100%' }}
      minSize={{ width: '200px', height: '100px' }}
    >
      <FileExplorer />
    </Panel>
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `title` | `string` | - | Panel başlığı |
| `isResizable` | `boolean` | `false` | Yeniden boyutlandırma özelliği |
| `isDraggable` | `boolean` | `false` | Sürükleme özelliği |
| `isCollapsible` | `boolean` | `false` | Daraltma özelliği |
| `isCollapsed` | `boolean` | `false` | Daraltılmış durumu |
| `defaultSize` | `{ width?: string, height?: string }` | - | Varsayılan boyut |
| `minSize` | `{ width?: string, height?: string }` | - | Minimum boyut |
| `maxSize` | `{ width?: string, height?: string }` | - | Maksimum boyut |
| `onResize` | `(size: { width: number, height: number }) => void` | - | Boyut değişikliği olayı işleyicisi |
| `onDragStart` | `() => void` | - | Sürükleme başlangıcı olayı işleyicisi |
| `onDragEnd` | `(position: { x: number, y: number }) => void` | - | Sürükleme sonu olayı işleyicisi |

#### Erişilebilirlik

- Panel başlığı, `aria-labelledby` ile panel içeriğini etiketler
- Yeniden boyutlandırma ve sürükleme kontrolleri, uygun `aria-*` özellikleri ile işaretlenir
- Klavye ile kontrol edilebilir (ok tuşları ile yeniden boyutlandırma)

### SplitView

Bölünmüş görünüm sağlayan bileşen.

#### Kullanım

```tsx
import { SplitView, SplitViewPane } from '@/components/composition/SplitView';

function Example() {
  return (
    <SplitView direction="horizontal" defaultSizes={[30, 70]}>
      <SplitViewPane minSize={200}>
        <Sidebar />
      </SplitViewPane>
      <SplitViewPane>
        <MainContent />
      </SplitViewPane>
    </SplitView>
  );
}
```

#### Props (SplitView)

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Bölme yönü |
| `defaultSizes` | `number[]` | - | Varsayılan boyut yüzdeleri |
| `minSize` | `number \| number[]` | `50` | Minimum boyut (piksel) |
| `maxSize` | `number \| number[]` | - | Maksimum boyut (piksel) |
| `gutterSize` | `number` | `4` | Ayırıcı çizgi kalınlığı |
| `onDragEnd` | `(sizes: number[]) => void` | - | Sürükleme sonu olayı işleyicisi |

#### Props (SplitViewPane)

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `minSize` | `number` | - | Bu panel için minimum boyut |
| `maxSize` | `number` | - | Bu panel için maksimum boyut |
| `defaultSize` | `number` | - | Bu panel için varsayılan boyut |

#### Erişilebilirlik

- Ayırıcı çizgiler, `role="separator"` ile işaretlenir
- Klavye ile kontrol edilebilir (ok tuşları ile yeniden boyutlandırma)
- Ayırıcı çizgiler, `aria-valuenow`, `aria-valuemin`, ve `aria-valuemax` özellikleri ile işaretlenir

### DropZone

Dosya sürükle-bırak alanı bileşeni.

#### Kullanım

```tsx
import { DropZone } from '@/components/composition/DropZone';

function Example() {
  const handleDrop = (files) => {
    console.log('Bırakılan dosyalar:', files);
  };
  
  return (
    <DropZone
      onDrop={handleDrop}
      accept=".jpg,.png,.pdf"
      maxSize={5 * 1024 * 1024} // 5MB
      multiple
    >
      <p>Dosyaları buraya sürükleyin veya tıklayarak seçin</p>
    </DropZone>
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `onDrop` | `(files: File[]) => void` | **Gerekli** | Dosya bırakma olayı işleyicisi |
| `accept` | `string` | - | Kabul edilen dosya türleri |
| `multiple` | `boolean` | `false` | Çoklu dosya seçimi |
| `maxSize` | `number` | - | Maksimum dosya boyutu (byte) |
| `minSize` | `number` | - | Minimum dosya boyutu (byte) |
| `disabled` | `boolean` | `false` | Devre dışı durumu |
| `onDropRejected` | `(rejectedFiles: { file: File, errors: Error[] }[]) => void` | - | Reddedilen dosyalar için olay işleyicisi |
| `onDropAccepted` | `(files: File[]) => void` | - | Kabul edilen dosyalar için olay işleyicisi |

#### Erişilebilirlik

- `role="button"` ve `tabIndex={0}` ile klavye erişilebilirliği sağlar
- Dosya seçimi için gizli bir input kullanır
- Durum değişiklikleri ekran okuyucular için duyurulur

---

## Özellik Bileşenleri

### FileManager

Dosya yönetimi için kullanılan bileşen.

#### Kullanım

```tsx
import { FileManager } from '@/components/feature/FileManager';

function Example() {
  return (
    <FileManager
      initialPath="/home/user/documents"
      onFileSelect={handleFileSelect}
      allowMultiSelect
      showHiddenFiles={false}
    />
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `initialPath` | `string` | `'/'` | Başlangıç dizini |
| `onFileSelect` | `(files: FileInfo[]) => void` | - | Dosya seçimi olayı işleyicisi |
| `onDirectoryChange` | `(path: string) => void` | - | Dizin değişikliği olayı işleyicisi |
| `allowMultiSelect` | `boolean` | `false` | Çoklu dosya seçimi |
| `showHiddenFiles` | `boolean` | `false` | Gizli dosyaları gösterme |
| `filter` | `(file: FileInfo) => boolean` | - | Dosya filtreleme fonksiyonu |
| `sortBy` | `'name' \| 'size' \| 'type' \| 'modified'` | `'name'` | Sıralama kriteri |
| `sortDirection` | `'asc' \| 'desc'` | `'asc'` | Sıralama yönü |
| `viewMode` | `'list' \| 'grid' \| 'details'` | `'details'` | Görünüm modu |

#### Erişilebilirlik

- Dosya listesi, `role="listbox"` veya `role="grid"` ile işaretlenir
- Dosya öğeleri, `role="option"` veya `role="row"` ile işaretlenir
- Klavye navigasyonu (ok tuşları, Enter, Space) desteklenir
- Dosya türleri ve boyutları ekran okuyucular için erişilebilir şekilde sunulur

### TaskManager

Görev yönetimi için kullanılan bileşen.

#### Kullanım

```tsx
import { TaskManager } from '@/components/feature/TaskManager';

function Example() {
  return (
    <TaskManager
      tasks={tasks}
      onTaskCreate={handleTaskCreate}
      onTaskUpdate={handleTaskUpdate}
      onTaskDelete={handleTaskDelete}
      groupBy="status"
    />
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `tasks` | `Task[]` | `[]` | Görevler listesi |
| `onTaskCreate` | `(task: Omit<Task, 'id'>) => void` | - | Görev oluşturma olayı işleyicisi |
| `onTaskUpdate` | `(id: string, updates: Partial<Task>) => void` | - | Görev güncelleme olayı işleyicisi |
| `onTaskDelete` | `(id: string) => void` | - | Görev silme olayı işleyicisi |
| `onTaskMove` | `(id: string, destination: string) => void` | - | Görev taşıma olayı işleyicisi |
| `groupBy` | `'status' \| 'priority' \| 'assignee' \| 'dueDate'` | `'status'` | Gruplama kriteri |
| `sortBy` | `'createdAt' \| 'updatedAt' \| 'priority' \| 'dueDate'` | `'updatedAt'` | Sıralama kriteri |
| `sortDirection` | `'asc' \| 'desc'` | `'desc'` | Sıralama yönü |
| `filter` | `(task: Task) => boolean` | - | Görev filtreleme fonksiyonu |

#### Erişilebilirlik

- Görev listesi, `role="list"` ile işaretlenir
- Görev öğeleri, `role="listitem"` ile işaretlenir
- Görev durumu ve önceliği ekran okuyucular için erişilebilir şekilde sunulur
- Sürükle-bırak işlemleri için klavye alternatifleri sağlanır

### NotificationCenter

Bildirim merkezi bileşeni.

#### Kullanım

```tsx
import { NotificationCenter } from '@/components/feature/NotificationCenter';

function Example() {
  return (
    <NotificationCenter
      initialNotifications={notifications}
      onNotificationRead={handleNotificationRead}
      onNotificationDismiss={handleNotificationDismiss}
      onClearAll={handleClearAll}
    />
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `initialNotifications` | `Notification[]` | `[]` | Başlangıç bildirimleri |
| `onNotificationRead` | `(id: string) => void` | - | Bildirim okundu olayı işleyicisi |
| `onNotificationDismiss` | `(id: string) => void` | - | Bildirim kapatma olayı işleyicisi |
| `onNotificationAction` | `(id: string, actionIndex: number) => void` | - | Bildirim eylemi olayı işleyicisi |
| `onClearAll` | `() => void` | - | Tüm bildirimleri temizleme olayı işleyicisi |
| `onClearRead` | `() => void` | - | Okunmuş bildirimleri temizleme olayı işleyicisi |

#### Notification Tipi

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task';
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  read: boolean;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}
```

#### Erişilebilirlik

- Bildirim merkezi, `role="dialog"` ve `aria-modal="true"` ile işaretlenir
- Bildirimler, `role="listitem"` ile işaretlenir
- Bildirim türleri ve öncelikleri ekran okuyucular için erişilebilir şekilde sunulur
- Bildirim eylemleri, uygun `aria-label` özellikleri ile işaretlenir

### FocusMode

Odaklanma modu bileşeni.

#### Kullanım

```tsx
import { FocusMode } from '@/components/feature/FocusMode';

function Example() {
  return <FocusMode />;
}
```

#### Props

FocusMode bileşeni, harici davranışı kontrol etmek için isteğe bağlı prop'lar alabilir.

#### Erişilebilirlik

- Odaklanma modu kontrolü, uygun `aria-label` özellikleri ile işaretlenir
- Zamanlayıcı durumu ekran okuyucular için erişilebilir şekilde sunulur
- Klavye ile kontrol edilebilir

### SmartSelection

Akıllı nesne seçimi bileşeni.

#### Kullanım

```tsx
import { SmartSelection } from '@/components/feature/SmartSelection';

function Example() {
  const handleSelectObject = (object) => {
    console.log('Seçilen nesne:', object);
  };
  
  return (
    <SmartSelection
      onActivate={handleActivate}
      onSelectObject={handleSelectObject}
      onRefineSelection={handleRefineSelection}
    />
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `onActivate` | `() => Promise<DetectedObject[]>` | - | Seçim modunu etkinleştirme olayı işleyicisi |
| `onSelectObject` | `(object: DetectedObject) => void` | - | Nesne seçimi olayı işleyicisi |
| `onRefineSelection` | `(object: DetectedObject) => void` | - | Seçim iyileştirme olayı işleyicisi |

#### DetectedObject Tipi

```typescript
interface DetectedObject {
  id: string;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  confidence?: number;
}
```

#### Erişilebilirlik

- Seçim kontrolü, uygun `aria-label` özellikleri ile işaretlenir
- Algılanan nesneler, `role="button"` ve uygun `aria-label` özellikleri ile işaretlenir
- Klavye ile kontrol edilebilir

### ScreenRecorder

Ekran kaydı bileşeni.

#### Kullanım

```tsx
import { ScreenRecorder } from '@/components/feature/ScreenRecorder';

function Example() {
  return (
    <ScreenRecorder
      onStartRecording={handleStartRecording}
      onStopRecording={handleStopRecording}
      onPauseRecording={handlePauseRecording}
      onResumeRecording={handleResumeRecording}
      onGetSources={handleGetSources}
    />
  );
}
```

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `onStartRecording` | `(mode: RecordingMode, audioSource: AudioSource) => Promise<void>` | - | Kayıt başlatma olayı işleyicisi |
| `onStopRecording` | `() => Promise<string \| null>` | - | Kayıt durdurma olayı işleyicisi |
| `onPauseRecording` | `() => Promise<void>` | - | Kayıt duraklatma olayı işleyicisi |
| `onResumeRecording` | `() => Promise<void>` | - | Kayıt devam ettirme olayı işleyicisi |
| `onGetSources` | `() => Promise<{ windows: { id: string; name: string }[], screens: { id: string; name: string }[] }>` | - | Kaynakları alma olayı işleyicisi |

#### Erişilebilirlik

- Kayıt kontrolü, uygun `aria-label` özellikleri ile işaretlenir
- Kayıt durumu ekran okuyucular için erişilebilir şekilde sunulur
- Klavye ile kontrol edilebilir

---

## Düzen Bileşenleri

### LayoutManager

Düzen yönetimi bileşeni.

#### Kullanım

```tsx
import { LayoutProvider, LayoutSwitcher, useLayout } from '@/components/layout/LayoutManager';

function App() {
  return (
    <LayoutProvider>
      <AppContent />
    </LayoutProvider>
  );
}

function AppHeader() {
  return <LayoutSwitcher />;
}

function AppContent() {
  const { currentLayout } = useLayout();
  
  return (
    <div>
      <p>Mevcut düzen: {currentLayout}</p>
      {/* Düzene göre içerik render etme */}
    </div>
  );
}
```

#### LayoutProvider Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `children` | `ReactNode` | **Gerekli** | Provider içindeki içerik |

#### useLayout Hook

```typescript
function useLayout(): {
  currentLayout: LayoutType;
  setLayout: (layout: LayoutType) => void;
  getLayoutConfig: (layoutId: LayoutType) => LayoutConfig | undefined;
}
```

#### LayoutType ve LayoutConfig Tipleri

```typescript
type LayoutType = 'default' | 'fileFocus' | 'taskFocus' | 'developer';

interface LayoutConfig {
  id: LayoutType;
  name: string;
  description: string;
  icon: string;
  // Diğer düzen yapılandırmaları
}
```

#### Erişilebilirlik

- Düzen seçici, uygun `aria-label` özellikleri ile işaretlenir
- Mevcut düzen, `aria-current="page"` ile işaretlenir
- Klavye ile kontrol edilebilir

---

## Stil ve Tema

### Tema Sistemi

ALT_LAS, Chakra UI tabanlı bir tema sistemi kullanır. Tema, renkler, tipografi, boşluklar, gölgeler ve diğer tasarım değişkenlerini tanımlar.

#### Tema Kullanımı

```tsx
import { useColorMode, useTheme } from '@chakra-ui/react';

function Example() {
  const { colorMode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  
  return (
    <div>
      <p>Mevcut tema modu: {colorMode}</p>
      <button onClick={toggleColorMode}>Tema Modunu Değiştir</button>
      <div style={{ color: theme.colors.primary[500] }}>
        Tema rengini kullanan metin
      </div>
    </div>
  );
}
```

#### Tema Yapılandırması

Tema yapılandırması, `src/renderer/styles/theme.ts` dosyasında tanımlanmıştır.

### Yüksek Kontrast Tema

ALT_LAS, görme engelli kullanıcılar için yüksek kontrast tema desteği sunar.

#### Yüksek Kontrast Tema Kullanımı

```tsx
import { useColorMode } from '@chakra-ui/react';

function Example() {
  const { colorMode, setColorMode } = useColorMode();
  
  const enableHighContrast = () => {
    setColorMode('highContrast');
  };
  
  return (
    <div>
      <button onClick={enableHighContrast}>
        Yüksek Kontrast Temayı Etkinleştir
      </button>
    </div>
  );
}
```

### Animasyonlar

ALT_LAS, performans ve erişilebilirlik odaklı animasyon sistemi kullanır.

#### Animasyon Kullanımı

```tsx
import { animations } from '@/styles/animations';

function Example() {
  return (
    <div
      style={{
        transition: animations.createAdaptiveTransition(['transform', 'opacity'], 'normal'),
        ...animations.performanceUtils.forceGPU
      }}
    >
      Animasyonlu içerik
    </div>
  );
}
```

#### Animasyon Yapılandırması

Animasyon yapılandırması, `src/renderer/styles/animations.ts` dosyasında tanımlanmıştır.

### Responsive Tasarım

ALT_LAS, farklı ekran boyutları için responsive tasarım desteği sunar.

#### Responsive Tasarım Kullanımı

```tsx
import { responsiveConfig } from '@/styles/responsive';

function Example() {
  return (
    <div
      style={{
        width: '100%',
        [responsiveConfig.mediaQueries.tablet]: {
          width: '50%'
        },
        [responsiveConfig.mediaQueries.desktop]: {
          width: '33%'
        }
      }}
    >
      Responsive içerik
    </div>
  );
}
```

#### Responsive Yapılandırması

Responsive yapılandırması, `src/renderer/styles/responsive.ts` dosyasında tanımlanmıştır.

---

## En İyi Uygulamalar

### Erişilebilirlik

ALT_LAS, WCAG 2.1 AA uyumluluğu için tasarlanmıştır. Aşağıdaki erişilebilirlik en iyi uygulamalarını takip edin:

1. **Semantik HTML Kullanın**: Doğru HTML öğelerini kullanın (button, input, heading, vb.).
2. **ARIA Özelliklerini Doğru Kullanın**: Gerektiğinde `aria-*` özelliklerini ekleyin, ancak semantik HTML'in yeterli olduğu durumlarda gereksiz ARIA kullanmaktan kaçının.
3. **Klavye Erişilebilirliğini Sağlayın**: Tüm etkileşimli öğeler klavye ile erişilebilir olmalıdır.
4. **Renk Kontrastını Koruyun**: Metin ve arka plan arasında yeterli kontrast sağlayın (AA standardı için en az 4.5:1).
5. **Ekran Okuyucu Uyumluluğunu Test Edin**: Uygulamanızı ekran okuyucularla test edin.

### Performans Optimizasyonu

ALT_LAS'ın performansını optimize etmek için aşağıdaki uygulamaları takip edin:

1. **Bileşenleri Memoize Edin**: `React.memo`, `useMemo` ve `useCallback` kullanarak gereksiz render'ları önleyin.
2. **Sanal Listeleme Kullanın**: Büyük listeler için `react-window` gibi sanal listeleme kütüphaneleri kullanın.
3. **Kod Bölme Uygulayın**: `React.lazy` ve `Suspense` ile kod bölme yapın.
4. **Animasyonları Optimize Edin**: GPU hızlandırmalı animasyonlar kullanın ve `will-change` özelliğini doğru şekilde uygulayın.
5. **Render Önceliklendirme Kullanın**: `useTransition` ve `useDeferredValue` ile render önceliklendirme yapın.

### Bileşen Kompozisyonu

ALT_LAS'ta bileşen kompozisyonu için aşağıdaki uygulamaları takip edin:

1. **Tek Sorumluluk İlkesi**: Her bileşen tek bir sorumluluk taşımalıdır.
2. **Prop Drilling'den Kaçının**: Derinlemesine prop geçişi yerine Context API veya state yönetim kütüphaneleri kullanın.
3. **Bileşen Hiyerarşisi Oluşturun**: Atom > Molekül > Organizma > Şablon > Sayfa şeklinde bir hiyerarşi oluşturun.
4. **Yeniden Kullanılabilirlik İçin Tasarlayın**: Bileşenleri genel amaçlı ve yeniden kullanılabilir olacak şekilde tasarlayın.
5. **Prop Tiplerini Doğru Tanımlayın**: TypeScript ile prop tiplerini doğru ve kapsamlı şekilde tanımlayın.

---

Bu dokümantasyon, ALT_LAS UI bileşenlerinin kullanımı ve API'leri hakkında kapsamlı bir rehber sağlar. Herhangi bir sorunuz veya geri bildiriminiz varsa, lütfen geliştirici ekibiyle iletişime geçin.
