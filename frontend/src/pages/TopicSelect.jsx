import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../realtime/SocketProvider";
import PhaseFrame from "../components/PhaseFrame";

export default function TopicSelect() {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const roomCodeRef = useRef(urlCode || "");
  useEffect(() => { if (urlCode) roomCodeRef.current = urlCode; }, [urlCode]);

  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    console.log("[client] emitting pickTopic", { lobbyCode: rc, topic: t, my: socket.id });
    socket.emit("pickTopic", { lobbyCode: rc, topic: t }, (res) => {
      if (res && res.error) {
        setStatus("Could not start round. Try again.");
        setSubmitting(false);
      } else {
        setStatus("Generating question…");
      }
    });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <h2>📚 Choose Your Topic</h2>
      <p style={{ marginBottom: "1rem", color: "#666" }}>Enter any topic you’d like to be quizzed on.</p>

      <div style={{ marginBottom: "0.75rem" }}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !submitting && submit()}
          placeholder="e.g., NBA history, World War II, Taylor Swift…"
          disabled={submitting}
          style={{
            width: "100%", padding: "1rem", fontSize: "1.1rem",
            border: "2px solid #ddd", borderRadius: 8, outline: "none", boxSizing: "border-box",
            opacity: submitting ? 0.7 : 1,
          }}
          onFocus={(e) => (e.target.style.borderColor = "#007bff")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
        />
      </div>

      <div style={{ minHeight: 18, fontSize: 12, color: "#888", marginBottom: 12 }}>{status}</div>

      <button
        onClick={submit}
        disabled={!topic.trim() || submitting}
        style={{
          padding: "0.9rem 1.6rem", fontSize: "1.1rem",
          backgroundColor: topic.trim() && !submitting ? "#007bff" : "#ccc",
          color: "#fff", border: "none", borderRadius: 8,
          cursor: topic.trim() && !submitting ? "pointer" : "not-allowed",
          transition: "background-color 0.2s",
        }}
      >
        {submitting ? "Generating…" : "Confirm Topic 🎮"}
      </button>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => navigate(`/game/${roomCodeRef.current || urlCode}`, { replace: true })}
          style={{
            fontSize: 13, background: "transparent", border: "none",
            color: "#666", cursor: "pointer", textDecoration: "underline",
          }}
          disabled={submitting}
        >
          Cancel and return to game
        </button>
      </div>
    </div>
  );
}
