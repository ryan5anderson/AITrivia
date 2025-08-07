import React, { useState } from 'react';

function QuestionCard({ question, onAnswer, onNext, isLast }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);

    // Handle when user selects an answer 
    const handleSelect = (option) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);
        onAnswer(option); // tell Game.jsx what was selected
    };

    // Button styles depending on status
    const getButtonStyle = (option) => {
        if (!isAnswered) return {};

        if (option === question.correct) {
            return { backgroundColor: "#28a745", color: "white" }; // Green = Correct
        }

        if (option === selectedOption) {
            return { backgroundColor: "#dc3545", color: "white" }; // Red = Wrong
        }

        return { backgroundColor: "#eee" }; // Gray = Neutral
    };

    return (
        <div style={{ 
            border: '1px solid #ccc', 
            padding: '1.5rem',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>
                {question.text}
            </h3>
            
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {question.options.map((option, index) => (
                    <li key={index} style={{ margin: '0.75rem 0' }}>
                        <button
                            onClick={() => handleSelect(option)}
                            style={{
                                padding: '0.75rem 1rem',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                width: '100%',
                                cursor: isAnswered ? 'default' : 'pointer',
                                fontSize: '1rem',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                ...getButtonStyle(option),
                            }}
                            disabled={isAnswered}
                        >
                            {option}
                        </button>
                    </li>
                ))}
            </ul>

            {isAnswered && (
                <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ 
                        padding: '1rem',
                        borderRadius: '6px',
                        backgroundColor: selectedOption === question.correct ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${selectedOption === question.correct ? '#c3e6cb' : '#f5c6cb'}`,
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        <strong>
                            {selectedOption === question.correct ? 
                                '🎉 Correct!' : 
                                `❌ Wrong! The correct answer was: ${question.correct}`
                            }
                        </strong>
                    </div>
                    
                    <button
                        onClick={onNext}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            fontSize: '1.1rem',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
                        {isLast ? "🏁 Finish Quiz" : "➡️ Next Question"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default QuestionCard;
