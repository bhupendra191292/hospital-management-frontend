import React, { Component, ErrorInfo, ReactNode } from 'react';

// Interface segregation for error boundary props
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: any[];
  shouldRethrow?: boolean;
  shouldRecover?: boolean;
}

/**
 * Enhanced Error Boundary Component
 *
 * Features:
 * - Comprehensive error handling
 * - Error recovery mechanisms
 * - Custom fallback components
 * - Error reporting and logging
 * - Performance optimization
 *
 * @param props - Error boundary configuration
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: ErrorBoundary.generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Report error to external service (e.g., Sentry)
    this.reportError(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetKeys change
    if (prevProps.resetKeys !== this.props.resetKeys) {
      this.resetError();
    }
  }

  private static generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.warn('Error would be reported to external service in production');
    }
  }

  private resetError = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });

    // Call onReset callback if provided
    this.props.onReset?.();
  };

  private handleRetry = (): void => {
    this.resetError();
  };

  private handleReport = (): void => {
    const { error, errorInfo, errorId } = this.state;
    if (error && errorInfo) {
      // In a real app, this would open a support ticket or email
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      console.log('Error Report:', errorReport);
      alert(`Error reported with ID: ${errorId}`);
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, shouldRethrow } = this.props;

    // Rethrow error if configured to do so
    if (hasError && shouldRethrow && error) {
      throw error;
    }

    // Show fallback UI if error occurred
    if (hasError) {
      // Custom fallback component
      if (typeof fallback === 'function') {
        return fallback(error!, errorInfo!, this.resetError);
      }

      // Custom fallback JSX
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return this.renderDefaultErrorUI();
    }

    return children;
  }

  private renderDefaultErrorUI(): ReactNode {
    const { error, errorInfo, errorId } = this.state;

    return (
      <div className="error-boundary">
        <div className="error-boundary-content">
          <div className="error-boundary-header">
            <h2>🚨 Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
          </div>

          <div className="error-boundary-details">
            {import.meta.env.DEV && (
              <details>
                <summary>Error Details (Development)</summary>
                <div className="error-details">
                  <h4>Error Message:</h4>
                  <pre>{error?.message}</pre>

                  <h4>Error Stack:</h4>
                  <pre>{error?.stack}</pre>

                  {errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{errorInfo.componentStack}</pre>
                    </>
                  )}

                  <h4>Error ID:</h4>
                  <code>{errorId}</code>
                </div>
              </details>
            )}

            <div className="error-boundary-actions">
              <button
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                🔄 Try Again
              </button>

              <button
                onClick={this.handleReport}
                className="btn btn-secondary"
              >
                📧 Report Issue
              </button>

              <button
                onClick={() => window.location.reload()}
                className="btn btn-outline"
              >
                🔄 Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
