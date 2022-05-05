let socketServer = null;

const init = (io) => {
    socketServer = io.sockets;
};

const broadcastAll = (emitEvent, data) => socketServer?.emit(emitEvent, data);

export { init, broadcastAll };
