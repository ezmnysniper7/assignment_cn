// controllers/courseController.js
const pool = require('../models/db');

// CREATE course (teacher or admin)
exports.createCourse = async (req, res) => {
  const { name, teacherId } = req.body; // Adjusted to accept teacherId from body if admin
  try {
    let teacher_id = req.user.userId;
    if (req.user.role === 'admin') {
      // Admin can create course for any teacher
      if (!teacherId) {
        return res.status(400).json({ message: 'teacherId is required for admin' });
      }
      teacher_id = teacherId;
    }

    // Ensure teacher exists
    const [check] = await pool.query('SELECT * FROM teachers WHERE teacher_id = ?', [teacher_id]);
    if (check.length === 0) {
      return res.status(400).json({ message: 'Provided teacher not found' });
    }

    const [result] = await pool.query(`
      INSERT INTO courses (name, teacher_id)
      VALUES (?, ?)
    `, [name, teacher_id]);

    res.status(201).json({ message: 'Course created', courseId: result.insertId });
  } catch (error) {
    console.error('createCourse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ all courses
exports.getAllCourses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.teacher_id,
        u.name AS name_of_teacher, 
        t.department, 
        t.title
      FROM courses c
      JOIN teachers t ON t.teacher_id = c.teacher_id
      JOIN users u ON u.id = t.teacher_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('getAllCourses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ course by ID
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.teacher_id, 
        u.name AS name_of_teacher, 
        t.department, 
        t.title
      FROM courses c
      JOIN teachers t ON t.teacher_id = c.teacher_id
      JOIN users u ON u.id = t.teacher_id
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('getCourseById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE course
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, teacher_id } = req.body; // Allow updating teacher assignment
  try {
    // Optional: Check permissions if necessary

    // If teacher_id is being updated (admin only)
    if (teacher_id) {
      // Ensure the new teacher exists
      const [check] = await pool.query('SELECT * FROM teachers WHERE teacher_id = ?', [teacher_id]);
      if (check.length === 0) {
        return res.status(400).json({ message: 'Provided teacher not found' });
      }
    }

    // Build dynamic query based on provided fields
    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (teacher_id) {
      updateFields.push('teacher_id = ?');
      updateValues.push(teacher_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updateQuery = `
      UPDATE courses
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    updateValues.push(id);

    const [result] = await pool.query(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('updateCourse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE course
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('deleteCourse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
