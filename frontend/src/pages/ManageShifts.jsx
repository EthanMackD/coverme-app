import { useState, useEffect } from 'react';
import api from '../api';
import './Pages.css';

function ManageShifts() {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    userId: '', date: '', startTime: '', endTime: '', position: '', location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shiftsRes, empRes] = await Promise.all([
        api.get('/shifts/all'),
        api.get('/shifts/employees')
      ]);
      setShifts(shiftsRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shifts', formData);
      setMessage('Shift created!');
      setShowForm(false);
      setFormData({ userId: '', date: '', startTime: '', endTime: '', position: '', location: '' });
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shift');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (shiftId) => {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await api.delete(`/shifts/${shiftId}`);
      setMessage('Shift deleted.');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete shift');
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

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Shifts</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Shift'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <select name="userId" value={formData.userId} onChange={handleChange} required>
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.user_id} value={emp.user_id}>
                {emp.first_name} {emp.last_name} ({emp.role})
              </option>
            ))}
          </select>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
          <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
          <input type="text" name="position" placeholder="Position" value={formData.position} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location (optional)" value={formData.location} onChange={handleChange} />
          <button type="submit" className="btn btn-primary">Create Shift</button>
        </form>
      )}

      {shifts.length === 0 ? (
        <div className="empty-state"><p>No shifts created yet.</p></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
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
                  <td>{shift.first_name} {shift.last_name}</td>
                  <td>{formatDate(shift.date)}</td>
                  <td>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</td>
                  <td>{shift.position}</td>
                  <td>{shift.location || '—'}</td>
                  <td>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(shift.shift_id)}>
                      Delete
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

export default ManageShifts;
