const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../appointments.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Appointment DB error:', err.message);
  } else {
    console.log('Connected to Appointment SQLite database.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    date TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

module.exports = db;