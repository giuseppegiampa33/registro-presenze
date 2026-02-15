const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role, companyId } = req.body;

    try {
        const [userExists] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, passwordHash, role || 'intern', companyId || null]
        );

        const userId = result.insertId;

        res.status(201).json({
            id: userId,
            firstName,
            lastName,
            email,
            role: role || 'intern',
            token: generateToken(userId, role || 'intern'),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            res.json({
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role,
                companyId: user.company_id,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, first_name, last_name, email, role, company_id FROM users WHERE id = ?', [req.user.id]);
        const user = users[0];
        if (user) {
            res.json({
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role,
                companyId: user.company_id
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { registerUser, loginUser, getMe };
