// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import RevealOnScroll from "../components/RevealOnScroll";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Glassy sticky nav */}
      <header className="sticky top-0 z-40 glass-strong border-b">
        <div className="container-page row h-14">
          <span className="font-bold text-indigo-600">AI Trivia</span>
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#team" className="hover:text-indigo-600 transition-colors">Team</a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Scroll area with continuous gradient + snap */}
      <main className="h-[calc(100vh-3.5rem)] overflow-y-auto snap-y snap-mandatory page-bg">
        {/* HERO */}
        <section className="snap-start center-viewport">
          <div className="container-page-nopy w-full">
            <RevealOnScroll className="card-glass max-w-3xl mx-auto text-center hero-shift">
              <h1 className="text-5xl font-extrabold tracking-tight">
                🎉 Welcome to <span className="text-indigo-600">AI Trivia</span>
              </h1>
              <p className="text-gray-600 mt-3">
                Test your knowledge across topics — powered by OpenAI.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={() => navigate("/login")} className="btn-primary ring-focus">Log In</button>
                <button onClick={() => navigate("/register")} className="btn-second ring-focus">Register</button>
              </div>
            </RevealOnScroll>
          </div>
        </section>



        {/* ABOUT */}
        <section id="about" className="snap-start min-h-[80vh] flex items-center">
          <div className="container-page w-full">
            <RevealOnScroll className="card max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-semibold">About</h2>
              <p className="text-gray-600 mt-2">Short blurb about the game. (We’ll flesh this out later.)</p>
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
              <p className="text-gray-600 mt-2">Meet the humans behind AI Trivia. (Add cards later.)</p>
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
