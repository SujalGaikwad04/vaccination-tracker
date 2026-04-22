import pool from './db.js';

async function testPut() {
  try {
    // get user 1
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = 1');
    const user = userRows[0];
    
    // get child of user 1
    const [childRows] = await pool.query('SELECT * FROM children WHERE user_id = 1 LIMIT 1');
    const child = childRows[0];
    
    // get vaccine of child
    const [vaccineRows] = await pool.query('SELECT * FROM vaccines WHERE child_id = ? LIMIT 1', [child.id]);
    const vaccine = vaccineRows[0];
    
    console.log('User:', user.email);
    console.log('Child:', child.name);
    console.log('Vaccine to update:', vaccine.id);

    // Call the same function logic as API endpoint
    const vaccineCheck = await pool.query(`
        SELECT v.id FROM vaccines v
        JOIN children c ON v.child_id = c.id
        WHERE v.id = ? AND c.user_id = ?
    `, [vaccine.id, user.id]);
    
    console.log('Vaccine Check Result:', vaccineCheck[0]);
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
testPut();
