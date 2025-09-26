import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import StandardDashboardLayout from './StandardDashboardLayout';
import './Dashboard.css';

const LabTechDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();
  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedTests: 0,
    todayTests: 0,
    urgentTests: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const roleInfo = getRoleDetails();

  useEffect(() => {
    loadLabTechData();
  }, []);

  const loadLabTechData = async () => {
    try {
      setStats({
        pendingTests: 15,
        completedTests: 8,
        todayTests: 23,
        urgentTests: 3
      });
    } catch (error) {
      console.error('Error loading lab tech data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading lab tech dashboard...</p>
        </div>
      </div>
    );
  }

  // Define navigation items for lab tech dashboard
  const navigationItems = [
    {
      title: 'Dashboard',
      items: [
        { view: 'overview', icon: '📊', label: 'Overview' },
        { view: 'tests', icon: '🧪', label: 'Lab Tests' },
        { view: 'results', icon: '📋', label: 'Results' },
        { view: 'equipment', icon: '🔬', label: 'Equipment' }
      ]
    }
  ];

  const renderOverview = () => (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🧪</div>
          <div className="stat-content">
            <h3>{stats.pendingTests}</h3>
            <p>Pending Tests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedTests}</h3>
            <p>Completed Tests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayTests}</h3>
            <p>Today's Tests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.urgentTests}</h3>
            <p>Urgent Tests</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2>🧪 Recent Lab Tests</h2>
          <div className="tests-list">
            <div className="test-item">
              <div className="test-info">
                <h4>Blood Test - John Smith</h4>
                <p>Complete Blood Count</p>
              </div>
              <div className="test-status">
                <span className="status-badge pending">Pending</span>
              </div>
            </div>
            <div className="test-item">
              <div className="test-info">
                <h4>Urine Test - Jane Doe</h4>
                <p>Urinalysis</p>
              </div>
              <div className="test-status">
                <span className="status-badge completed">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>⚡ Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">🧪</span>
              <span>Process Test</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📋</span>
              <span>Upload Results</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🔬</span>
              <span>Equipment Status</span>
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
      title="Lab Tech Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Lab Tech'}!`}
    >
      {currentView === 'overview' && renderOverview()}
      {currentView === 'tests' && <div>Lab Tests Management - Coming Soon</div>}
      {currentView === 'results' && <div>Results Management - Coming Soon</div>}
      {currentView === 'equipment' && <div>Equipment Management - Coming Soon</div>}
    </StandardDashboardLayout>
  );
};

export default LabTechDashboard;
