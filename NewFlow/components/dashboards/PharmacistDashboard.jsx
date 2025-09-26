import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import StandardDashboardLayout from './StandardDashboardLayout';
import './Dashboard.css';

const PharmacistDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();
  const [currentView, setCurrentView] = useState('overview');
  const [stats, setStats] = useState({
    pendingPrescriptions: 0,
    dispensedToday: 0,
    stockAlerts: 0,
    totalInventory: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const roleInfo = getRoleDetails();

  useEffect(() => {
    loadPharmacistData();
  }, []);

  const loadPharmacistData = async () => {
    try {
      setStats({
        pendingPrescriptions: 12,
        dispensedToday: 25,
        stockAlerts: 5,
        totalInventory: 150
      });
    } catch (error) {
      console.error('Error loading pharmacist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading pharmacist dashboard...</p>
        </div>
      </div>
    );
  }

  // Define navigation items for pharmacist dashboard
  const navigationItems = [
    {
      title: 'Dashboard',
      items: [
        { view: 'overview', icon: '📊', label: 'Overview' },
        { view: 'prescriptions', icon: '💊', label: 'Prescriptions' },
        { view: 'inventory', icon: '📦', label: 'Inventory' },
        { view: 'dispensing', icon: '🏥', label: 'Dispensing' }
      ]
    }
  ];

  const renderOverview = () => (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <h3>{stats.pendingPrescriptions}</h3>
            <p>Pending Prescriptions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.dispensedToday}</h3>
            <p>Dispensed Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.stockAlerts}</h3>
            <p>Stock Alerts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.totalInventory}</h3>
            <p>Total Inventory</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2>💊 Pending Prescriptions</h2>
          <div className="prescriptions-list">
            <div className="prescription-item">
              <div className="prescription-info">
                <h4>John Smith</h4>
                <p>Paracetamol 500mg - 2 tablets daily</p>
              </div>
              <div className="prescription-status">
                <span className="status-badge pending">Pending</span>
              </div>
            </div>
            <div className="prescription-item">
              <div className="prescription-info">
                <h4>Jane Doe</h4>
                <p>Amoxicillin 250mg - 3 times daily</p>
              </div>
              <div className="prescription-status">
                <span className="status-badge ready">Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>⚡ Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">💊</span>
              <span>Process Prescription</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📦</span>
              <span>Check Inventory</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🏥</span>
              <span>Dispense Medicine</span>
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
      title="Pharmacist Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Pharmacist'}!`}
    >
      {currentView === 'overview' && renderOverview()}
      {currentView === 'prescriptions' && <div>Prescription Management - Coming Soon</div>}
      {currentView === 'inventory' && <div>Inventory Management - Coming Soon</div>}
      {currentView === 'dispensing' && <div>Dispensing Management - Coming Soon</div>}
    </StandardDashboardLayout>
  );
};

export default PharmacistDashboard;
