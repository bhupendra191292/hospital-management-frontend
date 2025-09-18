
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('@/config/environment', () => ({
  environment: {
    VITE_API_BASE_URL: 'http://localhost:5002/api',
    VITE_APP_NAME: 'Digital Hospital',
    VITE_APP_VERSION: '1.0.0',
    VITE_ENVIRONMENT: 'test',
  },
  isDevelopment: () => true, // Set to true for tests
  isProduction: () => false,
  isStaging: () => false,
  getApiBaseUrl: () => 'http://localhost:5002/api',
  APP_CONSTANTS: {
    APP_NAME: 'Digital Hospital',
    APP_VERSION: '1.0.0',
    API_BASE_URL: 'http://localhost:5002/api',
    ENVIRONMENT: 'test',
    DEFAULT_PAGE_SIZE: 10,
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    SUPPORTED_FILE_TYPES: ['.pdf', '.jpg', '.jpeg', '.png'],
    SESSION_TIMEOUT: 30 * 60 * 1000,
  },
  FEATURE_FLAGS: {
    ANALYTICS: true,
    PATIENT_COMMUNICATION: true,
    ADVANCED_REPORTS: true,
    FILE_UPLOAD: true,
    REAL_TIME_NOTIFICATIONS: false,
  },
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/doctors/login',
      LOGOUT: '/doctors/logout',
      REFRESH: '/doctors/refresh',
    },
    PATIENTS: {
      LIST: '/patients',
      CREATE: '/patients/register',
      GET_BY_ID: (id: string) => `/patients/${id}`,
      UPDATE: (id: string) => `/patients/${id}`,
      DELETE: (id: string) => `/patients/${id}`,
      CHECK: '/patients/check',
    },
    VISITS: {
      LIST: '/visits',
      CREATE: '/visits',
      GET_BY_ID: (id: string) => `/visits/${id}`,
      UPDATE: (id: string) => `/visits/${id}`,
      DELETE: (id: string) => `/visits/${id}`,
      GET_BY_PATIENT: (patientId: string) => `/patients/${patientId}/visits`,
      UPLOAD_REPORT: (id: string) => `/visits/${id}/report`,
    },
    APPOINTMENTS: {
      LIST: '/appointments',
      CREATE: '/appointments',
      GET_BY_ID: (id: string) => `/appointments/${id}`,
      UPDATE: (id: string) => `/appointments/${id}`,
      DELETE: (id: string) => `/appointments/${id}`,
    },
    DOCTORS: {
      LIST: '/doctors',
      CREATE: '/doctors',
      GET_BY_ID: (id: string) => `/doctors/${id}`,
      UPDATE: (id: string) => `/doctors/${id}`,
      DELETE: (id: string) => `/doctors/${id}`,
      PROMOTE: (id: string) => `/doctors/${id}/promote`,
    },
    ANALYTICS: {
      TRENDS: '/analytics/trends',
      DASHBOARD_SUMMARY: '/dashboard/summary',
    },
    REPORTS: {
      GENERATE: '/reports/generate',
      DOWNLOAD: (id: string) => `/reports/${id}/download`,
    },
  },
}));

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => 
      React.createElement('a', { href: to }, children),
  };
});

// Mock react-redux
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
    useSelector: vi.fn(),
  };
});

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  ArcElement: {},
  BarElement: {},
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => React.createElement('div', { 'data-testid': 'line-chart' }),
  Bar: () => React.createElement('div', { 'data-testid': 'bar-chart' }),
  Doughnut: () => React.createElement('div', { 'data-testid': 'doughnut-chart' }),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
