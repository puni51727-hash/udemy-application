const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const { MongoMemoryServer } = require('mongodb-memory-server');

// Connect to MongoDB In-Memory Server automatically
const connectDB = async () => {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB In-Memory Server Connected...');

        // Seed courses for the UI automatically
        const Course = require('./models/Course');
        const count = await Course.countDocuments();
        if (count === 0) {
            const seedCourses = require('./seedData');
            await Course.insertMany(seedCourses);
            console.log(`Seeded ${seedCourses.length} comprehensive courses into the database!`);
        }
    } catch (err) {
        console.error('Failed to connect to in-memory MongoDB:', err);
    }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
