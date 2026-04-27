import { useState, useEffect } from 'react';
import api from '../api';
import './Pages.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data);
      setFormData({
        firstName: res.data.first_name,
        lastName: res.data.last_name,
        phone: res.data.phone || ''
      });
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', formData);
      setProfile(res.data);
      const user = JSON.parse(localStorage.getItem('user'));
      user.firstName = res.data.first_name;
      user.lastName = res.data.last_name;
      localStorage.setItem('user', JSON.stringify(user));
      setMessage('Profile updated!');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) return <div className="page-loading">Loading profile...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {editing ? (
        <div className="table-container" style={{ padding: '24px' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <label style={{ fontSize: '0.85em', color: '#555' }}>
              First Name
              <input type="text" value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required style={{ display: 'block', width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9em', marginTop: '4px' }} />
            </label>
            <label style={{ fontSize: '0.85em', color: '#555' }}>
              Last Name
              <input type="text" value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required style={{ display: 'block', width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9em', marginTop: '4px' }} />
            </label>
            <label style={{ fontSize: '0.85em', color: '#555' }}>
              Phone
              <input type="tel" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Optional"
                style={{ display: 'block', width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9em', marginTop: '4px' }} />
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <tbody>
              <tr><td style={{ fontWeight: 600, color: '#555', width: '150px' }}>Name</td><td>{profile.first_name} {profile.last_name}</td></tr>
              <tr><td style={{ fontWeight: 600, color: '#555' }}>Email</td><td>{profile.email}</td></tr>
              <tr><td style={{ fontWeight: 600, color: '#555' }}>Role</td><td><span className={`badge ${profile.role === 'manager' ? 'badge-claimed' : 'badge-open'}`}>{profile.role}</span></td></tr>
              <tr><td style={{ fontWeight: 600, color: '#555' }}>Phone</td><td>{profile.phone || '—'}</td></tr>
              <tr><td style={{ fontWeight: 600, color: '#555' }}>Member since</td><td>{formatDate(profile.created_at)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Profile;