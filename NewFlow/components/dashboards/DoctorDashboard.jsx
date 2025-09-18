import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { getNewFlowVisitsByDoctor, getNewFlowDoctors } from '../../services/api';
import PatientVisitModal from '../ui/PatientVisitModal';
import StandardDashboardLayout from './StandardDashboardLayout';
import './Dashboard.css';

const DoctorDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();
  const [currentView, setCurrentView] = useState('schedule'); // schedule, patients, records, prescriptions
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedVisits: 0,
    pendingVisits: 0,
    totalPatients: 0,
    averageRating: 0,
    monthlyRevenue: 0
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const roleInfo = getRoleDetails();

  useEffect(() => {
    if (user?.id || user?._id) {
      loadDoctorData();
    }
  }, [user]);

  const loadDoctorData = async () => {
    try {
      setIsLoading(true);
      
      // Get current doctor's ID from user context
      const doctorId = user?.id || user?._id;
      
      if (!doctorId) {
        console.error('No doctor ID found in user context');
        return;
      }

      console.log('🔍 Loading appointments for doctor:', doctorId);

      // Fetch today's appointments for this doctor
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const appointmentsResponse = await getNewFlowVisitsByDoctor(doctorId, today);
      
      console.log('📅 Appointments response:', appointmentsResponse.data);

      if (appointmentsResponse.data.success) {
        const appointments = appointmentsResponse.data.data.visits || [];
        
        // Transform appointments to match the expected format
        const transformedAppointments = appointments.map(appointment => ({
          id: appointment._id || appointment.visitId,
          visitId: appointment.visitId,
          time: appointment.appointmentTime,
          patient: appointment.patientId?.name || 'Unknown Patient',
          patientId: appointment.patientId?._id || appointment.patientId,
          type: appointment.visitType,
          status: appointment.status?.toLowerCase() || 'pending',
          notes: appointment.chiefComplaint || appointment.notes || 'No notes',
          department: appointment.department,
          priority: appointment.priority,
          appointmentDate: appointment.appointmentDate
        }));

        // Calculate stats from real data
        const todayAppointments = transformedAppointments.length;
        const completedVisits = transformedAppointments.filter(apt => apt.status === 'completed').length;
        const pendingVisits = transformedAppointments.filter(apt => apt.status === 'scheduled' || apt.status === 'pending').length;
        const inProgressVisits = transformedAppointments.filter(apt => apt.status === 'in progress').length;

        // Get unique patients from appointments
        const uniquePatients = [...new Map(transformedAppointments.map(apt => [apt.patientId, apt])).values()];

        const realStats = {
          todayAppointments,
          completedVisits,
          pendingVisits,
          inProgressVisits,
          totalPatients: uniquePatients.length,
          averageRating: 4.8, // Keep mock for now
          monthlyRevenue: 0 // Keep mock for now
        };

        setStats(realStats);
        setTodaySchedule(transformedAppointments);
        
        // Set patients from appointments
        setPatients(uniquePatients.map(patient => ({
          id: patient.patientId,
          name: patient.patient,
          lastVisit: patient.appointmentDate,
          condition: patient.department,
          status: patient.status,
          nextAppointment: patient.appointmentDate
        })));

        // Set medical records from appointments
        setMedicalRecords(transformedAppointments.map(apt => ({
          id: apt.id,
          patient: apt.patient,
          date: apt.appointmentDate,
          diagnosis: apt.department,
          treatment: 'Not specified',
          notes: apt.notes
        })));

        console.log('✅ Doctor data loaded successfully:', {
          stats: realStats,
          appointments: transformedAppointments.length,
          patients: uniquePatients.length
        });
      } else {
        console.error('Failed to fetch appointments:', appointmentsResponse.data.message);
        // Fallback to empty data
        setStats({
          todayAppointments: 0,
          completedVisits: 0,
          pendingVisits: 0,
          inProgressVisits: 0,
          totalPatients: 0,
          averageRating: 0,
          monthlyRevenue: 0
        });
        setTodaySchedule([]);
        setPatients([]);
        setMedicalRecords([]);
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
      // Fallback to empty data on error
      setStats({
        todayAppointments: 0,
        completedVisits: 0,
        pendingVisits: 0,
        inProgressVisits: 0,
        totalPatients: 0,
        averageRating: 0,
        monthlyRevenue: 0
      });
      setTodaySchedule([]);
      setPatients([]);
      setMedicalRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentAction = (appointment, action) => {
    console.log(`Appointment action: ${action} for appointment ${appointment.id}`);
    
    if (action === 'view' || action === 'start') {
      setSelectedAppointment(appointment);
      setShowVisitModal(true);
    } else if (action === 'complete') {
      // This will be handled in the modal
      setSelectedAppointment(appointment);
      setShowVisitModal(true);
    }
  };

  const handleVisitUpdate = (updatedVisit) => {
    // Update the appointment in the schedule
    setTodaySchedule(prev => 
      prev.map(apt => 
        apt.id === updatedVisit._id || apt.id === updatedVisit.visitId 
          ? { ...apt, status: updatedVisit.status }
          : apt
      )
    );
    
    // Reload data to get updated stats
    loadDoctorData();
  };

  const handleCloseVisitModal = () => {
    setShowVisitModal(false);
    setSelectedAppointment(null);
  };

  const handlePatientAction = (patientId, action) => {
    console.log(`Patient action: ${action} for patient ${patientId}`);
    alert(`Patient action: ${action} for patient ${patientId}`);
  };

  const renderSchedule = () => (
    <div className="schedule-section">
      <div className="section-header">
        <h2>📅 Today's Schedule</h2>
        <div className="section-actions">
          <button className="btn-primary" onClick={loadDoctorData}>🔄 Refresh</button>
          <button className="btn-secondary">View Calendar</button>
        </div>
      </div>

      <div className="schedule-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedVisits}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingVisits}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.inProgressVisits || 0}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.averageRating}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      <div className="appointments-list">
        {todaySchedule.map(appointment => (
          <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
            <div className="appointment-time">
              <span className="time">{appointment.time}</span>
              <span className={`status-badge ${appointment.status}`}>
                {appointment.status}
              </span>
            </div>
            <div className="appointment-details">
              <h4>{appointment.patient}</h4>
              <p>{appointment.type}</p>
              <p className="notes">{appointment.notes}</p>
            </div>
            <div className="appointment-actions">
              {(appointment.status === 'pending' || appointment.status === 'scheduled') && (
                <button 
                  className="btn-small btn-primary"
                  onClick={() => handleAppointmentAction(appointment, 'start')}
                >
                  Start Visit
                </button>
              )}
              {appointment.status === 'in-progress' && (
                <button 
                  className="btn-small btn-success"
                  onClick={() => handleAppointmentAction(appointment, 'complete')}
                >
                  Complete
                </button>
              )}
              {appointment.status === 'completed' && (
                <button 
                  className="btn-small btn-info"
                  onClick={() => handleAppointmentAction(appointment, 'view')}
                >
                  View Details
                </button>
              )}
              {(appointment.status !== 'completed') && (
                <button 
                  className="btn-small btn-secondary"
                  onClick={() => handleAppointmentAction(appointment, 'view')}
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="patients-section">
      <div className="section-header">
        <h2>👥 My Patients</h2>
        <div className="section-actions">
          <button className="btn-primary">Add Patient</button>
          <button className="btn-secondary">Search Patients</button>
        </div>
      </div>

      <div className="patients-grid">
        {patients.map(patient => (
          <div key={patient.id} className="patient-card">
            <div className="patient-header">
              <div className="patient-avatar">👤</div>
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <p>Age: {patient.age}</p>
                <p>Last Visit: {patient.lastVisit}</p>
              </div>
            </div>
            <div className="patient-details">
              <div className="condition">
                <strong>Condition:</strong> {patient.condition}
              </div>
              <div className="status">
                <strong>Status:</strong> 
                <span className={`status-badge ${patient.status}`}>{patient.status}</span>
              </div>
              <div className="next-appointment">
                <strong>Next Appointment:</strong> {patient.nextAppointment}
              </div>
            </div>
            <div className="patient-actions">
              <button 
                className="btn-small btn-primary"
                onClick={() => handlePatientAction(patient.id, 'view')}
              >
                View Profile
              </button>
              <button 
                className="btn-small btn-success"
                onClick={() => handlePatientAction(patient.id, 'add-note')}
              >
                Add Note
              </button>
              <button 
                className="btn-small btn-warning"
                onClick={() => handlePatientAction(patient.id, 'prescription')}
              >
                Prescription
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="records-section">
      <div className="section-header">
        <h2>📋 Medical Records</h2>
        <div className="section-actions">
          <button className="btn-primary">Add Record</button>
          <button className="btn-secondary">Export Records</button>
        </div>
      </div>

      <div className="records-table">
        <div className="table-header">
          <div className="table-cell">Patient</div>
          <div className="table-cell">Date</div>
          <div className="table-cell">Diagnosis</div>
          <div className="table-cell">Treatment</div>
          <div className="table-cell">Notes</div>
          <div className="table-cell">Actions</div>
        </div>
        {medicalRecords.map(record => (
          <div key={record.id} className="table-row">
            <div className="table-cell">
              <div className="patient-info">
                <div className="patient-avatar">👤</div>
                <span>{record.patient}</span>
              </div>
            </div>
            <div className="table-cell">{record.date}</div>
            <div className="table-cell">
              <span className="diagnosis-badge">{record.diagnosis}</span>
            </div>
            <div className="table-cell">{record.treatment}</div>
            <div className="table-cell">{record.notes}</div>
            <div className="table-cell">
              <div className="action-buttons">
                <button className="btn-small btn-primary">View</button>
                <button className="btn-small btn-warning">Edit</button>
                <button className="btn-small btn-success">Print</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="prescriptions-section">
      <div className="section-header">
        <h2>💊 Prescription Management</h2>
        <div className="section-actions">
          <button className="btn-primary">New Prescription</button>
          <button className="btn-secondary">View All</button>
        </div>
      </div>

      <div className="prescription-form">
        <h3>Create New Prescription</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Patient</label>
            <select>
              <option>Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Medication</label>
            <input type="text" placeholder="Enter medication name" />
          </div>
          <div className="form-group">
            <label>Dosage</label>
            <input type="text" placeholder="e.g., 10mg" />
          </div>
          <div className="form-group">
            <label>Frequency</label>
            <select>
              <option>Once daily</option>
              <option>Twice daily</option>
              <option>Three times daily</option>
              <option>As needed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Duration</label>
            <input type="text" placeholder="e.g., 30 days" />
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea placeholder="Special instructions for the patient"></textarea>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-primary">Create Prescription</button>
          <button className="btn-secondary">Save as Draft</button>
        </div>
      </div>

      <div className="recent-prescriptions">
        <h3>Recent Prescriptions</h3>
        <div className="prescriptions-list">
          <div className="prescription-item">
            <div className="prescription-header">
              <span className="patient-name">John Doe</span>
              <span className="prescription-date">2024-01-15</span>
            </div>
            <div className="prescription-details">
              <p><strong>Medication:</strong> Lisinopril 10mg</p>
              <p><strong>Instructions:</strong> Take once daily with food</p>
            </div>
            <div className="prescription-actions">
              <button className="btn-small btn-primary">View</button>
              <button className="btn-small btn-success">Print</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  // Define navigation items for doctor dashboard
  const navigationItems = [
    {
      title: "Dashboard",
      items: [
        { view: 'schedule', icon: '📅', label: 'Schedule' },
        { view: 'patients', icon: '👥', label: 'Patients' },
        { view: 'records', icon: '📋', label: 'Records' },
        { view: 'prescriptions', icon: '💊', label: 'Prescriptions' }
      ]
    }
  ];

  return (
    <StandardDashboardLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      currentView={currentView}
      setCurrentView={setCurrentView}
      navigationItems={navigationItems}
      title="Doctor Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Doctor'}!`}
    >
      {currentView === 'schedule' && renderSchedule()}
      {currentView === 'patients' && renderPatients()}
      {currentView === 'records' && renderRecords()}
      {currentView === 'prescriptions' && renderPrescriptions()}

      {/* Patient Visit Modal */}
      <PatientVisitModal
        isOpen={showVisitModal}
        onClose={handleCloseVisitModal}
        appointment={selectedAppointment}
        onVisitUpdate={handleVisitUpdate}
      />
    </StandardDashboardLayout>
  );
};

export default DoctorDashboard;