const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/authMiddleware');

// @route   GET api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/courses
// @desc    Create a course (For testing/seeding purposes)
// @access  Public
router.post('/', async (req, res) => {
    const { title, instructor, price, description, youtube_link } = req.body;
    try {
        const newCourse = new Course({
            title, instructor, price, description, youtube_link
        });
        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
