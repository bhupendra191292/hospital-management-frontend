import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '../../contexts/RoleContext';
import {
  getNewFlowVisits,
  getNewFlowPatients,
  getAllNewFlowDoctors
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
import MedicalRecordForm from '../ui/MedicalRecordForm';
import MedicalRecordDetailsModal from '../ui/MedicalRecordDetailsModal';
import './MedicalRecordsManagement.css';

const MedicalRecordsManagement = () => {
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('MedicalRecordsManagement');

  const { can } = useRole();
  const { errors, isLoading, setErrors, setIsLoading, handleApiError, clearAllErrors } = useErrorHandler();

  // State management
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('');

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [itemsPerPage] = useState(10);

  // UI state
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showRecordDetails, setShowRecordDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadMedicalRecordsData();
  }, []);

  const loadMedicalRecordsData = async () => {
    setLoading(true);
    try {
      // Load visits as medical records
      const visitsResponse = await getNewFlowVisits({ limit: 1000 });
      if (visitsResponse.data.success) {
        // Transform visits into medical records format
        const records = visitsResponse.data.data.map(visit => ({
          _id: visit._id,
          patientId: visit.patientId,
          patientName: visit.patientName,
          patientMobile: visit.patientMobile,
          doctorId: visit.doctorId,
          doctorName: visit.doctorName,
          department: visit.department,
          recordType: 'Visit',
          chiefComplaint: visit.chiefComplaint,
          symptoms: visit.symptoms || [],
          diagnosis: visit.diagnosis || 'Pending',
          treatment: visit.treatment || 'Pending',
          prescription: visit.prescription || [],
          vitalSigns: visit.vitalSigns || {},
          labResults: visit.labResults || [],
          followUpRequired: visit.followUpRequired || false,
          followUpDate: visit.followUpDate || null,
          status: visit.status || 'Active',
          priority: visit.priority || 'Normal',
          notes: visit.notes || '',
          createdAt: visit.createdAt || visit.appointmentDate,
          updatedAt: visit.updatedAt || visit.appointmentDate
        }));
        setMedicalRecords(records);
      }

      // Load patients
      const patientsResponse = await getNewFlowPatients({ limit: 1000 });
      if (patientsResponse.data.success) {
        setPatients(patientsResponse.data.data.patients || []);
      }

      // Load doctors
      const doctorsResponse = await getAllNewFlowDoctors();
      if (doctorsResponse.data.success) {
        setDoctors(doctorsResponse.data.data || []);
      }

    } catch (error) {
      handleApiError(error, 'MedicalRecordsManagement.loadMedicalRecordsData');
    } finally {
      setLoading(false);
    }
  };

  // Optimized data processing
  const {
    items: paginatedRecords,
    totalPages,
    hasNext,
    hasPrev,
    totalItems
  } = useDataProcessing(medicalRecords, {
    searchTerm,
    searchFields: ['patientName', 'doctorName', 'chiefComplaint', 'diagnosis', 'treatment'],
    filters: {
      patientId: patientFilter,
      doctorId: doctorFilter,
      status: statusFilter,
      recordType: recordTypeFilter
    },
    sortField,
    sortDirection,
    currentPage,
    itemsPerPage
  });

  // Filter by date
  const filteredRecords = paginatedRecords.filter(record => {
    if (!dateFilter) return true;
    const recordDate = new Date(record.createdAt).toDateString();
    const filterDate = new Date(dateFilter).toDateString();
    return recordDate === filterDate;
  });

  // Handlers
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    switch (filterType) {
      case 'patient':
        setPatientFilter(value);
        break;
      case 'doctor':
        setDoctorFilter(value);
        break;
      case 'date':
        setDateFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'recordType':
        setRecordTypeFilter(value);
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

  const handleSelectRecord = useCallback((recordId) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(record => record._id));
    }
  }, [selectedRecords.length, filteredRecords]);

  const handleViewDetails = useCallback((record) => {
    setSelectedRecord(record);
    setShowRecordDetails(true);
  }, []);

  const handleEditRecord = useCallback((record) => {
    setEditingRecord(record);
    setShowRecordForm(true);
  }, []);

  const handleDeleteRecord = useCallback((record) => {
    setConfirmationDialog({
      title: 'Delete Medical Record',
      message: `Are you sure you want to delete the medical record for ${record.patientName}?`,
      onConfirm: () => confirmDeleteRecord(record._id),
      onCancel: () => setConfirmationDialog(null)
    });
  }, []);

  const confirmDeleteRecord = async (recordId) => {
    try {
      // In a real app, this would call deleteNewFlowMedicalRecord API
      setMedicalRecords(prev => prev.filter(record => record._id !== recordId));
      setConfirmationDialog(null);
    } catch (error) {
      handleApiError(error, 'MedicalRecordsManagement.confirmDeleteRecord');
    }
  };

  const handleBulkAction = useCallback((action) => {
    if (selectedRecords.length === 0) return;

    switch (action) {
      case 'archive':
        setConfirmationDialog({
          title: 'Archive Records',
          message: `Are you sure you want to archive ${selectedRecords.length} record(s)?`,
          onConfirm: () => confirmBulkAction('archive'),
          onCancel: () => setConfirmationDialog(null)
        });
        break;
      case 'export':
        // Handle bulk export
        handleBulkExport();
        break;
      case 'delete':
        setConfirmationDialog({
          title: 'Delete Records',
          message: `Are you sure you want to delete ${selectedRecords.length} record(s)?`,
          onConfirm: () => confirmBulkAction('delete'),
          onCancel: () => setConfirmationDialog(null)
        });
        break;
      default:
        break;
    }
  }, [selectedRecords]);

  const confirmBulkAction = async (action) => {
    try {
      for (const recordId of selectedRecords) {
        if (action === 'archive') {
          // Update record status to archived
          setMedicalRecords(prev =>
            prev.map(record =>
              selectedRecords.includes(record._id)
                ? { ...record, status: 'archived' }
                : record
            )
          );
        } else if (action === 'delete') {
          setMedicalRecords(prev =>
            prev.filter(record => !selectedRecords.includes(record._id))
          );
        }
      }

      setSelectedRecords([]);
      setConfirmationDialog(null);
    } catch (error) {
      handleApiError(error, 'MedicalRecordsManagement.confirmBulkAction');
    }
  };

  const handleBulkExport = () => {
    // In a real app, this would generate and download a PDF/Excel file
    console.log('Exporting records:', selectedRecords);
    alert(`Exporting ${selectedRecords.length} medical records...`);
  };

  const handleRecordSaved = useCallback((savedRecord) => {
    if (editingRecord) {
      setMedicalRecords(prev =>
        prev.map(record => record._id === editingRecord._id ? savedRecord : record)
      );
    } else {
      setMedicalRecords(prev => [savedRecord, ...prev]);
    }
    setShowRecordForm(false);
    setEditingRecord(null);
  }, [editingRecord]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Completed': return 'blue';
      case 'Pending': return 'orange';
      case 'Archived': return 'gray';
      case 'Cancelled': return 'red';
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

  const getRecordTypeIcon = (recordType) => {
    switch (recordType) {
      case 'Visit': return '🏥';
      case 'Lab': return '🧪';
      case 'Radiology': return '📷';
      case 'Prescription': return '💊';
      case 'Procedure': return '⚕️';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="medical-records-loading">
        <div className="loading-spinner"></div>
        <p>Loading medical records...</p>
      </div>
    );
  }

  return (
    <div className="medical-records-management">
      <div className="medical-records-header">
        <h1>📋 Medical Records Management</h1>
        <div className="medical-records-actions">
          <Button
            onClick={() => setShowRecordForm(true)}
            className="btn-primary"
          >
            + New Record
          </Button>
        </div>
      </div>

      <div className="medical-records-filters">
        <div className="filters-row">
          <SearchInput
            placeholder="Search medical records..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />

          <FilterDropdown
            label="Patient"
            value={patientFilter}
            onChange={(value) => handleFilterChange('patient', value)}
            options={[
              { value: '', label: 'All Patients' },
              ...patients.map(patient => ({
                value: patient._id,
                label: patient.name
              }))
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
            label="Status"
            value={statusFilter}
            onChange={(value) => handleFilterChange('status', value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Archived', label: 'Archived' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
          />

          <FilterDropdown
            label="Record Type"
            value={recordTypeFilter}
            onChange={(value) => handleFilterChange('recordType', value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'Visit', label: 'Visit' },
              { value: 'Lab', label: 'Lab' },
              { value: 'Radiology', label: 'Radiology' },
              { value: 'Prescription', label: 'Prescription' },
              { value: 'Procedure', label: 'Procedure' }
            ]}
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="date-filter"
          />
        </div>

        {editMode && selectedRecords.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">
              {selectedRecords.length} selected
            </span>
            <Button
              onClick={() => handleBulkAction('archive')}
              className="btn-secondary"
            >
              Archive
            </Button>
            <Button
              onClick={() => handleBulkAction('export')}
              className="btn-info"
            >
              Export
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

      <div className="medical-records-content">
        <div className="medical-records-table-container">
          <table className="medical-records-table">
            <thead>
              <tr>
                {editMode && (
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedRecords.length === filteredRecords.length}
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
                <th>Type</th>
                <th onClick={() => handleSort('createdAt')}>
                  Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Diagnosis</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record._id}>
                  {editMode && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(record._id)}
                        onChange={() => handleSelectRecord(record._id)}
                      />
                    </td>
                  )}
                  <td>
                    <div className="patient-info">
                      <div className="patient-name">{record.patientName}</div>
                      <div className="patient-mobile">{record.patientMobile}</div>
                    </div>
                  </td>
                  <td>
                    <div className="doctor-info">
                      <div className="doctor-name">{record.doctorName}</div>
                      <div className="doctor-department">{record.department}</div>
                    </div>
                  </td>
                  <td>
                    <div className="record-type">
                      <span className="type-icon">{getRecordTypeIcon(record.recordType)}</span>
                      <span className="type-name">{record.recordType}</span>
                    </div>
                  </td>
                  <td>{formatDate(record.createdAt)}</td>
                  <td>
                    <div className="diagnosis">
                      {record.diagnosis || 'Pending'}
                    </div>
                  </td>
                  <td>
                    <StatusBadge
                      status={record.priority}
                      color={getPriorityColor(record.priority)}
                    />
                  </td>
                  <td>
                    <StatusBadge
                      status={record.status}
                      color={getStatusColor(record.status)}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        onClick={() => handleViewDetails(record)}
                        className="btn-sm btn-info"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => handleEditRecord(record)}
                        className="btn-sm btn-secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteRecord(record)}
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

        {filteredRecords.length === 0 && (
          <div className="no-records">
            <div className="no-records-icon">📋</div>
            <h3>No medical records found</h3>
            <p>Try adjusting your filters or create a new medical record.</p>
          </div>
        )}

        <div className="medical-records-pagination">
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
      {showRecordForm && (
        <MedicalRecordForm
          isOpen={showRecordForm}
          onClose={() => {
            setShowRecordForm(false);
            setEditingRecord(null);
          }}
          onSuccess={handleRecordSaved}
          existingRecord={editingRecord}
          patients={patients}
          doctors={doctors}
        />
      )}

      {showRecordDetails && selectedRecord && (
        <MedicalRecordDetailsModal
          isOpen={showRecordDetails}
          onClose={() => setShowRecordDetails(false)}
          record={selectedRecord}
          onEdit={() => {
            setShowRecordDetails(false);
            handleEditRecord(selectedRecord);
          }}
          onDelete={() => {
            setShowRecordDetails(false);
            handleDeleteRecord(selectedRecord);
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

export default MedicalRecordsManagement;
