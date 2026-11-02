const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    clockIn: {
      type: Date,
      default: Date.now,
    },
    clockOut: {
      type: Date,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-day', 'Absent'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to ensure 1 attendance entry per user per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
