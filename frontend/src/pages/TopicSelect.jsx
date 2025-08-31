// src/pages/TopicSelect.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../realtime/SocketProvider";

export default function TopicSelect() {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const roomCodeRef = useRef(urlCode || "");
  useEffect(() => {
    if (urlCode) roomCodeRef.current = urlCode;
  }, [urlCode]);

  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // keep phase in sync—if someone else is picker, or phase advances, send us to game
  useEffect(() => {
    if (!socket) return;

    const onPhase = (payload = {}) => {
      const { phase, pickerSocketId, pickerId, roomCode } = payload;
      if (roomCode) roomCodeRef.current = roomCode;

      const psid = pickerSocketId || pickerId;
      if (psid && psid !== socket.id) {
        navigate(`/game/${roomCodeRef.current}`, { replace: true });
        return;
      }
      if (phase === "generating") {
        navigate(`/game/${roomCodeRef.current}`, { replace: true });
      }
    };

    const onNewQuestion = (payload = {}) => {
      const { roomCode } = payload;
      if (roomCode) roomCodeRef.current = roomCode;
      navigate(`/game/${roomCodeRef.current}`, { replace: true });
    };

    socket.on("phase", onPhase);
    socket.on("newQuestion", onNewQuestion);
    socket.emit("sync-game", { lobbyCode: roomCodeRef.current || urlCode });

    return () => {
      socket.off("phase", onPhase);
      socket.off("newQuestion", onNewQuestion);
    };
  }, [socket, urlCode, navigate]);

  const submit = () => {
    const t = topic.trim();
    if (!t) return setStatus("Please enter a topic.");
    if (!socket) return setStatus("Socket not connected. Try again.");

    setSubmitting(true);
    setStatus("Sending topic…");
    const rc = (roomCodeRef.current || urlCode || "").toUpperCase();

    socket.emit("pickTopic", { lobbyCode: rc, topic: t }, (res) => {
      if (res?.error) {
        setStatus("Could not start round. Try again.");
        setSubmitting(false);
      } else {
        setStatus("Generating question…");
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] page-bg flex items-center justify-center px-4">
      <div className="card-glass w-full max-w-xl">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">📚 Choose a Topic</h2>
            <p className="text-gray-600 mt-1">
              Enter any topic you’d like to be quizzed on.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="pill tabnums">
              {(roomCodeRef.current || urlCode || "").toUpperCase() || "—"}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Topic</span>
            <input
              type="text"
              className="input ring-focus mt-1 h-12 text-base"
              placeholder="e.g., NBA history, World War II, Taylor Swift…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !submitting && submit()}
              disabled={submitting}
            />
          </label>

          {/* Status line */}
          <div className="min-h-5 text-xs text-gray-500">
            {status || "Tip: Be as specific as you like for spicier questions."}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={submit}
              disabled={!topic.trim() || submitting}
              className="btn-primary ring-focus h-11 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Generating…" : "Confirm Topic 🎮"}
            </button>
            <button
              onClick={() =>
                navigate(`/game/${roomCodeRef.current || urlCode}`, { replace: true })
              }
              disabled={submitting}
              className="btn-second ring-focus h-11 justify-center disabled:opacity-60"
            >
              Cancel and return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
