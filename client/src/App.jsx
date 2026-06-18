import { useEffect, useState } from 'react'
import './css/App.css'
import MetroMap from './metro'
import Login from './login'
import Scoreboard from './Scoreboard'

  const stations = ["Harlem", "Addison", "Belmon", "Division", "Damen", "Lawrence", "Clark", 
    "Monroe", "Quincy", "Jackson", "Adams", "Howard", "Morgan", "Central", "Kimball", "Roosevelt", 
    "Harrison", "Washington", "Grand", "Wells"]


  const metroStationsSegments = [
  ['Harlem', 'Addison'], ['Addison', 'Damen'], ['Damen', 'Wells'], ['Wells', 'Clark'], ['Clark', 'Lawrence'],
  ['Roosevelt','Jackson'], ['Jackson','Quincy'], ['Quincy','Damen'], ['Damen','Central'], ['Central','Kimball'], 
  ['Harrison', 'Morgan'], ['Morgan', 'Monroe'], ['Monroe', 'Quincy'], ['Quincy', 'Wells'], ['Wells','Division'], 
  ['Division','Belmon'],
  ['Howard', 'Adams'], ['Adams', 'Jackson'], ['Jackson', 'Clark'], ['Clark', 'Grand'], ['Grand', 'Washington']]


function calculateDistance (firstStation, lastStation) {
  
  console.log('firstStation: ', firstStation);
  console.log('lastStation: ', lastStation);
  
  if(firstStation === lastStation)
    return 0;
  
  // calculate the distance to make sure there's at least 3 segments invovled  
  var distance

  const neighborStations = metroStationsSegments.filter(metroStation => metroStation[0] == firstStation 
    || metroStation[1] == firstStation)
  
  
    console.log('neighborStations: ', neighborStations);


  neighborStations.map((station) => {
    if(station[0] == firstStation && station[1] == lastStation)
        {
          console.log('They are neighbors!');
          distance = 1;
      }

    else if(station[1] == firstStation && station[0] == lastStation)
      {
        console.log('They are neighbors!');
        distance = 1;
      }
      
  })

  if(distance === 1)
    return 1


  // over here, I to try to scan the neighbors of the firstStation's neighbors itself
      // for each neighbor, we check their neighbors now
      
      var currentStations = []
      
      neighborStations.map(neighborStation => {
        

        if(neighborStation[0] !== firstStation)
          currentStations = [...currentStations, neighborStation[0]] 
        else
          currentStations = [...currentStations, neighborStation[1]]
      })

      console.log(firstStation,`'s neighbors: `, currentStations);
            

      
      currentStations.map(currentStation => {

        metroStationsSegments.map(segment => {
          if((segment[0] == currentStation && segment[1] == lastStation) 
            || (segment[1] == currentStation && segment[0] == lastStation)){
              console.log('the segment of the neighbor: ', segment);
              console.log('they have only 2 distances between them!');
              distance = 2
            }
        })

      })

    if (distance === 2)
      return 2
    
    else
      return 3

}


function assignRoute () {
  
  let firstStation
  let lastStation
  
  let validPair = false;
  
  while(!validPair){
    
    let firstStationNum = Math.floor(Math.random() * 20);
    let lastStationNum = Math.floor(Math.random() * 20);


    if(firstStationNum !== lastStationNum){
      
      firstStation = stations[firstStationNum]
      lastStation = stations[lastStationNum]
    
      const distance = calculateDistance(firstStation, lastStation) 
        if(distance >= 3){
          console.log('the distance: ', distance);
          validPair = true;
        } else{
          console.log('the distance: ', distance);
        }


    }

  }

  console.log('we have a winner');
  
  return [firstStation, lastStation]
  
}
 




function App() {
  
  const [user, setUser] = useState(null)
  const [currentScreen, setCurrentScreen] = useState('login')
  
  const [userSegments, setUserSegments] = useState([])

  const events = {'trainNotArrivedInTime':-4, 'lostTicket':-3, 'trainDelay':-2, 'spareCoin':-1, 'normalTrip':0, 
                  'foundCoin':1 ,'earlyTrainArrival':2, 'helpfulPassenger': 3, 'expressTrain': 4}

  const [usedSegments, setUsedSegments] = useState([])


  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');
  
  const [gamePhase, setGamePhase] = useState('setup'); 

  
  const [currentStation, setCurrentStation] = useState('')

  const [showFinalResult, setShowFinalResult] = useState(false)
  
  const [timeLeft, setTimeLeft] = useState(50)

    useEffect(() => {
      console.log('1 sec...');
      
      if(gamePhase !== 'planning')
        return
      
      if(timeLeft === 0){
          setGamePhase('execution')
          validateRoute()
          return
      }


    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1)
    }, 1000)


    return () => clearInterval(timer)

    }, [timeLeft, gamePhase])


  function startGame () {
    const targetRoute = assignRoute();
    setStartStation(targetRoute[0])
    setCurrentStation(targetRoute[0])
    setEndStation(targetRoute[1])
    setUserSegments([])
    setTimeLeft(50)
    setGamePhase('planning')
  }


  function resetGame () {
    setStartStation('')
    setEndStation('')
    setCurrentStation('')
    setGamePhase('setup')
    setUserSegments([])
    setUsedSegments([])
    setRouteLogs([])
    setShowFinalResult(false)
  }


  function validateRoute () {

    let currentSegmentStation = startStation
    let nextStation = ""
    let invalidRoute = false
    
    if(userSegments.length === 0)
      invalidRoute = true

    console.log('userSegments:', userSegments);
    
    let visitedSegments = []


    if(!invalidRoute){
      
      for (let i = 0; i < userSegments.length; i++){
        console.log('next station: ', nextStation);
        
      
        
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
  
        
         if(userSegments[i].from === currentSegmentStation)
          nextStation = userSegments[i].to
        
         if(userSegments[i].to === currentSegmentStation)
          nextStation = userSegments[i].from
  
         currentSegmentStation = nextStation
        
  
        if(userSegments[userSegments.length - 1].to !== endStation){
          invalidRoute = true;
          break
        }
  
      }

    }

    if(invalidRoute === true){
      alert('You failed!')
      alert('Coins: 0')
      resetGame()
    } else{
      setGamePhase('execution')
      routeCost()
      console.log('chosen route is valid!');
    }


    return invalidRoute;

  }

  const [routeLogs, setRouteLogs] = useState([])
  
  console.log(user);
 
  function routeCost () {
      
      let initialCoins = 20;

      const routeEvents = Object.keys(events)

      let tempRoute = [] 

      for(let i=0 ; i < userSegments.length ; i++){
        
        const randomNum = Math.floor(Math.random() * routeEvents.length);
      
        const currentEvent = routeEvents[randomNum]
        const coinNumber = events[currentEvent]

        initialCoins += coinNumber

        tempRoute.push({segment:`${userSegments[i].from} ➔ ${userSegments[i].to}`,
                        eventName: currentEvent,
                        effect: coinNumber,
                        currentCoins: initialCoins
        })
      
        
      }

      setRouteLogs(tempRoute)

      
      if(initialCoins > user.highestScore){
        
        fetch('/api/updateScore', {
          method:'PUT',
          headers:{'Content-Type': 'application/json'},
          credentials: 'include',
          body: JSON.stringify({newScore: initialCoins})        
        })
        .then(res => res.json())
        .then(data => {
          if(data.success){
            setUser(prev => ({...prev, highestScore:initialCoins}))
            console.log(`user's highest score updated to ${initialCoins}`);
          } else {
            console.log('failed to update score: ', data.message);
          }
        })
        .catch(err => console.error('Network error updating score: ', err))


      }

      setShowFinalResult(true)
      console.log(routeLogs);
      console.log('final score: ', initialCoins);
      
  }

  // console.log(user);
  

  function handleLogout () {
    fetch('/api/logout', {method:'POST'})
    .then(() => {
      setUser(null)
      setCurrentScreen('login')
      // setGamePhase('menu')
    })
  }

  return (

    <>
    {(currentScreen === 'login' || user === null) && (
      <Login loginSuccess={(loggedInUser) => {
        setUser(loggedInUser)
        setCurrentScreen('game')
      }}/>
    )}

    {currentScreen === 'game' && user !== null && (
      <>
        <h5>Hello {user.username}</h5>
        <div className="app-container">
          <h1>Last Race Metro Game</h1>
          <button onClick={handleLogout}>Logout</button>
          {gamePhase === 'planning' && (
            <>
              <div className={`timer-banner ${timeLeft <= 10 && gamePhase === 'planning' ? 'timer-urgent' : ''}`}>
                <h2>
                  {gamePhase === 'setup' ? '⏳ Selecting Random Stations...' : '🛤️ Build Your Route!'}
                </h2>
                <div className="timer-badge">
                  <span className="clock-icon">⏱️</span> {timeLeft} seconds left
                </div>
              </div>        
            </>
          )}

          {gamePhase === 'setup' && (
            <button className="btn-start" onClick={startGame}>
              I'm Ready to Play!
            </button>
          )}

          {gamePhase === 'planning' && (
            <div className="objective-board">
              <h2>Your Mission:</h2>
              <p>Depart from: <strong>{startStation}</strong></p>
              <p>Arrive at: <strong>{endStation}</strong></p>
              <button className="btn-start" onClick={resetGame}>
                Let's reset the game
            </button>
            <br/>
            <button className="btn-finish" onClick={validateRoute}>
              Submit Route
            </button>
            
            </div>
          )}

            <MetroMap phase={gamePhase} />

          {gamePhase === 'execution' && (
            <>
          
            {showFinalResult && (
          <div>
            
            <div className="execution-header-block">
              <h3 className="success-message">🎉 Your route was valid!</h3>
              <button className="btn-restart" onClick={resetGame}>
                Restart the Game
              </button>
            </div>

            <div className='show-final-result'>
              {routeLogs.map((route, index) => {
                return (
                  <div key={index} className='log-card'>
                    <h3>{route.segment}</h3>
                    <h4>Event: {route.eventName} ({route.effect >= 0 ? `+${route.effect}` : route.effect} 🪙)</h4>
                    <h5>Balance: {route.currentCoins} 🪙</h5>
                  </div>
                )
              })}
            </div>

          </div>
        )}

          </>)}

          {gamePhase === 'planning' && (<>
          
            <div className='user-segments-empty'>

              {userSegments.length === 0 && (
                
                  <div>Start from somewhere!</div>
                
                )}
              
              {userSegments.length !== 0 && (
                  <div className="route-chain-container">
                    {userSegments.map((userSegment, index) => {
                      return (
                        <div key={index} className="selected-segment-badge">
                          <h4>{userSegment.from} ➔ {userSegment.to}</h4>
                        </div>
                      );
                    })}
                  </div>
              )}

            </div>

            <div className='segments-list'>

              <div className='single-segment'>
                {gamePhase === 'planning' && metroStationsSegments.map((segment, index) => {

                  const [stationA, stationB] = segment

                  return (
                    <div key={index} className={'segment-badge'} 
                    
                    onClick={() => {


                          let segmentDirection = {from:"", to:""}
                          
                          if(stationA === currentStation){
                          
                            segmentDirection = {from:currentStation, to:stationB}
                            setCurrentStation(stationB)
                          
                          } else if(stationB === currentStation){
                            
                            segmentDirection = {from:currentStation, to:stationA}
                            setCurrentStation(stationA)
                          
                          } else {
                            segmentDirection = {from:stationA, to:stationB}
                          }

                          setUsedSegments([...usedSegments, segment])
                          setUserSegments([...userSegments, segmentDirection])
                      
                    }
              }>
                    
                    
                      <div>
                          {segment[0]} ↔ {segment[1]}
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            
            </div>
          </>)}


        </div>
      
      </>
    )}


    {currentScreen === 'scoreboard' && (
      <>  </>
    )}

    </>
  );
}

export default App
