import { createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import { Server } from "socket.io";
import system from "../constants/system";
import { sendAllUserExceptExclusionSite } from "../features/jackpots/jackpot-handler";
import { handleUMEvent } from "../features/um/um-handler";

/** @type {Emitter}  */
let mongoEmitter;

/**
 * @type {Server} server
 */
let server;

/**
 * @param {Server} socketServer
 */
function registerEvents(socketServer) {
    server = socketServer;
    const nsp = socketServer.of("/");

    nsp.on(emitEvents.jackpotWinner, (data) => {
        sendAllUserExceptExclusionSite(data);
    });

    nsp.on(emitEvents.um, (data) => {
        handleUMEvent(data);
    });

    nsp.on(emitEvents.kickedOut, ({ UID, sid }) => {
        for (const socket of nsp.sockets.values()) {
            if (socket.data.UID === UID && socket.id !== sid && socket.data.session.system !== system.instant) {
                socket.emit("kickedOut", true);
                socket.disconnect(true);
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
    return await server.fetchSockets();
}

export function getSockets(nsp = "/") {
    return Array.from(server.of(nsp).sockets.values()).filter((socket) => socket.data.session.system !== system.instant);
}

export const emitEvents = {
    jackpotWinner: "jackpotWinner",
    reload: "reload",
    um: "um",
    kickedOut: "kickedOut",
};

export { mongoEmitter, server };

