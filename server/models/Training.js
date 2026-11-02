const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Training description is required'],
    },
    trainer: {
      type: String,
      required: [true, 'Trainer name is required'],
      default: 'Corporate L&D',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    department: {
      type: String,
      default: 'All Departments',
    },
    capacity: {
      type: Number,
      default: 30,
    },
    enrolledEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Upcoming', 'In Progress', 'Completed'],
      default: 'Upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Training', TrainingSchema);
