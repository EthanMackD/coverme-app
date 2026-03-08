import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Pages.css';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [stats, setStats] = useState({ shifts: 0, openSwaps: 0, mySwaps: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [shiftsRes, openRes, myRes] = await Promise.all([
          api.get('/shifts/my-shifts'),
          api.get('/swaps/open'),
          api.get('/swaps/my-requests')
        ]);
        setStats({
          shifts: shiftsRes.data.length,
          openSwaps: openRes.data.length,
          mySwaps: myRes.data.filter(s => s.status === 'open' || s.status === 'claimed').length
        });
      } catch {
        // Stats are non-critical
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user?.firstName}!</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/shifts')} style={{ cursor: 'pointer' }}>
          <h3>My Shifts</h3>
          <div className="stat-value primary">{stats.shifts}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/swaps')} style={{ cursor: 'pointer' }}>
          <h3>Available Swaps</h3>
          <div className="stat-value primary">{stats.openSwaps}</div>
        </div>
        <div className="stat-card">
          <h3>My Active Requests</h3>
          <div className="stat-value primary">{stats.mySwaps}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
