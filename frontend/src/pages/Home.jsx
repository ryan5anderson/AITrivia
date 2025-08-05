import React from 'react';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>🎉 Welcome to AI Trivia!</h1>
      <p>Test your knowledge in different topics, powered by OpenAI.</p>
      <button
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#007bff',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Start Game
      </button>
    </div>
  );
}

export default Home;
