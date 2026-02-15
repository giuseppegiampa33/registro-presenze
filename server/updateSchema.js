const db = require('./config/db');

const updateSchema = async () => {
    try {
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN reset_password_token VARCHAR(255) NULL,
            ADD COLUMN reset_password_expires DATETIME NULL;
        `);
        console.log('Schema updated successfully');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist, skipping.');
        } else {
            console.error('Error updating schema:', error);
        }
    }
    process.exit();
};

updateSchema();
