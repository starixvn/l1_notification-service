import appConfigs from "../../app-configs";
const socketClients = {};
const instantGameSystemId = 3;

const addClient = (socketClient, session) => {
    if (session?.system == instantGameSystemId) {
        return;
    }

    const UID = session.userId;
    const existingSocketClient = getClientByUID(UID);

    if (existingSocketClient) {
        existingSocketClient.socketClient.emit("kickedOut", true);
        disconnectUser(existingSocketClient.socketClient.id);
    }

    socketClients[socketClient.id] = {
        UID,
        session,
        socketClient,
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

const getTotalClients = (req, res) => {
    const totalClients = Object.keys(socketClients)?.length ?? 0;
    res.send(200, totalClients);
};

const getDetailedClients = (req, res) => {
    const { secretKey } = req?.query || {};

    if (secretKey !== appConfigs.metrics.secretKey) {
        res.send({ error: true });
        return;
    }

    const detailedClients = Object.keys(socketClients).map((socketClientId) => {
        return {
            socketClientId: socketClientId,
            playerId: socketClients[socketClientId]?.session.playerId,
            UID: socketClients[socketClientId].UID,
        };
    });

    res.send(200, detailedClients);
};

export { addClient, getClients, getClientSession, disconnectUser, getTotalClients, getDetailedClients };
