import { useState, useEffect } from 'react';
import api from '../api';
import './Pages.css';

function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/shifts/dashboard-stats');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${minutes} ${ampm}`;
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const employeeCount = data.employees.filter(e => e.role === 'employee').length;
  const managerCount = data.employees.filter(e => e.role === 'manager' || e.role === 'admin').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manager Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Employees</h3>
          <div className="stat-value primary">{employeeCount}</div>
        </div>
        <div className="stat-card">
          <h3>Managers</h3>
          <div className="stat-value primary">{managerCount}</div>
        </div>
        <div className="stat-card">
          <h3>Shifts Today</h3>
          <div className="stat-value primary">{data.todayShifts.length}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Swaps</h3>
          <div className="stat-value primary">{data.pendingSwaps}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2em', color: '#333', marginBottom: '12px' }}>Today's shifts</h2>
      {data.todayShifts.length === 0 ? (
        <div className="empty-state"><p>No shifts scheduled today.</p></div>
      ) : (
        <div className="table-container" style={{ marginBottom: '30px' }}>
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Time</th><th>Position</th><th>Location</th></tr>
            </thead>
            <tbody>
              {data.todayShifts.map(s => (
                <tr key={s.shift_id}>
                  <td>{s.first_name} {s.last_name}</td>
                  <td>{formatTime(s.start_time)} - {formatTime(s.end_time)}</td>
                  <td>{s.position}</td>
                  <td>{s.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ fontSize: '1.2em', color: '#333', marginBottom: '12px' }}>Upcoming shifts</h2>
      {data.upcomingShifts.length === 0 ? (
        <div className="empty-state"><p>No upcoming shifts.</p></div>
      ) : (
        <div className="table-container" style={{ marginBottom: '30px' }}>
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Date</th><th>Time</th><th>Position</th><th>Location</th></tr>
            </thead>
            <tbody>
              {data.upcomingShifts.map(s => (
                <tr key={s.shift_id}>
                  <td>{s.first_name} {s.last_name}</td>
                  <td>{formatDate(s.date)}</td>
                  <td>{formatTime(s.start_time)} - {formatTime(s.end_time)}</td>
                  <td>{s.position}</td>
                  <td>{s.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ fontSize: '1.2em', color: '#333', marginBottom: '12px' }}>Team members</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Position</th></tr>
          </thead>
          <tbody>
            {data.employees.map(e => (
              <tr key={e.user_id}>
                <td>{e.first_name} {e.last_name}</td>
                <td>{e.email}</td>
                <td><span className={`badge ${e.role === 'manager' ? 'badge-claimed' : 'badge-open'}`}>{e.role}</span></td>
                <td>{e.position || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagerDashboard;