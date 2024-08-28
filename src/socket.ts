// socket.ts
import { Server } from "socket.io";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { User } from "./models/User";
import { config } from "./config";
import { onlineUsers } from "./onlineUsers";
import {
  CityEvent,
  CountryEvent,
  ExchangeRateEvent,
  ParcelEvent,
  RoleEvent,
  WarehouseEvent,
  UserEvent,
} from "./models/Events";
import { authenticateSocket } from "./middlewares/auth";
import { corsOptions } from "./app";

export const initializeSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.use(authenticateSocket).on("connection", (socket) => {
    const user = socket.data.user;
    // console.log("A User Connected", user);
    onlineUsers.set(socket.id, user);

    io.emit("onlineUsers", Array.from(onlineUsers.values()));

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.values()));
    });
  });

  return io;
};
