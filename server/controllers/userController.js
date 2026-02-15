const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, first_name AS firstName, last_name AS lastName, email, role, company_id AS companyId FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, first_name AS firstName, last_name AS lastName, email, role, company_id AS companyId FROM users WHERE id = ?', [req.params.id]);
        const user = users[0];

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = req.user;
        const { firstName, lastName, email, password } = req.body;
        const userIdToUpdate = req.params.id;

        // Only allow users to update their own profile unless admin
        if (user.role !== 'admin' && user.id != userIdToUpdate) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let updateQuery = 'UPDATE users SET first_name = ?, last_name = ?, email = ?';
        let queryParams = [firstName, lastName, email];

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            updateQuery += ', password_hash = ?';
            queryParams.push(passwordHash);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(userIdToUpdate);

        await db.query(updateQuery, queryParams);

        const [updatedUsers] = await db.query('SELECT id, first_name, last_name, email, role, company_id FROM users WHERE id = ?', [userIdToUpdate]);
        res.json(updatedUsers[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profilePicturePath = '/uploads/profiles/' + req.file.filename;

        await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicturePath, req.user.id]);

        res.json({
            message: 'Profile picture updated',
            profilePicture: profilePicturePath
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, uploadProfilePicture };
