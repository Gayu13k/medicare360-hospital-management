# MediCare360 - Smart Hospital Management System

MediCare360 is a full-stack, enterprise-grade Hospital Management System (HMS) with live patient token queue management, digital consultations, EMR history, prescription generation, billing, and role-based access control (Patient, Doctor, Receptionist, Admin).

## 🚀 Features

- **Live Queue & Token Tracking**: Real-time consultation queue tracking for patients and doctors.
- **Role-Based Dashboards**: Customized interfaces for Patients, Doctors, Receptionists, and Admins.
- **Appointment Management**: Multi-step booking flow with automated token allocation.
- **Digital EMR & Prescriptions**: EHR history, digital prescriptions with PDF download capabilities.
- **Hospital Analytics & Audit Logs**: Real-time statistics, department tracking, and system audit logs.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Build Tool**: Vite, ESBuild

## 💻 Local Setup & Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## 🌐 Deployment Instructions

### Option 1: Deploy on Render (Recommended for Full-Stack Node/Express)
1. Push your repository to GitHub.
2. Go to [Render.com](https://render.com) and create a **Web Service**.
3. Connect your GitHub repository.
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm start`
6. Click **Deploy**.

### Option 2: Deploy Frontend on Vercel / Netlify
1. If deploying frontend static assets to Vercel/Netlify, set Build Command to `npm run build` and Output Directory to `dist`.

