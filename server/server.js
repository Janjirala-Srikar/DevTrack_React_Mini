const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Task = require('./models/Task');

// Load environment variables
dotenv.config({ path: './config.env' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) throw new Error();
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate' });
    }
};

// Routes

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.comparePassword(password))) {
            throw new Error('Invalid login credentials');
        }
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Task routes
app.post('/api/tasks', auth, async (req, res) => {
    try {
        console.log('Received task creation request:', req.body); // Debug log
        
        const task = new Task({
            ...req.body,
            userId: req.user._id
        });

        console.log('Created task object:', task); // Debug log

        await task.save();
        console.log('Task saved successfully:', task); // Debug log

        res.status(201).send(task);
    } catch (error) {
        console.error('Error in task creation:', error); // Debug log
        res.status(400).send({ 
            error: error.message,
            details: error.errors // Include mongoose validation errors if any
        });
    }
});

app.get('/api/tasks', auth, async (req, res) => {
    try {
        console.log('Fetching tasks for user:', req.user._id); // Debug log
        
        const tasks = await Task.find({ userId: req.user._id });
        console.log('Found tasks:', tasks); // Debug log
        
        res.send(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send({ error: error.message });
    }
});

app.patch('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!task) return res.status(404).send();
        res.send(task);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!task) return res.status(404).send();
        res.send(task);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
