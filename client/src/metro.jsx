import './css/metro.css';
import { GameContext } from './App';
import { useContext } from 'react';

function MetroMap() {
  
  const { gamePhase, stationCoordinates, metroLines } = useContext(GameContext)

  if (!stationCoordinates || !metroLines) {
    return <div style={{ textAlignment: 'center', padding: '20px' }}>Loading Map Elements...</div>;
  }
  const showLines = gamePhase === 'setup';

  return (
    <div className="metro-map-container">
      <svg viewBox="0 0 900 500" className="metro-svg">
        
        {showLines && metroLines.map((line) => (
          <g key={line.name}>
            {line.route.map((station, index) => {
              if (index === line.route.length - 1) return null;
              const start = stationCoordinates[station];
              const end = stationCoordinates[line.route[index + 1]];
              return (
                <line
                  key={`${line.name}-${index}`}
                  x1={start.x} y1={start.y}
                  x2={end.x} y2={end.y}
                  stroke={line.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              );
            })}
          </g>
        ))}

        {Object.entries(stationCoordinates).map(([name, coords]) => {
          const linesServingStation = metroLines.filter(l => l.route.includes(name));
          const isInterchange = linesServingStation.length > 1;

          return (
            <g key={name} transform={`translate(${coords.x}, ${coords.y})`}>
              <circle
                className="station-node"
                r={isInterchange ? "9" : "6"}
                fill={isInterchange ? "#ffffff" : "#2d2d2d"}
                stroke={isInterchange ? "#333333" : "#ffffff"}
                strokeWidth={isInterchange ? "3" : "2"}
              />
              
              <text
                y="-15"
                textAnchor="middle"
                className={`station-label text-shadow ${isInterchange ? 'interchange' : 'regular'}`}
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>
      
      {showLines && (
        <div className="metro-legend">
          {metroLines.map(line => (
            <div key={line.name} className="legend-item">
              <div 
                className="legend-line-preview" 
                style={{ backgroundColor: line.color }}
              />
              {line.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MetroMap