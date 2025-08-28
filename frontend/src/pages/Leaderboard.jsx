import React, { useMemo } from "react";
import PhaseFrame from "../components/PhaseFrame";

/**
 * Props:
 * - board = [{ id, name, total }]
 * - onNext? () => void  (optional; if not provided, just shows “waiting…”)
 * - title? string       (optional)
 * - buttonLabel? string (optional; defaults to "Continue →")
 * - waitingText? string (optional; defaults to "Waiting for next round…")
 */
export default function Leaderboard({
  board = [],
  onNext,
  title = "🏆 Leaderboard",
  buttonLabel = "Continue →",
  waitingText = "Waiting for next round…",
}) {
  const rows = useMemo(() => [...board].sort((a, b) => b.total - a.total), [board]);

  return (
    <div style={{ padding: "2rem", maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>{title}</h2>

      {rows.length === 0 ? (
        <p>No scores yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: "8px" }}>#</th>
              <th style={{ padding: "8px" }}>Player</th>
              <th style={{ padding: "8px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f4f4f4" }}>
                <td style={{ padding: "8px", width: 40 }}>{i + 1}</td>
                <td style={{ padding: "8px" }}>{r.name}</td>
                <td style={{ padding: "8px", fontWeight: 600 }}>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 20, textAlign: "center" }}>
        {onNext ? (
          <button
            onClick={onNext}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: 10,
              border: "none",
              background: "#007bff",
              color: "#fff",
              cursor: "pointer",
              fontSize: 16,
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#0056b3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#007bff")}
          >
            {buttonLabel}
          </button>
        ) : (
          <div style={{ opacity: 0.7 }}>{waitingText}</div>
        )}
      </div>
    </div>
  );
}
