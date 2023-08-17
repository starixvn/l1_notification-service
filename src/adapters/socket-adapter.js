import { MongoAdapter, createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import { Server } from "socket.io";
import { handleUMEvent } from "../features/um/um-handler";

/** @type {Emitter}  */
let mongoEmitter;

/** @type {MongoAdapter}  */
let mongoAdapter;

/**
 * @param {Server} socketServer
 */
function registerEvents(socketServer) {
    mongoAdapter = socketServer.of("/").adapter;
    adapter.fetchSockets({});
    adapter.on(emitEvents.reload, (data) => {
        socketServer.sockets.emit("reload", data);
    });

    adapter.on(emitEvents.jackpotWinner, (data) => {
        sendAllUserExceptExclusionSite(data);
    });

    adapter.on(emitEvents.um, (data) => {
        handleUMEvent(data);
    });
}

/**
 * @param {Server} socketServer
 */
export function initMongoAdapter(socketServer, mongoCollection) {
    const mongoAdapter = createAdapter(mongoCollection, {
        addCreatedAtField: true,
    });
    socketServer.adapter(mongoAdapter);

    registerEvents(socketServer);
}

export function initMongoEmitter(mongoCollection) {
    mongoEmitter = new Emitter(mongoCollection);
}

export async function getConnectedClients() {
    return await mongoAdapter.fetchSockets();
}

export const emitEvents = {
    jackpotWinner: "jackpotWinner",
    reload: "reload",
    um: "um",
};

export { mongoEmitter };

