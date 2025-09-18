import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import StandardDashboardLayout from './StandardDashboardLayout';
import './Dashboard.css';

const PatientDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, getRoleDetails, can } = useRole();
  const [currentView, setCurrentView] = useState('overview'); // overview, appointments, records, prescriptions, communication
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedVisits: 0,
    activePrescriptions: 0,
    totalVisits: 0,
    nextAppointment: null,
    lastVisit: null
  });
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const roleInfo = getRoleDetails();

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setIsLoading(true);
      
      // Mock patient data
      const mockStats = {
        upcomingAppointments: 2,
        completedVisits: 15,
        activePrescriptions: 3,
        totalVisits: 15,
        nextAppointment: '2024-02-15 10:00 AM',
        lastVisit: '2024-01-15'
      };

      const mockAppointments = [
        { id: 1, date: '2024-02-15', time: '10:00 AM', doctor: 'Dr. Sarah Johnson', type: 'Follow-up', status: 'scheduled', notes: 'Blood pressure check' },
        { id: 2, date: '2024-02-28', time: '02:00 PM', doctor: 'Dr. Mike Brown', type: 'Consultation', status: 'scheduled', notes: 'Annual physical' },
        { id: 3, date: '2024-01-15', time: '09:30 AM', doctor: 'Dr. Sarah Johnson', type: 'Consultation', status: 'completed', notes: 'Regular checkup' },
        { id: 4, date: '2024-01-10', time: '11:00 AM', doctor: 'Dr. Lisa Wilson', type: 'Follow-up', status: 'completed', notes: 'Diabetes management' }
      ];

      const mockRecords = [
        { id: 1, date: '2024-01-15', doctor: 'Dr. Sarah Johnson', diagnosis: 'Hypertension', treatment: 'Lisinopril 10mg', notes: 'Blood pressure well controlled' },
        { id: 2, date: '2024-01-10', doctor: 'Dr. Lisa Wilson', diagnosis: 'Type 2 Diabetes', treatment: 'Metformin 500mg', notes: 'Blood sugar levels improving' },
        { id: 3, date: '2023-12-20', doctor: 'Dr. Mike Brown', diagnosis: 'General Checkup', treatment: 'Vitamin D supplement', notes: 'Overall health good' }
      ];

      const mockPrescriptions = [
        { id: 1, medication: 'Lisinopril 10mg', dosage: 'Once daily', startDate: '2024-01-15', endDate: '2024-02-15', status: 'active', doctor: 'Dr. Sarah Johnson' },
        { id: 2, medication: 'Metformin 500mg', dosage: 'Twice daily', startDate: '2024-01-10', endDate: '2024-02-10', status: 'active', doctor: 'Dr. Lisa Wilson' },
        { id: 3, medication: 'Vitamin D3', dosage: 'Once daily', startDate: '2023-12-20', endDate: '2024-03-20', status: 'active', doctor: 'Dr. Mike Brown' }
      ];

      const mockMessages = [
        { id: 1, from: 'Dr. Sarah Johnson', subject: 'Appointment Reminder', message: 'Your appointment is scheduled for tomorrow at 10:00 AM', timestamp: '2 hours ago', read: false },
        { id: 2, from: 'Hospital Admin', subject: 'Lab Results Available', message: 'Your recent lab results are now available in your portal', timestamp: '1 day ago', read: true },
        { id: 3, from: 'Dr. Lisa Wilson', subject: 'Prescription Refill', message: 'Your prescription for Metformin is ready for pickup', timestamp: '2 days ago', read: true }
      ];

      setStats(mockStats);
      setAppointments(mockAppointments);
      setMedicalRecords(mockRecords);
      setPrescriptions(mockPrescriptions);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentAction = (appointmentId, action) => {
    console.log(`Appointment action: ${action} for appointment ${appointmentId}`);
    alert(`Appointment action: ${action} for appointment ${appointmentId}`);
  };

  const handleMessageAction = (messageId, action) => {
    console.log(`Message action: ${action} for message ${messageId}`);
    alert(`Message action: ${action} for message ${messageId}`);
  };

  const renderOverview = () => (
    <div className="patient-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.upcomingAppointments}</h3>
            <p>Upcoming Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedVisits}</h3>
            <p>Completed Visits</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <h3>{stats.activePrescriptions}</h3>
            <p>Active Prescriptions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>{stats.totalVisits}</h3>
            <p>Total Visits</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-card">
          <h2>📅 Next Appointment</h2>
          <div className="next-appointment">
            <div className="appointment-info">
              <h3>{stats.nextAppointment}</h3>
              <p>Dr. Sarah Johnson - Follow-up</p>
              <p>Blood pressure check</p>
            </div>
            <div className="appointment-actions">
              <button className="btn-primary">View Details</button>
              <button className="btn-secondary">Reschedule</button>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>💊 Current Medications</h2>
          <div className="medications-list">
            {prescriptions.filter(p => p.status === 'active').map(prescription => (
              <div key={prescription.id} className="medication-item">
                <div className="medication-info">
                  <h4>{prescription.medication}</h4>
                  <p>{prescription.dosage}</p>
                  <small>Prescribed by {prescription.doctor}</small>
                </div>
                <div className="medication-status">
                  <span className="status-badge active">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h2>📧 Recent Messages</h2>
          <div className="messages-list">
            {messages.slice(0, 3).map(message => (
              <div key={message.id} className={`message-item ${!message.read ? 'unread' : ''}`}>
                <div className="message-header">
                  <span className="sender">{message.from}</span>
                  <span className="timestamp">{message.timestamp}</span>
                </div>
                <div className="message-content">
                  <h4>{message.subject}</h4>
                  <p>{message.message}</p>
                </div>
                <div className="message-actions">
                  <button className="btn-small btn-primary">Reply</button>
                  <button className="btn-small btn-secondary">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="appointments-section">
      <div className="section-header">
        <h2>📅 My Appointments</h2>
        <div className="section-actions">
          <button className="btn-primary">Book Appointment</button>
          <button className="btn-secondary">View Calendar</button>
        </div>
      </div>

      <div className="appointments-list">
        {appointments.map(appointment => (
          <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
            <div className="appointment-date">
              <span className="date">{appointment.date}</span>
              <span className="time">{appointment.time}</span>
            </div>
            <div className="appointment-details">
              <h4>{appointment.doctor}</h4>
              <p>{appointment.type}</p>
              <p className="notes">{appointment.notes}</p>
            </div>
            <div className="appointment-status">
              <span className={`status-badge ${appointment.status}`}>
                {appointment.status}
              </span>
            </div>
            <div className="appointment-actions">
              {appointment.status === 'scheduled' && (
                <>
                  <button 
                    className="btn-small btn-warning"
                    onClick={() => handleAppointmentAction(appointment.id, 'reschedule')}
                  >
                    Reschedule
                  </button>
                  <button 
                    className="btn-small btn-danger"
                    onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                  >
                    Cancel
                  </button>
                </>
              )}
              <button 
                className="btn-small btn-primary"
                onClick={() => handleAppointmentAction(appointment.id, 'view')}
              >
                View Details
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
          <button className="btn-primary">Download All</button>
          <button className="btn-secondary">Print Records</button>
        </div>
      </div>

      <div className="records-list">
        {medicalRecords.map(record => (
          <div key={record.id} className="record-card">
            <div className="record-header">
              <div className="record-date">{record.date}</div>
              <div className="record-doctor">{record.doctor}</div>
            </div>
            <div className="record-content">
              <div className="record-section">
                <h4>Diagnosis</h4>
                <p>{record.diagnosis}</p>
              </div>
              <div className="record-section">
                <h4>Treatment</h4>
                <p>{record.treatment}</p>
              </div>
              <div className="record-section">
                <h4>Notes</h4>
                <p>{record.notes}</p>
              </div>
            </div>
            <div className="record-actions">
              <button className="btn-small btn-primary">View Full</button>
              <button className="btn-small btn-success">Download</button>
              <button className="btn-small btn-secondary">Print</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="prescriptions-section">
      <div className="section-header">
        <h2>💊 Prescriptions</h2>
        <div className="section-actions">
          <button className="btn-primary">Request Refill</button>
          <button className="btn-secondary">View All</button>
        </div>
      </div>

      <div className="prescriptions-list">
        {prescriptions.map(prescription => (
          <div key={prescription.id} className="prescription-card">
            <div className="prescription-header">
              <div className="medication-name">{prescription.medication}</div>
              <div className={`prescription-status ${prescription.status}`}>
                {prescription.status}
              </div>
            </div>
            <div className="prescription-details">
              <div className="detail-item">
                <strong>Dosage:</strong> {prescription.dosage}
              </div>
              <div className="detail-item">
                <strong>Start Date:</strong> {prescription.startDate}
              </div>
              <div className="detail-item">
                <strong>End Date:</strong> {prescription.endDate}
              </div>
              <div className="detail-item">
                <strong>Prescribed by:</strong> {prescription.doctor}
              </div>
            </div>
            <div className="prescription-actions">
              <button className="btn-small btn-primary">View Details</button>
              <button className="btn-small btn-success">Print</button>
              {prescription.status === 'active' && (
                <button className="btn-small btn-warning">Request Refill</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCommunication = () => (
    <div className="communication-section">
      <div className="section-header">
        <h2>📧 Communication</h2>
        <div className="section-actions">
          <button className="btn-primary">New Message</button>
          <button className="btn-secondary">Mark All Read</button>
        </div>
      </div>

      <div className="messages-list">
        {messages.map(message => (
          <div key={message.id} className={`message-card ${!message.read ? 'unread' : ''}`}>
            <div className="message-header">
              <div className="sender-info">
                <div className="sender-avatar">👨‍⚕️</div>
                <div className="sender-details">
                  <h4>{message.from}</h4>
                  <p>{message.subject}</p>
                </div>
              </div>
              <div className="message-meta">
                <span className="timestamp">{message.timestamp}</span>
                {!message.read && <span className="unread-indicator">●</span>}
              </div>
            </div>
            <div className="message-content">
              <p>{message.message}</p>
            </div>
            <div className="message-actions">
              <button 
                className="btn-small btn-primary"
                onClick={() => handleMessageAction(message.id, 'reply')}
              >
                Reply
              </button>
              <button 
                className="btn-small btn-secondary"
                onClick={() => handleMessageAction(message.id, 'view')}
              >
                View Full
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading patient dashboard...</p>
        </div>
      </div>
    );
  }

  // Define navigation items for patient dashboard
  const navigationItems = [
    {
      title: "Dashboard",
      items: [
        { view: 'overview', icon: '📊', label: 'Overview' },
        { view: 'appointments', icon: '📅', label: 'Appointments' },
        { view: 'records', icon: '📋', label: 'Records' },
        { view: 'prescriptions', icon: '💊', label: 'Prescriptions' },
        { view: 'communication', icon: '📧', label: 'Messages' }
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
      title="Patient Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Patient'}!`}
    >
      {currentView === 'overview' && renderOverview()}
      {currentView === 'appointments' && renderAppointments()}
      {currentView === 'records' && renderRecords()}
      {currentView === 'prescriptions' && renderPrescriptions()}
      {currentView === 'communication' && renderCommunication()}
    </StandardDashboardLayout>
  );
};

export default PatientDashboard;