import * as socketServerHandler from "../socket-server/socket-server-handler";

export const broadcastReload = (req, res) => {
    socketServerHandler.broadcastAll("reload", true);

    res.send({ received: true });
};
