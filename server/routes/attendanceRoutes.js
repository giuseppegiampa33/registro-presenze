const express = require('express');
const router = express.Router();
const { upsertRecord, getMyRecords, getUserRecords, getAllRecords } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, upsertRecord);
router.get('/my', protect, getMyRecords);
router.get('/user/:userId', protect, admin, getUserRecords);
router.get('/all', protect, admin, getAllRecords);

module.exports = router;
