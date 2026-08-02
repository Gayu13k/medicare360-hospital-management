import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/authRoutes';
import deptRoutes from './server/routes/deptRoutes';
import doctorRoutes from './server/routes/doctorRoutes';
import patientRoutes from './server/routes/patientRoutes';
import appointmentRoutes from './server/routes/appointmentRoutes';
import queueRoutes from './server/routes/queueRoutes';
import medicalRecordRoutes from './server/routes/medicalRecordRoutes';
import prescriptionRoutes from './server/routes/prescriptionRoutes';
import labTestRoutes from './server/routes/labTestRoutes';
import billRoutes from './server/routes/billRoutes';
import dashboardRoutes from './server/routes/dashboardRoutes';
import systemRoutes from './server/routes/systemRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'MediCare360 API Server', timestamp: new Date().toISOString() });
  });

  // Register API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/departments', deptRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/medical-records', medicalRecordRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/lab-tests', labTestRoutes);
  app.use('/api/bills', billRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api', systemRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediCare360 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MediCare360 server:', err);
});
