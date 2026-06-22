import db from "../db.js"

const getGameDetails = (req, res) => {

    const gameDetails = {
        stations: [],
        metroSegments: [],
        events: {}
    }


    db.all("SELECT name FROM stations", [], (err, stationRows) => {
        if(err){
            console.error('Error while fetching stations: ', err.message);
            return res.status(500).json({success:false, error:err.message})
        }

        gameDetails.stations = stationRows.map(row => row.name)
        
        db.all("SELECT name, value FROM events", [], (err, eventRows) => {
            if(err){
                console.error('Error while fetching events: ', err.message);
                return res.status(500).json({success:false, error:err.message})
            }

            eventRows.forEach(row => {
                gameDetails.events[row.name] = row.value
            })

            const segmentsQuery = `

                SELECT s1.name AS from_station, s2.name AS to_station FROM segments
                JOIN stations s1 ON segments.from_station_id = s1.id
                JOIN stations s2 ON segments.to_station_id = s2.id
            `

            db.all(segmentsQuery, [], (err, segmentRows) => {
                if (err) {
                    console.error('Error fetching segments:', err.message);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                gameDetails.metroSegments = segmentRows.map(row => [
                    row.from_station, 
                    row.to_station
                ]);

                return res.status(200).json({ success: true, gameDetails: gameDetails });

            })


        })
    })

}


const submitRoute = (req, res) => {

    const {startStation, endStation, userSegments, user} = req.body

    let invalidRoute = false

    let currentSegmentStation = startStation;
    let visitedSegments = [];
    

    if(!userSegments || userSegments.length === 0){
      return res.status(200).json({
        success:true, valid:false, 
        message: 'You did not choose any route!',
        routeLogs: []
      })
    }
    
    if(userSegments[userSegments.length-1].to !== endStation){
      invalidRoute = true
    }

    if(!invalidRoute){
      
      for (let i = 0; i < userSegments.length; i++){
        
        if(userSegments[i].from !== currentSegmentStation && userSegments[i].to !== currentSegmentStation){
          invalidRoute = true
          break
        }
  
        const isVisited = visitedSegments.some(segment => 
          (segment.from === userSegments[i].from && segment.to === userSegments[i].to) 
          || (segment.to === userSegments[i].from && segment.from === userSegments[i].to))
  
        if(isVisited){
          invalidRoute = true
          break
        }
  
        visitedSegments.push(userSegments[i])
  
        if(userSegments[userSegments.length - 1].to !== endStation){
          invalidRoute = true;
          break
        }

        let nextStation
        
        if(userSegments[i].from === currentSegmentStation)
          nextStation = userSegments[i].to
        
        if(userSegments[i].to === currentSegmentStation)
          nextStation = userSegments[i].from
  
        
        currentSegmentStation = nextStation
  
      }

    }


    let initialCoins = 20
    

    if(invalidRoute === true){

      return res.status(200).json({success:true, valid:false, 
        message: 'Your route is invalid or incomplete',
        routeLogs: userSegments
    })
      
    } 

    let tempRoute = [] 

      db.all("SELECT name, value FROM events", [], (err, eventRows) => {
        if(err){
            console.log('Error fetching events for computation', err.message);
            return res.status(500).json({success:true, error:err.message})
        }

        const eventsMap = {}

        eventRows.forEach(row => {eventsMap[row.name] = row.value})


        const routeEvents = Object.keys(eventsMap)



      for(let i=0 ; i < userSegments.length ; i++){
        
        const randomNum = Math.floor(Math.random() * routeEvents.length);
      
        const currentEvent = routeEvents[randomNum]
        const coinNumber = eventsMap[currentEvent]

        initialCoins += coinNumber

        tempRoute.push({segment:`${userSegments[i].from} ➔ ${userSegments[i].to}`,
                        eventName: currentEvent,
                        effect: coinNumber,
                        currentCoins: initialCoins
        })
      
        
      }

      if(initialCoins < 0)
        initialCoins = 0
      
      
      if(initialCoins > user.highestScore){
        
        db.run("UPDATE users SET highestScore = ? WHERE id = ?", [initialCoins, user.id], () => {
          

          user.highestScore = initialCoins

          if(req.user){
            req.user.highestScore = initialCoins
          }

          console.log('updated user info: ', user);
          
          
          return res.status(200).json({
            success:true, valid: true,
            message:`Your route is valid! Plus a new record for ${user.username}!`,
            routeLogs: tempRoute, userScore: initialCoins, invalidRoute: invalidRoute,
            highestScore: initialCoins
          })
        
        })


      } else {
        console.log('final score: ', initialCoins);
        return res.status(200).json({success:true, valid:true, message: '🎉 Your route is valid!',
          routeLogs: tempRoute, userScore: initialCoins, invalidRoute: invalidRoute, 
          highestScore: user.highestScore
      })      

      }


      })


}

const getMap = (req, res) => {

  db.all("SELECT name, x, y FROM map_stations", [], (err, stationRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Failed fetching station coordinates" })
    }

    const stationCoordinates = {}
    stationRows.forEach(row => {
      stationCoordinates[row.name] = {x: row.x, y: row.y}
    })

    const lineQuery = `SELECT l.name AS line_name, l.color, ls.station_name
      FROM lines l JOIN line_stations ls ON l.id = ls.line_id
      ORDER BY l.id, ls.station_order
    `

    db.all(lineQuery, [], (err, lineRows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed fetching metro lines" });
      }

      const linesMap = {}

      lineRows.forEach(row => {
        if (!linesMap[row.line_name]) {

          linesMap[row.line_name] = {
            name: row.line_name,
            color: row.color,
            route: []
          }
        }

        linesMap[row.line_name].route.push(row.station_name)
      })

      const metroLines = Object.values(linesMap)
      
      return res.status(200).json({
        success: true,
        stationCoordinates: stationCoordinates,
        metroLines: metroLines
      })


    })


  })



}


export default {getGameDetails, submitRoute, getMap}