// NewFlow API Service
import newFlowApi from './axiosInstance';

// NewFlow Authentication
export const newFlowLogin = (loginField, password, tenantId) =>
  newFlowApi.post('/newflow/auth/login', { loginField, password, tenantId });

export const newFlowForgotPassword = (loginField, tenantId) =>
  newFlowApi.post('/newflow/auth/forgot-password', { loginField, tenantId });

// NewFlow Dashboard
export const getNewFlowDashboardStats = () =>
  newFlowApi.get('/newflow/dashboard/stats');

// NewFlow Patient APIs
export const getNewFlowPatients = (params) =>
  newFlowApi.get('/newflow/patients', { params });

export const getNewFlowPatientById = (id) =>
  newFlowApi.get(`/newflow/patients/${id}`);

export const getNewFlowPatientMedicalRecords = (patientId) =>
  newFlowApi.get(`/newflow/patients/${patientId}/medical-records`);

export const createNewFlowPatient = (data) =>
  newFlowApi.post('/newflow/patients', data);

export const updateNewFlowPatient = (id, data) =>
  newFlowApi.put(`/newflow/patients/${id}`, data);

export const deleteNewFlowPatient = (id) =>
  newFlowApi.delete(`/newflow/patients/${id}`);

export const checkNewFlowDuplicates = (data) =>
  newFlowApi.post('/newflow/patients/check-duplicates', data);

export const getNewFlowFamilyMembers = (id) =>
  newFlowApi.get(`/newflow/patients/${id}/family`);

export const getNewFlowPatientStats = () =>
  newFlowApi.get('/newflow/patients/stats');

// NewFlow Doctor APIs
export const getNewFlowDoctors = (department = null) => {
  const params = department ? { department } : {};
  return newFlowApi.get('/newflow/doctors', { params });
};

export const getAllNewFlowDoctors = (params = {}) => {
  return newFlowApi.get('/newflow/doctors', { params });
};

export const createNewFlowDoctor = (data) => {
  return newFlowApi.post('/newflow/doctors', data);
};

export const updateNewFlowDoctor = (id, data) => {
  return newFlowApi.put(`/newflow/doctors/${id}`, data);
};

export const deleteNewFlowDoctor = (id) => {
  return newFlowApi.delete(`/newflow/doctors/${id}`);
};

export const getNewFlowDoctorById = (id) => {
  return newFlowApi.get(`/newflow/doctors/${id}`);
};

// NewFlow Visit APIs
export const getNewFlowVisits = (params) =>
  newFlowApi.get('/newflow/visits', { params });

export const getNewFlowVisitById = (id) =>
  newFlowApi.get(`/newflow/visits/${id}`);

export const createNewFlowVisit = (data) =>
  newFlowApi.post('/newflow/visits', data);

export const updateNewFlowVisit = (id, data) =>
  newFlowApi.put(`/newflow/visits/${id}`, data);

export const deleteNewFlowVisit = (id) =>
  newFlowApi.delete(`/newflow/visits/${id}`);

export const getNewFlowVisitsByPatient = (patientId) =>
  newFlowApi.get(`/newflow/visits/patient/${patientId}`);

export const getNewFlowVisitsByDoctor = (doctorId, date = null) => {
  const params = date ? { date } : {};
  return newFlowApi.get(`/newflow/visits/doctor/${doctorId}`, { params });
};

export const getAllNewFlowVisits = (params = {}) =>
  newFlowApi.get('/newflow/visits', { params });

export const getNewFlowVisitStats = () =>
  newFlowApi.get('/newflow/visits/stats');

// NewFlow Appointment APIs
export const bookNewFlowAppointment = (data) =>
  newFlowApi.post('/newflow/appointments/book', data);

// NewFlow Patient Search
export const searchNewFlowPatients = (type, query) =>
  newFlowApi.get('/newflow/patients/search', { params: { type, query } });

// NewFlow UHID Generation
export const generateNewFlowUHID = (hospitalCode, registrationDate) =>
  newFlowApi.post('/newflow/patients/generate-uhid', { hospitalCode, registrationDate });

// NewFlow Health Check
export const getNewFlowHealth = () =>
  newFlowApi.get('/newflow/health');

// Helper function to get auth token from localStorage
export const getNewFlowAuthToken = () => {
  return localStorage.getItem('newflow_token');
};

// Helper function to set auth token in localStorage
export const setNewFlowAuthToken = (token) => {
  localStorage.setItem('newflow_token', token);
};

// Helper function to remove auth token from localStorage
export const removeNewFlowAuthToken = () => {
  localStorage.removeItem('newflow_token');
};

// Helper function to get user data from localStorage
export const getNewFlowUser = () => {
  const userStr = localStorage.getItem('newflow_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to set user data in localStorage
export const setNewFlowUser = (user) => {
  localStorage.setItem('newflow_user', JSON.stringify(user));
};

// Helper function to remove user data from localStorage
export const removeNewFlowUser = () => {
  localStorage.removeItem('newflow_user');
};

// Helper function to check if user is authenticated
export const isNewFlowAuthenticated = () => {
  const token = getNewFlowAuthToken();
  const user = getNewFlowUser();
  return !!(token && user);
};

// Helper function to logout
export const newFlowLogout = () => {
  removeNewFlowAuthToken();
  removeNewFlowUser();
};

// Doctor approval functions
export const getPendingNewFlowDoctors = () => {
  return newFlowApi.get('/newflow/doctors/pending');
};

export const approveNewFlowDoctor = (id) => {
  return newFlowApi.put(`/newflow/doctors/${id}/approve`);
};

export const rejectNewFlowDoctor = (id, reason) => {
  return newFlowApi.put(`/newflow/doctors/${id}/reject`, { reason });
};

// NewFlow Prescription APIs
export const getNewFlowPrescriptions = (params) =>
  newFlowApi.get('/newflow/prescriptions', { params });

export const getNewFlowPrescriptionById = (id) =>
  newFlowApi.get(`/newflow/prescriptions/${id}`);

export const createNewFlowPrescription = (data) =>
  newFlowApi.post('/newflow/prescriptions', data);

export const updateNewFlowPrescription = (id, data) =>
  newFlowApi.put(`/newflow/prescriptions/${id}`, data);

export const deleteNewFlowPrescription = (id) =>
  newFlowApi.delete(`/newflow/prescriptions/${id}`);

export const getNewFlowPrescriptionsByPatient = (patientId) =>
  newFlowApi.get(`/newflow/prescriptions/patient/${patientId}`);

export const getNewFlowPrescriptionsByDoctor = (doctorId) =>
  newFlowApi.get(`/newflow/prescriptions/doctor/${doctorId}`);

// NewFlow User Management APIs
export const getNewFlowUsers = (params) =>
  newFlowApi.get('/newflow/users', { params });

export const getNewFlowUserById = (id) =>
  newFlowApi.get(`/newflow/users/${id}`);

export const createNewFlowUser = (data) =>
  newFlowApi.post('/newflow/users', data);

export const updateNewFlowUser = (id, data) =>
  newFlowApi.put(`/newflow/users/${id}`, data);

export const deleteNewFlowUser = (id) =>
  newFlowApi.delete(`/newflow/users/${id}`);

export const getNewFlowUserStats = () =>
  newFlowApi.get('/newflow/users/stats');

export const updateNewFlowUserPassword = (id, currentPassword, newPassword) =>
  newFlowApi.patch(`/newflow/users/${id}/password`, { currentPassword, newPassword });

export const toggleNewFlowUserStatus = (id, status) =>
  newFlowApi.patch(`/newflow/users/${id}/status`, { status });

// NewFlow Notification APIs
export const getNewFlowNotifications = (params) =>
  newFlowApi.get('/newflow/notifications', { params });

export const getNewFlowNotificationStats = () =>
  newFlowApi.get('/newflow/notifications/stats');

export const markNewFlowNotificationAsRead = (id) =>
  newFlowApi.patch(`/newflow/notifications/${id}/read`);

export const markAllNewFlowNotificationsAsRead = () =>
  newFlowApi.patch('/newflow/notifications/read-all');

export const deleteNewFlowNotification = (id) =>
  newFlowApi.delete(`/newflow/notifications/${id}`);

export const clearAllNewFlowNotifications = () =>
  newFlowApi.delete('/newflow/notifications/clear-all');

export const sendNewFlowNotification = (data) =>
  newFlowApi.post('/newflow/notifications/send', data);

export const getNewFlowNotificationSettings = () =>
  newFlowApi.get('/newflow/notifications/settings');

export const updateNewFlowNotificationSettings = (settings) =>
  newFlowApi.patch('/newflow/notifications/settings', settings);

// NewFlow Billing APIs
export const getNewFlowBills = (params) =>
  newFlowApi.get('/newflow/bills', { params });

export const getNewFlowBillById = (id) =>
  newFlowApi.get(`/newflow/bills/${id}`);

export const createNewFlowBill = (data) =>
  newFlowApi.post('/newflow/bills', data);

export const updateNewFlowBill = (id, data) =>
  newFlowApi.put(`/newflow/bills/${id}`, data);

export const deleteNewFlowBill = (id) =>
  newFlowApi.delete(`/newflow/bills/${id}`);

export const getNewFlowBillingStats = () =>
  newFlowApi.get('/newflow/bills/stats');

export const addNewFlowBillPayment = (billId, paymentData) =>
  newFlowApi.post(`/newflow/bills/${billId}/payments`, paymentData);

export const getNewFlowBillPayments = (billId) =>
  newFlowApi.get(`/newflow/bills/${billId}/payments`);

export const getNewFlowBillingSummary = (params) =>
  newFlowApi.get('/newflow/bills/reports/summary', { params });

export const getNewFlowOutstandingBills = (params) =>
  newFlowApi.get('/newflow/bills/reports/outstanding', { params });

export const getNewFlowCollectionReport = (params) =>
  newFlowApi.get('/newflow/bills/reports/collections', { params });

export const exportNewFlowBillPDF = (billId) =>
  newFlowApi.get(`/newflow/bills/export/pdf/${billId}`, { responseType: 'blob' });

export const exportNewFlowBillsExcel = (params) =>
  newFlowApi.get('/newflow/bills/export/excel', { params, responseType: 'blob' });
