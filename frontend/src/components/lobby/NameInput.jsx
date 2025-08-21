import React from "react";

export default function NameInput({ name, setName }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <input
        type="text"
        placeholder="Your display name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", maxWidth: 360, padding: "0.6rem" }}
      />
    </div>
  );
}
