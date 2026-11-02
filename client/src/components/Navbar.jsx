import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, LogOut, UserCircle, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'HR':
        return 'badge-role-hr';
      case 'Manager':
        return 'badge-role-manager';
      default:
        return 'badge-role-employee';
    }
  };

  return (
    <header className="navbar navbar-expand-lg navbar-white bg-white border-bottom sticky-top px-3 py-2">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm">
            <Users size={22} />
          </div>
          <div>
            <span className="fw-bold fs-5 text-dark tracking-tight">Staff<span className="text-primary">Sync</span></span>
            <span className="d-block text-muted" style={{ fontSize: '0.7rem', marginTop: '-3px' }}>HR Management Solution</span>
          </div>
        </Link>

        {/* User Info & Controls */}
        {user && (
          <div className="d-flex align-items-center gap-3">
            {/* Role indicator */}
            <span className={`badge px-2.5 py-1.5 rounded-pill ${getRoleBadgeClass(user.role)}`}>
              {user.role} Portal
            </span>

            {/* User Profile shortcut */}
            <Link
              to="/profile"
              className="d-flex align-items-center gap-2 text-decoration-none text-dark bg-light px-3 py-1.5 rounded-pill border"
            >
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="d-none d-md-block text-start" style={{ lineHeight: '1.2' }}>
                <span className="d-block fw-semibold" style={{ fontSize: '0.85rem' }}>{user.name}</span>
                <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>{user.department || 'Staff'}</span>
              </div>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill"
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
