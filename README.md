# StaffSync - Modern Human Resource Management Solution

StaffSync is an enterprise-grade Human Resource Management System (HRMS) built using the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js) with **Bootstrap 5** and **JSON Web Token (JWT)** authentication.

The platform provides role-based access control (RBAC) across three organizational tiers: **HR Personnel**, **Managers**, and **Employees**, streamlining core HR processes including workforce directories, attendance tracking, leave request approval workflows, training/development programs, and company announcements.

---

## 🌟 Key Features & Epic Breakdown

### **Epic 1: Authentication & Role-Based Access Control (RBAC)**
- **Secure JWT Authentication**: Bcrypt password encryption, authorization middlewares, and token-based sessions.
- **Three Access Tiers**:
  - `HR`: Full organizational administration, staff onboarding, leave decisions, attendance monitoring, and news broadcasting.
  - `Manager`: Team oversight, leave approvals, and training program scheduling.
  - `Employee`: Self-service profile maintenance, daily clock-in/out, leave applications, and training enrollment.
- **Convenient 1-Click Demo Login**: Instantly switch between HR, Manager, and Employee personas to test workflows.

### **Epic 2: Employee Profile & Directory Management**
- **Dynamic Employee Directory**: Search by name, ID, or designation; filter by department, role, and active status.
- **HR Onboarding & Offboarding**: Add new employees with automatic credential generation and manage compensation records.
- **Self-Service Profile**: Employees can update their contact info, home address, emergency contacts, and professional skills tags.

### **Epic 3: Attendance Tracking System**
- **Real-Time Clock In / Clock Out**: Interactive daily widget with live ticking clock, automatic status flagging (`Present`, `Late` after 9:30 AM, `Half-day`).
- **Personal Timesheets**: Last 60-day attendance metrics, hours worked, and monthly log.
- **Organization Attendance Roster**: HR & Managers can view and filter company-wide daily attendance records.

### **Epic 4: Leave Management & Approval Workflow**
- **Leave Allowances**: Pre-allocated balances for `Casual` (10 days), `Sick` (10 days), and `Annual` (15 days).
- **Application Portal**: Inclusive date range selection, reason submission, and live remaining balance verification.
- **Manager / HR Decision Queue**: One-click **Approve** or **Reject** with reviewer remarks, automatically deducting approved days from balance.

### **Epic 5: Training & Development Programs**
- **Course Catalog**: Upskilling programs with syllabus, instructor, schedule, department targeting, and capacity limits.
- **Self Enrollment**: Employees can register or unenroll in upcoming training sessions.
- **Manager Program Scheduling**: Create, edit, and track participation across teams.

### **Epic 6: Company Announcements & Analytics Dashboard**
- **Role-Specific Dashboards**:
  - *HR Dashboard*: Headcount metrics, today's attendance rate, pending leave counts, department distributions, and shortcut actions.
  - *Manager Dashboard*: Department team size, team members clocked in today, and pending team approvals.
  - *Employee Dashboard*: Daily clock status, leave balance summary, and enrolled courses.
- **Company Bulletin Feed**: Official announcements with priority badges (`Urgent`, `Event`, `Policy`, `General`) and pinned notices.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **HR Administrator** | `hr@staffsync.com` | `Password123!` | Full Admin & Management |
| **Team Manager** | `manager@staffsync.com` | `Password123!` | Department & Approvals |
| **Employee (Staff)** | `employee@staffsync.com` | `Password123!` | Personal Self-Service |

*(You can also use the 1-click quick-fill buttons directly on the Login page)*

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v16 or above
- **npm**: v8 or above
- **MongoDB**: Local MongoDB or MongoDB Atlas URI (Note: The server includes an automatic in-memory fallback that starts out-of-the-box if no local MongoDB service is running!)

### 1. Installation
Install all dependencies for root, server, and client:
```bash
npm run install-all
```
*(Or navigate to `/server` and `/client` and run `npm install` in each).*

### 2. Configuration
The server includes a pre-configured `.env` file in `server/.env`:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=staffsync_super_secret_jwt_key_2026_modern_hrm
JWT_EXPIRE=7d
USE_MEMORY_DB_FALLBACK=true
```

### 3. Running the Application
To run the server and client concurrently:
```bash
# Start backend server (Port 5001)
npm run server

# In another terminal, start React client (Port 3000)
npm run client
```

Or run directly:
- **Server**: `cd server && node server.js`
- **Client**: `cd client && npm run dev`

Open your browser at: **`http://localhost:3000`**

---

## 📁 Project Architecture

```
skillwallet/
├── package.json                   # Root configuration & scripts
├── README.md                      # Documentation
├── server/
│   ├── config/
│   │   └── db.js                  # Database connection & memory fallback
│   ├── controllers/
│   │   ├── authController.js      # Auth & Profile
│   │   ├── employeeController.js  # Staff Directory & CRUD
│   │   ├── attendanceController.js# Clock In/Out & Logs
│   │   ├── leaveController.js     # Leave Application & Approvals
│   │   ├── trainingController.js  # Training Programs
│   │   ├── announcementController.js # Company Bulletins
│   │   └── dashboardController.js # Role-Tailored Metrics
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT Token Verification
│   │   └── roleMiddleware.js      # RBAC Authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── LeaveBalance.js
│   │   ├── Training.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── trainingRoutes.js
│   │   ├── announcementRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seeds/
│   │   └── seedData.js            # Initial demo dataset
│   ├── server.js                  # Express App entry point
│   └── package.json
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── client.js          # Axios client with JWT interceptor
    │   ├── components/
    │   │   ├── Navbar.jsx         # App navigation & role badge
    │   │   ├── Sidebar.jsx        # Sidebar navigation
    │   │   └── ProtectedRoute.jsx # Route authorization guards
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state & user context
    │   ├── pages/
    │   │   ├── auth/              # Login & Register views
    │   │   ├── dashboard/         # Role-Tailored Dashboards
    │   │   ├── employees/         # Directory & Self Profile
    │   │   ├── attendance/        # Clock In/Out & Timesheets
    │   │   ├── leaves/            # Requests & Approvals
    │   │   ├── trainings/         # Training Catalog
    │   │   └── announcements/     # Bulletin Board
    │   ├── App.jsx                # Router configuration
    │   ├── main.jsx               # React entry point
    │   └── styles.css             # Bootstrap customization
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🛠️ REST API Endpoints Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/auth/register` | Public | Register new staff account |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Private | Update self contact info & skills |
| `GET` | `/api/dashboard/stats` | Private | Role-tailored dashboard analytics |
| `GET` | `/api/employees` | Private | Search & filter staff directory |
| `POST` | `/api/employees` | HR Only | Onboard new employee & account |
| `PUT` | `/api/employees/:id` | HR Only | Update employee details |
| `DELETE`| `/api/employees/:id` | HR Only | Delete employee record |
| `POST` | `/api/attendance/clock-in` | Private | Record today's clock in |
| `POST` | `/api/attendance/clock-out`| Private | Record today's clock out |
| `GET` | `/api/attendance/today` | Private | Today's clock in status |
| `GET` | `/api/attendance/my-history`| Private | Personal timesheet history |
| `GET` | `/api/attendance/all` | HR/Manager| Organization timesheet logs |
| `POST` | `/api/leaves/apply` | Private | Submit leave request |
| `GET` | `/api/leaves/my-leaves` | Private | Personal leave history |
| `GET` | `/api/leaves/balances` | Private | Check remaining leave balances |
| `GET` | `/api/leaves/all` | HR/Manager| View team leave requests |
| `PUT` | `/api/leaves/:id/review` | HR/Manager| Approve / Reject leave request |
| `GET` | `/api/trainings` | Private | List training courses |
| `POST` | `/api/trainings` | HR/Manager| Schedule new training |
| `POST` | `/api/trainings/:id/enroll`| Private | Enroll / unenroll in course |
| `GET` | `/api/announcements` | Private | List company announcements |
| `POST` | `/api/announcements` | HR Only | Broadcast announcement |
| `DELETE`| `/api/announcements/:id` | HR Only | Remove announcement |

---

## 📄 License
ISC. Built for modern organizations and workforce management.
