import pool from './db.js';

async function testPutDB() {
  try {
    // get user 1
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = 1');
    const user = userRows[0];
    
    // get child of user 1
    const [childRows] = await pool.query('SELECT id FROM children WHERE user_id = 1 LIMIT 1');
    const child = childRows[0];
    
    // get an upcoming vaccine
    const [vaccineRows] = await pool.query("SELECT id FROM vaccines WHERE child_id = ? AND status='upcoming' LIMIT 1", [child.id]);
    const vaccine = vaccineRows[0];
    
    console.log("Updating vaccine id:", vaccine.id);
    
    // update status
    await pool.query("UPDATE vaccines SET status='done' WHERE id=?", [vaccine.id]);
    console.log("Updated DB directly");
    
    // fetch back
    const [vCheck] = await pool.query("SELECT status FROM vaccines WHERE id=?", [vaccine.id]);
    console.log("New status:", vCheck[0].status);
    
  } catch(e) { console.error(e); }
  process.exit(0);
}
testPutDB();
