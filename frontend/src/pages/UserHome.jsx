// src/pages/UserHome.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";

export default function UserHome({ user: userProp }) {
  const navigate = useNavigate();
  const [user] = useState(userProp || null);
  const [stats] = useState({ games: 0, wins: 0 });

  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "Player";
  const email = user?.email || "—";

  return (
    <div className="min-h-screen flex flex-col page-bg">
      <main className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <div className="card-glass max-w-xl w-full text-center">
          <header>
            <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
            <p className="text-gray-600 mt-1">Ready to play?</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="card p-4 text-left">
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium truncate">{email}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-gray-500 text-sm">Games Played</p>
              <p className="text-2xl font-semibold tabnums">{stats.games}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-gray-500 text-sm">Wins</p>
              <p className="text-2xl font-semibold tabnums">{stats.wins}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/lobby")}
              className="btn-primary ring-focus flex-1 h-11 justify-center"
            >
              🎮 Enter Lobby
            </button>
            <button
              onClick={() => navigate("/leaderboard")}
              className="btn-second ring-focus flex-1 h-11 justify-center"
            >
              🏆 View Leaderboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
