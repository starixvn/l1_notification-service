import { Server } from "socket.io";
import appType from "../../constants/app-type";
import { isGN } from "../../constants/system-type";
/** @type {Server} */
let socketServer = null;

/**
 * @param {Server} io
 */
const init = (io) => {
    socketServer = io;
};

const broadcastAll = (emitEvent, data) => socketServer.emit(emitEvent, data);

function broadcastLocal(emitEvent, data) {
    socketServer.local.emit(emitEvent, data);
}

async function getConnectedClients() {
    return await socketServer.fetchSockets();
}

function getLocalSockets(nsp = "/") {
    let sockets = Array.from(socketServer.of(nsp).sockets.values());
    if (!isGN) {
        return sockets.filter((socket) => socket.data.session.system !== appType.instant);
    }
    return sockets;
}

export { broadcastAll, broadcastLocal, getConnectedClients, getLocalSockets, init };