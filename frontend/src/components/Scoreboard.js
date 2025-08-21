// components/Scoreboard.jsx
import React from "react";

export default function Scoreboard({ board = [] }) {
  // board: [{ id, name, total }]
  if (!board.length) {
    return <div style={{ marginTop: 12, opacity: 0.7 }}>No scores yet.</div>;
  }
  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ marginBottom: 8 }}>🏆 Scoreboard</h4>
      <div>
        {board.map((p, i) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
            <span>{i + 1}. {p.name}</span>
            <strong>{p.total}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
