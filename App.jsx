import { Suspense, lazy } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import ErrorBoundary from './components/ErrorBoundary';
import { usePerformance } from './NewFlow/hooks/usePerformance';
import { RoleProvider } from './NewFlow/contexts/RoleContext';
import { NotificationProvider } from './NewFlow/contexts/NotificationContext';
import { NotificationToast } from './NewFlow/components/ui';
import './App.css';
import './NewFlow/styles/variables.css';
import './NewFlow/styles/modal-utilities.css';

// NewFlow components only
const NewFlowDashboard = lazy(() => import('./NewFlow/Dashboard'));
const NewFlowLogin = lazy(() => import('./NewFlow/Login'));
const DoctorRegistration = lazy(() => import('./NewFlow/pages/DoctorRegistration'));
const PrescriptionManagement = lazy(() => import('./NewFlow/components/PrescriptionManagement'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const TenantRegistration = lazy(() => import('./pages/TenantRegistration'));

// Loading component
const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

// Error fallback component
const ErrorFallback = ({ error, errorInfo, resetError }) => (
  <div className="error-fallback">
    <div className="error-content">
      <h2>🚨 Application Error</h2>
      <p>Something went wrong with the application. Please try again.</p>
      <div className="error-actions">
        <button onClick={resetError} className="btn btn-primary">
          Try Again
        </button>
        <button onClick={() => window.location.reload()} className="btn btn-secondary">
          Reload Page
        </button>
      </div>
      {import.meta.env.DEV && (
        <details className="error-details">
          <summary>Error Details</summary>
          <pre>{error?.message}</pre>
          <pre>{errorInfo?.componentStack}</pre>
        </details>
      )}
    </div>
  </div>
);

// Main App component with performance monitoring
const AppContent = () => {
  // Initialize performance monitoring
  const performance = usePerformance();

  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
        // In production, send to error reporting service
      }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <NotificationProvider>
          <RoleProvider>
            <Routes>
              <Route path="/" element={<NewFlowLogin />} />
              <Route path="/login" element={<NewFlowLogin />} />
              <Route path="/dashboard" element={<NewFlowDashboard />} />
              <Route path="/prescriptions" element={<PrescriptionManagement />} />
              <Route path="/register" element={<TenantRegistration />} />
              <Route path="/doctor-register" element={<DoctorRegistration />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
            <NotificationToast />
          </RoleProvider>
        </NotificationProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

// Root App component
const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary
          fallback={ErrorFallback}
          onError={(error, errorInfo) => {
            console.error('Root App Error:', error, errorInfo);
          }}
        >
          <AppContent />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
