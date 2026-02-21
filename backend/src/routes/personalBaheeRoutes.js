const express = require('express');
const router = express.Router();
const {
    createPersonalEntry,
    getAllPersonalEntries,
    updatePersonalEntry,
    deletePersonalEntry,
    toggleLockPersonalEntry,
} = require('../controllers/personalBaheeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createPersonalEntry);
router.get('/', getAllPersonalEntries);
router.put('/:id', updatePersonalEntry);
router.delete('/:id', deletePersonalEntry);
router.put('/:id/lock', toggleLockPersonalEntry);

module.exports = router;
