import React, { useState, useEffect } from 'react';
import { Button } from './index';
import { getNewFlowVisitsByPatient, getNewFlowDoctors, updateNewFlowVisit } from '../../services/api';
import './AppointmentHistory.css';

const AppointmentHistory = ({ patientId, patientName }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadAppointments();
      loadDoctors();
    }
  }, [patientId]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getNewFlowVisitsByPatient(patientId);

      if (response.data.success) {
        console.log('AppointmentHistory API Response:', response.data);
        const visits = response.data.data?.visits || [];
        console.log('Setting appointments to:', visits);
        setAppointments(visits);
      } else {
        setError('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await getNewFlowDoctors();
      console.log('Doctors API Response:', response.data);
      if (response.data.success) {
        const doctorsList = response.data.data || [];
        console.log('Setting doctors to:', doctorsList);
        setDoctors(doctorsList);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleAssignDoctor = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleAssignDoctorSubmit = async (doctorId) => {
    if (!selectedAppointment) return;

    try {
      setIsProcessing(true);
      const response = await updateNewFlowVisit(selectedAppointment._id, {
        doctorId: doctorId,
        doctorName: doctors.find(d => d._id === doctorId)?.name
      });

      if (response.data.success) {
        await loadAppointments(); // Refresh the list
        setShowAssignModal(false);
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error assigning doctor:', error);
      alert('Failed to assign doctor. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRescheduleSubmit = async (newDate, newTime) => {
    if (!selectedAppointment) return;

    try {
      setIsProcessing(true);
      const response = await updateNewFlowVisit(selectedAppointment._id, {
        appointmentDate: newDate,
        appointmentTime: newTime
      });

      if (response.data.success) {
        await loadAppointments(); // Refresh the list
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Failed to reschedule appointment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'blue',
      'In Progress': 'yellow',
      'Completed': 'green',
      'Cancelled': 'red',
      'No Show': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'gray',
      'Normal': 'blue',
      'High': 'orange',
      'Emergency': 'red'
    };
    return colors[priority] || 'blue';
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `${formattedDate} at ${timeString}`;
  };

  if (isLoading) {
    return (
      <div className="appointment-history">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading appointment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-history">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <Button onClick={loadAppointments} variant="primary" size="small">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-history">
      <div className="appointment-header">
        <h3>📅 Appointment History</h3>
        <div className="appointment-count">
          {Array.isArray(appointments) ? appointments.length : 0} appointment{(Array.isArray(appointments) ? appointments.length : 0) !== 1 ? 's' : ''}
        </div>
      </div>

      {!Array.isArray(appointments) || appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No appointments found for {patientName}</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              {/* Header Row */}
              <div className="appointment-header">
                <div className="header-left">
                  <span className="visit-id">{appointment.visitId}</span>
                  <span className={`status-dot status-${getStatusColor(appointment.status)}`}></span>
                  <span className="status-text">{appointment.status}</span>
                </div>
                <div className="header-right">
                  {!appointment.doctorName && appointment.status === 'Scheduled' && (
                    <button
                      className="action-btn assign-btn"
                      onClick={() => handleAssignDoctor(appointment)}
                      disabled={isProcessing}
                    >
                      Assign Doctor
                    </button>
                  )}
                  {appointment.status === 'Scheduled' && (
                    <button
                      className="action-btn reschedule-btn"
                      onClick={() => handleReschedule(appointment)}
                      disabled={isProcessing}
                    >
                      Reschedule
                    </button>
                  )}
                  {appointment.status === 'Completed' && (
                    <button className="action-btn view-btn">
                      View Details
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="appointment-content">
                {/* Date and Type Row */}
                <div className="content-row">
                  <div className="date-time">
                    {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                  </div>
                  <div className="type-priority">
                    <span className="visit-type">{appointment.visitType}</span>
                    <span className="separator">|</span>
                    <span className={`priority priority-${getPriorityColor(appointment.priority)}`}>
                      {appointment.priority}
                    </span>
                  </div>
                </div>

                {/* Department and Doctor Row */}
                <div className="content-row">
                  <div className="department">
                    <span className="label">Department:</span>
                    <span className="value">{appointment.department}</span>
                  </div>
                  <div className="doctor">
                    <span className="label">Doctor:</span>
                    <span className={`doctor-name ${appointment.doctorName ? 'assigned' : 'unassigned'}`}>
                      {appointment.doctorName || 'No Doctor Assigned'}
                    </span>
                  </div>
                </div>

                {/* Chief Complaint Row */}
                {appointment.chiefComplaint && (
                  <div className="content-row complaint-row">
                    <div className="complaint">
                      <span className="label">Chief Complaint:</span>
                      <span className="value">{appointment.chiefComplaint}</span>
                    </div>
                  </div>
                )}

                {/* Notes Row */}
                {appointment.notes && (
                  <div className="content-row notes-row">
                    <div className="notes">
                      <span className="label">Notes:</span>
                      <span className="value">{appointment.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Doctor Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assign Doctor</h3>
              <button
                className="modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Select a doctor for appointment: <strong>{selectedAppointment.visitId}</strong></p>
              <p style={{fontSize: '12px', color: '#6b7280'}}>
                Available doctors: {doctors.filter(doctor => doctor.status === 'active').length}
              </p>
              <div className="doctor-list">
                {doctors
                  .filter(doctor => doctor.status === 'active')
                  .map(doctor => (
                    <button
                      key={doctor._id}
                      className="doctor-option"
                      onClick={() => handleAssignDoctorSubmit(doctor._id)}
                      disabled={isProcessing}
                    >
                      <div className="doctor-name">{doctor.name}</div>
                      <div className="doctor-specialty">
                        {doctor.specialty || doctor.department || 'General Medicine'}
                      </div>
                    </button>
                  ))}
                {doctors.filter(doctor => doctor.status === 'active').length === 0 && (
                  <div className="no-doctors">
                    <p>No active doctors available. Please add doctors first.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reschedule Appointment</h3>
              <button
                className="modal-close"
                onClick={() => setShowRescheduleModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Reschedule appointment: <strong>{selectedAppointment.visitId}</strong></p>
              <div className="reschedule-form">
                <div className="form-group">
                  <label>New Date:</label>
                  <input
                    type="date"
                    id="newDate"
                    min={new Date().toISOString().split('T')[0]}
                    defaultValue={selectedAppointment.appointmentDate}
                  />
                </div>
                <div className="form-group">
                  <label>New Time:</label>
                  <input
                    type="time"
                    id="newTime"
                    defaultValue={selectedAppointment.appointmentTime}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowRescheduleModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-confirm"
                    onClick={() => {
                      const newDate = document.getElementById('newDate').value;
                      const newTime = document.getElementById('newTime').value;
                      if (newDate && newTime) {
                        handleRescheduleSubmit(newDate, newTime);
                      } else {
                        alert('Please select both date and time');
                      }
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Updating...' : 'Reschedule'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;
