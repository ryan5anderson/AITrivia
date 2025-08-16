/*
import React from 'react';

function Lobby({ onNext }) {
    return (
        <div style={{ padding: '2rem' }}>
            <h2>🧑‍🤝‍🧑 Lobby</h2>
            <p>Waiting for players to join...</p>
            <button onClick={onNext}>Start Game</button>
        </div>
    );
}

export default Lobby;
*/
// src/pages/Lobby.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// Set your backend WebSocket URL (Vite-style env var supported)
const SOCKET_URL = import.meta?.env?.VITE_SOCKET_URL || "http://localhost:3000";

export default function Lobby() {
  const navigate = useNavigate();

  // ui state
  const [mode, setMode] = useState("host"); // "host" | "join"
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [status, setStatus] = useState("");
  const [connecting, setConnecting] = useState(false);

  // create singleton socket instance for this page
  const socket = useMemo(
    () =>
      io(SOCKET_URL, {
        autoConnect: false, // we’ll connect manually
        transports: ["websocket"], // faster/more reliable in dev
        withCredentials: true,
      }),
    []
  );

  // stable refs
  const lobbyCodeRef = useRef("");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // attach listeners
    socket.on("connect", () => setStatus("Connected to lobby server"));
    socket.on("disconnect", () => setStatus("Disconnected"));

    socket.on("lobby-update", (updatedPlayers) => {
      if (!isMounted.current) return;
      setPlayers(updatedPlayers || []);
    });

    socket.on("game-started", () => {
      // navigate to your game screen (or topic selection)
      navigate("/topic-select"); // or "/game"
    });

    socket.on("connect_error", (err) => {
      setStatus(`Connection error: ${err.message}`);
      setConnecting(false);
    });

    // connect once listeners are set
    setConnecting(true);
    socket.connect();

    // cleanup on unmount
    return () => {
      isMounted.current = false;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [socket, navigate]);

  const createLobby = (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return setStatus("Please enter a name");
    setStatus("");

    socket.emit("create-lobby", { name: name.trim() }, ({ lobbyCode }) => {
      if (!lobbyCode) {
        setStatus("Failed to create lobby");
        return;
      }
      setIsHost(true);
      setLobbyCode(lobbyCode);
      lobbyCodeRef.current = lobbyCode;
    });
  };

  const joinLobby = (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return setStatus("Please enter a name");
    if (!lobbyCode.trim()) return setStatus("Please enter a lobby code");
    setStatus("");

    socket.emit(
      "join-lobby",
      { lobbyCode: lobbyCode.trim().toUpperCase(), name: name.trim() },
      (res) => {
        if (res?.error) {
          setStatus(res.error);
          return;
        }
        setIsHost(false);
        lobbyCodeRef.current = lobbyCode.trim().toUpperCase();
      }
    );
  };

  const startGame = () => {
    const code = lobbyCodeRef.current || lobbyCode;
    if (!isHost || !code) return;
    socket.emit("start-game", { lobbyCode: code });
  };

  const copyCode = async () => {
    const code = lobbyCodeRef.current || lobbyCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Lobby code copied!");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("Could not copy lobby code");
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "2.5rem auto", textAlign: "center" }}>
      <h1>Lobby</h1>
      <p style={{ opacity: 0.8, marginBottom: "1rem" }}>
        Create a lobby as host, or join with a code.
      </p>

      {/* Connection status */}
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: "0.5rem" }}>
        {connecting ? "Connecting…" : status}
      </div>

      {/* Mode toggle */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setMode("host")}
          style={{
            padding: "0.5rem 1rem",
            marginRight: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
            background: mode === "host" ? "#e6f4ff" : "#fff",
            cursor: "pointer",
          }}
        >
          I’m the Host
        </button>
        <button
          onClick={() => setMode("join")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: mode === "join" ? "#e6f4ff" : "#fff",
            cursor: "pointer",
          }}
        >
          I’m Joining
        </button>
      </div>

      {/* Name input */}
      <div style={{ marginBottom: "0.75rem" }}>
        <input
          type="text"
          placeholder="Your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", maxWidth: 360, padding: "0.6rem" }}
        />
      </div>

      {/* Host / Join forms */}
      {mode === "host" ? (
        <div style={{ marginBottom: "1.25rem" }}>
          <button
            onClick={createLobby}
            disabled={!name.trim()}
            style={{
              padding: "0.6rem 1.1rem",
              borderRadius: 8,
              border: "none",
              background: "#28a745",
              color: "#fff",
              cursor: "pointer",
              opacity: name.trim() ? 1 : 0.6,
            }}
          >
            Create Lobby
          </button>
        </div>
      ) : (
        <form onSubmit={joinLobby} style={{ marginBottom: "1.25rem" }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <input
              type="text"
              placeholder="Lobby code (e.g., ABC123)"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              style={{ width: "100%", maxWidth: 360, padding: "0.6rem", textTransform: "uppercase" }}
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !lobbyCode.trim()}
            style={{
              padding: "0.6rem 1.1rem",
              borderRadius: 8,
              border: "none",
              background: "#007bff",
              color: "#fff",
              cursor: "pointer",
              opacity: name.trim() && lobbyCode.trim() ? 1 : 0.6,
            }}
          >
            Join Lobby
          </button>
        </form>
      )}

      {/* Lobby code + host controls */}
      {(lobbyCodeRef.current || lobbyCode) && (
        <div
          style={{
            padding: "0.75rem",
            borderRadius: 8,
            border: "1px solid #eee",
            background: "#fafafa",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Lobby Code:{" "}
            <span style={{ fontFamily: "monospace" }}>
              {(lobbyCodeRef.current || lobbyCode).toUpperCase()}
            </span>
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={copyCode}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 6,
                border: "1px solid #ddd",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              Copy Code
            </button>
          </div>
        </div>
      )}

      {/* Players list */}
      <div
        style={{
          textAlign: "left",
          margin: "0 auto 1rem",
          maxWidth: 420,
          border: "1px solid #eee",
          borderRadius: 10,
          padding: "0.75rem",
          background: "#fff",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Players</div>
        {players.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No players yet.</div>
        ) : (
          <ul style={{ margin: 0, padding: "0 0 0 1rem" }}>
            {players.map((p) => (
              <li key={p.id}>
                {p.name} {p.id === socket.id ? "(you)" : ""}
                {isHost && p.id === socket.id ? " — host" : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Start button (host only) */}
      {isHost && (lobbyCodeRef.current || lobbyCode) && (
        <button
          onClick={startGame}
          style={{
            padding: "0.7rem 1.2rem",
            borderRadius: 10,
            border: "none",
            background: "#673ab7",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Start Game ▶
        </button>
      )}
    </div>
  );
}

