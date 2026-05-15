const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../doctors.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Doctor DB error:', err.message);
  } else {
    console.log('Connected to Doctor SQLite database.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

module.exports = db;