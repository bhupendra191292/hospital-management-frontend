import { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import {
  getNewFlowDashboardStats,
  getNewFlowPatients,
  getAllNewFlowDoctors,
  getNewFlowVisits
} from '../../services/api';
import EnhancedUserManagement from './EnhancedUserManagement';
import EnhancedPatientManagement from './EnhancedPatientManagement';
import EnhancedDoctorManagement from './EnhancedDoctorManagement';
import ReportsAnalytics from './ReportsAnalytics';
import SystemSettings from './SystemSettings';
import BillingManagement from './BillingManagement';
import './AdminDashboard.css';

const AdminDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';

    try {
      const now = new Date();
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }

      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return 'Unknown time';
    }
  };
  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todayRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    systemHealth: 100
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingActivity, setIsRefreshingActivity] = useState(false);

  const roleInfo = getRoleDetails();

  useEffect(() => {
    loadAdminData();

    // Set up auto-refresh for recent activity every 30 seconds
    const interval = setInterval(() => {
      loadRecentActivity();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Debug: Monitor recentActivity state changes
  useEffect(() => {
    console.log('🔄 Recent activity state changed:', recentActivity);
  }, [recentActivity]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && window.innerWidth <= 768) {
        const sidebar = document.querySelector('.dashboard-sidebar');
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (sidebar && !sidebar.contains(event.target) && !toggle?.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const loadRecentActivity = async () => {
    try {
      setIsRefreshingActivity(true);
      console.log('🔄 Loading recent activity...');
      let allActivities = [];

      // Load recent patients for activity feed
      console.log('🔍 Calling getNewFlowPatients API...');
      const patientsResponse = await getNewFlowPatients({ limit: 5 });
      console.log('📡 Patients API Response:', patientsResponse);

      if (patientsResponse.data.success) {
        const recentPatients = patientsResponse.data.data.patients || [];
        console.log('📋 Found patients:', recentPatients.length, recentPatients);

        const patientActivities = recentPatients.slice(0, 3).map((patient, index) => {
          const timeAgo = getTimeAgo(patient.registrationDate || patient.createdAt);
          return {
            id: `patient-${patient._id}`,
            icon: '👤',
            message: `New patient registered: ${patient.name}`,
            timestamp: timeAgo,
            priority: 'info'
          };
        });

        allActivities = [...allActivities, ...patientActivities];
      }

      // Load recent visits for activity feed
      console.log('🔍 Calling getNewFlowVisits API...');
      const visitsResponse = await getNewFlowVisits({ limit: 5 });
      console.log('📡 Visits API Response:', visitsResponse);

      if (visitsResponse.data.success) {
        const recentVisits = visitsResponse.data.data.visits || [];
        console.log('🏥 Found visits:', recentVisits.length, recentVisits);

        const visitActivities = recentVisits.slice(0, 2).map((visit, index) => {
          const timeAgo = getTimeAgo(visit.createdAt);
          return {
            id: `visit-${visit._id}`,
            icon: '👨‍⚕️',
            message: `Visit completed: ${visit.patientName || 'Patient'}`,
            timestamp: timeAgo,
            priority: 'success'
          };
        });

        allActivities = [...allActivities, ...visitActivities];
      }

      // If no real activities, show empty state
      if (allActivities.length === 0) {
        console.log('⚠️ No real activities found, showing empty state');
        allActivities = [
          { id: 'empty-1', icon: '📭', message: 'No recent activities found', timestamp: 'Just now', priority: 'info' }
        ];
      }

      // Sort activities by timestamp (newest first) and take only the latest 5
      allActivities.sort((a, b) => {
        // Simple sorting - newer activities first
        if (a.timestamp === 'Just now') return -1;
        if (b.timestamp === 'Just now') return 1;
        return 0;
      });

      console.log('🎯 Final activities to set:', allActivities);
      const activitiesToSet = allActivities.slice(0, 5);
      console.log('🎯 Activities to set (sliced):', activitiesToSet);
      setRecentActivity(activitiesToSet);
      console.log('✅ Recent activity updated:', allActivities.length, 'activities');

      // Force a re-render to see if state is updated
      setTimeout(() => {
        console.log('🔄 State after update:', recentActivity);
      }, 100);

    } catch (error) {
      console.error('❌ Error loading recent activity:', error);
      // Set error message on error
      setRecentActivity([
        { id: 'error-1', icon: '⚠️', message: 'Error loading recent activities', timestamp: 'Just now', priority: 'warning' }
      ]);
    } finally {
      setIsRefreshingActivity(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      // Load dashboard statistics
      const statsResponse = await getNewFlowDashboardStats();
      if (statsResponse.data.success) {
        const apiStats = statsResponse.data.data;
        setStats(prevStats => ({
          ...prevStats,
          totalPatients: apiStats.totalPatients || 0,
          totalDoctors: apiStats.totalDoctors || 0,
          totalAppointments: apiStats.totalAppointments || 0,
          todayRevenue: apiStats.todayRevenue || 0,
          activeUsers: apiStats.activeUsers || 0,
          pendingApprovals: apiStats.pendingApprovals || 0,
          systemHealth: apiStats.systemHealth || 100
        }));
      }

      // Load recent activity
      await loadRecentActivity();

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setIsLoading(false);
    }
  };

  const handleUserAction = (userId, action) => {
    console.log(`User action: ${action} for user ${userId}`);
    alert(`User action: ${action} for user ${userId}`);
  };

  const handlePatientAction = (patientId, action) => {
    console.log(`Patient action: ${action} for patient ${patientId}`);
    alert(`Patient action: ${action} for patient ${patientId}`);
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleDoctorAction = (doctorId, action) => {
    console.log(`Doctor action: ${action} for doctor ${doctorId}`);
    alert(`Doctor action: ${action} for doctor ${doctorId}`);
  };

  const handleRefreshData = () => {
    loadAdminData();
  };

  // Function to add new activity to the feed
  const addNewActivity = (activity) => {
    setRecentActivity(prev => {
      // Add new activity at the beginning and keep only the latest 5
      return [activity, ...prev.slice(0, 4)];
    });
  };

  // Function to trigger activity refresh (can be called from other components)
  const refreshActivity = () => {
    loadRecentActivity();
  };

  // Show loading state with sidebar
  const renderLoadingContent = () => (
    <div className="dashboard-content loading-content">
      <div className="content-header">
        <div className="header-left">
          <h1>🏥 NewFlow Dashboard</h1>
          <p>Welcome back, {user?.name || 'Admin'}!</p>
        </div>
        <div className="header-right">
          <div className="notification-bell">
            <span className="bell-icon">🔔</span>
            <span className="notification-count">3</span>
          </div>
          <div className="user-profile">
            <div className="user-avatar">
              <span>{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="dropdown-arrow">▼</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Loading Dashboard...</h3>
          </div>
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="dashboard-overview">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back, {user?.name || 'Admin'}!</h1>
          <p className="welcome-subtitle">Here's what's happening at your hospital today.</p>
        </div>
        <div className="welcome-actions">
          <button className="btn-primary" onClick={handleRefreshData}>
            <span className="btn-icon">🔄</span>
            Refresh Data
          </button>
          <button className="btn-secondary" onClick={() => setCurrentView('reports')}>
            <span className="btn-icon">📊</span>
            View Reports
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-section">
        <h2 className="section-title">Key Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-header">
              <div className="metric-icon users">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5l-1-1.5c-.47-.62-1.21-.99-2.01-.99H9.46c-.8 0-1.54.37-2.01.99L5 10.5l-1-1.5C3.53 8.37 2.79 8 2 8H.5L3 15.5V22h2v-6h2v6h2v-6h2v6h2v-6h2v6h2z"/>
                </svg>
              </div>
              <div className="metric-trend positive">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span>+12%</span>
              </div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.totalUsers.toLocaleString()}</div>
              <div className="metric-label">Total Users</div>
              <div className="metric-description">vs last month</div>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-header">
              <div className="metric-icon patients">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                </svg>
              </div>
              <div className="metric-trend positive">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span>+8%</span>
              </div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.totalPatients.toLocaleString()}</div>
              <div className="metric-label">Total Patients</div>
              <div className="metric-description">vs last month</div>
            </div>
          </div>

          <div className="metric-card info">
            <div className="metric-header">
              <div className="metric-icon doctors">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="metric-trend positive">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span>+3</span>
              </div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.totalDoctors}</div>
              <div className="metric-label">Total Doctors</div>
              <div className="metric-description">new this month</div>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-header">
              <div className="metric-icon appointments">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <div className="metric-trend positive">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span>+15%</span>
              </div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.totalAppointments.toLocaleString()}</div>
              <div className="metric-label">Total Appointments</div>
              <div className="metric-description">vs last month</div>
            </div>
          </div>

          <div className="metric-card revenue">
            <div className="metric-header">
              <div className="metric-icon revenue">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <div className="metric-trend positive">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span>+22%</span>
              </div>
            </div>
            <div className="metric-content">
              <div className="metric-value">${stats.todayRevenue.toLocaleString()}</div>
              <div className="metric-label">Today's Revenue</div>
              <div className="metric-description">vs yesterday</div>
            </div>
          </div>

          <div className="metric-card active">
            <div className="metric-header">
              <div className="metric-icon active">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="metric-trend positive">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span>+5</span>
              </div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{stats.activeUsers}</div>
              <div className="metric-label">Active Users</div>
              <div className="metric-description">online now</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <div className="card-actions">
              <button
                className="btn-text refresh-btn"
                onClick={refreshActivity}
                title="Refresh Activity"
                disabled={isRefreshingActivity}
              >
                {isRefreshingActivity ? '⏳ Refreshing...' : '🔄 Refresh'}
              </button>
              <button
                className="btn-text test-btn"
                onClick={() => addNewActivity({
                  id: `test-${Date.now()}`,
                  icon: '🧪',
                  message: 'Test activity added dynamically',
                  timestamp: 'Just now',
                  priority: 'info'
                })}
                title="Test Dynamic Activity"
              >
                🧪 Test
              </button>
              <button
                className="btn-text test-btn"
                onClick={async () => {
                  console.log('🔍 Current token:', localStorage.getItem('newflow_token'));
                  console.log('🔍 Current recent activity state:', recentActivity);

                  // Test API call directly
                  try {
                    console.log('🧪 Testing API call directly...');
                    const response = await getNewFlowPatients({ limit: 5 });
                    console.log('🧪 Direct API response:', response);
                    console.log('🧪 Response data:', response.data);
                    console.log('🧪 Response success:', response.data?.success);
                    console.log('🧪 Response patients:', response.data?.data?.patients);
                  } catch (error) {
                    console.error('🧪 Direct API error:', error);
                  }

                  loadRecentActivity();
                }}
                title="Debug Activity Loading"
              >
                🐛 Debug
              </button>
              <button
                className="btn-text test-btn"
                onClick={() => {
                  // Set the correct token for testing
                  localStorage.setItem('newflow_token', 'newflow-token-1758193027114');
                  console.log('🔧 Token set to:', localStorage.getItem('newflow_token'));
                  loadRecentActivity();
                }}
                title="Set Test Token"
              >
                🔧 Fix Token
              </button>
              <button className="btn-text">View All</button>
            </div>
          </div>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className={`activity-item ${activity.priority}`}>
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.timestamp}</span>
                </div>
                <button className="btn-small">View</button>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
            <button className="btn-text">More</button>
          </div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn">
              <div className="action-icon users">👥</div>
              <span>Add User</span>
            </button>
            <button className="quick-action-btn">
              <div className="action-icon patients">🏥</div>
              <span>Register Patient</span>
            </button>
            <button className="quick-action-btn">
              <div className="action-icon doctors">👨‍⚕️</div>
              <span>Add Doctor</span>
            </button>
            <button className="quick-action-btn">
              <div className="action-icon reports">📊</div>
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🏥</div>
            <div className="logo-text">
              <h2>Digital Hospital</h2>
              <p>Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Dashboard</h3>
            <button
              className={`nav-item ${currentView === 'overview' ? 'active' : ''}`}
              onClick={() => handleNavigation('overview')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Overview</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Management</h3>
            <button
              className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
              onClick={() => handleNavigation('users')}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Users</span>
            </button>
            <button
              className={`nav-item ${currentView === 'patients' ? 'active' : ''}`}
              onClick={() => handleNavigation('patients')}
            >
              <span className="nav-icon">🏥</span>
              <span className="nav-text">Patients</span>
            </button>
            <button
              className={`nav-item ${currentView === 'doctors' ? 'active' : ''}`}
              onClick={() => handleNavigation('doctors')}
            >
              <span className="nav-icon">👨‍⚕️</span>
              <span className="nav-text">Doctors</span>
            </button>
            <button
              className={`nav-item ${currentView === 'billing' ? 'active' : ''}`}
              onClick={() => handleNavigation('billing')}
            >
              <span className="nav-icon">💰</span>
              <span className="nav-text">Billing</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Analytics</h3>
            <button
              className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
              onClick={() => handleNavigation('reports')}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Reports</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">System</h3>
            <button
              className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavigation('settings')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Admin'}</div>
              <div className="user-role">{roleInfo?.label}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {isLoading ? renderLoadingContent() : (
        <div className="dashboard-content">
          <main className="dashboard-main">
            {currentView === 'overview' && renderOverview()}
            {currentView === 'users' && <EnhancedUserManagement />}
            {currentView === 'patients' && <EnhancedPatientManagement />}
            {currentView === 'doctors' && <EnhancedDoctorManagement />}
            {currentView === 'billing' && <BillingManagement />}
            {currentView === 'reports' && <ReportsAnalytics />}
            {currentView === 'settings' && <SystemSettings />}
          </main>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
