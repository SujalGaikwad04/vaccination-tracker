import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import poolPromise from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

let pool; // This will be initialized from poolPromise

// Middleware
const allowedOrigins = [
    'http://localhost:5173', // Vite default
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // In development or if not strictly set, allow all. Change to error for high security.
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// In-memory store for OTPs
const otpStore = new Map();

// Configure Nodemailer transporter (Direct SMTP is more reliable than "service: gmail")
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Initialize database tables
const initDb = async () => {
    try {
        if (!pool) pool = await poolPromise;

        console.log('Initializing database tables...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        mobile_number VARCHAR(20),
        age INT,
        profile_picture LONGTEXT,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Migration: Ensure password column exists (for existing tables)
        try {
            await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)');
        } catch (e) {
            // Column likely already exists
        }
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
        administered_date DATE,
        hospital_name VARCHAR(255),
        doctor_name VARCHAR(255),
        notes TEXT,
        proof_url TEXT,
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
      )
    `);
        console.log('Database tables initialized successfully');
    } catch (err) {
        console.error('CRITICAL: Error initializing database tables:', err.message);
        // We don't exit here, but the server might not function correctly
    }
};

// Start Server after DB is ready
const startServer = async () => {
    try {
        console.log('Waiting for database connection...');
        pool = await poolPromise;
        await initDb();
        
        app.listen(port, () => {
            console.log(`🚀 Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('FATAL: Could not start server due to database failure.');
        console.error('Reason:', err.message);
        process.exit(1);
    }
};

startServer();

// --- ROUTES ---

// Basic test route
app.get('/', (req, res) => {
    res.send('VaxiCare Backend is running!');
});

// Send OTP
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

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
                <p>This code will expire in 5 minutes.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Sent OTP to ${email}`);
        res.json({ message: 'OTP sent successfully', success: true });
    } catch (err) {
        console.error('Email Error:', err.message);
        res.status(500).json({ error: 'Failed to send OTP email. Check backend logs.' });
    }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) return res.status(400).json({ error: 'OTP expired or not requested' });
    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'OTP expired' });
    }
    if (storedData.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    otpStore.delete(email);

    try {
        if (!pool) throw new Error('Database not connected');

        // Check if user exists
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        let user = rows[0];

        if (!user) {
            const [result] = await pool.query('INSERT INTO users (email) VALUES (?)', [email]);
            user = { id: result.insertId, email: email };
            console.log('Created new user:', user.email);
        } else {
            console.log('User logged in:', user.email);
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', { expiresIn: '7d' });
        res.json({ message: 'Login successful', user, token, success: true });
    } catch (err) {
        console.error('DB Error in verify-otp:', err.message);
        res.status(500).json({ error: 'Database connection failed. Please try again later.' });
    }
});

// Update Profile
app.post('/api/profile', authenticateToken, async (req, res) => {
    const { email, full_name, mobile_number, age, profile_picture } = req.body;
    try {
        await pool.query(
            'UPDATE users SET full_name = ?, mobile_number = ?, age = ?, profile_picture = ? WHERE email = ?',
            [full_name, mobile_number, age, profile_picture, email]
        );
        res.json({ message: 'Profile updated successfully!', success: true });
    } catch (err) {
        console.error('Profile Update Error:', err.message);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get Children
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
            if (child.dob) child.dob = new Date(child.dob).toISOString().split('T')[0];
            
            child.completed = child.vaccines.filter(v => v.status === 'done').length;
            child.upcoming = child.vaccines.filter(v => v.status === 'upcoming').length;
            child.progress = child.vaccines.length > 0 ? Math.round((child.completed / child.vaccines.length) * 100) : 0;
        }
        res.json({ children, success: true });
    } catch (err) {
        console.error('Fetch Children Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch children' });
    }
});

// Add Child
app.post('/api/children', authenticateToken, async (req, res) => {
    const { name, dob, gender, bloodGroup, avatarUrl, vaccines } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO children (user_id, name, dob, gender, blood_group, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, name, dob, gender, bloodGroup, avatarUrl]
        );
        const childId = result.insertId;

        if (vaccines && vaccines.length > 0) {
            const values = vaccines.map(v => [
                childId, v.name, v.when, v.status,
                v.dueDate ? new Date(v.dueDate).toISOString().split('T')[0] : null
            ]);
            await pool.query('INSERT INTO vaccines (child_id, name, dose_when, status, due_date) VALUES ?', [values]);
        }
        res.json({ message: 'Child added successfully', childId, success: true });
    } catch (err) {
        console.error('Add Child Error:', err.message);
        res.status(500).json({ error: 'Failed to add child' });
    }
});

// Delete Child
app.delete('/api/children/:id', authenticateToken, async (req, res) => {
    const childId = req.params.id;
    try {
        const [result] = await pool.query('DELETE FROM children WHERE id = ? AND user_id = ?', [childId, req.user.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Child not found or unauthorized' });
        }
        
        res.json({ message: 'Child deleted successfully', success: true });
    } catch (err) {
        console.error('Delete Child Error:', err.message);
        res.status(500).json({ error: 'Failed to delete child' });
    }
});

// Update Vaccine
app.put('/api/vaccines/:id', authenticateToken, async (req, res) => {
    const vaccineId = req.params.id;
    const { status, dateAdministered, hospitalName, doctorName, notes, proofUrl } = req.body;
    try {
        if (status === 'done') {
            await pool.query(
                `UPDATE vaccines SET status = ?, administered_date = ?, hospital_name = ?, doctor_name = ?, notes = ?, proof_url = ? WHERE id = ?`,
                [status, dateAdministered || new Date().toISOString().split('T')[0], hospitalName, doctorName, notes, proofUrl, vaccineId]
            );
        } else {
            await pool.query('UPDATE vaccines SET status = ? WHERE id = ?', [status, vaccineId]);
        }
        res.json({ message: 'Vaccine updated successfully', success: true });
    } catch (err) {
        console.error('Update Vaccine Error:', err.message);
        res.status(500).json({ error: 'Failed to update vaccine' });
    }
});

// Get Public Child Info (for sharing)
app.get('/api/public/child/:id', async (req, res) => {
    try {
        const childId = req.params.id;
        const [rows] = await pool.query('SELECT name, dob, gender, blood_group, avatar_url FROM children WHERE id = ?', [childId]);
        const child = rows[0];

        if (!child) {
            return res.status(404).json({ error: 'Child record not found' });
        }

        const [vaccines] = await pool.query('SELECT name, dose_when, status, due_date, administered_date, hospital_name, doctor_name FROM vaccines WHERE child_id = ?', [childId]);
        
        child.vaccines = vaccines.map(v => ({
            name: v.name,
            when: v.dose_when,
            status: v.status,
            dueDate: v.due_date,
            dateAdministered: v.administered_date || '',
            hospitalName: v.hospital_name || '',
            doctorName: v.doctor_name || ''
        }));

        res.json({ child, success: true });
    } catch (err) {
        console.error('Public Fetch Child Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch public record' });
    }
});

// Send Card via Email
app.post('/api/send-card-email', async (req, res) => {
    const { email, childName, shareLink, pdfAttachment } = req.body;

    if (!email || !childName) {
        return res.status(400).json({ error: 'Email and child name are required' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Vaccination Record Certificate - ${childName}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="background-color: #0f172a; padding: 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Digital Vaccination Record</h1>
                    <p style="color: #94a3b8; margin-top: 8px;">Official Record for ${childName}</p>
                </div>
                <div style="padding: 32px; background-color: white;">
                    <p style="color: #475569; line-height: 1.6; font-size: 16px;">Hello,</p>
                    <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                        Attached is the digital vaccination certificate for <strong>${childName}</strong>. 
                        This record is issued by VaxiCare Global Health Services and is fully validated.
                    </p>
                    <div style="margin: 32px 0; text-align: center;">
                        <a href="${shareLink}" style="background-color: #ec5b13; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
                            View Live Digital Record
                        </a>
                    </div>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                        You can also download the attached professional PDF for your offline records or to share with pediatricians.
                    </p>
                </div>
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">VaxiCare © 2023 • Secure Health Record Management</p>
                </div>
            </div>
        `,
        attachments: pdfAttachment ? [
            {
                filename: `${childName.replace(/\s+/g, '_')}_Vaccination_Record.pdf`,
                content: pdfAttachment,
                encoding: 'base64'
            }
        ] : []
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Emailed vaccination card for ${childName} to ${email}`);
        res.json({ message: 'Email sent successfully', success: true });
    } catch (err) {
        console.error('Email Card Error:', err.message);
        res.status(500).json({ error: 'Failed to send email card', details: err.message });
    }
});

// Change Password Endpoint
app.post('/api/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userEmail = req.user.email;

    try {
        if (!pool) pool = await poolPromise;

        // 1. Get user from DB
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [userEmail]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = users[0];

        // 2. If user has a password, verify it
        if (user.password) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });
        }

        // 3. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update DB
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, userEmail]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change Password Error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change Email Endpoint
app.post('/api/change-email', authenticateToken, async (req, res) => {
    const { newEmail } = req.body;
    const userId = req.user.id;

    if (!newEmail || !newEmail.includes('@')) {
        return res.status(400).json({ error: 'Valid email address is required' });
    }

    try {
        if (!pool) pool = await poolPromise;

        // Check if email is already taken
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [newEmail]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email is already in use by another account' });
        }

        // Update DB
        await pool.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);

        res.json({ success: true, message: 'Email updated successfully' });
    } catch (err) {
        console.error('Change Email Error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Nearby Clinics API (Google Places Integration)
app.get('/api/nearby-clinics', async (req, res) => {
    let { lat, lng, radius = 5000, query } = req.query;
    const apiKey = process.env.GOOGLE_API_KEY;

    // If query is provided, geocode it first to get lat/lng
    if (query && (!lat || !lng)) {
        try {
            console.log(`Geocoding query: ${query}`);
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
            const geocodeRes = await axios.get(geocodeUrl, {
                headers: { 'User-Agent': 'VaxiCare-App' }
            });

            if (geocodeRes.data && geocodeRes.data.length > 0) {
                lat = geocodeRes.data[0].lat;
                lng = geocodeRes.data[0].lon;
                console.log(`Geocoded ${query} to ${lat}, ${lng}`);
            } else {
                return res.status(404).json({ error: 'Location not found' });
            }
        } catch (err) {
            console.error('Geocoding error:', err.message);
            return res.status(500).json({ error: 'Failed to find location' });
        }
    }

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(1);
    };

    // Fallback to OpenStreetMap (Overpass API) if Google API key is missing
    if (!apiKey || apiKey === 'YOUR_ACTUAL_GOOGLE_API_KEY_HERE') {
        console.log(`OSM Fallback: Searching real hospitals near ${lat}, ${lng}`);
        try {
            // Expanded Overpass API query: find all medical facilities within 10km
            const osmQuery = `[out:json];(node["amenity"~"hospital|clinic|doctors|medical_center"](around:10000,${lat},${lng});way["amenity"~"hospital|clinic|doctors|medical_center"](around:10000,${lat},${lng}););out center;`;
            const osmUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`;
            const osmResponse = await axios.get(osmUrl);
            
            const osmClinics = (osmResponse.data.elements || []).map(el => {
                const name = el.tags.name || 'Healthcare Facility';
                const type = el.tags.amenity === 'hospital' ? 'Hospital' : (el.tags.amenity === 'doctors' ? 'Doctor' : 'Clinic');
                const clinicLat = el.lat || el.center.lat;
                const clinicLng = el.lon || el.center.lon;
                
                return {
                    name: name,
                    address: el.tags['addr:full'] || el.tags['addr:street'] ? `${el.tags['addr:street'] || ''} ${el.tags['addr:housenumber'] || ''}` : 'Local area',
                    rating: 'Verified',
                    type: type,
                    distance: `${calculateDistance(lat, lng, clinicLat, clinicLng)} km`,
                    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + type)}`,
                    dirUrl: `https://www.google.com/maps/dir/?api=1&destination=${clinicLat},${clinicLng}`,
                    phone: el.tags.phone || el.tags['contact:phone'] || null
                };
            });

            if (osmClinics.length > 0) {
                console.log(`Found ${osmClinics.length} real healthcare facilities via OSM`);
                return res.json({ success: true, clinics: osmClinics });
            }
            
            throw new Error('No real facilities found in 10km radius');
        } catch (osmErr) {
            console.error('OSM Fetch failed:', osmErr.message);
            return res.status(404).json({ error: 'No real hospitals found nearby. Please try again later or add a Google API Key.', details: osmErr.message });
        }
    }

    try {
        // Use broad keywords to find all healthcare facilities
        const keyword = encodeURIComponent('hospital clinic doctor health center');
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${keyword}&key=${apiKey}`;
        const response = await axios.get(url);
        
        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google API Error: ${response.data.status}`);
        }

        const clinics = (response.data.results || []).map(place => {
            // Determine a user-friendly type
            let type = 'Clinic';
            if (place.types.includes('hospital')) type = 'Hospital';
            else if (place.types.includes('doctor')) type = 'Doctor';
            else if (place.types.includes('health')) type = 'Health Center';

            return {
                name: place.name,
                address: place.vicinity,
                rating: place.rating || 'N/A',
                type: type,
                distance: `${calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)} km`,
                mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`,
                dirUrl: `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}&destination_place_id=${place.place_id}`,
                phone: null 
            };
        });

        res.json({ success: true, clinics });
    } catch (err) {
        console.error('Nearby Clinics Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch nearby clinics', details: err.message });
    }
});

// Reminder Cron Job
cron.schedule('0 8 * * *', async () => {
    try {
        const [due] = await pool.query(`
            SELECT v.name as vaccine_name, v.due_date, c.name as child_name, u.email 
            FROM vaccines v JOIN children c ON v.child_id = c.id JOIN users u ON c.user_id = u.id
            WHERE v.status = 'upcoming' AND v.due_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        `);
        for (const r of due) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: r.email,
                subject: `VaxiCare Reminder: ${r.child_name}'s vaccination`,
                text: `Reminder for ${r.vaccine_name} on ${new Date(r.due_date).toLocaleDateString()}`
            });
        }
    } catch (err) {
        console.error('Cron Error:', err.message);
    }
});

// Force nodemon restart to load .env
