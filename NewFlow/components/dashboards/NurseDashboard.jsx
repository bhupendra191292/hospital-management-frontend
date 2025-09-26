import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import StandardDashboardLayout from './StandardDashboardLayout';
import './Dashboard.css';

const NurseDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();
  const [stats, setStats] = useState({
    assignedPatients: 0,
    todayTasks: 0,
    completedTasks: 0,
    pendingMedications: 0
  });
  const [patientTasks, setPatientTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('overview');

  const roleInfo = getRoleDetails();

  useEffect(() => {
    loadNurseData();
  }, []);

  const loadNurseData = async () => {
    try {
      setStats({
        assignedPatients: 12,
        todayTasks: 8,
        completedTasks: 5,
        pendingMedications: 3
      });

      setPatientTasks([
        {
          id: 1,
          patientName: 'John Smith',
          task: 'Vital signs check',
          time: '09:00 AM',
          status: 'pending'
        },
        {
          id: 2,
          patientName: 'Sarah Johnson',
          task: 'Medication administration',
          time: '10:30 AM',
          status: 'completed'
        }
      ]);
    } catch (error) {
      console.error('Error loading nurse data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading nurse dashboard...</p>
        </div>
      </div>
    );
  }

  // Define navigation items for nurse dashboard
  const navigationItems = [
    {
      title: 'Dashboard',
      items: [
        { view: 'overview', icon: '📊', label: 'Overview' },
        { view: 'tasks', icon: '📋', label: 'Tasks' },
        { view: 'patients', icon: '👥', label: 'Patients' },
        { view: 'medications', icon: '💊', label: 'Medications' }
      ]
    }
  ];

  const renderOverview = () => (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.assignedPatients}</h3>
            <p>Assigned Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.todayTasks}</h3>
            <p>Today's Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedTasks}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <h3>{stats.pendingMedications}</h3>
            <p>Pending Medications</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2>📋 Patient Tasks</h2>
          <div className="tasks-list">
            {patientTasks.map(task => (
              <div key={task.id} className={`task-item ${task.status}`}>
                <div className="task-time">{task.time}</div>
                <div className="task-details">
                  <h4>{task.patientName}</h4>
                  <p>{task.task}</p>
                </div>
                <div className="task-status">
                  <span className={`status-badge ${task.status}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h2>⚡ Quick Actions</h2>
          <div className="quick-actions">
            {can('VIEW_PATIENTS') && (
              <button className="action-btn">
                <span className="action-icon">👤</span>
                <span>View Patients</span>
              </button>
            )}
            {can('CREATE_MEDICAL_RECORDS') && (
              <button className="action-btn">
                <span className="action-icon">📝</span>
                <span>Update Records</span>
              </button>
            )}
            <button className="action-btn">
              <span className="action-icon">💊</span>
              <span>Medication Schedule</span>
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
      title="Nurse Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Nurse'}!`}
    >
      {currentView === 'overview' && renderOverview()}
      {currentView === 'tasks' && <div>Tasks Management - Coming Soon</div>}
      {currentView === 'patients' && <div>Patient Management - Coming Soon</div>}
      {currentView === 'medications' && <div>Medication Management - Coming Soon</div>}
    </StandardDashboardLayout>
  );
};

export default NurseDashboard;
