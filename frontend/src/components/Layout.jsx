import { NavLink, useNavigate } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>CoverMe</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/shifts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            My Shifts
          </NavLink>
          <NavLink to="/swaps" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Swap Requests
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Calendar
          </NavLink>
          {user?.role === 'manager' && (
            <>
              <div className="nav-divider">Manager</div>
              <NavLink to="/manage-shifts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Manage Shifts
              </NavLink>
              <NavLink to="/approvals" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Approvals
              </NavLink>
              <NavLink to="/manager-dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
               Team Overview
            </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role-badge">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
