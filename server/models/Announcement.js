const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
    },
    category: {
      type: String,
      enum: ['General', 'Urgent', 'Event', 'Policy'],
      default: 'General',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      default: 'HR Department',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    targetRole: {
      type: String,
      enum: ['All', 'Employee', 'Manager', 'HR'],
      default: 'All',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', AnnouncementSchema);
