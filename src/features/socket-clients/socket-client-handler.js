import { getConnectedClients } from "../socket-server/socket-server-handler";

const getTotalClients = async (req, res) => {
    const sockets = await getConnectedClients();
    res.send(200, sockets.length);
};

export { getTotalClients };

