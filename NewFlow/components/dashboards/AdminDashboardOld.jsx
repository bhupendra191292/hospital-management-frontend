import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import './AdminDashboard.css';

const AdminDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();
  const [currentView, setCurrentView] = useState('overview'); // overview, users, patients, doctors, reports, settings
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
      
      // Mock comprehensive admin data
      const mockStats = {
        totalUsers: 1247,
        totalPatients: 892,
        totalDoctors: 45,
        totalAppointments: 3200,
        todayRevenue: 15420,
        activeUsers: 156,
        pendingApprovals: 8,
        systemHealth: 98
      };

      const mockActivity = [
        { id: 1, type: 'user_registration', message: 'New patient registered: John Doe', timestamp: '2 minutes ago', icon: '👤', priority: 'info' },
        { id: 2, type: 'appointment_booking', message: 'Appointment booked with Dr. Smith', timestamp: '5 minutes ago', icon: '📅', priority: 'info' },
        { id: 3, type: 'system_alert', message: 'System backup completed successfully', timestamp: '10 minutes ago', icon: '✅', priority: 'success' },
        { id: 4, type: 'payment_received', message: 'Payment received: $500', timestamp: '15 minutes ago', icon: '💰', priority: 'success' },
        { id: 5, type: 'security_alert', message: 'Failed login attempt detected', timestamp: '20 minutes ago', icon: '⚠️', priority: 'warning' },
        { id: 6, type: 'doctor_approval', message: 'Dr. Johnson profile needs approval', timestamp: '25 minutes ago', icon: '👨‍⚕️', priority: 'warning' }
      ];

      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'patient', status: 'active', lastLogin: '2 hours ago', registrationDate: '2024-01-15' },
        { id: 2, name: 'Dr. Sarah Smith', email: 'sarah@hospital.com', role: 'doctor', status: 'active', lastLogin: '1 hour ago', registrationDate: '2024-01-10' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'patient', status: 'pending', lastLogin: 'Never', registrationDate: '2024-01-20' },
        { id: 4, name: 'Lisa Wilson', email: 'lisa@hospital.com', role: 'nurse', status: 'active', lastLogin: '30 minutes ago', registrationDate: '2024-01-12' }
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
        { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiology', experience: '10 years', patients: 156, rating: 4.8, status: 'active' },
        { id: 2, name: 'Dr. Mike Brown', specialization: 'General Medicine', experience: '8 years', patients: 203, rating: 4.6, status: 'active' },
        { id: 3, name: 'Dr. Lisa Wilson', specialization: 'Pediatrics', experience: '12 years', patients: 189, rating: 4.9, status: 'active' },
        { id: 4, name: 'Dr. David Lee', specialization: 'Orthopedics', experience: '15 years', patients: 134, rating: 4.7, status: 'pending' }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      setUsers(mockUsers);
      setDoctors(mockDoctors);
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = (userId, action) => {
    // Handle user actions (approve, suspend, delete, etc.)
    console.log(`User action: ${action} for user ${userId}`);
    // In real app, this would make API calls
    alert(`User action: ${action} for user ${userId}`);
  };

  const handlePatientAction = (patientId, action) => {
    // Handle patient actions (view, edit, suspend, etc.)
    console.log(`Patient action: ${action} for patient ${patientId}`);
    // In real app, this would make API calls
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
    // Handle doctor actions (approve, suspend, update, etc.)
    console.log(`Doctor action: ${action} for doctor ${doctorId}`);
    // In real app, this would make API calls
    alert(`Doctor action: ${action} for doctor ${doctorId}`);
  };

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
            <div className="stat-trend">
              <span className="trend-up">+12%</span>
              <span>vs last month</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
            <div className="stat-trend">
              <span className="trend-up">+8%</span>
              <span>vs last month</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>{stats.totalDoctors}</h3>
            <p>Total Doctors</p>
            <div className="stat-trend">
              <span className="trend-up">+3</span>
              <span>new this month</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.totalAppointments}</h3>
            <p>Total Appointments</p>
            <div className="stat-trend">
              <span className="trend-up">+15%</span>
              <span>vs last month</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.todayRevenue.toLocaleString()}</h3>
            <p>Today's Revenue</p>
            <div className="stat-trend">
              <span className="trend-up">+22%</span>
              <span>vs yesterday</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
            <div className="stat-trend">
              <span className="trend-up">+5</span>
              <span>online now</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
            <div className="stat-trend">
              <span className="trend-warning">Needs attention</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💚</div>
          <div className="stat-content">
            <h3>{stats.systemHealth}%</h3>
            <p>System Health</p>
            <div className="stat-trend">
              <span className="trend-up">Excellent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-card">
          <h2>📊 Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className={`activity-item ${activity.priority}`}>
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-time">{activity.timestamp}</span>
                </div>
                <div className="activity-actions">
                  <button className="btn-small">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h2>⚡ Quick Actions</h2>
          <div className="quick-actions">
            {can('MANAGE_USERS') && (
              <button className="action-btn" onClick={() => setCurrentView('users')}>
                <span className="action-icon">👥</span>
                <span>Manage Users</span>
              </button>
            )}
            {can('MANAGE_DOCTORS') && (
              <button className="action-btn" onClick={() => setCurrentView('doctors')}>
                <span className="action-icon">👨‍⚕️</span>
                <span>Manage Doctors</span>
              </button>
            )}
            {can('VIEW_REPORTS') && (
              <button className="action-btn" onClick={() => setCurrentView('reports')}>
                <span className="action-icon">📊</span>
                <span>View Reports</span>
              </button>
            )}
            {can('MANAGE_SETTINGS') && (
              <button className="action-btn" onClick={() => setCurrentView('settings')}>
                <span className="action-icon">⚙️</span>
                <span>System Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-management">
      <div className="section-header">
        <h2>👥 User Management</h2>
        <div className="section-actions">
          <button className="btn-primary">Add New User</button>
          <button className="btn-secondary">Export Users</button>
        </div>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div className="table-cell">Name</div>
          <div className="table-cell">Email</div>
          <div className="table-cell">Role</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Last Login</div>
          <div className="table-cell">Actions</div>
        </div>
        {users.map(user => (
          <div key={user.id} className="table-row">
            <div className="table-cell">
              <div className="user-info">
                <div className="user-avatar">{user.name.charAt(0)}</div>
                <span>{user.name}</span>
              </div>
            </div>
            <div className="table-cell">{user.email}</div>
            <div className="table-cell">
              <span className={`role-badge ${user.role}`}>{user.role}</span>
            </div>
            <div className="table-cell">
              <span className={`status-badge ${user.status}`}>{user.status}</span>
            </div>
            <div className="table-cell">{user.lastLogin}</div>
            <div className="table-cell">
              <div className="action-buttons">
                {user.status === 'pending' && (
                  <button 
                    className="btn-small btn-success"
                    onClick={() => handleUserAction(user.id, 'approve')}
                  >
                    Approve
                  </button>
                )}
                <button 
                  className="btn-small btn-warning"
                  onClick={() => handleUserAction(user.id, 'suspend')}
                >
                  Suspend
                </button>
                <button 
                  className="btn-small btn-danger"
                  onClick={() => handleUserAction(user.id, 'delete')}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="patients-management">
      <div className="section-header">
        <h2>🏥 Patient Management</h2>
        <div className="section-actions">
          <button className="btn-primary">Add New Patient</button>
          <button className="btn-secondary">Export Patients</button>
        </div>
      </div>

      <div className="patients-table">
        <div className="table-header">
          <div className="table-cell">Patient</div>
          <div className="table-cell">UHID</div>
          <div className="table-cell">Contact</div>
          <div className="table-cell">Age/Gender</div>
          <div className="table-cell">Last Visit</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Actions</div>
        </div>
        {patients.map(patient => (
          <div key={patient.id} className="table-row">
            <div className="table-cell">
              <div className="user-info">
                <div className="user-avatar">{patient.name.charAt(0)}</div>
                <div className="patient-details">
                  <span className="patient-name">{patient.name}</span>
                  <span className="patient-email">{patient.email}</span>
                </div>
              </div>
            </div>
            <div className="table-cell">
              <span className="uhid-badge">{patient.uhid}</span>
            </div>
            <div className="table-cell">
              <div className="contact-info">
                <span className="mobile">{patient.mobile}</span>
              </div>
            </div>
            <div className="table-cell">
              <span className="age-gender">{patient.age} / {patient.gender}</span>
            </div>
            <div className="table-cell">{patient.lastVisit}</div>
            <div className="table-cell">
              <span className={`status-badge ${patient.status}`}>{patient.status}</span>
            </div>
            <div className="table-cell">
              <div className="action-buttons">
                <button 
                  className="btn-small btn-primary"
                  onClick={() => handlePatientAction(patient.id, 'view')}
                >
                  View Profile
                </button>
                <button 
                  className="btn-small btn-warning"
                  onClick={() => handlePatientAction(patient.id, 'edit')}
                >
                  Edit
                </button>
                <button 
                  className="btn-small btn-secondary"
                  onClick={() => handlePatientAction(patient.id, 'medical-history')}
                >
                  Medical History
                </button>
                {patient.status === 'pending' && (
                  <button 
                    className="btn-small btn-success"
                    onClick={() => handlePatientAction(patient.id, 'approve')}
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDoctors = () => (
    <div className="doctors-management">
      <div className="section-header">
        <h2>👨‍⚕️ Doctor Management</h2>
        <div className="section-actions">
          <button className="btn-primary">Add New Doctor</button>
          <button className="btn-secondary">Export Doctors</button>
        </div>
      </div>

      <div className="doctors-grid">
        {doctors.map(doctor => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-header">
              <div className="doctor-avatar">👨‍⚕️</div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p>{doctor.specialization}</p>
                <div className="doctor-rating">
                  <span>⭐ {doctor.rating}</span>
                  <span>{doctor.experience}</span>
                </div>
              </div>
            </div>
            <div className="doctor-stats">
              <div className="stat">
                <span className="stat-value">{doctor.patients}</span>
                <span className="stat-label">Patients</span>
              </div>
              <div className="stat">
                <span className="stat-value">{doctor.status}</span>
                <span className="stat-label">Status</span>
              </div>
            </div>
            <div className="doctor-actions">
              {doctor.status === 'pending' && (
                <button 
                  className="btn-small btn-success"
                  onClick={() => handleDoctorAction(doctor.id, 'approve')}
                >
                  Approve
                </button>
              )}
              <button 
                className="btn-small btn-primary"
                onClick={() => handleDoctorAction(doctor.id, 'view')}
              >
                View Profile
              </button>
              <button 
                className="btn-small btn-warning"
                onClick={() => handleDoctorAction(doctor.id, 'edit')}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-section">
      <div className="section-header">
        <h2>📊 Reports & Analytics</h2>
        <div className="section-actions">
          <button className="btn-primary">Generate Report</button>
          <button className="btn-secondary">Export Data</button>
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

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

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
      <div className="dashboard-content">
        <main className="dashboard-main">
          {currentView === 'overview' && renderOverview()}
          {currentView === 'users' && renderUsers()}
          {currentView === 'patients' && renderPatients()}
          {currentView === 'doctors' && renderDoctors()}
          {currentView === 'reports' && renderReports()}
          {currentView === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;