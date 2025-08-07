import React, { useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import Scoreboard from '../components/Scoreboard';
import TopicSelector from '../components/TopicSelector';

function Game() {
    // Dummy Question Object 
    const questions = [
        {
            text: "Who is the president of Drexel?",
            options: ["Antonio Merlo", "John Fry", "Boris Valerstein", "Galen Long"],
            correct: "Boris Valerstein"
        },
        {
            text: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            correct: "Paris",
        },
        {
            text: "What planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Saturn"],
            correct: "Mars",
        },
        {
            text: "Which language runs in a web browser?",
            options: ["Python", "Java", "C++", "JavaScript"],
            correct: "JavaScript",
        }
    ];

    // Game state: track question number and score
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
    const [score, setScore] = useState(0);
    const currentQuestion = questions[currentQuestionIndex];

    // Go to next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            alert("🎉 Quiz finished!");
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


    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🎮 Game Screen</h2>

            <TopicSelector />

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
