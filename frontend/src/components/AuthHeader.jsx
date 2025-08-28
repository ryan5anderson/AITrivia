import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FaUserCircle } from "react-icons/fa";
import { loadMe } from "../services/profile";

export default function AuthHeader() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({ name: "", email: "", wins: 0, games_played: 0 });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    loadMe()
      .then((d) => { setProfile(d); setErr(""); })
      .catch((e) => setErr(e?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [session]);

  // click-outside / ESC
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [open]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate("/");
  };

  if (!session) return null;

  return (
    <header className="sticky top-0 z-50 glass-strong border-b">
      <div className="container-page row h-14">
        <button onClick={() => navigate("/")} className="font-bold text-indigo-600 hover:opacity-80">
          AI Trivia
        </button>

        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-black/5"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <FaUserCircle className="text-gray-700" size={22} />
          </button>

          {open && (
            <div ref={menuRef} className="absolute right-0 top-12 w-72 card bg-white rounded-xl p-3 shadow-lg">
              {loading ? (
                <p className="text-sm text-gray-600 px-1 py-2">Loading…</p>
              ) : err ? (
                <p className="text-sm text-rose-600 px-1 py-2">Error: {err}</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <FaUserCircle className="text-gray-700" size={24} />
                    <div>
                      <div className="font-medium">{profile.name || "Player"}</div>
                      <div className="text-gray-500 truncate">{profile.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="card p-2 text-center">
                      <div className="text-gray-500 text-xs">Wins</div>
                      <div className="font-semibold tabnums">{profile.wins ?? 0}</div>
                    </div>
                    <div className="card p-2 text-center">
                      <div className="text-gray-500 text-xs">Games</div>
                      <div className="font-semibold tabnums">{profile.games_played ?? 0}</div>
                    </div>
                  </div>
                </div>
              )}
              <button onClick={signOut} className="btn-second ring-focus w-full justify-center mt-3">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
