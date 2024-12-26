// controllers/teacherController.js
const pool = require('../models/db');

// CREATE teacher (Admin only)
exports.createTeacher = async (req, res) => {
  const { username, password, name, department, email, title } = req.body;
  try {
    // Validate required fields
    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Username, password, and name are required' });
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into `users` table
    const [userResult] = await pool.query(
      `INSERT INTO users (username, password, role, name)
       VALUES (?, ?, 'teacher', ?)`,
      [username, password, name]
    );
    const newUserId = userResult.insertId;

    // Insert into `teachers` table
    await pool.query(
      `INSERT INTO teachers (teacher_id, department, email, title)
       VALUES (?, ?, ?, ?)`,
      [newUserId, department || null, email || null, title || null]
    );

    res.status(201).json({ message: 'Teacher created', teacherId: newUserId });
  } catch (error) {
    console.error('createTeacher error:', error);
    // Handle duplicate username error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// READ all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id AS teacher_id, u.username, u.name, t.department, t.email, t.title
      FROM users u
      JOIN teachers t ON t.teacher_id = u.id
      WHERE u.role = 'teacher'
    `);
    res.json(rows);
  } catch (error) {
    console.error('getAllTeachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ teacher by ID
exports.getTeacherById = async (req, res) => {
  const { id } = req.params; // teacher's user.id
  try {
    const [rows] = await pool.query(`
      SELECT u.id AS teacher_id, u.username, u.name, t.department, t.email, t.title
      FROM users u
      JOIN teachers t ON t.teacher_id = u.id
      WHERE u.id = ? AND u.role = 'teacher'
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Teacher not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('getTeacherById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE teacher
exports.updateTeacher = async (req, res) => {
  const { id } = req.params; // teacher's userId
  const { username, name, password, department, email, title } = req.body;

  try {
    // Check if the teacher exists
    const [userRows] = await pool.query(`
      SELECT * FROM users WHERE id = ? AND role = 'teacher'
    `, [id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Prepare data for users table update
    let userUpdateFields = [];
    let userUpdateValues = [];

    if (username) {
      userUpdateFields.push('username = ?');
      userUpdateValues.push(username);
    }

    if (name) {
      userUpdateFields.push('name = ?');
      userUpdateValues.push(name);
    }

    if (password) {
      userUpdateFields.push('password = ?');
      userUpdateValues.push(password);
    }

    if (userUpdateFields.length > 0) {
      const userUpdateQuery = `
        UPDATE users
        SET ${userUpdateFields.join(', ')}
        WHERE id = ?
      `;
      userUpdateValues.push(id);
      await pool.query(userUpdateQuery, userUpdateValues);
    }

    // Prepare data for teachers table update
    let teacherUpdateFields = [];
    let teacherUpdateValues = [];

    if (department) {
      teacherUpdateFields.push('department = ?');
      teacherUpdateValues.push(department);
    }

    if (email) {
      teacherUpdateFields.push('email = ?');
      teacherUpdateValues.push(email);
    }

    if (title) {
      teacherUpdateFields.push('title = ?');
      teacherUpdateValues.push(title);
    }

    if (teacherUpdateFields.length > 0) {
      const teacherUpdateQuery = `
        UPDATE teachers
        SET ${teacherUpdateFields.join(', ')}
        WHERE teacher_id = ?
      `;
      teacherUpdateValues.push(id);
      const [result] = await pool.query(teacherUpdateQuery, teacherUpdateValues);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Teacher not found in teachers table' });
      }
    }

    res.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('updateTeacher error:', error);
    // Handle duplicate username error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE teacher
exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete from `users` where id and role='teacher'; assuming ON DELETE CASCADE is set for teachers
    const [userResult] = await pool.query(`
      DELETE FROM users WHERE id = ? AND role = 'teacher'
    `, [id]);

    if (userResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Teacher not found or not a teacher role' });
    }

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('deleteTeacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
