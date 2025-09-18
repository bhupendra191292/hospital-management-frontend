// src/services/api.js
// This file now re-exports NewFlow APIs for backward compatibility
// All components should use NewFlow APIs directly

import newFlowApi from '../NewFlow/services/axiosInstance';

// Re-export NewFlow APIs for backward compatibility
export {
  // Authentication
  newFlowLogin as loginDoctor,
  
  // Patients
  getNewFlowPatients as getPatients,
  getNewFlowPatientById as getPatientById,
  createNewFlowPatient as registerPatient,
  updateNewFlowPatient,
  deleteNewFlowPatient,
  checkNewFlowDuplicates as checkPatient,
  searchNewFlowPatients,
  
  // Doctors
  getNewFlowDoctors as getDoctors,
  getAllNewFlowDoctors,
  createNewFlowDoctor as createDoctor,
  updateNewFlowDoctor as updateDoctor,
  deleteNewFlowDoctor as deleteDoctor,
  getNewFlowDoctorById,
  getPendingNewFlowDoctors,
  approveNewFlowDoctor as promoteDoctor,
  rejectNewFlowDoctor,
  
  // Visits/Appointments
  getNewFlowVisits as getVisits,
  getNewFlowVisitById,
  createNewFlowVisit as addVisit,
  updateNewFlowVisit as updateVisit,
  deleteNewFlowVisit,
  getNewFlowVisitsByPatient,
  getNewFlowVisitsByDoctor,
  getAllNewFlowVisits as getAppointments,
  getNewFlowVisitById as getAppointmentById,
  bookNewFlowAppointment as createAppointment,
  updateNewFlowVisit as updateAppointment,
  deleteNewFlowVisit as deleteAppointment,
  getNewFlowVisitsByPatient as getPatientAppointments,
  getNewFlowVisitStats as getTodayAppointments,
  
  // Dashboard
  getNewFlowDashboardStats as getDashboardSummary,
  getNewFlowVisitStats as getTrends,
  
  // Prescriptions
  getNewFlowPrescriptions,
  createNewFlowPrescription,
  updateNewFlowPrescription,
  deleteNewFlowPrescription,
  getNewFlowPrescriptionsByPatient,
  getNewFlowPrescriptionsByDoctor,
  
  // Health Check
  getNewFlowHealth,
  
  // Auth helpers
  getNewFlowAuthToken,
  setNewFlowAuthToken,
  removeNewFlowAuthToken,
  getNewFlowUser,
  setNewFlowUser,
  removeNewFlowUser,
  isNewFlowAuthenticated,
  newFlowLogout
} from '../NewFlow/services/api';
