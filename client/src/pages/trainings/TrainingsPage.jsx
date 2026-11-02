import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Plus,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Building,
} from 'lucide-react';

const TrainingsPage = () => {
  const { user, isHR, isManager } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [modalError, setModalError] = useState('');

  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    trainer: '',
    department: 'All Departments',
    startDate: '',
    endDate: '',
    capacity: 30,
  });

  const fetchTrainings = async () => {
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/trainings', { params });
      if (res.data.success) {
        setTrainings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [statusFilter]);

  const handleEnrollToggle = async (trainingId) => {
    try {
      const res = await api.post(`/trainings/${trainingId}/enroll`);
      if (res.data.success) {
        setActionMsg(res.data.message);
        await fetchTrainings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating enrollment');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await api.post('/trainings', newTraining);
      if (res.data.success) {
        setActionMsg('Training program scheduled successfully.');
        setShowCreateModal(false);
        setNewTraining({
          title: '',
          description: '',
          trainer: '',
          department: 'All Departments',
          startDate: '',
          endDate: '',
          capacity: 30,
        });
        await fetchTrainings();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error creating training program');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete program "${title}"?`)) return;
    try {
      await api.delete(`/trainings/${id}`);
      setActionMsg(`Program deleted.`);
      await fetchTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting program');
    }
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Training & Development Programs</h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Empower teams through continuous learning, certifications, and technical workshops.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Programs</option>
            <option value="Upcoming">Upcoming</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {(isHR || isManager) && (
            <button
              onClick={() => {
                setModalError('');
                setShowCreateModal(true);
              }}
              className="btn btn-primary d-flex align-items-center gap-2 rounded-3 px-3 py-2 shadow-sm fw-semibold"
            >
              <Plus size={18} />
              <span>Schedule Training</span>
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-info alert-dismissible fade show py-2.5 px-3 rounded-3 mb-4 d-flex justify-content-between align-items-center" style={{ fontSize: '0.88rem' }}>
          <span>{actionMsg}</span>
          <button type="button" className="btn-close p-2" onClick={() => setActionMsg('')}></button>
        </div>
      )}

      {/* Trainings Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : trainings.length === 0 ? (
        <div className="content-card text-center py-5 text-muted">
          <GraduationCap size={48} className="mb-2 opacity-50" />
          <p className="mb-0">No training programs found matching criteria.</p>
        </div>
      ) : (
        <div className="row g-4">
          {trainings.map((t) => {
            const isEnrolled = t.enrolledEmployees?.some(
              (emp) => emp._id === user._id || emp === user._id
            );
            const enrolledCount = t.enrolledEmployees?.length || 0;
            const isFull = enrolledCount >= t.capacity;

            return (
              <div key={t._id} className="col-lg-6">
                <div className="content-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-light text-primary border rounded-pill">
                        {t.department}
                      </span>
                      <span
                        className={`badge rounded-pill ${
                          t.status === 'Completed'
                            ? 'bg-secondary-subtle text-secondary'
                            : t.status === 'In Progress'
                            ? 'bg-success-subtle text-success'
                            : 'bg-primary-subtle text-primary'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                    <p className="text-secondary mb-3" style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
                      {t.description}
                    </p>

                    <div className="p-3 bg-light rounded-3 border mb-3 d-flex flex-column gap-1.5" style={{ fontSize: '0.82rem' }}>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Instructor / Trainer:</span>
                        <span className="fw-semibold text-dark">{t.trainer}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Schedule:</span>
                        <span className="fw-semibold text-dark">
                          {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Capacity:</span>
                        <span className="fw-semibold text-dark">
                          {enrolledCount} / {t.capacity} participants
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div>
                      {isEnrolled ? (
                        <span className="badge bg-success-subtle text-success d-inline-flex align-items-center gap-1 p-2 rounded-pill">
                          <CheckCircle size={14} /> Enrolled
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {isFull ? 'Program Full' : 'Open for enrollment'}
                        </span>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      {t.status !== 'Completed' && (
                        <button
                          onClick={() => handleEnrollToggle(t._id)}
                          className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                            isEnrolled
                              ? 'btn-outline-danger'
                              : isFull
                              ? 'btn-secondary disabled'
                              : 'btn-primary'
                          }`}
                        >
                          {isEnrolled ? 'Unenroll' : 'Enroll Now'}
                        </button>
                      )}

                      {(isHR || isManager) && (
                        <button
                          onClick={() => handleDelete(t._id, t.title)}
                          className="btn btn-outline-secondary btn-sm p-1.5 rounded-2"
                          title="Delete Program"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Training Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Schedule Training Program</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-danger py-2 px-3 rounded-3 mb-3" style={{ fontSize: '0.88rem' }}>
                      {modalError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                      Program Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Advanced Docker & Kubernetes for Production"
                      required
                      value={newTraining.title}
                      onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                      Description & Learning Objectives
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      required
                      placeholder="Summary of modules covered, prerequisites, and key outcomes..."
                      value={newTraining.description}
                      onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Trainer / Instructor Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Sarah Jenkins or External Vendor"
                        value={newTraining.trainer}
                        onChange={(e) => setNewTraining({ ...newTraining, trainer: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Target Department
                      </label>
                      <select
                        className="form-select"
                        value={newTraining.department}
                        onChange={(e) => setNewTraining({ ...newTraining, department: e.target.value })}
                      >
                        <option value="All Departments">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={newTraining.startDate}
                        onChange={(e) => setNewTraining({ ...newTraining, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={newTraining.endDate}
                        onChange={(e) => setNewTraining({ ...newTraining, endDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Capacity
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={newTraining.capacity}
                        onChange={(e) => setNewTraining({ ...newTraining, capacity: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">
                    Publish Program
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

export default TrainingsPage;
