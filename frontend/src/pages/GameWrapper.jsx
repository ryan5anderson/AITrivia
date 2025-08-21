import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../realtime/SocketProvider";
import Game from "./Game";
import Leaderboard from "./Leaderboard";

export default function GameWrapper() {
    const { code: urlCode } = useParams();
    const socket = useSocket();
    const navigate = useNavigate();

    const [phase, setPhase] = useState("waitingTopic");
    const [pickerSocketId, setPickerSocketId] = useState(null);
    const [question, setQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [nextPicker, setNextPicker] = useState(null);

    const roomCodeRef = useRef(urlCode || "");
    useEffect(() => { if (urlCode) roomCodeRef.current = urlCode; }, [urlCode]);

    const lastPathRef = useRef("");
    const safeNavigate = (base, maybeCode) => {
        const rc = (maybeCode || roomCodeRef.current || urlCode || "").toUpperCase();
        if (!rc) return;
        const path = `${base}/${rc}`;
        if (lastPathRef.current !== path) {
            lastPathRef.current = path;
            navigate(path, { replace: true });
        }
    };

    useEffect(() => {
        if (!socket) return;

        const onPhase = (payload = {}) => {
            const { phase, pickerSocketId: sid, pickerId, roomCode } = payload;
            if (roomCode) roomCodeRef.current = roomCode;
            const psid = sid || pickerId || null;

            setPickerSocketId(psid);
            setPhase(phase || "waitingTopic");

            if (phase === "generating") {
                safeNavigate("/game", roomCode);
                return;
            }
            if ((phase === "topic" || phase === "waitingTopic") && psid && psid === socket.id) {
                safeNavigate("/topic-select", roomCode);
            }
            if (phase === "waitingTopic") {
                setQuestion(null);
                setLeaderboard([]);
            }
        };

        const onRequestTopics = (payload = {}) => {
            const { pickerSocketId: sid, pickerId, roomCode } = payload;
            if (roomCode) roomCodeRef.current = roomCode;
            const psid = sid || pickerId || null;
            setPickerSocketId(psid);
            if (psid === socket.id) {
                safeNavigate("/topic-select", roomCode);
            } else {
                setPhase("waitingTopic");
            }
        };

        const onNewQuestion = (payload = {}) => {
            const { question, roomCode } = payload;
            if (roomCode) roomCodeRef.current = roomCode;
            setQuestion(question || null);
            setPhase("question");
            safeNavigate("/game", roomCode);
        };

        // IMPORTANT: don't flip to "leaderboard" on each scoreUpdate anymore.
        // Game.jsx listens to scoreUpdate and shows reveal + inline scoreboard.

        const onRoundOver = (payload = {}) => {
            const { leaderboard: lb, roomCode, nextPickerSocketId } = payload;
            if (roomCode) roomCodeRef.current = roomCode;
            setLeaderboard(lb || []);
            setNextPicker(nextPickerSocketId || null);
            setPhase("leaderboard");
            // navigation stays on /game/:code; wrapper renders <Leaderboard/>
        };

        const onGameOver = (payload = {}) => {
            const { leaderboard: lb, final, roomCode } = payload;
            if (roomCode) roomCodeRef.current = roomCode;
            setLeaderboard(final || lb || []);
            setPhase("over");
        };

        socket.on("phase", onPhase);
        socket.on("requestTopics", onRequestTopics);
        socket.on("newQuestion", onNewQuestion);
        socket.on("roundOver", onRoundOver);
        socket.on("gameOver", onGameOver);

        socket.emit("sync-game", { lobbyCode: roomCodeRef.current || urlCode });
        socket.emit("sync-lobby", { lobbyCode: roomCodeRef.current || urlCode });

        return () => {
            socket.off("phase", onPhase);
            socket.off("requestTopics", onRequestTopics);
            socket.off("newQuestion", onNewQuestion);
            socket.off("roundOver", onRoundOver);
            socket.off("gameOver", onGameOver);
        };
    }, [socket, urlCode, navigate]);

    useEffect(() => {
        if (!socket) return;

        const updateUserGameplay = (payload = {}) => {
            const { uid, games_played, wins } = payload;
            // Update user gameplay data here, e.g., send to backend or update state
        };

        socket.on("updateUserGameplay", updateUserGameplay);

        return () => {
            socket.off("updateUserGameplay", updateUserGameplay);
        };
    }, [socket]);

    // not picker: waiting view
    if ((phase === "topic" || phase === "waitingTopic") && pickerSocketId && pickerSocketId !== socket?.id) {
        return <div style={{ padding: "2rem", textAlign: "center", opacity: 0.85 }}>
            <h2>Waiting for the picker to choose a topic…</h2>
        </div>;
    }

    if (phase === "question" && question) {
        return <Game question={question} code={roomCodeRef.current} socket={socket} />;
    }

    if (phase === "leaderboard") {
        const isNextPicker = nextPicker && nextPicker === socket?.id;
        return (
            <Leaderboard
                board={leaderboard}
                title="🏁 Round results"
                onNext={isNextPicker ? () => navigate(`/topic-select/${roomCodeRef.current}`, { replace: true }) : undefined}
                buttonLabel="Continue →"
            />
        );
    }

    // FINAL leaderboard — show "Return to Lobby"
    if (phase === "over") {
        return (
            <Leaderboard
                board={leaderboard}
                title="🏆 Final leaderboard"
                onNext={() => navigate(`/waiting/${roomCodeRef.current}`, { replace: true })}
                buttonLabel="↩︎ Return to Lobby"
            />
        );
    }

    if (phase === "generating") {
        return <div style={{ padding: "2rem", textAlign: "center" }}><h2>Building question…</h2></div>;
    }

    return <div style={{ padding: "2rem", textAlign: "center" }}>
        {phase === "over" ? <h2>Game Over</h2> : <h2>Loading…</h2>}
    </div>;

}
