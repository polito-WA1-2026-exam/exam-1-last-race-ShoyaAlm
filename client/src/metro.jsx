import './css/metro.css';

const STATION_COORDINATES = {
  "Harlem": { x: 50, y: 100 },
  "Addison": { x: 180, y: 100 },
  "Damen": { x: 310, y: 100 },
  "Wells": { x: 490, y: 100 },
  "Clark": { x: 670, y: 100 },
  "Lawrence": { x: 820, y: 100 },
  
  "Kimball": { x: 310, y: 20 },
  "Central": { x: 310, y: 60 },
  "Quincy": { x: 310, y: 250 },
  "Jackson": { x: 310, y: 400 },
  "Monroe": { x: 245, y: 290 },
  "Roosevelt": { x: 310, y: 460 },

  "Belmon": { x: 610, y: 20 },
  "Division": { x: 550, y: 60 },
  "Morgan": { x: 180, y: 330 },
  "Harrison": { x: 100, y: 380 },

  "Washington": { x: 820, y: 250 },
  "Grand": { x: 745, y: 175 },
  "Adams": { x: 180, y: 400 },
  "Howard": { x: 100, y: 400 }
};

const METRO_LINES = [
  {
    name: "Red Line",
    color: "#E10600",
    route: ["Harlem", "Addison", "Damen", "Wells", "Clark", "Lawrence"]
  },
  {
    name: "Green Line",
    color: "#009639",
    route: ["Kimball", "Central", "Damen", "Quincy", "Jackson", "Roosevelt"]
  },
  {
    name: "Blue Line",
    color: "#00A1DE",
    route: ["Belmon", "Division", "Wells", "Quincy", "Monroe", "Morgan", "Harrison"]
  },
  {
    name: "Yellow Line",
    color: "#F9E300",
    route: ["Washington", "Grand", "Clark", "Jackson", "Adams", "Howard"]
  }
];

export default function MetroMap({ phase }) {
  const showLines = phase === 'setup';

  return (
    <div className="metro-map-container">
      <svg viewBox="0 0 900 500" className="metro-svg">
        
        {showLines && METRO_LINES.map((line) => (
          <g key={line.name}>
            {line.route.map((station, index) => {
              if (index === line.route.length - 1) return null;
              const start = STATION_COORDINATES[station];
              const end = STATION_COORDINATES[line.route[index + 1]];
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

        {Object.entries(STATION_COORDINATES).map(([name, coords]) => {
          const linesServingStation = METRO_LINES.filter(l => l.route.includes(name));
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
          {METRO_LINES.map(line => (
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