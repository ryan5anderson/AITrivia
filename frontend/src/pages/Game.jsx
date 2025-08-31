import React, { useEffect, useMemo, useState, useCallback } from "react";
import QuestionCard from "../components/QuestionCard";
import Scoreboard from "../components/Scoreboard";
import { toast } from "../components/ToastHost";

export default function Game({ question, code, socket }) {
  const [board, setBoard] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [correctIndex, setCorrectIndex] = useState(null);
  const [totalMs, setTotalMs] = useState(15000);

  // steady 100ms tick for smoother progress
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);

  // reset UI and snapshot the question duration
  useEffect(() => {
    setDisabled(false);
    setCorrectIndex(null);
    if (question?.expiresAt) {
      const explicit = question.timeLimitMs ?? question.ttlMs ?? null;
      if (explicit && explicit > 0) setTotalMs(explicit);
      else {
        const leftNow = Math.max(0, Number(question.expiresAt) - Date.now());
        setTotalMs(Math.max(leftNow, 1));
      }
    }
  }, [
    question?.qid,
    question?.expiresAt,
    question?.timeLimitMs,
    question?.ttlMs,
  ]);

  // live leaderboard + reveal
  useEffect(() => {
    if (!socket) return;
    const onScoreUpdate = (payload = {}) => {
      setBoard(payload.leaderboard || payload.scores || []);
      if (typeof payload.correctIndex === "number")
        setCorrectIndex(payload.correctIndex);
    };
    socket.on("scoreUpdate", onScoreUpdate);
    return () => socket.off("scoreUpdate", onScoreUpdate);
  }, [socket]);

  // time math
  const msLeft = useMemo(() => {
    if (!question?.expiresAt) return 0;
    return Math.max(0, Number(question.expiresAt) - now);
  }, [question?.expiresAt, now]);

  const secsLeft = Math.ceil(msLeft / 1000);
  const pctLeft = Math.max(0, Math.min(100, (msLeft / totalMs) * 100));

  const handleSelect = useCallback(
    (choiceIndex) => {
      if (!socket || disabled || !question?.qid) return;
      setDisabled(true);
      toast("Answer locked");
      socket.emit("submit-answer", {
        lobbyCode: code,
        qid: question.qid,
        choiceIndex,
      });
    },
    [socket, disabled, question?.qid, code]
  );

  if (!question) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] page-bg flex items-center justify-center px-4">
        <div className="card-glass max-w-lg w-full text-center">
          <h2 className="text-2xl font-semibold">Waiting for the next question…</h2>
          <p className="text-gray-600 mt-1">
            Hang tight — the host may be picking a topic.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] page-bg px-4 py-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="card-glass">
            {/* HUD */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="pill tabnums">Room {String(code || "").toUpperCase()}</span>
                <span className="pill">Q{question?.turn ?? "?"}</span>
              </div>
              <span className="pill bg-brand-orange/10 text-brand-orange tabnums">
                ⏳ {secsLeft}s
              </span>
            </div>

            {/* Progress bar (orange→yellow brand gradient) */}
            <div className="mt-3 h-2 w-full rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full transition-[width] duration-100"
                style={{
                  width: `${pctLeft}%`,
                  background:
                    "linear-gradient(90deg, #EB773E 0%, #F7B301 100%)",
                }}
              />
            </div>

            {/* Question */}
            <div className="mt-5">
              <QuestionCard
                question={question}
                onSelect={handleSelect}
                disabled={disabled}
                correctIndex={correctIndex}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-glass">
            <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
            <Scoreboard board={board} />
          </div>
        </div>
      </div>
    </div>
  );
}
