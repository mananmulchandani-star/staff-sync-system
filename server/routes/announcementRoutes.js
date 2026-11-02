const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAllAnnouncements);
router.post('/', authorizeRoles('HR'), createAnnouncement);
router.delete('/:id', authorizeRoles('HR'), deleteAnnouncement);

module.exports = router;
