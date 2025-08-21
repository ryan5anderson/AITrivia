import React from "react";

export default function ModeToggle({ mode, setMode }) {
  return (
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
  );
}
