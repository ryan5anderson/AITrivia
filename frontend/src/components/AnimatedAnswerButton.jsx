import React from "react";

export default function AnimatedAnswerButton({
  children, state = "idle", disabled, onClick,
}) {
  // state: "idle" | "selected" | "correct" | "wrong" | "locked"
  const base = "tap-target ring-focus rounded-xl px-4 py-3 text-left transition shadow";
  const map = {
    idle:     "bg-white hover:bg-black/5 border border-black/10",
    selected: "bg-indigo-50 border border-indigo-200",
    correct:  "bg-emerald-50 border border-emerald-200",
    wrong:    "bg-rose-50 border border-rose-200",
    locked:   "bg-gray-50 border border-gray-200 opacity-75",
  };
  return (
    <button
      type="button"
      className={`${base} ${map[state]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
