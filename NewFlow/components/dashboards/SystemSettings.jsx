import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { usePerformanceMonitor } from '../../hooks/usePerformance';
import './SystemSettings.css';

const SystemSettings = () => {
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('SystemSettings');

  const { can } = useRole();
  const { errors, isLoading, setErrors, setIsLoading, handleApiError, clearAllErrors } = useErrorHandler();

  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    hospitalName: 'MediCare Hospital',
    hospitalCode: 'DELH01',
    timezone: 'Asia/Kolkata',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',

    // System Settings
    maxFileSize: 10, // MB
    sessionTimeout: 30, // minutes
    autoLogout: true,
    maintenanceMode: false,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    paymentReminders: true,

    // Security Settings
    passwordMinLength: 8,
    requireSpecialChars: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    twoFactorAuth: false,

    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30, // days
    cloudBackup: false,

    // Integration Settings
    paymentGateway: 'razorpay',
    smsProvider: 'twilio',
    emailProvider: 'smtp',
    labIntegration: false,
    pharmacyIntegration: false
  });

  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would load from API
      // For now, we'll use the default settings
      setOriginalSettings({ ...settings });
    } catch (error) {
      handleApiError(error, 'SystemSettings.loadSettings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    clearAllErrors();

    try {
      // In a real app, this would save to API
      console.log('Saving settings:', settings);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOriginalSettings({ ...settings });
      setHasChanges(false);

      // Show success message
      alert('Settings saved successfully!');

    } catch (error) {
      handleApiError(error, 'SystemSettings.handleSaveSettings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({ ...originalSettings });
      setHasChanges(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>🏥 General Settings</h3>

      <div className="settings-grid">
        <div className="setting-item">
          <label htmlFor="hospitalName">Hospital Name</label>
          <input
            type="text"
            id="hospitalName"
            value={settings.hospitalName}
            onChange={(e) => handleSettingChange('general', 'hospitalName', e.target.value)}
            className={errors.hospitalName ? 'error' : ''}
          />
          {errors.hospitalName && <span className="error-message">{errors.hospitalName}</span>}
        </div>

        <div className="setting-item">
          <label htmlFor="hospitalCode">Hospital Code</label>
          <input
            type="text"
            id="hospitalCode"
            value={settings.hospitalCode}
            onChange={(e) => handleSettingChange('general', 'hospitalCode', e.target.value)}
            className={errors.hospitalCode ? 'error' : ''}
          />
          {errors.hospitalCode && <span className="error-message">{errors.hospitalCode}</span>}
        </div>

        <div className="setting-item">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        <div className="setting-item">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={settings.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div className="setting-item">
          <label htmlFor="dateFormat">Date Format</label>
          <select
            id="dateFormat"
            value={settings.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="setting-item">
          <label htmlFor="timeFormat">Time Format</label>
          <select
            id="timeFormat"
            value={settings.timeFormat}
            onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
          >
            <option value="24h">24 Hour</option>
            <option value="12h">12 Hour (AM/PM)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings-section">
      <h3>⚙️ System Settings</h3>

      <div className="settings-grid">
        <div className="setting-item">
          <label htmlFor="maxFileSize">Max File Size (MB)</label>
          <input
            type="number"
            id="maxFileSize"
            value={settings.maxFileSize}
            onChange={(e) => handleSettingChange('system', 'maxFileSize', parseInt(e.target.value))}
            min="1"
            max="100"
          />
        </div>

        <div className="setting-item">
          <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
          <input
            type="number"
            id="sessionTimeout"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('system', 'sessionTimeout', parseInt(e.target.value))}
            min="5"
            max="120"
          />
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.autoLogout}
              onChange={(e) => handleSettingChange('system', 'autoLogout', e.target.checked)}
            />
            Auto Logout on Inactivity
          </label>
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
            />
            Maintenance Mode
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>🔔 Notification Settings</h3>

      <div className="settings-grid">
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            />
            Email Notifications
          </label>
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
            />
            SMS Notifications
          </label>
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.appointmentReminders}
              onChange={(e) => handleSettingChange('notifications', 'appointmentReminders', e.target.checked)}
            />
            Appointment Reminders
          </label>
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.paymentReminders}
              onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
            />
            Payment Reminders
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>🔒 Security Settings</h3>

      <div className="settings-grid">
        <div className="setting-item">
          <label htmlFor="passwordMinLength">Password Min Length</label>
          <input
            type="number"
            id="passwordMinLength"
            value={settings.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
            min="6"
            max="20"
          />
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.requireSpecialChars}
              onChange={(e) => handleSettingChange('security', 'requireSpecialChars', e.target.checked)}
            />
            Require Special Characters
          </label>
        </div>

        <div className="setting-item">
          <label htmlFor="maxLoginAttempts">Max Login Attempts</label>
          <input
            type="number"
            id="maxLoginAttempts"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            min="3"
            max="10"
          />
        </div>

        <div className="setting-item">
          <label htmlFor="lockoutDuration">Lockout Duration (minutes)</label>
          <input
            type="number"
            id="lockoutDuration"
            value={settings.lockoutDuration}
            onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
            min="5"
            max="60"
          />
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            />
            Two-Factor Authentication
          </label>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="settings-section">
      <h3>💾 Backup Settings</h3>

      <div className="settings-grid">
        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
            />
            Automatic Backup
          </label>
        </div>

        <div className="setting-item">
          <label htmlFor="backupFrequency">Backup Frequency</label>
          <select
            id="backupFrequency"
            value={settings.backupFrequency}
            onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="setting-item">
          <label htmlFor="backupRetention">Backup Retention (days)</label>
          <input
            type="number"
            id="backupRetention"
            value={settings.backupRetention}
            onChange={(e) => handleSettingChange('backup', 'backupRetention', parseInt(e.target.value))}
            min="7"
            max="365"
          />
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.cloudBackup}
              onChange={(e) => handleSettingChange('backup', 'cloudBackup', e.target.checked)}
            />
            Cloud Backup
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="settings-section">
      <h3>🔗 Integration Settings</h3>

      <div className="settings-grid">
        <div className="setting-item">
          <label htmlFor="paymentGateway">Payment Gateway</label>
          <select
            id="paymentGateway"
            value={settings.paymentGateway}
            onChange={(e) => handleSettingChange('integration', 'paymentGateway', e.target.value)}
          >
            <option value="razorpay">Razorpay</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="square">Square</option>
          </select>
        </div>

        <div className="setting-item">
          <label htmlFor="smsProvider">SMS Provider</label>
          <select
            id="smsProvider"
            value={settings.smsProvider}
            onChange={(e) => handleSettingChange('integration', 'smsProvider', e.target.value)}
          >
            <option value="twilio">Twilio</option>
            <option value="aws-sns">AWS SNS</option>
            <option value="textlocal">TextLocal</option>
          </select>
        </div>

        <div className="setting-item">
          <label htmlFor="emailProvider">Email Provider</label>
          <select
            id="emailProvider"
            value={settings.emailProvider}
            onChange={(e) => handleSettingChange('integration', 'emailProvider', e.target.value)}
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">AWS SES</option>
          </select>
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.labIntegration}
              onChange={(e) => handleSettingChange('integration', 'labIntegration', e.target.checked)}
            />
            Lab Integration
          </label>
        </div>

        <div className="setting-item checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.pharmacyIntegration}
              onChange={(e) => handleSettingChange('integration', 'pharmacyIntegration', e.target.checked)}
            />
            Pharmacy Integration
          </label>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: '🏥' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'backup', label: 'Backup', icon: '💾' },
    { id: 'integration', label: 'Integration', icon: '🔗' }
  ];

  if (isLoading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="system-settings">
      <div className="settings-header">
        <h1>⚙️ System Settings</h1>
        <div className="settings-actions">
          <button
            className="btn-secondary"
            onClick={handleResetSettings}
            disabled={!hasChanges}
          >
            Reset
          </button>
          <button
            className="btn-primary"
            onClick={handleSaveSettings}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'system' && renderSystemSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'backup' && renderBackupSettings()}
          {activeTab === 'integration' && renderIntegrationSettings()}
        </div>
      </div>

      {errors.submit && (
        <div className="error-message submit-error">
          {errors.submit}
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
