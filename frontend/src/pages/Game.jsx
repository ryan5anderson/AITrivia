// pages/Game.jsx
import React, { useEffect, useState } from "react";
import QuestionCard from "../components/QuestionCard";
import Scoreboard from "../components/Scoreboard";

export default function Game({ question, code, socket }) {
  const [board, setBoard] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [correctIndex, setCorrectIndex] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setDisabled(false);
    setCorrectIndex(null);
  }, [question?.qid]);

  useEffect(() => {
    if (!socket) return;
    const onScoreUpdate = (payload = {}) => {
      setBoard(payload.leaderboard || payload.scores || []);
      if (typeof payload.correctIndex === "number") setCorrectIndex(payload.correctIndex);
    };
    socket.on("scoreUpdate", onScoreUpdate);
    return () => socket.off("scoreUpdate", onScoreUpdate);
  }, [socket]);

  if (!question) {
    return <div style={{ padding: "2rem", textAlign: "center" }}><h2>Waiting for the next question…</h2></div>;
  }

  const msLeft = Math.max(0, (question.expiresAt ?? Date.now()) - now);
  const secsLeft = Math.ceil(msLeft / 1000);

  const handleSelect = (choiceIndex) => {
    if (!socket || disabled) return;
    setDisabled(true);
    socket.emit("submit-answer", { lobbyCode: code, qid: question.qid, choiceIndex }, () => {});
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div>⏳ Time left: <strong>{secsLeft}s</strong></div>
        <div>Q{question.turn ?? "?"}</div>
      </div>

      <QuestionCard
        question={question}
        onSelect={handleSelect}
        disabled={disabled}
        correctIndex={correctIndex}
      />

      <Scoreboard board={board} />
    </div>
  );
}
