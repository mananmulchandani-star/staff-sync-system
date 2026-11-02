const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Training = require('../models/Training');
const Announcement = require('../models/Announcement');

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get dashboard metrics tailored to logged-in user's role
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const today = getTodayDateString();

    if (role === 'HR') {
      const [
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        todayAttendance,
        pendingLeaves,
        upcomingTrainings,
        recentAnnouncements,
        departments,
      ] = await Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ status: 'Active' }),
        Employee.countDocuments({ status: 'On Leave' }),
        Attendance.find({ date: today }),
        Leave.countDocuments({ status: 'Pending' }),
        Training.countDocuments({ status: { $ne: 'Completed' } }),
        Announcement.find().sort({ createdAt: -1 }).limit(5),
        Employee.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } },
        ]),
      ]);

      const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
      const lateCount = todayAttendance.filter(a => a.status === 'Late').length;
      const todayCheckedIn = todayAttendance.length;
      const attendanceRate = totalEmployees > 0 
        ? Math.round((todayCheckedIn / totalEmployees) * 100) 
        : 0;

      return res.json({
        success: true,
        role: 'HR',
        stats: {
          totalEmployees,
          activeEmployees,
          onLeaveEmployees,
          todayCheckedIn,
          presentCount,
          lateCount,
          attendanceRate,
          pendingLeaves,
          upcomingTrainings,
          departments,
        },
        recentAnnouncements,
      });
    }

    if (role === 'Manager') {
      // Find employees in this manager's department or managed by this manager
      const teamEmployees = await Employee.find({
        $or: [{ department: req.user.department }, { manager: req.user._id }],
      });
      const teamUserIds = teamEmployees.map(e => e.user);

      const [pendingLeaves, teamAttendanceToday, departmentTrainings, announcements] =
        await Promise.all([
          Leave.countDocuments({ user: { $in: teamUserIds }, status: 'Pending' }),
          Attendance.find({ user: { $in: teamUserIds }, date: today }),
          Training.countDocuments({
            $or: [{ department: req.user.department }, { department: 'All Departments' }],
            status: { $ne: 'Completed' },
          }),
          Announcement.find().sort({ createdAt: -1 }).limit(5),
        ]);

      return res.json({
        success: true,
        role: 'Manager',
        stats: {
          teamSize: teamEmployees.length,
          teamPresentToday: teamAttendanceToday.length,
          pendingTeamLeaves: pendingLeaves,
          activeTrainings: departmentTrainings,
        },
        teamEmployees,
        recentAnnouncements: announcements,
      });
    }

    // Default Employee role stats
    const [todayAttendance, leaveBalance, myLeaves, enrolledTrainings, announcements] =
      await Promise.all([
        Attendance.findOne({ user: req.user._id, date: today }),
        LeaveBalance.findOne({ user: req.user._id }),
        Leave.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
        Training.countDocuments({ enrolledEmployees: req.user._id }),
        Announcement.find().sort({ isPinned: -1, createdAt: -1 }).limit(5),
      ]);

    const myPendingLeaves = myLeaves.filter(l => l.status === 'Pending').length;

    res.json({
      success: true,
      role: 'Employee',
      stats: {
        todayAttendance,
        leaveBalance: leaveBalance || {
          casual: { total: 10, used: 0 },
          sick: { total: 10, used: 0 },
          annual: { total: 15, used: 0 },
        },
        myPendingLeaves,
        enrolledTrainingsCount: enrolledTrainings,
      },
      recentLeaves: myLeaves,
      recentAnnouncements: announcements,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error loading dashboard analytics',
    });
  }
};
