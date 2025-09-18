import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NotificationProvider, useNotification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../contexts/NotificationContext';

// Mock HTMLMediaElement.play() to avoid JSDOM errors
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

// Test component to access notification context
const TestComponent = () => {
  const {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyAppointment,
    notifyMedical,
    notifySystem
  } = useNotification();

  return (
    <div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <button onClick={() => addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'Test Notification',
        message: 'This is a test notification'
      })}>
        Add Notification
      </button>
      <button onClick={() => notifySuccess('Success', 'Operation completed successfully')}>
        Notify Success
      </button>
      <button onClick={() => notifyError('Error', 'Something went wrong')}>
        Notify Error
      </button>
      <button onClick={() => notifyWarning('Warning', 'Please be careful')}>
        Notify Warning
      </button>
      <button onClick={() => notifyInfo('Info', 'Here is some information')}>
        Notify Info
      </button>
      <button onClick={() => notifyAppointment('Appointment', 'You have an appointment')}>
        Notify Appointment
      </button>
      <button onClick={() => notifyMedical('Medical', 'Medical update available')}>
        Notify Medical
      </button>
      <button onClick={() => notifySystem('System', 'System maintenance scheduled')}>
        Notify System
      </button>
      <button onClick={() => markAsRead(notifications[0]?.id)}>
        Mark First as Read
      </button>
      <button onClick={markAllAsRead}>
        Mark All as Read
      </button>
      <button onClick={() => removeNotification(notifications[0]?.id)}>
        Remove First
      </button>
      <button onClick={clearAll}>
        Clear All
      </button>
    </div>
  );
};

describe('NotificationContext', () => {
  const renderWithProvider = (component) => {
    return render(
      <NotificationProvider>
        {component}
      </NotificationProvider>
    );
  };

  beforeEach(() => {
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty notifications and zero unread count initially', () => {
      renderWithProvider(<TestComponent />);
      
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    });
  });

  describe('Adding Notifications', () => {
    it('should add a notification and increment unread count', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Add Notification').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });

    it('should add multiple notifications', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Add Notification').click();
        screen.getByText('Add Notification').click();
        screen.getByText('Add Notification').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('3');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
    });
  });

  describe('Quick Notification Methods', () => {
    it('should add success notification with correct type and priority', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Notify Success').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });

    it('should add error notification with high priority and persistent flag', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Notify Error').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });

    it('should add warning notification', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Notify Warning').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });

    it('should add info notification', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Notify Info').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });

    it('should add appointment notification', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Notify Appointment').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });

    it('should add medical notification with high priority and persistent flag', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Notify Medical').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });

    it('should add system notification with low priority', () => {
      renderWithProvider(<TestComponent />);
      
      act(() => {
        screen.getByText('Notify System').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });
  });

  describe('Marking as Read', () => {
    it('should mark a notification as read and decrement unread count', () => {
      renderWithProvider(<TestComponent />);
      
      // Add a notification first
      act(() => {
        screen.getByText('Add Notification').click();
      });

      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');

      // Mark as read
      act(() => {
        screen.getByText('Mark First as Read').click();
      });

      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });

    it('should mark all notifications as read', () => {
      renderWithProvider(<TestComponent />);
      
      // Add multiple notifications
      act(() => {
        screen.getByText('Add Notification').click();
        screen.getByText('Add Notification').click();
        screen.getByText('Add Notification').click();
      });

      expect(screen.getByTestId('unread-count')).toHaveTextContent('3');

      // Mark all as read
      act(() => {
        screen.getByText('Mark All as Read').click();
      });

      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });
  });

  describe('Removing Notifications', () => {
    it('should remove a notification', () => {
      renderWithProvider(<TestComponent />);
      
      // Add a notification first
      act(() => {
        screen.getByText('Add Notification').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

      // Remove the notification
      act(() => {
        screen.getByText('Remove First').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    });

    it('should clear all notifications', () => {
      renderWithProvider(<TestComponent />);
      
      // Add multiple notifications
      act(() => {
        screen.getByText('Add Notification').click();
        screen.getByText('Add Notification').click();
        screen.getByText('Add Notification').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('3');

      // Clear all
      act(() => {
        screen.getByText('Clear All').click();
      });

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useNotification is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useNotification must be used within a NotificationProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Constants', () => {
    it('should export correct notification types', () => {
      expect(NOTIFICATION_TYPES).toEqual({
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info',
        APPOINTMENT: 'appointment',
        MEDICAL: 'medical',
        SYSTEM: 'system'
      });
    });

    it('should export correct notification priorities', () => {
      expect(NOTIFICATION_PRIORITIES).toEqual({
        LOW: 'low',
        NORMAL: 'normal',
        HIGH: 'high',
        URGENT: 'urgent'
      });
    });
  });
});
