// src/realtime/SocketProvider.jsx
import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketCtx = createContext(null);

export function SocketProvider({ children }) {
  // CRA envs live on process.env.REACT_APP_*
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL?.trim() || window.location.origin;

  const socket = useMemo(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket"],       // avoid xhr-poll (your errors)
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 500,
      timeout: 10000,
      // path: "/socket.io",            // (default; uncomment if you changed server path)
    });

    s.on("connect", () => console.log("[socket] connected:", s.id, "->", SOCKET_URL));
    s.on("disconnect", (reason) => console.log("[socket] disconnected:", reason));
    s.on("connect_error", (err) => console.log("[socket] connect_error:", err.message));

    return s;
  }, [SOCKET_URL]);

  return <SocketCtx.Provider value={socket}>{children}</SocketCtx.Provider>;
}

export const useSocket = () => useContext(SocketCtx);
