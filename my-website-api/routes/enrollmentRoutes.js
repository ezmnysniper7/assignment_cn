// routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken, requireAdmin, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

// CREATE enrollment (student or admin)
router.post('/', verifyToken, enrollmentController.createEnrollment);

// READ all enrollments (admin or teacher)
router.get('/', verifyToken, requireTeacher, enrollmentController.getAllEnrollments);

// READ one
router.get('/:id', verifyToken, requireTeacher, enrollmentController.getEnrollmentById);

// UPDATE (maybe admin or teacher update grade)
router.put('/:id', verifyToken, requireTeacher, enrollmentController.updateEnrollment);

// DELETE
router.delete('/:id', verifyToken, requireAdmin, enrollmentController.deleteEnrollment);

module.exports = router;
