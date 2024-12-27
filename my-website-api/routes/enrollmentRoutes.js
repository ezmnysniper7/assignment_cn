// routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken, requireAdmin, requireTeacher, requireStudent } = require('../middleware/authMiddleware');

// CREATE enrollment
// - Admins can create enrollments for any student
// - Students can enroll themselves
router.post('/', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access forbidden: Unauthorized role' });
  }
}, enrollmentController.createEnrollment);


// READ all enrollments (admin or teacher)
router.get('/', verifyToken, (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'teacher' || req.user.role === 'student') {
      next();
    } else {
      res.status(403).json({ message: 'Access forbidden: Unauthorized role' });
    }
  }, enrollmentController.getAllEnrollments);
  
  // READ single enrollment (admin or teacher)
  router.get('/:id', verifyToken, (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'teacher' || req.user.role === 'student') {
      next();
    } else {
      res.status(403).json({ message: 'Access forbidden: Unauthorized role' });
    }
  }, enrollmentController.getEnrollmentById);
  
  // UPDATE enrollment (admin or teacher)
  router.put('/:id', verifyToken, (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'teacher' || req.user.role === 'student') {
      next();
    } else {
      res.status(403).json({ message: 'Access forbidden: Unauthorized role' });
    }
  }, enrollmentController.updateEnrollment);
  
  // DELETE enrollment (admin only)
  router.delete('/:id', verifyToken, requireAdmin, enrollmentController.deleteEnrollment);
  
  module.exports = router;
