import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { 
  getNewFlowDashboardStats,
  getNewFlowPatients,
  getAllNewFlowDoctors,
  getNewFlowVisits
} from '../../services/api';
import { usePerformanceMonitor } from '../../hooks/usePerformance';
import { Button } from '../ui';
import './ReportsAnalytics.css';

const ReportsAnalytics = () => {
  // Performance monitoring
  const { renderCount } = usePerformanceMonitor('ReportsAnalytics');
  
  const { can } = useRole();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReport, setSelectedReport] = useState('overview');
  
  // Data states
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalVisits: 0,
    totalRevenue: 0,
    averageVisitDuration: 0,
    patientSatisfaction: 0
  });
  
  const [patientData, setPatientData] = useState([]);
  const [doctorData, setDoctorData] = useState([]);
  const [visitData, setVisitData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  
  // Chart data
  const [chartData, setChartData] = useState({
    patientGrowth: [],
    revenueTrend: [],
    departmentDistribution: [],
    visitTypes: [],
    monthlyStats: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load dashboard stats
      const statsResponse = await getNewFlowDashboardStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Load patient data
      const patientsResponse = await getNewFlowPatients({ limit: 1000 });
      if (patientsResponse.data.success) {
        setPatientData(patientsResponse.data.data.patients || []);
      }

      // Load doctor data
      const doctorsResponse = await getAllNewFlowDoctors();
      if (doctorsResponse.data.success) {
        setDoctorData(doctorsResponse.data.data || []);
      }

      // Load visit data
      const visitsResponse = await getNewFlowVisits({ limit: 1000 });
      if (visitsResponse.data.success) {
        setVisitData(visitsResponse.data.data || []);
      }

      // Process chart data
      processChartData(patientsResponse.data.data.patients || [], visitsResponse.data.data || []);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (patients, visits) => {
    // Process patient growth data
    const patientGrowth = processPatientGrowth(patients);
    
    // Process revenue trend data
    const revenueTrend = processRevenueTrend(visits);
    
    // Process department distribution
    const departmentDistribution = processDepartmentDistribution(visits);
    
    // Process visit types
    const visitTypes = processVisitTypes(visits);
    
    // Process monthly stats
    const monthlyStats = processMonthlyStats(visits);

    setChartData({
      patientGrowth,
      revenueTrend,
      departmentDistribution,
      visitTypes,
      monthlyStats
    });
  };

  const processPatientGrowth = (patients) => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = patients.filter(patient => 
        patient.registrationDate && patient.registrationDate.startsWith(dateStr)
      ).length;
      
      last30Days.push({
        date: dateStr,
        count: count
      });
    }
    
    return last30Days;
  };

  const processRevenueTrend = (visits) => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const revenue = visits
        .filter(visit => visit.appointmentDate && visit.appointmentDate.startsWith(dateStr))
        .reduce((sum, visit) => sum + (visit.estimatedCost || 0), 0);
      
      last30Days.push({
        date: dateStr,
        revenue: revenue
      });
    }
    
    return last30Days;
  };

  const processDepartmentDistribution = (visits) => {
    const departmentCounts = {};
    
    visits.forEach(visit => {
      const dept = visit.department || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
    
    return Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count
    }));
  };

  const processVisitTypes = (visits) => {
    const typeCounts = {};
    
    visits.forEach(visit => {
      const type = visit.visitType || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count
    }));
  };

  const processMonthlyStats = (visits) => {
    const monthlyData = {};
    
    visits.forEach(visit => {
      if (visit.appointmentDate) {
        const month = visit.appointmentDate.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { visits: 0, revenue: 0 };
        }
        monthlyData[month].visits += 1;
        monthlyData[month].revenue += visit.estimatedCost || 0;
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      default: return 'Last 30 Days';
    }
  };

  // Chart Components
  const LineChart = ({ data, title, color = '#3b82f6' }) => {
    if (!data || data.length === 0) return <div className="chart-placeholder">No data available</div>;
    
    const maxValue = Math.max(...data.map(d => d.count || d.revenue || 0));
    const minValue = Math.min(...data.map(d => d.count || d.revenue || 0));
    const range = maxValue - minValue || 1;
    
    return (
      <div className="line-chart">
        <div className="chart-header">
          <h4>{title}</h4>
          <div className="chart-legend">
            <span className="legend-dot" style={{ backgroundColor: color }}></span>
            <span>Trend</span>
          </div>
        </div>
        <div className="chart-container">
          <svg viewBox="0 0 400 200" className="chart-svg">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1="40" y1={40 + ratio * 120}
                x2="380" y2={40 + ratio * 120}
                stroke="#e5e7eb" strokeWidth="1"
              />
            ))}
            
            {/* Data line */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={data.map((d, i) => {
                const x = 40 + (i / (data.length - 1)) * 340;
                const y = 160 - ((d.count || d.revenue || 0) - minValue) / range * 120;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Area fill */}
            <polygon
              fill={`url(#gradient-${title})`}
              points={`40,160 ${data.map((d, i) => {
                const x = 40 + (i / (data.length - 1)) * 340;
                const y = 160 - ((d.count || d.revenue || 0) - minValue) / range * 120;
                return `${x},${y}`;
              }).join(' ')} 380,160`}
            />
            
            {/* Data points */}
            {data.map((d, i) => {
              const x = 40 + (i / (data.length - 1)) * 340;
              const y = 160 - ((d.count || d.revenue || 0) - minValue) / range * 120;
              return (
                <circle
                  key={i}
                  cx={x} cy={y} r="3"
                  fill={color}
                  className="data-point"
                />
              );
            })}
          </svg>
          
          {/* X-axis labels */}
          <div className="x-axis-labels">
            {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((d, i) => (
              <span key={i} className="x-label">
                {new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BarChart = ({ data, title, color = '#10b981' }) => {
    if (!data || data.length === 0) return <div className="chart-placeholder">No data available</div>;
    
    const maxValue = Math.max(...data.map(d => d.count || 0));
    
    return (
      <div className="bar-chart">
        <div className="chart-header">
          <h4>{title}</h4>
        </div>
        <div className="chart-container">
          <div className="bars-container">
            {data.map((item, i) => {
              const height = (item.count / maxValue) * 100;
              return (
                <div key={i} className="bar-group">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${height}%`,
                      backgroundColor: color,
                      opacity: 0.8
                    }}
                    title={`${item.department || item.type}: ${item.count}`}
                  ></div>
                  <div className="bar-label">
                    {(item.department || item.type || '').substring(0, 8)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const PieChart = ({ data, title }) => {
    if (!data || data.length === 0) return <div className="chart-placeholder">No data available</div>;
    
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    let currentAngle = 0;
    const segments = data.map((item, i) => {
      const percentage = (item.count / total) * 100;
      const angle = (item.count / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;
      
      return {
        ...item,
        percentage: percentage.toFixed(1),
        startAngle,
        endAngle,
        color: colors[i % colors.length]
      };
    });
    
    return (
      <div className="pie-chart">
        <div className="chart-header">
          <h4>{title}</h4>
        </div>
        <div className="chart-container">
          <div className="pie-container">
            <svg viewBox="0 0 200 200" className="pie-svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
              {segments.map((segment, i) => {
                const startAngleRad = (segment.startAngle - 90) * Math.PI / 180;
                const endAngleRad = (segment.endAngle - 90) * Math.PI / 180;
                const largeArcFlag = segment.endAngle - segment.startAngle <= 180 ? "0" : "1";
                
                const x1 = 100 + 80 * Math.cos(startAngleRad);
                const y1 = 100 + 80 * Math.sin(startAngleRad);
                const x2 = 100 + 80 * Math.cos(endAngleRad);
                const y2 = 100 + 80 * Math.sin(endAngleRad);
                
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                return (
                  <path
                    key={i}
                    d={pathData}
                    fill={segment.color}
                    className="pie-segment"
                    title={`${segment.department || segment.type}: ${segment.percentage}%`}
                  />
                );
              })}
            </svg>
          </div>
          <div className="pie-legend">
            {segments.map((segment, i) => (
              <div key={i} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="legend-label">
                  {segment.department || segment.type}: {segment.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="reports-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
            <div className="stat-trend positive">+12% from last month</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>{stats.totalDoctors}</h3>
            <p>Active Doctors</p>
            <div className="stat-trend positive">+2 new this month</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.totalVisits}</h3>
            <p>Total Visits</p>
            <div className="stat-trend positive">+8% from last month</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
            <div className="stat-trend positive">+15% from last month</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <LineChart 
            data={chartData.patientGrowth} 
            title="Patient Growth Trend" 
            color="#3b82f6"
          />
        </div>
        
        <div className="chart-card">
          <LineChart 
            data={chartData.revenueTrend} 
            title="Revenue Trend" 
            color="#10b981"
          />
        </div>
        
        <div className="chart-card">
          <PieChart 
            data={chartData.departmentDistribution} 
            title="Department Distribution"
          />
        </div>
        
        <div className="chart-card">
          <BarChart 
            data={chartData.visitTypes} 
            title="Visit Types" 
            color="#f59e0b"
          />
        </div>
      </div>
    </div>
  );

  const renderDetailedReport = () => (
    <div className="detailed-report">
      <h2>Detailed Analytics Report</h2>
      
      <div className="report-section">
        <h3>Patient Demographics</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Age Group</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {getAgeGroupStats().map((group, index) => (
                <tr key={index}>
                  <td>{group.range}</td>
                  <td>{group.count}</td>
                  <td>{group.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-section">
        <h3>Department Performance</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Visits</th>
                <th>Revenue</th>
                <th>Avg. Cost</th>
              </tr>
            </thead>
            <tbody>
              {getDepartmentPerformance().map((dept, index) => (
                <tr key={index}>
                  <td>{dept.department}</td>
                  <td>{dept.visits}</td>
                  <td>₹{dept.revenue.toLocaleString()}</td>
                  <td>₹{dept.avgCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const getAgeGroupStats = () => {
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };

    patientData.forEach(patient => {
      const age = patient.age || 0;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;
    });

    const total = patientData.length;
    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
    }));
  };

  const getDepartmentPerformance = () => {
    const deptStats = {};
    
    visitData.forEach(visit => {
      const dept = visit.department || 'Unknown';
      if (!deptStats[dept]) {
        deptStats[dept] = { visits: 0, revenue: 0 };
      }
      deptStats[dept].visits++;
      deptStats[dept].revenue += visit.estimatedCost || 0;
    });

    return Object.entries(deptStats).map(([department, data]) => ({
      department,
      visits: data.visits,
      revenue: data.revenue,
      avgCost: data.visits > 0 ? data.revenue / data.visits : 0
    })).sort((a, b) => b.revenue - a.revenue);
  };

  const renderFinancialReport = () => {
    const monthlyRevenue = processMonthlyStats(visitData);
    const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
    const avgMonthlyRevenue = monthlyRevenue.length > 0 ? totalRevenue / monthlyRevenue.length : 0;
    
    return (
      <div className="financial-report">
        <div className="report-header">
          <h2>💰 Financial Report</h2>
          <div className="report-actions">
            <Button variant="outline" size="sm">Export PDF</Button>
            <Button variant="outline" size="sm">Export Excel</Button>
          </div>
        </div>

        <div className="financial-overview">
          <div className="financial-stats">
            <div className="financial-stat">
              <h3>₹{totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
            <div className="financial-stat">
              <h3>₹{avgMonthlyRevenue.toLocaleString()}</h3>
              <p>Average Monthly Revenue</p>
            </div>
            <div className="financial-stat">
              <h3>{visitData.length}</h3>
              <p>Total Billed Visits</p>
            </div>
            <div className="financial-stat">
              <h3>₹{visitData.length > 0 ? (totalRevenue / visitData.length).toFixed(0) : 0}</h3>
              <p>Average Visit Value</p>
            </div>
          </div>
        </div>

        <div className="financial-charts">
          <div className="chart-card">
            <LineChart 
              data={monthlyRevenue.map(month => ({ date: month.month, revenue: month.revenue }))} 
              title="Monthly Revenue Trend" 
              color="#10b981"
            />
          </div>
          
          <div className="chart-card">
            <BarChart 
              data={getDepartmentPerformance().map(dept => ({ department: dept.department, count: dept.revenue }))} 
              title="Revenue by Department" 
              color="#3b82f6"
            />
          </div>
        </div>

        <div className="financial-tables">
          <div className="table-section">
            <h3>Revenue by Department</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Visits</th>
                    <th>Revenue</th>
                    <th>Avg. Revenue/Visit</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {getDepartmentPerformance().map((dept, index) => (
                    <tr key={index}>
                      <td>{dept.department}</td>
                      <td>{dept.visits}</td>
                      <td>₹{dept.revenue.toLocaleString()}</td>
                      <td>₹{dept.avgCost.toFixed(0)}</td>
                      <td>{totalRevenue > 0 ? ((dept.revenue / totalRevenue) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-section">
            <h3>Monthly Revenue Breakdown</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Visits</th>
                    <th>Revenue</th>
                    <th>Avg. Revenue/Visit</th>
                    <th>Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenue.map((month, index) => {
                    const prevMonth = monthlyRevenue[index - 1];
                    const growth = prevMonth ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0;
                    return (
                      <tr key={index}>
                        <td>{month.month}</td>
                        <td>{month.visits}</td>
                        <td>₹{month.revenue.toLocaleString()}</td>
                        <td>₹{month.visits > 0 ? (month.revenue / month.visits).toFixed(0) : 0}</td>
                        <td className={growth >= 0 ? 'positive' : 'negative'}>
                          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOperationalReport = () => {
    const doctorPerformance = getDoctorPerformance();
    const appointmentStats = getAppointmentStats();
    
    return (
      <div className="operational-report">
        <div className="report-header">
          <h2>⚙️ Operational Report</h2>
          <div className="report-actions">
            <Button variant="outline" size="sm">Export PDF</Button>
            <Button variant="outline" size="sm">Export Excel</Button>
          </div>
        </div>

        <div className="operational-overview">
          <div className="operational-stats">
            <div className="operational-stat">
              <h3>{appointmentStats.totalAppointments}</h3>
              <p>Total Appointments</p>
            </div>
            <div className="operational-stat">
              <h3>{appointmentStats.completedAppointments}</h3>
              <p>Completed</p>
            </div>
            <div className="operational-stat">
              <h3>{appointmentStats.cancelledAppointments}</h3>
              <p>Cancelled</p>
            </div>
            <div className="operational-stat">
              <h3>{appointmentStats.completionRate}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </div>

        <div className="operational-charts">
          <div className="chart-card">
            <BarChart 
              data={doctorPerformance.map(doc => ({ department: doc.name, count: doc.visits }))} 
              title="Doctor Performance (Visits)" 
              color="#8b5cf6"
            />
          </div>
          
          <div className="chart-card">
            <PieChart 
              data={[
                { department: 'Completed', count: appointmentStats.completedAppointments },
                { department: 'Cancelled', count: appointmentStats.cancelledAppointments },
                { department: 'Pending', count: appointmentStats.pendingAppointments }
              ]} 
              title="Appointment Status Distribution"
            />
          </div>
        </div>

        <div className="operational-tables">
          <div className="table-section">
            <h3>Doctor Performance</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Visits</th>
                    <th>Revenue</th>
                    <th>Avg. Visit Duration</th>
                    <th>Patient Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorPerformance.map((doc, index) => (
                    <tr key={index}>
                      <td>{doc.name}</td>
                      <td>{doc.specialization}</td>
                      <td>{doc.visits}</td>
                      <td>₹{doc.revenue.toLocaleString()}</td>
                      <td>{doc.avgDuration} min</td>
                      <td>
                        <div className="rating">
                          {'★'.repeat(Math.floor(doc.rating))}
                          <span className="rating-text">{doc.rating.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-section">
            <h3>Appointment Analytics</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Appointments</th>
                    <th>Completion Rate</th>
                    <th>Avg. Duration</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {getTimeSlotStats().map((slot, index) => (
                    <tr key={index}>
                      <td>{slot.timeSlot}</td>
                      <td>{slot.appointments}</td>
                      <td>{slot.completionRate}%</td>
                      <td>{slot.avgDuration} min</td>
                      <td>₹{slot.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getDoctorPerformance = () => {
    const doctorStats = {};
    
    visitData.forEach(visit => {
      const doctorId = visit.doctorId;
      if (doctorId) {
        const doctor = doctorData.find(d => d._id === doctorId || d.id === doctorId);
        if (doctor) {
          const key = doctor.name || 'Unknown Doctor';
          if (!doctorStats[key]) {
            doctorStats[key] = {
              name: key,
              specialization: doctor.specialization || 'General',
              visits: 0,
              revenue: 0,
              totalDuration: 0,
              ratings: []
            };
          }
          doctorStats[key].visits++;
          doctorStats[key].revenue += visit.estimatedCost || 0;
          doctorStats[key].totalDuration += visit.estimatedDuration || 30;
          if (visit.patientRating) {
            doctorStats[key].ratings.push(visit.patientRating);
          }
        }
      }
    });

    return Object.values(doctorStats).map(doc => ({
      ...doc,
      avgDuration: doc.visits > 0 ? Math.round(doc.totalDuration / doc.visits) : 0,
      rating: doc.ratings.length > 0 ? doc.ratings.reduce((sum, r) => sum + r, 0) / doc.ratings.length : 4.5
    })).sort((a, b) => b.visits - a.visits);
  };

  const getAppointmentStats = () => {
    const total = visitData.length;
    const completed = visitData.filter(v => v.status === 'completed').length;
    const cancelled = visitData.filter(v => v.status === 'cancelled').length;
    const pending = visitData.filter(v => v.status === 'pending' || v.status === 'scheduled').length;
    
    return {
      totalAppointments: total,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      pendingAppointments: pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const getTimeSlotStats = () => {
    const timeSlots = {
      'Morning (8-12)': { appointments: 0, completed: 0, totalDuration: 0, revenue: 0 },
      'Afternoon (12-16)': { appointments: 0, completed: 0, totalDuration: 0, revenue: 0 },
      'Evening (16-20)': { appointments: 0, completed: 0, totalDuration: 0, revenue: 0 }
    };

    visitData.forEach(visit => {
      if (visit.appointmentTime) {
        const hour = new Date(`2000-01-01T${visit.appointmentTime}`).getHours();
        let slot;
        if (hour >= 8 && hour < 12) slot = 'Morning (8-12)';
        else if (hour >= 12 && hour < 16) slot = 'Afternoon (12-16)';
        else if (hour >= 16 && hour < 20) slot = 'Evening (16-20)';
        else return;

        timeSlots[slot].appointments++;
        if (visit.status === 'completed') {
          timeSlots[slot].completed++;
          timeSlots[slot].totalDuration += visit.estimatedDuration || 30;
          timeSlots[slot].revenue += visit.estimatedCost || 0;
        }
      }
    });

    return Object.entries(timeSlots).map(([timeSlot, data]) => ({
      timeSlot,
      appointments: data.appointments,
      completionRate: data.appointments > 0 ? Math.round((data.completed / data.appointments) * 100) : 0,
      avgDuration: data.completed > 0 ? Math.round(data.totalDuration / data.completed) : 0,
      revenue: data.revenue
    }));
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="reports-analytics">
      <div className="reports-header">
        <h1>📊 Reports & Analytics</h1>
        <div className="reports-controls">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <select 
            value={selectedReport} 
            onChange={(e) => setSelectedReport(e.target.value)}
            className="report-selector"
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed Report</option>
            <option value="financial">Financial Report</option>
            <option value="operational">Operational Report</option>
          </select>
        </div>
      </div>

      <div className="reports-content">
        {selectedReport === 'overview' && renderOverview()}
        {selectedReport === 'detailed' && renderDetailedReport()}
        {selectedReport === 'financial' && renderFinancialReport()}
        {selectedReport === 'operational' && renderOperationalReport()}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
