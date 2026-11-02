const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  toggleEnrollment,
} = require('../controllers/trainingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAllTrainings);
router.get('/:id', getTrainingById);
router.post('/', authorizeRoles('HR', 'Manager'), createTraining);
router.put('/:id', authorizeRoles('HR', 'Manager'), updateTraining);
router.delete('/:id', authorizeRoles('HR', 'Manager'), deleteTraining);
router.post('/:id/enroll', toggleEnrollment);

module.exports = router;
