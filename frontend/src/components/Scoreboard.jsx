import React, { useMemo } from "react";

export default function Scoreboard({ board = [], prev = [] }) {
  const prevMap = useMemo(
    () => Object.fromEntries(prev.map((p) => [p.id, p.total ?? 0])),
    [prev]
  );
  if (!board.length) return <div className="text-sm text-gray-500">No scores yet.</div>;

  const sorted = [...board].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));

  return (
    <div className="divide-y divide-black/5">
      {sorted.map((p, i) => {
        const delta = (p.total ?? 0) - (prevMap[p.id] ?? (p.total ?? 0));
        return (
          <div key={p.id ?? i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-6 text-right tabular-nums text-gray-500">{i + 1}.</span>
              <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-semibold">
                {(p.name || "?").slice(0, 1).toUpperCase()}
              </div>
              <span className="truncate">{p.name || "Player"}</span>
            </div>
            <div className="flex items-center gap-2">
              {delta !== 0 && (
                <span
                  className={`text-xs font-medium ${
                    delta > 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
              <span className="font-semibold tabular-nums">{p.total ?? 0}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
