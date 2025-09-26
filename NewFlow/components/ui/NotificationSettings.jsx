import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { Modal, ModalHeader, Button } from './index';
import './NotificationSettings.css';

const NotificationSettings = ({ isOpen, onClose }) => {
  const { settings, updateSettings, clearAll, markAllAsRead } = useNotification();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (setting, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const handleClearAll = () => {
    clearAll();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleTestNotification = () => {
    // Test different notification types
    const testNotifications = [
      {
        type: 'success',
        title: 'Test Success',
        message: 'This is a test success notification',
        priority: 'normal'
      },
      {
        type: 'error',
        title: 'Test Error',
        message: 'This is a test error notification',
        priority: 'high'
      },
      {
        type: 'warning',
        title: 'Test Warning',
        message: 'This is a test warning notification',
        priority: 'normal'
      },
      {
        type: 'info',
        title: 'Test Info',
        message: 'This is a test info notification',
        priority: 'low'
      },
      {
        type: 'appointment',
        title: 'Test Appointment',
        message: 'This is a test appointment notification',
        priority: 'normal'
      },
      {
        type: 'medical',
        title: 'Test Medical',
        message: 'This is a test medical notification',
        priority: 'high'
      }
    ];

    testNotifications.forEach((notification, index) => {
      setTimeout(() => {
        // This would trigger the notification system
        console.log('Test notification:', notification);
      }, index * 500);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <ModalHeader
        title="🔔 Notification Settings"
        onClose={onClose}
      />

      <div className="notification-settings">
        <div className="settings-sections">
          {/* Notification Preferences */}
          <div className="settings-section">
            <h3>🔔 Notification Preferences</h3>
            <div className="settings-group">
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  />
                  <span className="setting-text">
                    <strong>Sound Notifications</strong>
                    <small>Play sound when new notifications arrive</small>
                  </span>
                </label>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={localSettings.desktopNotifications}
                    onChange={(e) => handleSettingChange('desktopNotifications', e.target.checked)}
                  />
                  <span className="setting-text">
                    <strong>Desktop Notifications</strong>
                    <small>Show desktop notifications (requires browser permission)</small>
                  </span>
                </label>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={localSettings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                  <span className="setting-text">
                    <strong>Email Notifications</strong>
                    <small>Send notifications via email for important updates</small>
                  </span>
                </label>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={localSettings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  />
                  <span className="setting-text">
                    <strong>Push Notifications</strong>
                    <small>Receive push notifications on mobile devices</small>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="settings-section">
            <h3>📋 Notification Types</h3>
            <div className="notification-types">
              <div className="notification-type-item">
                <span className="type-icon">✅</span>
                <div className="type-info">
                  <strong>Success Notifications</strong>
                  <small>Operation completed successfully</small>
                </div>
                <div className="type-status enabled">Enabled</div>
              </div>

              <div className="notification-type-item">
                <span className="type-icon">❌</span>
                <div className="type-info">
                  <strong>Error Notifications</strong>
                  <small>System errors and failures</small>
                </div>
                <div className="type-status enabled">Enabled</div>
              </div>

              <div className="notification-type-item">
                <span className="type-icon">⚠️</span>
                <div className="type-info">
                  <strong>Warning Notifications</strong>
                  <small>Important warnings and alerts</small>
                </div>
                <div className="type-status enabled">Enabled</div>
              </div>

              <div className="notification-type-item">
                <span className="type-icon">ℹ️</span>
                <div className="type-info">
                  <strong>Info Notifications</strong>
                  <small>General information updates</small>
                </div>
                <div className="type-status enabled">Enabled</div>
              </div>

              <div className="notification-type-item">
                <span className="type-icon">📅</span>
                <div className="type-info">
                  <strong>Appointment Notifications</strong>
                  <small>Appointment reminders and updates</small>
                </div>
                <div className="type-status enabled">Enabled</div>
              </div>

              <div className="notification-type-item">
                <span className="type-icon">🏥</span>
                <div className="type-info">
                  <strong>Medical Notifications</strong>
                  <small>Medical records and health updates</small>
                </div>
                <div className="type-status enabled">Enabled</div>
              </div>

              <div className="notification-type-item">
                <span className="type-icon">⚙️</span>
                <div className="type-info">
                  <strong>System Notifications</strong>
                  <small>System maintenance and updates</small>
                </div>
                <div className="type-status enabled">Enabled</div>
              </div>
            </div>
          </div>

          {/* Notification Management */}
          <div className="settings-section">
            <h3>🗂️ Notification Management</h3>
            <div className="management-actions">
              <Button
                onClick={handleMarkAllAsRead}
                className="btn-secondary"
              >
                Mark All as Read
              </Button>
              <Button
                onClick={handleClearAll}
                className="btn-warning"
              >
                Clear All Notifications
              </Button>
              <Button
                onClick={handleTestNotification}
                className="btn-info"
              >
                Test Notifications
              </Button>
            </div>
          </div>

          {/* Notification History */}
          <div className="settings-section">
            <h3>📊 Notification Statistics</h3>
            <div className="notification-stats">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Total Notifications</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Unread</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">This Week</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">This Month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          <Button
            onClick={handleReset}
            className="btn-secondary"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationSettings;
