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
          onClick={() => navigate('/lobby')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1.1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Enter Lobby
        </button>
      </div>
    </div>
  );
}

export default UserHome;
