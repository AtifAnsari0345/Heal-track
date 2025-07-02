const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const homeDoctorRoutes = require('./routes/homeDoctorRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// API Routes - Add prefix to all API routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/medicines', medicineRoutes);
apiRouter.use('/hospitals', hospitalRoutes);
apiRouter.use('/home-visits', homeDoctorRoutes);
apiRouter.use('/activities', activityRoutes); // Move this line here

// Mount API router
app.use('/api', apiRouter);

// Handle 404 for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Remove the old line: app.use('/api/activities', activityRoutes);

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback route for HTML pages (only for non-API routes)
app.get('*', (req, res) => {
  // Ignore favicon.ico requests
  if (req.path === '/favicon.ico') {
    return res.status(404).send();
  }
  
  // Only handle HTML page requests
  if (req.path.endsWith('.html') || req.path === '/' || !req.path.includes('.')) {
    const filePath = path.join(__dirname, '../frontend', 
      req.path === '/' ? 'index.html' : 
      req.path.endsWith('.html') ? req.path : 
      `${req.path}.html`);
    res.sendFile(filePath);
  } else {
    res.status(404).send();
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
