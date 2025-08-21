// src/pages/Lobby.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModeToggle from "../components/lobby/ModeToggle";
import NameInput from "../components/lobby/NameInput";
import HostForm from "../components/lobby/HostForm";
import JoinForm from "../components/lobby/JoinForm";
import { useSocket } from "../realtime/SocketProvider";

export default function Lobby() {
  const navigate = useNavigate();
  const socket = useSocket();

  const [mode, setMode] = useState("host");
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [status, setStatus] = useState("");

  const lobbyCodeRef = useRef("");
  const isMounted = useRef(true);
  const ready = !!socket && socket.connected;

  // --- lifecycle + socket wiring
  useEffect(() => {
    isMounted.current = true;
    if (!socket) return;

    const onConnect = () => {
      setStatus("Connected to lobby server");
      // auto re-sync if we have a remembered room
      try {
        const last = localStorage.getItem("lastRoomCode");
        if (last) {
          socket.emit("sync-lobby", { lobbyCode: last });
          socket.emit("sync-game", { lobbyCode: last });
        }
      } catch {}
    };

    const onDisconnect = () => setStatus("Disconnected");
    const onConnectError = (err) => setStatus(`Connection error: ${err.message}`);

    // If someone else starts the game while we're on this page, go to topic-select/:code
    const onGameStarted = ({ roomCode }) => {
      if (roomCode) {
        try { localStorage.setItem("lastRoomCode", roomCode); } catch {}
        navigate(`/topic-select/${roomCode}`, { replace: true });
      } else {
        console.warn("[client] game-started without roomCode payload");
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("game-started", onGameStarted);

    return () => {
      isMounted.current = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("game-started", onGameStarted);
    };
  }, [socket, navigate]);

  // --- create lobby
  const createLobby = (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return setStatus("Please enter a name");
    if (!ready) return setStatus("Connecting… please wait.");
    setStatus("");

    socket.emit("create-lobby", { name: name.trim() }, ({ lobbyCode }) => {
      if (!lobbyCode) return setStatus("Failed to create lobby");

      // ensure this socket is a player and name survives refresh
      socket.emit("join-lobby", { lobbyCode, name: name.trim() });
      sessionStorage.setItem("playerName", name.trim());

      try { localStorage.setItem("lastRoomCode", lobbyCode); } catch {}
      lobbyCodeRef.current = lobbyCode;
      navigate(`/waiting/${lobbyCode}`);
    });
  };

  // --- join lobby
  const joinLobby = (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return setStatus("Please enter a name");
    if (!lobbyCode.trim()) return setStatus("Please enter a lobby code");
    if (!ready) return setStatus("Connecting… please wait.");
    setStatus("");

    const code = lobbyCode.trim().toUpperCase();
    socket.emit("join-lobby", { lobbyCode: code, name: name.trim() }, (res) => {
      if (res?.error) return setStatus(res.error);

      sessionStorage.setItem("playerName", name.trim());
      try { localStorage.setItem("lastRoomCode", code); } catch {}
      lobbyCodeRef.current = code;
      navigate(`/waiting/${code}`);
    });
  };

  return (
    <div style={{ maxWidth: 420, margin: "3rem auto", textAlign: "center" }}>
      <h2>🧑‍🤝‍🧑 Lobby</h2>
      <p>Create a lobby as host, or join with a code.</p>

      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: "0.5rem", minHeight: 18 }}>
        {status || (ready ? "Connected" : "Connecting…")}
      </div>

      <ModeToggle mode={mode} setMode={setMode} />
      <NameInput name={name} setName={setName} />

      {mode === "host" ? (
        <HostForm disabled={!name.trim() || !ready} onCreate={createLobby} />
      ) : (
        <JoinForm
          lobbyCode={lobbyCode}
          setLobbyCode={setLobbyCode}
          disabled={!name.trim() || !lobbyCode.trim() || !ready}
          onSubmit={joinLobby}
        />
      )}
    </div>
  );
}
