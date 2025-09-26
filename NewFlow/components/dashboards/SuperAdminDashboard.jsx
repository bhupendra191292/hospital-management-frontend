// import React from 'react'; // Not needed in modern React
import { useRole } from '../../contexts/RoleContext';
import AdminDashboard from './AdminDashboardNew';
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
