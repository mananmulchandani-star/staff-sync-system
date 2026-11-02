const Employee = require('../models/Employee');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');

// @desc    Get all employees with filtering & search
// @route   GET /api/employees
// @access  Private (All authenticated users can see directory, HR can see full details)
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, role, status, search } = req.query;
    let query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(query)
      .populate('user', 'name email role department')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving employees',
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('manager', 'name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving employee',
    });
  }
};

// @desc    Create new employee (HR only)
// @route   POST /api/employees
// @access  Private (HR only)
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      role,
      manager,
      salary,
      skills,
      address,
      password,
    } = req.body;

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const assignedRole = role || 'Employee';
    const fullName = `${firstName} ${lastName}`.trim();

    // Create User login account
    const user = await User.create({
      name: fullName,
      email,
      password: password || 'Welcome123!',
      role: assignedRole,
      department,
      designation,
    });

    // Create Employee record
    const employee = await Employee.create({
      user: user._id,
      firstName,
      lastName,
      email,
      phone: phone || '',
      department,
      designation,
      role: assignedRole,
      manager: manager || null,
      salary: salary ? Number(salary) : 50000,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      address: address || {},
      status: 'Active',
    });

    user.employeeProfile = employee._id;
    await user.save();

    // Create Leave Balance
    await LeaveBalance.create({
      user: user._id,
      casual: { total: 10, used: 0 },
      sick: { total: 10, used: 0 },
      annual: { total: 15, used: 0 },
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully with credentials generated.',
      data: employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error creating employee',
    });
  }
};

// @desc    Update employee (HR only)
// @route   PUT /api/employees/:id
// @access  Private (HR only)
exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const {
      firstName,
      lastName,
      phone,
      department,
      designation,
      role,
      manager,
      salary,
      status,
      skills,
      address,
    } = req.body;

    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (phone !== undefined) employee.phone = phone;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (role) employee.role = role;
    if (manager !== undefined) employee.manager = manager || null;
    if (salary !== undefined) employee.salary = Number(salary);
    if (status) employee.status = status;
    if (skills !== undefined) {
      employee.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }
    if (address) employee.address = { ...employee.address, ...address };

    await employee.save();

    // Also sync User record name/role/department
    if (employee.user) {
      const user = await User.findById(employee.user);
      if (user) {
        if (firstName || lastName) user.name = `${employee.firstName} ${employee.lastName}`;
        if (role) user.role = role;
        if (department) user.department = department;
        if (designation) user.designation = designation;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating employee',
    });
  }
};

// @desc    Delete employee (HR only)
// @route   DELETE /api/employees/:id
// @access  Private (HR only)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
      await LeaveBalance.deleteOne({ user: employee.user });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Employee and associated user deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error deleting employee',
    });
  }
};
