import { emitEvents, getConnectedClients, mongoEmitter } from "../../adapters/socket-adapter";
const socketClients = {};
const instantGameSystemId = 3;

const addClient = (socket, session) => {
    if (session?.system == instantGameSystemId) {
        return;
    }

    const UID = session.userId;
    //disconnect other socket sessions having same UID
    mongoEmitter.except(socket.id).emit(emitEvents.kickedOut, UID);

    socket.data = {
        UID,
        session,
    };

    socketClients[socket.id] = {
        UID,
        session,
        socketClient: socket,
    };
};

const getClients = () => socketClients;

const getClientSession = (socketId) => socketClients[socketId]?.session;

const disconnectUser = (socketClientId) => {
    const client = socketClients[socketClientId];

    if (client) {
        client.socketClient.disconnect(true);
        delete socketClients[socketClientId];
    }
};

const getClientByUID = (UID) => Object.values(socketClients).find((client) => client.UID === UID);

const getTotalClients = async (req, res) => {
    const sockets = await getConnectedClients();
    res.send(200, sockets.length);
};

export { addClient, disconnectUser, getClientSession, getClients, getTotalClients };

