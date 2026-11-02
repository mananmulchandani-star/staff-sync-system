import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  GraduationCap,
  Megaphone,
  UserCheck,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isHR, isManager } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: '/employees',
      label: isHR ? 'Manage Employees' : 'Employee Directory',
      icon: <Users size={18} />,
    },
    {
      to: '/attendance',
      label: isHR || isManager ? 'Attendance & Logs' : 'My Attendance',
      icon: <Clock size={18} />,
    },
    {
      to: '/leaves',
      label: isHR || isManager ? 'Leave Requests & Approvals' : 'Apply & Track Leaves',
      icon: <CalendarDays size={18} />,
    },
    {
      to: '/trainings',
      label: isHR || isManager ? 'Manage Training Programs' : 'Training & Upskilling',
      icon: <GraduationCap size={18} />,
    },
    {
      to: '/announcements',
      label: 'Company Bulletin',
      icon: <Megaphone size={18} />,
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: <UserCheck size={18} />,
    },
  ];

  return (
    <aside className="app-sidebar py-3 d-flex flex-column justify-content-between">
      <div>
        <div className="px-3 pb-3 mb-2 border-bottom">
          <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
            Main Menu
          </span>
        </div>
        <nav className="nav flex-column">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="d-flex align-items-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Role info card in sidebar footer */}
      <div className="p-3 mx-3 rounded-3 bg-light border">
        <div className="d-flex align-items-center gap-2 mb-1">
          <div className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></div>
          <span className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Active Role</span>
        </div>
        <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
          {user?.role === 'HR' && '🏢 HR Administrator'}
          {user?.role === 'Manager' && '👔 Team Manager'}
          {user?.role === 'Employee' && '👤 Staff Member'}
        </div>
        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
          Dept: {user?.department || 'General'}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
