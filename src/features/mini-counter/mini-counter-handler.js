import { broadcastAll } from "../socket-server/socket-server-handler";

let latestData = {};

const getMiniCounterLatestData = (socketClient) => {
    socketClient.emit("latestMiniCounter", latestData);
};

const handleMiniCounterWatcherData = (req, res) => {
    const miniCounter = req.body;
    latestData = { ...latestData, ...miniCounter };
    broadcastAll("miniCounter", miniCounter);

    res.send({ received: true });
};

export { handleMiniCounterWatcherData, getMiniCounterLatestData };
