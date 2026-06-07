import { useEffect, useState } from 'react'
import './App.css'
import MetroMap from './metro'



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
  // we assign a route (if calculateDistance < 3, we assign again)

  
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
  
  
  // return the path
}



assignRoute()


function userActions () {
  // Wrong platform -> setUserCoins(userCoins-2)

  // Kind passenger -> setUserCoins(userCoins+1)
  
  // 
}


function App() {
  const [count, setCount] = useState(0)
  
  const [personalHighestScore, setPersonalHighestScore] = useState(0)

  
  const [usedStations, setUsedStations] = useState([])



  const [segments, setSegments] = useState([])


  const [assignedRoute, setAssignedRoute] = useState()

  const [userCoins, setUserCoins] = useState(20)


  const [initialStation, setInitialStation] = useState('');
  const [endStation, setEndStation] = useState('');
  
  const [gamePhase, setGamePhase] = useState('setup'); 

  // useEffect(() => {

  //   // console.log('gamePhase: ', gamePhase);
    
  //   if(gamePhase == 'setup'){
  //     setInitialStation('')
  //     setEndStation('')
  //   } else {

  //   }


  // }, [gamePhase])
  






  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', background: '#242424', minHeight: '100vh', padding: '20px', color: '#fff' }}>
      <h1>Last Race Metro Network</h1>
      <p>Current Phase: <strong>{gamePhase}</strong></p>
      
      <button 
        onClick={() => setGamePhase(gamePhase === 'setup' ? 'Planning' : 'setup')}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginBottom: '10px' }}
      >
        Toggle Setup / Planning View
      </button>

      <MetroMap phase={gamePhase} />
    </div>
  );
}

export default App
