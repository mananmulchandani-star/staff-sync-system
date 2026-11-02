const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../models/Employee');

// Helper to compute inclusive business days between two dates
const calculateDays = (start, end) => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const timeDiff = d2.getTime() - d1.getTime();
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  return dayDiff > 0 ? dayDiff : 1;
};

// @desc    Apply for a leave
// @route   POST /api/leaves/apply
// @access  Private (All employees)
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leaveType, startDate, endDate, and reason.',
      });
    }

    const totalDays = calculateDays(startDate, endDate);

    // Check balance if not Unpaid
    let balance = await LeaveBalance.findOne({ user: req.user._id });
    if (!balance) {
      balance = await LeaveBalance.create({
        user: req.user._id,
        casual: { total: 10, used: 0 },
        sick: { total: 10, used: 0 },
        annual: { total: 15, used: 0 },
      });
    }

    const typeKey = leaveType.toLowerCase();
    if (['casual', 'sick', 'annual'].includes(typeKey)) {
      const remaining = balance[typeKey].total - balance[typeKey].used;
      if (totalDays > remaining) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Requested: ${totalDays} days, Available: ${remaining} days.`,
        });
      }
    }

    const employee = await Employee.findOne({ user: req.user._id });

    const leave = await Leave.create({
      user: req.user._id,
      employee: employee ? employee._id : null,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      data: leave,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error applying for leave',
    });
  }
};

// @desc    Get logged in user's leave requests
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving leave requests',
    });
  }
};

// @desc    Get user's leave balances
// @route   GET /api/leaves/balances
// @access  Private
exports.getLeaveBalances = async (req, res) => {
  try {
    let balance = await LeaveBalance.findOne({ user: req.user._id });
    if (!balance) {
      balance = await LeaveBalance.create({
        user: req.user._id,
        casual: { total: 10, used: 0 },
        sick: { total: 10, used: 0 },
        annual: { total: 15, used: 0 },
      });
    }

    res.json({
      success: true,
      data: balance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving balances',
    });
  }
};

// @desc    Get all leave requests (for HR and Managers)
// @route   GET /api/leaves/all
// @access  Private (HR and Manager)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status, leaveType } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'All') {
      query.leaveType = leaveType;
    }

    const leaves = await Leave.find(query)
      .populate('user', 'name email role department')
      .populate('employee', 'firstName lastName department designation employeeId')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving leaves list',
    });
  }
};

// @desc    Approve or Reject leave request (HR and Manager)
// @route   PUT /api/leaves/:id/review
// @access  Private (HR and Manager)
exports.reviewLeaveRequest = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected.',
      });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request is already ${leave.status}.`,
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewRemarks = reviewRemarks || '';

    // If approved, update leave balance
    if (status === 'Approved') {
      const typeKey = leave.leaveType.toLowerCase();
      if (['casual', 'sick', 'annual'].includes(typeKey)) {
        let balance = await LeaveBalance.findOne({ user: leave.user });
        if (balance) {
          balance[typeKey].used += leave.totalDays;
          await balance.save();
        }
      }

      // Update employee status to 'On Leave' if leave starts today
      const today = new Date().toISOString().split('T')[0];
      const start = new Date(leave.startDate).toISOString().split('T')[0];
      if (start <= today) {
        await Employee.findOneAndUpdate({ user: leave.user }, { status: 'On Leave' });
      }
    }

    await leave.save();

    res.json({
      success: true,
      message: `Leave request has been ${status}.`,
      data: leave,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error reviewing leave request',
    });
  }
};
