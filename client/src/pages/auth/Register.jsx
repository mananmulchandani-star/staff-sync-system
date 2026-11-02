import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Mail, Lock, User, Briefcase, Building, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Engineering',
    designation: 'Associate Software Engineer',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please verify details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3" style={{ backgroundColor: '#f1f5f9' }}>
      <div className="text-center mb-4">
        <div className="bg-primary text-white p-3 rounded-4 d-inline-flex shadow-sm mb-3">
          <Users size={32} />
        </div>
        <h2 className="fw-bold text-dark mb-1">Join StaffSync</h2>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          Create an employee or administrator account
        </p>
      </div>

      <div className="card shadow-sm border-0 rounded-4 w-100" style={{ maxWidth: '520px' }}>
        <div className="card-body p-4 p-sm-5">
          <h4 className="fw-bold mb-3 text-dark">Register Account</h4>

          {error && (
            <div className="alert alert-danger py-2.5 px-3 mb-4 rounded-3 d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                  Full Name
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <User size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    className="form-control border-start-0 ps-0"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail size={16} className="text-muted" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-control border-start-0 ps-0"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                  Access Role
                </label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR Administrator</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                  Department
                </label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                  Job Designation
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Briefcase size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    name="designation"
                    className="form-control border-start-0 ps-0"
                    placeholder="e.g. Frontend Developer"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold mt-4 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Already registered?{' '}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Sign in here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
