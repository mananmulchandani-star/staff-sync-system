const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper to get formatted today date YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Clock In for today
// @route   POST /api/attendance/clock-in
// @access  Private (All employees)
exports.clockIn = async (req, res) => {
  try {
    const today = getTodayDateString();
    const existing = await Attendance.findOne({ user: req.user._id, date: today });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked in for today.',
        data: existing,
      });
    }

    const employee = await Employee.findOne({ user: req.user._id });
    const now = new Date();

    // Check if late (e.g. clock in after 9:30 AM local)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let status = 'Present';
    if (hours > 9 || (hours === 9 && minutes > 30)) {
      status = 'Late';
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      employee: employee ? employee._id : null,
      date: today,
      clockIn: now,
      status,
    });

    res.status(201).json({
      success: true,
      message: `Clocked in successfully at ${now.toLocaleTimeString()}`,
      data: attendance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error clocking in',
    });
  }
};

// @desc    Clock Out for today
// @route   POST /api/attendance/clock-out
// @access  Private (All employees)
exports.clockOut = async (req, res) => {
  try {
    const today = getTodayDateString();
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'You have not clocked in yet today.',
      });
    }

    if (attendance.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked out for today.',
        data: attendance,
      });
    }

    const now = new Date();
    attendance.clockOut = now;

    // Calculate hours worked
    const diffMs = now.getTime() - new Date(attendance.clockIn).getTime();
    const hoursWorked = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.totalHours = hoursWorked;

    if (hoursWorked < 4.5 && attendance.status !== 'Late') {
      attendance.status = 'Half-day';
    }

    await attendance.save();

    res.json({
      success: true,
      message: `Clocked out successfully at ${now.toLocaleTimeString()}. Total worked: ${hoursWorked} hrs.`,
      data: attendance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error clocking out',
    });
  }
};

// @desc    Get current user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayStatus = async (req, res) => {
  try {
    const today = getTodayDateString();
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });

    res.json({
      success: true,
      data: attendance || null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving today status',
    });
  }
};

// @desc    Get current user's attendance history
// @route   GET /api/attendance/my-history
// @access  Private
exports.getMyAttendanceHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(60);

    // Summary calculations
    const totalPresent = history.filter(h => h.status === 'Present').length;
    const totalLate = history.filter(h => h.status === 'Late').length;
    const totalHalfDay = history.filter(h => h.status === 'Half-day').length;
    const totalHours = history.reduce((sum, h) => sum + (h.totalHours || 0), 0);

    res.json({
      success: true,
      summary: {
        totalDays: history.length,
        totalPresent,
        totalLate,
        totalHalfDay,
        totalHours: parseFloat(totalHours.toFixed(1)),
      },
      data: history,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving attendance history',
    });
  }
};

// @desc    Get all employees attendance (HR & Manager)
// @route   GET /api/attendance/all
// @access  Private (HR & Manager)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, status, search } = req.query;
    let query = {};

    if (date) {
      query.date = date;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const records = await Attendance.find(query)
      .populate('user', 'name email role department')
      .populate('employee', 'firstName lastName department designation employeeId')
      .sort({ date: -1, clockIn: -1 });

    let filtered = records;
    if (search) {
      filtered = records.filter(r => {
        const name = r.user?.name || '';
        const email = r.user?.email || '';
        const dept = r.user?.department || '';
        const empId = r.employee?.employeeId || '';
        const s = search.toLowerCase();
        return (
          name.toLowerCase().includes(s) ||
          email.toLowerCase().includes(s) ||
          dept.toLowerCase().includes(s) ||
          empId.toLowerCase().includes(s)
        );
      });
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving company attendance',
    });
  }
};
