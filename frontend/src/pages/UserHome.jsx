import React from 'react';
import { useNavigate } from 'react-router-dom';

function UserHome() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>Welcome back!</h1>
      <p>Ready to play?</p>
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => navigate('/topic-select')}
          style={{
            marginRight: '1rem',
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

        <button
          onClick={() => alert('Join Game is not implemented yet')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: '#f8f9fa',
            color: '#000',
            cursor: 'pointer',
          }}
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

export default UserHome;


