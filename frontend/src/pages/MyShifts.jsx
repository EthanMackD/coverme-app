import { useState, useEffect } from 'react';
import api from '../api';
import './Pages.css';

function MyShifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts/my-shifts');
      setShifts(res.data);
    } catch (err) {
      setError('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = async (shiftId) => {
    const reason = prompt('Reason for swap request (optional):');
    try {
      await api.post('/swaps', { shiftId, reason });
      setMessage('Swap request created!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create swap request');
      setTimeout(() => setError(''), 3000);
    }
  };

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

  if (loading) return <div className="page-loading">Loading shifts...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Shifts</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {shifts.length === 0 ? (
        <div className="empty-state">
          <p>No shifts assigned yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Position</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.shift_id}>
                  <td>{formatDate(shift.date)}</td>
                  <td>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</td>
                  <td>{shift.position}</td>
                  <td>{shift.location || '—'}</td>
                  <td>
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => handleRequestSwap(shift.shift_id)}
                    >
                      Request Swap
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyShifts;
