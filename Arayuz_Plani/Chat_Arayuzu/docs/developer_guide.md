# ALT_LAS Chat Geliştirici Kılavuzu

## İçindekiler

1. [Giriş](#giriş)
2. [Mimari Genel Bakış](#mimari-genel-bakış)
3. [Kurulum](#kurulum)
4. [Proje Yapısı](#proje-yapısı)
5. [Bileşenler](#bileşenler)
6. [Servisler](#servisler)
7. [Context API](#context-api)
8. [Stil Sistemi](#stil-sistemi)
9. [Yerelleştirme](#yerelleştirme)
10. [Tema Sistemi](#tema-sistemi)
11. [Erişilebilirlik](#erişilebilirlik)
12. [Çevrimdışı Destek](#çevrimdışı-destek)
13. [Test](#test)
14. [Dağıtım](#dağıtım)
15. [En İyi Uygulamalar](#en-iyi-uygulamalar)
16. [Sorun Giderme](#sorun-giderme)

## Giriş

Bu dokümantasyon, ALT_LAS Chat uygulamasının geliştiriciler için teknik detaylarını içermektedir. ALT_LAS Chat, React ve TypeScript kullanılarak geliştirilmiş bir web tabanlı mesajlaşma uygulamasıdır.

## Mimari Genel Bakış

ALT_LAS Chat, aşağıdaki temel teknolojileri kullanmaktadır:

- **React**: UI bileşenleri için
- **TypeScript**: Tip güvenliği için
- **Styled Components**: Stil için
- **Context API**: Durum yönetimi için
- **Socket.IO**: Gerçek zamanlı iletişim için
- **Web Crypto API**: Uçtan uca şifreleme için
- **IndexedDB**: Çevrimdışı depolama için

Uygulama, aşağıdaki katmanlardan oluşmaktadır:

1. **UI Katmanı**: React bileşenleri
2. **Durum Yönetimi Katmanı**: Context API
3. **Servis Katmanı**: API istekleri, WebSocket bağlantıları, şifreleme vb.
4. **Depolama Katmanı**: LocalStorage, IndexedDB

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm (v6 veya üzeri) veya yarn (v1.22 veya üzeri)

### Kurulum Adımları

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/krozenking/ALT_LAS.git
   cd ALT_LAS/Arayuz_Plani/Chat_Arayuzu
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   # veya
   yarn install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm start
   # veya
   yarn start
   ```

4. Tarayıcınızda `http://localhost:3000` adresine gidin.

## Proje Yapısı

```
Chat_Arayuzu/
├── components/         # UI bileşenleri
│   ├── Accessibility/  # Erişilebilirlik bileşenleri
│   ├── ChatContainer/  # Ana sohbet konteyner bileşeni
│   ├── ChatHeader/     # Sohbet başlık bileşeni
│   ├── ChatSidebar/    # Kenar çubuğu bileşeni
│   ├── LazyLoad/       # Lazy loading bileşeni
│   ├── MessageInput/   # Mesaj giriş bileşeni
│   ├── MessageItem/    # Mesaj öğesi bileşeni
│   ├── MessageList/    # Mesaj listesi bileşeni
│   ├── OfflineIndicator/ # Çevrimdışı gösterge bileşeni
│   ├── ThemeSettings/  # Tema ayarları bileşeni
│   └── VirtualList/    # Sanal liste bileşeni
├── context/            # Context API
│   ├── ChatContext.tsx # Sohbet context'i
│   ├── LanguageContext.tsx # Dil context'i
│   └── ThemeContext.tsx # Tema context'i
├── docs/               # Dokümantasyon
├── hooks/              # Özel hook'lar
├── services/           # Servisler
│   ├── auth.ts         # Kimlik doğrulama servisi
│   ├── encryption.ts   # Şifreleme servisi
│   ├── i18n.ts         # Yerelleştirme servisi
│   ├── offlineManager.ts # Çevrimdışı yönetim servisi
│   ├── socket.ts       # WebSocket servisi
│   └── themeManager.ts # Tema yönetim servisi
├── styles/             # Genel stiller
│   ├── accessibility.css # Erişilebilirlik stilleri
│   └── themes.css      # Tema stilleri
├── tests/              # Test dosyaları
├── types/              # TypeScript tipleri
└── utils/              # Yardımcı fonksiyonlar
```

## Bileşenler

### Ana Bileşenler

#### ChatContainer

Ana konteyner bileşeni, tüm sohbet arayüzünü içerir.

```tsx
interface ChatContainerProps {
  currentUserId: string;
  onOpenNotificationSettings?: () => void;
  onOpenAccessibilitySettings?: () => void;
  onOpenLanguageSelector?: () => void;
  onOpenThemeSettings?: () => void;
}
```

#### ChatSidebar

Kenar çubuğu bileşeni, sohbetleri ve kişileri listeler.

```tsx
interface ChatSidebarProps {
  currentUserId: string;
  users: User[];
  conversations: Conversation[];
  selectedUserId?: string;
  selectedConversationId?: string;
  onSelectUser: (userId: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onCreateGroup: () => void;
  isCollapsed?: boolean;
}
```

#### MessageList

Mesaj listesi bileşeni, bir sohbetin mesajlarını görüntüler.

```tsx
interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  selectedUser?: User;
}
```

#### MessageInput

Mesaj giriş bileşeni, mesaj gönderme alanını içerir.

```tsx
interface MessageInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  onFileUpload?: (attachments: Attachment[]) => void;
  disabled?: boolean;
  conversationId?: string;
  attachments?: Attachment[];
}
```

### Yardımcı Bileşenler

#### LazyLoad

Bileşenleri lazy loading ile yükler.

```tsx
interface LazyLoadProps {
  height?: string;
  width?: string;
  threshold?: number;
  placeholder?: React.ReactNode;
  children: React.ReactNode;
}
```

#### VirtualList

Büyük listeleri verimli bir şekilde render eder.

```tsx
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  width?: string;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}
```

## Servisler

### auth.ts

Kimlik doğrulama ve oturum yönetimi servisi.

```typescript
// Singleton instance
export const authService = AuthService.getInstance();

// Örnek kullanım
const user = await authService.login({ email, password });
const isAuthenticated = authService.isAuthenticated();
await authService.logout();
```

### encryption.ts

Uçtan uca şifreleme servisi.

```typescript
// Singleton instance
export const encryptionService = EncryptionService.getInstance();

// Örnek kullanım
const publicKey = await encryptionService.getPublicKey();
await encryptionService.establishSession(userId, publicKey);
const encryptedText = await encryptionService.encryptMessage(userId, text);
const decryptedText = await encryptionService.decryptMessage(userId, encryptedText);
```

### i18n.ts

Yerelleştirme servisi.

```typescript
// Singleton instance
export const i18n = I18nService.getInstance();

// Helper function
export const t = (namespace: TranslationNamespace, key: string, params?: { [key: string]: string }): string => {
  return i18n.translate(namespace, key, params);
};

// Örnek kullanım
const message = t('chat', 'newMessage');
const typingMessage = t('chat', 'typing', { user: 'John' });
```

### offlineManager.ts

Çevrimdışı yönetim servisi.

```typescript
// Singleton instance
export const offlineManager = OfflineManager.getInstance();

// Örnek kullanım
const isOnline = offlineManager.isNetworkOnline();
const messageId = offlineManager.queueMessage({ text, senderId, conversationId });
await offlineManager.syncMessages();
```

### socket.ts

WebSocket servisi.

```typescript
// Singleton instance
export const socketService = SocketService.getInstance();

// Örnek kullanım
socketService.connect();
socketService.emit('message', { text, conversationId });
socketService.on('message', handleMessage);
socketService.disconnect();
```

### themeManager.ts

Tema yönetim servisi.

```typescript
// Singleton instance
export const themeManager = ThemeManager.getInstance();

// Örnek kullanım
const currentTheme = themeManager.getThemeMode();
themeManager.setThemeMode('dark');
const isDarkMode = themeManager.isDarkModeActive();
```

## Context API

### ChatContext

Sohbet durumunu yönetir.

```typescript
// Context hook
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};

// Örnek kullanım
const { 
  users, 
  conversations, 
  messages, 
  selectedUserId, 
  selectedConversationId,
  selectUser,
  selectConversation,
  sendMessage,
  createConversation
} = useChat();
```

### LanguageContext

Dil durumunu yönetir.

```typescript
// Context hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

// Örnek kullanım
const { language, setLanguage, t, availableLanguages } = useLanguage();
```

### ThemeContext

Tema durumunu yönetir.

```typescript
// Context hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Örnek kullanım
const { themeMode, setThemeMode, isDarkMode, theme } = useTheme();
```

## Stil Sistemi

ALT_LAS Chat, styled-components ve CSS değişkenleri kullanarak stil sistemini yönetir.

### Styled Components

```typescript
const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: var(--color-background-default);
`;

const Button = styled.button`
  background-color: var(--color-primary-main);
  color: var(--color-primary-contrast-text);
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
`;
```

### CSS Değişkenleri

CSS değişkenleri, tema değişikliklerini kolaylaştırmak için kullanılır.

```css
:root {
  --color-primary-main: #0084ff;
  --color-primary-light: #4da3ff;
  --color-primary-dark: #0066cc;
  --color-primary-contrast-text: #ffffff;
  /* ... */
}

.dark-theme {
  --color-background-default: #18191a;
  --color-background-paper: #242526;
  --color-text-primary: #e4e6eb;
  /* ... */
}
```

## Yerelleştirme

ALT_LAS Chat, çoklu dil desteği için i18n servisini kullanır.

### Dil Değiştirme

```typescript
// Dil değiştirme
await i18n.setLanguage('en');

// Context ile dil değiştirme
const { setLanguage } = useLanguage();
await setLanguage('tr');
```

### Çeviri Kullanımı

```typescript
// Doğrudan servis kullanımı
const message = i18n.translate('chat', 'newMessage');

// Helper function kullanımı
const message = t('chat', 'newMessage');

// Context ile kullanım
const { t } = useLanguage();
const message = t('chat', 'newMessage');
```

## Tema Sistemi

ALT_LAS Chat, açık/koyu tema desteği için themeManager servisini kullanır.

### Tema Değiştirme

```typescript
// Tema değiştirme
themeManager.setThemeMode('dark');

// Context ile tema değiştirme
const { setThemeMode } = useTheme();
setThemeMode('light');
```

### Tema Kullanımı

```typescript
// Doğrudan servis kullanımı
const isDarkMode = themeManager.isDarkModeActive();
const theme = themeManager.getTheme();

// Context ile kullanım
const { isDarkMode, theme } = useTheme();
```

## Erişilebilirlik

ALT_LAS Chat, erişilebilirlik için çeşitli özellikler sunar.

### Erişilebilirlik Bileşenleri

- **ScreenReaderOnly**: Ekran okuyucular için gizli içerik
- **FocusTrap**: Odağı bir bileşen içinde tutar
- **SkipLink**: Klavye kullanıcıları için navigasyonu atlama

### Erişilebilirlik Stilleri

```css
/* Yüksek Kontrast Modu */
body.high-contrast {
  --background-color: #000000;
  --text-color: #ffffff;
  /* ... */
}

/* Büyük Metin Modu */
body.large-text {
  font-size: 125% !important;
}

/* Azaltılmış Hareket Modu */
body.reduced-motion * {
  animation-duration: 0.001s !important;
  transition-duration: 0.001s !important;
}
```

## Çevrimdışı Destek

ALT_LAS Chat, çevrimdışı destek için offlineManager servisini kullanır.

### Çevrimdışı Mesaj Gönderme

```typescript
// Çevrimdışı mesaj gönderme
if (!offlineManager.isNetworkOnline()) {
  offlineManager.queueMessage({
    text,
    senderId,
    conversationId,
    attachments,
  });
}
```

### Mesaj Senkronizasyonu

```typescript
// Çevrimdışı mesajları senkronize etme
await offlineManager.syncMessages();

// Başarısız mesajları yeniden deneme
offlineManager.retryFailedMessages();
```

## Test

ALT_LAS Chat, Jest ve React Testing Library kullanarak test edilir.

### Birim Testleri

```typescript
// MessageInput bileşeni için birim testi
test('calls onSendMessage when send button is clicked', () => {
  const mockOnSendMessage = jest.fn();
  render(<MessageInput onSendMessage={mockOnSendMessage} />);
  
  const input = screen.getByPlaceholderText(/mesaj yaz/i);
  fireEvent.change(input, { target: { value: 'Hello, world!' } });
  
  const sendButton = screen.getByRole('button', { name: /gönder/i });
  fireEvent.click(sendButton);
  
  expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!', undefined);
});
```

### Entegrasyon Testleri

```typescript
// ChatContainer bileşeni için entegrasyon testi
test('sends a message', async () => {
  // Set selected conversation
  mockContextValue.selectedConversationId = '1';
  
  render(<ChatContainer currentUserId="1" />);
  
  // Type a message
  const input = screen.getByPlaceholderText(/mesaj yaz/i);
  fireEvent.change(input, { target: { value: 'New message' } });
  
  // Send the message
  const sendButton = screen.getByRole('button', { name: /gönder/i });
  fireEvent.click(sendButton);
  
  // Check if sendMessage was called
  await waitFor(() => {
    expect(mockContextValue.sendMessage).toHaveBeenCalled();
  });
});
```

## Dağıtım

ALT_LAS Chat, aşağıdaki adımlarla dağıtılabilir:

1. Uygulamayı derleyin:
   ```bash
   npm run build
   # veya
   yarn build
   ```

2. Derlenen dosyaları bir web sunucusuna yükleyin.

3. Sunucu yapılandırmasını, tüm istekleri `index.html` dosyasına yönlendirecek şekilde ayarlayın.

## En İyi Uygulamalar

### Kod Organizasyonu

- Bileşenleri küçük ve yeniden kullanılabilir tutun.
- Her bileşen için ayrı bir dosya kullanın.
- İlgili bileşenleri klasörler halinde gruplandırın.
- Tipleri ve arayüzleri dışa aktarın.

### Performans

- Büyük listeler için sanal liste kullanın.
- Ağır bileşenler için lazy loading kullanın.
- Gereksiz render'ları önlemek için React.memo kullanın.
- Debounce ve throttle tekniklerini kullanın.

### Güvenlik

- Kullanıcı girdilerini her zaman doğrulayın.
- Hassas verileri şifreleyin.
- HTTPS kullanın.
- XSS ve CSRF saldırılarına karşı önlem alın.

## Sorun Giderme

### Yaygın Hatalar

#### "useChat must be used within a ChatProvider"

Bu hata, `useChat` hook'unun `ChatProvider` dışında kullanıldığını gösterir. Çözüm:

```tsx
// Hatalı
const Component = () => {
  const { users } = useChat(); // Hata!
  return <div>{users.length}</div>;
};

// Doğru
const App = () => {
  return (
    <ChatProvider>
      <Component />
    </ChatProvider>
  );
};

const Component = () => {
  const { users } = useChat(); // Çalışır
  return <div>{users.length}</div>;
};
```

#### "Failed to establish session"

Bu hata, şifreleme oturumu kurulurken bir sorun olduğunu gösterir. Çözüm:

1. Kullanıcının public key'inin doğru olduğunu kontrol edin.
2. WebCrypto API'nin tarayıcı tarafından desteklendiğini kontrol edin.
3. HTTPS kullandığınızdan emin olun (WebCrypto API, güvenli bağlantılar gerektirir).

### Hata Ayıklama

- Tarayıcı geliştirici araçlarını kullanın.
- React Developer Tools eklentisini kullanın.
- Konsol hatalarını kontrol edin.
- Network isteklerini izleyin.
- Redux DevTools ile durum değişikliklerini izleyin (Redux kullanıyorsanız).
