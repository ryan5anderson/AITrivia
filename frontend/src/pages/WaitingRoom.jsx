// src/pages/WaitingRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../realtime/SocketProvider";
import PlayerList from "../components/lobby/PlayerList";
import LobbyControls from "../components/lobby/LobbyControls";

export default function WaitingRoom() {
  const { code } = useParams();                  // room code from URL
  const navigate = useNavigate();
  const socket = useSocket();                    // expects plain socket from provider

  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [youReady, setYouReady] = useState(false);
  const [status, setStatus] = useState("");
  const mounted = useRef(false);
  const navigated = useRef(false);               // prevent double navigation

  useEffect(() => {
    mounted.current = true;

    const onConnect = () => setStatus("Connected to lobby server");
    const onDisconnect = () => setStatus("Disconnected");
    const onConnectError = (err) =>
      setStatus(`Connection error: ${err?.message || "Unknown error"}`);

    // keep local state in sync with server list
    const onLobbyUpdate = (payload) => {
      if (!mounted.current) return;
      const list = Array.isArray(payload) ? payload : payload?.players || [];
      setPlayers(list);

      // identify "me" by socket.id (server should send each player with id === socket.id)
      const me = list.find((p) => p.id === socket.id || p.socketId === socket.id);
      setIsHost(!!me?.isHost);
      setYouReady(!!me?.isReady);
    };

    // move both host & players into game route for this room
    const onGameStarted = ({ roomCode }) => {
      if (navigated.current) return;
      navigated.current = true;
      navigate(`/game/${roomCode || code}`);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("lobby-update", onLobbyUpdate);
    socket.on("game-started", ({ roomCode }) => navigate(`/game/${roomCode}`));

    // ask server for the current room snapshot (refresh/direct link)
    socket.emit("sync-lobby", { lobbyCode: code });

    return () => {
      mounted.current = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("lobby-update", onLobbyUpdate);
      socket.off("game-started", onGameStarted);
    };
  }, [socket, code, navigate]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(String(code || "").toUpperCase());
      setStatus("Lobby code copied!");
      setTimeout(() => mounted.current && setStatus(""), 1200);
    } catch {
      setStatus("Could not copy lobby code");
    }
  };

  const toggleReady = () => {
    socket.emit("toggle-ready", { lobbyCode: code }, (res) => {
      if (res?.error) setStatus(res.error);
      else setYouReady(!!res?.isReady);
    });
  };

  const startGame = () => {
    if (!isHost) return;
    socket.emit("start-game", { lobbyCode: code }, (res) => {
      // server will emit 'game-started' on success; show guard errors here
      if (res?.error && res.error !== "Need at least 1 player") setStatus(res.error); // e.g. "Need at least 2 players" / "All players must be ready"
    });
  };

  return (
    <div style={{ maxWidth: 480, margin: "3rem auto", textAlign: "center" }}>
      <h2>⏳ Waiting Room</h2>
      <p>Share this code and get everyone ready.</p>

      {/* status / errors */}
      <div style={{ fontSize: 12, opacity: 0.75, minHeight: 18, marginBottom: 8 }}>
        {status}
      </div>

      {/* room code + start button (host only) */}
      <LobbyControls
        code={String(code || "").toUpperCase()}
        onCopy={copyCode}
        isHost={isHost}
        onStart={startGame}
      />

      {/* your own ready toggle */}
      <div style={{ marginTop: 12, marginBottom: 8 }}>
        <button
          onClick={toggleReady}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: youReady ? "#e6ffed" : "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {youReady ? "Ready ✓" : "Ready?"}
        </button>
      </div>

      {/* live player list with host highlight + seat numbers */}
      <PlayerList players={players} youId={socket.id} isHostHere={isHost} />
    </div>
  );
}
