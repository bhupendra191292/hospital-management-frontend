import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerTenant } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './TenantRegistration.css';

const TenantRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'hospital',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    businessLicense: '',
    taxId: '',
    establishedDate: '',
    adminName: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
    subscriptionPlan: 'free'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.adminPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      
      const response = await registerTenant({
        ...formData,
        address: `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.zipCode}, ${formData.address.country}`
      });

      if (response.data.success) {
        // Store tenant info and redirect to login
        localStorage.setItem('tenantInfo', JSON.stringify(response.data.data.tenant));
        alert('Hospital/Clinic registered successfully! You can now login.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const healthcareTypes = [
    { value: 'hospital', label: '🏥 Hospital', description: 'Full-service medical facility' },
    { value: 'clinic', label: '🏥 Clinic', description: 'Outpatient medical facility' },
    { value: 'medical_center', label: '🏥 Medical Center', description: 'Multi-specialty facility' },
    { value: 'pharmacy', label: '💊 Pharmacy', description: 'Drug store and consultation' },
    { value: 'laboratory', label: '🔬 Laboratory', description: 'Medical testing facility' }
  ];

  const subscriptionPlans = [
    { value: 'free', label: 'Free', description: 'Basic features, 5 users, 100 patients', price: '$0/month' },
    { value: 'basic', label: 'Basic', description: 'Standard features, 10 users, 500 patients', price: '$99/month' },
    { value: 'professional', label: 'Professional', description: 'Advanced features, 25 users, 2000 patients', price: '$299/month' },
    { value: 'enterprise', label: 'Enterprise', description: 'Full features, unlimited users, unlimited patients', price: '$599/month' }
  ];

  return (
    <div className="tenant-registration">
      <div className="registration-container">
        <div className="registration-header">
          <h1>🏥 Register Your Healthcare Facility</h1>
          <p>Join thousands of healthcare providers using our comprehensive management system</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Healthcare Facility Information */}
          <div className="form-section">
            <h3>🏥 Healthcare Facility Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Facility Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter facility name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Facility Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  {healthcareTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="facility@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>
              
              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="State"
                />
              </div>
              
              <div className="form-group">
                <label>ZIP/Postal Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  placeholder="ZIP Code"
                />
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Business License Number</label>
                <input
                  type="text"
                  name="businessLicense"
                  value={formData.businessLicense}
                  onChange={handleInputChange}
                  placeholder="License number"
                />
              </div>
              
              <div className="form-group">
                <label>Tax ID</label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="Tax ID"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Established Date</label>
              <input
                type="date"
                name="establishedDate"
                value={formData.establishedDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Administrator Information */}
          <div className="form-section">
            <h3>👤 Administrator Account</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Admin Name *</label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  placeholder="Administrator name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Admin Phone *</label>
                <input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="form-section">
            <h3>💳 Subscription Plan</h3>
            
            <div className="subscription-plans">
              {subscriptionPlans.map(plan => (
                <div
                  key={plan.value}
                  className={`plan-card ${formData.subscriptionPlan === plan.value ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, subscriptionPlan: plan.value }))}
                >
                  <div className="plan-header">
                    <h4>{plan.label}</h4>
                    <div className="plan-price">{plan.price}</div>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-features">
                    {plan.value === 'free' && (
                      <ul>
                        <li>✓ Basic patient management</li>
                        <li>✓ Appointment scheduling</li>
                        <li>✓ Medical records</li>
                        <li>✓ 5 users maximum</li>
                        <li>✓ 100 patients maximum</li>
                      </ul>
                    )}
                    {plan.value === 'basic' && (
                      <ul>
                        <li>✓ All Free features</li>
                        <li>✓ Advanced analytics</li>
                        <li>✓ Email notifications</li>
                        <li>✓ 10 users maximum</li>
                        <li>✓ 500 patients maximum</li>
                      </ul>
                    )}
                    {plan.value === 'professional' && (
                      <ul>
                        <li>✓ All Basic features</li>
                        <li>✓ Custom branding</li>
                        <li>✓ API access</li>
                        <li>✓ Priority support</li>
                        <li>✓ 25 users maximum</li>
                        <li>✓ 2000 patients maximum</li>
                      </ul>
                    )}
                    {plan.value === 'enterprise' && (
                      <ul>
                        <li>✓ All Professional features</li>
                        <li>✓ Custom domain</li>
                        <li>✓ White-label solution</li>
                        <li>✓ Dedicated support</li>
                        <li>✓ Unlimited users</li>
                        <li>✓ Unlimited patients</li>
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                '🏥 Create Healthcare Facility Account'
              )}
            </button>
          </div>

          <div className="registration-footer">
            <p>Already have an account? <a href="/login">Sign in here</a></p>
            <p>By creating an account, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantRegistration;
