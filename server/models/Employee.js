const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: [
        'Engineering',
        'Human Resources',
        'Finance',
        'Marketing',
        'Operations',
        'Sales',
        'Design',
      ],
      default: 'Engineering',
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      default: 'Associate',
    },
    role: {
      type: String,
      enum: ['HR', 'Manager', 'Employee'],
      default: 'Employee',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 50000,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

EmployeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', EmployeeSchema);
