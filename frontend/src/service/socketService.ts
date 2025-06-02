import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (socket && socket.connected) {
    return;
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    query: { userId },
  });

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Socket.IO server");
  });

  return socket;
};

export const emitEvent = (event: string, data: any) => {
  if (socket) {
    socket.emit(event, data);
  }
};

export const onEvent = (event: string, callback: (...args: any[]) => void) => {
  if (socket) {
    socket.on(event, callback);
  }
};
export const offEvent = (
  eventName: string,
  callback: (...args: any[]) => void
) => {
  if (socket) {
    socket.off(eventName, callback);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
