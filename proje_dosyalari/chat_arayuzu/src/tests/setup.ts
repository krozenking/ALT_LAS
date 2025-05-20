import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor() {
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
  }

  disconnect() {
    return null;
  }

  observe() {
    return null;
  }

  takeRecords() {
    return [];
  }

  unobserve() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {}

  disconnect() {
    return null;
  }

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }
}

global.ResizeObserver = MockResizeObserver;

// Mock Web Speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  abort: vi.fn()
};

global.SpeechRecognition = vi.fn().mockImplementation(() => mockSpeechRecognition);
global.webkitSpeechRecognition = vi.fn().mockImplementation(() => mockSpeechRecognition);

// Mock Web Audio API
const mockAudioContext = {
  createMediaStreamSource: vi.fn().mockReturnValue({
    connect: vi.fn()
  }),
  createAnalyser: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    fftSize: 0,
    getByteFrequencyData: vi.fn()
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { value: 1 }
  }),
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  }),
  destination: {},
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined)
};

global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
global.webkitAudioContext = vi.fn().mockImplementation(() => mockAudioContext);

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive',
  ondataavailable: vi.fn(),
  onstop: vi.fn(),
  onerror: vi.fn()
};

global.MediaRecorder = vi.fn().mockImplementation(() => mockMediaRecorder);

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: vi.fn().mockReturnValue([{
      stop: vi.fn()
    }])
  }),
  enumerateDevices: vi.fn().mockResolvedValue([]),
  getSupportedConstraints: vi.fn().mockReturnValue({})
};

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
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = (() => {
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
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue('mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Blob
global.Blob = vi.fn().mockImplementation((content = [], options = {}) => ({
  size: Array.isArray(content) ? content.reduce((acc: number, curr: string) => acc + (curr?.length || 0), 0) : 0,
  type: options?.type || '',
  text: vi.fn().mockResolvedValue(Array.isArray(content) ? content.join('') : ''),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  slice: vi.fn().mockReturnThis()
}));

// Mock File
global.File = vi.fn().mockImplementation((content = [], fileName = 'mock-file', options = {}) => {
  const blob = new Blob(content, options);
  return {
    size: blob.size,
    type: blob.type,
    name: fileName,
    lastModified: Date.now(),
    text: blob.text,
    arrayBuffer: blob.arrayBuffer,
    slice: blob.slice
  };
});

// Mock FileReader
const mockFileReader = {
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
  abort: vi.fn()
};

global.FileReader = vi.fn().mockImplementation(() => mockFileReader);

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({}),
  text: vi.fn().mockResolvedValue(''),
  blob: vi.fn().mockResolvedValue(new Blob([])),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  headers: new Headers(),
  status: 200,
  statusText: 'OK'
});

// Temizleme
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
