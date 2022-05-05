import { Server } from "socket.io";
import * as prometheus from "socket.io-prom-metrics";
import appConfigs from "./app-configs";

let socketIOMetrics = null;

/**
 * @param {Server} socketServer
 */
const init = (socketServer) => {
    const metrics = appConfigs?.metrics ?? { enable: false, secretKey: "" };

    if (metrics.enable) {
        socketIOMetrics = prometheus.metrics(socketServer, {
            collectDefaultMetrics: true,
            createServer: false,
            checkForNewNamespaces: true,
        });
    }
};

const getMetrics = () => {
    return socketIOMetrics.register.metrics();
};

export { init, getMetrics };
