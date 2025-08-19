import React from "react";

export default function JoinForm({ lobbyCode, setLobbyCode, disabled, onSubmit }) {
  return (
    <form onSubmit={onSubmit} style={{ marginBottom: "1.25rem" }}>
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
        disabled={disabled}
        style={{
          padding: "0.6rem 1.1rem",
          borderRadius: 8,
          border: "none",
          background: "#007bff",
          color: "#fff",
          cursor: "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        Join Lobby
      </button>
    </form>
  );
}
