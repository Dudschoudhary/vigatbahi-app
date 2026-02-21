const mongoose = require('mongoose');

const baheeDetailsSchema = new mongoose.Schema(
    {
        baheeType: {
            type: String,
            required: [true, 'Bahee type is required'],
            enum: {
                values: ['vivah', 'muklawa', 'odhawani', 'mahera', 'anya'],
                message: 'Bahee type must be one of: vivah, muklawa, odhawani, mahera, anya',
            },
        },
        baheeTypeName: {
            type: String,
            required: [true, 'Bahee type name is required'],
            // Hindi display names: "विवाह की विगत", "मुकलावा की विगत", etc.
        },
        name: {
            type: String,
            required: [true, 'Event name is required'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            validate: {
                validator: function (v) {
                    return v <= new Date();
                },
                message: 'Date cannot be in the future',
            },
        },
        tithi: {
            type: String,
            default: '',
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Index for fast user-specific queries
baheeDetailsSchema.index({ user_id: 1, baheeType: 1 });

module.exports = mongoose.model('BaheeDetails', baheeDetailsSchema);
