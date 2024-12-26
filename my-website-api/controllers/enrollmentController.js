// controllers/enrollmentController.js
const pool = require('../models/db');

// CREATE enrollment
exports.createEnrollment = async (req, res) => {
  // if the user is a student, they can enroll themselves
  // if admin, can enroll on behalf
  // if teacher, maybe not allowed?
  const { courseId, studentId, grade } = req.body;
  // if user is a student but didn't provide studentId, then we use req.user.userId
  let enrollStudentId = studentId;
  if (req.user.role === 'student') {
    enrollStudentId = req.user.userId;
  }
  try {
    // verify the student row exists
    const [checkStudent] = await pool.query(`
      SELECT * FROM students WHERE student_id=?
    `, [enrollStudentId]);
    if (checkStudent.length === 0) return res.status(404).json({ message: 'Student does not exist' });

    // verify the course exists
    const [checkCourse] = await pool.query(`
      SELECT * FROM courses WHERE id=?
    `, [courseId]);
    if (checkCourse.length === 0) return res.status(404).json({ message: 'Course not found' });

    // create enrollment
    const [result] = await pool.query(`
      INSERT INTO enrollments (student_id, course_id, grade)
      VALUES (?, ?, ?)
    `, [enrollStudentId, courseId, grade || null]);

    res.status(201).json({ message: 'Enrollment created', enrollmentId: result.insertId });
  } catch (error) {
    console.error('createEnrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ all enrollments
exports.getAllEnrollments = async (req, res) => {
  // admin or teacher might want to see all
  try {
    const [rows] = await pool.query(`
      SELECT e.id, e.student_id, e.course_id, e.grade,
             s.major, c.name as courseName
      FROM enrollments e
      JOIN students s ON s.student_id = e.student_id
      JOIN courses c ON c.id = e.course_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('getAllEnrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ single enrollment
exports.getEnrollmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT e.*, c.name as courseName
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.id=?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Enrollment not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('getEnrollmentById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE enrollment (maybe update grade)
exports.updateEnrollment = async (req, res) => {
  const { id } = req.params;
  const { grade } = req.body;
  try {
    const [result] = await pool.query(`
      UPDATE enrollments
      SET grade=?
      WHERE id=?
    `, [grade, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment updated' });
  } catch (error) {
    console.error('updateEnrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE enrollment
exports.deleteEnrollment = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM enrollments WHERE id=?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment deleted' });
  } catch (error) {
    console.error('deleteEnrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
