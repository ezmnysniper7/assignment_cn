// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, requireTeacher } = require('../middleware/authMiddleware');

router.post('/', verifyToken, courseController.createCourse);

// READ all
router.get('/', verifyToken, courseController.getAllCourses);

// READ one
router.get('/:id', verifyToken, courseController.getCourseById);

// UPDATE
router.put('/:id', verifyToken, courseController.updateCourse);

// DELETE
router.delete('/:id', verifyToken, courseController.deleteCourse);

module.exports = router;
