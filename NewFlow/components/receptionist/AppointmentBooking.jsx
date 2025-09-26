import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import './AppointmentBooking.css';

const AppointmentBooking = ({ selectedPatient, onAppointmentBooked, onCancel }) => {
  const { can } = useRole();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: '',
    appointmentType: 'consultation',
    reason: '',
    priority: 'normal',
    notes: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [appointmentId, setAppointmentId] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');

  // Mock doctors data
  const mockDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      consultationFee: 500,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: [
        { time: '09:00', duration: 30, maxPatients: 1 },
        { time: '09:30', duration: 30, maxPatients: 1 },
        { time: '10:00', duration: 30, maxPatients: 1 },
        { time: '10:30', duration: 30, maxPatients: 1 },
        { time: '11:00', duration: 30, maxPatients: 1 },
        { time: '11:30', duration: 30, maxPatients: 1 },
        { time: '14:00', duration: 30, maxPatients: 1 },
        { time: '14:30', duration: 30, maxPatients: 1 },
        { time: '15:00', duration: 30, maxPatients: 1 },
        { time: '15:30', duration: 30, maxPatients: 1 }
      ]
    },
    {
      id: 2,
      name: 'Dr. Mike Brown',
      specialization: 'General Medicine',
      consultationFee: 300,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timeSlots: [
        { time: '09:00', duration: 20, maxPatients: 1 },
        { time: '09:20', duration: 20, maxPatients: 1 },
        { time: '09:40', duration: 20, maxPatients: 1 },
        { time: '10:00', duration: 20, maxPatients: 1 },
        { time: '10:20', duration: 20, maxPatients: 1 },
        { time: '10:40', duration: 20, maxPatients: 1 },
        { time: '11:00', duration: 20, maxPatients: 1 },
        { time: '11:20', duration: 20, maxPatients: 1 },
        { time: '11:40', duration: 20, maxPatients: 1 },
        { time: '14:00', duration: 20, maxPatients: 1 },
        { time: '14:20', duration: 20, maxPatients: 1 },
        { time: '14:40', duration: 20, maxPatients: 1 },
        { time: '15:00', duration: 20, maxPatients: 1 },
        { time: '15:20', duration: 20, maxPatients: 1 },
        { time: '15:40', duration: 20, maxPatients: 1 }
      ]
    },
    {
      id: 3,
      name: 'Dr. Lisa Wilson',
      specialization: 'Pediatrics',
      consultationFee: 400,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: [
        { time: '10:00', duration: 30, maxPatients: 1 },
        { time: '10:30', duration: 30, maxPatients: 1 },
        { time: '11:00', duration: 30, maxPatients: 1 },
        { time: '11:30', duration: 30, maxPatients: 1 },
        { time: '15:00', duration: 30, maxPatients: 1 },
        { time: '15:30', duration: 30, maxPatients: 1 },
        { time: '16:00', duration: 30, maxPatients: 1 },
        { time: '16:30', duration: 30, maxPatients: 1 }
      ]
    }
  ];

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id
      }));
    }
    setDoctors(mockDoctors);
  }, [selectedPatient]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      loadAvailableSlots();
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const loadAvailableSlots = async () => {
    const doctor = doctors.find(d => d.id === parseInt(formData.doctorId));
    if (!doctor) return;

    setSelectedDoctor(doctor);

    // Mock available slots (in real app, this would be an API call)
    const selectedDate = new Date(formData.appointmentDate);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

    if (doctor.availableDays.includes(dayName)) {
      // Simulate some slots being booked
      const availableSlots = doctor.timeSlots.filter((slot, index) => {
        // Mock: 70% chance slot is available
        return Math.random() > 0.3;
      });
      setAvailableSlots(availableSlots);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Please select appointment date';
    if (!formData.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    if (!formData.appointmentType) newErrors.appointmentType = 'Please select appointment type';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAppointmentId = () => {
    const timestamp = Date.now();
    return `APT-${timestamp}`;
  };

  const generateTokenNumber = async (doctorId, date) => {
    // Mock token generation (in real app, this would be an API call)
    const baseToken = Math.floor(Math.random() * 50) + 1;
    return baseToken.toString().padStart(3, '0');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!can('CREATE_APPOINTMENTS')) {
      alert('You do not have permission to book appointments');
      return;
    }

    setIsLoading(true);

    try {
      const appointmentId = generateAppointmentId();
      const tokenNumber = await generateTokenNumber(formData.doctorId, formData.appointmentDate);

      setAppointmentId(appointmentId);
      setTokenNumber(tokenNumber);

      const appointmentData = {
        ...formData,
        appointmentId: appointmentId,
        tokenNumber: tokenNumber,
        patient: selectedPatient,
        doctor: selectedDoctor,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/newflow/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Appointment booked successfully!\nAppointment ID: ${appointmentId}\nToken Number: ${tokenNumber}`);
        onAppointmentBooked(result.appointment);
      } else {
        const errorData = await response.json();
        alert(`Booking failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from today
    return maxDate.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="appointment-booking">
      <div className="booking-header">
        <h2>📅 Book Appointment</h2>
        <p>Book an appointment for {selectedPatient?.firstName} {selectedPatient?.lastName}</p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        {/* Patient Information Display */}
        <div className="form-section">
          <h3>👤 Patient Information</h3>
          <div className="patient-display">
            <div className="patient-info">
              <h4>{selectedPatient?.firstName} {selectedPatient?.lastName}</h4>
              <p><strong>UHID:</strong> {selectedPatient?.uhid}</p>
              <p><strong>Age:</strong> {selectedPatient?.age} years</p>
              <p><strong>Mobile:</strong> {selectedPatient?.mobile}</p>
            </div>
          </div>
        </div>

        {/* Doctor Selection */}
        <div className="form-section">
          <h3>👨‍⚕️ Select Doctor</h3>
          <div className="doctors-grid">
            {doctors.map(doctor => (
              <div
                key={doctor.id}
                className={`doctor-card ${formData.doctorId === doctor.id.toString() ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, doctorId: doctor.id.toString() }))}
              >
                <div className="doctor-info">
                  <h4>{doctor.name}</h4>
                  <p className="specialization">{doctor.specialization}</p>
                  <p className="fee">₹{doctor.consultationFee} consultation fee</p>
                </div>
                <div className="doctor-availability">
                  <p>Available: {doctor.availableDays.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
          {errors.doctorId && <span className="error-text">{errors.doctorId}</span>}
        </div>

        {/* Date and Time Selection */}
        <div className="form-section">
          <h3>📅 Select Date & Time</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appointmentDate">Appointment Date *</label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                className={errors.appointmentDate ? 'error' : ''}
              />
              {errors.appointmentDate && <span className="error-text">{errors.appointmentDate}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="appointmentType">Appointment Type *</label>
              <select
                id="appointmentType"
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className={errors.appointmentType ? 'error' : ''}
              >
                <option value="">Select Type</option>
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="check-up">Check-up</option>
                <option value="emergency">Emergency</option>
              </select>
              {errors.appointmentType && <span className="error-text">{errors.appointmentType}</span>}
            </div>
          </div>

          {/* Available Time Slots */}
          {formData.appointmentDate && availableSlots.length > 0 && (
            <div className="time-slots-section">
              <h4>Available Time Slots for {formatDate(formData.appointmentDate)}</h4>
              <div className="time-slots-grid">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`time-slot ${formData.timeSlot === slot.time ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot.time }))}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
              {errors.timeSlot && <span className="error-text">{errors.timeSlot}</span>}
            </div>
          )}

          {formData.appointmentDate && availableSlots.length === 0 && (
            <div className="no-slots-message">
              <p>No available slots for the selected date. Please choose a different date.</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h3>ℹ️ Additional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason for Visit</label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Brief reason for the appointment"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes"
              rows="3"
            />
          </div>
        </div>

        {/* Generated IDs Display */}
        {(appointmentId || tokenNumber) && (
          <div className="generated-ids">
            <h4>🎫 Generated Information</h4>
            <div className="id-display">
              {appointmentId && <div className="id-item">Appointment ID: {appointmentId}</div>}
              {tokenNumber && <div className="id-item">Token Number: {tokenNumber}</div>}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentBooking;
