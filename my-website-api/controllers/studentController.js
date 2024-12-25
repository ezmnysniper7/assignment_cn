// controllers/studentController.js
const pool = require('../models/db');

// GET all students
exports.getAllStudents = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students');
    res.json(rows);
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).send('Server error');
  }
};

// GET student by ID
exports.getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting student:', error);
    res.status(500).send('Server error');
  }
};

// CREATE new student
exports.createStudent = async (req, res) => {
  const { name, age } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, age) VALUES (?, ?)', 
      [name, age]
    );
    res.status(201).json({ message: 'Student created', studentId: result.insertId });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).send('Server error');
  }
};

// UPDATE student
exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, age } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE students SET name = ?, age = ? WHERE id = ?',
      [name, age, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student updated' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send('Server error');
  }
};

// DELETE student
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM students WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).send('Server error');
  }
};
