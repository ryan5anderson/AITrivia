import React, { useState } from 'react';

function QuestionCard() {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);

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

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const question = questions[currentQuestionIndex];

    // Handle when user selects an answer 
    const handleSelect = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
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

        return { backgroundColor: "#eee"}; // Gray = Neutral
    };

    // Move to the next question
    const handleNext = () => {
        if (currentQuestionIndex < questions.length -1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            alert("🎉 Quiz finished!");
            // TODO: Navigate to results or reset
        }
    };

    return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      {/* Show the question text */}
      <h3>{question.text}</h3>

      {/* Show the list of options as buttons */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {question.options.map((option, index) => (
          <li key={index} style={{ margin: '0.5rem 0' }}>
            <button
              onClick={() => handleSelect(option)} // what happens when you click
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                width: '100%',
                cursor: isAnswered ? 'default' : 'pointer',
                ...getButtonStyle(option), // dynamically apply button style
              }}
              disabled={isAnswered} // disable button after one is picked
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      
      {/* Show "Next Question" only after answering */}
      {isAnswered && (
        <button
          onClick={handleNext}
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
          Next Question
        </button>
      )}
    </div>
  );

}

export default QuestionCard;
