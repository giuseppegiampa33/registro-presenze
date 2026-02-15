const express = require('express');
const router = express.Router();
const { upsertRecord, getMyRecords, getUserRecords, getAllRecords, exportMyRecords } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

const { validateAttendance } = require('../middleware/validationMiddleware');

router.post('/', protect, validateAttendance, upsertRecord);
router.get('/my', protect, getMyRecords);
router.get('/export', protect, exportMyRecords);
router.get('/user/:userId', protect, admin, getUserRecords);
router.get('/all', protect, admin, getAllRecords);

module.exports = router;
