import { useState, useEffect } from 'react';
import api from '../api';
import './Pages.css';

function SwapRequests() {
  const [tab, setTab] = useState('open');
  const [openSwaps, setOpenSwaps] = useState([]);
  const [mySwaps, setMySwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [openRes, myRes] = await Promise.all([
        api.get('/swaps/open'),
        api.get('/swaps/my-requests')
      ]);
      setOpenSwaps(openRes.data);
      setMySwaps(myRes.data);
    } catch (err) {
      setError('Failed to load swap requests');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (requestId) => {
    try {
      await api.post(`/swaps/${requestId}/claim`);
      setMessage('Swap claimed! Waiting for manager approval.');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim swap');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await api.patch(`/swaps/${requestId}/cancel`);
      setMessage('Swap request cancelled.');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel swap');
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

  const statusClass = (status) => {
    const classes = { open: 'badge-open', claimed: 'badge-claimed', approved: 'badge-approved', denied: 'badge-denied', cancelled: 'badge-cancelled' };
    return classes[status] || '';
  };

  if (loading) return <div className="page-loading">Loading swap requests...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Swap Requests</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        <button className={`tab ${tab === 'open' ? 'tab-active' : ''}`} onClick={() => setTab('open')}>
          Available Swaps ({openSwaps.length})
        </button>
        <button className={`tab ${tab === 'mine' ? 'tab-active' : ''}`} onClick={() => setTab('mine')}>
          My Requests ({mySwaps.length})
        </button>
      </div>

      {tab === 'open' && (
        openSwaps.length === 0 ? (
          <div className="empty-state"><p>No open swap requests available.</p></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Posted By</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Position</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {openSwaps.map((swap) => (
                  <tr key={swap.request_id}>
                    <td>{swap.first_name} {swap.last_name}</td>
                    <td>{formatDate(swap.date)}</td>
                    <td>{formatTime(swap.start_time)} - {formatTime(swap.end_time)}</td>
                    <td>{swap.position}</td>
                    <td>{swap.reason || '—'}</td>
                    <td>
                      <button className="btn btn-small btn-primary" onClick={() => handleClaim(swap.request_id)}>
                        Claim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'mine' && (
        mySwaps.length === 0 ? (
          <div className="empty-state"><p>You haven't created any swap requests.</p></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mySwaps.map((swap) => (
                  <tr key={swap.request_id}>
                    <td>{formatDate(swap.date)}</td>
                    <td>{formatTime(swap.start_time)} - {formatTime(swap.end_time)}</td>
                    <td>{swap.position}</td>
                    <td><span className={`badge ${statusClass(swap.status)}`}>{swap.status}</span></td>
                    <td>
                      {(swap.status === 'open' || swap.status === 'claimed') && (
                        <button className="btn btn-small btn-danger" onClick={() => handleCancel(swap.request_id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

export default SwapRequests;
