import React from 'react';
import { useNavigate } from 'react-router-dom';


function Home() {
    const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>🎉 Welcome to AI Trivia!</h1>
      <p>Test your knowledge in different topics, powered by OpenAI.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            marginRight: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#28a745',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Log In
        </button>

        <button
          style={{
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
    </div>
  );
}

export default Home;
