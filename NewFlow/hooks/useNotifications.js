import { useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  NotificationWebSocket,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
} from '../services/notificationService';

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    settings,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings,
    setConnectionStatus,
    bulkAddNotifications
  } = useNotification();

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeWebSocket = () => {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`;
      
      wsRef.current = new NotificationWebSocket(
        wsUrl,
        handleWebSocketMessage,
        handleWebSocketError,
        handleWebSocketOpen,
        handleWebSocketClose
      );
      
      wsRef.current.connect();
    };

    // Initialize WebSocket if notifications are enabled
    if (settings.desktopNotifications || settings.pushNotifications) {
      initializeWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [settings.desktopNotifications, settings.pushNotifications]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'notification') {
      addNotification(data.notification);
    } else if (data.type === 'bulk_notifications') {
      bulkAddNotifications(data.notifications);
    } else if (data.type === 'notification_read') {
      markAsRead(data.notificationId);
    } else if (data.type === 'notification_deleted') {
      removeNotification(data.notificationId);
    }
  }, [addNotification, bulkAddNotifications, markAsRead, removeNotification]);

  // Handle WebSocket errors
  const handleWebSocketError = useCallback((error) => {
    console.error('Notification WebSocket error:', error);
    setConnectionStatus(false);
  }, [setConnectionStatus]);

  // Handle WebSocket open
  const handleWebSocketOpen = useCallback(() => {
    console.log('Notification WebSocket connected');
    setConnectionStatus(true);
  }, [setConnectionStatus]);

  // Handle WebSocket close
  const handleWebSocketClose = useCallback(() => {
    console.log('Notification WebSocket disconnected');
    setConnectionStatus(false);
  }, [setConnectionStatus]);

  // Load notifications from server
  const loadNotifications = useCallback(async (params = {}) => {
    try {
      const response = await getNotifications(params);
      if (response.success) {
        // Transform server notifications to client format
        const clientNotifications = response.data.notifications.map(notification => ({
          id: notification._id,
          type: notification.type,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          timestamp: notification.createdAt,
          read: notification.read,
          persistent: notification.persistent,
          actions: notification.actions || [],
          data: notification.data || {}
        }));
        
        bulkAddNotifications(clientNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [bulkAddNotifications]);

  // Mark notification as read on server
  const markAsReadOnServer = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [markAsRead]);

  // Mark all notifications as read on server
  const markAllAsReadOnServer = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [markAllAsRead]);

  // Delete notification on server
  const deleteNotificationOnServer = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      removeNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [removeNotification]);

  // Clear all notifications on server
  const clearAllOnServer = useCallback(async () => {
    try {
      await clearAllNotifications();
      clearAll();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }, [clearAll]);

  // Load settings from server
  const loadSettings = useCallback(async () => {
    try {
      const response = await getNotificationSettings();
      if (response.success) {
        updateSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, [updateSettings]);

  // Save settings to server
  const saveSettings = useCallback(async (newSettings) => {
    try {
      await updateNotificationSettings(newSettings);
      updateSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }, [updateSettings]);

  // Send notification to server
  const sendNotification = useCallback(async (notificationData) => {
    try {
      if (wsRef.current) {
        wsRef.current.send({
          type: 'send_notification',
          data: notificationData
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, []);

  // Subscribe to specific notification types
  const subscribeToType = useCallback(async (notificationType) => {
    try {
      if (wsRef.current) {
        wsRef.current.send({
          type: 'subscribe',
          data: { notificationType }
        });
      }
    } catch (error) {
      console.error('Error subscribing to notification type:', error);
    }
  }, []);

  // Unsubscribe from specific notification types
  const unsubscribeFromType = useCallback(async (notificationType) => {
    try {
      if (wsRef.current) {
        wsRef.current.send({
          type: 'unsubscribe',
          data: { notificationType }
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from notification type:', error);
    }
  }, []);

  // Request permission for desktop notifications
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Check if notifications are supported
  const isNotificationSupported = useCallback(() => {
    return 'Notification' in window;
  }, []);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const byType = NOTIFICATION_TYPES.reduce((acc, type) => {
      acc[type] = notifications.filter(n => n.type === type).length;
      return acc;
    }, {});
    const byPriority = NOTIFICATION_PRIORITIES.reduce((acc, priority) => {
      acc[priority] = notifications.filter(n => n.priority === priority).length;
      return acc;
    }, {});

    return {
      total,
      unread,
      read: total - unread,
      byType,
      byPriority
    };
  }, [notifications]);

  return {
    // State
    notifications,
    unreadCount,
    settings,
    
    // Actions
    loadNotifications,
    markAsReadOnServer,
    markAllAsReadOnServer,
    deleteNotificationOnServer,
    clearAllOnServer,
    loadSettings,
    saveSettings,
    sendNotification,
    subscribeToType,
    unsubscribeFromType,
    requestNotificationPermission,
    isNotificationSupported,
    getNotificationStats,
    
    // WebSocket
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    
    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES
  };
};

export default useNotifications;
