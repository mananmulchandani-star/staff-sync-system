const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Training = require('../models/Training');
const Announcement = require('../models/Announcement');

dotenv.config();

const seedDefaultData = async () => {
  try {
    console.log('🌱 Seeding StaffSync initial database records...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Employee.deleteMany(),
      Attendance.deleteMany(),
      Leave.deleteMany(),
      LeaveBalance.deleteMany(),
      Training.deleteMany(),
      Announcement.deleteMany(),
    ]);

    // 1. Create Core Users
    const hrUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'hr@staffsync.com',
      password: 'Password123!',
      role: 'HR',
      department: 'Human Resources',
      designation: 'VP of People & Culture',
    });

    const managerUser = await User.create({
      name: 'Alex Rivera',
      email: 'manager@staffsync.com',
      password: 'Password123!',
      role: 'Manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
    });

    const employeeUser = await User.create({
      name: 'David Kim',
      email: 'employee@staffsync.com',
      password: 'Password123!',
      role: 'Employee',
      department: 'Engineering',
      designation: 'Senior Full Stack Developer',
    });

    const employee2 = await User.create({
      name: 'Emily Watson',
      email: 'emily@staffsync.com',
      password: 'Password123!',
      role: 'Employee',
      department: 'Marketing',
      designation: 'Growth Marketing Lead',
    });

    const employee3 = await User.create({
      name: 'Michael Chen',
      email: 'michael@staffsync.com',
      password: 'Password123!',
      role: 'Employee',
      department: 'Finance',
      designation: 'Financial Analyst',
    });

    // 2. Create Employee Profiles
    const hrEmp = await Employee.create({
      user: hrUser._id,
      employeeId: 'EMP-1001',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: hrUser.email,
      phone: '+1 (555) 234-5678',
      department: 'Human Resources',
      designation: 'VP of People & Culture',
      role: 'HR',
      salary: 125000,
      skills: ['Talent Acquisition', 'HR Strategy', 'Labor Law', 'Conflict Resolution'],
      address: { street: '450 Market St', city: 'San Francisco', state: 'CA', zipCode: '94105' },
      emergencyContact: { name: 'Mark Jenkins', relationship: 'Spouse', phone: '+1 (555) 234-9999' },
      status: 'Active',
    });

    const managerEmp = await Employee.create({
      user: managerUser._id,
      employeeId: 'EMP-1002',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: managerUser.email,
      phone: '+1 (555) 345-6789',
      department: 'Engineering',
      designation: 'Engineering Manager',
      role: 'Manager',
      salary: 140000,
      skills: ['Agile / Scrum', 'System Architecture', 'Node.js', 'Team Leadership'],
      address: { street: '782 Pine St', city: 'San Francisco', state: 'CA', zipCode: '94108' },
      emergencyContact: { name: 'Elena Rivera', relationship: 'Sibling', phone: '+1 (555) 345-0000' },
      status: 'Active',
    });

    const davidEmp = await Employee.create({
      user: employeeUser._id,
      employeeId: 'EMP-1003',
      firstName: 'David',
      lastName: 'Kim',
      email: employeeUser.email,
      phone: '+1 (555) 456-7890',
      department: 'Engineering',
      designation: 'Senior Full Stack Developer',
      role: 'Employee',
      manager: managerUser._id,
      salary: 110000,
      skills: ['React.js', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'GraphQL'],
      address: { street: '120 Mission St', city: 'San Francisco', state: 'CA', zipCode: '94103' },
      emergencyContact: { name: 'Grace Kim', relationship: 'Parent', phone: '+1 (555) 456-1111' },
      status: 'Active',
    });

    const emilyEmp = await Employee.create({
      user: employee2._id,
      employeeId: 'EMP-1004',
      firstName: 'Emily',
      lastName: 'Watson',
      email: employee2.email,
      phone: '+1 (555) 567-8901',
      department: 'Marketing',
      designation: 'Growth Marketing Lead',
      role: 'Employee',
      salary: 95000,
      skills: ['SEO/SEM', 'Content Strategy', 'HubSpot', 'Google Analytics'],
      address: { street: '890 Broadway', city: 'San Francisco', state: 'CA', zipCode: '94133' },
      status: 'Active',
    });

    const michaelEmp = await Employee.create({
      user: employee3._id,
      employeeId: 'EMP-1005',
      firstName: 'Michael',
      lastName: 'Chen',
      email: employee3.email,
      phone: '+1 (555) 678-9012',
      department: 'Finance',
      designation: 'Financial Analyst',
      role: 'Employee',
      salary: 88000,
      skills: ['Financial Modeling', 'Excel / VBA', 'Budgeting', 'Tax Compliance'],
      status: 'On Leave',
    });

    // Link back to Users
    hrUser.employeeProfile = hrEmp._id;
    await hrUser.save();
    managerUser.employeeProfile = managerEmp._id;
    await managerUser.save();
    employeeUser.employeeProfile = davidEmp._id;
    await employeeUser.save();
    employee2.employeeProfile = emilyEmp._id;
    await employee2.save();
    employee3.employeeProfile = michaelEmp._id;
    await employee3.save();

    // 3. Create Leave Balances
    const users = [hrUser, managerUser, employeeUser, employee2, employee3];
    for (const u of users) {
      await LeaveBalance.create({
        user: u._id,
        casual: { total: 10, used: u.email === 'michael@staffsync.com' ? 3 : 1 },
        sick: { total: 10, used: 2 },
        annual: { total: 15, used: 4 },
      });
    }

    // 4. Create Sample Attendance
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

    await Attendance.create([
      {
        user: hrUser._id,
        employee: hrEmp._id,
        date: today,
        clockIn: new Date(new Date().setHours(8, 45, 0, 0)),
        status: 'Present',
      },
      {
        user: managerUser._id,
        employee: managerEmp._id,
        date: today,
        clockIn: new Date(new Date().setHours(9, 10, 0, 0)),
        status: 'Present',
      },
      {
        user: employeeUser._id,
        employee: davidEmp._id,
        date: yesterday,
        clockIn: new Date(new Date(Date.now() - 86400000).setHours(9, 0, 0, 0)),
        clockOut: new Date(new Date(Date.now() - 86400000).setHours(17, 30, 0, 0)),
        totalHours: 8.5,
        status: 'Present',
      },
      {
        user: employeeUser._id,
        employee: davidEmp._id,
        date: twoDaysAgo,
        clockIn: new Date(new Date(Date.now() - 172800000).setHours(9, 45, 0, 0)),
        clockOut: new Date(new Date(Date.now() - 172800000).setHours(18, 0, 0, 0)),
        totalHours: 8.25,
        status: 'Late',
        remarks: 'Morning traffic delay',
      },
    ]);

    // 5. Create Sample Leaves
    await Leave.create([
      {
        user: employeeUser._id,
        employee: davidEmp._id,
        leaveType: 'Annual',
        startDate: new Date(Date.now() + 86400000 * 5),
        endDate: new Date(Date.now() + 86400000 * 8),
        totalDays: 4,
        reason: 'Family vacation trip',
        status: 'Pending',
      },
      {
        user: employee2._id,
        employee: emilyEmp._id,
        leaveType: 'Sick',
        startDate: new Date(Date.now() - 86400000 * 10),
        endDate: new Date(Date.now() - 86400000 * 8),
        totalDays: 3,
        reason: 'Flu recovery',
        status: 'Approved',
        reviewedBy: hrUser._id,
        reviewedAt: new Date(Date.now() - 86400000 * 9),
        reviewRemarks: 'Get well soon!',
      },
      {
        user: employee3._id,
        employee: michaelEmp._id,
        leaveType: 'Casual',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 2),
        totalDays: 3,
        reason: 'Personal urgent work',
        status: 'Approved',
        reviewedBy: hrUser._id,
        reviewedAt: new Date(),
        reviewRemarks: 'Approved.',
      },
    ]);

    // 6. Create Training Programs
    await Training.create([
      {
        title: 'Full Stack React & Modern State Management',
        description: 'Deep dive into React 18, Custom Hooks, Redux Toolkit, and performance optimization techniques for high-scale applications.',
        trainer: 'Dr. Robert Hawkins (Lead Architect)',
        startDate: new Date(Date.now() + 86400000 * 7),
        endDate: new Date(Date.now() + 86400000 * 14),
        department: 'Engineering',
        capacity: 25,
        enrolledEmployees: [employeeUser._id],
        status: 'Upcoming',
        createdBy: managerUser._id,
      },
      {
        title: 'Modern HR Compliance & People Leadership',
        description: 'Comprehensive walkthrough of updated labor policies, remote workforce management, and effective 1-on-1 coaching.',
        trainer: 'Sarah Jenkins (VP HR)',
        startDate: new Date(Date.now() + 86400000 * 3),
        endDate: new Date(Date.now() + 86400000 * 5),
        department: 'All Departments',
        capacity: 40,
        enrolledEmployees: [managerUser._id],
        status: 'Upcoming',
        createdBy: hrUser._id,
      },
      {
        title: 'Agile & Scrum Best Practices for Product Teams',
        description: 'Sprint planning, estimation frameworks, retrospectives, and cross-functional team collaboration.',
        trainer: 'Clara Oswald (Agile Coach)',
        startDate: new Date(Date.now() - 86400000 * 10),
        endDate: new Date(Date.now() - 86400000 * 2),
        department: 'Engineering',
        capacity: 20,
        enrolledEmployees: [employeeUser._id, employee2._id],
        status: 'Completed',
        createdBy: managerUser._id,
      },
    ]);

    // 7. Create Company Announcements
    await Announcement.create([
      {
        title: '🚀 Q4 All-Hands Meeting & Strategy Roadmap',
        content: 'Please join us this Thursday at 3:00 PM for our quarterly town hall. We will celebrate key company milestones, reveal product updates, and review our strategic objectives for the upcoming quarter.',
        category: 'Event',
        author: hrUser._id,
        authorName: 'Sarah Jenkins',
        isPinned: true,
        targetRole: 'All',
      },
      {
        title: '⚠️ Health & Safety: Updated Hybrid Office Guidelines',
        content: 'All team members visiting the office are requested to register their desk via the workspace portal. Sanitization stations and complimentary healthy snacks are available on floors 3 & 4.',
        category: 'Urgent',
        author: hrUser._id,
        authorName: 'HR Department',
        isPinned: true,
        targetRole: 'All',
      },
      {
        title: '🎉 Welcome New Joiners to the StaffSync Family!',
        content: 'Please give a warm welcome to our newest cohort of software engineers and marketing specialists joining across our SF and remote hubs this week!',
        category: 'General',
        author: hrUser._id,
        authorName: 'People Ops Team',
        isPinned: false,
        targetRole: 'All',
      },
    ]);

    console.log('✅ StaffSync demo data seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('🔑 Demo User Accounts:');
    console.log('   HR Admin:  hr@staffsync.com       / Password123!');
    console.log('   Manager:   manager@staffsync.com  / Password123!');
    console.log('   Employee:  employee@staffsync.com / Password123!');
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  }
};

// If run directly from terminal: `node seeds/seedData.js`
if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(() => {
    seedDefaultData().then(() => {
      process.exit(0);
    });
  });
}

module.exports = { seedDefaultData };
