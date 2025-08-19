import React from "react";

export default function LobbyControls({ code, onCopy, isHost, onStart }) {
  return (
    <>
      {code && (
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
            Lobby Code: <span style={{ fontFamily: "monospace" }}>{code.toUpperCase()}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={onCopy}
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

      {isHost && code && (
        <button
          onClick={onStart}
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
    </>
  );
}
