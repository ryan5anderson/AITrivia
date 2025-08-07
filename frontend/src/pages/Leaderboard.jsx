import React from 'react';

function Leaderboard({ onNext }) {
    return (
        <div style={{ padding: '2rem' }}>
            <h2>🏆 Leaderboard</h2>
            <p>Leaderboard goes here</p>
            <button onClick={onNext}>Back to Home</button>
        </div>
    );
}

export default Leaderboard;
