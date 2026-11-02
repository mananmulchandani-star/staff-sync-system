const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorizeRoles('HR'), createEmployee);
router.put('/:id', authorizeRoles('HR'), updateEmployee);
router.delete('/:id', authorizeRoles('HR'), deleteEmployee);

module.exports = router;
