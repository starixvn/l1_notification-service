import { broadcastAll } from "../socket-server/socket-server-handler";

let latestData = {};

const getMiniCounterLatestData = (socketClient) => {
    const currentTime = new Date(new Date().toUTCString());
    Object.keys(latestData).forEach((game) => {
        latestData[game].timeFromStart = (new Date(latestData[game].time) - currentTime) / 1000;
    });

    socketClient.emit("latestMiniCounter", latestData);
};

const handleMiniCounterWatcherData = (req, res) => {
    const miniCounter = req.body;

    latestData = { ...latestData, ...miniCounter };
    broadcastAll("miniCounter", miniCounter);

    res.send({ received: true });
};

export { handleMiniCounterWatcherData, getMiniCounterLatestData };
