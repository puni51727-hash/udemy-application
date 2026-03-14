const express = require('express');
const router = express.Router();

// @route   POST api/chat
// @desc    Handle AI chat messages
// @access  Public (or Private)
router.post('/', async (req, res) => {
    const { message } = req.body;
    
    // Simple simulated AI logic
    let reply = "That's a great question! I'm the SkillNest AI assistant. I'm currently running in demo mode, but I'm here to encourage you to keep learning! If you'd like a real AI, the developer can hook me up to the Gemini API.";
    
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('react')) {
        reply = "React is a fantastic JavaScript library for building modern user interfaces. To learn more, check out our React course by Maximilian on the 'Explore' tab!";
    } else if (lowerMsg.includes('python')) {
        reply = "Python is incredibly versatile — great for backend, automation, and data science! Have you looked at Dr. Angela Yu's 100 Days of Code course here?";
    } else if (lowerMsg.includes('html') || lowerMsg.includes('css') || lowerMsg.includes('web')) {
        reply = "HTML, CSS, and JavaScript are the building blocks of the web. Once you master them, you can build any application! Our Complete Web Development Bootcamp is perfect for that.";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi ')) {
        reply = "Hello there! Welcome to SkillNest. How can I help you with your learning goals today?";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
        reply = "Our premium courses range from $14.99 to $29.99! They give you lifetime access and incredible, high-quality learning material.";
    } else if (lowerMsg.includes('enroll') || lowerMsg.includes('buy')) {
        reply = "To enroll, go to the 'Find Courses' page, click 'Enroll Now' on the course of your choice, and it will be added to your Dashboard instantly!";
    }

    // Simulate thinking delay so it feels like a real AI
    setTimeout(() => {
        res.json({ reply });
    }, 1500);
});

module.exports = router;
