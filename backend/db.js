import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null,
};

const dbName = process.env.DB_NAME || 'vaccination';

const initializeDatabase = async () => {
    try {
        // Step 1: In production/managed databases, we usually can't create databases.
        // We only try to create if it's localhost or explicitly requested.
        if (dbConfig.host === 'localhost' || process.env.AUTO_CREATE_DB === 'true') {
            try {
                console.log(`Ensuring database "${dbName}" exists...`);
                const connection = await mysql.createConnection(dbConfig);
                await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
                await connection.end();
            } catch (err) {
                console.warn('Warning: Could not run CREATE DATABASE. Continuing assuming it exists.');
            }
        }

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
        console.error('MySQL Error:', err.message);
        throw err;
    }
};

// Exporting a promise that resolves to the pool
const poolPromise = initializeDatabase();

export default poolPromise;
