import { useEffect, useState, createContext } from 'react'
import './css/App.css'
import MetroMap from './metro'
import Login from './login'
import Scoreboard from './Scoreboard'


  let stations = []
  let metroSegments = []
  let events = {}

  export const GameContext = createContext();

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

    fetch('/api/generate-route')
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        console.log('Objectives generated:', data.startStation, '➔', data.endStation);
        
        setStartStation(data.startStation);
        setCurrentStation(data.startStation);
        setEndStation(data.endStation);
        
        setUserSegments([]);
        setTimeLeft(50);
        setGamePhase('planning');
      } else {
        console.error("Failed to generate match path targets: ", data.message);
      }
    })
    .catch((err) => console.error("Network error starting the game match layout:", err));
    
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

    <GameContext.Provider value={{gamePhase, stationCoordinates, metroLines}}>
    <>

    {currentScreen === 'login' && user === null && (
      <Login loginSuccess={(loggedInUser) => {
        setUser(loggedInUser)
        setCurrentScreen('game')
      }} changeCurrentScreen={setCurrentScreen}/>
    )}

    {loadingGame && currentScreen === 'game' && (
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
                    <span className="pill-type">Moving from</span>
                    <strong>{startStation}</strong>
                  </div>
                  
                  <div className="route-arrow">➔</div>
                  
                  <div className="station-pill arrival">
                    <span className="pill-type">Arriving at</span>
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
      <div className="instructions-container">
        <button onClick={() => setCurrentScreen('login')} className="btn-back">
          ← Back to Login
        </button>
        
        <h1 className="instructions-title">How to Play</h1>
        
        <div className="instructions-card intro-card">
          <p>
            In the game, the player is assigned a starting station and a destination station, 
            which vary in each game, within a fictional underground network. 
            The player must plan and execute a valid route before time runs out, gaining or losing coins 
            along the way due to random events. 
            The goal is to reach the destination with the highest possible score.
          </p>
          <p>
            The application allows users to play multiple games. Each game starts with 20 coins and consists of 
            two distinct phases:
          </p>
        </div>

        <div className="phases-grid">
          <div className="instructions-card phase-card">
            <h3><span>⏳</span> Phase 1: Setup</h3>
            <p>
              The player sees the network map with all stations, their connections, and the lines. 
              Take this time to familiarize yourself with the layout. When you are ready to play, 
              advance to the next phase.
            </p>
          </div>

          <div className="instructions-card phase-card">
            <h3><span>🛤️</span> Phase 2: Planning</h3>
            <p>
              The network map changes to show only the stations with their names, hiding the lines connecting them.
              From the beginning of this phase, you have <strong>90 seconds</strong> to scroll through the list of pairs, 
              mentally reconstruct the network, and build your route by selecting the segments in sequence.
            </p>
            <ul>
              <li>Each segment may be selected only once.</li>
              <li>The route must start from the assigned starting station and end at the assigned destination station.</li>
              <li>You must submit before time expires, or the route built up to that point will be taken as-is.</li>
            </ul>
          </div>
        </div>

        <div className="instructions-card rules-card">
          <h3><span>📋</span> Route Validity Rules</h3>
          <p>
            A route is valid when it starts and ends at the assigned stations and each segment is reachable 
            through one of the lines, with line changes possible only at interchange stations.
          </p>
          <p>
            Routes remain valid if they pass through the same station more than once, but they <strong>must not</strong> 
            involve any segment more than once.
          </p>
          <div className="warning-box">
            <strong>⚠️ Warning:</strong> If the submitted route is invalid or incomplete, the execution phase is skipped 
            and you lose all 20 starting coins, obtaining a score of zero.
          </div>
        </div>
      </div>
    )}

    </>
        </GameContext.Provider>

  );
}

export default App
