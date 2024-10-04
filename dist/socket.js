"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
// socket.ts
const socket_io_1 = require("socket.io");
const onlineUsers_1 = require("./onlineUsers");
const Events_1 = require("./models/Events");
const auth_1 = require("./middlewares/auth");
const app_1 = require("./app");
const initializeSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: app_1.corsOptions,
    });
    io.use(auth_1.authenticateSocket).on("connection", (socket) => {
        const user = socket.data.user;
        console.log(user + "connected");
        onlineUsers_1.onlineUsers.set(socket.id, user);
        io.emit("onlineUsers", Array.from(onlineUsers_1.onlineUsers.values()));
        const eventHandlers = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, Events_1.CityEvent), Events_1.CountryEvent), Events_1.ExchangeRateEvent), Events_1.ParcelEvent), Events_1.RoleEvent), Events_1.WarehouseEvent), Events_1.UserEvent);
        Object.values(eventHandlers).forEach((event) => {
            socket.on(event, (data) => console.log(`${event} Event:`, data));
        });
        socket.on("disconnect", () => {
            onlineUsers_1.onlineUsers.delete(socket.id);
            io.emit("onlineUsers", Array.from(onlineUsers_1.onlineUsers.values()));
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
