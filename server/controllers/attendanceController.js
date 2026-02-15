const db = require('../config/db');

// Upsert record (create or update)
const upsertRecord = async (req, res) => {
    const { date, status, morningStart, morningEnd, afternoonStart, afternoonEnd, notes } = req.body;
    let userId = req.body.userId || req.user.id; // Allow admin to set userId, otherwise default to self

    // If regular user tries to set for someone else, block it (unless we want to allow it?)
    // For now strict: users can only set their own. Admin can set anyone's.
    if (req.user.role !== 'admin' && req.body.userId && req.body.userId != req.user.id) {
        return res.status(401).json({ message: 'Not authorized to create records for others' });
    }

    // Formatting times to HH:MM:SS or null
    const formatTime = (t) => t ? t + ':00' : null;

    try {
        // Check if record exists
        const [existing] = await db.query(
            'SELECT id FROM attendance_records WHERE user_id = ? AND date = ?',
            [userId, date]
        );

        if (existing.length > 0) {
            // Update
            await db.query(
                `UPDATE attendance_records SET 
                 status = ?, morning_start = ?, morning_end = ?, 
                 afternoon_start = ?, afternoon_end = ?, notes = ? 
                 WHERE user_id = ? AND date = ?`,
                [status, formatTime(morningStart), formatTime(morningEnd),
                    formatTime(afternoonStart), formatTime(afternoonEnd), notes, userId, date]
            );
            res.json({ message: 'Record updated' });
        } else {
            // Insert
            await db.query(
                `INSERT INTO attendance_records 
                 (user_id, date, status, morning_start, morning_end, afternoon_start, afternoon_end, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, date, status, formatTime(morningStart), formatTime(morningEnd),
                    formatTime(afternoonStart), formatTime(afternoonEnd), notes]
            );
            res.status(201).json({ message: 'Record created' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const recordSelect = `
    SELECT id, user_id AS userId, DATE_FORMAT(date, '%Y-%m-%d') as date, status, 
    morning_start AS morningStart, morning_end AS morningEnd, 
    afternoon_start AS afternoonStart, afternoon_end AS afternoonEnd, 
    notes, created_at AS createdAt, updated_at AS updatedAt 
    FROM attendance_records`;

const getMyRecords = async (req, res) => {
    try {
        const [records] = await db.query(
            `${recordSelect} WHERE user_id = ? ORDER BY date DESC`,
            [req.user.id]
        );
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserRecords = async (req, res) => {
    try {
        const [records] = await db.query(
            `${recordSelect} WHERE user_id = ? ORDER BY date DESC`,
            [req.params.userId]
        );
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllRecords = async (req, res) => {
    // Optional filtered by date in query string
    const { date } = req.query;
    let query = recordSelect;
    let params = [];

    if (date) {
        query += ' WHERE date = ?';
        params.push(date);
    }

    query += ' ORDER BY date DESC';

    try {
        const [records] = await db.query(query, params);
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const exportMyRecords = async (req, res) => {
    try {
        const [records] = await db.query(
            `${recordSelect} WHERE user_id = ? ORDER BY date DESC`,
            [req.user.id]
        );

        // CSV Header
        let csv = 'Data,Stato,Mattina Inizio,Mattina Fine,Pomeriggio Inizio,Pomeriggio Fine,Note\n';

        // Helper to format date YYYY-MM-DD -> DD/MM/YYYY
        const formatDate = (isoDate) => {
            if (!isoDate) return '';
            const [y, m, d] = isoDate.split('-');
            return `${d}/${m}/${y}`;
        };

        // CSV Rows
        records.forEach(r => {
            const formattedDate = formatDate(r.date);
            const fullDate = r.date; // Use YYYY-MM-DD for combining with time for ISO-like timestamp, or use formatted? 
            // Usually timestamp is YYYY-MM-DD HH:mm:ss. Let's stick to that for the combo, but show DD/MM/YYYY for the Data column.

            const row = [
                formattedDate,
                r.status,
                r.morningStart ? `${fullDate} ${r.morningStart}` : '',
                r.morningEnd ? `${fullDate} ${r.morningEnd}` : '',
                r.afternoonStart ? `${fullDate} ${r.afternoonStart}` : '',
                r.afternoonEnd ? `${fullDate} ${r.afternoonEnd}` : '',
                `"${(r.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
            ].join(',');
            csv += row + '\n';
        });

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="presenze.csv"');
        res.send(csv);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { upsertRecord, getMyRecords, getUserRecords, getAllRecords, exportMyRecords };
