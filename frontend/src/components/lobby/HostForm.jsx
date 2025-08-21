import React from "react";

export default function HostForm({ disabled, onCreate }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <button
        onClick={onCreate}
        disabled={disabled}
        style={{
          padding: "0.6rem 1.1rem",
          borderRadius: 8,
          border: "none",
          background: "#28a745",
          color: "#fff",
          cursor: "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        Create Lobby
      </button>
    </div>
  );
}
