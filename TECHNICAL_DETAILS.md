# Intern Time Tracker - Technical Documentation

This document provides a deep dive into the technical architecture, design decisions, and implementation details of the Intern Time Tracker application.

---

## 🏗️ System Architecture

The application follows a classic **Full-stack Client-Server architecture**:

- **Frontend**: A modern Single Page Application (SPA) built with React and Vite.
- **Backend**: A RESTful API built with Node.js and Express.
- **Database**: MySQL (via `mysql2`) for persistent storage of users, companies, and attendance records.
- **Authentication**: Stateless JWT (JSON Web Tokens) based authentication.

---

## 💻 Frontend Technical Stack

### Core Frameworks
- **React (v18)**: Component-based UI library.
- **Vite**: Ultra-fast build tool and development server.
- **TypeScript**: Used throughout the frontend for type safety and better developer experience.

### State Management
- **React Context API**: The `AuthContext.tsx` handles the global application state, including:
  - User authentication status.
  - Lists of all users and attendance records (highly optimized for filtering).
  - Centralized API calls for data synchronization.
- **React Query**: Used in complex views like the `AdminRegistry` for efficient data fetching and caching.

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid styling.
- **Shadcn/UI**: A collection of re-usable components built with Radix UI and Tailwind.
- **Lucide React**: Icon library for consistent visual language.
- **Recharts**: Performance-tuned charting library used for the Calendar statistics.

### Layout System (Advanced Responsiveness)
The main layout (`DashboardLayout.tsx`) uses a unique **Viewport-based design**:
- `h-[100dvh]` and `vh` units are used to ensure the application fits perfectly on any screen without unintended scrolling.
- Responsive Sidebar: Collapses to a mobile-friendly bottom bar/header on small devices.
- CSS Grid & Flexbox: Used extensively for fluid alignment.

---

## ⚙️ Backend Technical Stack

### API Layer
- **Express.js (v5)**: Minimalist web framework for Node.js.
- **Middleware Architecture**:
  - `cors`: Configured with strict origin checks.
  - `helmet`: Enhances API security (configured for `cross-origin` resource sharing to allow profile picture loading).
  - `express-rate-limit`: Prevents brute-force attacks by limiting request rates per IP.
  - `jsonwebtoken`: Handles token generation and verification.

### Data & Files
- **MySQL**: Relational database for structured data.
- **Multer**: Middleware for handling `multipart/form-data`, used for profile picture uploads.
- **ExcelJS**: Used to generate professional Excel reports in the Export and Admin views.

---

## 🔐 Key Technical Patterns

### 1. Attendance Logic
The attendance system uses an `AttendanceStatus` type: `present`, `late`, or `absent`.
- Time tracking is split into `morningStart/End` and `afternoonStart/End`.
- Data is stored in a `records` table indexed by `date` and `userId`.

### 2. Security Patterns
- **Password Hashing**: Passwords are securely hashed using `bcryptjs` before storage.
- **Protected Routes**: Frontend routes are guarded by a high-order component logic in `App.tsx` checking the `AuthContext` state.
- **API Security**: All attendance and user endpoints require a valid JWT `Bearer` token in the request header.

### 3. Responsive Constants
The project uses a centralized `constants.ts` for:
- Standardized time slots.
- Status configurations (colors, labels).
- Company metadata.

---

## 📂 Project Structure

```text
├── src/                # Frontend Source
│   ├── components/     # UI Components & Dashboard Layout
│   ├── contexts/       # Auth & Global State
│   ├── lib/            # Utilities, API config, Constants
│   ├── pages/          # Individual View Components
│   └── App.tsx         # Main entry & Routing
├── server/             # Backend Source
│   ├── controllers/    # API Logic
│   ├── routes/         # Endpoint Definitions
│   ├── services/       # Email & Helper Services
│   └── index.js        # Server Entry
├── public/             # Static Assets
└── PROGRESS.md         # Project Milestones
```
