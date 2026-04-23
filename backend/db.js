import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
};

const dbName = process.env.DB_NAME || 'vaccination';

const initializeDatabase = async () => {
    try {
        // Step 1: Connect without database to create it if it doesn't exist
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        await connection.end();
        console.log(`Database "${dbName}" ensured.`);

        // Step 2: Create the pool with the database
        const pool = mysql.createPool({
            ...dbConfig,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test the pool connection
        const conn = await pool.getConnection();
        console.log('Connected to MySQL successfully!');
        conn.release();

        return pool;
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error('Error: Could not connect to MySQL server. Is it running on port 3306?');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Error: MySQL access denied. Check your DB_USER and DB_PASSWORD in .env');
        } else {
            console.error('MySQL Error:', err.message);
        }
        throw err;
    }
};

// Exporting a promise that resolves to the pool
const poolPromise = initializeDatabase();

export default poolPromise;
