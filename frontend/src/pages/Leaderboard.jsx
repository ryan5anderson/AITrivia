// src/pages/Leaderboard.jsx
import React, { useMemo } from "react";

export default function Leaderboard({
  board = [],
  onNext,
  title = "🏆 Leaderboard",
  buttonLabel = "Continue →",
  waitingText = "Waiting for next round…",
}) {
  const rows = useMemo(() => [...board].sort((a, b) => b.total - a.total), [board]);

  const rankBadge = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return null;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] page-bg flex items-center justify-center px-4">
      <div className="card-glass max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>

        {rows.length === 0 ? (
          <p className="text-gray-500 text-center">No scores yet.</p>
        ) : (
          <div className="divide-y divide-black/5">
            {rows.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-3 px-1"
              >
                {/* Left: rank + avatar + name */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center tabnums">
                    {rankBadge(i) || i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                    {(r.name || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <span className="truncate">{r.name || "Player"}</span>
                </div>

                {/* Right: score */}
                <span className="font-semibold tabnums">{r.total ?? 0}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          {onNext ? (
            <button
              onClick={onNext}
              className="btn-primary ring-focus justify-center px-6 py-2 text-base"
            >
              {buttonLabel}
            </button>
          ) : (
            <div className="text-sm text-gray-500">{waitingText}</div>
          )}
        </div>
      </div>
    </div>
  );
}
