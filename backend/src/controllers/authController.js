const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { username, fullname, email, phone, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : 'Username';
            return res.status(400).json({ success: false, message: `${field} already in use` });
        }

        const user = await User.create({ username, fullname, email, phone, password });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                isTemporaryPassword: user.isTemporaryPassword,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            fullname: req.user.fullname,
            email: req.user.email,
            phone: req.user.phone,
        },
    });
};

// @desc    Forgot Password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a reset link has been sent.',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(user.email, resetToken, user.fullname);
        } catch (emailError) {
            user.resetPasswordToken = null;
            user.resetPasswordExpiry = null;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Error sending email. Try again.' });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during forgot password' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and password are required' });
        }

        // Validate strong password
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character',
            });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;
        user.isTemporaryPassword = false;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful. Please login.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during password reset' });
    }
};

// @desc    Change Password (for logged-in user)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'New password must be 8+ chars with uppercase, lowercase, number, and special character',
            });
        }

        user.password = newPassword;
        user.isTemporaryPassword = false;
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during password change' });
    }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, changePassword };
