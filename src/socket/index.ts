import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";

const app = express();

const server = createServer(app);
const io = new Server(server);

let socket_connection;

const connected_user: Record<string, string> = {};

const emitNotificationToUsers = (userIds: string[], notification: unknown) => {
  userIds.forEach((userId) => {
    const socketId = connected_user[userId];
    if (socketId) {
      io.to(socketId).emit("notification:new", notification);
    }
  });
};

io.on("connection", (socket) => {
  socket_connection = socket;

  const user_id = socket.handshake.query.user_id as string;

  if (user_id && user_id !== "undefined") {
    connected_user[user_id] = socket.id;
  }

  io.emit("get-online-user", Object.keys(connected_user));

  socket.on("disconnect", () => {
    if (user_id) {
      delete connected_user[user_id];
    }
    io.emit("get-online-user", Object.keys(connected_user));
  });
});

export { io, server, app, socket_connection, connected_user, emitNotificationToUsers };
