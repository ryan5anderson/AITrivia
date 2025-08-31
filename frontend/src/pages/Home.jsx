// src/pages/Home.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RevealOnScroll from "../components/RevealOnScroll";
import { toast } from "../components/ToastHost";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    toast("Welcome to AI Trivia!", { type: "ok" });
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b">


        {/* Main nav container */}
        <div className="card-glass">
          <div className="container-page row h-14">
            <button
              onClick={() => navigate("/")}
              className="font-bold text-brand-orange hover:opacity-80"
            >
              AI Trivia
            </button>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <a href="#about" className="text-gray-700 hover:text-brand-orange transition-colors">
                About
              </a>
              <a href="#features" className="text-gray-700 hover:text-brand-orange transition-colors">
                Features
              </a>
              <a href="#team" className="text-gray-700 hover:text-brand-orange transition-colors">
                Team
              </a>
              <a href="#contact" className="text-gray-700 hover:text-brand-orange transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>

        {/* Gradient bar */}
        <div className="h-1 bg-gradient-to-r from-[#EB773E] to-[#F7B301]" />
      </header>





      {/* Scroll area with continuous gradient + snap */}
      <main className="h-[calc(100vh-3.5rem)] overflow-y-auto snap-y snap-mandatory page-bg">
        {/* HERO */}
        <section className="snap-start center-viewport">
          <div className="container-page-nopy w-full">
            <RevealOnScroll className="card-glass max-w-3xl mx-auto text-center hero-shift">
              <h1 className="text-5xl font-extrabold tracking-tight">
                🎉 Welcome to <span className="text-brand-blue">AI Trivia</span>
              </h1>
              <p className="text-gray-600 mt-3">
                Test your knowledge across topics — powered by OpenAI.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={() => navigate("/login")} className="btn-primary ring-focus">
                  Log In
                </button>
                <button onClick={() => navigate("/register")} className="btn-second ring-focus">
                  Register
                </button>
                {/* Example toast trigger button (dev only) */}
                {/* <button onClick={() => toast("Copied code!", { type: "ok" })} className="btn-second ring-focus">
                  Try a Toast
                </button> */}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="snap-start min-h-[80vh] flex items-center">
          <div className="container-page w-full">
            <RevealOnScroll className="card max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-semibold">About</h2>
              <p className="text-gray-600 mt-2">
                AI Trivia is a fast-paced, multiplayer quiz game powered by OpenAI.
                Players join a lobby, pick topics they love, and race against the clock
                to answer AI-generated questions. 
              </p>
            </RevealOnScroll>
          </div>
        </section>


        {/* FEATURES */}
        <section id="features" className="snap-start min-h-[80vh] flex items-center">
          <div className="container-page w-full">
            <RevealOnScroll className="card max-w-5xl mx-auto">
              <h2 className="text-3xl font-semibold text-center">Features</h2>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <li className="chip">Real-time multiplayer</li>
                <li className="chip">Topic selection</li>
                <li className="chip">Timed questions</li>
                <li className="chip">Leaderboards</li>
              </ul>
            </RevealOnScroll>
          </div>
        </section>

        {/* TEAM */}
        <section id="team" className="snap-start min-h-[80vh] flex items-center">
          <div className="container-page w-full">
            <RevealOnScroll className="card max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-semibold">Team</h2>
              <p className="text-gray-600 mt-2">Meet the humans behind AI Trivia.</p>

              {/* Team member cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-black/5 bg-white shadow-sm">
          <h3 className="font-semibold text-brand-blue">Ryan Anderson</h3>
        </div>
        <div className="p-4 rounded-xl border border-black/5 bg-white shadow-sm">
          <h3 className="font-semibold text-brand-blue">Victoria Carcillo</h3>
        </div>
        <div className="p-4 rounded-xl border border-black/5 bg-white shadow-sm">
          <h3 className="font-semibold text-brand-blue">Karen Wongso</h3>
        </div>
      </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="snap-start min-h-[60vh] flex items-center">
          <div className="container-page w-full">
            <RevealOnScroll className="row text-sm text-gray-500">
              <span>© {new Date().getFullYear()} AI Trivia</span>
              <a href="#" className="hover:underline">Contact</a>
            </RevealOnScroll>
          </div>
        </section>
      </main>
    </div>
  );
}
