# ALT_LAS Desktop UI API Referansı

## İçindekiler

1. [Giriş](#giriş)
2. [IPC API](#ipc-api)
3. [Renderer API](#renderer-api)
4. [Main Process API](#main-process-api)
5. [Veri Modelleri](#veri-modelleri)
6. [Hata Kodları](#hata-kodları)

## Giriş

Bu dokümantasyon, ALT_LAS Desktop UI uygulamasının API'lerini açıklamaktadır. Uygulama, Electron'un ana (main) ve renderer süreçleri arasında iletişim kurmak için IPC (Inter-Process Communication) mekanizmasını kullanır.

### API Kullanım Prensipleri

- Tüm API çağrıları Promise tabanlıdır ve async/await ile kullanılabilir.
- Hata durumları, standart hata nesneleri ile işlenir.
- Veri modelleri, TypeScript interface'leri ile tanımlanır.
- API'ler, modüler bir yapıda organize edilmiştir.

## IPC API

IPC API, ana süreç ve renderer süreç arasında iletişim kurmak için kullanılır. Bu API, `src/shared/ipc` dizininde tanımlanmıştır.

### IPC Kanal Türleri

- **Request-Response**: Bir istek gönderilir ve bir yanıt beklenir.
- **Notification**: Bir bildirim gönderilir, yanıt beklenmez.
- **Stream**: Sürekli veri akışı sağlar.

### IPC Kanalları

#### Kimlik Doğrulama

```typescript
// Giriş yapma
ipcRenderer.invoke('auth:login', {
  email: string,
  password: string
}): Promise<{ user: User, token: string }>

// Çıkış yapma
ipcRenderer.invoke('auth:logout'): Promise<void>

// Kullanıcı bilgilerini alma
ipcRenderer.invoke('auth:get-user'): Promise<User | null>

// Oturum durumunu kontrol etme
ipcRenderer.invoke('auth:check-session'): Promise<boolean>
```

#### Dosya İşlemleri

```typescript
// Dosya yükleme
ipcRenderer.invoke('file:upload', {
  filePaths: string[],
  targetFolder: string,
  options?: UploadOptions
}): Promise<File[]>

// Dosya indirme
ipcRenderer.invoke('file:download', {
  fileId: string,
  targetPath: string
}): Promise<string>

// Dosya silme
ipcRenderer.invoke('file:delete', {
  fileIds: string[]
}): Promise<void>

// Dosya bilgilerini alma
ipcRenderer.invoke('file:get-info', {
  fileId: string
}): Promise<FileInfo>

// Dosya listesini alma
ipcRenderer.invoke('file:list', {
  folderId: string,
  options?: ListOptions
}): Promise<File[]>

// Dosya içeriğini okuma
ipcRenderer.invoke('file:read', {
  fileId: string,
  encoding?: string
}): Promise<string | Buffer>

// Dosya içeriğini yazma
ipcRenderer.invoke('file:write', {
  fileId: string,
  content: string | Buffer,
  encoding?: string
}): Promise<void>
```

#### Proje İşlemleri

```typescript
// Proje oluşturma
ipcRenderer.invoke('project:create', {
  name: string,
  description?: string,
  templateId?: string,
  options?: ProjectOptions
}): Promise<Project>

// Proje güncelleme
ipcRenderer.invoke('project:update', {
  projectId: string,
  updates: Partial<Project>
}): Promise<Project>

// Proje silme
ipcRenderer.invoke('project:delete', {
  projectId: string
}): Promise<void>

// Proje bilgilerini alma
ipcRenderer.invoke('project:get', {
  projectId: string
}): Promise<Project>

// Proje listesini alma
ipcRenderer.invoke('project:list', {
  options?: ListOptions
}): Promise<Project[]>
```

#### Görev İşlemleri

```typescript
// Görev oluşturma
ipcRenderer.invoke('task:create', {
  projectId: string,
  name: string,
  description?: string,
  assigneeId?: string,
  status?: TaskStatus,
  priority?: TaskPriority,
  dueDate?: Date,
  options?: TaskOptions
}): Promise<Task>

// Görev güncelleme
ipcRenderer.invoke('task:update', {
  taskId: string,
  updates: Partial<Task>
}): Promise<Task>

// Görev silme
ipcRenderer.invoke('task:delete', {
  taskId: string
}): Promise<void>

// Görev bilgilerini alma
ipcRenderer.invoke('task:get', {
  taskId: string
}): Promise<Task>

// Görev listesini alma
ipcRenderer.invoke('task:list', {
  projectId: string,
  options?: ListOptions
}): Promise<Task[]>
```

#### Senkronizasyon

```typescript
// Senkronizasyon başlatma
ipcRenderer.invoke('sync:start'): Promise<void>

// Senkronizasyon durumunu alma
ipcRenderer.invoke('sync:status'): Promise<SyncStatus>

// Senkronizasyon ayarlarını alma
ipcRenderer.invoke('sync:get-settings'): Promise<SyncSettings>

// Senkronizasyon ayarlarını güncelleme
ipcRenderer.invoke('sync:update-settings', {
  settings: Partial<SyncSettings>
}): Promise<SyncSettings>
```

#### Uygulama

```typescript
// Uygulama ayarlarını alma
ipcRenderer.invoke('app:get-settings'): Promise<AppSettings>

// Uygulama ayarlarını güncelleme
ipcRenderer.invoke('app:update-settings', {
  settings: Partial<AppSettings>
}): Promise<AppSettings>

// Uygulama sürümünü alma
ipcRenderer.invoke('app:get-version'): Promise<string>

// Güncellemeleri kontrol etme
ipcRenderer.invoke('app:check-updates'): Promise<UpdateInfo | null>

// Güncellemeyi indirme
ipcRenderer.invoke('app:download-update'): Promise<void>

// Güncellemeyi yükleme
ipcRenderer.invoke('app:install-update'): Promise<void>
```

### IPC Olayları

```typescript
// Senkronizasyon durumu değiştiğinde
ipcRenderer.on('sync:status-changed', (event, status: SyncStatus) => {
  // İşlem
})

// Dosya yükleme ilerlemesi
ipcRenderer.on('file:upload-progress', (event, progress: ProgressInfo) => {
  // İşlem
})

// Dosya indirme ilerlemesi
ipcRenderer.on('file:download-progress', (event, progress: ProgressInfo) => {
  // İşlem
})

// Güncelleme durumu
ipcRenderer.on('app:update-status', (event, status: UpdateStatus) => {
  // İşlem
})

// Bildirimler
ipcRenderer.on('notification', (event, notification: Notification) => {
  // İşlem
})
```

## Renderer API

Renderer API, renderer süreçte kullanılan API'leri içerir. Bu API'ler, `src/renderer/services` dizininde tanımlanmıştır.

### AuthService

```typescript
// Giriş yapma
AuthService.login(email: string, password: string): Promise<User>

// Çıkış yapma
AuthService.logout(): Promise<void>

// Kullanıcı bilgilerini alma
AuthService.getCurrentUser(): User | null

// Oturum durumunu kontrol etme
AuthService.isAuthenticated(): boolean

// Oturum değişikliklerini dinleme
AuthService.onAuthStateChanged(callback: (user: User | null) => void): () => void
```

### FileService

```typescript
// Dosya yükleme
FileService.uploadFiles(files: File[], targetFolder: string, options?: UploadOptions): Promise<FileInfo[]>

// Dosya indirme
FileService.downloadFile(fileId: string, targetPath: string): Promise<string>

// Dosya silme
FileService.deleteFiles(fileIds: string[]): Promise<void>

// Dosya bilgilerini alma
FileService.getFileInfo(fileId: string): Promise<FileInfo>

// Dosya listesini alma
FileService.listFiles(folderId: string, options?: ListOptions): Promise<FileInfo[]>

// Dosya içeriğini okuma
FileService.readFile(fileId: string, encoding?: string): Promise<string | ArrayBuffer>

// Dosya içeriğini yazma
FileService.writeFile(fileId: string, content: string | ArrayBuffer, encoding?: string): Promise<void>
```

### ProjectService

```typescript
// Proje oluşturma
ProjectService.createProject(project: ProjectInput): Promise<Project>

// Proje güncelleme
ProjectService.updateProject(projectId: string, updates: Partial<ProjectInput>): Promise<Project>

// Proje silme
ProjectService.deleteProject(projectId: string): Promise<void>

// Proje bilgilerini alma
ProjectService.getProject(projectId: string): Promise<Project>

// Proje listesini alma
ProjectService.listProjects(options?: ListOptions): Promise<Project[]>
```

### TaskService

```typescript
// Görev oluşturma
TaskService.createTask(task: TaskInput): Promise<Task>

// Görev güncelleme
TaskService.updateTask(taskId: string, updates: Partial<TaskInput>): Promise<Task>

// Görev silme
TaskService.deleteTask(taskId: string): Promise<void>

// Görev bilgilerini alma
TaskService.getTask(taskId: string): Promise<Task>

// Görev listesini alma
TaskService.listTasks(projectId: string, options?: ListOptions): Promise<Task[]>
```

### SyncService

```typescript
// Senkronizasyon başlatma
SyncService.startSync(): Promise<void>

// Senkronizasyon durumunu alma
SyncService.getSyncStatus(): SyncStatus

// Senkronizasyon ayarlarını alma
SyncService.getSyncSettings(): SyncSettings

// Senkronizasyon ayarlarını güncelleme
SyncService.updateSyncSettings(settings: Partial<SyncSettings>): Promise<SyncSettings>

// Senkronizasyon durumu değişikliklerini dinleme
SyncService.onSyncStatusChanged(callback: (status: SyncStatus) => void): () => void
```

### AppService

```typescript
// Uygulama ayarlarını alma
AppService.getAppSettings(): AppSettings

// Uygulama ayarlarını güncelleme
AppService.updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings>

// Uygulama sürümünü alma
AppService.getAppVersion(): string

// Güncellemeleri kontrol etme
AppService.checkForUpdates(): Promise<UpdateInfo | null>

// Güncellemeyi indirme
AppService.downloadUpdate(): Promise<void>

// Güncellemeyi yükleme
AppService.installUpdate(): Promise<void>

// Güncelleme durumu değişikliklerini dinleme
AppService.onUpdateStatusChanged(callback: (status: UpdateStatus) => void): () => void
```

## Main Process API

Main Process API, ana süreçte kullanılan API'leri içerir. Bu API'ler, `src/main/services` dizininde tanımlanmıştır.

### DatabaseService

```typescript
// Veritabanı bağlantısını açma
DatabaseService.connect(): Promise<void>

// Veritabanı bağlantısını kapatma
DatabaseService.disconnect(): Promise<void>

// Veritabanı durumunu alma
DatabaseService.getStatus(): DatabaseStatus

// Veritabanını sıfırlama
DatabaseService.reset(): Promise<void>

// Veritabanını yedekleme
DatabaseService.backup(path: string): Promise<void>

// Veritabanını geri yükleme
DatabaseService.restore(path: string): Promise<void>
```

### ApiService

```typescript
// API isteği gönderme
ApiService.request<T>(options: ApiRequestOptions): Promise<T>

// API durumunu alma
ApiService.getStatus(): ApiStatus

// API ayarlarını alma
ApiService.getSettings(): ApiSettings

// API ayarlarını güncelleme
ApiService.updateSettings(settings: Partial<ApiSettings>): Promise<ApiSettings>
```

### FileSystemService

```typescript
// Dosya okuma
FileSystemService.readFile(path: string, encoding?: string): Promise<string | Buffer>

// Dosya yazma
FileSystemService.writeFile(path: string, content: string | Buffer, encoding?: string): Promise<void>

// Dosya silme
FileSystemService.deleteFile(path: string): Promise<void>

// Klasör oluşturma
FileSystemService.createDirectory(path: string): Promise<void>

// Klasör silme
FileSystemService.deleteDirectory(path: string, recursive?: boolean): Promise<void>

// Dosya/klasör kopyalama
FileSystemService.copy(source: string, destination: string): Promise<void>

// Dosya/klasör taşıma
FileSystemService.move(source: string, destination: string): Promise<void>

// Dosya/klasör bilgilerini alma
FileSystemService.getStats(path: string): Promise<FileStats>

// Klasör içeriğini listeleme
FileSystemService.readDirectory(path: string): Promise<string[]>
```

### LogService

```typescript
// Bilgi mesajı kaydetme
LogService.info(message: string, meta?: any): void

// Uyarı mesajı kaydetme
LogService.warn(message: string, meta?: any): void

// Hata mesajı kaydetme
LogService.error(message: string, error?: Error, meta?: any): void

// Hata ayıklama mesajı kaydetme
LogService.debug(message: string, meta?: any): void

// Günlük dosyasını alma
LogService.getLogFile(): string

// Günlük ayarlarını alma
LogService.getSettings(): LogSettings

// Günlük ayarlarını güncelleme
LogService.updateSettings(settings: Partial<LogSettings>): LogSettings
```

## Veri Modelleri

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
}

interface NotificationPreferences {
  email: boolean;
  desktop: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  projectUpdated: boolean;
}
```

### File

```typescript
interface File {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  parentId?: string;
  isDirectory: boolean;
  metadata: FileMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface FileMetadata {
  contentType?: string;
  hash?: string;
  tags?: string[];
  starred?: boolean;
  description?: string;
  customFields?: Record<string, any>;
}
```

### Project

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  members: ProjectMember[];
  metadata: ProjectMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
}

enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

interface ProjectMetadata {
  tags?: string[];
  customFields?: Record<string, any>;
}
```

### Task

```typescript
interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  metadata: TaskMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

interface TaskAttachment {
  id: string;
  fileId: string;
  fileName: string;
  addedAt: Date;
  addedBy: string;
}

interface TaskMetadata {
  tags?: string[];
  customFields?: Record<string, any>;
}
```

## Hata Kodları

ALT_LAS Desktop UI, standart hata kodları kullanır. Her hata, bir kod ve bir mesaj içerir.

### Genel Hata Kodları

- `ERR_UNKNOWN`: Bilinmeyen hata
- `ERR_NETWORK`: Ağ hatası
- `ERR_TIMEOUT`: Zaman aşımı hatası
- `ERR_INVALID_PARAM`: Geçersiz parametre
- `ERR_NOT_FOUND`: Öğe bulunamadı
- `ERR_PERMISSION_DENIED`: İzin reddedildi
- `ERR_ALREADY_EXISTS`: Öğe zaten mevcut
- `ERR_NOT_IMPLEMENTED`: Özellik henüz uygulanmadı

### Kimlik Doğrulama Hata Kodları

- `ERR_AUTH_INVALID_CREDENTIALS`: Geçersiz kimlik bilgileri
- `ERR_AUTH_EXPIRED_TOKEN`: Süresi dolmuş token
- `ERR_AUTH_INVALID_TOKEN`: Geçersiz token
- `ERR_AUTH_REQUIRED`: Kimlik doğrulama gerekli
- `ERR_AUTH_USER_NOT_FOUND`: Kullanıcı bulunamadı

### Dosya İşlemleri Hata Kodları

- `ERR_FILE_NOT_FOUND`: Dosya bulunamadı
- `ERR_FILE_ALREADY_EXISTS`: Dosya zaten mevcut
- `ERR_FILE_ACCESS_DENIED`: Dosya erişimi reddedildi
- `ERR_FILE_TOO_LARGE`: Dosya çok büyük
- `ERR_FILE_INVALID_TYPE`: Geçersiz dosya türü
- `ERR_FILE_UPLOAD_FAILED`: Dosya yükleme başarısız
- `ERR_FILE_DOWNLOAD_FAILED`: Dosya indirme başarısız

### Proje İşlemleri Hata Kodları

- `ERR_PROJECT_NOT_FOUND`: Proje bulunamadı
- `ERR_PROJECT_ACCESS_DENIED`: Proje erişimi reddedildi
- `ERR_PROJECT_INVALID_STATUS`: Geçersiz proje durumu
- `ERR_PROJECT_MEMBER_NOT_FOUND`: Proje üyesi bulunamadı

### Görev İşlemleri Hata Kodları

- `ERR_TASK_NOT_FOUND`: Görev bulunamadı
- `ERR_TASK_ACCESS_DENIED`: Görev erişimi reddedildi
- `ERR_TASK_INVALID_STATUS`: Geçersiz görev durumu
- `ERR_TASK_INVALID_PRIORITY`: Geçersiz görev önceliği

### Senkronizasyon Hata Kodları

- `ERR_SYNC_IN_PROGRESS`: Senkronizasyon zaten devam ediyor
- `ERR_SYNC_FAILED`: Senkronizasyon başarısız
- `ERR_SYNC_CONFLICT`: Senkronizasyon çakışması
- `ERR_SYNC_NOT_CONFIGURED`: Senkronizasyon yapılandırılmamış

### Uygulama Hata Kodları

- `ERR_APP_UPDATE_FAILED`: Uygulama güncellemesi başarısız
- `ERR_APP_SETTINGS_INVALID`: Geçersiz uygulama ayarları
- `ERR_APP_RESTART_REQUIRED`: Uygulama yeniden başlatma gerekli
