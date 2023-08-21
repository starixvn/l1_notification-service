import { Server } from "socket.io";
import system from "../../constants/system";

/** @type {Server} */
let socketServer = null;

/**
 * @param {Server} io
 */
const init = (io) => {
    socketServer = io;
};

const broadcastAll = (emitEvent, data) => socketServer.emit(emitEvent, data);

async function getConnectedClients() {
    return await socketServer.fetchSockets();
}

function getSockets(nsp = "/") {
    return Array.from(socketServer.of(nsp).sockets.values()).filter((socket) => socket.data.session.system !== system.instant);
}

export { broadcastAll, getConnectedClients, getSockets, init };

