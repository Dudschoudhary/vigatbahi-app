const express = require('express');
const router = express.Router();
const {
    createEntry,
    getAllEntries,
    getEntriesByTypeAndHeader,
    updateEntry,
    deleteEntry,
    toggleLockEntry,
} = require('../controllers/baheeEntryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createEntry);
router.get('/', getAllEntries);
router.get('/:baheeType/:headerName', getEntriesByTypeAndHeader);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);
router.put('/:id/lock', toggleLockEntry);

module.exports = router;
