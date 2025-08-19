import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../realtime/SocketProvider";
import TopicSelect from "./TopicSelect";
import Game from "./Game";
import Leaderboard from "./Leaderboard";

export default function GameWrapper() {
  const { code } = useParams();
  const socket = useSocket();

  // phase: topic | question | leaderboard | over
  const [phase, setPhase] = useState("topic");
  const [isHost, setIsHost] = useState(false);
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // you’ll replace these when wiring the real loop
    const onRequestTopics = (payload) => {
      // server will target only the host; others can show a waiting screen
      setPhase("topic");
    };
    const onNewQuestion = (payload) => {
      setQuestion(payload?.question || null);
      setPhase("question");
    };
    const onScoreUpdate = (payload) => {
      setLeaderboard(payload?.leaderboard || []);
      setPhase("leaderboard");
    };
    const onHostRotated = (_payload) => {
      // optional: show a transition
    };
    const onGameOver = (payload) => {
      setLeaderboard(payload?.finalBoard || []);
      setPhase("over");
    };
    const onLobbyUpdate = (list) => {
      const me = (Array.isArray(list) ? list : list?.players || []).find(p => p.id === socket.id);
      setIsHost(!!me?.isHost);
    };

    socket.on("requestTopics", onRequestTopics);
    socket.on("newQuestion", onNewQuestion);
    socket.on("scoreUpdate", onScoreUpdate);
    socket.on("hostRotated", onHostRotated);
    socket.on("gameOver", onGameOver);
    socket.on("lobby-update", onLobbyUpdate);

    // ask server to sync (in case of refresh)
    socket.emit("sync-lobby", { lobbyCode: code });

    return () => {
      socket.off("requestTopics", onRequestTopics);
      socket.off("newQuestion", onNewQuestion);
      socket.off("scoreUpdate", onScoreUpdate);
      socket.off("hostRotated", onHostRotated);
      socket.off("gameOver", onGameOver);
      socket.off("lobby-update", onLobbyUpdate);
    };
  }, [socket, code]);

  // Render current phase (use your existing components)
  if (phase === "topic") return <TopicSelect isHost={isHost} code={code} socket={socket} />;
  if (phase === "question") return <Game question={question} code={code} socket={socket} />;
  if (phase === "leaderboard") return <Leaderboard board={leaderboard} code={code} socket={socket} />;

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Game Over</h2>
      {/* render final leaderboard */}
    </div>
  );
}
