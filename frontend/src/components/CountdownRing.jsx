import React, { useMemo } from "react";

export default function CountdownRing({ msLeft = 0, totalMs = 15000, size = 36, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, msLeft / Math.max(totalMs, 1)));
  const dash = useMemo(() => `${c * pct} ${c}`, [c, pct]);
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(0,0,0,.08)" strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r}
              stroke="rgb(79,70,229)" strokeWidth={stroke} fill="none"
              strokeLinecap="round" strokeDasharray={dash}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray .1s linear" }}/>
    </svg>
  );
}
