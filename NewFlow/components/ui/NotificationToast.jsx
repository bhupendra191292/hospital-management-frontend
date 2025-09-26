import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './NotificationToast.css';

const NotificationToast = () => {
  const { notifications } = useNotification();
  const [visibleToasts, setVisibleToasts] = useState([]);

  useEffect(() => {
    // Show toast for new notifications
    const newNotifications = notifications.filter(
      notification => !visibleToasts.some(toast => toast.id === notification.id)
    );

    if (newNotifications.length > 0) {
      const latestNotification = newNotifications[0];
      setVisibleToasts(prev => [latestNotification, ...prev.slice(0, 4)]); // Max 5 toasts
    }
  }, [notifications, visibleToasts]);

  const removeToast = (id) => {
    setVisibleToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'appointment': return '📅';
      case 'medical': return '🏥';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getToastColor = (type) => {
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      case 'appointment': return '#6f42c1';
      case 'medical': return '#fd7e14';
      case 'system': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'urgent':
        return {
          borderLeft: '4px solid #dc3545',
          animation: 'urgentPulse 1s infinite'
        };
      case 'high':
        return {
          borderLeft: '4px solid #fd7e14'
        };
      case 'normal':
        return {
          borderLeft: '4px solid #007bff'
        };
      case 'low':
        return {
          borderLeft: '4px solid #6c757d'
        };
      default:
        return {
          borderLeft: '4px solid #007bff'
        };
    }
  };

  return (
    <div className="notification-toast-container">
      {visibleToasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`notification-toast ${toast.type}`}
          style={{
            ...getPriorityStyle(toast.priority),
            '--toast-color': getToastColor(toast.type),
            '--toast-index': index
          }}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-content">
            <div className="toast-icon">
              {getToastIcon(toast.type)}
            </div>
            <div className="toast-message">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-description">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
            >
              ×
            </button>
          </div>
          <div className="toast-progress">
            <div
              className="toast-progress-bar"
              style={{
                animation: `toastProgress ${toast.persistent ? '0s' : '5s'} linear forwards`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
