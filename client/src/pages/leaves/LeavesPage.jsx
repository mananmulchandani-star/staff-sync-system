import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDays,
  Plus,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Filter,
} from 'lucide-react';

const LeavesPage = () => {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState(isHR || isManager ? 'approvals' : 'my-leaves');

  // Balances & My leaves
  const [balances, setBalances] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applyError, setApplyError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review modal / action
  const [reviewingLeave, setReviewingLeave] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [statusFilter, setStatusFilter] = useState('Pending');

  const fetchLeavesData = async () => {
    try {
      const [balRes, myRes] = await Promise.all([
        api.get('/leaves/balances'),
        api.get('/leaves/my-leaves'),
      ]);

      if (balRes.data.success) setBalances(balRes.data.data);
      if (myRes.data.success) setMyLeaves(myRes.data.data);

      if (isHR || isManager) {
        const allRes = await api.get('/leaves/all', {
          params: statusFilter !== 'All' ? { status: statusFilter } : {},
        });
        if (allRes.data.success) setAllLeaves(allRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesData();
  }, [statusFilter]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    try {
      const res = await api.post('/leaves/apply', applyData);
      if (res.data.success) {
        setSuccessMsg('Leave request submitted successfully for management review.');
        setShowApplyModal(false);
        setApplyData({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
        await fetchLeavesData();
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Error applying for leave');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/leaves/${reviewingLeave._id}/review`, {
        status: reviewAction,
        reviewRemarks,
      });
      if (res.data.success) {
        setSuccessMsg(`Leave request has been marked as ${reviewAction}.`);
        setReviewingLeave(null);
        setReviewRemarks('');
        await fetchLeavesData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error reviewing leave request');
    }
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Leave Management & Approvals</h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Submit leave requests, view remaining allowances, and review team time-off applications.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Tab Switcher for Managers & HR */}
          {(isHR || isManager) && (
            <div className="btn-group p-1 bg-light border rounded-pill" role="group">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  activeTab === 'approvals' ? 'btn-primary' : 'btn-light text-muted'
                }`}
                onClick={() => setActiveTab('approvals')}
              >
                Approval Queue
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  activeTab === 'my-leaves' ? 'btn-primary' : 'btn-light text-muted'
                }`}
                onClick={() => setActiveTab('my-leaves')}
              >
                My Leaves
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setApplyError('');
              setShowApplyModal(true);
            }}
            className="btn btn-primary d-flex align-items-center gap-2 rounded-3 px-3 py-2 shadow-sm fw-semibold"
          >
            <Plus size={18} />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2.5 px-3 rounded-3 mb-4 d-flex justify-content-between align-items-center" style={{ fontSize: '0.88rem' }}>
          <span>{successMsg}</span>
          <button type="button" className="btn-close p-2" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {/* Leave Balances Header Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.82rem' }}>Casual Leave</span>
              <span className="badge bg-primary-subtle text-primary rounded-pill">Paid</span>
            </div>
            <h3 className="fw-bold my-1 text-primary">
              {(balances?.casual?.total || 10) - (balances?.casual?.used || 0)}
            </h3>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              Used: {balances?.casual?.used || 0} / {balances?.casual?.total || 10} days
            </span>
          </div>
        </div>

        <div className="col-sm-6 col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.82rem' }}>Sick Leave</span>
              <span className="badge bg-success-subtle text-success rounded-pill">Medical</span>
            </div>
            <h3 className="fw-bold my-1 text-success">
              {(balances?.sick?.total || 10) - (balances?.sick?.used || 0)}
            </h3>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              Used: {balances?.sick?.used || 0} / {balances?.sick?.total || 10} days
            </span>
          </div>
        </div>

        <div className="col-sm-6 col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.82rem' }}>Annual / Vacation</span>
              <span className="badge bg-warning-subtle text-warning rounded-pill">Planned</span>
            </div>
            <h3 className="fw-bold my-1 text-warning">
              {(balances?.annual?.total || 15) - (balances?.annual?.used || 0)}
            </h3>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              Used: {balances?.annual?.used || 0} / {balances?.annual?.total || 15} days
            </span>
          </div>
        </div>

        <div className="col-sm-6 col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.82rem' }}>Pending Requests</span>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill">Status</span>
            </div>
            <h3 className="fw-bold my-1 text-dark">
              {myLeaves.filter((l) => l.status === 'Pending').length}
            </h3>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              Awaiting manager action
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: APPROVAL QUEUE (FOR MANAGERS & HR) */}
      {activeTab === 'approvals' && (isHR || isManager) && (
        <div className="content-card p-0 overflow-hidden mb-4">
          <div className="p-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold text-dark mb-0">Team Leave Requests & Approvals</h5>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>Filter by Status:</span>
              <select
                className="form-select form-select-sm"
                style={{ width: '140px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Only</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : allLeaves.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <CalendarDays size={40} className="mb-2 opacity-50" />
              <p className="mb-0">No leave requests found for status "{statusFilter}".</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th className="text-end">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {allLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <div className="fw-bold text-dark">
                          {leave.user?.name || `${leave.employee?.firstName} ${leave.employee?.lastName}`}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {leave.user?.department} • {leave.employee?.employeeId || 'EMP'}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-primary border">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                          {new Date(leave.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          to {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{leave.totalDays} day(s)</span>
                      </td>
                      <td style={{ maxWidth: '220px' }}>
                        <span className="d-inline-block text-truncate w-100" title={leave.reason}>
                          {leave.reason}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            leave.status === 'Approved'
                              ? 'bg-success-subtle text-success'
                              : leave.status === 'Rejected'
                              ? 'bg-danger-subtle text-danger'
                              : 'bg-warning-subtle text-warning'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {leave.status === 'Pending' ? (
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              onClick={() => {
                                setReviewingLeave(leave);
                                setReviewAction('Approved');
                                setReviewRemarks('Approved.');
                              }}
                              className="btn btn-sm btn-success d-flex align-items-center gap-1 rounded-2 px-2.5 py-1"
                              title="Approve"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setReviewingLeave(leave);
                                setReviewAction('Rejected');
                                setReviewRemarks('Rejected.');
                              }}
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-2 px-2.5 py-1"
                              title="Reject"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Reviewed by {leave.reviewedBy?.name || 'Manager'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY LEAVES (FOR EMPLOYEES & MANAGERS) */}
      {activeTab === 'my-leaves' && (
        <div className="content-card p-0 overflow-hidden">
          <div className="p-3 border-bottom">
            <h5 className="fw-bold text-dark mb-0">My Submitted Leave Applications</h5>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : myLeaves.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <CalendarDays size={40} className="mb-2 opacity-50" />
              <p className="mb-0">You have not submitted any leave requests yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Reviewer Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <span className="badge bg-light text-primary border">
                          {l.leaveType}
                        </span>
                      </td>
                      <td className="fw-semibold text-dark">
                        {new Date(l.startDate).toLocaleDateString()}
                      </td>
                      <td className="fw-semibold text-dark">
                        {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="fw-bold">{l.totalDays} day(s)</span>
                      </td>
                      <td style={{ maxWidth: '250px' }}>{l.reason}</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            l.status === 'Approved'
                              ? 'bg-success-subtle text-success'
                              : l.status === 'Rejected'
                              ? 'bg-danger-subtle text-danger'
                              : 'bg-warning-subtle text-warning'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                        {l.reviewRemarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Submit Leave Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)}></button>
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body p-4">
                  {applyError && (
                    <div className="alert alert-danger py-2 px-3 rounded-3 mb-3" style={{ fontSize: '0.88rem' }}>
                      {applyError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                      Leave Type
                    </label>
                    <select
                      className="form-select"
                      value={applyData.leaveType}
                      onChange={(e) => setApplyData({ ...applyData, leaveType: e.target.value })}
                    >
                      <option value="Casual">Casual Leave (Available: {(balances?.casual?.total || 10) - (balances?.casual?.used || 0)})</option>
                      <option value="Sick">Sick Leave (Available: {(balances?.sick?.total || 10) - (balances?.sick?.used || 0)})</option>
                      <option value="Annual">Annual Vacation (Available: {(balances?.annual?.total || 15) - (balances?.annual?.used || 0)})</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyData.startDate}
                        onChange={(e) => setApplyData({ ...applyData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyData.endDate}
                        onChange={(e) => setApplyData({ ...applyData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                      Reason for Leave
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      required
                      placeholder="Please specify reason for your time-off..."
                      value={applyData.reason}
                      onChange={(e) => setApplyData({ ...applyData, reason: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowApplyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Decision Modal */}
      {reviewingLeave && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {reviewAction} Leave Application
                </h5>
                <button type="button" className="btn-close" onClick={() => setReviewingLeave(null)}></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body p-4">
                  <p className="text-muted" style={{ fontSize: '0.88rem' }}>
                    Confirm your decision for{' '}
                    <strong>{reviewingLeave.user?.name || 'Employee'}</strong> for{' '}
                    <strong>{reviewingLeave.totalDays} day(s)</strong> of {reviewingLeave.leaveType} leave.
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                      Decision Remarks / Notes
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={reviewRemarks}
                      onChange={(e) => setReviewRemarks(e.target.value)}
                      placeholder="e.g. Approved, enjoy your time off! or Project deadline conflict."
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setReviewingLeave(null)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn rounded-3 px-4 fw-semibold ${
                      reviewAction === 'Approved' ? 'btn-success' : 'btn-danger'
                    }`}
                  >
                    Confirm {reviewAction}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesPage;
