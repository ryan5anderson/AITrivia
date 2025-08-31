// src/pages/UserHome.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { loadMe } from "../services/profile";

export default function UserHome({ user: userProp }) {
  const navigate = useNavigate();

  // local auth user (may have empty metadata)
  const [authUser] = useState(userProp || null);

  // server profile 
  const [profile, setProfile] = useState({ name: "", wins: 0, games_played: 0 });
  const [session, setSession] = useState(null);

  useEffect(() => {
    // get session, then watch changes 
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadMe()
      .then((p) => setProfile(p))
      .catch(() => {}); 
  }, [session]);

  const displayName =
    profile?.name ||
    authUser?.user_metadata?.name ||
    authUser?.email?.split("@")[0] ||
    "Player";

  const games = profile?.games_played ?? 0;
  const wins = profile?.wins ?? 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 overflow-hidden">
      <div className="card-glass max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
        <p className="text-gray-600 mt-1">Ready to play?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="card p-4 text-center">
            <p className="text-gray-500 text-sm">Games Played</p>
            <p className="text-2xl font-semibold tabnums">{games}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-gray-500 text-sm">Wins</p>
            <p className="text-2xl font-semibold tabnums">{wins}</p>
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
    </div>
  );
}
