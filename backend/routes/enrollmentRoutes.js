const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/authMiddleware');

// @route   POST api/enrollments
// @desc    Enroll in a course
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { course_id } = req.body;
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user_id: req.user.id, course_id });
    if (existingEnrollment) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const newEnrollment = new Enrollment({
      user_id: req.user.id,
      course_id
    });

    const enrollment = await newEnrollment.save();
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/enrollments
// @desc    Get user enrolled courses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user_id: req.user.id }).populate('course_id');
    res.json(enrollments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
