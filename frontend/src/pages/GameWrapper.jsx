import React, { useState } from 'react';
import Lobby from './Lobby';
import TopicSelect from './TopicSelect';
import Game from './Game';
import Leaderboard from './Leaderboard';

function GameWrapper() {
    const [gamePhase, setGamePhase] = useState("lobby"); // "lobby" | "topic" | "question" | "leaderboard"

    // TODO: later pass this to child components to update phase
    const nextPhase = () => {
        if (gamePhase === "lobby") setGamePhase("topic");
        else if (gamePhase === "topic") setGamePhase("question");
        else if (gamePhase === "question") setGamePhase("leaderboard");
        else setGamePhase("lobby");
    };

    return (
        <div>
            {gamePhase === "lobby" && <Lobby onNext={nextPhase} />}
            {gamePhase === "topic" && <TopicSelect onNext={nextPhase} />}
            {gamePhase === "question" && <Game onNext={nextPhase} />}
            {gamePhase === "leaderboard" && <Leaderboard onNext={nextPhase} />}
        </div>
    );
}

export default GameWrapper;
