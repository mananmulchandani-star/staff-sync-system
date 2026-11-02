import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Clock,
  CalendarDays,
  GraduationCap,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  UserPlus,
  FileCheck,
} from 'lucide-react';

const Dashboard = () => {
  const { user, isHR, isManager, isEmployee } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [clockMsg, setClockMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleClockIn = async () => {
    setClockLoading(true);
    setClockMsg('');
    try {
      const res = await api.post('/attendance/clock-in');
      setClockMsg(res.data.message);
      await fetchDashboardStats();
    } catch (err) {
      setClockMsg(err.response?.data?.message || 'Error clocking in');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    setClockMsg('');
    try {
      const res = await api.post('/attendance/clock-out');
      setClockMsg(res.data.message);
      await fetchDashboardStats();
    } catch (err) {
      setClockMsg(err.response?.data?.message || 'Error clocking out');
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const announcements = data?.recentAnnouncements || [];

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            Welcome back, {user?.name}! 👋
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            {isHR && 'Here is the real-time operational overview of your organization.'}
            {isManager && `Overseeing ${user.department} Department workflows and team deliverables.`}
            {isEmployee && `Ready for a productive day in the ${user.department} team!`}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 border shadow-sm">
          <Clock size={18} className="text-primary" />
          <span className="fw-semibold text-secondary" style={{ fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-muted">|</span>
          <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{currentTime}</span>
        </div>
      </div>

      {/* 1. HR ADMIN DASHBOARD VIEW */}
      {isHR && (
        <>
          {/* Stat Cards */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Total Workforce</span>
                  <div className="p-2 bg-primary-subtle text-primary rounded-3">
                    <Users size={20} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stats.totalEmployees || 0}</h3>
                <span className="text-success fw-medium" style={{ fontSize: '0.8rem' }}>
                  {stats.activeEmployees || 0} Active Staff
                </span>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Today's Attendance</span>
                  <div className="p-2 bg-success-subtle text-success rounded-3">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stats.attendanceRate || 0}%</h3>
                <span className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>
                  {stats.todayCheckedIn || 0} checked in ({stats.lateCount || 0} late)
                </span>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Pending Leave Reviews</span>
                  <div className="p-2 bg-warning-subtle text-warning rounded-3">
                    <CalendarDays size={20} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stats.pendingLeaves || 0}</h3>
                <span className="text-danger fw-medium" style={{ fontSize: '0.8rem' }}>
                  Requires HR decision
                </span>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Active Trainings</span>
                  <div className="p-2 bg-info-subtle text-info rounded-3">
                    <GraduationCap size={20} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stats.upcomingTrainings || 0}</h3>
                <span className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>
                  Programs in progress
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Department Breakdown */}
          <div className="row g-3 mb-4">
            <div className="col-lg-6">
              <div className="content-card h-100">
                <h5 className="fw-bold text-dark mb-3">HR Management Shortcuts</h5>
                <div className="row g-2">
                  <div className="col-sm-6">
                    <Link to="/employees" className="btn btn-outline-primary w-100 py-3 text-start d-flex align-items-center gap-3 rounded-3">
                      <UserPlus size={22} className="text-primary" />
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Add New Employee</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Create profile & credentials</div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-sm-6">
                    <Link to="/leaves" className="btn btn-outline-warning w-100 py-3 text-start d-flex align-items-center gap-3 rounded-3">
                      <FileCheck size={22} className="text-warning" />
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Approve Leaves</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{stats.pendingLeaves || 0} pending review</div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-sm-6">
                    <Link to="/attendance" className="btn btn-outline-success w-100 py-3 text-start d-flex align-items-center gap-3 rounded-3">
                      <Clock size={22} className="text-success" />
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Attendance Log</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Company-wide timesheets</div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-sm-6">
                    <Link to="/announcements" className="btn btn-outline-info w-100 py-3 text-start d-flex align-items-center gap-3 rounded-3">
                      <Megaphone size={22} className="text-info" />
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Post Announcement</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Broadcast to workforce</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="content-card h-100">
                <h5 className="fw-bold text-dark mb-3">Headcount by Department</h5>
                <div className="d-flex flex-column gap-3">
                  {stats.departments && stats.departments.map((d) => (
                    <div key={d._id}>
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                        <span className="fw-semibold">{d._id}</span>
                        <span className="text-muted">{d.count} staff</span>
                      </div>
                      <div className="progress" style={{ height: '7px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${Math.min(100, (d.count / (stats.totalEmployees || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. MANAGER DASHBOARD VIEW */}
      {isManager && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Team Size</span>
                  <div className="p-2 bg-primary-subtle text-primary rounded-3">
                    <Users size={20} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stats.teamSize || 0}</h3>
                <span className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>
                  {user.department} members
                </span>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Present Today</span>
                  <div className="p-2 bg-success-subtle text-success rounded-3">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stats.teamPresentToday || 0}</h3>
                <span className="text-success fw-medium" style={{ fontSize: '0.8rem' }}>
                  Clocked-in team members
                </span>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Pending Leave Requests</span>
                  <div className="p-2 bg-warning-subtle text-warning rounded-3">
                    <CalendarDays size={20} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stats.pendingTeamLeaves || 0}</h3>
                <span className="text-warning fw-medium" style={{ fontSize: '0.8rem' }}>
                  Awaiting your approval
                </span>
              </div>
            </div>

            <div className="col-sm-6 col-xl-3">
              <div className="stat-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Active Trainings</span>
                  <div className="p-2 bg-info-subtle text-info rounded-3">
                    <GraduationCap size={20} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stats.activeTrainings || 0}</h3>
                <span className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>
                  Scheduled programs
                </span>
              </div>
            </div>
          </div>

          {/* Quick links for manager */}
          <div className="row g-3 mb-4">
            <div className="col-12">
              <div className="content-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Manager Approval & Action Hub</h5>
                </div>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/leaves" className="btn btn-warning d-flex align-items-center gap-2 px-4 py-2 rounded-3 text-dark fw-semibold">
                    <FileCheck size={18} />
                    <span>Review Team Leaves ({stats.pendingTeamLeaves || 0})</span>
                  </Link>
                  <Link to="/trainings" className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold">
                    <GraduationCap size={18} />
                    <span>Create / Assign Training Program</span>
                  </Link>
                  <Link to="/attendance" className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold">
                    <Clock size={18} />
                    <span>View Team Attendance</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. EMPLOYEE DASHBOARD VIEW */}
      {isEmployee && (
        <div className="row g-3 mb-4">
          {/* Clock In / Out Card */}
          <div className="col-lg-5">
            <div className="content-card h-100 text-center d-flex flex-column justify-content-between">
              <div>
                <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                  Daily Attendance Tracker
                </span>
                <div className="clock-display my-3">{currentTime}</div>

                {clockMsg && (
                  <div className="alert alert-info py-2 px-3 rounded-3 mb-3" style={{ fontSize: '0.85rem' }}>
                    {clockMsg}
                  </div>
                )}

                {stats.todayAttendance ? (
                  <div className="p-3 bg-light rounded-3 border mb-3 text-start">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted" style={{ fontSize: '0.82rem' }}>Status</span>
                      <span className={`badge rounded-pill badge-${stats.todayAttendance.status.toLowerCase()}`}>
                        {stats.todayAttendance.status}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.85rem' }}>
                      <span className="text-muted">Clock In:</span>
                      <span className="fw-semibold">
                        {new Date(stats.todayAttendance.clockIn).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.85rem' }}>
                      <span className="text-muted">Clock Out:</span>
                      <span className="fw-semibold">
                        {stats.todayAttendance.clockOut
                          ? new Date(stats.todayAttendance.clockOut).toLocaleTimeString()
                          : 'In Progress'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                    You have not marked attendance for today yet.
                  </p>
                )}
              </div>

              <div>
                {!stats.todayAttendance ? (
                  <button
                    onClick={handleClockIn}
                    disabled={clockLoading}
                    className="btn btn-success w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={18} />
                    <span>{clockLoading ? 'Marking...' : 'Clock In Now'}</span>
                  </button>
                ) : !stats.todayAttendance.clockOut ? (
                  <button
                    onClick={handleClockOut}
                    disabled={clockLoading}
                    className="btn btn-danger w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  >
                    <Clock size={18} />
                    <span>{clockLoading ? 'Updating...' : 'Clock Out for Day'}</span>
                  </button>
                ) : (
                  <div className="badge bg-success-subtle text-success border border-success p-2 w-100 rounded-3">
                    ✅ Completed attendance for today ({stats.todayAttendance.totalHours} hrs)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leave Balances Card */}
          <div className="col-lg-7">
            <div className="content-card h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Leave Balances</h5>
                <Link to="/leaves" className="text-primary text-decoration-none fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Apply Leave <ArrowRight size={14} />
                </Link>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 border text-center">
                    <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>Casual Leave</span>
                    <h4 className="fw-bold my-1 text-primary">
                      {(stats.leaveBalance?.casual?.total || 10) - (stats.leaveBalance?.casual?.used || 0)}
                    </h4>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      of {stats.leaveBalance?.casual?.total || 10} days
                    </span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 border text-center">
                    <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>Sick Leave</span>
                    <h4 className="fw-bold my-1 text-success">
                      {(stats.leaveBalance?.sick?.total || 10) - (stats.leaveBalance?.sick?.used || 0)}
                    </h4>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      of {stats.leaveBalance?.sick?.total || 10} days
                    </span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3 border text-center">
                    <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>Annual Leave</span>
                    <h4 className="fw-bold my-1 text-warning">
                      {(stats.leaveBalance?.annual?.total || 15) - (stats.leaveBalance?.annual?.used || 0)}
                    </h4>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      of {stats.leaveBalance?.annual?.total || 15} days
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                  Quick Shortcuts
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  <Link to="/attendance" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    View My Attendance Log
                  </Link>
                  <Link to="/trainings" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    Browse Available Trainings ({stats.enrolledTrainingsCount || 0} enrolled)
                  </Link>
                  <Link to="/profile" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    Update My Contact Info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Board Widget (Visible across all roles) */}
      <div className="content-card mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <Megaphone size={20} className="text-primary" />
            <h5 className="fw-bold text-dark mb-0">Latest Company Announcements</h5>
          </div>
          <Link to="/announcements" className="text-primary text-decoration-none fw-semibold" style={{ fontSize: '0.85rem' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {announcements.length === 0 ? (
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>No announcements published yet.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {announcements.map((item) => (
              <div key={item._id} className="p-3 bg-light rounded-3 border">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="d-flex align-items-center gap-2">
                    {item.isPinned && (
                      <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.68rem' }}>
                        PINNED
                      </span>
                    )}
                    <span className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: '0.7rem' }}>
                      {item.category}
                    </span>
                    <span className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                      {item.title}
                    </span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-secondary mb-1" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                  {item.content}
                </p>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Posted by: <span className="fw-semibold">{item.authorName || 'HR Team'}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
