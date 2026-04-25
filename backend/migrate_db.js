import poolPromise from './db.js';

async function migrate() {
  try {
    const pool = await poolPromise;
    console.log('Starting full database initialization...');

    // 1. Create Users Table
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
    console.log('✓ Users table ready');

    // 2. Create Children Table
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
    console.log('✓ Children table ready');

    // 3. Create Vaccines Table
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
    console.log('✓ Vaccines table ready');

    // 4. Migration: Add columns one by one (handling existing columns)
    const columnsToUpdate = [
        { table: 'vaccines', column: 'hospital_name', type: 'VARCHAR(255)' },
        { table: 'vaccines', column: 'doctor_name', type: 'VARCHAR(255)' },
        { table: 'vaccines', column: 'notes', type: 'TEXT' },
        { table: 'vaccines', column: 'proof_url', type: 'TEXT' },
        { table: 'vaccines', column: 'administered_date', type: 'DATE' }
    ];

    for (const item of columnsToUpdate) {
        try {
            // We use a simple ADD query. If it fails because column exists, we ignore it.
            await pool.query(`ALTER TABLE ${item.table} ADD COLUMN ${item.column} ${item.type}`);
            console.log(`✓ Added column ${item.column} to ${item.table}`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate column name')) {
                // Column already exists, that's fine
            } else {
                console.warn(`! Note: Could not add ${item.column}: ${e.message}`);
            }
        }
    }

    console.log('\n🚀 Database setup and migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
