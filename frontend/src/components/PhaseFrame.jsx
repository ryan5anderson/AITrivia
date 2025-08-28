import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import clsx from "clsx";

export default function PhaseFrame({ title, subtitle, right, children }) {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);

  return (
    <div className={clsx(
      "min-h-dvh w-full bg-gradient-to-br from-indigo-50 via-white to-rose-50",
      "dark:from-[#0b0b0b] dark:via-[#0a0a0a] dark:to-[#0b0b0b]"
    )}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight dark:text-white">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {right}
            <button
              onClick={() => setDark(v => !v)}
              className="rounded-xl border px-3 py-2 shadow bg-white/70 backdrop-blur dark:bg-neutral-800 dark:text-white"
              title="Toggle theme"
            >
              {dark ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </header>

        <div className="rounded-3xl border shadow-xl bg-white/70 backdrop-blur p-5 dark:bg-neutral-900/70 dark:border-neutral-800">
          {children}
        </div>
      </div>
    </div>
  );
}
