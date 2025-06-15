const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    notes: {
        type: String,
        default: ''
    },
    timeSpent: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add an index to improve query performance
taskSchema.index({ userId: 1, createdAt: -1 });

// Add a pre-save middleware for any necessary data transformation
taskSchema.pre('save', function(next) {
    // Ensure timeSpent is never negative
    if (this.timeSpent < 0) this.timeSpent = 0;
    next();
});

module.exports = mongoose.model('Task', taskSchema);
