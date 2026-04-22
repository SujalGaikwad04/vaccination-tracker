import pool from './db.js';

async function migrate() {
  try {
    await pool.query('ALTER TABLE vaccines ADD COLUMN hospital_name VARCHAR(255)');
    console.log('Added hospital_name');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE vaccines ADD COLUMN doctor_name VARCHAR(255)');
    console.log('Added doctor_name');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE vaccines ADD COLUMN notes TEXT');
    console.log('Added notes');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE vaccines ADD COLUMN proof_url LONGTEXT');
    console.log('Added proof_url');
  } catch (e) { console.log(e.message); }

  try {
    await pool.query('ALTER TABLE vaccines ADD COLUMN administered_date DATE');
    console.log('Added administered_date');
  } catch (e) { console.log(e.message); }

  process.exit(0);
}

migrate();
