import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { searchNewFlowPatients, getNewFlowPatients } from '../../services/api';
import './PatientSearch.css';

const PatientSearch = ({ onPatientSelected, onNewPatient }) => {
  const { can } = useRole();
  const [searchType, setSearchType] = useState('uhid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchCase, setSearchCase] = useState(null); // A, B, C, D, E, F, G
  const [partialInfo, setPartialInfo] = useState(false);
  const [duplicateCandidates, setDuplicateCandidates] = useState([]);

  // Mock patient data for testing
  const mockPatients = [
    {
      id: 1,
      uhid: 'DELH01-250901-0001',
      firstName: 'Anjali',
      lastName: 'Singh',
      gender: 'female',
      dateOfBirth: '1990-05-15',
      age: 34,
      mobile: '9876543210',
      address: '123 Main Street, Delhi',
      lastVisit: '2024-01-10',
      status: 'active'
    },
    {
      id: 2,
      uhid: 'DELH01-250901-0002',
      firstName: 'Anjali',
      lastName: 'Sharma',
      gender: 'female',
      dateOfBirth: '1985-08-20',
      age: 39,
      mobile: '9876543211',
      address: '456 Park Avenue, Delhi',
      lastVisit: '2024-01-08',
      status: 'active'
    },
    {
      id: 3,
      uhid: 'DELH01-250901-0003',
      firstName: 'Anjali',
      lastName: 'Singh',
      gender: 'female',
      dateOfBirth: '1992-12-10',
      age: 32,
      mobile: '9876543212',
      address: '789 Garden Road, Delhi',
      lastVisit: '2024-01-05',
      status: 'active'
    },
    {
      id: 4,
      uhid: 'DELH01-250901-0004',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      gender: 'male',
      dateOfBirth: '1980-03-25',
      age: 44,
      mobile: '9876543213',
      address: '321 Market Street, Delhi',
      lastVisit: '2024-01-12',
      status: 'active'
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter search criteria');
      return;
    }

    if (!can('VIEW_PATIENTS')) {
      setSearchError('You do not have permission to search patients');
      return;
    }

    setIsLoading(true);
    setSearchError('');
    setShowResults(false);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let results = [];

      switch (searchType) {
        case 'uhid':
          results = mockPatients.filter(patient =>
            patient.uhid.toLowerCase().includes(searchQuery.toLowerCase())
          );
          break;
        case 'mobile':
          results = mockPatients.filter(patient =>
            patient.mobile.includes(searchQuery)
          );
          break;
        case 'name':
          results = mockPatients.filter(patient =>
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
          );
          break;
        case 'name_dob': {
          const [name, dob] = searchQuery.split(',');
          if (name && dob) {
            results = mockPatients.filter(patient =>
              `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(name.trim().toLowerCase()) &&
              patient.dateOfBirth === dob.trim()
            );
          }
          break;
        }
        default:
          results = [];
      }

      setSearchResults(results);
      setShowResults(true);

      // Determine the specific case based on results and search criteria
      if (results.length === 0) {
        // Case C: No Match Found
        setSearchCase('C');
        setSearchError('');
      } else if (results.length === 1) {
        // Case A: Exact Match Found (Unique Patient)
        setSearchCase('A');
        setSelectedPatient(results[0]);
        setSearchError('');
      } else {
        // Multiple results - determine specific case
        if (searchType === 'name' && searchQuery.split(',').length === 1) {
          // Case D: Name Only Provided
          setSearchCase('D');
        } else if (searchType === 'name' && results.length > 1) {
          // Check for potential duplicates (Case F)
          const sameNameResults = results.filter(patient =>
            `${patient.firstName} ${patient.lastName}`.toLowerCase() === searchQuery.toLowerCase()
          );
          if (sameNameResults.length > 1) {
            setSearchCase('F');
            setDuplicateCandidates(sameNameResults);
          } else {
            // Case B: Multiple Matches Found
            setSearchCase('B');
          }
        } else {
          // Case B: Multiple Matches Found
          setSearchCase('B');
        }
        setSelectedPatient(null);
        setSearchError('');
      }

      // Check for partial information (Case E) - this would be triggered by specific conditions
      // For now, we'll handle this as a separate case that can be triggered manually

    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    onPatientSelected(patient);
  };

  const handleNewPatient = () => {
    onNewPatient();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'uhid':
        return 'Enter UHID (e.g., DELH01-250901-0001)';
      case 'mobile':
        return 'Enter 10-digit mobile number';
      case 'name':
        return 'Enter patient name';
      case 'name_dob':
        return 'Enter name, date of birth (e.g., John Doe, 1990-05-15)';
      default:
        return 'Enter search criteria';
    }
  };

  const getSearchButtonText = () => {
    if (isLoading) return 'Searching...';
    return 'Search Patient';
  };

  const renderSearchResults = () => {
    if (!showResults) return null;

    switch (searchCase) {
      case 'A':
        return renderCaseA_ExactMatch();
      case 'B':
        return renderCaseB_MultipleMatches();
      case 'C':
        return renderCaseC_NoMatch();
      case 'D':
        return renderCaseD_NameOnly();
      case 'E':
        return renderCaseE_PartialInfo();
      case 'F':
        return renderCaseF_DuplicateDetection();
      case 'G':
        return renderCaseG_EmergencyAdmission();
      default:
        return null;
    }
  };

  // Case A: Exact Match Found (Unique Patient)
  const renderCaseA_ExactMatch = () => {
    const patient = searchResults[0];
    return (
      <div className="search-results case-a">
        <div className="case-header">
          <div className="case-icon">✅</div>
          <h3>Case A: Exact Match Found</h3>
          <p>Perfect! We found exactly one patient matching your search criteria.</p>
        </div>

        <div className="patient-card exact-match">
          <div className="patient-info">
            <h4>{patient.firstName} {patient.lastName}</h4>
            <div className="patient-details">
              <p><strong>UHID:</strong> {patient.uhid}</p>
              <p><strong>Age:</strong> {patient.age} years</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              <p><strong>Mobile:</strong> {patient.mobile}</p>
              <p><strong>Last Visit:</strong> {patient.lastVisit}</p>
              <p><strong>Address:</strong> {patient.address}</p>
            </div>
          </div>
          <div className="patient-actions">
            <button
              onClick={() => handlePatientSelect(patient)}
              className="btn-primary"
            >
              Select Patient & Book Appointment
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Case B: Multiple Matches Found (Same Name / Similar Records)
  const renderCaseB_MultipleMatches = () => {
    return (
      <div className="search-results case-b">
        <div className="case-header">
          <div className="case-icon">⚠️</div>
          <h3>Case B: Multiple Matches Found</h3>
          <p>Found {searchResults.length} patients with similar details. Please ask the patient for additional information to identify the correct record.</p>
        </div>

        <div className="patients-list">
          {searchResults.map(patient => (
            <div key={patient.id} className="patient-item">
              <div className="patient-details">
                <h4>{patient.firstName} {patient.lastName}</h4>
                <div className="patient-meta">
                  <span><strong>UHID:</strong> {patient.uhid}</span>
                  <span><strong>Age:</strong> {patient.age} years</span>
                  <span><strong>Gender:</strong> {patient.gender}</span>
                  <span><strong>Mobile:</strong> {patient.mobile}</span>
                  <span><strong>Last Visit:</strong> {patient.lastVisit}</span>
                </div>
                <div className="patient-address">
                  <strong>Address:</strong> {patient.address}
                </div>
              </div>
              <div className="patient-actions">
                <button
                  onClick={() => handlePatientSelect(patient)}
                  className="btn-primary"
                >
                  Select This Patient
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="case-footer">
          <div className="help-text">
            <h4>💡 Help the patient identify themselves:</h4>
            <ul>
              <li>Ask for their date of birth</li>
              <li>Ask for their mobile number</li>
              <li>Ask for their address</li>
              <li>Ask for their guardian's name</li>
            </ul>
          </div>
          <div className="footer-actions">
            <button onClick={handleNewPatient} className="btn-secondary">
              Register New Patient
            </button>
            <button onClick={() => setShowResults(false)} className="btn-secondary">
              Try Different Search
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Case C: No Match Found
  const renderCaseC_NoMatch = () => {
    return (
      <div className="search-results case-c">
        <div className="case-header">
          <div className="case-icon">🔍</div>
          <h3>Case C: No Records Found</h3>
          <p>No patient records match your search criteria. This appears to be a new patient.</p>
        </div>

        <div className="no-match-content">
          <div className="no-match-icon">👤</div>
          <h4>New Patient Registration Required</h4>
          <p>The patient needs to be registered in the system before booking an appointment.</p>

          <div className="registration-options">
            <button onClick={handleNewPatient} className="btn-primary">
              Register New Patient
            </button>
            <button onClick={() => setShowResults(false)} className="btn-secondary">
              Try Different Search
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Case D: Patient Only Provides Name (No DOB/Mobile/Other Info)
  const renderCaseD_NameOnly = () => {
    return (
      <div className="search-results case-d">
        <div className="case-header">
          <div className="case-icon">❓</div>
          <h3>Case D: Name Only Provided</h3>
          <p>Patient only provided their name. Please try to get additional identifying information.</p>
        </div>

        <div className="name-only-content">
          <div className="search-suggestions">
            <h4>🔍 Try searching with:</h4>
            <ul>
              <li>Name + Date of Birth</li>
              <li>Name + Mobile Number</li>
              <li>Name + Address</li>
              <li>Guardian/Spouse Name</li>
            </ul>
          </div>

          <div className="partial-matches">
            <h4>Found {searchResults.length} patients with similar names:</h4>
            <div className="patients-list">
              {searchResults.map(patient => (
                <div key={patient.id} className="patient-item">
                  <div className="patient-details">
                    <h4>{patient.firstName} {patient.lastName}</h4>
                    <p><strong>Age:</strong> {patient.age} years | <strong>Mobile:</strong> {patient.mobile}</p>
                    <p><strong>Address:</strong> {patient.address}</p>
                  </div>
                  <div className="patient-actions">
                    <button
                      onClick={() => handlePatientSelect(patient)}
                      className="btn-primary"
                    >
                      Select This Patient
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-actions">
            <button onClick={handleNewPatient} className="btn-secondary">
              Register New Patient (Flag as Potential Duplicate)
            </button>
            <button onClick={() => setShowResults(false)} className="btn-secondary">
              Try Different Search
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Case E: Patient Forgot DOB/Age/Mobile (Partial Info Only)
  const renderCaseE_PartialInfo = () => {
    return (
      <div className="search-results case-e">
        <div className="case-header">
          <div className="case-icon">⚠️</div>
          <h3>Case E: Partial Information Only</h3>
          <p>Patient has limited information available. We can still create a record with partial data.</p>
        </div>

        <div className="partial-info-content">
          <div className="info-warning">
            <h4>⚠️ Incomplete Information Detected</h4>
            <p>The patient doesn't have complete details. You can:</p>
            <ul>
              <li>Use approximate age (e.g., "around 40 years old")</li>
              <li>Use approximate DOB (just the year)</li>
              <li>Use secondary identifiers (address, guardian)</li>
              <li>Create record with partial info and update later</li>
            </ul>
          </div>

          <div className="partial-actions">
            <button onClick={handleNewPatient} className="btn-primary">
              Register with Partial Information
            </button>
            <button onClick={() => setShowResults(false)} className="btn-secondary">
              Try Different Search
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Case F: Duplicate Record Detected During New Registration
  const renderCaseF_DuplicateDetection = () => {
    return (
      <div className="search-results case-f">
        <div className="case-header">
          <div className="case-icon">🔄</div>
          <h3>Case F: Potential Duplicate Detected</h3>
          <p>Found existing records that might be the same person. Please verify before creating a new record.</p>
        </div>

        <div className="duplicate-content">
          <div className="duplicate-warning">
            <h4>⚠️ Possible Duplicate Records Found</h4>
            <p>These patients have similar details and might be the same person:</p>
          </div>

          <div className="duplicate-candidates">
            {duplicateCandidates.map(patient => (
              <div key={patient.id} className="patient-item duplicate">
                <div className="patient-details">
                  <h4>{patient.firstName} {patient.lastName}</h4>
                  <div className="patient-meta">
                    <span><strong>UHID:</strong> {patient.uhid}</span>
                    <span><strong>Age:</strong> {patient.age} years</span>
                    <span><strong>Mobile:</strong> {patient.mobile}</span>
                    <span><strong>Last Visit:</strong> {patient.lastVisit}</span>
                  </div>
                </div>
                <div className="patient-actions">
                  <button
                    onClick={() => handlePatientSelect(patient)}
                    className="btn-primary"
                  >
                    Use Existing Record
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="duplicate-actions">
            <button onClick={handleNewPatient} className="btn-warning">
              Create New Record (Flag as Duplicate)
            </button>
            <button onClick={() => setShowResults(false)} className="btn-secondary">
              Cancel Registration
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Case G: Emergency Admission (Patient Unconscious / No Info Available)
  const renderCaseG_EmergencyAdmission = () => {
    return (
      <div className="search-results case-g">
        <div className="case-header">
          <div className="case-icon">🚨</div>
          <h3>Case G: Emergency Admission</h3>
          <p>Patient is unconscious or unable to provide information. Creating temporary record for emergency care.</p>
        </div>

        <div className="emergency-content">
          <div className="emergency-warning">
            <h4>🚨 Emergency Situation</h4>
            <p>Patient cannot provide personal information. System will generate a temporary UHID for immediate care.</p>
          </div>

          <div className="emergency-actions">
            <button onClick={handleEmergencyRegistration} className="btn-emergency">
              Create Emergency Record
            </button>
            <button onClick={() => setShowResults(false)} className="btn-secondary">
              Cancel Emergency Registration
            </button>
          </div>

          <div className="emergency-info">
            <h4>📋 Emergency Registration Process:</h4>
            <ul>
              <li>Generate temporary UHID (TEMP-YYMMDD-XXXX)</li>
              <li>Create minimal patient record</li>
              <li>Allow immediate appointment booking</li>
              <li>Update details when relatives arrive</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const handleEmergencyRegistration = () => {
    // Generate temporary UHID for emergency
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const tempUHID = `TEMP-${dateStr}-${randomNum}`;

    const emergencyPatient = {
      id: Date.now(),
      uhid: tempUHID,
      firstName: 'Emergency',
      lastName: 'Patient',
      gender: 'unknown',
      dateOfBirth: null,
      age: null,
      mobile: null,
      address: 'Emergency Admission',
      status: 'emergency',
      isEmergency: true,
      createdAt: new Date().toISOString()
    };

    handlePatientSelect(emergencyPatient);
  };

  return (
    <div className="patient-search">
      <div className="search-header">
        <h2>🔍 Patient Search</h2>
        <p>Search for existing patients or register new ones</p>
      </div>

      <div className="search-form">
        <div className="search-type-selector">
          <label>Search By:</label>
          <div className="search-type-buttons">
            <button
              className={searchType === 'uhid' ? 'active' : ''}
              onClick={() => setSearchType('uhid')}
            >
              UHID
            </button>
            <button
              className={searchType === 'mobile' ? 'active' : ''}
              onClick={() => setSearchType('mobile')}
            >
              Mobile
            </button>
            <button
              className={searchType === 'name' ? 'active' : ''}
              onClick={() => setSearchType('name')}
            >
              Name
            </button>
            <button
              className={searchType === 'name_dob' ? 'active' : ''}
              onClick={() => setSearchType('name_dob')}
            >
              Name + DOB
            </button>
          </div>
        </div>

        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getSearchPlaceholder()}
            className="search-input"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="search-button"
          >
            {getSearchButtonText()}
          </button>
        </div>

        {searchError && (
          <div className="search-error">
            <span className="error-icon">⚠️</span>
            {searchError}
          </div>
        )}
      </div>

      {renderSearchResults()}

      <div className="search-footer">
        <div className="quick-actions">
          <h4>Quick Actions:</h4>
          <div className="action-buttons">
            <button onClick={handleNewPatient} className="btn-primary">
              Register New Patient
            </button>
            <button onClick={() => setSearchCase('G')} className="btn-emergency">
              🚨 Emergency Admission
            </button>
            <button onClick={() => window.print()} className="btn-secondary">
              Print Patient List
            </button>
          </div>
        </div>

        {/* Test Cases - For Development Only */}
        {import.meta.env.DEV && (
          <div className="test-cases">
            <h4>🧪 Test Different Cases:</h4>
            <div className="test-buttons">
              <button onClick={() => setSearchCase('A')} className="btn-secondary">
                Test Case A (Exact Match)
              </button>
              <button onClick={() => setSearchCase('B')} className="btn-secondary">
                Test Case B (Multiple Matches)
              </button>
              <button onClick={() => setSearchCase('C')} className="btn-secondary">
                Test Case C (No Match)
              </button>
              <button onClick={() => setSearchCase('D')} className="btn-secondary">
                Test Case D (Name Only)
              </button>
              <button onClick={() => setSearchCase('E')} className="btn-secondary">
                Test Case E (Partial Info)
              </button>
              <button onClick={() => setSearchCase('F')} className="btn-secondary">
                Test Case F (Duplicate)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSearch;
