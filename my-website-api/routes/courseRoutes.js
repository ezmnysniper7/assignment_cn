// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, requireTeacher } = require('../middleware/authMiddleware');

// CREATE (teacher or admin) - we'll only allow teacher by default
router.post('/', verifyToken, requireTeacher, courseController.createCourse);

// READ all
router.get('/', verifyToken, courseController.getAllCourses);

// READ one
router.get('/:id', verifyToken, courseController.getCourseById);

// UPDATE
router.put('/:id', verifyToken, requireTeacher, courseController.updateCourse);

// DELETE
router.delete('/:id', verifyToken, requireTeacher, courseController.deleteCourse);

module.exports = router;
