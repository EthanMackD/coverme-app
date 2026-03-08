import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard';
import MyShifts from './pages/MyShifts';
import SwapRequests from './pages/SwapRequests';
import ManageShifts from './pages/ManageShifts';
import Approvals from './pages/Approvals';
import Layout from './components/Layout';
import './index.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function ManagerRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" />;
  if (user.role !== 'manager' && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/shifts" element={<ProtectedRoute><MyShifts /></ProtectedRoute>} />
        <Route path="/swaps" element={<ProtectedRoute><SwapRequests /></ProtectedRoute>} />
        <Route path="/manage-shifts" element={<ManagerRoute><ManageShifts /></ManagerRoute>} />
        <Route path="/approvals" element={<ManagerRoute><Approvals /></ManagerRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
