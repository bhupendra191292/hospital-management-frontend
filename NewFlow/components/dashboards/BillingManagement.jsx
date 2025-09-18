import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { usePerformanceMonitor } from '../../hooks/usePerformance';
import { 
  getNewFlowBills,
  createNewFlowBill,
  updateNewFlowBill,
  deleteNewFlowBill,
  getNewFlowPatients,
  getAllNewFlowDoctors,
  getNewFlowVisits
} from '../../services/api';
import { Button, Modal, StatusBadge } from '../ui';
import './BillingManagement.css';

const BillingManagement = () => {
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('BillingManagement');
  
  const { can } = useRole();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modals
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Form states
  const [newBill, setNewBill] = useState({
    patientId: '',
    doctorId: '',
    visitId: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: '',
    status: 'pending'
  });
  
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Load bills from API
      const billsResponse = await getNewFlowBills();
      if (billsResponse.data.success) {
        setBills(billsResponse.data.data || []);
      }

      // Load patients from API
      const patientsResponse = await getNewFlowPatients({ limit: 1000 });
      if (patientsResponse.data.success) {
        const patients = patientsResponse.data.data.patients || [];
        setPatients(patients.map(patient => ({
          id: patient._id,
          name: patient.name,
          mobile: patient.mobile,
          uhid: patient.uhid
        })));
      }

      // Load doctors from API
      const doctorsResponse = await getAllNewFlowDoctors();
      if (doctorsResponse.data.success) {
        const doctors = doctorsResponse.data.data || [];
        setDoctors(doctors.map(doctor => ({
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization
        })));
      }

      // Load visits from API
      const visitsResponse = await getNewFlowVisits({ limit: 1000 });
      if (visitsResponse.data.success) {
        const visits = visitsResponse.data.data || [];
        setVisits(visits.map(visit => ({
          id: visit._id,
          patientName: visit.patientName,
          doctorName: visit.doctorName,
          visitType: visit.visitType,
          date: visit.date
        })));
      }

      // Calculate statistics
      const billsData = billsResponse.data.success ? billsResponse.data.data || [] : [];
      const totalBills = billsData.length;
      const paidBills = billsData.filter(bill => bill.status === 'paid').length;
      const pendingBills = billsData.filter(bill => bill.status === 'pending').length;
      const totalRevenue = billsData.reduce((sum, bill) => sum + (bill.total || 0), 0);
      const pendingAmount = billsData.reduce((sum, bill) => sum + (bill.balance || 0), 0);

      setStats({
        totalBills,
        paidBills,
        pendingBills,
        totalRevenue,
        pendingAmount
      });

    } catch (error) {
      console.error('Error loading billing data:', error);
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && bill.billDate === new Date().toISOString().split('T')[0]) ||
                       (dateFilter === 'week' && isWithinWeek(bill.billDate)) ||
                       (dateFilter === 'month' && isWithinMonth(bill.billDate));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const isWithinWeek = (date) => {
    const billDate = new Date(date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return billDate >= weekAgo;
  };

  const isWithinMonth = (date) => {
    const billDate = new Date(date);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return billDate >= monthAgo;
  };

  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  const handleCreateBill = () => {
    setNewBill({
      patientId: '',
      doctorId: '',
      visitId: '',
      billDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: '',
      status: 'pending'
    });
    setShowCreateBill(true);
  };

  const handleAddBillItem = () => {
    setNewBill(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const handleBillItemChange = (index, field, value) => {
    setNewBill(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate amount
      if (field === 'quantity' || field === 'rate') {
        newItems[index].amount = newItems[index].quantity * newItems[index].rate;
      }
      
      // Recalculate totals
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax - prev.discount;
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        tax,
        total
      };
    });
  };

  const handleRemoveBillItem = (index) => {
    setNewBill(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax - prev.discount;
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        tax,
        total
      };
    });
  };

  const handleSaveBill = () => {
    const bill = {
      ...newBill,
      id: `BILL-${String(bills.length + 1).padStart(3, '0')}`,
      patientName: patients.find(p => p.id === newBill.patientId)?.name || '',
      doctorName: doctors.find(d => d.id === newBill.doctorId)?.name || '',
      paidAmount: 0,
      balance: newBill.total,
      createdAt: new Date().toISOString()
    };
    
    setBills(prev => [bill, ...prev]);
    setShowCreateBill(false);
  };

  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setPaymentData({
      amount: bill.balance,
      paymentMethod: 'cash',
      transactionId: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handleProcessPayment = () => {
    if (selectedBill) {
      setBills(prev => prev.map(bill => 
        bill.id === selectedBill.id 
          ? {
              ...bill,
              paidAmount: bill.paidAmount + paymentData.amount,
              balance: bill.balance - paymentData.amount,
              status: bill.balance - paymentData.amount <= 0 ? 'paid' : 'partial'
            }
          : bill
      ));
      setShowPaymentModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending' },
      partial: { color: 'info', text: 'Partial' },
      paid: { color: 'success', text: 'Paid' },
      overdue: { color: 'danger', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <StatusBadge color={config.color}>{config.text}</StatusBadge>;
  };

  if (loading) {
    return (
      <div className="billing-loading">
        <div className="loading-spinner"></div>
        <p>Loading billing data...</p>
      </div>
    );
  }

  return (
    <div className="billing-management">
      <div className="billing-header">
        <h1>💰 Billing Management</h1>
        <div className="billing-actions">
          <Button onClick={handleCreateBill} variant="primary">
            + Create New Bill
          </Button>
        </div>
      </div>

      <div className="billing-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="billing-stats">
        <div className="stat-card">
          <h3>₹{bills.reduce((sum, bill) => sum + bill.total, 0).toLocaleString()}</h3>
          <p>Total Billing</p>
        </div>
        <div className="stat-card">
          <h3>₹{bills.reduce((sum, bill) => sum + bill.paidAmount, 0).toLocaleString()}</h3>
          <p>Total Collected</p>
        </div>
        <div className="stat-card">
          <h3>₹{bills.reduce((sum, bill) => sum + bill.balance, 0).toLocaleString()}</h3>
          <p>Outstanding</p>
        </div>
        <div className="stat-card">
          <h3>{bills.filter(bill => bill.status === 'pending').length}</h3>
          <p>Pending Bills</p>
        </div>
      </div>

      <div className="bills-table">
        <table>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBills.map(bill => (
              <tr key={bill.id}>
                <td>{bill.id}</td>
                <td>{bill.patientName}</td>
                <td>{bill.doctorName}</td>
                <td>{new Date(bill.billDate).toLocaleDateString('en-IN')}</td>
                <td>₹{bill.total.toLocaleString()}</td>
                <td>₹{bill.paidAmount.toLocaleString()}</td>
                <td>₹{bill.balance.toLocaleString()}</td>
                <td>{getStatusBadge(bill.status)}</td>
                <td>
                  <div className="action-buttons">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowBillDetails(true);
                      }}
                    >
                      View
                    </Button>
                    {bill.balance > 0 && (
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => handlePayment(bill)}
                      >
                        Pay
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Bill Modal */}
      <Modal
        isOpen={showCreateBill}
        onClose={() => setShowCreateBill(false)}
        title="Create New Bill"
        size="large"
      >
        <div className="bill-form">
          <div className="form-row">
            <div className="form-group">
              <label>Patient</label>
              <select
                value={newBill.patientId}
                onChange={(e) => setNewBill(prev => ({ ...prev, patientId: e.target.value }))}
                className="form-input"
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.mobile})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Doctor</label>
              <select
                value={newBill.doctorId}
                onChange={(e) => setNewBill(prev => ({ ...prev, doctorId: e.target.value }))}
                className="form-input"
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bill Date</label>
              <input
                type="date"
                value={newBill.billDate}
                onChange={(e) => setNewBill(prev => ({ ...prev, billDate: e.target.value }))}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={newBill.dueDate}
                onChange={(e) => setNewBill(prev => ({ ...prev, dueDate: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="bill-items">
            <div className="items-header">
              <h3>Bill Items</h3>
              <Button onClick={handleAddBillItem} size="sm" variant="outline">
                + Add Item
              </Button>
            </div>
            
            {newBill.items.map((item, index) => (
              <div key={index} className="bill-item">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleBillItemChange(index, 'description', e.target.value)}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleBillItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="form-input"
                  min="1"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => handleBillItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  value={item.amount}
                  readOnly
                  className="form-input readonly"
                />
                <Button 
                  onClick={() => handleRemoveBillItem(index)}
                  size="sm"
                  variant="danger"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="bill-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{newBill.subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax (10%):</span>
              <span>₹{newBill.tax.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Discount:</span>
              <input
                type="number"
                value={newBill.discount}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0;
                  setNewBill(prev => ({
                    ...prev,
                    discount,
                    total: prev.subtotal + prev.tax - discount
                  }));
                }}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div className="total-row total">
              <span>Total:</span>
              <span>₹{newBill.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={newBill.notes}
              onChange={(e) => setNewBill(prev => ({ ...prev, notes: e.target.value }))}
              className="form-input"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          <div className="modal-actions">
            <Button variant="outline" onClick={() => setShowCreateBill(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveBill}>
              Create Bill
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bill Details Modal */}
      <Modal
        isOpen={showBillDetails}
        onClose={() => setShowBillDetails(false)}
        title={`Bill Details - ${selectedBill?.id}`}
        size="large"
      >
        {selectedBill && (
          <div className="bill-details">
            <div className="bill-header">
              <div className="bill-info">
                <h3>Bill #{selectedBill.id}</h3>
                <p>Date: {new Date(selectedBill.billDate).toLocaleDateString('en-IN')}</p>
                <p>Due: {new Date(selectedBill.dueDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="bill-status">
                {getStatusBadge(selectedBill.status)}
              </div>
            </div>

            <div className="bill-parties">
              <div className="party-info">
                <h4>Patient</h4>
                <p>{selectedBill.patientName}</p>
              </div>
              <div className="party-info">
                <h4>Doctor</h4>
                <p>{selectedBill.doctorName}</p>
              </div>
            </div>

            <div className="bill-items-details">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.rate.toFixed(2)}</td>
                      <td>₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bill-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{selectedBill.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>₹{selectedBill.tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Discount:</span>
                <span>₹{selectedBill.discount.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{selectedBill.total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Paid:</span>
                <span>₹{selectedBill.paidAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Balance:</span>
                <span>₹{selectedBill.balance.toFixed(2)}</span>
              </div>
            </div>

            {selectedBill.notes && (
              <div className="bill-notes">
                <h4>Notes</h4>
                <p>{selectedBill.notes}</p>
              </div>
            )}

            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowBillDetails(false)}>
                Close
              </Button>
              {selectedBill.balance > 0 && (
                <Button variant="primary" onClick={() => handlePayment(selectedBill)}>
                  Process Payment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Process Payment"
        size="medium"
      >
        {selectedBill && (
          <div className="payment-form">
            <div className="payment-info">
              <h3>Bill #{selectedBill.id}</h3>
              <p>Patient: {selectedBill.patientName}</p>
              <p>Total Amount: ₹{selectedBill.total.toFixed(2)}</p>
              <p>Already Paid: ₹{selectedBill.paidAmount.toFixed(2)}</p>
              <p>Balance: ₹{selectedBill.balance.toFixed(2)}</p>
            </div>

            <div className="form-group">
              <label>Payment Amount</label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  amount: parseFloat(e.target.value) || 0 
                }))}
                className="form-input"
                max={selectedBill.balance}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  paymentMethod: e.target.value 
                }))}
                className="form-input"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="form-group">
              <label>Transaction ID (if applicable)</label>
              <input
                type="text"
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  transactionId: e.target.value 
                }))}
                className="form-input"
                placeholder="Enter transaction ID"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                className="form-input"
                rows="3"
                placeholder="Payment notes..."
              />
            </div>

            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleProcessPayment}
                disabled={paymentData.amount <= 0 || paymentData.amount > selectedBill.balance}
              >
                Process Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillingManagement;
