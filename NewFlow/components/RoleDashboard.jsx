import React from 'react';
import { useRole } from '../contexts/RoleContext';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboardNew';
import DoctorDashboard from './dashboards/DoctorDashboard';
import NurseDashboard from './dashboards/NurseDashboard';
import ReceptionistDashboard from './dashboards/ReceptionistDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import LabTechDashboard from './dashboards/LabTechDashboard';
import PharmacistDashboard from './dashboards/PharmacistDashboard';
import { ROLES } from '../constants/roles';

const RoleDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { userRole, isLoading } = useRole();


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
