import React, { useEffect, useState } from "react";
import axios from "axios";

const DashboardSummary = ({ token }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5001/api/dashboard/summary", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummary(res.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard summary error", err);
        setError("Failed to load dashboard data");
        // Set default values for demo
        setSummary({
          totalPatients: 0,
          totalVisits: 0,
          todayVisits: 0,
          pendingAppointments: 0,
          recentPatients: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [token]);

  if (loading) {
    return (
      <div className="stats-grid" data-testid="dashboard-summary">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <div className="loading" style={{ margin: '0 auto' }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-4)' }}>⚠️</div>
          <h3>Unable to Load Dashboard</h3>
          <p className="text-muted">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Patients",
      value: summary?.totalPatients || 0,
      icon: "👥",
      color: "primary",
      change: "+12%",
      changeType: "positive",
      description: "Registered patients"
    },
    {
      title: "Total Visits",
      value: summary?.totalVisits || 0,
      icon: "🏥",
      color: "success",
      change: "+8%",
      changeType: "positive",
      description: "All time visits"
    },
    {
      title: "Today's Visits",
      value: summary?.todayVisits || 0,
      icon: "📅",
      color: "warning",
      change: "+3",
      changeType: "positive",
      description: "Visits today"
    },
    {
      title: "Pending Appointments",
      value: summary?.pendingAppointments || 5,
      icon: "⏰",
      color: "error",
      change: "-2",
      changeType: "negative",
      description: "Awaiting confirmation"
    }
  ];

  return (
    <div className="fade-in" data-testid="dashboard-summary">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-label">{stat.title}</div>
                <div className="stat-value">{stat.value.toLocaleString()}</div>
                <div className="stat-change">
                  <span className={stat.changeType}>
                    {stat.change}
                  </span>
                  <span className="text-muted">from last month</span>
                </div>
              </div>
              <div className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--gray-500)',
              marginTop: 'var(--spacing-4)'
            }}>
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSummary;
