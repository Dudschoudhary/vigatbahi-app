const express = require('express');
const router = express.Router();
const {
    createBaheeDetails,
    getAllBaheeDetails,
    getBaheeDetailsByType,
    updateBaheeDetails,
    deleteBaheeDetails,
} = require('../controllers/baheeDetailsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes protected

router.post('/', createBaheeDetails);
router.get('/', getAllBaheeDetails);
router.get('/type/:baheeType', getBaheeDetailsByType);
router.put('/:id', updateBaheeDetails);
router.delete('/:id', deleteBaheeDetails);

module.exports = router;
