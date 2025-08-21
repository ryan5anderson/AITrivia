import React, { useMemo } from "react";

/**
 * players: Array<{ id: string, name: string, isHost?: boolean, number?: number }>
 * youId: socket.id of this client
 * isHostHere: convenience flag for current client (optional)
 */

export default function PlayerList({ players = [], youId, isHostHere }) {
  // Prefer server-provided numbers; otherwise assign by join order deterministically
  const numbered = useMemo(() => {
    // If players already have .number, respect it and sort by it
    const hasNumbers = players.every(p => typeof p.number === "number");
    if (hasNumbers) {
      return [...players].sort((a, b) => a.number - b.number);
    }
    // Fallback: stable order from array index
    return players.map((p, i) => ({ ...p, number: i + 1 }));
  }, [players]);

  return (
    <div
      style={{
        textAlign: "left",
        margin: "1rem auto",
        maxWidth: 420,
        border: "1px solid #eee",
        borderRadius: 10,
        padding: "0.75rem",
        background: "#fff",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Players</div>

      {numbered.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No players yet.</div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {numbered.map((p) => {
            const isYou = p.id === youId;
            const isHost = !!p.isHost;

            return (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  marginBottom: 6,
                  background: isHost ? "#f3e8ff" : "#f9fafb", // host = soft purple, others = light gray
                  border: isHost ? "1px solid #e9d5ff" : "1px solid #eee",
                }}
              >
                {/* Number badge */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    fontWeight: 700,
                    background: isHost ? "#7c3aed" : "#e5e7eb",
                    color: isHost ? "#fff" : "#111827",
                  }}
                >
                  {p.number}
                </div>

                {/* Name + tags */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600 }}>
                    {p.name} {isYou ? <span style={{ opacity: 0.6 }}>(you)</span> : null}
                  </span>

                  {isHost && (
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "#7c3aed",
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    >
                      Host
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
