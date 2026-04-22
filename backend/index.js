import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import pool from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// In-memory store for OTPs (temporarily stores email -> { otp, expiresAt })
const otpStore = new Map();

// Configure Nodemailer transporter (Example: using Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Initialize database tables
const initDb = async () => {
    try {
        // Create table without dropping it so data persists
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        mobile_number VARCHAR(20),
        age INT,
        profile_picture LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await pool.query(`
      CREATE TABLE IF NOT EXISTS children (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(50),
        blood_group VARCHAR(10),
        avatar_url LONGTEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vaccines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        child_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        dose_when VARCHAR(255),
        status VARCHAR(50) DEFAULT 'upcoming',
        due_date DATE,
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
      )
    `);
        console.log('Users, children, and vaccines tables initialized');
    } catch (err) {
        console.error('Error initializing db:', err);
    }
};
initDb();

// Basic test route
app.get('/', (req, res) => {
    res.send('VaxiCare Backend is running!');
});

// Send real OTP via email
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address is required' });
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Save to memory storage
    otpStore.set(email, { otp, expiresAt });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your VaxiCare Login OTP',
        html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                <h2>Welcome to VaxiCare!</h2>
                <p>Your One-Time Password (OTP) for login is:</p>
                <h1 style="color: #ec5b13; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in 5 minutes. Do not share it with anyone.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Sent real OTP to ${email}`);
        res.json({ message: 'OTP sent to your email successfully', success: true });
    } catch (err) {
        console.error('Email sending error:', err);
        res.status(500).json({ error: 'Failed to send OTP email. Please check backend configuration.' });
    }
});

// Verify OTP and Login/Signup
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
        return res.status(400).json({ error: 'OTP expired or not requested' });
    }

    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP was correct! Clear it from memory to prevent reuse
    otpStore.delete(email);

    try {
        // Check if user exists
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        let user = rows[0];

        // Create if they don't exist
        if (!user) {
            const [result] = await pool.query('INSERT INTO users (email) VALUES (?)', [email]);
            user = { id: result.insertId, email: email };
            console.log('Created new user:', user);
        } else {
            console.log('Existing user logged in:', user);
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', { expiresIn: '7d' });

        res.json({ message: 'Login successful', user, token, success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Update Profile API
app.post('/api/profile', authenticateToken, async (req, res) => {
    const { email, full_name, mobile_number, age, profile_picture } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required to update profile' });
    }

    try {
        await pool.query(
            'UPDATE users SET full_name = ?, mobile_number = ?, age = ?, profile_picture = ? WHERE email = ?',
            [full_name, mobile_number, age, profile_picture, email]
        );
        res.json({ message: 'Profile updated successfully!', success: true });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user's children
app.get('/api/children', authenticateToken, async (req, res) => {
    try {
        const [children] = await pool.query('SELECT * FROM children WHERE user_id = ?', [req.user.id]);

        for (let child of children) {
            const [vaccines] = await pool.query('SELECT * FROM vaccines WHERE child_id = ?', [child.id]);
            child.vaccines = vaccines.map(v => ({
                id: v.id,
                name: v.name,
                when: v.dose_when,
                status: v.status,
                dueDate: v.due_date,
                hospitalName: v.hospital_name || '',
                doctorName: v.doctor_name || '',
                notes: v.notes || '',
                proofUrl: v.proof_url || '',
                dateAdministered: v.administered_date || ''
            }));

            // Reformat native MySQL Date to standard YYYY-MM-DD for frontend compatibility
            if (child.dob) {
                const dateObj = new Date(child.dob);
                child.dob = dateObj.toISOString().split('T')[0];
            }

            child.completed = child.vaccines.filter(v => v.status === 'done').length;
            child.upcoming = child.vaccines.filter(v => v.status === 'upcoming').length;
            child.missed = child.vaccines.filter(v => v.status === 'missed').length;
            child.progress = child.vaccines.length > 0 ? Math.round((child.completed / child.vaccines.length) * 100) : 0;
            child.avatarUrl = child.avatar_url;
            child.bloodGroup = child.blood_group;
        }

        res.json({ children, success: true });
    } catch (err) {
        console.error('Error fetching children:', err);
        res.status(500).json({ error: 'Failed to fetch children' });
    }
});

// Add a child
app.post('/api/children', authenticateToken, async (req, res) => {
    const { name, dob, gender, bloodGroup, avatarUrl, vaccines } = req.body;

    if (!name || !dob) {
        return res.status(400).json({ error: 'Name and DOB are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO children (user_id, name, dob, gender, blood_group, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, name, dob, gender, bloodGroup, avatarUrl]
        );
        const childId = result.insertId;

        if (vaccines && vaccines.length > 0) {
            const values = vaccines.map(v => [
                childId,
                v.name,
                v.when,
                // MySQL date strings standard YYYY-MM-DD
                v.status,
                v.dueDate ? new Date(v.dueDate).toISOString().split('T')[0] : null
            ]);
            await pool.query('INSERT INTO vaccines (child_id, name, dose_when, status, due_date) VALUES ?', [values]);
        }

        res.json({ message: 'Child added successfully', childId, success: true });
    } catch (err) {
        console.error('Error adding child:', err);
        res.status(500).json({ error: 'Failed to add child' });
    }
});

// Delete a child
app.delete('/api/children/:id', authenticateToken, async (req, res) => {
    const childId = req.params.id;
    try {
        const [child] = await pool.query('SELECT id FROM children WHERE id = ? AND user_id = ?', [childId, req.user.id]);
        if (child.length === 0) {
            return res.status(404).json({ error: 'Child not found or unauthorized' });
        }
        await pool.query('DELETE FROM children WHERE id = ?', [childId]);
        res.json({ message: 'Child deleted successfully', success: true });
    } catch (err) {
        console.error('Error deleting child:', err);
        res.status(500).json({ error: 'Failed to delete child' });
    }
});

// Update Vaccine Status
app.put('/api/vaccines/:id', authenticateToken, async (req, res) => {
    const vaccineId = req.params.id;
    const { status, dateAdministered, dueDate, hospitalName, doctorName, notes, proofUrl } = req.body;

    try {
        // Verify the vaccine belongs to a child owned by the logged-in user
        const [vaccineCheck] = await pool.query(`
            SELECT v.id FROM vaccines v
            JOIN children c ON v.child_id = c.id
            WHERE v.id = ? AND c.user_id = ?
        `, [vaccineId, req.user.id]);

        if (vaccineCheck.length === 0) {
            return res.status(404).json({ error: 'Vaccine not found or unauthorized' });
        }

        if (status === 'done') {
            await pool.query(
                `UPDATE vaccines 
                 SET status = ?, due_date = ?, administered_date = ?, hospital_name = ?, doctor_name = ?, notes = ?, proof_url = ? 
                 WHERE id = ?`,
                [
                    status, 
                    dateAdministered || new Date().toISOString().split('T')[0], 
                    dateAdministered || new Date().toISOString().split('T')[0],
                    hospitalName || null,
                    doctorName || null,
                    notes || null,
                    proofUrl || null,
                    vaccineId
                ]
            );
        } else {
            if (dueDate) {
                await pool.query(
                    'UPDATE vaccines SET status = ?, due_date = ?, hospital_name=NULL, doctor_name=NULL, notes=NULL, proof_url=NULL, administered_date=NULL WHERE id = ?',
                    [status, dueDate, vaccineId]
                );
            } else {
                await pool.query(
                    'UPDATE vaccines SET status = ?, hospital_name=NULL, doctor_name=NULL, notes=NULL, proof_url=NULL, administered_date=NULL WHERE id = ?',
                    [status, vaccineId]
                );
            }
        }

        res.json({ message: 'Vaccine updated successfully', success: true });
    } catch (err) {
        console.error('Error updating vaccine:', err);
        res.status(500).json({ error: 'Failed to update vaccine' });
    }
});

// Daily Cron Job for Reminders (Runs at 8:00 AM every day)
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily vaccine reminder check...');
    try {
        // Find vaccines due in exactly 3 days that are still 'upcoming'
        const [dueVaccines] = await pool.query(`
            SELECT v.name as vaccine_name, v.due_date, c.name as child_name, u.email as parent_email 
            FROM vaccines v
            JOIN children c ON v.child_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE v.status = 'upcoming' 
            AND v.due_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        `);

        if (dueVaccines.length > 0) {
            console.log(`Found ${dueVaccines.length} vaccines due soon. Sending emails...`);
            for (const reminder of dueVaccines) {
                const formattedDate = new Date(reminder.due_date).toLocaleDateString();
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: reminder.parent_email,
                    subject: `VaxiCare Reminder: ${reminder.child_name}'s vaccination is coming up!`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2>Hello from VaxiCare!</h2>
                            <p>This is a gentle reminder that your child, <strong>${reminder.child_name}</strong>, has an upcoming vaccination.</p>
                            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ec5b13; margin: 20px 0;">
                                <p style="margin: 0; font-size: 16px;"><strong>Vaccine:</strong> ${reminder.vaccine_name}</p>
                                <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Due Date:</strong> ${formattedDate}</p>
                            </div>
                            <p>Please make sure to schedule an appointment with your pediatrician if you haven't already.</p>
                            <p>Stay healthy!<br/>- The VaxiCare Team</p>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
                console.log(`Sent reminder to ${reminder.parent_email} for ${reminder.child_name}`);
            }
        } else {
            console.log('No vaccines due in 3 days. Skipping emails.');
        }
    } catch (err) {
        console.error('Error running daily cron job:', err);
    }
});

// Manual trigger for testing/demoing the Cron Job in a hackathon
app.get('/api/trigger-reminders', async (req, res) => {
    console.log('Manual trigger: Running vaccine reminder check...');
    try {
        // Find vaccines due in exactly 3 days that are still 'upcoming'
        // For Hackathon Demo purposes, we removed the strict '3 DAY' condition 
        // to just grab *any* upcoming vaccine quickly so the email actually sends!
        const [dueVaccines] = await pool.query(`
            SELECT v.name as vaccine_name, v.due_date, c.name as child_name, u.email as parent_email 
            FROM vaccines v
            JOIN children c ON v.child_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE v.status = 'upcoming' OR v.status = 'due'
            LIMIT 1
        `);

        if (dueVaccines.length > 0) {
            console.log(`Found vaccine to demo. Sending email...`);
            const reminder = dueVaccines[0];
            const formattedDate = new Date(reminder.due_date).toLocaleDateString();
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: reminder.parent_email,
                subject: `VaxiCare Reminder: ${reminder.child_name}'s vaccination is coming up!`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>Hello from VaxiCare!</h2>
                        <p>This is a gentle reminder that your child, <strong>${reminder.child_name}</strong>, has an upcoming vaccination.</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ec5b13; margin: 20px 0;">
                            <p style="margin: 0; font-size: 16px;"><strong>Vaccine:</strong> ${reminder.vaccine_name}</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Due Date:</strong> ${formattedDate}</p>
                        </div>
                        <p>Please make sure to schedule an appointment with your pediatrician if you haven't already.</p>
                        <p>Stay healthy!<br/>- The VaxiCare Team</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
            res.json({ message: `Sent reminder to ${reminder.parent_email} for ${reminder.child_name}`, success: true });
        } else {
            res.json({ message: 'No upcoming vaccines found to send a demo email for.', success: false });
        }
    } catch (err) {
        console.error('Error running manual reminder trigger:', err);
        res.status(500).json({ error: 'Failed to trigger reminders' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Force nodemon restart to load .env
