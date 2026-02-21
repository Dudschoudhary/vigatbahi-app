const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            lowercase: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username must be at most 30 characters'],
            match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        fullname: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            minlength: [3, 'Full name must be at least 3 characters'],
            maxlength: [50, 'Full name must be at most 50 characters'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^\d{10,15}$/, 'Phone number must be 10-15 digits'],
        },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpiry: { type: Date, default: null },
        isTemporaryPassword: { type: Boolean, default: false },
        baheeDetails_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BaheeDetails' }],
        PersonalbaheeModal_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PersonalBahee' }],
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
