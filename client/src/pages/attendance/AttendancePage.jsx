import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Users,
  Search,
  Filter,
} from 'lucide-react';

const AttendancePage = () => {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('my-attendance'); // 'my-attendance' | 'company-attendance'

  // Personal state
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockActionMsg, setClockActionMsg] = useState('');
  const [isClocking, setIsClocking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Company-wide state (for HR/Manager)
  const [companyRecords, setCompanyRecords] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSearch, setFilterSearch] = useState('');

  // Clock ticker
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchPersonalAttendance = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/my-history'),
      ]);

      if (todayRes.data.success) {
        setTodayStatus(todayRes.data.data);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.data);
        setSummary(historyRes.data.summary);
      }
    } catch (err) {
      console.error('Error fetching personal attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyAttendance = async () => {
    if (!isHR && !isManager) return;
    setCompanyLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus !== 'All') params.status = filterStatus;
      if (filterSearch) params.search = filterSearch;

      const res = await api.get('/attendance/all', { params });
      if (res.data.success) {
        setCompanyRecords(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching company attendance:', err);
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalAttendance();
  }, []);

  useEffect(() => {
    if (activeTab === 'company-attendance') {
      fetchCompanyAttendance();
    }
  }, [activeTab, filterDate, filterStatus, filterSearch]);

  const handleClockIn = async () => {
    setIsClocking(true);
    setClockActionMsg('');
    try {
      const res = await api.post('/attendance/clock-in');
      setClockActionMsg(res.data.message);
      await fetchPersonalAttendance();
    } catch (err) {
      setClockActionMsg(err.response?.data?.message || 'Error clocking in');
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    setIsClocking(true);
    setClockActionMsg('');
    try {
      const res = await api.post('/attendance/clock-out');
      setClockActionMsg(res.data.message);
      await fetchPersonalAttendance();
    } catch (err) {
      setClockActionMsg(err.response?.data?.message || 'Error clocking out');
    } finally {
      setIsClocking(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Attendance Tracking</h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Daily clock-in/out records, work hour calculations, and timesheet logs.
          </p>
        </div>

        {/* Tab switch for HR/Manager */}
        {(isHR || isManager) && (
          <div className="btn-group p-1 bg-light border rounded-pill" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                activeTab === 'my-attendance' ? 'btn-primary' : 'btn-light text-muted'
              }`}
              onClick={() => setActiveTab('my-attendance')}
            >
              My Attendance
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                activeTab === 'company-attendance' ? 'btn-primary' : 'btn-light text-muted'
              }`}
              onClick={() => setActiveTab('company-attendance')}
            >
              Organization Logs
            </button>
          </div>
        )}
      </div>

      {clockActionMsg && (
        <div className="alert alert-info alert-dismissible fade show py-2.5 px-3 rounded-3 mb-4 d-flex justify-content-between align-items-center" style={{ fontSize: '0.88rem' }}>
          <span>{clockActionMsg}</span>
          <button type="button" className="btn-close p-2" onClick={() => setClockActionMsg('')}></button>
        </div>
      )}

      {/* TAB 1: PERSONAL ATTENDANCE */}
      {activeTab === 'my-attendance' && (
        <>
          <div className="row g-4 mb-4">
            {/* Clock Widget Card */}
            <div className="col-lg-5">
              <div className="content-card h-100 text-center d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-center align-items-center gap-2 text-muted mb-2">
                    <Calendar size={16} />
                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="clock-display my-2">{currentTime}</div>

                  {todayStatus ? (
                    <div className="p-3 bg-light rounded-3 border my-3 text-start">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted" style={{ fontSize: '0.82rem' }}>Today's Entry</span>
                        <span className={`badge rounded-pill badge-${todayStatus.status.toLowerCase()}`}>
                          {todayStatus.status}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">Clocked In:</span>
                        <span className="fw-bold">{new Date(todayStatus.clockIn).toLocaleTimeString()}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">Clocked Out:</span>
                        <span className="fw-bold">
                          {todayStatus.clockOut ? new Date(todayStatus.clockOut).toLocaleTimeString() : 'Active session'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted my-3" style={{ fontSize: '0.85rem' }}>
                      No clock-in record for today yet.
                    </p>
                  )}
                </div>

                <div>
                  {!todayStatus ? (
                    <button
                      onClick={handleClockIn}
                      disabled={isClocking}
                      className="btn btn-success w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    >
                      <CheckCircle size={18} />
                      <span>{isClocking ? 'Recording...' : 'Clock In Now'}</span>
                    </button>
                  ) : !todayStatus.clockOut ? (
                    <button
                      onClick={handleClockOut}
                      disabled={isClocking}
                      className="btn btn-danger w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    >
                      <Clock size={18} />
                      <span>{isClocking ? 'Recording...' : 'Clock Out for Day'}</span>
                    </button>
                  ) : (
                    <div className="alert alert-success py-2 mb-0 rounded-3 text-center fw-semibold" style={{ fontSize: '0.85rem' }}>
                      ✅ Completed work shift today ({todayStatus.totalHours} hrs)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Analytics Cards */}
            <div className="col-lg-7">
              <div className="content-card h-100">
                <h5 className="fw-bold text-dark mb-3">Attendance Summary (Last 60 Days)</h5>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded-3 border text-center">
                      <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>Present Days</span>
                      <h3 className="fw-bold my-1 text-success">{summary?.totalPresent || 0}</h3>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>on time</span>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded-3 border text-center">
                      <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>Late Arrivals</span>
                      <h3 className="fw-bold my-1 text-warning">{summary?.totalLate || 0}</h3>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>after 9:30 AM</span>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded-3 border text-center">
                      <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>Half Days</span>
                      <h3 className="fw-bold my-1 text-info">{summary?.totalHalfDay || 0}</h3>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>&lt; 5 hours</span>
                    </div>
                  </div>
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded-3 border text-center">
                      <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>Total Hours</span>
                      <h3 className="fw-bold my-1 text-primary">{summary?.totalHours || 0}</h3>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>logged hours</span>
                    </div>
                  </div>
                </div>

                <div className="alert alert-light border rounded-3 p-3 mb-0" style={{ fontSize: '0.82rem' }}>
                  <div className="fw-bold text-dark mb-1">Company Working Hours Policy:</div>
                  <ul className="mb-0 ps-3 text-secondary">
                    <li>Standard shift: 9:00 AM - 5:30 PM (Grace period up to 9:30 AM).</li>
                    <li>Clocking in after 9:30 AM is logged as <strong>Late</strong>.</li>
                    <li>Shifts under 4.5 working hours are categorized as <strong>Half-day</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Personal History Table */}
          <div className="content-card p-0 overflow-hidden">
            <div className="p-3 border-bottom">
              <h5 className="fw-bold text-dark mb-0">My Attendance History</h5>
            </div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Clock size={36} className="mb-2 opacity-50" />
                <p className="mb-0">No past attendance records found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours Worked</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record._id}>
                        <td className="fw-semibold text-dark">{record.date}</td>
                        <td>{record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '-'}</td>
                        <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'In Progress'}</td>
                        <td>
                          <span className="fw-bold text-primary">
                            {record.totalHours ? `${record.totalHours} hrs` : '-'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill badge-${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                          {record.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: COMPANY-WIDE ATTENDANCE LOGS (FOR HR & MANAGERS) */}
      {activeTab === 'company-attendance' && (isHR || isManager) && (
        <>
          {/* Filters */}
          <div className="content-card mb-4 p-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Search size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by employee name or email..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <input
                  type="date"
                  className="form-control"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div className="col-sm-6 col-md-3">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div className="col-md-2">
                <button
                  onClick={() => {
                    setFilterDate('');
                    setFilterStatus('All');
                    setFilterSearch('');
                  }}
                  className="btn btn-outline-secondary w-100"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Company Attendance Table */}
          <div className="content-card p-0 overflow-hidden">
            {companyLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : companyRecords.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Users size={36} className="mb-2 opacity-50" />
                <p className="mb-0">No attendance records found matching filters.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table mb-0">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyRecords.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <div className="fw-bold text-dark">
                            {r.user?.name || `${r.employee?.firstName} ${r.employee?.lastName}`}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {r.user?.email}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border">
                            {r.user?.department || 'General'}
                          </span>
                        </td>
                        <td className="fw-semibold text-dark">{r.date}</td>
                        <td>{r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : '-'}</td>
                        <td>{r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : 'Active'}</td>
                        <td>
                          <span className="fw-bold text-primary">
                            {r.totalHours ? `${r.totalHours} hrs` : '-'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill badge-${r.status.toLowerCase()}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendancePage;
