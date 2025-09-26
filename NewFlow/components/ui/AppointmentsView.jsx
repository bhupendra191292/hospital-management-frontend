import React, { useState, useEffect } from 'react';
import { Button } from './index';
import { getAllNewFlowVisits } from '../../services/api';
import './AppointmentsView.css';

const AppointmentsView = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, today, scheduled, completed

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllNewFlowVisits();

      if (response.data.success) {
        setAppointments(response.data.data.visits || []);
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

  const isToday = (dateString) => {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    return today.toDateString() === appointmentDate.toDateString();
  };

  const filteredAppointments = appointments.filter(appointment => {
    switch (filter) {
      case 'today':
        return isToday(appointment.appointmentDate);
      case 'scheduled':
        return appointment.status === 'Scheduled';
      case 'completed':
        return appointment.status === 'Completed';
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="appointments-view">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-view">
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
    <div className="appointments-view">
      <div className="appointments-header">
        <h2>📅 All Appointments</h2>
        <div className="appointments-controls">
          <div className="filter-buttons">
            <Button
              variant={filter === 'all' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('all')}
            >
              All ({appointments.length})
            </Button>
            <Button
              variant={filter === 'today' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('today')}
            >
              Today ({appointments.filter(a => isToday(a.appointmentDate)).length})
            </Button>
            <Button
              variant={filter === 'scheduled' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('scheduled')}
            >
              Scheduled ({appointments.filter(a => a.status === 'Scheduled').length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('completed')}
            >
              Completed ({appointments.filter(a => a.status === 'Completed').length})
            </Button>
          </div>
          <Button onClick={loadAppointments} variant="default" size="small">
            🔄 Refresh
          </Button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No appointments found for the selected filter</p>
        </div>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              {/* Header Row */}
              <div className="appointment-header">
                <div className="header-left">
                  <span className="visit-id">{appointment.visitId}</span>
                  <span className={`status-dot status-${getStatusColor(appointment.status)}`}></span>
                  <span className="status-text">{appointment.status}</span>
                </div>
                <div className="header-right">
                  {appointment.status === 'Scheduled' && (
                    <>
                      <button className="action-btn start-btn">
                        Start Visit
                      </button>
                      <button className="action-btn reschedule-btn">
                        Reschedule
                      </button>
                    </>
                  )}
                  {appointment.status === 'In Progress' && (
                    <button className="action-btn complete-btn">
                      Complete Visit
                    </button>
                  )}
                  {appointment.status === 'Completed' && (
                    <button className="action-btn view-btn">
                      View Details
                    </button>
                  )}
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="patient-row">
                <div className="patient-name">{appointment.patientId?.name || 'Unknown Patient'}</div>
                <div className="patient-details">
                  <span>UHID: {appointment.patientId?.uhid || 'N/A'}</span>
                  <span>📞 {appointment.patientId?.mobile || 'N/A'}</span>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;
