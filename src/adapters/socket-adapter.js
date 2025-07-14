import { createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import { Server } from "socket.io";
import clientEvents from "../constants/client-events";
import emitEvents from "../constants/emit-events";
import system from "../constants/system";
import { sendAllUserExceptExclusionSite } from "../features/jackpots/jackpot-handler";
import { sendAllUserExpectRoundTimer } from "../features/round-timer/round-timer-handler";
import { handleUMEvent } from "../features/um/um-handler";

/** @type {Emitter}  */
let mongoEmitter;

/**
 * Handle promotion progress event - target specific client by playerId
 * @param {Object} progressData - The progress data containing playerId and notification data
 */
function handlePromotionProgressEvent(progressData, socketServer) {
    const { playerId, operatorId, siteName, ...notificationData } = progressData;

    const nsp = socketServer.of("/");

    const targetSocket = [...nsp.sockets.values()].find((socket) => socket.data.session.playerId === playerId);
    if (targetSocket) {
        targetSocket.emit(clientEvents.promotionProgress, notificationData);
    }
}

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
            if (
                socket.data.UID === UID &&
                socket.id !== sid &&
                socket.data.session.system !== system.instant &&
                socket.data.session.system !== system.mobileDirect
            ) {
                socket.emit(clientEvents.kickedOut, true);
                socket.disconnect(true);
            }
        }
    });

    nsp.on(emitEvents.roundTimer, (data) => {
        sendAllUserExpectRoundTimer(data);
    });

    nsp.on(emitEvents.promotionProgress, (data) => {
        handlePromotionProgressEvent(data, socketServer);
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

export { handlePromotionProgressEvent };

export function initMongoEmitter(mongoCollection) {
    mongoEmitter = new Emitter(mongoCollection, "/", { addCreatedAtField: true });
}

export { mongoEmitter };
