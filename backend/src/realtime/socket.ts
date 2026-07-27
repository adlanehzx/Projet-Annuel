import { Server } from "socket.io";

let io: Server | null = null;

export const setSocketServer = (server: Server) => {
  io = server;
};

export const emitToUser = (
  userId: number,
  event: string,
  payload: Record<string, unknown>,
) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};
