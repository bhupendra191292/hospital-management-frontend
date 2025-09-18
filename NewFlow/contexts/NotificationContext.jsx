import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  APPOINTMENT: 'appointment',
  MEDICAL: 'medical',
  SYSTEM: 'system'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: true,
  settings: {
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: true,
    pushNotifications: true
  }
};

// Action types
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  CLEAR_ALL: 'CLEAR_ALL',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  BULK_ADD: 'BULK_ADD'
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = {
        id: action.payload.id || Date.now().toString(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        priority: action.payload.priority || NOTIFICATION_PRIORITIES.NORMAL,
        title: action.payload.title,
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        read: false,
        persistent: action.payload.persistent || false,
        actions: action.payload.actions || [],
        data: action.payload.data || {}
      };
      
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notificationToRemove && !notificationToRemove.read 
          ? state.unreadCount - 1 
          : state.unreadCount
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case NOTIFICATION_ACTIONS.SET_CONNECTION_STATUS:
      return {
        ...state,
        isConnected: action.payload
      };

    case NOTIFICATION_ACTIONS.BULK_ADD:
      const newNotifications = action.payload.map(notification => ({
        id: notification.id || Date.now().toString() + Math.random(),
        type: notification.type || NOTIFICATION_TYPES.INFO,
        priority: notification.priority || NOTIFICATION_PRIORITIES.NORMAL,
        title: notification.title,
        message: notification.message,
        timestamp: new Date().toISOString(),
        read: false,
        persistent: notification.persistent || false,
        actions: notification.actions || [],
        data: notification.data || {}
      }));
      
      return {
        ...state,
        notifications: [...newNotifications, ...state.notifications],
        unreadCount: state.unreadCount + newNotifications.length
      };

    default:
      return state;
  }
};

// Context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Auto-remove non-persistent notifications after 5 seconds
  useEffect(() => {
    const timers = state.notifications
      .filter(n => !n.persistent && !n.read)
      .map(notification => {
        return setTimeout(() => {
          dispatch({
            type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
            payload: notification.id
          });
        }, 5000);
      });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [state.notifications]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (state.settings.soundEnabled) {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Fallback to system beep if audio file not found
          console.log('\u0007'); // ASCII bell character
        });
      } catch (error) {
        console.log('\u0007'); // Fallback to system beep
      }
    }
  }, [state.settings.soundEnabled]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification) => {
    if (state.settings.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
          requireInteraction: notification.priority === NOTIFICATION_PRIORITIES.URGENT
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id
            });
          }
        });
      }
    }
  }, [state.settings.desktopNotifications]);

  // Add notification
  const addNotification = useCallback((notification) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: notification
    });

    // Play sound and show desktop notification
    playNotificationSound();
    showDesktopNotification(notification);
  }, [playNotificationSound, showDesktopNotification]);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    });
  }, []);

  // Mark as read
  const markAsRead = useCallback((id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.MARK_AS_READ,
      payload: id
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    dispatch({
      type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({
      type: NOTIFICATION_ACTIONS.CLEAR_ALL
    });
  }, []);

  // Update settings
  const updateSettings = useCallback((settings) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
      payload: settings
    });
  }, []);

  // Set connection status
  const setConnectionStatus = useCallback((isConnected) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.SET_CONNECTION_STATUS,
      payload: isConnected
    });
  }, []);

  // Bulk add notifications
  const bulkAddNotifications = useCallback((notifications) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.BULK_ADD,
      payload: notifications
    });
  }, []);

  // Quick notification methods
  const notifySuccess = useCallback((title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyError = useCallback((title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title,
      message,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  const notifyWarning = useCallback((title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      priority: NOTIFICATION_PRIORITIES.NORMAL,
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyInfo = useCallback((title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyAppointment = useCallback((title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.APPOINTMENT,
      priority: NOTIFICATION_PRIORITIES.NORMAL,
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const notifyMedical = useCallback((title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.MEDICAL,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title,
      message,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  const notifySystem = useCallback((title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.SYSTEM,
      priority: NOTIFICATION_PRIORITIES.LOW,
      title,
      message,
      ...options
    });
  }, [addNotification]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return state.notifications.filter(n => n.type === type);
  }, [state.notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(n => !n.read);
  }, [state.notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority) => {
    return state.notifications.filter(n => n.priority === priority);
  }, [state.notifications]);

  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isConnected: state.isConnected,
    settings: state.settings,
    
    // Actions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings,
    setConnectionStatus,
    bulkAddNotifications,
    
    // Quick methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyAppointment,
    notifyMedical,
    notifySystem,
    
    // Getters
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByPriority,
    
    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
