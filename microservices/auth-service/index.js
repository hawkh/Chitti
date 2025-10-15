const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect();

const JWT_SECRET = process.env.JWT_SECRET || 'chitti-secret-key-2024';

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (!result.rows[0]) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, result.rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role }, JWT_SECRET, { expiresIn: '24h' });
    await redisClient.setEx(`session:${result.rows[0].id}`, 86400, token);
    
    res.json({ token, user: { id: result.rows[0].id, email: result.rows[0].email, name: result.rows[0].name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const cached = await redisClient.get(`session:${decoded.id}`);
    if (!cached) return res.status(401).json({ error: 'Session expired' });
    
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/logout', async (req, res