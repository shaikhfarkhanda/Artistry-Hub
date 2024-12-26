// db.js - Database configuration
const mysql = require('mysql2/promise');

// Create connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'art_gallery',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Database connected successfully!');
        connection.release();
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
})();

// Helper functions for database operations
db.executeTransaction = async (queries) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const results = [];

        for (const query of queries) {
            const [result] = await connection.execute(query.sql, query.values);
            results.push(result);
        }

        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = db;