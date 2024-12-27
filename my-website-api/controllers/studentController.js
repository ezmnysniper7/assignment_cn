// controllers/studentController.js
const pool = require('../models/db');

// CREATE student
exports.createStudent = async (req, res) => {
  const { username, password, age, major, name } = req.body;
  console.log('Received createStudent request:', req.body);
  try {
    // Validate required fields
    if (!username || !password || !name) {
      console.log('Validation failed: Username or password missing');
      return res.status(400).json({ message: 'Username and password and name are required' });
    }

    // Insert into users
    console.log('Inserting into users table');
    const [userResult] = await pool.query(`
      INSERT INTO users (username, password, role, name)
      VALUES (?, ?, 'student', ?)
    `, [username, password, name]);
    const newUserId = userResult.insertId;
    console.log(`Inserted user with ID: ${newUserId}`);

    // Insert into students
    console.log('Inserting into students table');
    await pool.query(`
      INSERT INTO students (student_id, age, major, name)
      VALUES (?, ?, ?, ?)
    `, [newUserId, age || null, major || null, name]);
    console.log('Inserted student record');

    res.status(201).json({ message: 'Student created', studentId: newUserId });
  } catch (error) {
    console.error('createStudent error:', error);

    // Handle duplicate username error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE student
exports.updateStudent = async (req, res) => {
  const { id } = req.params; // Changed from 'student_id' to 'id'
  const { username, name, age, major, password } = req.body;
  console.log(`Received updateStudent request for ID: ${id}`, req.body); // Debugging

  try {
    // Check if the user exists
    const [userRows] = await pool.query(`
      SELECT * FROM users WHERE id = ?
    `, [id]);

    if (userRows.length === 0) {
      console.log('User not found');
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update users table for username and optionally password and name
    if (password) {
      console.log('Updating users table with password and name');
      await pool.query(`
        UPDATE users
        SET username = ?, password = ?, name = ?
        WHERE id = ?
      `, [username, password, name, id]);
    } else {
      console.log('Updating users table without password');
      await pool.query(`
        UPDATE users
        SET username = ?, name = ?
        WHERE id = ?
      `, [username, name, id]);
    }

    // Update students table for age, major, and name
    console.log('Updating students table');
    const [result] = await pool.query(`
      UPDATE students
      SET age = ?, major = ?, name = ?
      WHERE student_id = ?
    `, [age, major, name, id]);

    if (result.affectedRows === 0) {
      console.log('Student not found in students table');
      return res.status(404).json({ message: 'Student not found in students table' });
    }

    res.json({ message: 'Student updated' });
  } catch (error) {
    console.error('updateStudent error:', error);

    // Handle duplicate username error
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Duplicate entry detected for username');
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Send detailed error message (for debugging purposes only)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// READ all students
exports.getAllStudents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id AS student_id, u.name, u.role, s.age, s.major
      FROM users u
      JOIN students s ON s.student_id = u.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('getAllStudents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ one student
exports.getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT u.id AS userId, u.username, u.role, s.age, s.major
      FROM users u
      JOIN students s ON s.student_id = u.id
      WHERE u.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('getStudentById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE student
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    // remove from `users` where id=?
    const [userResult] = await pool.query(`
      DELETE FROM users WHERE id=? AND role='student'
    `, [id]);
    if (userResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found or not a student role' });
    }
    res.json({ message: 'Student deleted' });
  } catch (error) {
    console.error('deleteStudent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


