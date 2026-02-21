const mongoose = require('mongoose');

const baheeEntrySchema = new mongoose.Schema(
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
        headerName: {
            type: String,
            required: [true, 'Header name (event) is required'],
            trim: true,
        },
        sno: { type: String, default: '' },
        caste: { type: String, trim: true, default: '' },   // जाति
        name: { type: String, required: true, trim: true }, // नाम
        fatherName: { type: String, trim: true, default: '' }, // पिता का नाम
        villageName: { type: String, trim: true, default: '' }, // गाँव/पता
        income: {
            type: Number,
            default: 0,
            min: [0, 'Income cannot be negative'],
        }, // आवता
        amount: {
            type: Number,
            default: 0,
            min: [0, 'Amount cannot be negative'],
        }, // ऊपर नेट
        isLocked: { type: Boolean, default: false },
        lockDate: { type: Date, default: null },
        lockDescription: { type: String, default: '' },
    },
    { timestamps: true }
);

// Validation: income and amount cannot both be 0
baheeEntrySchema.pre('save', function (next) {
    if (this.income === 0 && this.amount === 0) {
        if (this.baheeType !== 'odhawani' && this.baheeType !== 'mahera') {
            return next(new Error('Both income and amount cannot be 0'));
        }
    }
    next();
});

baheeEntrySchema.index({ user_id: 1, baheeType: 1, headerName: 1 });

module.exports = mongoose.model('BaheeEntry', baheeEntrySchema);
