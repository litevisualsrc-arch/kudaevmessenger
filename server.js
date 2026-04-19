const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Функция подключения с повторными попытками
function connectDB() {
  const db = mysql.createConnection({
    host: 'd6.aurorix.net',
    port: 3306,
    user: 'u66043_OQVrE5uL54',
    password: 'LO@wLQagtMTPPcT!pCY5+W0k',
    database: 's66043_wefdsxweds',
    connectTimeout: 10000
  });

  db.connect((err) => {
    if (err) {
      console.error('MySQL error:', err);
      setTimeout(connectDB, 5000);
    } else {
      console.log('✅ MySQL connected');
      createTables(db);
    }
  });

  db.on('error', (err) => {
    console.error('MySQL error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connectDB();
    }
  });

  return db;
}

function createTables(db) {
  db.query(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    password VARCHAR(100)
  )`);
}

let db = connectDB();

// API Routes
app.post('/api/register', (req, res) => {
  const { id, phone, name, password } = req.body;
  db.query('INSERT INTO users (id, phone, name, password) VALUES (?, ?, ?, ?)',
    [id, phone, name, password], (err) => {
    if (err) {
      console.log(err);
      res.json({ success: false, error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  db.query('SELECT * FROM users WHERE phone = ? AND password = ?',
    [phone, password], (err, results) => {
    if (err || results.length === 0) {
      res.json({ success: false });
    } else {
      res.json({ success: true, user: results[0] });
    }
  });
});

app.get('/api/users', (req, res) => {
  db.query('SELECT id, phone, name FROM users', (err, results) => {
    res.json(results || []);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 API on port ${PORT}`));
