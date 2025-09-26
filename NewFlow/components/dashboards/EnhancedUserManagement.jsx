import React, { useState, useMemo } from 'react';
import {
  Button,
  SearchInput,
  FilterDropdown,
  ConfirmationDialog,
  Pagination,
  StatusBadge,
  UserAvatar
} from '../ui';
import './UserManagementTable.css';

const EnhancedUserManagement = ({ onBack }) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [confirmationDialog, setConfirmationDialog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Mock data - in real app, this would come from API
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'patient', status: 'active', lastLogin: '2 hours ago', registrationDate: '2024-01-15', phone: '+91 98765 43210' },
    { id: 2, name: 'Dr. Sarah Smith', email: 'sarah@hospital.com', role: 'doctor', status: 'active', lastLogin: '1 hour ago', registrationDate: '2024-01-10', phone: '+91 98765 43211' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'patient', status: 'pending', lastLogin: 'Never', registrationDate: '2024-01-20', phone: '+91 98765 43212' },
    { id: 4, name: 'Lisa Wilson', email: 'lisa@hospital.com', role: 'nurse', status: 'active', lastLogin: '30 minutes ago', registrationDate: '2024-01-12', phone: '+91 98765 43213' },
    { id: 5, name: 'David Brown', email: 'david@example.com', role: 'receptionist', status: 'active', lastLogin: '15 minutes ago', registrationDate: '2024-01-08', phone: '+91 98765 43214' },
    { id: 6, name: 'Emma Davis', email: 'emma@hospital.com', role: 'admin', status: 'active', lastLogin: '5 minutes ago', registrationDate: '2024-01-05', phone: '+91 98765 43215' },
    { id: 7, name: 'Robert Wilson', email: 'robert@example.com', role: 'patient', status: 'suspended', lastLogin: '1 day ago', registrationDate: '2024-01-18', phone: '+91 98765 43216' },
    { id: 8, name: 'Dr. Jennifer Lee', email: 'jennifer@hospital.com', role: 'doctor', status: 'pending', lastLogin: 'Never', registrationDate: '2024-01-22', phone: '+91 98765 43217' },
    { id: 9, name: 'Maria Garcia', email: 'maria@hospital.com', role: 'nurse', status: 'active', lastLogin: '45 minutes ago', registrationDate: '2024-01-14', phone: '+91 98765 43218' },
    { id: 10, name: 'James Taylor', email: 'james@example.com', role: 'patient', status: 'active', lastLogin: '3 hours ago', registrationDate: '2024-01-16', phone: '+91 98765 43219' }
  ]);

  // Filter options
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'patient', label: 'Patient' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'lastLogin') {
        // Custom sorting for lastLogin
        const loginOrder = { 'Never': 0, '5 minutes ago': 1, '15 minutes ago': 2, '30 minutes ago': 3, '45 minutes ago': 4, '1 hour ago': 5, '2 hours ago': 6, '3 hours ago': 7, '1 day ago': 8 };
        aValue = loginOrder[aValue] || 9;
        bValue = loginOrder[bValue] || 9;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleUserAction = (userId, action) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.name || 'User';

    setConfirmationDialog({
      isOpen: true,
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${userName}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: action === 'delete' ? 'danger' : action === 'suspend' ? 'warning' : 'info',
      onConfirm: () => executeUserAction(userId, action)
    });
  };

  const handleBulkAction = (action) => {
    const userNames = selectedUsers.map(id => users.find(u => u.id === id)?.name).join(', ');

    setConfirmationDialog({
      isOpen: true,
      title: `Confirm Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${selectedUsers.length} selected users?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: action === 'delete' ? 'danger' : action === 'suspend' ? 'warning' : 'info',
      onConfirm: () => executeBulkAction(action)
    });
  };

  const executeUserAction = async (userId, action) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === 'delete') {
        setUsers(prev => prev.filter(user => user.id !== userId));
      } else if (action === 'suspend') {
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, status: 'suspended' } : user
        ));
      } else if (action === 'approve') {
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, status: 'active' } : user
        ));
      }

      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } catch (error) {
      console.error('Error executing user action:', error);
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
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      } else if (action === 'suspend') {
        setUsers(prev => prev.map(user =>
          selectedUsers.includes(user.id) ? { ...user, status: 'suspended' } : user
        ));
      } else if (action === 'approve') {
        setUsers(prev => prev.map(user =>
          selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
        ));
      }

      setSelectedUsers([]);
    } catch (error) {
      console.error('Error executing bulk action:', error);
    } finally {
      setIsLoading(false);
      setConfirmationDialog(null);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'blue',
      doctor: 'green',
      nurse: 'orange',
      receptionist: 'purple',
      patient: 'gray'
    };
    return colors[role] || 'gray';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      pending: 'yellow',
      suspended: 'red'
    };
    return colors[status] || 'gray';
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      setSelectedUsers([]); // Clear selections when exiting edit mode
    }
  };

  const handleUserClick = (user) => {
    if (!editMode) {
      // TODO: Open user details modal/sidebar
      console.log('User clicked:', user);
      // For now, just show an alert with user details
      alert(`User Details:\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nRole: ${user.role}\nStatus: ${user.status}\nLast Login: ${user.lastLogin}`);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon">↕️</span>;
    return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="user-management-table">
      {/* Header */}
      <div className="user-mgmt-header">
        <div className="header-left">
          {onBack && (
            <Button variant="default" size="small" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div className="header-title">
            <h1>👥 User Management</h1>
            <p>Manage system users and their permissions</p>
          </div>
        </div>
        <div className="header-actions">
          <Button
            variant={editMode ? 'primary' : 'default'}
            size="medium"
            onClick={handleToggleEditMode}
          >
            {editMode ? '✅ Exit Edit Mode' : '✏️ Edit Mode'}
          </Button>
          <Button variant="default" size="medium">
            ➕ Add New User
          </Button>
          <Button variant="default" size="medium">
            📤 Export Users
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="user-mgmt-filters">
        <div className="filters-left">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users by name or email..."
            className="user-search"
          />
          <FilterDropdown
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="Filter by role"
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
            {filteredAndSortedUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {editMode && selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected</span>
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
              onClick={() => handleBulkAction('suspend')}
            >
              ⏸️ Suspend Selected
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

      {/* Users Table */}
      <div className="users-table-container">
        <div className="users-table">
          <div className="table-header">
            <div className="table-cell checkbox-cell">
              {editMode && (
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={handleSelectAll}
                />
              )}
            </div>
            <div
              className="table-cell sortable"
              onClick={() => handleSort('name')}
            >
              Name <SortIcon field="name" />
            </div>
            <div
              className="table-cell sortable"
              onClick={() => handleSort('role')}
            >
              Role <SortIcon field="role" />
            </div>
            <div
              className="table-cell sortable"
              onClick={() => handleSort('status')}
            >
              Status <SortIcon field="status" />
            </div>
            <div className="table-cell">Actions</div>
          </div>

          {paginatedUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            paginatedUsers.map(user => (
              <div
                key={user.id}
                className="table-row"
                onClick={() => handleUserClick(user)}
              >
                <div className="table-cell checkbox-cell" onClick={(e) => e.stopPropagation()}>
                  {editMode && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  )}
                </div>
                <div className="table-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      <div className="avatar-circle">
                        {user.name.charAt(0)}
                      </div>
                    </div>
                    <div className="user-details">
                      <span className="user-name">{user.name}</span>
                      <span className="user-phone">{user.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="table-cell">
                  <StatusBadge
                    status={user.role}
                    variant={getRoleColor(user.role)}
                    size="small"
                  />
                </div>
                <div className="table-cell">
                  <StatusBadge
                    status={user.status}
                    variant={getStatusColor(user.status)}
                    size="small"
                  />
                </div>
                <div className="table-cell" onClick={(e) => e.stopPropagation()}>
                  {!editMode && (
                    <div className="action-buttons">
                      {user.status === 'pending' && (
                        <Button
                          variant="default"
                          size="small"
                          onClick={() => handleUserAction(user.id, 'approve')}
                        >
                          ✅ Approve
                        </Button>
                      )}
                      {user.status !== 'suspended' && (
                        <Button
                          variant="default"
                          size="small"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                        >
                          ⏸️ Suspend
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="small"
                        onClick={() => handleUserAction(user.id, 'delete')}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredAndSortedUsers.length}
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
    </div>
  );
};

export default EnhancedUserManagement;
