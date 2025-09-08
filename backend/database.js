const sqlite3 = require('sqlite3').verbose() // 👈 OBLIGATOIRE
const db = new sqlite3.Database('./chat.db') // 👈 CRÉATION DE LA CONNEXION

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      user_id TEXT,
      role TEXT,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

module.exports = db
