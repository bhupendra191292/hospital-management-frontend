import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Button,
  SearchInput,
  FilterDropdown,
  ConfirmationDialog,
  Pagination,
  StatusBadge,
  PatientDetailsModal,
  PatientRegistrationForm,
  VisitBookingForm,
  MedicalRecordsModal
} from '../ui';
import { getNewFlowPatients } from '../../services/api';
import { getStandardId, getPatientId } from '../../utils/idUtils';
import { usePerformanceMonitor } from '../../hooks/usePerformance';
import './EnhancedPatientManagement.css';

const EnhancedPatientManagement = () => {
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('EnhancedPatientManagement');
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('registrationDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [editMode, setEditMode] = useState(false); // Edit mode for bulk actions
  const [confirmationDialog, setConfirmationDialog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Visit booking state
  const [showVisitBooking, setShowVisitBooking] = useState(false);
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState(null);

  // Medical records state
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [selectedPatientForRecords, setSelectedPatientForRecords] = useState(null);

  // Patient data state
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPatients: 0,
    hasNext: false,
    hasPrev: false
  });

  // Optimized fetch patients function
  const fetchPatients = useCallback(async () => {
    console.log('🔄 fetchPatients called with params:', {
      page: currentPage,
      limit: 5,
      status: statusFilter || 'Active',
      search: searchTerm,
      sortBy: sortField,
      sortOrder: sortDirection
    });
    
    setIsLoading(true);
    try {
      const response = await getNewFlowPatients({
        page: currentPage,
        limit: 5, // Use smaller limit for better pagination
        status: statusFilter || 'Active',
        search: searchTerm,
        sortBy: sortField,
        sortOrder: sortDirection
      });
      
      if (response.data.success) {
        setPatients(response.data.data.patients || []);
        setPagination(response.data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalPatients: 0,
          hasNext: false,
          hasPrev: false
        });
        console.log('✅ Fetched patients from database:', response.data.data.patients?.length || 0, 'patients');
        console.log('📊 Pagination info:', response.data.data.pagination);
      } else {
        console.warn('⚠️ API returned unsuccessful response:', response.data.message);
        setPatients([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalPatients: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('❌ Error fetching patients from database:', error);
      // Show empty state instead of mock data when API fails
      setPatients([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalPatients: 0,
        hasNext: false,
        hasPrev: false
      });
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, sortField, sortDirection]);

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    console.log('🔄 useEffect triggered, calling fetchPatients');
    fetchPatients();
  }, [currentPage, statusFilter, searchTerm, sortField, sortDirection]);

  // Visit booking handlers
  const handleBookVisit = (patient) => {
    setSelectedPatientForVisit(patient);
    setShowVisitBooking(true);
  };

  const handleVisitBookingSuccess = (visit) => {
    console.log('Visit booked successfully:', visit);
    setShowVisitBooking(false);
    setSelectedPatientForVisit(null);
    // Optionally refresh patient data or show success message
  };

  const handleCloseVisitBooking = () => {
    setShowVisitBooking(false);
    setSelectedPatientForVisit(null);
  };

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  // Use patients directly from backend (already filtered, sorted, and paginated)
  const paginatedPatients = patients;

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === paginatedPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(paginatedPatients.map(patient => patient._id || patient.id));
    }
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Clear selections when exiting edit mode
      setSelectedPatients([]);
    }
  };

  const handlePatientAction = (patientId, action) => {
    const patient = patients.find(p => (p._id || p.id) === patientId);
    const patientName = patient?.name || 'Patient';
    
    if (action === 'view') {
      setSelectedPatient(patient);
      setShowPatientDetails(true);
      return;
    }
    
    if (action === 'book-visit') {
      handleBookVisit(patient);
      return;
    }
    
    setConfirmationDialog({
      isOpen: true,
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${patientName}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: action === 'delete' ? 'danger' : action === 'deactivate' ? 'warning' : 'info',
      onConfirm: () => executePatientAction(patientId, action)
    });
  };

  const handleBulkAction = (action) => {
    const patientNames = selectedPatients.map(id => patients.find(p => p.id === id)?.name).join(', ');
    
    setConfirmationDialog({
      isOpen: true,
      title: `Confirm Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${selectedPatients.length} selected patients?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: action === 'delete' ? 'danger' : action === 'deactivate' ? 'warning' : 'info',
      onConfirm: () => executeBulkAction(action)
    });
  };

  const executePatientAction = async (patientId, action) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'delete') {
        setPatients(prev => prev.filter(patient => patient.id !== patientId));
      } else if (action === 'deactivate') {
        setPatients(prev => prev.map(patient => 
          patient.id === patientId ? { ...patient, status: 'Inactive' } : patient
        ));
      } else if (action === 'approve') {
        setPatients(prev => prev.map(patient => 
          patient.id === patientId ? { ...patient, status: 'Active' } : patient
        ));
      }
      
      setSelectedPatients(prev => prev.filter(id => id !== patientId));
    } catch (error) {
      console.error('Error executing patient action:', error);
    } finally {
      setIsLoading(false);
      setConfirmationDialog(null);
    }
  };

  const executeBulkAction = async (action) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (action === 'delete') {
        setPatients(prev => prev.filter(patient => !selectedPatients.includes(patient.id)));
      } else if (action === 'deactivate') {
        setPatients(prev => prev.map(patient => 
          selectedPatients.includes(patient.id) ? { ...patient, status: 'Inactive' } : patient
        ));
      } else if (action === 'approve') {
        setPatients(prev => prev.map(patient => 
          selectedPatients.includes(patient.id) ? { ...patient, status: 'Active' } : patient
        ));
      }
      
      setSelectedPatients([]);
    } catch (error) {
      console.error('Error executing bulk action:', error);
    } finally {
      setIsLoading(false);
      setConfirmationDialog(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      pending: 'yellow',
      inactive: 'red'
    };
    return colors[status] || 'gray';
  };

  // Modal action handlers
  const handleEditPatient = (patient) => {
    setShowPatientDetails(false);
    setEditingPatient(patient);
    setShowRegistrationForm(true);
  };

  const handleBookAppointment = (patient) => {
    setShowPatientDetails(false);
    setSelectedPatientForVisit(patient);
    setShowVisitBooking(true);
    console.log('📅 Opening visit booking form for:', patient.name);
  };

  const handleViewRecords = (patient) => {
    setShowPatientDetails(false);
    setSelectedPatientForRecords(patient);
    setShowMedicalRecords(true);
  };

  const handleSendMessage = (patient) => {
    setShowPatientDetails(false);
    // TODO: Open communication
    console.log('Send message to:', patient);
    alert(`Send Message to: ${patient.name}\nThis will open the communication form.`);
  };

  const handleSavePatient = async (patientData) => {
    try {
      // Refresh the patient list from the database
      // This ensures we have the latest data including any backend-generated fields
      await fetchPatients();
      
      setEditingPatient(null);
      setShowRegistrationForm(false);
      
      // Open patient details modal for the newly registered patient
      if (patientData && (patientData._id || patientData.id)) {
        setSelectedPatient(patientData);
        setShowPatientDetails(true);
        console.log('✅ Patient saved successfully, opening patient details for appointment booking');
      } else {
        console.log('✅ Patient saved successfully, list refreshed from database');
      }
    } catch (error) {
      console.error('❌ Error saving patient:', error);
      throw error;
    }
  };

  const handleAddNewPatient = () => {
    setEditingPatient(null);
    setShowRegistrationForm(true);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span className="sort-icon">↕️</span>;
    }
    return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="enhanced-patient-management">
      {/* Header */}
      <div className="patient-mgmt-header">
        <div className="header-left">
          <div className="header-title">
            <h1>🏥 Patient Management</h1>
            <p>Manage patient records and medical information</p>
          </div>
        </div>
        <div className="header-actions">
          <Button 
            variant={editMode ? 'primary' : 'default'} 
            size="medium"
            onClick={handleToggleEditMode}
          >
            {editMode ? '✅ Done Editing' : '✏️ Edit Mode'}
          </Button>
          <Button 
            variant="default" 
            size="medium"
            onClick={handleAddNewPatient}
          >
            ➕ Add New Patient
          </Button>
          <Button variant="default" size="medium">
            📤 Export Patients
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="patient-mgmt-filters">
        <div className="filters-left">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search patients by name, email, UHID, or mobile..."
            className="patient-search"
          />
          <FilterDropdown
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />
        </div>
        <div className="filters-right">
          <div className="results-count">
            {pagination.totalPatients} patients
          </div>
        </div>
      </div>

      {/* Bulk Actions - Only show in edit mode */}
      {editMode && selectedPatients.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedPatients.length} patient{selectedPatients.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="bulk-buttons">
            <Button 
              variant="default" 
              size="small"
              onClick={() => handleBulkAction('approve')}
            >
              ✅ Approve Selected
            </Button>
            <Button 
              variant="default" 
              size="small"
              onClick={() => handleBulkAction('deactivate')}
            >
              ⏸️ Deactivate Selected
            </Button>
            <Button 
              variant="default" 
              size="small"
              onClick={() => handleBulkAction('delete')}
            >
              🗑️ Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Patients Table */}
      <div className="patients-table-container">
        <div className="patients-table">
          <div className="table-header">
            <div className="table-cell checkbox-cell">
              {editMode && (
                <input
                  type="checkbox"
                  checked={selectedPatients.length === paginatedPatients.length && paginatedPatients.length > 0}
                  onChange={handleSelectAll}
                />
              )}
            </div>
            <div 
              className="table-cell sortable" 
              onClick={() => handleSort('name')}
            >
              Patient <SortIcon field="name" />
            </div>
            <div 
              className="table-cell sortable" 
              onClick={() => handleSort('uhid')}
            >
              UHID <SortIcon field="uhid" />
            </div>
            <div className="table-cell">Contact</div>
            <div 
              className="table-cell sortable" 
              onClick={() => handleSort('registrationDate')}
            >
              Registered <SortIcon field="registrationDate" />
            </div>
            <div 
              className="table-cell sortable" 
              onClick={() => handleSort('status')}
            >
              Status <SortIcon field="status" />
            </div>
          </div>

          {paginatedPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏥</div>
              <h3>{pagination.totalPatients === 0 ? 'No patients in database' : 'No patients found'}</h3>
              <p>
                {pagination.totalPatients === 0 
                  ? 'Start by adding your first patient using the "Add New Patient" button above.'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {pagination.totalPatients === 0 && (
                <Button 
                  variant="primary" 
                  size="medium"
                  onClick={handleAddNewPatient}
                  style={{ marginTop: '16px' }}
                >
                  ➕ Add Your First Patient
                </Button>
              )}
            </div>
          ) : (
            paginatedPatients.map(patient => {
              const patientId = getPatientId(patient);
              return (
                <div 
                  key={patientId} 
                  className={`table-row ${!editMode ? 'clickable-row' : ''}`}
                  onClick={() => !editMode && handlePatientAction(patientId, 'view')}
                >
                  <div className="table-cell checkbox-cell" onClick={(e) => e.stopPropagation()}>
                    {editMode && (
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patientId)}
                        onChange={() => handleSelectPatient(patientId)}
                      />
                    )}
                  </div>
            <div className="table-cell">
              <div className="patient-info">
                <div className="patient-details">
                  <span className="patient-name">{patient.name}</span>
                  {patient.email && <span className="patient-email">{patient.email}</span>}
                </div>
              </div>
            </div>
                <div className="table-cell">
                  <span className="uhid-badge">{patient.uhid}</span>
                </div>
                <div className="table-cell">
                  <div className="contact-info">
                    <span className="mobile">{patient.mobile}</span>
                    <span className="emergency-contact">Emergency: {patient.emergencyContact}</span>
                  </div>
                </div>
                <div className="table-cell">
                  <div className="registration-date">
                    <span className="date">
                      {(() => {
                        // Try to get registration date from various possible fields
                        const regDate = patient.registrationDate || patient.createdAt || patient._id;
                        if (regDate) {
                          // If _id is a timestamp (like "1757187784282"), convert it
                          if (typeof regDate === 'string' && /^\d{13}$/.test(regDate)) {
                            return new Date(parseInt(regDate)).toLocaleDateString('en-IN');
                          }
                          // If it's a date string or Date object
                          return new Date(regDate).toLocaleDateString('en-IN');
                        }
                        // Fallback to current date
                        return new Date().toLocaleDateString('en-IN');
                      })()}
                    </span>
                    <span className="time">
                      {(() => {
                        // Try to get registration time from various possible fields
                        const regDate = patient.registrationDate || patient.createdAt || patient._id;
                        if (regDate) {
                          // If _id is a timestamp (like "1757187784282"), convert it
                          if (typeof regDate === 'string' && /^\d{13}$/.test(regDate)) {
                            return new Date(parseInt(regDate)).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            });
                          }
                          // If it's a date string or Date object
                          return new Date(regDate).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          });
                        }
                        // Fallback to current time
                        return new Date().toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                      })()}
                    </span>
                  </div>
                </div>
                <div className="table-cell">
                  <StatusBadge 
                    status={patient.status} 
                    variant={getStatusColor(patient.status)}
                    size="small"
                  />
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages >= 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
          totalItems={pagination.totalPatients}
          itemsPerPage={5}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          onClose={() => setConfirmationDialog(null)}
          onConfirm={confirmationDialog.onConfirm}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          confirmText={confirmationDialog.confirmText}
          variant={confirmationDialog.variant}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={showPatientDetails}
        onClose={() => setShowPatientDetails(false)}
        patient={selectedPatient}
        onEdit={handleEditPatient}
        onBookAppointment={handleBookAppointment}
        onViewRecords={handleViewRecords}
        onSendMessage={handleSendMessage}
      />

      {/* Patient Registration Form */}
      <PatientRegistrationForm
        isOpen={showRegistrationForm}
        onClose={() => {
          console.log('PatientRegistrationForm onClose called');
          setShowRegistrationForm(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        existingPatient={editingPatient}
        existingPatients={patients}
      />

      {/* Visit Booking Form */}
      <VisitBookingForm
        isOpen={showVisitBooking}
        onClose={handleCloseVisitBooking}
        patient={selectedPatientForVisit}
        onSuccess={handleVisitBookingSuccess}
      />

      {/* Medical Records Modal */}
      <MedicalRecordsModal
        isOpen={showMedicalRecords}
        onClose={() => {
          setShowMedicalRecords(false);
          setSelectedPatientForRecords(null);
        }}
        patient={selectedPatientForRecords}
      />
    </div>
  );
};

export default EnhancedPatientManagement;
