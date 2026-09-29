import { io, type Socket } from "socket.io-client";

let socket: Socket | undefined;
export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000
    });
  }
  return socket;
}
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = undefined;
}
