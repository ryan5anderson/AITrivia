# AITrivia

---Features---
Integration with OpenAI API for dynamic question generation

Secure authentication and authorization system

Lobby creation and joining (up to four players per game)

Four rounds per game with player-selected topics

Unique trivia questions per topic and player

Real-time scoring with bonuses for faster correct answers

Live scoreboard and end-of-game results

Fully deployable and scalable architecture

---Sample File Structure---
trivia-game/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gameController.js
│   │   └── openaiController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Lobby.js
│   │   └── Score.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── gameRoutes.js
│   │   └── lobbyRoutes.js
│   ├── sockets/
│   │   └── gameSocket.js
│   ├── utils/
│   │   └── questionGenerator.js
│   ├── server.js
│   └── config.js
│
├── frontend/
│   ├── components/
│   │   ├── Lobby.js
│   │   ├── GameBoard.js
│   │   ├── QuestionCard.js
│   │   ├── Scoreboard.js
│   │   └── TopicSelector.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Game.jsx
│   ├── App.jsx
│   └── index.js
│
├── .env
├── package.json
├── README.md
└── Dockerfile
