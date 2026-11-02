import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for demo accounts
  const quickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3" style={{ backgroundColor: '#f1f5f9' }}>
      <div className="text-center mb-4">
        <div className="bg-primary text-white p-3 rounded-4 d-inline-flex shadow-sm mb-3">
          <Users size={32} />
        </div>
        <h2 className="fw-bold text-dark mb-1">StaffSync</h2>
        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
          Modern Human Resource Management Solution
        </p>
      </div>

      <div className="card shadow-sm border-0 rounded-4 w-100" style={{ maxWidth: '440px' }}>
        <div className="card-body p-4 p-sm-5">
          <h4 className="fw-bold mb-3 text-dark">Sign In</h4>
          <p className="text-muted mb-4" style={{ fontSize: '0.88rem' }}>
            Enter your credentials to access your organization workspace.
          </p>

          {error && (
            <div className="alert alert-danger py-2.5 px-3 mb-4 rounded-3 d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                Work Email
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Mail size={16} className="text-muted" />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-semibold text-secondary mb-0" style={{ fontSize: '0.85rem' }}>
                  Password
                </label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex align-items-center gap-1.5 text-muted mb-2.5" style={{ fontSize: '0.78rem' }}>
              <ShieldCheck size={14} className="text-primary" />
              <span className="fw-semibold">1-Click Demo Accounts (Password: Password123!)</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => quickFill('hr@staffsync.com')}
                className="demo-role-btn d-flex align-items-center gap-1"
              >
                <span className="badge badge-role-hr rounded-pill">HR</span>
                <span>Sarah (HR Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('manager@staffsync.com')}
                className="demo-role-btn d-flex align-items-center gap-1"
              >
                <span className="badge badge-role-manager rounded-pill">Manager</span>
                <span>Alex (Lead)</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('employee@staffsync.com')}
                className="demo-role-btn d-flex align-items-center gap-1"
              >
                <span className="badge badge-role-employee rounded-pill">Staff</span>
                <span>David (Developer)</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Need a new account?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Register here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
