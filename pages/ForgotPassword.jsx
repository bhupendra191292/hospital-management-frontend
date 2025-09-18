import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';

const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetRequest = (e) => {
    e.preventDefault();

    // Simulate a server response
    setMessage(`📲 Reset link sent to phone: ${phone}`);
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto' }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleResetRequest}>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          placeholder="Enter your registered phone (numbers only)"
          required
        />
        <br /><br />
        <button type="submit">Send Reset Link</button>
      </form>

      {message && (
        <p style={{ marginTop: '15px', color: 'green' }}>{message}</p>
      )}
    </div>
  );
};

export default ForgotPassword;
