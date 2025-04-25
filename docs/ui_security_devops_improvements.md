# UI Güvenlik ve DevOps İyileştirme Planı

## 1. Giriş

Bu belge, ALT_LAS projesinin yeni eklenen UI desktop uygulaması için güvenlik ve DevOps iyileştirmelerini tanımlamaktadır. GitHub'taki fikir havuzunun ve yeni eklenen UI bileşenlerinin incelenmesi sonucunda, güvenlik ve DevOps alanında yapılması gereken iyileştirmeler ve uygulanması gereken en iyi pratikler belirlenmiştir.

## 2. Tespit Edilen Güvenlik Riskleri

### 2.1. Electron Güvenlik Riskleri

Electron uygulamaları, web teknolojileri ve Node.js'i birleştirdiği için özel güvenlik riskleri taşır:

1. **Node.js Entegrasyonu**: Varsayılan olarak, Electron'da renderer süreçleri Node.js API'lerine erişebilir, bu da güvenlik risklerine yol açabilir.
2. **Uzaktan İçerik Yükleme**: Güvenilmeyen kaynaklardan içerik yükleme riski.
3. **Preload Scriptleri**: Güvensiz preload scriptleri, güvenlik açıklarına neden olabilir.
4. **IPC (Inter-Process Communication)**: Güvensiz IPC mesajlaşması, kötü amaçlı kod çalıştırma riskine yol açabilir.
5. **Otomatik Güncellemeler**: Güvensiz güncelleme mekanizmaları, kötü amaçlı yazılım dağıtımına neden olabilir.

### 2.2. UI Bileşen Güvenlik Riskleri

1. **XSS (Cross-Site Scripting)**: Özellikle kullanıcı girdilerinin işlendiği Input bileşenlerinde risk.
2. **CSRF (Cross-Site Request Forgery)**: API isteklerinde CSRF koruması eksikliği.
3. **Veri Sızıntısı**: Hassas verilerin yerel depolamada güvensiz saklanması.
4. **Durum Yönetimi**: Zustand store'da hassas verilerin güvensiz saklanması.
5. **Sürükle-Bırak Güvenliği**: Panel sisteminde sürüklenen içeriklerin güvenlik kontrolü eksikliği.

### 2.3. DevOps Eksiklikleri

1. **CI/CD Pipeline Eksikliği**: UI desktop uygulaması için CI/CD pipeline yapılandırması eksik.
2. **Güvenlik Taramaları**: Otomatik güvenlik taramaları entegre edilmemiş.
3. **Bağımlılık Yönetimi**: Bağımlılıkların güvenlik açıkları için düzenli taranması eksik.
4. **Dağıtım Güvenliği**: Electron uygulamasının güvenli imzalanması ve dağıtımı için yapılandırma eksik.
5. **Test Otomasyonu**: Güvenlik odaklı test otomasyonu eksik.

## 3. Güvenlik İyileştirmeleri

### 3.1. Electron Güvenlik Yapılandırması

#### 3.1.1. Context Isolation ve Sandbox

```javascript
// forge.config.js
module.exports = {
  // ...
  config: {
    // ...
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  }
};
```

#### 3.1.2. Content Security Policy (CSP)

```javascript
// main.js
app.on('web-contents-created', (event, contents) => {
  contents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; connect-src 'self' https://api.altlas.example.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'"
        ]
      }
    });
  });
});
```

#### 3.1.3. Güvenli IPC İletişimi

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Güvenli API tanımı
contextBridge.exposeInMainWorld('api', {
  // Sadece izin verilen metodları açığa çıkar
  send: (channel, data) => {
    // İzin verilen kanalları beyaz listeye al
    const validChannels = ['toMain', 'login', 'getData', 'saveData'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain', 'loginResult', 'dataResult'];
    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
```

#### 3.1.4. Güvenli Otomatik Güncellemeler

```javascript
// main.js
const { autoUpdater } = require('electron-updater');

// Güncelleyiciyi yapılandır
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'krozenking',
  repo: 'ALT_LAS',
  private: true,
  token: process.env.GITHUB_TOKEN // Güvenli bir şekilde saklanan token
});

// Güncellemeleri kontrol et
autoUpdater.checkForUpdatesAndNotify();

// Güncelleme olaylarını dinle
autoUpdater.on('update-downloaded', () => {
  // Kullanıcıya bildir ve güncellemeyi kur
});
```

### 3.2. UI Bileşen Güvenlik İyileştirmeleri

#### 3.2.1. Input Sanitization

```typescript
// src/renderer/components/core/Input.tsx
import DOMPurify from 'dompurify';

// Input bileşenini güvenli hale getir
const SecureInput: React.FC<InputProps> = ({ value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Kullanıcı girdisini temizle
    const sanitizedValue = DOMPurify.sanitize(e.target.value);
    onChange({ ...e, target: { ...e.target, value: sanitizedValue } });
  };

  return <Input value={value} onChange={handleChange} {...props} />;
};
```

#### 3.2.2. API Güvenliği

```typescript
// src/renderer/utils/ApiService.ts
import axios from 'axios';

// CSRF token'ı al ve sakla
const fetchCSRFToken = async () => {
  const response = await axios.get('/api/auth/csrf-token');
  return response.data.csrf_token;
};

// API isteklerini güvenli hale getir
const secureApi = axios.create({
  baseURL: 'https://api.altlas.example.com',
  withCredentials: true
});

// İstek interceptor'ı
secureApi.interceptors.request.use(async (config) => {
  // CSRF token'ı ekle
  if (['post', 'put', 'delete', 'patch'].includes(config.method || '')) {
    const token = await fetchCSRFToken();
    config.headers['X-CSRF-Token'] = token;
  }
  
  return config;
});

// Yanıt interceptor'ı
secureApi.interceptors.response.use(
  response => response,
  async (error) => {
    // 401 hatası durumunda token yenileme
    if (error.response?.status === 401) {
      // Token yenileme işlemi
    }
    return Promise.reject(error);
  }
);

export default secureApi;
```

#### 3.2.3. Güvenli Yerel Depolama

```typescript
// src/renderer/utils/SecureStorage.ts
import { ipcRenderer } from 'electron';
import CryptoJS from 'crypto-js';

class SecureStorage {
  private encryptionKey: string;

  constructor() {
    // Güvenli bir şekilde encryption key al
    this.encryptionKey = window.api.getEncryptionKey();
  }

  // Veriyi şifrele ve sakla
  async setItem(key: string, value: any): Promise<void> {
    try {
      const valueStr = JSON.stringify(value);
      const encryptedValue = CryptoJS.AES.encrypt(valueStr, this.encryptionKey).toString();
      
      // Electron main process üzerinden güvenli depolama
      await window.api.send('secureStorage:set', { key, value: encryptedValue });
    } catch (error) {
      console.error('Error storing data securely', error);
      throw error;
    }
  }

  // Şifrelenmiş veriyi al ve çöz
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const encryptedValue = await window.api.invoke('secureStorage:get', key);
      
      if (!encryptedValue) {
        return null;
      }
      
      const decryptedValue = CryptoJS.AES.decrypt(encryptedValue, this.encryptionKey).toString(CryptoJS.enc.Utf8);
      
      return JSON.parse(decryptedValue) as T;
    } catch (error) {
      console.error('Error retrieving data securely', error);
      return null;
    }
  }

  // Veriyi sil
  async removeItem(key: string): Promise<void> {
    try {
      await window.api.invoke('secureStorage:remove', key);
    } catch (error) {
      console.error('Error removing data securely', error);
      throw error;
    }
  }

  // Tüm verileri sil
  async clear(): Promise<void> {
    try {
      await window.api.invoke('secureStorage:clear');
    } catch (error) {
      console.error('Error clearing secure storage', error);
      throw error;
    }
  }
}

export default new SecureStorage();
```

#### 3.2.4. Zustand Store Güvenliği

```typescript
// src/renderer/store/secureStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import SecureStorage from '../utils/SecureStorage';

// Özel persist middleware
const securePersist = (config) => (set, get, api) => 
  persist(config, {
    getStorage: () => ({
      getItem: async (name) => {
        const value = await SecureStorage.getItem(name);
        return value ? JSON.stringify(value) : null;
      },
      setItem: async (name, value) => {
        await SecureStorage.setItem(name, JSON.parse(value));
      },
      removeItem: async (name) => {
        await SecureStorage.removeItem(name);
      }
    })
  })(set, get, api);

// Güvenli store
const useSecureStore = create(
  securePersist({
    name: 'secure-store',
    // Store state ve metodları
    state: {
      sensitiveData: null,
      // ...
    },
    actions: {
      setSensitiveData: (data) => set({ sensitiveData: data }),
      clearSensitiveData: () => set({ sensitiveData: null })
    }
  })
);

export default useSecureStore;
```

### 3.3. Sürükle-Bırak Güvenliği

```typescript
// src/renderer/components/composition/DropZone.tsx
import { useDrop } from 'react-dnd';
import DOMPurify from 'dompurify';

const SecureDropZone: React.FC<DropZoneProps> = ({ onDrop, ...props }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'PANEL',
    drop: (item: any) => {
      // Sürüklenen içeriği doğrula ve temizle
      if (item && item.content) {
        // HTML içeriği varsa temizle
        if (typeof item.content === 'string') {
          item.content = DOMPurify.sanitize(item.content);
        }
        
        // Nesne içeriği varsa güvenlik kontrolü yap
        if (typeof item.content === 'object') {
          // Güvenlik kontrolü
          validateDroppedContent(item.content);
        }
        
        onDrop(item);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  return <div ref={drop} {...props} />;
};

// Sürüklenen içeriği doğrula
const validateDroppedContent = (content: any) => {
  // İzin verilen içerik tiplerini kontrol et
  const allowedTypes = ['task', 'file', 'setting', 'chart'];
  
  if (content.type && !allowedTypes.includes(content.type)) {
    throw new Error('Invalid content type');
  }
  
  // İçeriği temizle
  if (content.html) {
    content.html = DOMPurify.sanitize(content.html);
  }
  
  // Diğer güvenlik kontrolleri
  // ...
  
  return content;
};
```

## 4. DevOps İyileştirmeleri

### 4.1. UI Desktop CI/CD Pipeline

#### 4.1.1. GitHub Actions Workflow

```yaml
# .github/workflows/ui-desktop-ci.yml
name: UI Desktop CI

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'ui-desktop/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'ui-desktop/**'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: ui-desktop/package.json
    
    - name: Install dependencies
      run: |
        cd ui-desktop
        npm ci
    
    - name: Lint
      run: |
        cd ui-desktop
        npm run lint
    
    - name: Type check
      run: |
        cd ui-desktop
        npm run type-check
    
    - name: Test
      run: |
        cd ui-desktop
        npm test
    
    - name: Build
      run: |
        cd ui-desktop
        npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-${{ matrix.os }}
        path: ui-desktop/out
```

#### 4.1.2. Güvenlik Taramaları

```yaml
# .github/workflows/ui-desktop-security.yml
name: UI Desktop Security Scan

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'ui-desktop/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'ui-desktop/**'
  schedule:
    - cron: '0 0 * * 0'  # Her Pazar günü çalıştır

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
        cache-dependency-path: ui-desktop/package.json
    
    - name: Install dependencies
      run: |
        cd ui-desktop
        npm ci
    
    - name: Run npm audit
      run: |
        cd ui-desktop
        npm audit --audit-level=high
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      with:
        args: --file=ui-desktop/package.json --severity-threshold=high
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
    - name: Run ESLint security plugin
      run: |
        cd ui-desktop
        npm install eslint-plugin-security
        npx eslint --plugin security --ext .js,.jsx,.ts,.tsx src/
```

#### 4.1.3. Electron Builder Yapılandırması

```javascript
// ui-desktop/forge.config.js
module.exports = {
  packagerConfig: {
    asar: true,
    osxSign: {
      identity: 'Developer ID Application: ALT_LAS (XXXXXXXXXX)',
      'hardened-runtime': true,
      entitlements: 'entitlements.plist',
      'entitlements-inherit': 'entitlements.plist',
      'signature-flags': 'library'
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    },
    win32metadata: {
      CompanyName: 'ALT_LAS',
      FileDescription: 'ALT_LAS Desktop Application',
      OriginalFilename: 'ALT_LAS.exe',
      ProductName: 'ALT_LAS',
      InternalName: 'ALT_LAS'
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'krozenking',
          name: 'ALT_LAS'
        },
        prerelease: false
      }
    }
  ]
};
```

### 4.2. Otomatik Güvenlik Testleri

#### 4.2.1. Jest Güvenlik Testleri

```typescript
// ui-desktop/src/__tests__/security/input.test.ts
import { render, fireEvent } from '@testing-library/react';
import { SecureInput } from '../../renderer/components/core/Input';

describe('SecureInput Component', () => {
  test('should sanitize XSS input', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <SecureInput 
        data-testid="secure-input" 
        value="" 
        onChange={handleChange} 
      />
    );
    
    const input = getByTestId('secure-input');
    
    // XSS payload
    fireEvent.change(input, { target: { value: '<script>alert("XSS")</script>' } });
    
    // Sanitized value should not contain script tags
    expect(handleChange).toHaveBeenCalled();
    const event = handleChange.mock.calls[0][0];
    expect(event.target.value).not.toContain('<script>');
  });
  
  test('should handle various XSS payloads', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <SecureInput 
        data-testid="secure-input" 
        value="" 
        onChange={handleChange} 
      />
    );
    
    const input = getByTestId('secure-input');
    const xssPayloads = [
      '<img src="x" onerror="alert(1)">',
      'javascript:alert(1)',
      '<svg onload="alert(1)">',
      '<a href="javascript:alert(1)">click me</a>'
    ];
    
    xssPayloads.forEach(payload => {
      fireEvent.change(input, { target: { value: payload } });
      const event = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(event.target.value).not.toContain('javascript:');
      expect(event.target.value).not.toContain('onerror=');
      expect(event.target.value).not.toContain('onload=');
    });
  });
});
```

#### 4.2.2. Electron Güvenlik Testleri

```typescript
// ui-desktop/src/__tests__/security/electron.test.ts
import { BrowserWindow } from 'electron';
import { createWindow } from '../../main';

// Mock electron
jest.mock('electron', () => ({
  app: {
    on: jest.fn(),
    whenReady: jest.fn().mockResolvedValue(undefined)
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    webContents: {
      openDevTools: jest.fn(),
      on: jest.fn(),
      session: {
        webRequest: {
          onHeadersReceived: jest.fn()
        }
      }
    },
    on: jest.fn()
  }))
}));

describe('Electron Security', () => {
  let window;
  
  beforeEach(() => {
    window = createWindow();
  });
  
  test('should create window with secure webPreferences', () => {
    expect(BrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        webPreferences: expect.objectContaining({
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webSecurity: true
        })
      })
    );
  });
  
  test('should set Content Security Policy', () => {
    const { webContents } = window;
    expect(webContents.session.webRequest.onHeadersReceived).toHaveBeenCalled();
    
    // CSP callback test
    const callback = webContents.session.webRequest.onHeadersReceived.mock.calls[0][0];
    const mockDetails = { responseHeaders: {} };
    const mockCallbackFn = jest.fn();
    
    callback(mockDetails, mockCallbackFn);
    
    expect(mockCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({
        responseHeaders: expect.objectContaining({
          'Content-Security-Policy': expect.arrayContaining([
            expect.stringContaining("default-src 'self'")
          ])
        })
      })
    );
  });
});
```

#### 4.2.3. API Güvenlik Testleri

```typescript
// ui-desktop/src/__tests__/security/api.test.ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import secureApi from '../../renderer/utils/ApiService';

describe('Secure API Service', () => {
  let mock;
  
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });
  
  afterEach(() => {
    mock.restore();
  });
  
  test('should add CSRF token to POST requests', async () => {
    // Mock CSRF token endpoint
    mock.onGet('/api/auth/csrf-token').reply(200, {
      csrf_token: 'test-csrf-token'
    });
    
    // Mock POST endpoint
    mock.onPost('/api/data').reply(config => {
      // Check if CSRF token is in headers
      if (config.headers['X-CSRF-Token'] === 'test-csrf-token') {
        return [200, { success: true }];
      }
      return [403, { error: 'CSRF token missing' }];
    });
    
    // Make POST request
    const response = await secureApi.post('/api/data', { test: 'data' });
    
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });
  });
  
  test('should handle 401 errors and refresh token', async () => {
    // Mock initial request that returns 401
    mock.onGet('/api/protected').reply(401);
    
    // Mock token refresh endpoint
    mock.onPost('/api/auth/refresh').reply(200, {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token'
    });
    
    // Mock retry request with new token
    mock.onGet('/api/protected', {
      headers: {
        'Authorization': 'Bearer new-access-token'
      }
    }).reply(200, { data: 'protected' });
    
    try {
      // Make request that will fail with 401
      await secureApi.get('/api/protected');
    } catch (error) {
      // Should handle error and refresh token
      expect(error.response.status).toBe(401);
    }
    
    // Token refresh logic should be tested here
    // ...
  });
});
```

### 4.3. Bağımlılık Yönetimi

#### 4.3.1. Dependabot Yapılandırması

```yaml
# .github/dependabot.yml
version: 2
updates:
  # UI Desktop npm bağımlılıkları
  - package-ecosystem: "npm"
    directory: "/ui-desktop"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    versioning-strategy: auto
    labels:
      - "dependencies"
      - "ui-desktop"
    allow:
      - dependency-type: "direct"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-patch"]
    commit-message:
      prefix: "deps"
      include: "scope"
```

#### 4.3.2. Renovate Yapılandırması (Alternatif)

```json
// renovate.json
{
  "extends": [
    "config:base"
  ],
  "packageRules": [
    {
      "matchPaths": ["ui-desktop/**"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    },
    {
      "matchPackagePatterns": ["^eslint", "^prettier"],
      "groupName": "linters"
    },
    {
      "matchPackagePatterns": ["^@types/"],
      "automerge": true
    }
  ],
  "vulnerabilityAlerts": {
    "labels": ["security"],
    "assignees": ["@krozenking"]
  }
}
```

## 5. Uygulama Planı

### 5.1. Öncelikli Görevler

1. **Electron Güvenlik Yapılandırması**
   - Context isolation ve sandbox yapılandırması
   - Content Security Policy (CSP) uygulaması
   - Güvenli IPC iletişimi
   - Güvenli otomatik güncellemeler

2. **UI Bileşen Güvenlik İyileştirmeleri**
   - Input sanitization
   - API güvenliği
   - Güvenli yerel depolama
   - Zustand store güvenliği
   - Sürükle-bırak güvenliği

3. **DevOps İyileştirmeleri**
   - UI Desktop CI/CD pipeline
   - Güvenlik taramaları
   - Electron builder yapılandırması
   - Otomatik güvenlik testleri
   - Bağımlılık yönetimi

### 5.2. Zaman Çizelgesi

1. **Hafta 1: Temel Güvenlik Yapılandırması**
   - Electron güvenlik yapılandırması
   - UI bileşen güvenlik iyileştirmeleri

2. **Hafta 2: DevOps Altyapısı**
   - CI/CD pipeline kurulumu
   - Güvenlik taramaları entegrasyonu
   - Otomatik güvenlik testleri

3. **Hafta 3: Test ve Optimizasyon**
   - Güvenlik testleri
   - Performans optimizasyonu
   - Dokümantasyon

## 6. Sonuç

Bu belge, ALT_LAS projesinin yeni eklenen UI desktop uygulaması için güvenlik ve DevOps iyileştirmelerini tanımlamaktadır. Electron güvenlik riskleri, UI bileşen güvenlik riskleri ve DevOps eksiklikleri tespit edilmiş ve bunlara yönelik çözümler önerilmiştir.

Önerilen iyileştirmeler, ALT_LAS projesinin güvenliğini ve DevOps süreçlerini önemli ölçüde artıracak ve projenin başarısına katkı sağlayacaktır. Bu iyileştirmelerin uygulanması, güvenli ve sürdürülebilir bir UI desktop uygulaması geliştirmeyi mümkün kılacaktır.
