import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
// Mock the auth slice since it might not exist yet
const mockAuthSlice = {
  reducer: (state = {}, action: any) => state,
  actions: {
    setDoctor: () => ({ type: 'SET_DOCTOR' }),
    setToken: () => ({ type: 'SET_TOKEN' }),
    setRole: () => ({ type: 'SET_ROLE' }),
  },
};

// Create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: mockAuthSlice.reducer,
    },
    preloadedState,
  });
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock data for tests
export const mockUser = {
  _id: '1',
  name: 'Dr. Test User',
  phone: '1234567890',
  role: 'doctor' as const,
  specialization: 'General Medicine',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockPatient = {
  _id: '1',
  name: 'John Doe',
  phone: '9876543210',
  age: 30,
  gender: 'Male' as const,
  address: '123 Test Street, Test City',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockVisit = {
  _id: '1',
  patientId: '1',
  doctorId: '1',
  date: '2024-01-01T00:00:00.000Z',
  symptoms: 'Fever, cough',
  diagnosis: 'Common cold',
  prescription: [
    {
      medicine: 'Paracetamol',
      dose: '500mg',
      frequency: 'Twice daily',
    },
  ],
  notes: 'Patient should rest well',
  status: 'completed' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockAppointment = {
  _id: '1',
  patientId: '1',
  patientName: 'John Doe',
  date: '2024-01-01',
  time: '10:00',
  type: 'consultation' as const,
  status: 'confirmed' as const,
  notes: 'Regular checkup',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// Mock API responses
export const mockApiResponse = function<T>(data: T, success = true, message = 'Success') {
  return {
    success,
    data,
    message,
  };
};

export const mockErrorResponse = (message = 'Error occurred', code = 'ERROR') => ({
  success: false,
  error: message,
  code,
  timestamp: new Date().toISOString(),
});

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
