const mongoose = require('mongoose');

// Same structure as BaheeEntry but for personal contributions tracking
const personalBaheeSchema = new mongoose.Schema(
    {
        baheeType: {
            type: String,
            required: true,
            enum: ['vivah', 'muklawa', 'odhawani', 'mahera', 'anya'],
        },
        baheeTypeName: { type: String, required: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        headerName: { type: String, required: true, trim: true },
        sno: { type: String, default: '' },
        caste: { type: String, trim: true, default: '' },
        name: { type: String, required: true, trim: true },
        fatherName: { type: String, trim: true, default: '' },
        villageName: { type: String, trim: true, default: '' },
        income: { type: Number, default: 0, min: 0 },
        amount: { type: Number, default: 0, min: 0 },
        isLocked: { type: Boolean, default: false },
        lockDate: { type: Date, default: null },
        lockDescription: { type: String, default: '' },
    },
    { timestamps: true }
);

personalBaheeSchema.index({ user_id: 1, baheeType: 1 });

module.exports = mongoose.model('PersonalBahee', personalBaheeSchema);
