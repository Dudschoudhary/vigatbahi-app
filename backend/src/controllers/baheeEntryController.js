const BaheeEntry = require('../models/BaheeEntry');

const BAHEE_TYPE_NAMES = {
    vivah: 'विवाह की विगत',
    muklawa: 'मुकलावा की विगत',
    odhawani: 'ओढावणी की विगत',
    mahera: 'माहेरा की विगत',
    anya: 'अन्य विगत',
};

// @desc    Create new entry
// @route   POST /api/bahee-entries
// @access  Private
const createEntry = async (req, res) => {
    try {
        const { baheeType, headerName, sno, caste, name, fatherName, villageName, income, amount } = req.body;

        if (!baheeType || !headerName || !name) {
            return res.status(400).json({ success: false, message: 'baheeType, headerName, and name are required' });
        }

        const entry = await BaheeEntry.create({
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

        res.status(201).json({ success: true, data: entry });
    } catch (error) {
        if (error.message === 'Both income and amount cannot be 0') {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(500).json({ success: false, message: 'Error creating entry' });
    }
};

// @desc    Get all entries for user
// @route   GET /api/bahee-entries
// @access  Private
const getAllEntries = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', baheeType, headerName } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const baseFilter = { user_id: req.user._id };
        if (baheeType) baseFilter.baheeType = baheeType;
        if (headerName) baseFilter.headerName = headerName;

        let query;
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query = {
                $and: [
                    baseFilter,
                    {
                        $or: [
                            { name: { $regex: escaped, $options: 'i' } },
                            { caste: { $regex: escaped, $options: 'i' } },
                            { fatherName: { $regex: escaped, $options: 'i' } },
                            { villageName: { $regex: escaped, $options: 'i' } },
                        ],
                    },
                ],
            };
        } else {
            query = baseFilter;
        }

        const total = await BaheeEntry.countDocuments(query);
        const entries = await BaheeEntry.find(query)
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
        console.error('getAllEntries error:', error);
        res.status(500).json({ success: false, message: 'Error fetching entries' });
    }
};

// @desc    Get entries by baheeType and headerName
// @route   GET /api/bahee-entries/:baheeType/:headerName
// @access  Private
const getEntriesByTypeAndHeader = async (req, res) => {
    try {
        const { baheeType, headerName } = req.params;
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const baseFilter = {
            user_id: req.user._id,
            baheeType,
            headerName: decodeURIComponent(headerName),
        };

        let query;
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query = {
                $and: [
                    baseFilter,
                    {
                        $or: [
                            { name: { $regex: escaped, $options: 'i' } },
                            { caste: { $regex: escaped, $options: 'i' } },
                            { fatherName: { $regex: escaped, $options: 'i' } },
                            { villageName: { $regex: escaped, $options: 'i' } },
                        ],
                    },
                ],
            };
        } else {
            query = baseFilter;
        }

        const total = await BaheeEntry.countDocuments(query);
        const entries = await BaheeEntry.find(query)
            .sort({ sno: 1, createdAt: 1 })
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
        console.error('getEntriesByTypeAndHeader error:', error);
        res.status(500).json({ success: false, message: 'Error fetching entries by type' });
    }
};

// @desc    Update entry
// @route   PUT /api/bahee-entries/:id
// @access  Private
const updateEntry = async (req, res) => {
    try {
        const entry = await BaheeEntry.findOne({ _id: req.params.id, user_id: req.user._id });
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
        if (entry.isLocked) return res.status(403).json({ success: false, message: 'Entry is locked. Unlock to edit.' });

        const fields = ['sno', 'caste', 'name', 'fatherName', 'villageName', 'income', 'amount', 'headerName'];
        fields.forEach((field) => { if (req.body[field] !== undefined) entry[field] = req.body[field]; });

        await entry.save();
        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating entry' });
    }
};

// @desc    Delete entry
// @route   DELETE /api/bahee-entries/:id
// @access  Private
const deleteEntry = async (req, res) => {
    try {
        const entry = await BaheeEntry.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
        res.status(200).json({ success: true, message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting entry' });
    }
};

// @desc    Toggle lock on entry
// @route   PUT /api/bahee-entries/:id/lock
// @access  Private
const toggleLockEntry = async (req, res) => {
    try {
        const entry = await BaheeEntry.findOne({ _id: req.params.id, user_id: req.user._id });
        if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

        entry.isLocked = !entry.isLocked;
        if (entry.isLocked) {
            entry.lockDate = new Date();
            entry.lockDescription = req.body.lockDescription || 'Locked by user';
        } else {
            entry.lockDate = null;
            entry.lockDescription = '';
        }

        await entry.save();
        res.status(200).json({
            success: true,
            message: entry.isLocked ? 'Entry locked' : 'Entry unlocked',
            data: entry,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling lock' });
    }
};

module.exports = { createEntry, getAllEntries, getEntriesByTypeAndHeader, updateEntry, deleteEntry, toggleLockEntry };
