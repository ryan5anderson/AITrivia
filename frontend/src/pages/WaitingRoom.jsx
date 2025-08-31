// src/pages/WaitingRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../realtime/SocketProvider";
import PlayerList from "../components/lobby/PlayerList";
import LobbyControls from "../components/lobby/LobbyControls";
import { toast } from "../components/ToastHost";

export default function WaitingRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [youReady, setYouReady] = useState(false);
  const [status, setStatus] = useState("");

  const mounted = useRef(false);
  const navigated = useRef(false);

  useEffect(() => {
    if (!socket) return;
    mounted.current = true;

    const onConnect = () => setStatus("");
    const onDisconnect = () => setStatus("Disconnected");
    const onConnectError = (err) =>
      setStatus(`Connection error: ${err?.message || "Unknown error"}`);

    const onLobbyUpdate = (payload) => {
      if (!mounted.current) return;
      const list = Array.isArray(payload) ? payload : payload?.players || [];
      setPlayers(list);
      const me = list.find((p) => p.id === socket.id || p.socketId === socket.id);
      setIsHost(!!me?.isHost);
      setYouReady(!!me?.isReady);
    };

    const onGameStarted = ({ roomCode }) => {
      if (navigated.current) return;
      navigated.current = true;
      navigate(`/game/${roomCode || code}`, { replace: true });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("lobby-update", onLobbyUpdate);
    socket.on("game-started", onGameStarted);

    // hydrate (refresh / direct link)
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
      toast("Code copied!", { type: "ok" });
    } catch {
      toast("Could not copy code", { type: "err" });
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
      if (res?.error && res.error !== "Need at least 1 player") {
        setStatus(res.error);
      }
    });
  };

  const room = String(code || "").toUpperCase();
  const readyClass =
    status && /(error|fail|disconnect)/i.test(status)
      ? "bg-rose-50 text-rose-700 border border-rose-200"
      : socket?.connected
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "bg-amber-50 text-amber-700 border border-amber-200";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] page-bg overflow-hidden flex items-center justify-center px-4">
      <div className="card-glass w-full max-w-2xl p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-brand-blue">⏳ Waiting Room</h2>
            <p className="text-gray-600 mt-1">Share this code and get everyone ready.</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium tabnums ${readyClass}`}>
            {status || (socket?.connected ? "Connected" : "Connecting…")}
          </span>
        </div>

        {/* Code + actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="pill tabnums tracking-widest">{room}</span>
            <button
              onClick={copyCode}
              className="btn-second ring-focus h-9 px-3"
              type="button"
            >
              Copy
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Players: <span className="tabnums font-semibold">{players.length}</span>
          </div>
        </div>

        {/* Host controls / status */}
        <div className="mt-3 text-right text-sm text-gray-500">
          {isHost ? "You’re the host — start when everyone’s ready." : "Waiting for host to start…"}
        </div>

        {/* Ready + Start */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={toggleReady}
            className={`ring-focus px-4 h-10 rounded-xl font-medium border ${youReady
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-white hover:bg-black/5 border-black/10"
              }`}
            type="button"
          >
            {youReady ? "Ready ✓" : "Ready?"}
          </button>

          {isHost && (
            <button
              onClick={startGame}
              className="btn-primary bg-brand-orange hover:bg-brand-yellow ring-focus h-10"
              type="button"
            >
              Start Game →
            </button>
          )}
        </div>

        {/* Players box */}
        <div className="mt-5 card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5 font-medium text-gray-700">
            Players
          </div>
          <div className="p-0">
            <PlayerList players={players} youId={socket?.id} isHostHere={isHost} />
          </div>
        </div>

      </div>

      {/* Brand stripe */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EB773E] to-[#F7B301]" />
    </div>
  );
}
