import { createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import { Server } from "socket.io";
import emitEvents from "../constants/emit-events";
import system from "../constants/system";
import { sendAllUserExceptExclusionSite } from "../features/jackpots/jackpot-handler";
import { sendAllUserExpectRoundTimer } from "../features/round-timer/round-timer-handler";
import { handleUMEvent } from "../features/um/um-handler";

/** @type {Emitter}  */
let mongoEmitter;

/**
 * @param {Server} socketServer
 */
function registerEvents(socketServer) {
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

    nsp.on(emitEvents.roundTimer, (data) => {
        sendAllUserExpectRoundTimer(data);
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

export { mongoEmitter };

