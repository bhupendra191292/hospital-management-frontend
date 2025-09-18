/**
 * Role Constants and Permissions for NewFlow
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
  LAB_TECH: 'lab_tech',
  PHARMACIST: 'pharmacist'
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.NURSE]: 'Nurse',
  [ROLES.RECEPTIONIST]: 'Receptionist',
  [ROLES.PATIENT]: 'Patient',
  [ROLES.LAB_TECH]: 'Lab Technician',
  [ROLES.PHARMACIST]: 'Pharmacist'
};

export const ROLE_ICONS = {
  [ROLES.SUPER_ADMIN]: '👑',
  [ROLES.ADMIN]: '👨‍💼',
  [ROLES.DOCTOR]: '👨‍⚕️',
  [ROLES.NURSE]: '👩‍⚕️',
  [ROLES.RECEPTIONIST]: '👩‍💼',
  [ROLES.PATIENT]: '👤',
  [ROLES.LAB_TECH]: '🧪',
  [ROLES.PHARMACIST]: '💊'
};

export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: '#8B5CF6',
  [ROLES.ADMIN]: '#3B82F6',
  [ROLES.DOCTOR]: '#10B981',
  [ROLES.NURSE]: '#F59E0B',
  [ROLES.RECEPTIONIST]: '#EF4444',
  [ROLES.PATIENT]: '#6B7280',
  [ROLES.LAB_TECH]: '#8B5CF6',
  [ROLES.PHARMACIST]: '#EC4899'
};

// Role-based permissions
export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Patient Management
  MANAGE_PATIENTS: 'manage_patients',
  VIEW_PATIENTS: 'view_patients',
  CREATE_PATIENTS: 'create_patients',
  EDIT_PATIENTS: 'edit_patients',
  DELETE_PATIENTS: 'delete_patients',
  
  // Doctor Management
  MANAGE_DOCTORS: 'manage_doctors',
  VIEW_DOCTORS: 'view_doctors',
  CREATE_DOCTORS: 'create_doctors',
  EDIT_DOCTORS: 'edit_doctors',
  DELETE_DOCTORS: 'delete_doctors',
  
  // Appointments
  MANAGE_APPOINTMENTS: 'manage_appointments',
  VIEW_APPOINTMENTS: 'view_appointments',
  CREATE_APPOINTMENTS: 'create_appointments',
  EDIT_APPOINTMENTS: 'edit_appointments',
  DELETE_APPOINTMENTS: 'delete_appointments',
  
  // Medical Records
  MANAGE_MEDICAL_RECORDS: 'manage_medical_records',
  VIEW_MEDICAL_RECORDS: 'view_medical_records',
  CREATE_MEDICAL_RECORDS: 'create_medical_records',
  EDIT_MEDICAL_RECORDS: 'edit_medical_records',
  
  // Analytics & Reports
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // System Settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',
  
  // Billing & Finance
  MANAGE_BILLING: 'manage_billing',
  VIEW_BILLING: 'view_billing',
  
  // Lab Management
  MANAGE_LAB_RESULTS: 'manage_lab_results',
  VIEW_LAB_RESULTS: 'view_lab_results',
  
  // Pharmacy
  MANAGE_PHARMACY: 'manage_pharmacy',
  VIEW_PHARMACY: 'view_pharmacy'
};

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // Super Admin has all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.CREATE_PATIENTS,
    PERMISSIONS.EDIT_PATIENTS,
    PERMISSIONS.MANAGE_DOCTORS,
    PERMISSIONS.VIEW_DOCTORS,
    PERMISSIONS.CREATE_DOCTORS,
    PERMISSIONS.EDIT_DOCTORS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_BILLING
  ],
  
  [ROLES.DOCTOR]: [
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.EDIT_PATIENTS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.MANAGE_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.CREATE_MEDICAL_RECORDS,
    PERMISSIONS.EDIT_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_LAB_RESULTS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  
  [ROLES.NURSE]: [
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.EDIT_PATIENTS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.CREATE_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_LAB_RESULTS
  ],
  
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.CREATE_PATIENTS,
    PERMISSIONS.EDIT_PATIENTS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.VIEW_BILLING
  ],
  
  [ROLES.PATIENT]: [
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_BILLING
  ],
  
  [ROLES.LAB_TECH]: [
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_LAB_RESULTS,
    PERMISSIONS.VIEW_LAB_RESULTS,
    PERMISSIONS.VIEW_APPOINTMENTS
  ],
  
  [ROLES.PHARMACIST]: [
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_PHARMACY,
    PERMISSIONS.VIEW_PHARMACY,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_APPOINTMENTS
  ]
};

// Helper functions
export const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

export const getRoleInfo = (role) => ({
  label: ROLE_LABELS[role],
  icon: ROLE_ICONS[role],
  color: ROLE_COLORS[role],
  permissions: ROLE_PERMISSIONS[role] || []
});
