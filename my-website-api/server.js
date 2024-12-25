// server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());            // enable CORS
app.use(express.json());    // parse JSON bodies

// 1) Import routes
const studentRoutes = require('./routes/studentRoutes');

// 2) Use routes
app.use('/api/students', studentRoutes);

// 3) Start server
const PORT = 5000; 
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
