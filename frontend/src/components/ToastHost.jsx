import React from "react";

/** Minimal global toast helper */
let _pushToast = null;

/**
 * toast("Saved!")                            
 * toast("Copied!", { type: "ok" })
 * toast("Heads up…", { type: "warn", duration: 2500 })
 * toast("Failed",   { type: "err" })
 */
export function toast(message, opts = {}) {
  if (!_pushToast) return;
  const { type = "info", duration = 1600 } = opts;
  _pushToast({ id: crypto?.randomUUID?.() ?? String(Date.now() + Math.random()), message, type, duration });
}

export default function ToastHost() {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    _pushToast = (t) => {
      setItems((prev) => [...prev, t]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, t.duration);
    };
    return () => { _pushToast = null; };
  }, []);

  const colorFor = (type) => {
    switch (type) {
      case "ok":   return "border-brand-cyan/60 bg-brand-cyan/20 text-brand-blue";
      case "warn": return "border-brand-yellow/60 bg-brand-yellow/20 text-brand-yellow";
      case "err":  return "border-brand-orange/60 bg-brand-orange/20 text-brand-orange";
      default:     return "border-neutral-border bg-white/90";
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto rounded-xl border shadow-card px-3 py-2 text-sm",
              "transition-all duration-300 animate-[fadeIn_.15s_ease-out]",
              colorFor(t.type),
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
