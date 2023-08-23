import { CronJob } from "cron";
import { Agent } from "http";
import { Pushgateway } from "prom-client";
import { logger } from "sc-common";
import { Server } from "socket.io";
import * as prometheus from "socket.io-prom-metrics";
import appConfigs from "./app-configs";

/** @type {prometheus.SocketIOMetrics} */
let socketIOMetrics = null;

/**
 * @param {Server} socketServer
 */
const init = (socketServer, promPushGatewayConfigs) => {
    const metrics = appConfigs?.metrics ?? { enable: false, secretKey: "" };

    if (metrics.enable) {
        socketIOMetrics = prometheus.metrics(socketServer, {
            collectDefaultMetrics: true,
            createServer: false,
            checkForNewNamespaces: true,
        });

        startMetricsCron(promPushGatewayConfigs);
    }
};

const getMetrics = () => {
    return socketIOMetrics.register.metrics();
};

const startMetricsCron = (promPushGatewayConfigs) => {
    const { options, baseUrl, parameters } = promPushGatewayConfigs;
    const { timeout, agentOptions } = options;
    const pushGateway = new Pushgateway(baseUrl, { timeout, agent: new Agent(agentOptions) }, socketIOMetrics.register);

    const job = new CronJob(
        "* * * * *",
        async () => pushGateway.pushAdd(parameters, () => {}),
        () => {
            logger.logError("Prom metrics job unexpectedly stopped");
            job.start();
        }
    );

    job.start();
};

export { getMetrics, init };

