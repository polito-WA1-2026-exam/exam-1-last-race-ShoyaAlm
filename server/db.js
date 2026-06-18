import sqlite3Package from 'sqlite3';
const sqlite3 = sqlite3Package.verbose();

import bcrypt from 'bcrypt'

const db = new sqlite3.Database('./db/database.db', (err) => {
    if(err)
        console.error('Error opening database: ', err.message)
    else
        console.log('Connected to SQLite database...');
})

  db.serialize(async () => {
    
        db.run(`CREATE TABLE IF NOT EXISTS users
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        highestScore INTEGER DEFAULT 0
        )`);

    const users = [
        {username:'shoya', password:'12345', highestScore:'0'},
        {username:'josh', password:'12345', highestScore:'0'},
        {username:'fulvio', password:'12345', highestScore:'0'},
    ]


    db.get('SELECT COUNT(*) AS count FROM users', async (err, row) => {
        
        if(err){
            console.error("Error checking user count: ", err.message);
            return            
        }

        if(row.count > 0){
            console.log("Database already initialized with users");
            return
        }

        })



    const saltRounds = 10
    const stmt = db.prepare("INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)")

    for (const user of users){
        
        const hash = await bcrypt.hash(user.password, saltRounds)
        
        stmt.run(user.username, hash)
        
    }
    
    stmt.finalize()

    console.log('Database is created');
    
})

export default db
