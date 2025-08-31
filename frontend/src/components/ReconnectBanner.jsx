import React, { useEffect, useState } from "react";
import { useSocket } from "../realtime/SocketProvider";

export default function ReconnectBanner() {
  const socket = useSocket();
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setDown(false);
    const onDisconnect = () => setDown(true);
    const onErr = () => setDown(true);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onErr);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onErr);
    };
  }, [socket]);

  if (!down) return null;
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-full bg-amber-100 text-amber-800 px-4 py-2 shadow text-sm">
        Trying to reconnect…
      </div>
    </div>
  );
}
