import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from './contexts/RoleContext';
import { newFlowLogin, newFlowForgotPassword } from './services/api';
import { useErrorHandler } from './hooks/useErrorHandler';
import './Login.css';

const NewFlowLogin = () => {
  const { login } = useRole();
  const [formData, setFormData] = useState({
    loginField: '9876543210',
    password: 'password123',
    tenantId: 'test-tenant'
  });
  const { errors, isLoading, setErrors, setIsLoading, handleApiError, clearAllErrors } = useErrorHandler();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    loginField: '',
    tenantId: 'test-tenant'
  });
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      const response = await newFlowForgotPassword(forgotPasswordData.loginField, forgotPasswordData.tenantId);
      
      if (response.data.success) {
        setForgotPasswordMessage(response.data.message);
      } else {
        setForgotPasswordMessage(response.data.message);
      }
    } catch (err) {
      setForgotPasswordMessage('Unable to process request. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearAllErrors();

    try {
      const response = await newFlowLogin(formData.loginField, formData.password, formData.tenantId);
      
      if (response.data.success) {
        localStorage.setItem('newflow_token', response.data.token);
        localStorage.setItem('newflow_user', JSON.stringify(response.data.user));
        
        // Update RoleContext with the new user data
        login(response.data.user);
        
        navigate('/dashboard');
      } else {
        setErrors({ submit: response.data.message || 'Login failed' });
      }
    } catch (error) {
      handleApiError(error, 'NewFlowLogin.handleSubmit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="newflow-login-container">
      <div className="newflow-login-card">
        <div className="newflow-header">
          <div className="logo"></div>
          <h1>Hospital Management</h1>
          <p>Secure access to your healthcare system</p>
        </div>

        <form onSubmit={handleSubmit} className="newflow-form">
          <div className="form-group">
            <label htmlFor="tenantId">Tenant ID</label>
            <input
              type="text"
              id="tenantId"
              name="tenantId"
              value={formData.tenantId}
              onChange={handleChange}
              required
              placeholder="Enter your tenant ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="loginField">Email / Phone / User ID / Username</label>
            <input
              type="text"
              id="loginField"
              name="loginField"
              value={formData.loginField}
              onChange={handleChange}
              required
              placeholder="Enter email, phone, user ID, or username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <button 
            type="submit" 
            className="newflow-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="forgot-password-section">
          <button 
            type="button"
            className="forgot-password-btn"
            onClick={() => setShowForgotPassword(true)}
          >
            🔐 Forgot Password?
          </button>
        </div>

        <div className="test-credentials">
          <h4>🧪 Test Credentials</h4>
          <div className="credential-item">
            <strong>Tenant ID:</strong> test-tenant
          </div>
          <div className="credential-item">
            <strong>Password:</strong> password123
          </div>
          <div className="credential-item">
            <strong>Login Options:</strong> Email, Phone (10 digits), Doctor ID (DOC001), Patient Mobile
          </div>
          
          <div className="role-options">
            <h5>Choose a Role to Test:</h5>
            <div className="role-buttons">
              <button 
                type="button"
                className="role-btn"
                onClick={() => setFormData({
                  loginField: 'admin@newflow.com',
                  password: 'password123',
                  tenantId: 'test-tenant'
                })}
              >
                👨‍💼 Admin
              </button>
              <button 
                type="button"
                className="role-btn"
                onClick={() => setFormData({
                  loginField: '9876543210',
                  password: 'password123',
                  tenantId: 'test-tenant'
                })}
              >
                👨‍⚕️ Dr. Sarah Johnson (Cardiology)
              </button>
              <button 
                type="button"
                className="role-btn"
                onClick={() => setFormData({
                  loginField: '9876543211',
                  password: 'password123',
                  tenantId: 'test-tenant'
                })}
              >
                👨‍⚕️ Dr. Michael Chen (Neurology)
              </button>
              <button 
                type="button"
                className="role-btn"
                onClick={() => setFormData({
                  loginField: '9876543212',
                  password: 'password123',
                  tenantId: 'test-tenant'
                })}
              >
                👩‍⚕️ Dr. Lisa Wilson (Pediatrics)
              </button>
              <button 
                type="button"
                className="role-btn"
                onClick={() => setFormData({
                  loginField: '9123456780',
                  password: 'password123',
                  tenantId: 'test-tenant'
                })}
              >
                👤 John Smith (Patient)
              </button>
              <button 
                type="button"
                className="role-btn"
                onClick={() => setFormData({
                  loginField: '9123456782',
                  password: 'password123',
                  tenantId: 'test-tenant'
                })}
              >
                👤 Jane Doe (Patient)
              </button>
              <button 
                type="button"
                className="role-btn"
                onClick={() => setFormData({
                  loginField: 'DOC001',
                  password: 'password123',
                  tenantId: 'test-tenant'
                })}
              >
                🆔 Dr. Sarah Johnson (DOC001)
              </button>
              <button 
                type="button"
                className="role-btn super-admin"
                onClick={() => setFormData({
                  loginField: 'super@newflow.com',
                  password: 'password123',
                  tenantId: 'test-tenant'
                })}
              >
                👑 Super Admin
              </button>
            </div>
          </div>
        </div>

        <div className="newflow-footer">
          <p>Need help? Contact your system administrator</p>
          <div className="footer-links">
            <button 
              type="button"
              className="footer-link"
              onClick={() => navigate('/doctor-register')}
            >
              👨‍⚕️ Doctor Registration
            </button>
          </div>
          <small>© 2024 Hospital Management System. All rights reserved.</small>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔐 Forgot Password</h3>
              <button 
                className="modal-close"
                onClick={() => setShowForgotPassword(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Enter your email, phone number, or user ID to receive password reset instructions.</p>
              
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label htmlFor="forgot-tenantId">Tenant ID</label>
                  <input
                    type="text"
                    id="forgot-tenantId"
                    name="tenantId"
                    value={forgotPasswordData.tenantId}
                    onChange={handleForgotPasswordChange}
                    required
                    placeholder="Enter your tenant ID"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="forgot-loginField">Email / Phone / User ID / Username</label>
                  <input
                    type="text"
                    id="forgot-loginField"
                    name="loginField"
                    value={forgotPasswordData.loginField}
                    onChange={handleForgotPasswordChange}
                    required
                    placeholder="Enter your email, phone, user ID, or username"
                  />
                </div>

                {forgotPasswordMessage && (
                  <div className={`message ${forgotPasswordMessage.includes('sent') ? 'success' : 'error'}`}>
                    {forgotPasswordMessage}
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Instructions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewFlowLogin;
