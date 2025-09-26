/* eslint-env jest */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RoleProvider } from '../contexts/RoleContext';

// Mock store for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, token: null, ...initialState.auth }, action) => state,
    },
    preloadedState: initialState,
  });
};

// Mock user for testing
export const mockUser = {
  _id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin',
  permissions: ['VIEW_PATIENTS', 'CREATE_PATIENTS', 'UPDATE_PATIENTS', 'DELETE_PATIENTS']
};

// Mock patient data
export const mockPatient = {
  _id: 'test-patient-id',
  name: 'John Doe',
  email: 'john@example.com',
  mobile: '9876543210',
  age: 30,
  gender: 'Male',
  dateOfBirth: '1993-01-01',
  address: '123 Test Street',
  emergencyContact: '9876543211',
  uhid: 'DELH01-240101-0001',
  status: 'Active',
  registrationDate: '2024-01-01'
};

// Mock doctor data
export const mockDoctor = {
  _id: 'test-doctor-id',
  name: 'Dr. Jane Smith',
  email: 'jane@example.com',
  phone: '9876543212',
  specialization: 'Cardiology',
  qualification: 'MBBS, MD',
  experience: 5,
  consultationFee: 500,
  availableDays: ['Monday', 'Tuesday', 'Wednesday'],
  status: 'active'
};

// Mock API responses
export const mockApiResponses = {
  success: (data) => ({
    data: {
      success: true,
      data,
      message: 'Success'
    }
  }),
  error: (message = 'Error occurred') => ({
    data: {
      success: false,
      message,
      errors: []
    }
  }),
  validationError: (errors) => ({
    data: {
      success: false,
      message: 'Validation failed',
      errors
    }
  })
};

// Custom render function with providers
export const renderWithProviders = (
  ui,
  {
    initialState = {},
    store = createMockStore(initialState),
    user = mockUser,
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        <RoleProvider initialUser={user}>
          {children}
        </RoleProvider>
      </BrowserRouter>
    </Provider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
};

// Mock API functions
export const mockApiFunctions = {
  getNewFlowPatients: jest.fn(),
  createNewFlowPatient: jest.fn(),
  updateNewFlowPatient: jest.fn(),
  deleteNewFlowPatient: jest.fn(),
  getAllNewFlowDoctors: jest.fn(),
  createNewFlowDoctor: jest.fn(),
  updateNewFlowDoctor: jest.fn(),
  deleteNewFlowDoctor: jest.fn(),
  newFlowLogin: jest.fn(),
  getNewFlowVisits: jest.fn(),
  createNewFlowVisit: jest.fn(),
  updateNewFlowVisit: jest.fn(),
  deleteNewFlowVisit: jest.fn()
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Setup localStorage mock
export const setupLocalStorageMock = () => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
};

// Mock fetch
export const mockFetch = (response, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
    })
  );
};

// Test utilities
export const testUtils = {
  // Wait for element to appear
  waitForElement: async (selector) => {
    return await waitFor(() => screen.getByTestId(selector));
  },

  // Wait for text to appear
  waitForText: async (text) => {
    return await waitFor(() => screen.getByText(text));
  },

  // Fill form field
  fillField: (name, value) => {
    const field = screen.getByLabelText(new RegExp(name, 'i'));
    fireEvent.change(field, { target: { value } });
    return field;
  },

  // Click button by text
  clickButton: (text) => {
    const button = screen.getByRole('button', { name: new RegExp(text, 'i') });
    fireEvent.click(button);
    return button;
  },

  // Click button by test id
  clickButtonById: (testId) => {
    const button = screen.getByTestId(testId);
    fireEvent.click(button);
    return button;
  },

  // Select option from dropdown
  selectOption: (label, optionText) => {
    const select = screen.getByLabelText(new RegExp(label, 'i'));
    fireEvent.change(select, { target: { value: optionText } });
    return select;
  },

  // Check if element exists
  elementExists: (text) => {
    try {
      screen.getByText(text);
      return true;
    } catch {
      return false;
    }
  },

  // Get element by test id
  getByTestId: (testId) => {
    return screen.getByTestId(testId);
  },

  // Get all elements by test id
  getAllByTestId: (testId) => {
    return screen.getAllByTestId(testId);
  },

  // Mock console methods
  mockConsole: () => {
    const originalConsole = { ...console };
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    return originalConsole;
  },

  // Restore console
  restoreConsole: (originalConsole) => {
    Object.assign(console, originalConsole);
  }
};

// Common test data
export const testData = {
  validPatient: {
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '9876543210',
    age: 30,
    gender: 'Male',
    dateOfBirth: '1993-01-01',
    address: '123 Test Street',
    emergencyContact: '9876543211'
  },

  validDoctor: {
    name: 'Dr. Jane Smith',
    phone: '9876543212',
    email: 'jane@example.com',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    experience: 5,
    consultationFee: 500,
    availableDays: ['Monday', 'Tuesday', 'Wednesday']
  },

  invalidPatient: {
    name: '', // Invalid: empty name
    email: 'invalid-email', // Invalid: bad email format
    mobile: '123', // Invalid: too short
    age: -1, // Invalid: negative age
    gender: '', // Invalid: empty gender
    dateOfBirth: '', // Invalid: empty date
    address: '', // Invalid: empty address
    emergencyContact: '123' // Invalid: too short
  }
};

// Mock error responses
export const mockErrors = {
  networkError: new Error('Network Error'),
  validationError: {
    response: {
      status: 400,
      data: {
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' }
        ]
      }
    }
  },
  serverError: {
    response: {
      status: 500,
      data: {
        success: false,
        message: 'Internal server error'
      }
    }
  }
};

export default {
  renderWithProviders,
  mockApiFunctions,
  mockLocalStorage,
  setupLocalStorageMock,
  mockFetch,
  testUtils,
  testData,
  mockErrors,
  mockUser,
  mockPatient,
  mockDoctor,
  mockApiResponses
};
