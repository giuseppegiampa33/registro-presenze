const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, uploadProfilePicture } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, admin, deleteUser);

const upload = require('../middleware/uploadMiddleware');

router.post('/upload-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
