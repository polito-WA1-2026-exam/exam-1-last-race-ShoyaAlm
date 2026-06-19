import React from 'react';
import './css/Scoreboard.css';

function Scoreboard({ scores, backToGame }) {
  return (
    <div className="scoreboard-container">

      <header className="scoreboard-header">
        <h1>🏆 Scoreboard Rankings 🏆</h1>
      </header>

      {scores.length === 0 ? (
        <div className="scoreboard-loading">Loading player rankings...</div>
      ) : (
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th className="scoreboard-th">Rank</th>
              <th className="scoreboard-th">Username</th>
              <th className="scoreboard-th">Highest Score Record</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((user, index) => (
              <tr 
                key={index} 
                className={index % 2 === 0 ? 'scoreboard-row-zebra' : 'scoreboard-row'}
              >
                <td className="scoreboard-td">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </td>
                <td className="scoreboard-td scoreboard-row-username">
                  {user.username}
                </td>
                <td className="scoreboard-td scoreboard-row-score">
                  🪙 {user.highestScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={backToGame} className="scoreboard-back-btn">
        ← Back to Game Board
      </button>
    </div>
  );
}

export default Scoreboard;