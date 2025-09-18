import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleDashboard from './components/RoleDashboard';
import './Dashboard.css';

const NewFlowDashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('newflow_token');
    const userData = localStorage.getItem('newflow_user');

    if (!token || !userData) {
      navigate('/login');

      return;
    }

    setUser(JSON.parse(userData));
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('newflow_token');
    localStorage.removeItem('newflow_user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="newflow-dashboard">
        <header className="newflow-header">
          <div className="header-content">
            <div className="header-left">
              <button
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
              <div className="header-title">
                <h1>🚀 NewFlow Dashboard</h1>
                <p>Welcome back, {user?.name || user?.email}!</p>
              </div>
            </div>
            <div className="header-right">
              <div className="notification-bell">
                <span className="bell-icon">🔔</span>
                <span className="notification-count">3</span>
              </div>
              <div className="user-profile">
                <div className="user-avatar">
                  <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}</span>
                </div>
                <span className="user-name">{user?.name || user?.email}</span>
                <span className="dropdown-arrow">▼</span>
              </div>
            </div>
          </div>
        </header>

        <main className="newflow-main">
          <div className="admin-dashboard">
            {/* Sidebar Navigation */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
              <div className="sidebar-header">
                <div className="sidebar-logo">
                  <div className="logo-icon">🏥</div>
                  <div className="logo-text">
                    <h2>Digital Hospital</h2>
                    <p>Management System</p>
                  </div>
                </div>
              </div>

              <nav className="sidebar-nav">
                <div className="nav-section">
                  <h3 className="nav-section-title">Main</h3>
                  <button className="nav-item active">
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">Overview</span>
                  </button>
                </div>

                <div className="nav-section">
                  <h3 className="nav-section-title">Management</h3>
                  <button className="nav-item">
                    <span className="nav-icon">👥</span>
                    <span className="nav-text">Users</span>
                  </button>
                  <button className="nav-item">
                    <span className="nav-icon">🏥</span>
                    <span className="nav-text">Patients</span>
                  </button>
                  <button className="nav-item">
                    <span className="nav-icon">👨‍⚕️</span>
                    <span className="nav-text">Doctors</span>
                  </button>
                </div>

                <div className="nav-section">
                  <h3 className="nav-section-title">Analytics</h3>
                  <button className="nav-item">
                    <span className="nav-icon">📈</span>
                    <span className="nav-text">Reports</span>
                  </button>
                </div>

                <div className="nav-section">
                  <h3 className="nav-section-title">System</h3>
                  <button className="nav-item">
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-text">Settings</span>
                  </button>
                </div>
              </nav>
            </aside>

            {/* Main Content Area */}
            <div className="dashboard-content loading-content">
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
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="newflow-dashboard">
      <header className="newflow-header">
        <div className="header-content">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="header-title">
              <h1>🚀 NewFlow Dashboard</h1>
              <p>Welcome back, {user?.name || user?.email}!</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="notification-btn">
                🔔
                <span className="notification-badge">3</span>
              </button>
              <div className="profile-dropdown">
                <button className="profile-btn">
                  <div className="profile-avatar">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </div>
                  <span className="profile-name">{user?.name || 'Admin'}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-menu">
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="newflow-main">
        <RoleDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </main>
    </div>
  );
};

export default NewFlowDashboard;
