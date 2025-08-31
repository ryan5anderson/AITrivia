// src/pages/Lobby.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../realtime/SocketProvider";

export default function Lobby() {
  const navigate = useNavigate();
  const socket = useSocket();

  const [mode, setMode] = useState("host");
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [status, setStatus] = useState("");

  const ready = !!socket?.connected;

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setStatus("");
    const onDisconnect = () => setStatus("Disconnected");
    const onError = (err) => setStatus(`Error: ${err.message}`);
    const onGameStarted = ({ roomCode }) =>
      roomCode && navigate(`/topic-select/${roomCode}`, { replace: true });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);
    socket.on("game-started", onGameStarted);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
      socket.off("game-started", onGameStarted);
    };
  }, [socket, navigate]);

  const createLobby = (e) => {
    e.preventDefault();
    if (!name.trim()) return setStatus("Enter a name");
    if (!ready) return setStatus("Connecting…");
    socket.emit("create-lobby", { name: name.trim() }, ({ lobbyCode }) => {
      if (!lobbyCode) return setStatus("Failed to create lobby");
      socket.emit("join-lobby", { lobbyCode, name: name.trim() });
      sessionStorage.setItem("playerName", name.trim());
      navigate(`/waiting/${lobbyCode}`);
    });
  };

  const joinLobby = (e) => {
    e.preventDefault();
    if (!name.trim() || !lobbyCode.trim()) return setStatus("Missing info");
    if (!ready) return setStatus("Connecting…");
    const code = lobbyCode.trim().toUpperCase();
    socket.emit("join-lobby", { lobbyCode: code, name: name.trim() }, (res) => {
      if (res?.error) return setStatus(res.error);
      sessionStorage.setItem("playerName", name.trim());
      navigate(`/waiting/${code}`);
    });
  };

  const statusText = status || (ready ? "Connected" : "Connecting…");
  const statusClass =
    status && /(error|fail|disconnect)/i.test(status)
      ? "bg-rose-50 text-rose-700 border border-rose-200"
      : ready
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-amber-50 text-amber-700 border border-amber-200";

  const canSubmit =
    name.trim() && (mode === "host" || (mode === "join" && lobbyCode.trim())) && ready;

  const onSubmit = mode === "host" ? createLobby : joinLobby;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] page-bg overflow-hidden flex items-center justify-center px-4">
      <div className="card-glass max-w-md w-full min-h-[460px] p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-blue">🧑‍🤝‍🧑 Lobby</h2>
            <p className="text-gray-600 mt-1">Host a lobby or join with a code.</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium tabnums ${statusClass}`}
          >
            {statusText}
          </span>
        </div>

        {/* Toggle */}
        <div className="mt-4 inline-flex rounded-xl bg-black/5 p-1 self-center">
          <button
            type="button"
            onClick={() => setMode("host")}
            className={`px-4 h-9 rounded-lg text-sm font-medium transition ${
              mode === "host"
                ? "bg-brand-orange text-white"
                : "text-gray-700 hover:bg-black/10"
            }`}
          >
            I’m the Host
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className={`px-4 h-9 rounded-lg text-sm font-medium transition ${
              mode === "join"
                ? "bg-brand-orange text-white"
                : "text-gray-700 hover:bg-black/10"
            }`}
          >
            I’m Joining
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-5 space-y-4 flex-1">
          <label className="block">
            <span className="text-sm font-medium">Display name</span>
            <input
              type="text"
              className="input ring-focus mt-1 h-12 text-base"
              placeholder="Your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              onKeyDown={(e) => e.key === "Enter" && canSubmit && onSubmit(e)}
            />
          </label>

          {mode === "join" && (
            <label className="block">
              <span className="text-sm font-medium">Lobby code</span>
              <input
                type="text"
                className="input ring-focus mt-1 h-12 text-base uppercase tracking-widest"
                placeholder="ABCD"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
                onKeyDown={(e) => e.key === "Enter" && canSubmit && onSubmit(e)}
              />
            </label>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary ring-focus w-full justify-center h-12 disabled:opacity-60 disabled:cursor-not-allowed bg-brand-orange hover:bg-brand-yellow"
          >
            {mode === "host" ? "Create Lobby" : "Join Lobby"}
          </button>
        </form>

        <p className="mt-auto text-[12px] text-gray-500 text-center">
          Tip: share the room code with friends to play together.
        </p>
      </div>

      {/* Brand stripe */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EB773E] to-[#F7B301]" />
    </div>
  );
}
