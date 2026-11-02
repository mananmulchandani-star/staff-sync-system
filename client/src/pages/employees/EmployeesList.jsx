import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Building,
  Check,
  X,
} from 'lucide-react';

const EmployeesList = () => {
  const { isHR, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [modalError, setModalError] = useState('');

  // Form states for Add Employee
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Associate Software Engineer',
    role: 'Employee',
    salary: 60000,
    password: 'Password123!',
    skills: 'JavaScript, React, Node.js',
  });

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter !== 'All') params.department = deptFilter;
      if (roleFilter !== 'All') params.role = roleFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, roleFilter, statusFilter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await api.post('/employees', newEmp);
      if (res.data.success) {
        setActionMsg('Employee onboarded successfully!');
        setShowAddModal(false);
        setNewEmp({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: 'Engineering',
          designation: 'Associate Software Engineer',
          role: 'Employee',
          salary: 60000,
          password: 'Password123!',
          skills: 'JavaScript, React, Node.js',
        });
        await fetchEmployees();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error creating employee');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await api.put(`/employees/${selectedEmp._id}`, selectedEmp);
      if (res.data.success) {
        setActionMsg('Employee updated successfully!');
        setShowEditModal(false);
        setSelectedEmp(null);
        await fetchEmployees();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error updating employee');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from StaffSync?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      setActionMsg(`Employee ${name} removed.`);
      await fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting employee');
    }
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {isHR ? 'Staff & Employee Directory' : 'Company Employee Directory'}
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            {isHR
              ? 'Add, update, search, and manage organizational employee profiles and records.'
              : 'Browse colleagues, find contact details, and view team affiliations.'}
          </p>
        </div>
        {isHR && (
          <button
            onClick={() => {
              setModalError('');
              setShowAddModal(true);
            }}
            className="btn btn-primary d-flex align-items-center gap-2 rounded-3 px-3 py-2 shadow-sm fw-semibold"
          >
            <Plus size={18} />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 mb-4 rounded-3 d-flex align-items-center justify-content-between" style={{ fontSize: '0.88rem' }}>
          <span>{actionMsg}</span>
          <button type="button" className="btn-close p-2" onClick={() => setActionMsg('')}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
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
                placeholder="Search by name, ID, email, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <select
              className="form-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Sales">Sales</option>
              <option value="Design">Design</option>
            </select>
          </div>
          <div className="col-sm-6 col-md-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Employee">Staff / Employee</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR Admin</option>
            </select>
          </div>
          <div className="col-sm-6 col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="content-card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Users size={40} className="mb-2 text-secondary opacity-50" />
            <p className="mb-0">No employee records match the selected criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department & Role</th>
                  <th>Contact</th>
                  {isHR && <th>Compensation</th>}
                  <th>Status</th>
                  {isHR && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="avatar-circle"
                          style={{
                            backgroundColor:
                              emp.role === 'HR'
                                ? '#d97706'
                                : emp.role === 'Manager'
                                ? '#4f46e5'
                                : '#2563eb',
                          }}
                        >
                          {emp.firstName?.charAt(0)}
                          {emp.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                            {emp.designation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border font-monospace">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{emp.department}</div>
                      <span
                        className={`badge rounded-pill ${
                          emp.role === 'HR'
                            ? 'badge-role-hr'
                            : emp.role === 'Manager'
                            ? 'badge-role-manager'
                            : 'badge-role-employee'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 text-secondary" style={{ fontSize: '0.82rem' }}>
                        <Mail size={13} className="text-muted" />
                        <span>{emp.email}</span>
                      </div>
                      {emp.phone && (
                        <div className="d-flex align-items-center gap-1.5 text-muted" style={{ fontSize: '0.78rem' }}>
                          <Phone size={13} />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </td>
                    {isHR && (
                      <td>
                        <span className="fw-semibold text-dark">
                          ${emp.salary ? emp.salary.toLocaleString() : '50,000'}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}> /yr</span>
                      </td>
                    )}
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          emp.status === 'Active'
                            ? 'bg-success-subtle text-success border border-success-subtle'
                            : emp.status === 'On Leave'
                            ? 'bg-warning-subtle text-warning border border-warning-subtle'
                            : 'bg-danger-subtle text-danger border border-danger-subtle'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    {isHR && (
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedEmp({ ...emp });
                              setModalError('');
                              setShowEditModal(true);
                            }}
                            className="btn btn-outline-secondary btn-sm p-1.5 rounded-2"
                            title="Edit Record"
                          >
                            <Edit2 size={15} />
                          </button>
                          {emp.user?._id !== user._id && (
                            <button
                              onClick={() => handleDelete(emp._id, `${emp.firstName} ${emp.lastName}`)}
                              className="btn btn-outline-danger btn-sm p-1.5 rounded-2"
                              title="Delete Employee"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Onboard New Employee</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-danger py-2 px-3 rounded-3 mb-3" style={{ fontSize: '0.88rem' }}>
                      {modalError}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newEmp.firstName}
                        onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newEmp.lastName}
                        onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Corporate Email</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={newEmp.email}
                        onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={newEmp.phone}
                        onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Department</label>
                      <select
                        className="form-select"
                        value={newEmp.department}
                        onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
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
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Role</label>
                      <select
                        className="form-select"
                        value={newEmp.role}
                        onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="HR">HR Admin</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Annual Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newEmp.salary}
                        onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newEmp.designation}
                        onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Default Password</label>
                      <input
                        type="password"
                        className="form-control"
                        required
                        value={newEmp.password}
                        onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Skills (comma separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="React, Node.js, Project Management"
                        value={newEmp.skills}
                        onChange={(e) => setNewEmp({ ...newEmp, skills: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">
                    Create Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmp && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  Update Employee Record ({selectedEmp.employeeId})
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-danger py-2 px-3 rounded-3 mb-3" style={{ fontSize: '0.88rem' }}>
                      {modalError}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmp.firstName || ''}
                        onChange={(e) => setSelectedEmp({ ...selectedEmp, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmp.lastName || ''}
                        onChange={(e) => setSelectedEmp({ ...selectedEmp, lastName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Department</label>
                      <select
                        className="form-select"
                        value={selectedEmp.department || 'Engineering'}
                        onChange={(e) => setSelectedEmp({ ...selectedEmp, department: e.target.value })}
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
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmp.designation || ''}
                        onChange={(e) => setSelectedEmp({ ...selectedEmp, designation: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Role</label>
                      <select
                        className="form-select"
                        value={selectedEmp.role || 'Employee'}
                        onChange={(e) => setSelectedEmp({ ...selectedEmp, role: e.target.value })}
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="HR">HR Admin</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Status</label>
                      <select
                        className="form-select"
                        value={selectedEmp.status || 'Active'}
                        onChange={(e) => setSelectedEmp({ ...selectedEmp, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={selectedEmp.salary || 50000}
                        onChange={(e) => setSelectedEmp({ ...selectedEmp, salary: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmp.phone || ''}
                        onChange={(e) => setSelectedEmp({ ...selectedEmp, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">
                    Save Changes
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

export default EmployeesList;
