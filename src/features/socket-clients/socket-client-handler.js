import { emitEvents, getConnectedClients, mongoEmitter } from "../../adapters/socket-adapter";
import system from "../../constants/system";

const addClient = (socket, session) => {
    if (session?.system !== system.instant) {
        const UID = session.userId;
        //disconnect other socket sessions having same UID
        mongoEmitter.serverSideEmit(emitEvents.kickedOut, { UID, sid: socket.id });
    }
};

const getTotalClients = async (req, res) => {
    const sockets = await getConnectedClients();
    res.send(200, sockets.length);
};

export { addClient, getTotalClients };

