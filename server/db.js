const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt')

const db = new sqlite3.Database()

  db.serialize(async () => {
    
        db.run(`CREATE TABLE IF NOT EXISTS users
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT
        )`);

    const userPassword = '12345'
    
    const saltRounds = 10
    const hash = await bcrypt.hash(userPassword, saltRounds)
    
    const stmt = db.prepare("INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)")
    stmt.run('metro_player', hash)
    stmt.finalize()

    console.log('database is created');
    

})

module.exports = db;
