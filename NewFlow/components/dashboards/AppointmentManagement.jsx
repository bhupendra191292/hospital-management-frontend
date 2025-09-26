import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '../../contexts/RoleContext';
import {
  getNewFlowVisits,
  updateNewFlowVisit,
  deleteNewFlowVisit,
  getNewFlowDoctors,
  getNewFlowPatients
} from '../../services/api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useDataProcessing, usePerformanceMonitor } from '../../hooks/usePerformance';
import {
  Button,
  SearchInput,
  FilterDropdown,
  ConfirmationDialog,
  Pagination,
  StatusBadge,
  Modal,
  ModalHeader
} from '../ui';
import VisitBookingForm from '../ui/VisitBookingForm';
import AppointmentDetailsModal from '../ui/AppointmentDetailsModal';
import './AppointmentManagement.css';

const AppointmentManagement = () => {
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('AppointmentManagement');

  const { can } = useRole();
  const { errors, isLoading, setErrors, setIsLoading, handleApiError, clearAllErrors } = useErrorHandler();

  // State management
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('appointmentDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [itemsPerPage] = useState(10);

  // UI state
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadAppointmentData();
  }, []);

  const loadAppointmentData = async () => {
    setLoading(true);
    try {
      // Load appointments
      const appointmentsResponse = await getNewFlowVisits({ limit: 1000 });
      if (appointmentsResponse.data.success) {
        setAppointments(appointmentsResponse.data.data || []);
      }

      // Load doctors
      const doctorsResponse = await getNewFlowDoctors();
      if (doctorsResponse.data.success) {
        setDoctors(doctorsResponse.data.data || []);
      }

      // Load patients
      const patientsResponse = await getNewFlowPatients({ limit: 1000 });
      if (patientsResponse.data.success) {
        setPatients(patientsResponse.data.data.patients || []);
      }

    } catch (error) {
      handleApiError(error, 'AppointmentManagement.loadAppointmentData');
    } finally {
      setLoading(false);
    }
  };

  // Optimized data processing
  const {
    items: paginatedAppointments,
    totalPages,
    hasNext,
    hasPrev,
    totalItems
  } = useDataProcessing(appointments, {
    searchTerm,
    searchFields: ['patientName', 'doctorName', 'chiefComplaint', 'department'],
    filters: {
      status: statusFilter,
      doctorId: doctorFilter,
      priority: priorityFilter
    },
    sortField,
    sortDirection,
    currentPage,
    itemsPerPage
  });

  // Filter by date
  const filteredAppointments = paginatedAppointments.filter(appointment => {
    if (!dateFilter) return true;
    const appointmentDate = new Date(appointment.appointmentDate).toDateString();
    const filterDate = new Date(dateFilter).toDateString();
    return appointmentDate === filterDate;
  });

  // Handlers
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'doctor':
        setDoctorFilter(value);
        break;
      case 'date':
        setDateFilter(value);
        break;
      case 'priority':
        setPriorityFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleSelectAppointment = useCallback((appointmentId) => {
    setSelectedAppointments(prev =>
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedAppointments.length === filteredAppointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(filteredAppointments.map(apt => apt._id));
    }
  }, [selectedAppointments.length, filteredAppointments]);

  const handleViewDetails = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  }, []);

  const handleEditAppointment = useCallback((appointment) => {
    setEditingAppointment(appointment);
    setShowBookingForm(true);
  }, []);

  const handleDeleteAppointment = useCallback((appointment) => {
    setConfirmationDialog({
      title: 'Delete Appointment',
      message: `Are you sure you want to delete the appointment for ${appointment.patientName}?`,
      onConfirm: () => confirmDeleteAppointment(appointment._id),
      onCancel: () => setConfirmationDialog(null)
    });
  }, []);

  const confirmDeleteAppointment = async (appointmentId) => {
    try {
      await deleteNewFlowVisit(appointmentId);
      setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
      setConfirmationDialog(null);
    } catch (error) {
      handleApiError(error, 'AppointmentManagement.confirmDeleteAppointment');
    }
  };

  const handleBulkAction = useCallback((action) => {
    if (selectedAppointments.length === 0) return;

    switch (action) {
      case 'cancel':
        setConfirmationDialog({
          title: 'Cancel Appointments',
          message: `Are you sure you want to cancel ${selectedAppointments.length} appointment(s)?`,
          onConfirm: () => confirmBulkAction('cancel'),
          onCancel: () => setConfirmationDialog(null)
        });
        break;
      case 'reschedule':
        // Handle bulk reschedule
        break;
      case 'delete':
        setConfirmationDialog({
          title: 'Delete Appointments',
          message: `Are you sure you want to delete ${selectedAppointments.length} appointment(s)?`,
          onConfirm: () => confirmBulkAction('delete'),
          onCancel: () => setConfirmationDialog(null)
        });
        break;
      default:
        break;
    }
  }, [selectedAppointments]);

  const confirmBulkAction = async (action) => {
    try {
      for (const appointmentId of selectedAppointments) {
        if (action === 'cancel') {
          await updateNewFlowVisit(appointmentId, { status: 'cancelled' });
        } else if (action === 'delete') {
          await deleteNewFlowVisit(appointmentId);
        }
      }

      setAppointments(prev => {
        if (action === 'delete') {
          return prev.filter(apt => !selectedAppointments.includes(apt._id));
        } else {
          return prev.map(apt =>
            selectedAppointments.includes(apt._id)
              ? { ...apt, status: 'cancelled' }
              : apt
          );
        }
      });

      setSelectedAppointments([]);
      setConfirmationDialog(null);
    } catch (error) {
      handleApiError(error, 'AppointmentManagement.confirmBulkAction');
    }
  };

  const handleAppointmentSaved = useCallback((savedAppointment) => {
    if (editingAppointment) {
      setAppointments(prev =>
        prev.map(apt => apt._id === editingAppointment._id ? savedAppointment : apt)
      );
    } else {
      setAppointments(prev => [savedAppointment, ...prev]);
    }
    setShowBookingForm(false);
    setEditingAppointment(null);
  }, [editingAppointment]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'confirmed': return 'green';
      case 'in-progress': return 'orange';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'no-show': return 'gray';
      default: return 'blue';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency': return 'red';
      case 'High': return 'orange';
      case 'Normal': return 'blue';
      case 'Low': return 'green';
      default: return 'blue';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString || 'N/A';
  };

  if (loading) {
    return (
      <div className="appointment-loading">
        <div className="loading-spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="appointment-management">
      <div className="appointment-header">
        <h1>📅 Appointment Management</h1>
        <div className="appointment-actions">
          <Button
            onClick={() => setShowBookingForm(true)}
            className="btn-primary"
          >
            + New Appointment
          </Button>
        </div>
      </div>

      <div className="appointment-filters">
        <div className="filters-row">
          <SearchInput
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />

          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(value) => handleFilterChange('status', value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'no-show', label: 'No Show' }
            ]}
          />

          <FilterDropdown
            label="Doctor"
            value={doctorFilter}
            onChange={(value) => handleFilterChange('doctor', value)}
            options={[
              { value: '', label: 'All Doctors' },
              ...doctors.map(doctor => ({
                value: doctor._id,
                label: doctor.name
              }))
            ]}
          />

          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            onChange={(value) => handleFilterChange('priority', value)}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'Emergency', label: 'Emergency' },
              { value: 'High', label: 'High' },
              { value: 'Normal', label: 'Normal' },
              { value: 'Low', label: 'Low' }
            ]}
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="date-filter"
          />
        </div>

        {editMode && selectedAppointments.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">
              {selectedAppointments.length} selected
            </span>
            <Button
              onClick={() => handleBulkAction('cancel')}
              className="btn-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleBulkAction('reschedule')}
              className="btn-secondary"
            >
              Reschedule
            </Button>
            <Button
              onClick={() => handleBulkAction('delete')}
              className="btn-danger"
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="appointment-content">
        <div className="appointment-table-container">
          <table className="appointment-table">
            <thead>
              <tr>
                {editMode && (
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedAppointments.length === filteredAppointments.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th onClick={() => handleSort('patientName')}>
                  Patient {sortField === 'patientName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('doctorName')}>
                  Doctor {sortField === 'doctorName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('appointmentDate')}>
                  Date {sortField === 'appointmentDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Time</th>
                <th onClick={() => handleSort('department')}>
                  Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => (
                <tr key={appointment._id}>
                  {editMode && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedAppointments.includes(appointment._id)}
                        onChange={() => handleSelectAppointment(appointment._id)}
                      />
                    </td>
                  )}
                  <td>
                    <div className="patient-info">
                      <div className="patient-name">{appointment.patientName}</div>
                      <div className="patient-mobile">{appointment.patientMobile}</div>
                    </div>
                  </td>
                  <td>
                    <div className="doctor-info">
                      <div className="doctor-name">{appointment.doctorName}</div>
                      <div className="doctor-specialization">{appointment.department}</div>
                    </div>
                  </td>
                  <td>{formatDate(appointment.appointmentDate)}</td>
                  <td>{formatTime(appointment.appointmentTime)}</td>
                  <td>{appointment.department}</td>
                  <td>
                    <StatusBadge
                      status={appointment.priority}
                      color={getPriorityColor(appointment.priority)}
                    />
                  </td>
                  <td>
                    <StatusBadge
                      status={appointment.status}
                      color={getStatusColor(appointment.status)}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        onClick={() => handleViewDetails(appointment)}
                        className="btn-sm btn-info"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => handleEditAppointment(appointment)}
                        className="btn-sm btn-secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteAppointment(appointment)}
                        className="btn-sm btn-danger"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="no-appointments">
            <div className="no-appointments-icon">📅</div>
            <h3>No appointments found</h3>
            <p>Try adjusting your filters or create a new appointment.</p>
          </div>
        )}

        <div className="appointment-pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            hasNext={hasNext}
            hasPrev={hasPrev}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* Modals */}
      {showBookingForm && (
        <VisitBookingForm
          isOpen={showBookingForm}
          onClose={() => {
            setShowBookingForm(false);
            setEditingAppointment(null);
          }}
          onSuccess={handleAppointmentSaved}
          existingVisit={editingAppointment}
        />
      )}

      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          appointment={selectedAppointment}
          onEdit={() => {
            setShowDetailsModal(false);
            handleEditAppointment(selectedAppointment);
          }}
          onDelete={() => {
            setShowDetailsModal(false);
            handleDeleteAppointment(selectedAppointment);
          }}
        />
      )}

      {confirmationDialog && (
        <ConfirmationDialog
          isOpen={!!confirmationDialog}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          onConfirm={confirmationDialog.onConfirm}
          onCancel={confirmationDialog.onCancel}
        />
      )}
    </div>
  );
};

export default AppointmentManagement;
