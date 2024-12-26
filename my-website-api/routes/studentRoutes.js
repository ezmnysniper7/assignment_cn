// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// CREATE student (admin only)
router.post('/', verifyToken, requireAdmin, studentController.createStudent);

// READ all (admin only?)
router.get('/', verifyToken, requireAdmin, studentController.getAllStudents);

// READ one
router.get('/:id', verifyToken, requireAdmin, studentController.getStudentById);

// UPDATE
router.put('/:id', verifyToken, requireAdmin, studentController.updateStudent);

// DELETE
router.delete('/:id', verifyToken, requireAdmin, studentController.deleteStudent);

module.exports = router;
