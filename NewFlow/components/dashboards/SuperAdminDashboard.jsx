import React from 'react';
import { useRole } from '../../contexts/RoleContext';
import AdminDashboard from './AdminDashboard';
import './Dashboard.css';

const SuperAdminDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails } = useRole();
  const roleInfo = getRoleDetails();

  return (
    <div className="super-admin-dashboard">
      {/* Include Admin Dashboard with super admin privileges - no duplicate header */}
      <AdminDashboard sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>
  );
};

export default SuperAdminDashboard;
