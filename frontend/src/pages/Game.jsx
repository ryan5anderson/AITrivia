import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import Scoreboard from '../components/Scoreboard';

function Game() {
    const location = useLocation();
    const navigate = useNavigate();
    const topic = location.state?.topic;

    // Game state
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const currentQuestion = questions[currentQuestionIndex];

    // Fetch questions when component mounts
    useEffect(() => {
        // Redirect if no topic provided
        if (!topic) {
            navigate('/topic-select');
            return;
        }

        const fetchQuestions = async () => {
            try {
                console.log('Starting to fetch questions for topic:', topic);
                setLoading(true);
                setError(null);
                
                const requestBody = { topic };
                console.log('Sending request body:', requestBody);
                
                const response = await fetch('http://localhost:3000/api/generate-questions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response not ok:', errorText);
                    throw new Error(`Failed to fetch questions: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                console.log('Received data from backend:', data);
                
                // Transform backend format to frontend format
                const transformedQuestions = data.questions.map(q => ({
                    text: q.question,
                    options: q.choices,
                    correct: q.correctAnswer
                }));
                
                console.log('Transformed questions:', transformedQuestions);
                setQuestions(transformedQuestions);
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [topic, navigate]);

    // Go to next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Show final score and option to play again
            alert(`Quiz finished! Final Score: ${score}/${questions.length}`);
            navigate('/topic-select');
        }
    };

    // Handle answer selection
    const handleAnswer = (selectedOption) => {
        console.log("Selected:", selectedOption);
        console.log("Correct answer:", currentQuestion.correct);

        if (selectedOption === currentQuestion.correct) {
            console.log("Correct!");
            setScore(score + 1);
        } else {
            console.log("Wrong.");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={{ 
                padding: '2rem', 
                maxWidth: '800px', 
                margin: '0 auto',
                textAlign: 'center' 
            }}>
                <h2>🎮 Generating Questions...</h2>
                <p>Creating trivia questions about: <strong>{topic}</strong></p>
                <div style={{ 
                    margin: '2rem 0',
                    fontSize: '2rem'
                }}>
                    🤖💭
                </div>
                <p>This may take a few seconds...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ 
                padding: '2rem', 
                maxWidth: '800px', 
                margin: '0 auto',
                textAlign: 'center' 
            }}>
                <h2>❌ Error</h2>
                <p>Failed to generate questions: {error}</p>
                <button 
                    onClick={() => navigate('/topic-select')}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // No questions generated
    if (!questions.length) {
        return (
            <div style={{ 
                padding: '2rem', 
                maxWidth: '800px', 
                margin: '0 auto',
                textAlign: 'center' 
            }}>
                <h2>🤷‍♂️ No Questions</h2>
                <p>No questions were generated for this topic.</p>
                <button 
                    onClick={() => navigate('/topic-select')}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Choose Another Topic
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🎮 Trivia Game</h2>
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <strong>Topic:</strong> {topic}
            </div>
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                Question {currentQuestionIndex + 1} of {questions.length}
            </div>

            {/* Pass question + logic down to the question card */}
            <QuestionCard
                key={currentQuestionIndex}
                question={currentQuestion}
                onAnswer={handleAnswer}
                onNext={handleNextQuestion}
                isLast={currentQuestionIndex === questions.length - 1}
            />

            {/* Display score */}
            <Scoreboard score={score} />
        </div>
    );
}

export default Game;
