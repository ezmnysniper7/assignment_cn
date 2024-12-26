// controllers/authController.js
require('dotenv').config();
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

// LOGIN
// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
//     if (rows.length === 0) {
//       return res.status(400).json({ message: 'Invalid username or password' });
//     }
//     const user = rows[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid username or password' });
//     }
//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET, 
//       { expiresIn: '1h' }     
//     );
   
//     return res.status(200).json({ message: 'Login successful', token });
//   } catch (error) {
//     console.error('Login error:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };
// LOGIN without hashing
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 1) Check if user exists
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length == 0) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    const user = rows[0];
    
    // 2) Direct compare of password fields (plaintext)
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // 3) Create token (unchanged)
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET, 
      { expiresIn: '3h' }
    );
    
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};