// controllers/enrollmentController.js
const pool = require('../models/db');

// CREATE enrollment
exports.createEnrollment = async (req, res) => {
  const { courseId, studentId } = req.body; // Removed 'grade' from creation
  const userRole = req.user.role;
  const userId = req.user.userId;

  // Determine the student ID based on role
  let enrollStudentId = studentId;
  if (userRole === 'student') {
    enrollStudentId = userId; // Students can only enroll themselves
  }

  // Teachers are not allowed to create enrollments
  if (userRole === 'teacher') {
    return res.status(403).json({ message: 'Access forbidden: Teachers cannot create enrollments' });
  }

  try {
    // Verify the student exists
    const [checkStudent] = await pool.query(
      'SELECT * FROM students WHERE student_id = ?',
      [enrollStudentId]
    );
    if (checkStudent.length === 0) {
      return res.status(404).json({ message: 'Student does not exist' });
    }

    // Verify the course exists
    const [checkCourse] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );
    if (checkCourse.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the enrollment already exists to prevent duplicates
    const [existingEnrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [enrollStudentId, courseId]
    );
    if (existingEnrollment.length > 0) {
      return res.status(400).json({ message: 'Enrollment already exists' });
    }

    // Create enrollment
    const [result] = await pool.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
      [enrollStudentId, courseId]
    );

    res.status(201).json({ message: 'Enrollment created', enrollmentId: result.insertId });
  } catch (error) {
    console.error('createEnrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ all enrollments
exports.getAllEnrollments = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.userId;

  try {
    let query = `
      SELECT e.id, e.student_id, e.course_id, e.grade,
             s.major, s.name AS studentName, c.name AS courseName,
             c.department AS courseDepartment, c.title AS courseTitle
      FROM enrollments e
      JOIN students s ON s.student_id = e.student_id
      JOIN courses c ON c.id = e.course_id
    `;
    let params = [];

    if (userRole === 'teacher') {
      // Teachers can only see enrollments for their courses
      query += ' WHERE c.teacher_id = ?';
      params.push(userId);
    } else if (userRole === 'student') {
      // Students can only see their own enrollments
      query += ' WHERE e.student_id = ?';
      params.push(userId);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('getAllEnrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// READ single enrollment
exports.getEnrollmentById = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `
      SELECT e.id, e.student_id, e.course_id, e.grade,
             s.major, s.name AS studentName, c.name AS courseName,
             c.department AS courseDepartment, c.title AS courseTitle
      FROM enrollments e
      JOIN students s ON s.student_id = e.student_id
      JOIN courses c ON c.id = e.course_id
      WHERE e.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const enrollment = rows[0];

    // Authorization: Teachers can only access enrollments for their courses
    if (userRole === 'teacher' && enrollment.course_id) {
      const [teacherCheck] = await pool.query(
        'SELECT * FROM courses WHERE id = ? AND teacher_id = ?',
        [enrollment.course_id, userId]
      );
      if (teacherCheck.length === 0) {
        return res.status(403).json({ message: 'Access forbidden: Not your course' });
      }
    }

    // Students can only access their own enrollments
    if (userRole === 'student' && enrollment.student_id !== userId) {
      return res.status(403).json({ message: 'Access forbidden: Not your enrollment' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('getEnrollmentById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE enrollment (only grade)
exports.updateEnrollment = async (req, res) => {
  const { id } = req.params;
  const { grade } = req.body;
  const userRole = req.user.role;
  const userId = req.user.userId;

  try {
    // Fetch the enrollment to verify access
    const [rows] = await pool.query(
      'SELECT * FROM enrollments WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const enrollment = rows[0];

    // Authorization:
    // - Teachers can update grades for their courses
    // - Admins can update any enrollment
    if (userRole === 'teacher') {
      // Verify that the teacher owns the course
      const [courseRows] = await pool.query(
        'SELECT * FROM courses WHERE id = ? AND teacher_id = ?',
        [enrollment.course_id, userId]
      );
      if (courseRows.length === 0) {
        return res.status(403).json({ message: 'Access forbidden: Not your course' });
      }
    } else if (userRole !== 'admin') {
      // Only Admins and Teachers can update enrollments
      return res.status(403).json({ message: 'Access forbidden: Unauthorized role' });
    }

    // Update the grade
    const [result] = await pool.query(
      'UPDATE enrollments SET grade = ? WHERE id = ?',
      [grade, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Enrollment updated successfully' });
  } catch (error) {
    console.error('updateEnrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE enrollment
exports.deleteEnrollment = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;
  const userId = req.user.userId;

  try {
    // Fetch the enrollment to verify access
    const [rows] = await pool.query(
      'SELECT * FROM enrollments WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const enrollment = rows[0];

    // Authorization:
    // - Admins can delete any enrollment
    // - Teachers can delete enrollments for their courses
    if (userRole === 'teacher') {
      // Verify that the teacher owns the course
      const [courseRows] = await pool.query(
        'SELECT * FROM courses WHERE id = ? AND teacher_id = ?',
        [enrollment.course_id, userId]
      );
      if (courseRows.length === 0) {
        return res.status(403).json({ message: 'Access forbidden: Not your course' });
      }
    } else if (userRole !== 'admin') {
      // Only Admins and Teachers can delete enrollments
      return res.status(403).json({ message: 'Access forbidden: Unauthorized role' });
    }

    // Delete the enrollment
    const [result] = await pool.query(
      'DELETE FROM enrollments WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('deleteEnrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
