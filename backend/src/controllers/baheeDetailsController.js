const BaheeDetails = require('../models/BaheeDetails');
const User = require('../models/User');

const BAHEE_TYPE_NAMES = {
    vivah: 'विवाह की विगत',
    muklawa: 'मुकलावा की विगत',
    odhawani: 'ओढावणी की विगत',
    mahera: 'माहेरा की विगत',
    anya: 'अन्य विगत',
};

// @desc    Create new Bahee Detail (event header)
// @route   POST /api/bahee-details
// @access  Private
const createBaheeDetails = async (req, res) => {
    try {
        const { baheeType, name, date, tithi } = req.body;

        if (!baheeType || !name || !date) {
            return res.status(400).json({ success: false, message: 'baheeType, name, and date are required' });
        }

        const baheeDetails = await BaheeDetails.create({
            baheeType,
            baheeTypeName: BAHEE_TYPE_NAMES[baheeType] || baheeType,
            name,
            date,
            tithi: tithi || '',
            user_id: req.user._id,
        });

        // Add reference to user
        await User.findByIdAndUpdate(req.user._id, {
            $push: { baheeDetails_ids: baheeDetails._id },
        });

        res.status(201).json({ success: true, data: baheeDetails });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(500).json({ success: false, message: 'Error creating bahee details' });
    }
};

// @desc    Get all Bahee Details for logged-in user
// @route   GET /api/bahee-details
// @access  Private
const getAllBaheeDetails = async (req, res) => {
    try {
        const baheeDetails = await BaheeDetails.find({ user_id: req.user._id }).sort({ date: -1 });
        res.status(200).json({ success: true, count: baheeDetails.length, data: baheeDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching bahee details' });
    }
};

// @desc    Get Bahee Details by type
// @route   GET /api/bahee-details/type/:baheeType
// @access  Private
const getBaheeDetailsByType = async (req, res) => {
    try {
        const { baheeType } = req.params;
        const baheeDetails = await BaheeDetails.find({
            user_id: req.user._id,
            baheeType,
        }).sort({ date: -1 });
        res.status(200).json({ success: true, count: baheeDetails.length, data: baheeDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching bahee details by type' });
    }
};

// @desc    Update Bahee Detail
// @route   PUT /api/bahee-details/:id
// @access  Private
const updateBaheeDetails = async (req, res) => {
    try {
        const baheeDetails = await BaheeDetails.findOne({ _id: req.params.id, user_id: req.user._id });
        if (!baheeDetails) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        const { name, date, tithi, baheeType } = req.body;
        if (name) baheeDetails.name = name;
        if (date) baheeDetails.date = date;
        if (tithi !== undefined) baheeDetails.tithi = tithi;
        if (baheeType) {
            baheeDetails.baheeType = baheeType;
            baheeDetails.baheeTypeName = BAHEE_TYPE_NAMES[baheeType] || baheeType;
        }

        await baheeDetails.save();
        res.status(200).json({ success: true, data: baheeDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating bahee details' });
    }
};

// @desc    Delete Bahee Detail
// @route   DELETE /api/bahee-details/:id
// @access  Private
const deleteBaheeDetails = async (req, res) => {
    try {
        const baheeDetails = await BaheeDetails.findOneAndDelete({
            _id: req.params.id,
            user_id: req.user._id,
        });

        if (!baheeDetails) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { baheeDetails_ids: baheeDetails._id },
        });

        res.status(200).json({ success: true, message: 'Bahee detail deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting bahee detail' });
    }
};

module.exports = {
    createBaheeDetails,
    getAllBaheeDetails,
    getBaheeDetailsByType,
    updateBaheeDetails,
    deleteBaheeDetails,
};
