const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../notifications.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Notification DB error:', err.message);
  } else {
    console.log('Connected to Notification SQLite database.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )
`);

module.exports = db;