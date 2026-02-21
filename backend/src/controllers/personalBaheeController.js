const PersonalBahee = require('../models/PersonalBahee');
const User = require('../models/User');

const BAHEE_TYPE_NAMES = {
    vivah: 'विवाह की विगत',
    muklawa: 'मुकलावा की विगत',
    odhawani: 'ओढावणी की विगत',
    mahera: 'माहेरा की विगत',
    anya: 'अन्य विगत',
};

// @desc    Create personal bahee entry
// @route   POST /api/personal-bahee
// @access  Private
const createPersonalEntry = async (req, res) => {
    try {
        const { baheeType, headerName, sno, caste, name, fatherName, villageName, income, amount } = req.body;

        if (!baheeType || !headerName || !name) {
            return res.status(400).json({ success: false, message: 'baheeType, headerName, and name are required' });
        }

        const entry = await PersonalBahee.create({
            baheeType,
            baheeTypeName: BAHEE_TYPE_NAMES[baheeType] || baheeType,
            user_id: req.user._id,
            headerName,
            sno: sno || '',
            caste: caste || '',
            name,
            fatherName: fatherName || '',
            villageName: villageName || '',
            income: income || 0,
            amount: amount || 0,
        });

        await User.findByIdAndUpdate(req.user._id, {
            $push: { PersonalbaheeModal_ids: entry._id },
        });

        res.status(201).json({ success: true, data: entry });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating personal entry' });
    }
};

// @desc    Get all personal entries
// @route   GET /api/personal-bahee
// @access  Private
const getAllPersonalEntries = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', baheeType } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { user_id: req.user._id };
        if (baheeType) query.baheeType = baheeType;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { caste: { $regex: search, $options: 'i' } },
                { fatherName: { $regex: search, $options: 'i' } },
                { villageName: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await PersonalBahee.countDocuments(query);
        const entries = await PersonalBahee.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: entries,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching personal entries' });
    }
};

// @desc    Update personal entry
// @route   PUT /api/personal-bahee/:id
// @access  Private
const updatePersonalEntry = async (req, res) => {
    try {
        const entry = await PersonalBahee.findOne({ _id: req.params.id, user_id: req.user._id });
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
        if (entry.isLocked) return res.status(403).json({ success: false, message: 'Entry is locked' });

        const fields = ['sno', 'caste', 'name', 'fatherName', 'villageName', 'income', 'amount'];
        fields.forEach((field) => { if (req.body[field] !== undefined) entry[field] = req.body[field]; });

        await entry.save();
        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating personal entry' });
    }
};

// @desc    Delete personal entry
// @route   DELETE /api/personal-bahee/:id
// @access  Private
const deletePersonalEntry = async (req, res) => {
    try {
        const entry = await PersonalBahee.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { PersonalbaheeModal_ids: entry._id },
        });

        res.status(200).json({ success: true, message: 'Personal entry deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting personal entry' });
    }
};

// @desc    Toggle lock on personal entry
// @route   PUT /api/personal-bahee/:id/lock
// @access  Private
const toggleLockPersonalEntry = async (req, res) => {
    try {
        const entry = await PersonalBahee.findOne({ _id: req.params.id, user_id: req.user._id });
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

        entry.isLocked = !entry.isLocked;
        entry.lockDate = entry.isLocked ? new Date() : null;
        entry.lockDescription = entry.isLocked ? (req.body.lockDescription || 'Locked') : '';

        await entry.save();
        res.status(200).json({ success: true, message: entry.isLocked ? 'Locked' : 'Unlocked', data: entry });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling lock' });
    }
};

module.exports = { createPersonalEntry, getAllPersonalEntries, updatePersonalEntry, deletePersonalEntry, toggleLockPersonalEntry };
