const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'd6.aurorix.net',
  port: 3306,
  user: 'u66043_OQVrE5uL54',
  password: 'LO@wLQagtMTPPcT!pCY5+W0k',
  database: 's66043_wefdsxweds'
});

db.connect((err) => {
  if (err) console.error('MySQL error:', err);
  else console.log('✅ MySQL connected');
});

// Создание таблиц по отдельности
const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS group_members (
    group_id VARCHAR(50),
    user_id VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    group_id VARCHAR(50),
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    text TEXT,
    time VARCHAR(20),
    timestamp BIGINT
  )`
];

tables.forEach(query => {
  db.query(query, (err) => {
    if (err) console.error('Table error:', err.message);
    else console.log('✅ Table ready');
  });
});

// API Routes
app.post('/api/register', (req, res) => {
  const { id, phone, name, password } = req.body;
  db.query('INSERT INTO users (id, phone, name, password) VALUES (?, ?, ?, ?)',
    [id, phone, name, password], (err) => {
    if (err) res.json({ success: false, error: err.message });
    else res.json({ success: true });
  });
});

app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  db.query('SELECT * FROM users WHERE phone = ? AND password = ?',
    [phone, password], (err, results) => {
    if (err || results.length === 0) res.json({ success: false });
    else res.json({ success: true, user: results[0] });
  });
});

app.get('/api/users', (req, res) => {
  db.query('SELECT id, phone, name FROM users', (err, results) => {
    res.json(results || []);
  });
});

app.post('/api/groups', (req, res) => {
  const { id, name, created_by, members } = req.body;
  db.query('INSERT INTO groups (id, name, created_by) VALUES (?, ?, ?)',
    [id, name, created_by], (err) => {
    if (err) { res.json({ success: false, error: err.message }); return; }
    const values = members.map(m => [id, m.id]);
    if (values.length) {
      db.query('INSERT INTO group_members (group_id, user_id) VALUES ?', [values]);
    }
    res.json({ success: true });
  });
});

app.get('/api/groups/:userId', (req, res) => {
  db.query(`
    SELECT g.* FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
  `, [req.params.userId], (err, results) => {
    res.json(results || []);
  });
});

app.get('/api/messages/:groupId', (req, res) => {
  db.query('SELECT * FROM messages WHERE group_id = ? ORDER BY timestamp ASC',
    [req.params.groupId], (err, results) => {
    res.json(results || []);
  });
});

app.post('/api/messages', (req, res) => {
  const { id, group_id, user_id, user_name, text, time, timestamp } = req.body;
  db.query(`INSERT INTO messages (id, group_id, user_id, user_name, text, time, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, group_id, user_id, user_name, text, time, timestamp], (err) => {
    res.json({ success: !err, error: err?.message });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  console.log(`📍 MySQL: d6.aurorix.net:3306`);
});
