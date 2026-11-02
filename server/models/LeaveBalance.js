const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    casual: {
      total: { type: Number, default: 10 },
      used: { type: Number, default: 0 },
    },
    sick: {
      total: { type: Number, default: 10 },
      used: { type: Number, default: 0 },
    },
    annual: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);
