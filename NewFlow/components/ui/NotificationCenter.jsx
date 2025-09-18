import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { Modal, ModalHeader, Button, SearchInput, FilterDropdown, Pagination } from './index';
import NotificationSettings from './NotificationSettings';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByPriority,
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES
  } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [itemsPerPage] = useState(10);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || notification.type === typeFilter;
    const matchesPriority = !priorityFilter || notification.priority === priorityFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'read' && notification.read) ||
      (statusFilter === 'unread' && !notification.read);

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#007bff';
      case 'low': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getTypeOptions = () => [
    { value: '', label: 'All Types' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
    { value: 'warning', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'medical', label: 'Medical' },
    { value: 'system', label: 'System' }
  ];

  const getPriorityOptions = () => [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' }
  ];

  const getStatusOptions = () => [
    { value: '', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' }
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="large">
        <ModalHeader 
          title={`🔔 Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`} 
          onClose={onClose} 
        />
        
        <div className="notification-center">
          {/* Header Actions */}
          <div className="notification-header">
            <div className="header-actions">
              <Button
                onClick={handleMarkAllAsRead}
                className="btn-secondary"
                disabled={unreadCount === 0}
              >
                Mark All as Read
              </Button>
              <Button
                onClick={handleClearAll}
                className="btn-warning"
                disabled={notifications.length === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                className="btn-info"
              >
                Settings
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="notification-filters">
            <SearchInput
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="search-input"
            />
            
            <FilterDropdown
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={getTypeOptions()}
            />
            
            <FilterDropdown
              label="Priority"
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={getPriorityOptions()}
            />
            
            <FilterDropdown
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={getStatusOptions()}
            />
          </div>

          {/* Notifications List */}
          <div className="notification-list">
            {paginatedNotifications.length === 0 ? (
              <div className="no-notifications">
                <div className="no-notifications-icon">🔔</div>
                <h3>No notifications found</h3>
                <p>Try adjusting your filters or check back later for new notifications.</p>
              </div>
            ) : (
              paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      {!notification.read && <div className="unread-indicator"></div>}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      <span
                        className="notification-priority"
                        style={{ color: getPriorityColor(notification.priority) }}
                      >
                        {notification.priority}
                      </span>
                      <span className="notification-type">
                        {notification.type}
                      </span>
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="btn-sm btn-primary"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="notification-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                hasNext={currentPage < totalPages}
                hasPrev={currentPage > 1}
                totalItems={filteredNotifications.length}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Settings Modal */}
      {showSettings && (
        <NotificationSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

export default NotificationCenter;
