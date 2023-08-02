import axios from "axios";
import { broadcastAll } from "../socket-server/socket-server-handler";
import appConfigs from "../../app-configs";
import { logger } from "sc-common";

const getMiniCounterLatestData = async (socketClient) => {
    try {
        const currentTime = new Date(new Date().toUTCString());
        const latestData = (await axios.get(`${appConfigs.roundWatcherService.url}api/lastResult`)).data;
        Object.keys(latestData).forEach((game) => {
            latestData[game].timeFromStart = (currentTime - new Date(latestData[game].time)) / 1000;
        });

        socketClient.emit("latestMiniCounter", latestData);
    } catch (err) {
        logger.logError(err);
    }
};

const handleMiniCounterWatcherData = (req, res) => {
    try {
        const miniCounter = req.body;

        broadcastAll("miniCounter", miniCounter);

        res.send({ received: true });
    } catch (err) {
        logger.logError(err);
    }
};

export { handleMiniCounterWatcherData, getMiniCounterLatestData };
