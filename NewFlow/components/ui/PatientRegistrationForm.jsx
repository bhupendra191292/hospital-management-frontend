
import React, { useState, useEffect } from 'react';
import { Button, DuplicateWarningModal, Modal, ModalHeader } from './index';
import FamilyMemberRegistrationModal from './FamilyMemberRegistrationModal';
import { createNewFlowPatient, updateNewFlowPatient, checkNewFlowDuplicates } from '../../services/api';
import { getStandardId, getPatientId, hasSameId } from '../../utils/idUtils';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { usePatientValidation } from '../../hooks/useValidation';
import './PatientRegistrationForm.css';

const PatientRegistrationForm = ({ 
  isOpen, 
  onClose, 
  onSave,
  existingPatient = null,
  existingPatients = [] // Array of existing patients for duplicate checking
}) => {
  // Define initial form data (empty for new patients)
  const getInitialFormData = () => ({
    name: existingPatient?.name || '',
    email: existingPatient?.email || '',
    mobile: existingPatient?.mobile || '',
    age: existingPatient?.age || '',
    gender: existingPatient?.gender || '',
    bloodGroup: existingPatient?.bloodGroup || '',
    emergencyContact: existingPatient?.emergencyContact || '',
    address: existingPatient?.address || '',
    city: existingPatient?.city || '',
    state: existingPatient?.state || '',
    pincode: existingPatient?.pincode || '',
    dateOfBirth: existingPatient?.dateOfBirth || '',
    occupation: existingPatient?.occupation || '',
    maritalStatus: existingPatient?.maritalStatus || '',
    guardianName: existingPatient?.guardianName || '',
    guardianRelation: existingPatient?.guardianRelation || '',
    isFamilyMember: existingPatient?.isFamilyMember || false,
    familyHeadName: existingPatient?.familyHeadName || '',
    familyHeadUHID: existingPatient?.familyHeadUHID || '',
    relationshipToHead: existingPatient?.relationshipToHead || ''
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // Reset form data when modal opens/closes or existingPatient changes
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({});
    setFamilyInfoAutoFilled(false);
    setDuplicateWarning(null);
    setShowDuplicateModal(false);
    setPendingPatientData(null);
  }, [isOpen, existingPatient]);

  const { errors: apiErrors, isLoading, setErrors, setIsLoading, handleApiError, clearAllErrors, handleDuplicateError } = useErrorHandler();
  const { errors: validationErrors, validateAndSetErrors, clearAllErrors: clearValidationErrors, getFieldError, handleFieldBlur, handleFieldChange } = usePatientValidation();
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showFamilyMemberModal, setShowFamilyMemberModal] = useState(false);
  const [suggestedFamilyHead, setSuggestedFamilyHead] = useState(null);
  const [pendingPatientData, setPendingPatientData] = useState(null);
  const [familyInfoAutoFilled, setFamilyInfoAutoFilled] = useState(false);


  // Generate UHID based on hospital code and current date
  const generateUHID = () => {
    const hospitalCode = 'DELH01'; // This should come from hospital settings
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${hospitalCode}-${year}${month}${day}-${randomNum}`;
  };

  // Simplified duplicate detection
  const checkForDuplicates = (patientData) => {
    const duplicates = [];
    
    // Skip duplicate checking if this is already a family member registration
    if (patientData.isFamilyMember && patientData.familyHeadName && patientData.familyHeadUHID) {
      return duplicates;
    }
    
    // Check for exact name + mobile combination (most strict check)
    const exactDuplicate = existingPatients.find(patient => 
      !hasSameId(patient, existingPatient) && 
      patient.name.toLowerCase() === patientData.name.toLowerCase() &&
      patient.mobile.replace(/\s/g, '') === patientData.mobile.replace(/\s/g, '')
    );
    
    if (exactDuplicate) {
      duplicates.push({
        type: 'exact_duplicate',
        field: 'name',
        message: `A patient with exact same name "${patientData.name}" and mobile "${patientData.mobile}" already exists`,
        existingPatient: exactDuplicate,
        canBeFamilyMember: true,
        isBlocking: true
      });
      return duplicates; // Return immediately for exact duplicates
    }

    // Check for email duplicates (only if email is provided)
    if (patientData.email.trim()) {
      const emailDuplicate = existingPatients.find(patient => 
        !hasSameId(patient, existingPatient) && 
        patient.email && 
        patient.email.toLowerCase() === patientData.email.toLowerCase()
      );
      
      if (emailDuplicate) {
        duplicates.push({
          type: 'email_duplicate',
          field: 'email',
          message: `A patient with same email "${patientData.email}" already exists (${emailDuplicate.name})`,
          existingPatient: emailDuplicate,
          canBeFamilyMember: true,
          isBlocking: false
        });
      }
    }

    // Check for mobile duplicates (only if different name)
    const mobileDuplicate = existingPatients.find(patient => 
      !hasSameId(patient, existingPatient) && 
      patient.mobile.replace(/\s/g, '') === patientData.mobile.replace(/\s/g, '') &&
      patient.name.toLowerCase() !== patientData.name.toLowerCase()
    );
    
    if (mobileDuplicate) {
      duplicates.push({
        type: 'mobile_duplicate',
        field: 'mobile',
        message: `A patient with same mobile "${patientData.mobile}" already exists (${mobileDuplicate.name})`,
        existingPatient: mobileDuplicate,
        canBeFamilyMember: true,
        isBlocking: false
      });
    }

    return duplicates;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle field change for validation
    handleFieldChange(name, value);
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    handleFieldBlur(name, value);
  };

  const validateForm = () => {
    const validation = validateAndSetErrors(formData);
    
    // Check for duplicates (only blocking duplicates, not informational ones)
    const duplicates = checkForDuplicates(formData);
    const blockingDuplicates = duplicates.filter(duplicate => 
      !duplicate.isInfoOnly && duplicate.isBlocking !== false
    );
    if (blockingDuplicates.length > 0) {
      // Don't add errors to form validation - let the duplicate modal handle it
      // This allows the form to submit and show the duplicate warning modal
    }

    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any existing errors first
    setErrors({});
    
    // Only check for duplicates when creating a new patient, not when editing
    if (!existingPatient) {
      const duplicates = checkForDuplicates(formData);
      if (duplicates.length > 0) {
        setDuplicateWarning(duplicates);
        setPendingPatientData({
          ...formData,
          email: formData.email.trim() || null, // Set to null if empty
          id: existingPatient?._id || existingPatient?.id || Date.now(),
          uhid: existingPatient?.uhid || generateUHID(),
          status: existingPatient?.status || 'Active',
          registrationDate: existingPatient?.registrationDate || new Date().toISOString().split('T')[0],
          lastVisit: existingPatient?.lastVisit || new Date().toISOString().split('T')[0]
        });
        setShowDuplicateModal(true);
        return;
      }
    }

    // No duplicates found, now check other validations
    if (!validateForm()) return;

    // All validations passed, proceed with saving
    await savePatientData();
  };

  const savePatientData = async () => {
    setIsLoading(true);
    
    // Define patientData outside try block so it's accessible in catch
    const patientData = pendingPatientData || {
      ...formData,
      email: formData.email.trim() || null, // Set to null if empty
      id: getStandardId(existingPatient) || Date.now(),
      uhid: existingPatient?.uhid || generateUHID(),
      status: existingPatient?.status || 'Active',
      registrationDate: existingPatient?.registrationDate || new Date().toISOString().split('T')[0],
      lastVisit: existingPatient?.lastVisit || new Date().toISOString().split('T')[0]
    };

    try {
      let response;
      
      if (existingPatient) {
        // Update existing patient using PUT API
        const patientId = getPatientId(existingPatient);
        response = await updateNewFlowPatient(patientId, patientData);
      } else {
        // Create new patient using POST API
        response = await createNewFlowPatient(patientData);
      }
      
      if (response.data.success) {
        // Call the onSave callback with the patient data
        await onSave(response.data.data);
        
        // Close the modal
        onClose();
        
        // Reset form
        setFormData(getInitialFormData());
        setErrors({});
        setFamilyInfoAutoFilled(false);
        
        // Show success message
        alert(existingPatient ? '✅ Patient updated successfully!' : '✅ Patient registered successfully!');
      } else {
        // Handle backend duplicate detection (success: false with duplicates)
        if (response.data.duplicates && response.data.duplicates.length > 0) {
          console.log('🔄 Backend detected duplicates:', response.data.duplicates);
          
          // Transform backend duplicate format to frontend format
          const transformedDuplicates = response.data.duplicates.map(duplicate => ({
            type: 'exact_duplicate', // Backend returns generic "duplicate" type
            field: 'mobile', // Most common duplicate field
            message: `A patient with mobile number "${duplicate.mobile}" already exists (${duplicate.name})`,
            existingPatient: {
              id: duplicate.id,
              name: duplicate.name,
              uhid: duplicate.uhid,
              mobile: duplicate.mobile,
              email: duplicate.email,
              isFamilyMember: false
            },
            canBeFamilyMember: true, // Always allow family member option
            isBlocking: true
          }));
          
          setDuplicateWarning(transformedDuplicates);
          setPendingPatientData(patientData);
          setShowDuplicateModal(true);
        } else {
          setErrors({ submit: response.data.message || (existingPatient ? 'Failed to update patient' : 'Failed to create patient') });
        }
      }
      
    } catch (error) {
      const errorResult = handleApiError(error, 'PatientRegistrationForm.savePatientData');
      
      if (errorResult?.isDuplicate) {
        // Handle duplicate detection
        const duplicates = errorResult.data.duplicates || [];
        if (duplicates.length > 0) {
          const transformedDuplicates = handleDuplicateError(duplicates);
          setDuplicateWarning(transformedDuplicates);
          setPendingPatientData(patientData);
          setShowDuplicateModal(true);
        } else {
          // Fallback for duplicate without data
          const mockDuplicate = {
            type: 'exact_duplicate',
            field: 'mobile',
            message: 'A duplicate patient was detected by the backend',
            existingPatient: {
              id: 'unknown',
              name: 'Existing Patient',
              uhid: 'Unknown',
              mobile: patientData.mobile,
              email: patientData.email || '',
              isFamilyMember: false
            },
            canBeFamilyMember: true,
            isBlocking: true
          };
          setDuplicateWarning([mockDuplicate]);
          setPendingPatientData(patientData);
          setShowDuplicateModal(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithDuplicate = () => {
    setShowDuplicateModal(false);
    savePatientData();
  };

  const handleViewExistingPatient = (patient) => {
    // This would typically open the patient details modal
    console.log('View existing patient:', patient);
    alert(`Viewing existing patient: ${patient.name} (UHID: ${patient.uhid})`);
  };

  const handleRegisterAsFamilyMember = (familyHead) => {
    // Set the family head information and mark as family member
    setFormData(prev => ({
      ...prev,
      isFamilyMember: true,
      familyHeadName: familyHead.name,
      familyHeadUHID: familyHead.uhid,
      // Keep the same contact info
      email: prev.email,
      mobile: prev.mobile
    }));
    
    // Set the auto-filled flag
    setFamilyInfoAutoFilled(true);
    
    // Clear ALL duplicate detection state to prevent loop
    setShowDuplicateModal(false);
    setDuplicateWarning(null);
    setPendingPatientData(null);
    
    // Clear any existing errors that might be related to duplicates
    setErrors(prev => {
      const newErrors = { ...prev };
      // Remove any duplicate-related errors
      delete newErrors.duplicate;
      delete newErrors.email;
      delete newErrors.mobile;
      return newErrors;
    });
    
    // Family member information has been auto-filled
  };

  const handleFamilyMemberRegistration = (relationship) => {
    // Update the form data with the relationship
    setFormData(prev => ({
      ...prev,
      relationshipToHead: relationship
    }));
    
    // Close the family member modal and proceed with registration
    setShowFamilyMemberModal(false);
    setSuggestedFamilyHead(null);
    
    // Proceed with saving the patient data
    savePatientData();
  };

  const bloodGroupOptions = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const genderOptions = [
    'Male', 'Female', 'Other'
  ];

  const maritalStatusOptions = [
    'Single', 'Married', 'Divorced', 'Widowed'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="patient-registration-modal">
      <div className="modal-content-container">
        {/* Header */}
        <ModalHeader
          title={existingPatient ? 'Edit Patient' : 'Register New Patient'}
          icon={existingPatient ? '✏️' : '👤'}
          onClose={onClose}
        />

        {/* Form Content */}
        <div className="modal-body form-content">
          <form onSubmit={handleSubmit} className="patient-registration-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3>📋 Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={getFieldError('name') ? 'error' : ''}
                    placeholder="Enter full name"
                  />
                  {getFieldError('name') && <span className="error-message">{getFieldError('name')}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={getFieldError('email') ? 'error' : ''}
                    placeholder="Enter email address (Optional)"
                  />
                  {getFieldError('email') && <span className="error-message">{getFieldError('email')}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number *</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={getFieldError('mobile') ? 'error' : ''}
                    placeholder="+91 98765 43210"
                    readOnly={!!existingPatient}
                    style={existingPatient ? { 
                      backgroundColor: '#f9fafb', 
                      color: '#6b7280',
                      cursor: 'not-allowed'
                    } : {}}
                  />
                  {existingPatient && (
                    <small className="form-help" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                      🔒 Mobile number cannot be changed for existing patients (data integrity)
                    </small>
                  )}
                  {getFieldError('mobile') && <span className="error-message">{getFieldError('mobile')}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="age">Age *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={getFieldError('age') ? 'error' : ''}
                    placeholder="Enter age"
                    min="0"
                    max="150"
                  />
                  {getFieldError('age') && <span className="error-message">{getFieldError('age')}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={getFieldError('gender') ? 'error' : ''}
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                  {getFieldError('gender') && <span className="error-message">{getFieldError('gender')}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className={getFieldError('bloodGroup') ? 'error' : ''}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroupOptions.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  {getFieldError('bloodGroup') && <span className="error-message">{getFieldError('bloodGroup')}</span>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3>📞 Contact Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="emergencyContact">Emergency Contact</label>
                  <input
                    type="tel"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className={getFieldError('emergencyContact') ? 'error' : ''}
                    placeholder="+91 98765 43220 (Optional)"
                  />
                  {getFieldError('emergencyContact') && <span className="error-message">{getFieldError('emergencyContact')}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </div>

            {/* Family Relationship Information */}
            <div className="form-section">
              <h3>👨‍👩‍👧‍👦 Family Relationship</h3>
              {familyInfoAutoFilled && (
                <div className="auto-fill-success">
                  <span className="success-icon">✅</span>
                  <span className="success-text">Family member information has been auto-filled from duplicate detection!</span>
                </div>
              )}
              {formData.isFamilyMember && formData.familyHeadName && formData.familyHeadUHID && (
                <div className="family-member-status">
                  <span className="status-icon">👨‍👩‍👧‍👦</span>
                  <span className="status-text">This is a family member registration - duplicate checking is disabled</span>
                </div>
              )}
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFamilyMember"
                      checked={formData.isFamilyMember}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          isFamilyMember: e.target.checked,
                          // Clear family fields if unchecking
                          familyHeadName: e.target.checked ? prev.familyHeadName : '',
                          familyHeadUHID: e.target.checked ? prev.familyHeadUHID : '',
                          relationshipToHead: e.target.checked ? prev.relationshipToHead : ''
                        }));
                        
                        // Clear auto-fill status if unchecking family member
                        if (!e.target.checked) {
                          setFamilyInfoAutoFilled(false);
                        }
                      }}
                    />
                    <span className="checkbox-text">This patient is a family member (child, spouse, etc.)</span>
                  </label>
                  <small className="form-help">Check this if the patient is a child or family member who shares contact information with another patient</small>
                </div>

                {formData.isFamilyMember && (
                  <>
                    <div className="form-group">
                      <label htmlFor="familyHeadName">Family Head Name</label>
                      <input
                        type="text"
                        id="familyHeadName"
                        name="familyHeadName"
                        value={formData.familyHeadName}
                        onChange={handleInputChange}
                        placeholder="Enter family head name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="familyHeadUHID">Family Head UHID</label>
                      <input
                        type="text"
                        id="familyHeadUHID"
                        name="familyHeadUHID"
                        value={formData.familyHeadUHID}
                        onChange={handleInputChange}
                        placeholder="Enter family head UHID"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="relationshipToHead">Relationship to Family Head *</label>
                      <select
                        id="relationshipToHead"
                        name="relationshipToHead"
                        value={formData.relationshipToHead}
                        onChange={handleInputChange}
                        required={formData.isFamilyMember}
                      >
                        <option value="">Select Relationship</option>
                        <option value="Child">Child</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Grandchild">Grandchild</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3>ℹ️ Additional Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="occupation">Occupation</label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="Enter occupation"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maritalStatus">Marital Status</label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Marital Status</option>
                    {maritalStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="guardianName">Guardian Name</label>
                  <input
                    type="text"
                    id="guardianName"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    placeholder="Enter guardian name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="guardianRelation">Guardian Relation</label>
                  <input
                    type="text"
                    id="guardianRelation"
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleInputChange}
                    placeholder="e.g., Father, Mother, Spouse"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Form Actions */}
        <div className="modal-footer form-actions">
          <div className="modal-footer-actions">
            <div className="form-actions-left">
              <div className="family-member-note">
                <span className="note-icon">ℹ️</span>
                <span className="note-text">
                  {existingPatient 
                    ? "Mobile numbers cannot be changed for existing patients to maintain data integrity and prevent duplicate records."
                    : "If this is a family member (child, spouse, etc.), the system will automatically suggest family registration when duplicate contact info is detected."
                  }
                </span>
              </div>
            </div>
            <div className="form-actions-right">
              <button 
                type="button" 
                className="btn btn-default"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Saving...' : (existingPatient ? '💾 Update Patient' : '✨ Register Patient')}
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Duplicate Warning Modal */}
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          onClose={() => {
            setShowDuplicateModal(false);
            setDuplicateWarning(null);
            setPendingPatientData(null);
          }}
          duplicates={duplicateWarning}
          onContinue={handleContinueWithDuplicate}
          onViewExisting={handleViewExistingPatient}
          onRegisterAsFamilyMember={handleRegisterAsFamilyMember}
        />

        {/* Family Member Registration Modal */}
        <FamilyMemberRegistrationModal
          isOpen={showFamilyMemberModal}
          onClose={() => {
            setShowFamilyMemberModal(false);
            setSuggestedFamilyHead(null);
          }}
          familyHead={suggestedFamilyHead}
          onRegister={handleFamilyMemberRegistration}
        />
    </Modal>
  );
};

export default PatientRegistrationForm;
