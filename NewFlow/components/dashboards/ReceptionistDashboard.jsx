import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import StandardDashboardLayout from './StandardDashboardLayout';
import './Dashboard.css';

const ReceptionistDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();
  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingRegistrations: 0,
    completedCheckins: 0,
    totalPatients: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const roleInfo = getRoleDetails();

  useEffect(() => {
    loadReceptionistData();
  }, []);

  const loadReceptionistData = async () => {
    try {
      setStats({
        todayAppointments: 25,
        pendingRegistrations: 8,
        completedCheckins: 17,
        totalPatients: 150
      });
    } catch (error) {
      console.error('Error loading receptionist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading receptionist dashboard...</p>
        </div>
      </div>
    );
  }

  // Define navigation items for receptionist dashboard
  const navigationItems = [
    {
      title: "Dashboard",
      items: [
        { view: 'overview', icon: '📊', label: 'Overview' },
        { view: 'appointments', icon: '📅', label: 'Appointments' },
        { view: 'patients', icon: '👥', label: 'Patients' },
        { view: 'checkin', icon: '✅', label: 'Check-in' }
      ]
    }
  ];

  const renderOverview = () => (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{stats.pendingRegistrations}</h3>
            <p>Pending Registrations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedCheckins}</h3>
            <p>Completed Check-ins</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2>📅 Today's Schedule</h2>
          <div className="schedule-list">
            <div className="schedule-item">
              <div className="schedule-time">09:00 AM</div>
              <div className="schedule-details">
                <h4>John Smith</h4>
                <p>Dr. Sarah Johnson - Cardiology</p>
              </div>
              <div className="schedule-status">
                <span className="status-badge pending">Pending</span>
              </div>
            </div>
            <div className="schedule-item">
              <div className="schedule-time">10:30 AM</div>
              <div className="schedule-details">
                <h4>Jane Doe</h4>
                <p>Dr. Mike Wilson - General</p>
              </div>
              <div className="schedule-status">
                <span className="status-badge completed">Checked In</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>⚡ Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">👤</span>
              <span>Register Patient</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📅</span>
              <span>Schedule Appointment</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">✅</span>
              <span>Check-in Patient</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StandardDashboardLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      currentView={currentView}
      setCurrentView={setCurrentView}
      navigationItems={navigationItems}
      title="Receptionist Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Receptionist'}!`}
    >
      {currentView === 'overview' && renderOverview()}
      {currentView === 'appointments' && <div>Appointment Management - Coming Soon</div>}
      {currentView === 'patients' && <div>Patient Management - Coming Soon</div>}
      {currentView === 'checkin' && <div>Check-in Management - Coming Soon</div>}
    </StandardDashboardLayout>
  );
};

export default ReceptionistDashboard;
