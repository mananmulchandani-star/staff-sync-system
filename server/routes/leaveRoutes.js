const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getLeaveBalances,
  getAllLeaveRequests,
  reviewLeaveRequest,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/balances', getLeaveBalances);
router.get('/all', authorizeRoles('HR', 'Manager'), getAllLeaveRequests);
router.put('/:id/review', authorizeRoles('HR', 'Manager'), reviewLeaveRequest);

module.exports = router;
