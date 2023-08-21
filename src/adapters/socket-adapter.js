import { MongoAdapter, createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import { Server } from "socket.io";
import { disconnectUser } from "../features/socket-clients/socket-client-handler";
import { handleUMEvent } from "../features/um/um-handler";

/** @type {Emitter}  */
let mongoEmitter;

/** @type {MongoAdapter}  */
let mongoAdapter;

/**
 * @param {Server} socketServer
 */
function registerEvents(socketServer) {
    const nsp = socketServer.of("/");
    mongoAdapter = nsp.adapter;

    mongoAdapter.on(emitEvents.reload, (data) => {
        socketServer.sockets.emit("reload", data);
    });

    mongoAdapter.on(emitEvents.jackpotWinner, (data) => {
        sendAllUserExceptExclusionSite(data);
    });

    mongoAdapter.on(emitEvents.um, (data) => {
        handleUMEvent(data);
    });

    mongoAdapter.on(emitEvents.kickedOut, (userId) => {
        for (let [socketId, socket] of nsp.sockets) {
            if (socket.data.UID === userId) {
                socket.emit("kickedOut", true);
                disconnectUser(socketId);
            }
        }
    });
}

/**
 * @param {Server} socketServer
 */
export function initMongoAdapter(socketServer, mongoCollection) {
    socketServer.adapter(
        createAdapter(mongoCollection, {
            addCreatedAtField: true,
        })
    );
    registerEvents(socketServer);
}

export function initMongoEmitter(mongoCollection) {
    mongoEmitter = new Emitter(mongoCollection);
}

export async function getConnectedClients() {
    return await mongoAdapter.nsp.server.fetchSockets();
}

export const emitEvents = {
    jackpotWinner: "jackpotWinner",
    reload: "reload",
    um: "um",
    kickedOut: "kickedOut",
};

export { mongoAdapter, mongoEmitter };

