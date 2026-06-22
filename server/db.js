import sqlite3Package from 'sqlite3';
const sqlite3 = sqlite3Package.verbose();

import bcrypt from 'bcrypt'

const db = new sqlite3.Database('./db/database.db', (err) => {
    if(err)
        console.error('Error opening database: ', err.message)
    else
        console.log('Connected to SQLite database...');
})


const MAP_STATIONS = [
  { name: "Harlem", x: 50, y: 100 }, { name: "Addison", x: 180, y: 100 },
  { name: "Damen", x: 310, y: 100 }, { name: "Wells", x: 490, y: 100 },
  { name: "Clark", x: 670, y: 100 }, { name: "Lawrence", x: 820, y: 100 },
  { name: "Kimball", x: 310, y: 20 }, { name: "Central", x: 310, y: 60 },
  { name: "Quincy", x: 310, y: 250 }, { name: "Jackson", x: 310, y: 400 },
  { name: "Monroe", x: 245, y: 290 }, { name: "Roosevelt", x: 310, y: 460 },
  { name: "Belmon", x: 610, y: 20 }, { name: "Division", x: 550, y: 60 },
  { name: "Morgan", x: 180, y: 330 }, { name: "Harrison", x: 100, y: 380 },
  { name: "Washington", x: 820, y: 250 }, { name: "Grand", x: 745, y: 175 },
  { name: "Adams", x: 180, y: 400 }, { name: "Howard", x: 100, y: 400 }
];

const METRO_LINES = [
  { name: "Red Line", color: "#E10600", route: ["Harlem", "Addison", "Damen", "Wells", "Clark", "Lawrence"] },
  { name: "Green Line", color: "#009639", 
    route: ["Kimball", "Central", "Damen", "Quincy", "Jackson", "Roosevelt"] },
  { name: "Blue Line", color: "#00A1DE", 
    route: ["Belmon", "Division", "Wells", "Quincy", "Monroe", "Morgan", "Harrison"] },
  { name: "Yellow Line", color: "#F9E300", 
    route: ["Washington", "Grand", "Clark", "Jackson", "Adams", "Howard"] }
];


  const stations = ["Harlem", "Addison", "Belmon", "Division", "Damen", "Lawrence", "Clark", 
    "Monroe", "Quincy", "Jackson", "Adams", "Howard", "Morgan", "Central", "Kimball", "Roosevelt", 
    "Harrison", "Washington", "Grand", "Wells"]

  const metroSegments = [ ['Harlem', 'Addison'], ['Addison', 'Damen'], ['Damen', 'Wells'], 
                ['Wells', 'Clark'], ['Clark', 'Lawrence'],
                ['Roosevelt','Jackson'], ['Jackson','Quincy'], ['Quincy','Damen'], ['Damen','Central'], 
                ['Central','Kimball'], 
                ['Harrison', 'Morgan'], ['Morgan', 'Monroe'], ['Monroe', 'Quincy'], ['Quincy', 'Wells'], 
                ['Wells','Division'], ['Division','Belmon'], 
                ['Howard', 'Adams'], ['Adams', 'Jackson'], ['Jackson', 'Clark'], ['Clark', 'Grand'], 
                ['Grand', 'Washington']]



  const events = {'trainNotArrivedInTime':-4, 'lostTicket':-3, 'trainDelay':-2, 'spareCoin':-1, 
                'normalTrip':0, 'foundCoin':1 ,'earlyTrainArrival':2, 'helpfulPassenger': 3, 'expressTrain': 4}
            

  const users = [
        {username:'shoya', password:'12345', highestScore:'0'},
        {username:'josh', password:'12345', highestScore:'0'},
        {username:'fulvio', password:'12345', highestScore:'0'},
    ]


  db.serialize(async () => {
    
        db.run(`CREATE TABLE IF NOT EXISTS users
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        highestScore INTEGER DEFAULT 0
        )`)


        db.run(`CREATE TABLE IF NOT EXISTS stations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
            )`)

        
        db.run(`CREATE TABLE IF NOT EXISTS segments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_station_id INTEGER NOT NULL,
            to_station_id INTEGER NOT NULL,
            FOREIGN KEY (from_station_id) REFERENCES stations(id),
            FOREIGN KEY (to_station_id) REFERENCES stations(id)
            )`)



        db.run(`CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                value INTEGER NOT NULL
                )`)



        db.run(`CREATE TABLE IF NOT EXISTS lines 
            (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            color TEXT NOT NULL
            )`)

        db.run(`CREATE TABLE IF NOT EXISTS map_stations 
            (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            x INTEGER NOT NULL,
            y INTEGER NOT NULL
            )`)

        db.run(`CREATE TABLE IF NOT EXISTS line_stations 
            (
            line_id INTEGER,
            station_name TEXT,
            station_order INTEGER,
            FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE,
            FOREIGN KEY (station_name) REFERENCES stations(name) ON DELETE CASCADE
            )`, [], (err) => {
                if (!err){
                    console.log('Database tables are ready');

                }
            })

        
    db.serialize(() => {
        
        const stmtStation = db.prepare(`INSERT OR IGNORE INTO map_stations (name, x, y) VALUES (?, ?, ?)`);
        
        MAP_STATIONS.forEach(station => {
            stmtStation.run(station.name, station.x, station.y)
        })

        stmtStation.finalize()
        console.log("Map stations created successfully.");

        METRO_LINES.forEach(line => {

        db.run(`INSERT OR IGNORE INTO lines (name, color) VALUES (?, ?)`, [line.name, line.color], function(err) {
        if (err){
            return console.error(err.message);
        } 

        const lineName = line.name

        db.get(`SELECT id FROM lines WHERE name = ?`, [lineName], (err, row) => {
          if (err || !row) 
            return

          const lineId = row.id

          db.run(`DELETE FROM line_stations WHERE line_id = ?`, [lineId], () => {
            
            const stmtLineStation = db.prepare(`
              INSERT INTO line_stations (line_id, station_name, station_order) 
              VALUES (?, ?, ?)
            `)

            line.route.forEach((stationName, index) => {
              stmtLineStation.run(lineId, stationName, index);
            })

            stmtLineStation.finalize()
          })
        })
      })
    })
    console.log("Metro lines and routes have successfully been made.");
  });




        db.get("SELECT COUNT(*) AS count FROM stations", (err, row) => {
            if(row && row.count === 0){
        

            const stmt = db.prepare("INSERT INTO stations (name) VALUES (?)")
            stations.forEach(name => stmt.run(name))
            
            
            stmt.finalize(() => {
                    console.log('stations written');

              


                db.all("SELECT id, name FROM stations", (err, rows) => {
                    const stationMap = {}
                    rows.forEach(row => {stationMap[row.name] = row.id})

                    const stmt = db.prepare("INSERT INTO segments (from_station_id, to_station_id) VALUES (?, ?)")
                    metroSegments.forEach(([fromName, toName]) => {
                        stmt.run(stationMap[fromName], stationMap[toName])
                    })
                    stmt.finalize()
                })
                    
                })


            }
        })


        
        db.get("SELECT COUNT(*) AS count FROM events", (err, row) => {

            if(err)
                return console.error(err.message);
                
            if(row && row.count === 0){
            
                const stmt = db.prepare("INSERT INTO events (name, value) VALUES (?, ?)")
                Object.entries(events).forEach(([name, value]) => stmt.run(name, value))
                stmt.finalize()
            }

        })

        





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
