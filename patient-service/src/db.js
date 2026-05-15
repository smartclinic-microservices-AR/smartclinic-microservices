const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../patients.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Patient DB error:', err.message);
  } else {
    console.log('Connected to Patient SQLite database.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    birth_date TEXT,
    created_at TEXT NOT NULL
  )
`);

module.exports = db;