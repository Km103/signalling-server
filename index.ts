import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "path";
import { UserManager } from "./Managers/UserManager";

const app = express();
const server = createServer(app);

app.use(express.static(path.join(__dirname, "public")));

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const userManager = new UserManager();

io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on("find-match", (id, tags) => {
        userManager.AddUser(socket, tags);
        socket.to(id).emit("joined-lobby");
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        userManager.removeUser(socket.id);
    });
});

const PORT = 8000;

server.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
