import React from 'react';
import QuestionCard from '../components/QuestionCard';
import Scoreboard from '../components/Scoreboard';
import TopicSelector from '../components/TopicSelector';

function Game() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🎮 Game Screen</h2>

      <div style={{ marginBottom: '2rem' }}>
        <TopicSelector />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <QuestionCard />
      </div>

      <Scoreboard />
    </div>
  );
}

export default Game;