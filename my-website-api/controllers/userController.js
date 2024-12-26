// controllers/userController.js
const pool = require('../models/db');
const bcrypt = require('bcrypt');

// POST /api/users (admin only) => create a new user with role=student or role=teacher
exports.createUser = async (req, res) => {
  const { username, password, role, age, major, department, title } = req.body;
  // role can be 'student' or 'teacher'
  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student or teacher' });
  }
  try {
    // 1) create user in `users`
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `, [username, hashedPassword, role]);
    const newUserId = result.insertId;

    // 2) if student => insert row in `students`
    if (role === 'student') {
      await pool.query(`
        INSERT INTO students (student_id, age, major)
        VALUES (?, ?, ?)
      `, [newUserId, age || null, major || null]);
    }

    // 3) if teacher => insert row in `teachers`
    if (role === 'teacher') {
      await pool.query(`
        INSERT INTO teachers (teacher_id, department, title)
        VALUES (?, ?, ?)
      `, [newUserId, department || null, title || null]);
    }

    res.status(201).json({ message: 'User created', userId: newUserId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
