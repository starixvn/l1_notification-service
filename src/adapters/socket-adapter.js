import { MongoAdapter, createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import { Server } from "socket.io";
import { handleUMEvent } from "../features/um/um-handler";

/** @type {Emitter}  */
let mongoEmitter;

/** @type {MongoAdapter}  */
let mongoAdapter;

function registerEvents() {
    mongoAdapter.on(emitEvents.reload, (data) => {
        socketServer.sockets.emit("reload", data);
    });

    mongoAdapter.on(emitEvents.jackpotWinner, (data) => {
        sendAllUserExceptExclusionSite(data);
    });

    mongoAdapter.on(emitEvents.um, (data) => {
        handleUMEvent(data);
    });
}

/**
 * @param {Server} socketServer
 */
export function initMongoAdapter(socketServer, mongoCollection) {
    mongoAdapter = createAdapter(mongoCollection, {
        addCreatedAtField: true,
    });
    socketServer.adapter(mongoAdapter);
    registerEvents();
}

export function initMongoEmitter(mongoCollection) {
    mongoEmitter = new Emitter(mongoCollection);
}

export async function getConnectedClients() {
    return await mongoAdapter.fetchSockets({ rooms: ["general"] });
}

export const emitEvents = {
    jackpotWinner: "jackpotWinner",
    reload: "reload",
    um: "um",
};

export { mongoAdapter, mongoEmitter };

