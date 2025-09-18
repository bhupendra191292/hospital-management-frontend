import React from 'react';
import { useRole } from '../contexts/RoleContext';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import NurseDashboard from './dashboards/NurseDashboard';
import ReceptionistDashboard from './dashboards/ReceptionistDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import LabTechDashboard from './dashboards/LabTechDashboard';
import PharmacistDashboard from './dashboards/PharmacistDashboard';
import { ROLES } from '../constants/roles';

const RoleDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { userRole, isLoading } = useRole();

  if (isLoading) {
    return (
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
          <div className="content-header">
            <div className="header-left">
              <h1>🏥 NewFlow Dashboard</h1>
              <p>Welcome back, Admin!</p>
            </div>
            <div className="header-right">
              <div className="notification-bell">
                <span className="bell-icon">🔔</span>
                <span className="notification-count">3</span>
              </div>
              <div className="user-profile">
                <div className="user-avatar">
                  <span>A</span>
                </div>
                <span className="user-name">Admin</span>
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
      </div>
    );
  }

  const renderDashboard = () => {
    switch (userRole) {
      case ROLES.SUPER_ADMIN:
        return <SuperAdminDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
      case ROLES.ADMIN:
        return <AdminDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
      case ROLES.DOCTOR:
        return <DoctorDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
      case ROLES.NURSE:
        return <NurseDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
      case ROLES.RECEPTIONIST:
        return <ReceptionistDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
      case ROLES.PATIENT:
        return <PatientDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
      case ROLES.LAB_TECH:
        return <LabTechDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
      case ROLES.PHARMACIST:
        return <PharmacistDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div className="role-dashboard">
      {renderDashboard()}
    </div>
  );
};

// Default dashboard for unknown roles
const DefaultDashboard = () => {
  const { user, getRoleDetails } = useRole();
  const roleInfo = getRoleDetails();

  return (
    <div className="default-dashboard">
      <div className="dashboard-header">
        <h1>Welcome to NewFlow</h1>
        <div className="user-info">
          <span className="role-badge" style={{ backgroundColor: roleInfo?.color }}>
            {roleInfo?.icon} {roleInfo?.label}
          </span>
          <p>Hello, {user?.name || user?.email}!</p>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="info-card">
          <h3>Role Dashboard Not Found</h3>
          <p>Your role ({user?.role}) doesn't have a specific dashboard yet.</p>
          <p>Please contact your administrator to set up your role-specific dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboard;
