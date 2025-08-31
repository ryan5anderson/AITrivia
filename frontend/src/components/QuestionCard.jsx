import React from "react";

export default function QuestionCard({
  question,
  onSelect,
  disabled,
  correctIndex,
}) {
  const [localPick, setLocalPick] = React.useState(null);
  React.useEffect(() => setLocalPick(null), [question?.qid]);

  const isRevealed = typeof correctIndex === "number";

  const getState = (idx) => {
    if (isRevealed) {
      if (idx === correctIndex) return "correct";
      if (localPick === idx) return "wrong";
      return "locked";
    }
    if (localPick === idx) return "selected";
    return "idle";
  };

  const classesFor = (state) => {
    const base =
      "tap-target ring-focus w-full text-left px-4 py-3 rounded-xl border transition shadow";
    switch (state) {
      case "selected":
        return `${base} bg-brand-blue/5 border-brand-blue/30`;
      case "correct":
        return `${base} bg-emerald-50 border-emerald-200`;
      case "wrong":
        return `${base} bg-rose-50 border-rose-200`;
      case "locked":
        return `${base} bg-gray-50 border-gray-200 opacity-75`;
      default:
        return `${base} bg-white border-black/10 hover:bg-black/5`;
    }
  };

  const click = (idx) => {
    if (disabled || isRevealed) return;
    setLocalPick(idx);
    onSelect?.(idx);
  };

  return (
    <div className="card bg-white rounded-2xl p-4">
      <h3 className="text-xl font-semibold">{question.text}</h3>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {question.choices?.map((opt, idx) => {
          const state = getState(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => click(idx)}
              className={classesFor(state)}
              disabled={disabled || isRevealed}
            >
              <span className="font-semibold mr-2 text-brand-blue">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
