import { io } from "socket.io-client";
import { createContext, useContext, useMemo } from "react";

const SocketCtx = createContext(null);

export function SocketProvider({ children }) {
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8080";

  const socket = useMemo(
    () =>
      io(SOCKET_URL, {
        autoConnect: true,
        transports: ["websocket"],
        withCredentials: true,
      }),
    [SOCKET_URL]
  );

  return <SocketCtx.Provider value={socket}>{children}</SocketCtx.Provider>;
}

export const useSocket = () => useContext(SocketCtx);
