import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationBell from '../components/ui/NotificationBell';

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
    priority: 'high',
    title: 'Error Notification',
    message: 'Something went wrong',
    timestamp: new Date().toISOString(),
    read: true,
    persistent: true
  }
];

const mockNotificationContext = {
  notifications: mockNotifications,
  unreadCount: 1,
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  clearAll: vi.fn(),
  getUnreadNotifications: vi.fn(() => [mockNotifications[0]])
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

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render notification bell with correct unread count', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      expect(bell).toBeInTheDocument();
      
      const badge = screen.getByText('1');
      expect(badge).toBeInTheDocument();
    });

    it('should not show badge when unread count is zero', () => {
      const mockContextWithNoUnread = {
        ...mockNotificationContext,
        unreadCount: 0
      };
      
      vi.doMock('../contexts/NotificationContext', () => ({
        useNotification: () => mockContextWithNoUnread
      }));

      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      expect(bell).toBeInTheDocument();
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should show 99+ when unread count exceeds 99', () => {
      const mockContextWithHighCount = {
        ...mockNotificationContext,
        unreadCount: 150
      };
      
      vi.doMock('../contexts/NotificationContext', () => ({
        useNotification: () => mockContextWithHighCount
      }));

      renderWithProvider(<NotificationBell />);
      
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  describe('Bell Click Interaction', () => {
    it('should open dropdown when bell is clicked', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Mark all as read')).toBeInTheDocument();
      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });

    it('should close dropdown when bell is clicked again', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      
      // Open dropdown
      fireEvent.click(bell);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      
      // Close dropdown
      fireEvent.click(bell);
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  describe('Notification List', () => {
    it('should display notifications in dropdown', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      expect(screen.getByText('Success Notification')).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
      expect(screen.getByText('Error Notification')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should show unread indicator for unread notifications', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      // Check for unread indicator (blue dot)
      const unreadIndicators = screen.getAllByTestId('unread-indicator');
      expect(unreadIndicators).toHaveLength(1);
    });

    it('should display notification metadata', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      expect(screen.getByText('Just now')).toBeInTheDocument();
      expect(screen.getByText('normal')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
    });
  });

  describe('Notification Actions', () => {
    it('should call markAsRead when notification is clicked', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      const notification = screen.getByText('Success Notification');
      fireEvent.click(notification);
      
      expect(mockNotificationContext.markAsRead).toHaveBeenCalledWith('1');
    });

    it('should call markAllAsRead when mark all button is clicked', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      const markAllButton = screen.getByText('Mark all as read');
      fireEvent.click(markAllButton);
      
      expect(mockNotificationContext.markAllAsRead).toHaveBeenCalled();
    });

    it('should call clearAll when clear all button is clicked', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      const clearAllButton = screen.getByText('Clear all');
      fireEvent.click(clearAllButton);
      
      expect(mockNotificationContext.clearAll).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show no notifications message when list is empty', () => {
      const mockContextWithNoNotifications = {
        ...mockNotificationContext,
        notifications: [],
        unreadCount: 0
      };
      
      vi.doMock('../contexts/NotificationContext', () => ({
        useNotification: () => mockContextWithNoNotifications
      }));

      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  describe('Click Outside to Close', () => {
    it('should close dropdown when clicking outside', async () => {
      renderWithProvider(
        <div>
          <NotificationBell />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bell);
      
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      
      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);
      
      await waitFor(() => {
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      expect(bell).toHaveAttribute('aria-label', 'Notifications (1 unread)');
    });

    it('should have proper ARIA label when no unread notifications', () => {
      const mockContextWithNoUnread = {
        ...mockNotificationContext,
        unreadCount: 0
      };
      
      vi.doMock('../contexts/NotificationContext', () => ({
        useNotification: () => mockContextWithNoUnread
      }));

      renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      expect(bell).toHaveAttribute('aria-label', 'Notifications');
    });
  });

  describe('Animation', () => {
    it('should add animating class when new notification arrives', () => {
      const { rerender } = renderWithProvider(<NotificationBell />);
      
      const bell = screen.getByRole('button', { name: /notifications/i });
      
      // Simulate new notification by changing unread count
      const mockContextWithNewNotification = {
        ...mockNotificationContext,
        unreadCount: 2
      };
      
      jest.doMock('../contexts/NotificationContext', () => ({
        useNotification: () => mockContextWithNewNotification
      }));

      rerender(
        <NotificationProvider>
          <NotificationBell />
        </NotificationProvider>
      );
      
      // The animation class should be added temporarily
      expect(bell).toHaveClass('animating');
    });
  });
});
