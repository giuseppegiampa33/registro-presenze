require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing DB conection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    // console.log('Password:', process.env.DB_PASSWORD); 

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Successfully connected to database!');
        await connection.end();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
}

testConnection();
