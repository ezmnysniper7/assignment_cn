// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// CREATE teacher (admin only)
router.post('/', verifyToken, requireAdmin, teacherController.createTeacher);

// READ all teachers (admin only?)
router.get('/', verifyToken, requireAdmin, teacherController.getAllTeachers);

// READ one teacher by ID
router.get('/:id', verifyToken, requireAdmin, teacherController.getTeacherById);

// UPDATE teacher
router.put('/:id', verifyToken, requireAdmin, teacherController.updateTeacher);

// DELETE teacher
router.delete('/:id', verifyToken, requireAdmin, teacherController.deleteTeacher);

module.exports = router;
