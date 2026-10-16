# Attendly — University Student Attendance Tracker

A modern, frontend-only university student attendance and academic productivity application built with React 19, TypeScript, Vite, and Tailwind CSS v4.

---

## Features

* **Attendance Tracker & Safeguard**: Calculate real-time attendance percentage against university targets (e.g., 75% rule), missable classes, and consecutive classes required to recover eligibility.
* **Weekly Timetable with Lab Batching**: Filter schedule by practical Lab Batch (B1, B2, B3) or full theory classes.
* **Timetable Scanner & Digitizer**: Upload timetable images (PNG, JPG, JPEG) to transcribe and map class periods side-by-side into your weekly schedule with full manual entry support.
* **Assignment & Task Manager**: Track assignments, lab records, projects, and study tasks with priority and due dates.
* **Academic Notes**: Quick study notes with search, pinning, and subject tagging.
* **Academic Calendar**: View course events, exams, holidays, and deadlines.
* **Insights & Trends**: Subject-by-subject attendance analytics and breakdown charts powered by Recharts.
* **100% Client-Side Local Storage**: All profiles, subjects, attendance logs, and tasks are saved directly in your browser's `localStorage`. No external database, server, or cloud account is required.
* **Data Portability**: Full CSV export and local data reset capabilities.

---

## Technology Stack

* **Framework**: React 19 + TypeScript
* **Build Tool**: Vite
* **Routing**: React Router v7 (`react-router-dom`)
* **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
* **Icons**: Lucide React
* **Charts**: Recharts
* **Dates**: date-fns
* **Data Layer**: Centralized typed client-side data service backed by `localStorage`

---

## Getting Started

### 1. Installation

Clone the repository and install dependencies using `npm`:

```bash
npm install
```

### 2. Development Server

Start the standalone Vite development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

Run TypeScript type checks and build the static frontend bundle:

```bash
npm run build
```

The output will be placed in the `dist/` directory, ready to be deployed to any static web hosting provider (Vercel, Netlify, GitHub Pages, Firebase Hosting, Cloudflare Pages, etc.).

### 4. Preview Build

Preview the production build locally:

```bash
npm run preview
```

---

## Data Privacy & Security Notice

Attendly is a standalone frontend application. All student data (name, USN, subjects, timetable, attendance logs, tasks, and notes) is saved solely within your browser profile's `localStorage`. No sensitive credentials, passwords, or authentication tokens are stored or transmitted.
