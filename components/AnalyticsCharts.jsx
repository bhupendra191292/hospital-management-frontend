import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsCharts = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5001/api/analytics/trends?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data);
        setError(null);
      } catch (err) {
        console.error("Analytics error", err);
        setError("Failed to load analytics data");
        // Mock data for demo
        setAnalytics({
          patientTrends: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [65, 78, 90, 85, 95, 110]
          },
          visitTrends: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [120, 135, 150, 140, 160, 180]
          },
          genderDistribution: {
            labels: ['Male', 'Female', 'Other'],
            data: [45, 50, 5]
          },
          ageDistribution: {
            labels: ['0-18', '19-30', '31-50', '51-70', '70+'],
            data: [15, 25, 35, 20, 5]
          },
          topConditions: [
            { condition: 'Hypertension', count: 25 },
            { condition: 'Diabetes', count: 18 },
            { condition: 'Respiratory Issues', count: 15 },
            { condition: 'Cardiovascular', count: 12 },
            { condition: 'Orthopedic', count: 10 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [token, timeRange]);

  const patientTrendsData = {
    labels: analytics?.patientTrends?.labels || [],
    datasets: [
      {
        label: 'New Patients',
        data: analytics?.patientTrends?.data || [],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const visitTrendsData = {
    labels: analytics?.visitTrends?.labels || [],
    datasets: [
      {
        label: 'Patient Visits',
        data: analytics?.visitTrends?.data || [],
        backgroundColor: 'rgba(5, 150, 105, 0.8)',
        borderColor: 'rgb(5, 150, 105)',
        borderWidth: 2,
      },
    ],
  };

  const genderData = {
    labels: analytics?.genderDistribution?.labels || [],
    datasets: [
      {
        data: analytics?.genderDistribution?.data || [],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const ageData = {
    labels: analytics?.ageDistribution?.labels || [],
    datasets: [
      {
        label: 'Age Distribution',
        data: analytics?.ageDistribution?.data || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Healthcare Analytics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="card">
          <div className="card-body text-center">
            <div className="loading" style={{ margin: '0 auto' }}></div>
            <p className="text-muted mt-4">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <div className="card">
          <div className="card-body text-center">
            <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-4)' }}>📊</div>
            <h3>Analytics Unavailable</h3>
            <p className="text-muted">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="card mb-8">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">📊 Advanced Analytics</h3>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="card-body">
          <p className="text-muted">
            Comprehensive analytics and insights for your healthcare practice
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Growth Rate</div>
              <div className="stat-value">+15.2%</div>
              <div className="stat-change positive">+2.1% from last month</div>
            </div>
            <div className="stat-icon success">📈</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Patient Satisfaction</div>
              <div className="stat-value">4.8/5</div>
              <div className="stat-change positive">+0.2 from last month</div>
            </div>
            <div className="stat-icon primary">⭐</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Avg. Wait Time</div>
              <div className="stat-value">12min</div>
              <div className="stat-change negative">+3min from last month</div>
            </div>
            <div className="stat-icon warning">⏱️</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Revenue</div>
              <div className="stat-value">$45.2K</div>
              <div className="stat-change positive">+8.5% from last month</div>
            </div>
            <div className="stat-icon success">💰</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 'var(--spacing-8)' }}>
        {/* Patient Trends */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">📈 Patient Growth Trends</h4>
          </div>
          <div className="card-body">
            <Line data={patientTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* Visit Trends */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">🏥 Patient Visit Trends</h4>
          </div>
          <div className="card-body">
            <Bar data={visitTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">👥 Gender Distribution</h4>
          </div>
          <div className="card-body">
            <Doughnut data={genderData} options={chartOptions} />
          </div>
        </div>

        {/* Age Distribution */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">🎂 Age Distribution</h4>
          </div>
          <div className="card-body">
            <Bar data={ageData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top Medical Conditions */}
      <div className="card mt-8">
        <div className="card-header">
          <h4 className="card-title">🏥 Top Medical Conditions</h4>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
            {analytics?.topConditions?.map((condition, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: 'var(--spacing-4)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--gray-200)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>
                    {condition.condition}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                    {condition.count} patients
                  </div>
                </div>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--primary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600
                }}>
                  {condition.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card mt-8">
        <div className="card-header">
          <h4 className="card-title">💡 Key Insights</h4>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
              <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--success)' }}>📈</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>Patient Growth</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Patient registrations increased by 15.2% this month, indicating strong practice growth.
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
              <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--warning)' }}>⏱️</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>Wait Time Alert</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Average wait time increased by 3 minutes. Consider optimizing appointment scheduling.
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
              <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--primary-blue)' }}>👥</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>Demographics</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Patient base is well-balanced with 50% female and 45% male patients.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
