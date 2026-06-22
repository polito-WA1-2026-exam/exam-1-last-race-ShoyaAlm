import { useEffect, useState } from 'react'
import './css/App.css'
import MetroMap from './metro'
import Login from './login'
import Scoreboard from './Scoreboard'


  let stations = []
  let metroSegments = []
  let events = {}


function calculateDistance (firstStation, lastStation) {
  
  console.log('firstStation: ', firstStation);
  console.log('lastStation: ', lastStation);
  
  if(!metroSegments || metroSegments.length === 0)
    return 3;
  
  if(firstStation === lastStation)
    return 0;

  
  var distance

  const neighborStations = metroSegments.filter(metroStation => metroStation[0] == firstStation 
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


      var currentStations = []
      
      neighborStations.map(neighborStation => {
        

        if(neighborStation[0] !== firstStation)
          currentStations = [...currentStations, neighborStation[0]] 
        else
          currentStations = [...currentStations, neighborStation[1]]
      })

      console.log(firstStation,`'s neighbors: `, currentStations);
            

      
      currentStations.map(currentStation => {

        metroSegments.map(segment => {
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
  
  const [stationCoordinates, setStationCoordinates] = useState(null)
  const [metroLines, setMetroLines] = useState(null);


  const [userSegments, setUserSegments] = useState([])


  const [usedSegments, setUsedSegments] = useState([])


  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');
  
  const [gamePhase, setGamePhase] = useState('setup'); 

  
  const [currentStation, setCurrentStation] = useState('')

  const [showFinalResult, setShowFinalResult] = useState(false)
  
  const [timeLeft, setTimeLeft] = useState(50)


  const [routeLogs, setRouteLogs] = useState([])

  const [loadingGame, setLoadingGame] = useState(true)

  const [invalidRoute, setInvalidRoute] = useState(false)

  const [userScore, setUserScore] = useState(0)

  const [visibleLogs, setVisibleLogs] = useState([])



  useEffect(() => {
    fetch('/api/map-layout')
    .then(res => res.json())
    .then(data => {
      if(data.success){
        setStationCoordinates(data.stationCoordinates)
        setMetroLines(data.metroLines)
      } else {
        console.error("Failed to load map data: ", data.message);
      }
    }).catch(err => console.error('Network error fetching the map: ', err))
  }, [])

  useEffect(() => {
      fetch('/api/user', {
        method:'GET',
        credentials:'include'
      })
      .then(res => res.json())
      .then(data => {
        if(data.isAuthenticated === true){
          setUser(data.user)
          setCurrentScreen('game')
          console.log('Hello ', data.user.username);
        }
      }).catch(err => console.error('Authentication error'))

    }, [])

  useEffect(() => {

    fetch('/api/game-details')
    .then(res => res.json())
    .then(data => {
      if(data.success){
        stations = data.gameDetails.stations
        metroSegments = data.gameDetails.metroSegments
        events = data.gameDetails.events
        setLoadingGame(false)
      }
    }).catch(err => console.error("Error loading the game details: ", err))

  }, [])




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


    useEffect(() => {

      const logsLength = routeLogs ? routeLogs.length : 0
      if(gamePhase !== 'execution' || logsLength === 0){
        setVisibleLogs([])
        return
      }

      let currentIndex = 0

      const playbackInterval = setInterval(() => {
        if(currentIndex < routeLogs.length){
          let nextLog = routeLogs[currentIndex]
          
          if(nextLog){
            setVisibleLogs((prev) => [...prev, nextLog])
          }
          
          currentIndex++

        } else {
          clearInterval(playbackInterval)
        }
      }, 2000)

      return () => clearInterval(playbackInterval)

    }, [routeLogs, gamePhase])

  function startGame () {
    console.log('stations: ', stations);
    console.log('metroSegments: ', metroSegments);
    console.log('events: ', events);
    
    
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
    setUserScore(0)
    setInvalidRoute(false)
    setShowFinalResult(false)
  }



  function validateRoute () {

    setGamePhase('execution')

    fetch('/api/submit-route', {
      method:'POST',
      headers:{'Content-Type': 'application/json'},
      credentials:'include',
      body: JSON.stringify({
        startStation:startStation,
        endStation:endStation,
        userSegments:userSegments,
        user: user
      })
    }).then(res => res.json())
    .then(data => {
      if(data.success){

        setRouteLogs(data.routeLogs)
        setInvalidRoute(!data.valid)
        setUserScore(data.userScore)
        console.log('data: ', data);
        

        setShowFinalResult(true)

        if(data.valid){
          setUser(prev => ({
            ...prev, highestScore: data.highestScore
          }))
          console.log(data.message, 'final score: ', data.userScore);
         
        } else {
          console.log('Route verification failed: ', data.message);
        }

      } else {
        console.error('Server encountered some errors', data.message);
      }
    }).catch(err => console.error('Network transport error submitting transit map layout: ', err))

  }

   
  const [allScores, setAllScores] = useState('')


  

  function handleLogout () {
    
    resetGame()

    fetch('/api/logout', {method:'POST'})
    .then(() => {
      setUser(null)
      setCurrentScreen('login')
    })
  }

  function showScores () {
    
    setCurrentScreen('scoreboard')

    fetch('/api/scores')
    .then(res => res.json())
    .then(data => {
      if(data.success){
        console.log(data);
        
        setAllScores(data.scores)
      }
    })
  }
  

  return (

    <>
    {currentScreen === 'login' && user === null && (
      <Login loginSuccess={(loggedInUser) => {
        setUser(loggedInUser)
        setCurrentScreen('game')
      }} changeCurrentScreen={setCurrentScreen}/>
    )}

    {loadingGame && (
      <>
      <div style={{ padding: '40px', textAlign: 'center' }}>Loading Metro Network Maps...</div>
      </>
    )}

    {currentScreen === 'game' && user !== null && loadingGame === false && (
      <>

      {gamePhase !== 'planning' && (
        <>
          <nav className="game-nav-bar">
            <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
            
            <h5 className="nav-user-greeting">
              Hello <span className="username-highlight">{user.username}</span>
            </h5>
            
            <button onClick={showScores} className="nav-btn scoreboard-btn">ScoreBoard</button>
          </nav>
        </>
      )}

        <div className="app-container">
          <h1>Last Race Metro Game</h1>
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

            {gamePhase === 'execution' && (
              <div className="objective-board">
                <span className="objective-label">Current Journey</span>
                <div className="objective-route-row">
                  <div className="station-pill departure">
                    <span className="pill-type">FROM</span>
                    <strong>{startStation}</strong>
                  </div>
                  
                  <div className="route-arrow">➔</div>
                  
                  <div className="station-pill arrival">
                    <span className="pill-type">TO</span>
                    <strong>{endStation}</strong>
                  </div>
                </div>
              </div>
            )}

            <MetroMap phase={gamePhase} 
            stationCoordinates={stationCoordinates}
            metroLines={metroLines}/>

          {gamePhase === 'execution' && (
            <>
          
            {showFinalResult && (
          <div>
            
            <div className="execution-header-block">
              {!invalidRoute ? (
                <>
                {userScore > 0 ? (
                  <>
                    <h3 className="execution-message">🎉 Your route was valid!</h3>
                    <h2>Final Score: {userScore}</h2>
                  </>
                ) : (<>
                    <h3 className="execution-message">Your didn't get to the destination!</h3>
                    <h2>Final Score: 0</h2>
                </>)}
                </>
              ) : (<>

              {routeLogs.length !== 0 ? (<>
                  <h3 className="execution-message">Your route was incomplete or invalid!</h3>
                  <h2>Final Score: 0</h2>                             
              </>) : (<>
                  <h3 className="execution-message">You didn't choose any segment!</h3>
                  <h2>Final Score: 0</h2>
              </>)}
                
              </>)
              
              
              }
                  <button className="btn-restart" onClick={resetGame}>
                    Restart the Game
                  </button>
            </div>

            <div className='show-final-result'>
              {visibleLogs.length !== 0 ? (<>
              
                {visibleLogs.map((route, index) => {
                  return (
                <div key={index} className='log-card'>
                  {!invalidRoute ? (<>
                  
                  <h3>{route.segment}</h3>
                  <h4>Event: {route.eventName} ({route.effect >= 0 ? `+${route.effect}` : route.effect} 🪙)</h4>
                    <h5>Balance: {route.currentCoins} 🪙</h5>
                  </>) : (<>
                    <h3>{route.from} ➔ {route.to}</h3>
                    </>)}
                </div>
                  )
                })}
              
              </>) : (<>
                
              </>)}
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
                {gamePhase === 'planning' && metroSegments.map((segment, index) => {

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


    {currentScreen === 'scoreboard' && gamePhase !== 'planning' && (
      <>       
        <Scoreboard scores={allScores} backToGame={() => setCurrentScreen('game')}/> 
      </>
    )}

    {currentScreen === 'instructions' && (
      <>
      <button onClick={() => setCurrentScreen('login')}>Back to Login</button>
      <p>
      In the game, the player is assigned a starting station and a destination station, which vary in each game, 
      within a fictional underground network. 
      The player must plan and execute a valid route before time runs out, gaining or losing coins 
      along the way due to random events. 
      The goal is to reach the destination with the highest possible score. 
      
      The application allows users to play multiple games. Each game starts with 20 coins and consists of 
      the following phases:

      Setup: The player sees the network map with all stations, their connections, and the lines. 
      When the player is ready to play, they move on to the next phase.
      
      Planning: The player sees three elements on the page:
      the network map, showing only the stations with their names but without the lines connecting them;

      
      </p>
      </>
    )}

    </>
  );
}

export default App
