import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Button, 
  SearchInput, 
  FilterDropdown, 
  ConfirmationDialog, 
  Pagination,
  StatusBadge,
  UserAvatar,
  DoctorCard,
  AddDoctorModal
} from '../ui';
import { 
  getAllNewFlowDoctors, 
  createNewFlowDoctor, 
  updateNewFlowDoctor, 
  deleteNewFlowDoctor 
} from '../../services/api';
import { useDataProcessing, usePerformanceMonitor } from '../../hooks/usePerformance';
import './EnhancedDoctorManagement.css';

const EnhancedDoctorManagement = ({ onBack }) => {
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('EnhancedDoctorManagement');
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [editMode, setEditMode] = useState(false); // Edit mode for bulk actions
  const [confirmationDialog, setConfirmationDialog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Real data from API
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [error, setError] = useState(null);

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setIsLoadingDoctors(true);
      setError(null);
      const response = await getAllNewFlowDoctors();
      if (response.data.success) {
        setDoctors(response.data.data || []);
      } else {
        setError('Failed to load doctors');
      }
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  // CRUD Operations
  const handleCreateDoctor = async (doctorData) => {
    try {
      setIsLoading(true);
      const response = await createNewFlowDoctor(doctorData);
      if (response.data.success) {
        await loadDoctors(); // Reload the list
        return { success: true, message: 'Doctor created successfully' };
      } else {
        return { success: false, message: response.data.message || 'Failed to create doctor' };
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
      return { success: false, message: 'Failed to create doctor' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDoctor = async (id, doctorData) => {
    try {
      setIsLoading(true);
      const response = await updateNewFlowDoctor(id, doctorData);
      if (response.data.success) {
        await loadDoctors(); // Reload the list
        return { success: true, message: 'Doctor updated successfully' };
      } else {
        return { success: false, message: response.data.message || 'Failed to update doctor' };
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      return { success: false, message: 'Failed to update doctor' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      setIsLoading(true);
      const response = await deleteNewFlowDoctor(id);
      if (response.data.success) {
        await loadDoctors(); // Reload the list
        return { success: true, message: 'Doctor deleted successfully' };
      } else {
        return { success: false, message: response.data.message || 'Failed to delete doctor' };
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      return { success: false, message: 'Failed to delete doctor' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorCreated = (newDoctor) => {
    console.log('✅ Doctor created successfully:', newDoctor);
    // The loadDoctors function will be called automatically by the modal
    setShowAddDoctorModal(false);
  };

  // Filter options
  const specializationOptions = [
    { value: '', label: 'All Specializations' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Gynecology', label: 'Gynecology' },
    { value: 'Psychiatry', label: 'Psychiatry' },
    { value: 'Ophthalmology', label: 'Ophthalmology' },
    { value: 'ENT', label: 'ENT' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Optimized data processing
  const itemsPerPage = viewMode === 'grid' ? 6 : 5;
  const {
    items: paginatedDoctors,
    totalPages,
    hasNext,
    hasPrev,
    totalItems
  } = useDataProcessing(doctors, {
    searchTerm,
    searchFields: ['name', 'specialization', 'email'],
    filters: {
      specialization: specializationFilter,
      status: statusFilter
    },
    sortField,
    sortDirection,
    currentPage,
    itemsPerPage
  });

  // Optimized handlers with useCallback
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleSelectDoctor = useCallback((doctorId) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedDoctors.length === paginatedDoctors.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(paginatedDoctors.map(doctor => doctor.id));
    }
  }, [selectedDoctors.length, paginatedDoctors]);

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Clear selections when exiting edit mode
      setSelectedDoctors([]);
    }
  };

  const handleDoctorAction = (doctorId, action) => {
    const doctor = doctors.find(d => d.id === doctorId);
    const doctorName = doctor?.name || 'Doctor';
    
    setConfirmationDialog({
      isOpen: true,
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${doctorName}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: action === 'delete' ? 'danger' : action === 'deactivate' ? 'warning' : 'info',
      onConfirm: () => executeDoctorAction(doctorId, action)
    });
  };

  const handleBulkAction = (action) => {
    const doctorNames = selectedDoctors.map(id => doctors.find(d => d.id === id)?.name).join(', ');
    
    setConfirmationDialog({
      isOpen: true,
      title: `Confirm Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${selectedDoctors.length} selected doctors?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: action === 'delete' ? 'danger' : action === 'deactivate' ? 'warning' : 'info',
      onConfirm: () => executeBulkAction(action)
    });
  };

  const executeDoctorAction = async (doctorId, action) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'delete') {
        setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
      } else if (action === 'deactivate') {
        setDoctors(prev => prev.map(doctor => 
          doctor.id === doctorId ? { ...doctor, status: 'inactive' } : doctor
        ));
      } else if (action === 'approve') {
        setDoctors(prev => prev.map(doctor => 
          doctor.id === doctorId ? { ...doctor, status: 'active' } : doctor
        ));
      }
      
      setSelectedDoctors(prev => prev.filter(id => id !== doctorId));
    } catch (error) {
      console.error('Error executing doctor action:', error);
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
        setDoctors(prev => prev.filter(doctor => !selectedDoctors.includes(doctor.id)));
      } else if (action === 'deactivate') {
        setDoctors(prev => prev.map(doctor => 
          selectedDoctors.includes(doctor.id) ? { ...doctor, status: 'inactive' } : doctor
        ));
      } else if (action === 'approve') {
        setDoctors(prev => prev.map(doctor => 
          selectedDoctors.includes(doctor.id) ? { ...doctor, status: 'active' } : doctor
        ));
      }
      
      setSelectedDoctors([]);
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

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon">↕️</span>;
    return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="enhanced-doctor-management">
      {/* Header */}
      <div className="doctor-mgmt-header">
        <div className="header-left">
          {onBack && (
            <Button variant="default" size="small" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div className="header-title">
            <h1>👨‍⚕️ Doctor Management</h1>
            <p>Manage doctor profiles and specializations</p>
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
            variant="primary" 
            size="medium"
            onClick={() => setShowAddDoctorModal(true)}
          >
            ➕ Add New Doctor
          </Button>
          <Button variant="default" size="medium">
            📤 Export Doctors
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="doctor-mgmt-filters">
        <div className="filters-left">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search doctors by name, specialization, or email..."
            className="doctor-search"
          />
          <FilterDropdown
            options={specializationOptions}
            value={specializationFilter}
            onChange={setSpecializationFilter}
            placeholder="Filter by specialization"
          />
          <FilterDropdown
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />
        </div>
        <div className="filters-right">
          <div className="view-toggle">
            <Button 
              variant={viewMode === 'grid' ? 'primary' : 'default'}
              size="large"
              onClick={() => setViewMode('grid')}
            >
              ⊞
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'primary' : 'default'}
              size="large"
              onClick={() => setViewMode('table')}
            >
              ☰
            </Button>
          </div>
          <div className="results-count">
            {totalItems} of {doctors.length} doctors
          </div>
        </div>
      </div>

      {/* Bulk Actions - Only show in edit mode */}
      {editMode && selectedDoctors.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedDoctors.length} doctor{selectedDoctors.length > 1 ? 's' : ''} selected</span>
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

      {/* Loading State */}
      {isLoadingDoctors && (
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading doctors...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoadingDoctors && (
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Doctors</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={loadDoctors}>
            🔄 Retry
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoadingDoctors && !error && viewMode === 'grid' ? (
        /* Grid View */
        <div className="doctors-grid-container">
          {paginatedDoctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👨‍⚕️</div>
              <h3>No doctors found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="doctors-grid">
              {paginatedDoctors.map(doctor => (
                <div key={doctor.id} className="doctor-card-wrapper">
                  {editMode && (
                    <input
                      type="checkbox"
                      checked={selectedDoctors.includes(doctor.id)}
                      onChange={() => handleSelectDoctor(doctor.id)}
                      className="doctor-checkbox"
                    />
                  )}
                  <DoctorCard
                    doctor={doctor}
                    onAction={handleDoctorAction}
                    showActions={!editMode}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !isLoadingDoctors && !error ? (
        /* Table View */
        <div className="doctors-table-container">
          <div className="doctors-table">
            <div className="table-header">
              {editMode && (
                <div className="table-cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedDoctors.length === paginatedDoctors.length && paginatedDoctors.length > 0}
                    onChange={handleSelectAll}
                  />
                </div>
              )}
              <div 
                className="table-cell sortable" 
                onClick={() => handleSort('name')}
              >
                Doctor <SortIcon field="name" />
              </div>
              <div 
                className="table-cell sortable" 
                onClick={() => handleSort('specialization')}
              >
                Specialization <SortIcon field="specialization" />
              </div>
              <div 
                className="table-cell sortable" 
                onClick={() => handleSort('experience')}
              >
                Exp <SortIcon field="experience" />
              </div>
              <div 
                className="table-cell sortable" 
                onClick={() => handleSort('patients')}
              >
                Patients <SortIcon field="patients" />
              </div>
              <div 
                className="table-cell sortable" 
                onClick={() => handleSort('rating')}
              >
                Rating <SortIcon field="rating" />
              </div>
              <div 
                className="table-cell sortable" 
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </div>
              <div className="table-cell">Actions</div>
            </div>

            {paginatedDoctors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👨‍⚕️</div>
                <h3>No doctors found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              paginatedDoctors.map(doctor => (
                <div key={doctor.id} className="table-row">
                  {editMode && (
                    <div className="table-cell checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedDoctors.includes(doctor.id)}
                        onChange={() => handleSelectDoctor(doctor.id)}
                      />
                    </div>
                  )}
                  <div className="table-cell">
                    <div className="doctor-info">
                      <div className="doctor-details">
                        <span className="doctor-name">{doctor.name}</span>
                        <span className="doctor-email">{doctor.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="table-cell">{doctor.specialization}</div>
                  <div className="table-cell">{doctor.experience}</div>
                  <div className="table-cell">{doctor.patients}</div>
                  <div className="table-cell">
                    <div className="rating-info">
                      <span className="rating">⭐ {doctor.rating}</span>
                    </div>
                  </div>
                  <div className="table-cell">
                    <StatusBadge 
                      status={doctor.status} 
                      variant={getStatusColor(doctor.status)}
                      size="small"
                    />
                  </div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      {doctor.status === 'pending' && (
                        <Button 
                          variant="default"
                          size="small"
                          onClick={() => handleDoctorAction(doctor.id, 'approve')}
                        >
                          Approve
                        </Button>
                      )}
                      <Button 
                        variant="default"
                        size="small"
                        onClick={() => handleDoctorAction(doctor.id, 'view')}
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="default"
                        size="small"
                        onClick={() => handleDoctorAction(doctor.id, 'edit')}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
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

      {/* Add Doctor Modal */}
      <AddDoctorModal
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        onSuccess={handleDoctorCreated}
      />
    </div>
  );
};

export default EnhancedDoctorManagement;
