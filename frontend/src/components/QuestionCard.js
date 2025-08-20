// components/QuestionCard.jsx
import React from "react";

export default function QuestionCard({ question, onSelect, disabled, correctIndex }) {
  // question.choices (array of strings)
  // correctIndex: number | null (revealed when scoreUpdate arrives)
  // disabled: lock after I submit

  const pickedStyle = { backgroundColor: "#eef5ff" };
  const correctStyle = { backgroundColor: "#28a745", color: "#fff" };
  const wrongStyle = { backgroundColor: "#dc3545", color: "#fff" };

  const [localPick, setLocalPick] = React.useState(null);
  React.useEffect(() => setLocalPick(null), [question?.qid]);

  const click = (idx) => {
    if (disabled) return;
    setLocalPick(idx);
    onSelect?.(idx);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "1.5rem", borderRadius: 8, background: "#fff" }}>
      <h3 style={{ marginBottom: 16 }}>{question.text}</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {question.choices.map((opt, idx) => {
          // style rules:
          // - after reveal (correctIndex != null):
          //   * correctIndex green
          //   * my wrong pick red
          // - before reveal:
          //   * just highlight my selection lightly
          let style = {};
          if (typeof correctIndex === "number") {
            if (idx === correctIndex) style = correctStyle;
            else if (localPick === idx) style = wrongStyle;
          } else if (localPick === idx) {
            style = pickedStyle;
          }

          return (
            <li key={idx} style={{ margin: "0.5rem 0" }}>
              <button
                onClick={() => click(idx)}
                disabled={disabled || typeof correctIndex === "number"}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.9rem 1rem",
                  borderRadius: 10,
                  border: "2px solid #ddd",
                  cursor: disabled || typeof correctIndex === "number" ? "default" : "pointer",
                  ...style,
                }}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
