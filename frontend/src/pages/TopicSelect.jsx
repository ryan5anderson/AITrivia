import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TopicSelect() {
    const [topic, setTopic] = useState('');
    const navigate = useNavigate();

    const handleStartGame = () => {
        console.log('Start Game button clicked!');
        console.log('Current topic:', topic);
        
        if (topic.trim()) {
            console.log('Topic is valid, navigating to game...');
            console.log('Navigating with state:', { topic: topic.trim() });
            // Navigate to game with the selected topic
            navigate('/game', { state: { topic: topic.trim() } });
        } else {
            console.log('No topic entered');
            alert('Please enter a topic for your trivia questions!');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleStartGame();
        }
    };

    return (
        <div style={{ 
            padding: '2rem', 
            maxWidth: '600px', 
            margin: '0 auto',
            textAlign: 'center'
        }}>
            <h2>📚 Choose Your Topic</h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                Enter any topic you'd like to be quizzed on!
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., NBA history, World War 2, Taylor Swift..."
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.2rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
            </div>

            <button 
                onClick={handleStartGame}
                disabled={!topic.trim()}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    backgroundColor: topic.trim() ? '#007bff' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: topic.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.3s'
                }}
            >
                Start Trivia Game 🎮
            </button>
        </div>
    );
}

export default TopicSelect;
