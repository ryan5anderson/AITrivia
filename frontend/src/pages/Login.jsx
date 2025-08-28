import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) return setError(signInError.message);
    navigate("/user-home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center page-bg">
      <div className="container-page w-full">
        <div className="card-glass max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center">Log in</h2>
          <p className="text-center text-gray-600 mt-1">
            Welcome back! Enter your credentials.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                className="input ring-focus mt-1 h-11 text-base"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <div className="relative mt-1">
                <input
                  type={showPwd ? "text" : "password"}
                  className="input ring-focus h-11 text-base pr-20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 h-8 rounded-lg text-xs text-gray-700 border border-black/10 bg-white hover:bg-black/5"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary ring-focus w-full justify-center h-11 text-base mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in…" : "Log In"}
            </button>

          </form>

          <p className="text-sm text-gray-600 text-center mt-4">
            New here?{" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
