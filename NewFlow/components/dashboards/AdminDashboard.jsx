import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import Button from '../ui/Button';
import EnhancedUserManagement from './EnhancedUserManagement';
import EnhancedPatientManagement from './EnhancedPatientManagement';
import EnhancedDoctorManagement from './EnhancedDoctorManagement';
import DoctorApprovalDashboard from './DoctorApprovalDashboard';
import './AdminDashboard.css';

const AdminDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();
  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalPatients: 892,
    totalDoctors: 45,
    totalAppointments: 3200,
    todayRevenue: 15420,
    activeUsers: 156,
    pendingApprovals: 8,
    systemHealth: 98
  });
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, icon: '👤', message: 'New patient registered: John Doe', timestamp: '2 minutes ago', priority: 'info' },
    { id: 2, icon: '👨‍⚕️', message: 'Dr. Smith completed consultation', timestamp: '5 minutes ago', priority: 'success' },
    { id: 3, icon: '📅', message: 'Appointment scheduled for tomorrow', timestamp: '10 minutes ago', priority: 'info' },
    { id: 4, icon: '⚠️', message: 'System maintenance scheduled', timestamp: '1 hour ago', priority: 'warning' },
    { id: 5, icon: '💰', message: 'Payment received: $500', timestamp: '2 hours ago', priority: 'success' }
  ]);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const roleInfo = getRoleDetails();

  useEffect(() => {
    loadAdminData();
  }, []);

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

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock comprehensive admin data
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'patient', status: 'active', lastLogin: '2 hours ago', registrationDate: '2024-01-15' },
        { id: 2, name: 'Dr. Sarah Smith', email: 'sarah@hospital.com', role: 'doctor', status: 'active', lastLogin: '1 hour ago', registrationDate: '2024-01-10' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'patient', status: 'pending', lastLogin: 'Never', registrationDate: '2024-01-20' },
        { id: 4, name: 'Lisa Wilson', email: 'lisa@hospital.com', role: 'nurse', status: 'active', lastLogin: '30 minutes ago', registrationDate: '2024-01-12' },
        { id: 5, name: 'David Brown', email: 'david@example.com', role: 'receptionist', status: 'active', lastLogin: '15 minutes ago', registrationDate: '2024-01-08' },
        { id: 6, name: 'Emma Davis', email: 'emma@hospital.com', role: 'admin', status: 'active', lastLogin: '5 minutes ago', registrationDate: '2024-01-05' }
      ];

      const mockPatients = [
        { id: 1, name: 'John Doe', email: 'john@example.com', uhid: 'DELH01-250901-0001', age: 45, gender: 'Male', mobile: '+91 98765 43210', lastVisit: '2024-01-15', status: 'active', registrationDate: '2024-01-15' },
        { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', uhid: 'DELH01-250901-0002', age: 32, gender: 'Female', mobile: '+91 98765 43211', lastVisit: '2024-01-10', status: 'active', registrationDate: '2024-01-10' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', uhid: 'DELH01-250901-0003', age: 58, gender: 'Male', mobile: '+91 98765 43212', lastVisit: '2024-01-20', status: 'active', registrationDate: '2024-01-20' },
        { id: 4, name: 'Lisa Wilson', email: 'lisa@example.com', uhid: 'DELH01-250901-0004', age: 28, gender: 'Female', mobile: '+91 98765 43213', lastVisit: '2024-01-18', status: 'active', registrationDate: '2024-01-18' },
        { id: 5, name: 'David Brown', email: 'david@example.com', uhid: 'DELH01-250901-0005', age: 35, gender: 'Male', mobile: '+91 98765 43214', lastVisit: '2024-01-12', status: 'pending', registrationDate: '2024-01-12' },
        { id: 6, name: 'Emma Davis', email: 'emma@example.com', uhid: 'DELH01-250901-0006', age: 42, gender: 'Female', mobile: '+91 98765 43215', lastVisit: '2024-01-08', status: 'active', registrationDate: '2024-01-08' }
      ];

      const mockDoctors = [
        { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiology', experience: '10 years', patients: 156, rating: 4.8, status: 'active', email: 'sarah.johnson@hospital.com', phone: '+91 98765 43220' },
        { id: 2, name: 'Dr. Mike Brown', specialization: 'General Medicine', experience: '8 years', patients: 203, rating: 4.6, status: 'active', email: 'mike.brown@hospital.com', phone: '+91 98765 43221' },
        { id: 3, name: 'Dr. Lisa Wilson', specialization: 'Pediatrics', experience: '12 years', patients: 189, rating: 4.9, status: 'active', email: 'lisa.wilson@hospital.com', phone: '+91 98765 43222' },
        { id: 4, name: 'Dr. David Lee', specialization: 'Orthopedics', experience: '15 years', patients: 134, rating: 4.7, status: 'pending', email: 'david.lee@hospital.com', phone: '+91 98765 43223' },
        { id: 5, name: 'Dr. Emma Davis', specialization: 'Dermatology', experience: '6 years', patients: 98, rating: 4.5, status: 'active', email: 'emma.davis@hospital.com', phone: '+91 98765 43224' }
      ];

      setUsers(mockUsers);
      setDoctors(mockDoctors);
      setPatients(mockPatients);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      {/* Streamlined Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Good morning, {user?.name || 'Admin'}</h1>
          <p className="welcome-subtitle">Here's your hospital overview for today</p>
        </div>
        <div className="welcome-actions">
                        <Button variant="default" size="medium" onClick={() => setCurrentView('reports')}>
                📊 View Reports
              </Button>
        </div>
      </div>

      {/* Priority Metrics - Only Most Important */}
      <div className="priority-metrics">
        <div className="metric-card primary-large">
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
            <div className="metric-description">Active patients in system</div>
          </div>
                          <div className="metric-action">
                  <Button variant="default" size="small" onClick={() => setCurrentView('patients')}>
                    Manage Patients
                  </Button>
                </div>
        </div>

        <div className="metric-card revenue-large">
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
            <div className="metric-description">Revenue generated today</div>
          </div>
                          <div className="metric-action">
                  <Button variant="default" size="small" onClick={() => setCurrentView('reports')}>
                    View Details
                  </Button>
                </div>
        </div>
      </div>

      {/* Secondary Metrics - Compact Grid */}
      <div className="secondary-metrics">
        <h3 className="section-subtitle">Quick Stats</h3>
        <div className="metrics-compact">
          <div className="metric-compact" onClick={() => setCurrentView('users')}>
            <div className="compact-icon users">👥</div>
            <div className="compact-content">
              <div className="compact-value">{stats.totalUsers.toLocaleString()}</div>
              <div className="compact-label">Users</div>
            </div>
          </div>
          <div className="metric-compact" onClick={() => setCurrentView('doctors')}>
            <div className="compact-icon doctors">👨‍⚕️</div>
            <div className="compact-content">
              <div className="compact-value">{stats.totalDoctors}</div>
              <div className="compact-label">Doctors</div>
            </div>
          </div>
          <div className="metric-compact" onClick={() => setCurrentView('reports')}>
            <div className="compact-icon appointments">📅</div>
            <div className="compact-content">
              <div className="compact-value">{stats.totalAppointments.toLocaleString()}</div>
              <div className="compact-label">Appointments</div>
            </div>
          </div>
          <div className="metric-compact">
            <div className="compact-icon active">🟢</div>
            <div className="compact-content">
              <div className="compact-value">{stats.activeUsers}</div>
              <div className="compact-label">Online Now</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Content */}
      <div className="actionable-content">
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <button className="btn-text">View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.slice(0, 3).map(activity => (
              <div key={activity.id} className={`activity-item ${activity.priority}`}>
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions-list">
            <button className="quick-action-item" onClick={() => setCurrentView('patients')}>
              <div className="action-icon">🏥</div>
              <div className="action-content">
                <span className="action-title">Register Patient</span>
                <span className="action-desc">Add new patient to system</span>
              </div>
            </button>
            <button className="quick-action-item" onClick={() => setCurrentView('doctors')}>
              <div className="action-icon">👨‍⚕️</div>
              <div className="action-content">
                <span className="action-title">Manage Doctors</span>
                <span className="action-desc">View and update doctor profiles</span>
              </div>
            </button>
            <button className="quick-action-item" onClick={() => setCurrentView('doctor-approval')}>
              <div className="action-icon">✅</div>
              <div className="action-content">
                <span className="action-title">Doctor Approvals</span>
                <span className="action-desc">Review pending doctor registrations</span>
              </div>
            </button>
            <button className="quick-action-item" onClick={() => setCurrentView('users')}>
              <div className="action-icon">👥</div>
              <div className="action-content">
                <span className="action-title">User Management</span>
                <span className="action-desc">Manage system users and roles</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <EnhancedUserManagement onBack={() => setCurrentView('overview')} />
  );

  const renderPatients = () => (
    <EnhancedPatientManagement />
  );

  const renderDoctors = () => (
    <EnhancedDoctorManagement onBack={() => setCurrentView('overview')} />
  );

  const renderDoctorApproval = () => (
    <DoctorApprovalDashboard onBack={() => setCurrentView('overview')} />
  );

  const renderPrescriptions = () => (
    <div className="prescriptions-section">
      <div className="section-header">
        <h2>💊 Prescription Management</h2>
        <p>Manage patient prescriptions and medication records</p>
      </div>
      <div className="prescriptions-content">
        <iframe 
          src="/prescriptions" 
          style={{ width: '100%', height: '800px', border: 'none' }}
          title="Prescription Management"
        />
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-section">
      <div className="section-header">
        <h2>📊 Reports & Analytics</h2>
        <div className="section-actions">
          <Button variant="default" size="medium">Generate Report</Button>
          <Button variant="default" size="medium">Export Data</Button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>📈 Revenue Report</h3>
          <div className="report-content">
            <div className="chart-placeholder">
              <p>Revenue chart would be displayed here</p>
            </div>
            <div className="report-stats">
              <div className="stat">
                <span className="stat-value">$45,230</span>
                <span className="stat-label">This Month</span>
              </div>
              <div className="stat">
                <span className="stat-value">+12%</span>
                <span className="stat-label">vs Last Month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>👥 User Growth</h3>
          <div className="report-content">
            <div className="chart-placeholder">
              <p>User growth chart would be displayed here</p>
            </div>
            <div className="report-stats">
              <div className="stat">
                <span className="stat-value">1,247</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat">
                <span className="stat-value">+8%</span>
                <span className="stat-label">Growth Rate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>📅 Appointment Trends</h3>
          <div className="report-content">
            <div className="chart-placeholder">
              <p>Appointment trends chart would be displayed here</p>
            </div>
            <div className="report-stats">
              <div className="stat">
                <span className="stat-value">3,200</span>
                <span className="stat-label">Total Appointments</span>
              </div>
              <div className="stat">
                <span className="stat-value">+15%</span>
                <span className="stat-label">vs Last Month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>⚙️ System Settings</h2>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>🏥 Hospital Information</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Hospital Name</label>
              <input type="text" defaultValue="Digital Hospital" />
            </div>
            <div className="form-group">
              <label>Hospital Code</label>
              <input type="text" defaultValue="DELH01" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea defaultValue="123 Medical Street, Delhi, India"></textarea>
            </div>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>

        <div className="settings-card">
          <h3>🔐 Security Settings</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Password Policy</label>
              <select>
                <option>Strong (8+ chars, special chars)</option>
                <option>Medium (6+ chars)</option>
                <option>Basic (4+ chars)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Session Timeout</label>
              <select>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>8 hours</option>
              </select>
            </div>
            <div className="form-group">
              <label>Two-Factor Authentication</label>
              <div className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </div>
            </div>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>

        <div className="settings-card">
          <h3>📧 Notification Settings</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Email Notifications</label>
              <div className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </div>
            </div>
            <div className="form-group">
              <label>SMS Notifications</label>
              <div className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </div>
            </div>
            <div className="form-group">
              <label>Push Notifications</label>
              <div className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </div>
            </div>
            <button className="btn-primary">Save Changes</button>
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
              className={`nav-item ${currentView === 'prescriptions' ? 'active' : ''}`}
              onClick={() => handleNavigation('prescriptions')}
            >
              <span className="nav-icon">💊</span>
              <span className="nav-text">Prescriptions</span>
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
            {currentView === 'users' && renderUsers()}
            {currentView === 'patients' && renderPatients()}
            {currentView === 'doctors' && renderDoctors()}
            {currentView === 'doctor-approval' && renderDoctorApproval()}
            {currentView === 'prescriptions' && renderPrescriptions()}
            {currentView === 'reports' && renderReports()}
            {currentView === 'settings' && renderSettings()}
          </main>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
