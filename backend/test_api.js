import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 1, email: 'some@example.com' }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', { expiresIn: '7d' });

async function doTest() {
  console.log("Token:", token);
  try {
    const response = await fetch('http://localhost:5000/api/vaccines/131', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'done', dateAdministered: '2026-03-13' })
    });
    const text = await response.text();
    console.log("Status:", response.status, text);
  } catch (err) {
    console.error(err);
  }
}

doTest();
