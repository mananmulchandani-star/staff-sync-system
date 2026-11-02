import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Briefcase,
  Calendar,
  Save,
  CheckCircle,
  Tag,
} from 'lucide-react';

const EmployeeProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable fields
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          const u = res.data.user;
          setProfile(u);
          const emp = u.employeeProfile || {};
          setPhone(emp.phone || '');
          setStreet(emp.address?.street || '');
          setCity(emp.address?.city || '');
          setState(emp.address?.state || '');
          setZipCode(emp.address?.zipCode || '');
          setEmergencyName(emp.emergencyContact?.name || '');
          setEmergencyRel(emp.emergencyContact?.relationship || '');
          setEmergencyPhone(emp.emergencyContact?.phone || '');
          setSkillsInput(emp.skills ? emp.skills.join(', ') : '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const skillsArray = skillsInput
        ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await api.put('/auth/profile', {
        phone,
        address: { street, city, state, zipCode },
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRel,
          phone: emergencyPhone,
        },
        skills: skillsArray,
      });

      if (res.data.success) {
        setSuccessMsg('Your profile has been successfully updated.');
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const emp = profile?.employeeProfile || {};

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Page Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">My Personal Profile</h3>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          View your employment records and maintain your personal contact and skill details.
        </p>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2.5 px-3 rounded-3 mb-4" style={{ fontSize: '0.88rem' }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger py-2.5 px-3 rounded-3 mb-4" style={{ fontSize: '0.88rem' }}>
          {errorMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Left Card: Summary & Badges */}
        <div className="col-lg-4">
          <div className="content-card text-center mb-4">
            <div
              className="rounded-circle mx-auto mb-3 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm fw-bold"
              style={{ width: '80px', height: '80px', fontSize: '1.8rem' }}
            >
              {profile?.name?.charAt(0)}
            </div>
            <h4 className="fw-bold mb-1 text-dark">{profile?.name}</h4>
            <p className="text-muted mb-2" style={{ fontSize: '0.88rem' }}>
              {emp.designation || profile?.designation}
            </p>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className="badge badge-role-employee px-3 py-1.5 rounded-pill">
                {profile?.role}
              </span>
              <span className="badge bg-light text-secondary border px-3 py-1.5 rounded-pill font-monospace">
                {emp.employeeId || 'EMP-XXXX'}
              </span>
            </div>

            <div className="border-top pt-3 text-start d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Department:</span>
                <span className="fw-semibold">{profile?.department}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Status:</span>
                <span className="badge bg-success-subtle text-success">
                  {emp.status || 'Active'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Date of Joining:</span>
                <span className="fw-semibold">
                  {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Skills Tags */}
          <div className="content-card">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Tag size={16} className="text-primary" />
              <span>Professional Skills</span>
            </h6>
            <div className="d-flex flex-wrap gap-1.5">
              {emp.skills && emp.skills.length > 0 ? (
                emp.skills.map((skill, idx) => (
                  <span key={idx} className="badge bg-light text-primary border rounded-pill px-2.5 py-1.5" style={{ fontSize: '0.8rem' }}>
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>No skills listed yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Editable Contact & Emergency Details */}
        <div className="col-lg-8">
          <div className="content-card">
            <form onSubmit={handleSave}>
              <h5 className="fw-bold text-dark mb-3">Contact & Address Details</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    Work Email (Managed by IT)
                  </label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={profile?.email || ''}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="123 Corporate Blvd"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    City
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    State / Province
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="CA"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    Zip Code
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="94105"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-3 border-top pt-3">Emergency Contact</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Jane Doe"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    Relationship
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Spouse / Parent"
                    value={emergencyRel}
                    onChange={(e) => setEmergencyRel(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 999-9999"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-3 border-top pt-3">Skills & Expertise</h5>
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                  Update Skills (comma-separated list)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="React.js, Node.js, MongoDB, TypeScript, Agile Leadership"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                >
                  <Save size={16} />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
