import { newFlowApi } from './api';

// Notification API endpoints
const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: '/newflow/notifications',
  MARK_AS_READ: '/newflow/notifications/:id/read',
  MARK_ALL_AS_READ: '/newflow/notifications/read-all',
  DELETE_NOTIFICATION: '/newflow/notifications/:id',
  CLEAR_ALL: '/newflow/notifications/clear-all',
  UPDATE_SETTINGS: '/newflow/notifications/settings',
  GET_SETTINGS: '/newflow/notifications/settings',
  SEND_NOTIFICATION: '/newflow/notifications/send',
  SUBSCRIBE: '/newflow/notifications/subscribe',
  UNSUBSCRIBE: '/newflow/notifications/unsubscribe'
};

// Get notifications with pagination and filters
export const getNotifications = async (params = {}) => {
  try {
    const response = await newFlowApi.get(NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS, {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        type: params.type || '',
        priority: params.priority || '',
        status: params.status || '',
        search: params.search || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await newFlowApi.patch(
      NOTIFICATION_ENDPOINTS.MARK_AS_READ.replace(':id', notificationId)
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await newFlowApi.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await newFlowApi.delete(
      NOTIFICATION_ENDPOINTS.DELETE_NOTIFICATION.replace(':id', notificationId)
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    const response = await newFlowApi.delete(NOTIFICATION_ENDPOINTS.CLEAR_ALL);
    return response.data;
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    throw error;
  }
};

// Get notification settings
export const getNotificationSettings = async () => {
  try {
    const response = await newFlowApi.get(NOTIFICATION_ENDPOINTS.GET_SETTINGS);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await newFlowApi.patch(NOTIFICATION_ENDPOINTS.UPDATE_SETTINGS, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

// Send notification
export const sendNotification = async (notificationData) => {
  try {
    const response = await newFlowApi.post(NOTIFICATION_ENDPOINTS.SEND_NOTIFICATION, notificationData);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Subscribe to notifications
export const subscribeToNotifications = async (subscriptionData) => {
  try {
    const response = await newFlowApi.post(NOTIFICATION_ENDPOINTS.SUBSCRIBE, subscriptionData);
    return response.data;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    throw error;
  }
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = async (subscriptionId) => {
  try {
    const response = await newFlowApi.delete(
      NOTIFICATION_ENDPOINTS.UNSUBSCRIBE.replace(':id', subscriptionId)
    );
    return response.data;
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    throw error;
  }
};

// Notification types and priorities
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  APPOINTMENT: 'appointment',
  MEDICAL: 'medical',
  SYSTEM: 'system'
};

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Helper function to create notification data
export const createNotificationData = (type, title, message, options = {}) => {
  return {
    type,
    title,
    message,
    priority: options.priority || NOTIFICATION_PRIORITIES.NORMAL,
    persistent: options.persistent || false,
    actions: options.actions || [],
    data: options.data || {},
    recipientId: options.recipientId || null,
    recipientType: options.recipientType || 'user', // user, role, all
    scheduledAt: options.scheduledAt || null,
    expiresAt: options.expiresAt || null
  };
};

// Helper function to send different types of notifications
export const sendSuccessNotification = async (title, message, options = {}) => {
  const notificationData = createNotificationData(
    NOTIFICATION_TYPES.SUCCESS,
    title,
    message,
    options
  );
  return await sendNotification(notificationData);
};

export const sendErrorNotification = async (title, message, options = {}) => {
  const notificationData = createNotificationData(
    NOTIFICATION_TYPES.ERROR,
    title,
    message,
    { ...options, priority: NOTIFICATION_PRIORITIES.HIGH, persistent: true }
  );
  return await sendNotification(notificationData);
};

export const sendWarningNotification = async (title, message, options = {}) => {
  const notificationData = createNotificationData(
    NOTIFICATION_TYPES.WARNING,
    title,
    message,
    options
  );
  return await sendNotification(notificationData);
};

export const sendInfoNotification = async (title, message, options = {}) => {
  const notificationData = createNotificationData(
    NOTIFICATION_TYPES.INFO,
    title,
    message,
    options
  );
  return await sendNotification(notificationData);
};

export const sendAppointmentNotification = async (title, message, options = {}) => {
  const notificationData = createNotificationData(
    NOTIFICATION_TYPES.APPOINTMENT,
    title,
    message,
    options
  );
  return await sendNotification(notificationData);
};

export const sendMedicalNotification = async (title, message, options = {}) => {
  const notificationData = createNotificationData(
    NOTIFICATION_TYPES.MEDICAL,
    title,
    message,
    { ...options, priority: NOTIFICATION_PRIORITIES.HIGH, persistent: true }
  );
  return await sendNotification(notificationData);
};

export const sendSystemNotification = async (title, message, options = {}) => {
  const notificationData = createNotificationData(
    NOTIFICATION_TYPES.SYSTEM,
    title,
    message,
    { ...options, priority: NOTIFICATION_PRIORITIES.LOW }
  );
  return await sendNotification(notificationData);
};

// WebSocket connection for real-time notifications
export class NotificationWebSocket {
  constructor(url, onMessage, onError, onOpen, onClose) {
    this.url = url;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = (event) => {
        console.log('Notification WebSocket connected');
        this.reconnectAttempts = 0;
        if (this.onOpen) this.onOpen(event);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
        if (this.onError) this.onError(error);
      };

      this.ws.onclose = (event) => {
        console.log('Notification WebSocket disconnected');
        if (this.onClose) this.onClose(event);
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Error connecting to Notification WebSocket:', error);
      if (this.onError) this.onError(error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }
}

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  sendNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  createNotificationData,
  sendSuccessNotification,
  sendErrorNotification,
  sendWarningNotification,
  sendInfoNotification,
  sendAppointmentNotification,
  sendMedicalNotification,
  sendSystemNotification,
  NotificationWebSocket,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
};
