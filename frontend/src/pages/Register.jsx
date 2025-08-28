import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin + "/login",
      },
    });

    if (signUpError) {
      const message = (signUpError.message || "").toLowerCase();
      if (message.includes("already") && message.includes("registered")) {
        setError("An account with this email already exists. Please log in.");
      } else if (signUpError.status === 400) {
        setError("An account with this email may already exist. Try logging in.");
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError("An account with this email already exists. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center page-bg">
      <div className="container-page w-full">
        <div className="card-glass max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center">Create account</h2>
          <p className="text-center text-gray-600 mt-1">
            Join AI Trivia in seconds.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input
                type="text"
                className="input ring-focus mt-1 h-11 text-base"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>

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
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <div className="relative mt-1">
                <input
                  type={showPwd ? "text" : "password"}
                  className="input ring-focus h-11 text-base pr-20"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 h-8 rounded-lg text-xs text-gray-700 border border-black/10 bg-white hover:bg-black/5"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary ring-focus w-full justify-center mt-2 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Register"}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
