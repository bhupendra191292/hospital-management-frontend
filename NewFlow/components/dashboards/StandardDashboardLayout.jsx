import React from 'react';
import { useRole } from '../../contexts/RoleContext';
import './StandardDashboardLayout.css';

const StandardDashboardLayout = ({ 
  children, 
  sidebarOpen, 
  setSidebarOpen, 
  currentView, 
  setCurrentView,
  navigationItems = [],
  title = "Dashboard",
  subtitle = "Welcome to your dashboard"
}) => {
  const { user, getRoleDetails } = useRole();
  const roleInfo = getRoleDetails();

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const handleLogout = () => {
    localStorage.removeItem('newflow_token');
    localStorage.removeItem('newflow_user');
    window.location.href = '/login';
  };

  return (
    <div className="standard-dashboard">
      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🏥</div>
            <div className="logo-text">
              <h2>Digital Hospital</h2>
              <p>{roleInfo?.label || 'Dashboard'}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              {section.title && <h3 className="nav-section-title">{section.title}</h3>}
              {section.items.map((item, itemIndex) => (
                <button 
                  key={itemIndex}
                  className={`nav-item ${currentView === item.view ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.view)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{roleInfo?.label || 'Role'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StandardDashboardLayout;
