// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());            // enable CORS
app.use(express.json());    // parse JSON bodies

// 1) Import routes
const studentRoutes = require('./routes/studentRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');    
const courseRoutes = require('./routes/courseRoutes');      
const enrollmentRoutes = require('./routes/enrollmentRoutes');

// 2) Use routes
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// 3) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
