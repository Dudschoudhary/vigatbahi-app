const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: `${__dirname}/../.env` });

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Vigat Bahee API is running 🎉' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bahee-details', require('./routes/baheeDetailsRoutes'));
app.use('/api/bahee-entries', require('./routes/baheeEntryRoutes'));
app.use('/api/personal-bahee', require('./routes/personalBaheeRoutes'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Vigat Bahee API server running on port ${PORT}`);
});

module.exports = app;
