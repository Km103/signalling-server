import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

export interface User {
    id: string;
    socket: Socket;
    tags: Array<string> | null;
}

export class UserManager {
    private users: User[];
    private MatchingQueue: string[];
    private roomManager: RoomManager;
    constructor() {
        this.users = [];
        this.MatchingQueue = [];
        this.roomManager = new RoomManager();
    }

    AddUser(socket: Socket, tags: Array<string>) {
        const user = {
            socket,
            id: socket.id,
            tags,
        };
        this.users.push(user);
        this.MatchingQueue.push(socket.id);
        socket.emit("lobby");
        this.findMatch();
        this.initHandlers(socket);
    }

    removeUser(socketId: string) {
        const user = this.users.find((x) => x.socket.id === socketId);
        this.users = this.users.filter((x) => x.socket.id !== socketId);
    }

    findMatch() {
        console.log("finding Match");
        console.log(this.MatchingQueue.length);
        if (this.MatchingQueue.length < 2) {
            return;
        }

        const id1 = this.MatchingQueue.pop();
        const id2 = this.MatchingQueue.pop();

        const user1 = this.users.find((x) => x.socket.id === id1);
        const user2 = this.users.find((x) => x.socket.id === id2);
        if (!user1 || !user2) {
            return;
        }
        console.log("creating room");
        const room = this.roomManager.createRoom(user1, user2);
        this.findMatch();
    }

    initHandlers(socket: Socket) {
        socket.on(
            "offer",
            ({ sdp, roomId }: { sdp: string; roomId: string }) => {
                this.roomManager.onOffer(roomId, sdp, socket.id);
            }
        );

        socket.on(
            "answer",
            ({ sdp, roomId }: { sdp: string; roomId: string }) => {
                this.roomManager.onAnswer(roomId, sdp, socket.id);
            }
        );

        socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidates(
                roomId,
                socket.id,
                candidate,
                type
            );
        });
    }
}
