import poolPromise from './db.js';

async function migrate() {
  try {
    const pool = await poolPromise;
    
    const queries = [
        'ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255)',
        'ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255)',
        'ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS notes TEXT',
        'ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS proof_url LONGTEXT',
        'ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS administered_date DATE'
    ];

    for (const query of queries) {
        try {
            await pool.query(query);
            console.log(`Executed: ${query.split('ADD COLUMN')[1].trim()}`);
        } catch (e) {
            // Standard MySQL might not support ADD COLUMN IF NOT EXISTS in older versions
            // but we ignore errors if column already exists
            if (!e.message.includes('Duplicate column name')) {
                console.log(`Error: ${e.message}`);
            }
        }
    }

    console.log('Migration check complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
