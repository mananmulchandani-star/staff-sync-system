import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Pin,
  CheckCircle,
  Tag,
} from 'lucide-react';

const AnnouncementsPage = () => {
  const { user, isHR } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [modalError, setModalError] = useState('');

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'General',
    isPinned: false,
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await api.post('/announcements', newNotice);
      if (res.data.success) {
        setActionMsg('Announcement broadcasted successfully to all staff.');
        setShowCreateModal(false);
        setNewNotice({
          title: '',
          content: '',
          category: 'General',
          isPinned: false,
        });
        await fetchAnnouncements();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error posting announcement');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      await api.delete(`/announcements/${id}`);
      setActionMsg('Announcement deleted.');
      await fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting announcement');
    }
  };

  const filtered = announcements.filter((item) => {
    if (filterCategory === 'All') return true;
    return item.category === filterCategory;
  });

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Company Announcements & News</h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Official notices, organizational events, and executive policy updates.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: '150px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Urgent">Urgent</option>
            <option value="Event">Events</option>
            <option value="Policy">Policy</option>
            <option value="General">General</option>
          </select>

          {isHR && (
            <button
              onClick={() => {
                setModalError('');
                setShowCreateModal(true);
              }}
              className="btn btn-primary d-flex align-items-center gap-2 rounded-3 px-3 py-2 shadow-sm fw-semibold"
            >
              <Plus size={18} />
              <span>Post Announcement</span>
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

      {/* Announcements Feed */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="content-card text-center py-5 text-muted">
          <Megaphone size={40} className="mb-2 opacity-50" />
          <p className="mb-0">No announcements found for this category.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((item) => (
            <div
              key={item._id}
              className={`content-card ${
                item.isPinned ? 'border-primary border-2' : ''
              }`}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {item.isPinned && (
                    <span className="badge bg-danger rounded-pill d-inline-flex align-items-center gap-1">
                      <Pin size={12} /> PINNED NOTICE
                    </span>
                  )}
                  <span
                    className={`badge rounded-pill ${
                      item.category === 'Urgent'
                        ? 'bg-danger-subtle text-danger'
                        : item.category === 'Event'
                        ? 'bg-info-subtle text-info'
                        : item.category === 'Policy'
                        ? 'bg-warning-subtle text-warning'
                        : 'bg-secondary-subtle text-secondary'
                    }`}
                  >
                    {item.category}
                  </span>
                  <h5 className="fw-bold text-dark mb-0">{item.title}</h5>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {isHR && (
                    <button
                      onClick={() => handleDelete(item._id, item.title)}
                      className="btn btn-outline-secondary btn-sm p-1 rounded-2"
                      title="Delete Announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-secondary mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.5' }}>
                {item.content}
              </p>

              <div className="d-flex justify-content-between align-items-center border-top pt-2">
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Broadcast by: <strong className="text-dark">{item.authorName || 'HR Department'}</strong>
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Target Audience: {item.targetRole} Staff
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Announcement Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Broadcast Company Announcement</h5>
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
                      Announcement Headline
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Annual Company Offsite 2026 - Save The Date"
                      required
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Category
                      </label>
                      <select
                        className="form-select"
                        value={newNotice.category}
                        onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                      >
                        <option value="General">General News</option>
                        <option value="Urgent">Urgent / Action Required</option>
                        <option value="Event">Company Event</option>
                        <option value="Policy">Policy & Guidelines</option>
                      </select>
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isPinnedCheck"
                          checked={newNotice.isPinned}
                          onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="isPinnedCheck" style={{ fontSize: '0.85rem' }}>
                          Pin this announcement to top of feed
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                      Announcement Body
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      required
                      placeholder="Detailed announcement details for employees..."
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">
                    Publish Now
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

export default AnnouncementsPage;
