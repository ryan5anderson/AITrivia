import React from "react";

export default function PlayerList({ players = [], youId }) {
  if (!players.length) {
    return <p className="text-sm text-gray-500">No players yet…</p>;
  }

  return (
    <ul className="list-none m-0 p-0 divide-y divide-black/5 pb-2">
      {players.map((p) => {
        const isYou = p.id === youId || p.socketId === youId;
        return (
          <li
            key={p.id}
            className="flex items-center justify-between px-4 sm:px-5 py-2 hover:bg-black/5 transition"
          >
            {/* Left side */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-blue text-white font-semibold">
                {p.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {p.name} {isYou && <span className="text-gray-500 text-sm">(you)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {p.isReady ? "Ready" : "Not ready"}
                </div>
              </div>
            </div>

            {/* Right side: Host badge */}
            {p.isHost && (
              <span className="px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-medium">
                Host
              </span>
            )}
          </li>
        );
      })}
    </ul>

  );
}
