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
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <h3>{question.text}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {question.options.map((option, index) => (
                    <li key={index} style={{ margin: '0.5rem 0' }}>
                        <button
                            onClick={() => handleSelect(option)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: 'none',
                                borderRadius: '6px',
                                width: '100%',
                                cursor: isAnswered ? 'default' : 'pointer',
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
                <button
                    onClick={onNext}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                    }}
                >
                    {isLast ? "Finish" : "Next Question"}
                </button>
            )}
        </div>
    );
}

export default QuestionCard;
