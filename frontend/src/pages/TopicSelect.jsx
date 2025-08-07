import React from 'react';

function Lobby({ onNext }) {
    return (
        <div style={{ padding: '2rem' }}>
            <h2>📚 Topic Selection</h2>
            <p>Topic selection coming soon</p>
            <button onClick={onNext}>Start Trivia</button>
        </div>
    );
}

export default Lobby;
