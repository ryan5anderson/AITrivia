import React from 'react';

function Lobby({ onNext }) {
    return (
        <div style={{ padding: '2rem' }}>
            <h2>🧑‍🤝‍🧑 Lobby</h2>
            <p>Waiting for players to join...</p>
            <button onClick={onNext}>Start Game</button>
        </div>
    );
}

export default Lobby;
