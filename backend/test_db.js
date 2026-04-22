import pool from './db.js';
import fs from 'fs';

async function test() {
  try {
    const [children] = await pool.query('SELECT * FROM children');
    const [vaccines] = await pool.query('SELECT * FROM vaccines LIMIT 5');
    const out = JSON.stringify({ children, vaccines }, null, 2);
    fs.writeFileSync('test_output.json', out);
    console.log('done');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
test();
