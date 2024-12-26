const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function createAdmin() {
    try {
        // Hash the password
        const password = "SHAIKHFAR15";
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin with hashed password
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            ['farkhanda', 'shaikhfarkhanda14@gmail.com', hashedPassword, 'admin', 'active']
        );

        console.log('Admin created successfully!');
        console.log('You can now login with:');
        console.log('Email: shaikhfarkhanda14@gmail.com');
        console.log('Password: SHAIKHFAR15');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        process.exit();
    }
}

createAdmin();