import { useState, useEffect } from 'react';
import api from '../api';
import './Pages.css';

function Approvals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/swaps/pending');
      setPending(res.data);
    } catch (err) {
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (requestId, approved) => {
    try {
      await api.patch(`/swaps/${requestId}/approve`, { approved });
      setMessage(approved ? 'Swap approved!' : 'Swap denied.');
      fetchPending();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process decision');
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

  if (loading) return <div className="page-loading">Loading approvals...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pending Approvals</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {pending.length === 0 ? (
        <div className="empty-state"><p>No pending swap approvals.</p></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Claimer</th>
                <th>Date</th>
                <th>Time</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((swap) => (
                <tr key={swap.request_id}>
                  <td>{swap.requester_first} {swap.requester_last}</td>
                  <td>{swap.claimer_first} {swap.claimer_last}</td>
                  <td>{formatDate(swap.date)}</td>
                  <td>{formatTime(swap.start_time)} - {formatTime(swap.end_time)}</td>
                  <td>{swap.position}</td>
                  <td className="action-buttons">
                    <button className="btn btn-small btn-primary" onClick={() => handleDecision(swap.request_id, true)}>
                      Approve
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDecision(swap.request_id, false)}>
                      Deny
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

export default Approvals;
