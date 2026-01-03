import '@testing-library/jest-dom';

// Mock i18n with readable test values
const mockTranslations = {
  'courses.sections': 'sections',
  'courses.mins': 'min',
  'courses.continue': 'Continue',
  'courses.continueLearning': 'Continue Learning',
  'courses.viewDetail': 'View Detail',
  'common.progress': 'Progress',
  'common.completed': 'Completed',
};

jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    locale: 'en',
    setLocale: jest.fn(),
    t: (key, params) => {
      // Return mapped translation or key
      const translation = mockTranslations[key] || key;
      if (params) {
        let result = translation;
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v).replace(`{${k}}`, v);
        });
        return result;
      }
      return translation;
    },
    messages: {},
  }),
  useT: () => (key) => mockTranslations[key] || key,
  I18nProvider: ({ children }) => children,
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    themes: ['light', 'dark', 'system'],
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  takeRecords() {
    return [];
  }
  unobserve() { }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  unobserve() { }
};

// Mock canvas-confetti
jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Suppress console errors in tests (optional)
// Uncomment if you want cleaner test output
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     if (
//       typeof args[0] === 'string' &&
//       args[0].includes('Warning: ReactDOM.render')
//     ) {
//       return;
//     }
//     originalError.call(console, ...args);
//   };
// });
// 
// afterAll(() => {
//   console.error = originalError;
// });

// Set test timeout
jest.setTimeout(10000);
