const User = require('../models/User');
const Employee = require('../models/Employee');
const LeaveBalance = require('../models/LeaveBalance');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, designation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const assignedRole = role || 'Employee';

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Engineering',
      designation: designation || (assignedRole === 'Manager' ? 'Team Lead' : 'Associate'),
    });

    // Create linked Employee Profile
    const names = name.trim().split(' ');
    const firstName = names[0] || 'First';
    const lastName = names.slice(1).join(' ') || 'Last';

    const employee = await Employee.create({
      user: user._id,
      firstName,
      lastName,
      email: user.email,
      role: assignedRole,
      department: user.department,
      designation: user.designation,
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

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        employeeProfile: employee._id,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password').populate('employeeProfile');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        employeeProfile: user.employeeProfile,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('employeeProfile');
    const leaveBalance = await LeaveBalance.findOne({ user: req.user._id });

    res.json({
      success: true,
      user,
      leaveBalance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error getting user profile',
    });
  }
};

// @desc    Update personal profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, skills, emergencyContact } = req.body;

    // Update User
    if (name) {
      req.user.name = name;
      await req.user.save();
    }

    // Update Employee
    let employee = await Employee.findOne({ user: req.user._id });
    if (employee) {
      if (name) {
        const names = name.trim().split(' ');
        employee.firstName = names[0] || employee.firstName;
        employee.lastName = names.slice(1).join(' ') || employee.lastName;
      }
      if (phone !== undefined) employee.phone = phone;
      if (address !== undefined) employee.address = { ...employee.address, ...address };
      if (skills !== undefined) employee.skills = skills;
      if (emergencyContact !== undefined) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
      await employee.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: req.user,
      employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating profile',
    });
  }
};
