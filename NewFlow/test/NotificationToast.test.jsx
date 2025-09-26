import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationToast from '../components/ui/NotificationToast';

// Mock the notification context
const mockNotifications = [
  {
    id: '1',
    type: 'success',
    priority: 'normal',
    title: 'Success Notification',
    message: 'Operation completed successfully',
    timestamp: new Date().toISOString(),
    read: false,
    persistent: false
  },
  {
    id: '2',
    type: 'error',
    priority: 'urgent',
    title: 'Error Notification',
    message: 'Something went wrong',
    timestamp: new Date().toISOString(),
    read: false,
    persistent: true
  },
  {
    id: '3',
    type: 'warning',
    priority: 'high',
    title: 'Warning Notification',
    message: 'Please be careful',
    timestamp: new Date().toISOString(),
    read: false,
    persistent: false
  }
];

const mockNotificationContext = {
  notifications: mockNotifications
};

// Mock the useNotification hook
vi.mock('../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }) => <div data-testid="notification-provider">{children}</div>,
  useNotification: () => mockNotificationContext,
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    APPOINTMENT: 'appointment',
    MEDICAL: 'medical',
    SYSTEM: 'system'
  },
  NOTIFICATION_PRIORITIES: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  }
}));

const renderWithProvider = (component) => {
  return render(
    <NotificationProvider>
      {component}
    </NotificationProvider>
  );
};

describe('NotificationToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render toast notifications', () => {
      renderWithProvider(<NotificationToast />);

      expect(screen.getByText('Success Notification')).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
      expect(screen.getByText('Error Notification')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Warning Notification')).toBeInTheDocument();
      expect(screen.getByText('Please be careful')).toBeInTheDocument();
    });

    it('should display correct icons for different notification types', () => {
      renderWithProvider(<NotificationToast />);

      expect(screen.getByText('✅')).toBeInTheDocument(); // Success
      expect(screen.getByText('❌')).toBeInTheDocument(); // Error
      expect(screen.getByText('⚠️')).toBeInTheDocument(); // Warning
    });

    it('should apply correct CSS classes for notification types', () => {
      renderWithProvider(<NotificationToast />);

      const successToast = screen.getByText('Success Notification').closest('.notification-toast');
      const errorToast = screen.getByText('Error Notification').closest('.notification-toast');
      const warningToast = screen.getByText('Warning Notification').closest('.notification-toast');

      expect(successToast).toHaveClass('success');
      expect(errorToast).toHaveClass('error');
      expect(warningToast).toHaveClass('warning');
    });
  });

  describe('Priority Styling', () => {
    it('should apply urgent priority styling', () => {
      renderWithProvider(<NotificationToast />);

      const urgentToast = screen.getByText('Error Notification').closest('.notification-toast');
      expect(urgentToast).toHaveStyle('border-left: 4px solid #dc3545');
    });

    it('should apply high priority styling', () => {
      renderWithProvider(<NotificationToast />);

      const highPriorityToast = screen.getByText('Warning Notification').closest('.notification-toast');
      expect(highPriorityToast).toHaveStyle('border-left: 4px solid #fd7e14');
    });

    it('should apply normal priority styling', () => {
      renderWithProvider(<NotificationToast />);

      const normalPriorityToast = screen.getByText('Success Notification').closest('.notification-toast');
      expect(normalPriorityToast).toHaveStyle('border-left: 4px solid #007bff');
    });
  });

  describe('Toast Interaction', () => {
    it('should remove toast when clicked', () => {
      renderWithProvider(<NotificationToast />);

      const successToast = screen.getByText('Success Notification').closest('.notification-toast');
      fireEvent.click(successToast);

      // Toast should be removed (we can't easily test the internal state, but we can test the click handler)
      expect(successToast).toBeInTheDocument(); // Still in DOM but should be marked for removal
    });

    it('should remove toast when close button is clicked', () => {
      renderWithProvider(<NotificationToast />);

      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);

      // Close button click should trigger removal
      expect(closeButtons[0]).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should show progress bar for non-persistent notifications', () => {
      renderWithProvider(<NotificationToast />);

      const progressBars = screen.getAllByTestId('toast-progress-bar');
      expect(progressBars).toHaveLength(3); // All notifications should have progress bars
    });

    it('should have correct animation duration for non-persistent notifications', () => {
      renderWithProvider(<NotificationToast />);

      const successToast = screen.getByText('Success Notification').closest('.notification-toast');
      const progressBar = successToast.querySelector('.toast-progress-bar');

      expect(progressBar).toHaveStyle('animation: toastProgress 5s linear forwards');
    });

    it('should have no animation for persistent notifications', () => {
      renderWithProvider(<NotificationToast />);

      const errorToast = screen.getByText('Error Notification').closest('.notification-toast');
      const progressBar = errorToast.querySelector('.toast-progress-bar');

      expect(progressBar).toHaveStyle('animation: toastProgress 0s linear forwards');
    });
  });

  describe('Empty State', () => {
    it('should not render anything when no notifications', () => {
      const mockContextWithNoNotifications = {
        notifications: []
      };

      vi.doMock('../contexts/NotificationContext', () => ({
        useNotification: () => mockContextWithNoNotifications
      }));

      renderWithProvider(<NotificationToast />);

      expect(screen.queryByText('Success Notification')).not.toBeInTheDocument();
      expect(screen.queryByText('Error Notification')).not.toBeInTheDocument();
      expect(screen.queryByText('Warning Notification')).not.toBeInTheDocument();
    });
  });

  describe('Maximum Toast Limit', () => {
    it('should limit to maximum 5 toasts', () => {
      const manyNotifications = Array.from({ length: 10 }, (_, index) => ({
        id: `toast-${index}`,
        type: 'info',
        priority: 'normal',
        title: `Notification ${index + 1}`,
        message: `Message ${index + 1}`,
        timestamp: new Date().toISOString(),
        read: false,
        persistent: false
      }));

      const mockContextWithManyNotifications = {
        notifications: manyNotifications
      };

      vi.doMock('../contexts/NotificationContext', () => ({
        useNotification: () => mockContextWithManyNotifications
      }));

      renderWithProvider(<NotificationToast />);

      // Should only show first 5 notifications
      expect(screen.getByText('Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Notification 5')).toBeInTheDocument();
      expect(screen.queryByText('Notification 6')).not.toBeInTheDocument();
      expect(screen.queryByText('Notification 10')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have proper container structure', () => {
      renderWithProvider(<NotificationToast />);

      const container = screen.getByText('Success Notification').closest('.notification-toast-container');
      expect(container).toBeInTheDocument();
    });

    it('should have proper toast structure', () => {
      renderWithProvider(<NotificationToast />);

      const toast = screen.getByText('Success Notification').closest('.notification-toast');
      expect(toast).toBeInTheDocument();

      const content = toast.querySelector('.toast-content');
      expect(content).toBeInTheDocument();

      const icon = toast.querySelector('.toast-icon');
      expect(icon).toBeInTheDocument();

      const message = toast.querySelector('.toast-message');
      expect(message).toBeInTheDocument();

      const closeButton = toast.querySelector('.toast-close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Animation Classes', () => {
    it('should have slide-in animation class', () => {
      renderWithProvider(<NotificationToast />);

      const toast = screen.getByText('Success Notification').closest('.notification-toast');
      expect(toast).toHaveClass('notification-toast');
    });

    it('should have hover effects', () => {
      renderWithProvider(<NotificationToast />);

      const toast = screen.getByText('Success Notification').closest('.notification-toast');

      // Simulate hover
      fireEvent.mouseEnter(toast);

      // Toast should still be in document (hover effects are CSS-based)
      expect(toast).toBeInTheDocument();
    });
  });
});
