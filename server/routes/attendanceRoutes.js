const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyAttendanceHistory);
router.get('/all', authorizeRoles('HR', 'Manager'), getAllAttendance);

module.exports = router;
