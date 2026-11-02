const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (All users)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', 'name email role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving announcements',
    });
  }
};

// @desc    Create announcement (HR only)
// @route   POST /api/announcements
// @access  Private (HR only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, isPinned, targetRole } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required.',
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      author: req.user._id,
      authorName: req.user.name,
      isPinned: !!isPinned,
      targetRole: targetRole || 'All',
    });

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: announcement,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error posting announcement',
    });
  }
};

// @desc    Delete announcement (HR only)
// @route   DELETE /api/announcements/:id
// @access  Private (HR only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error deleting announcement',
    });
  }
};
