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

  useEffect(() => {
    isMounted.current = true;

    const onConnect = () => setStatus("Connected to lobby server");
    const onDisconnect = () => setStatus("Disconnected");
    const onConnectError = (err) => setStatus(`Connection error: ${err.message}`);
    const onGameStarted = () => navigate("/topic-select"); 

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

  const createLobby = (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return setStatus("Please enter a name");
    setStatus("");

    socket.emit("create-lobby", { name: name.trim() }, ({ lobbyCode }) => {
      if (!lobbyCode) return setStatus("Failed to create lobby");

      // Ensure this socket is counted as a player + persist name for refresh
      socket.emit("join-lobby", { lobbyCode, name: name.trim() });
      sessionStorage.setItem("playerName", name.trim());

      lobbyCodeRef.current = lobbyCode;
      navigate(`/waiting/${lobbyCode}`);
    });
  };

  const joinLobby = (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return setStatus("Please enter a name");
    if (!lobbyCode.trim()) return setStatus("Please enter a lobby code");
    setStatus("");

    const code = lobbyCode.trim().toUpperCase();
    socket.emit("join-lobby", { lobbyCode: code, name: name.trim() }, (res) => {
      if (res?.error) return setStatus(res.error);

      sessionStorage.setItem("playerName", name.trim());
      lobbyCodeRef.current = code;
      navigate(`/waiting/${code}`);
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "3rem auto", textAlign: "center" }}>
      <h2>🧑‍🤝‍🧑 Lobby</h2>
      <p>Create a lobby as host, or join with a code.</p>

      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: "0.5rem" }}>
        {status}
      </div>

      <ModeToggle mode={mode} setMode={setMode} />
      <NameInput name={name} setName={setName} />

      {mode === "host" ? (
        <HostForm disabled={!name.trim()} onCreate={createLobby} />
      ) : (
        <JoinForm
          lobbyCode={lobbyCode}
          setLobbyCode={setLobbyCode}
          disabled={!name.trim() || !lobbyCode.trim()}
          onSubmit={joinLobby}
        />
      )}
    </div>
  );
}
