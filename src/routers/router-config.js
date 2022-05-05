import express from "express";
import { Server } from "socket.io";
import appConfigs from "../app-configs";
import * as Metrics from "../metrics";
import * as HttpRouter from "./http-router";
import * as SocketRouter from "./socket-router";
import * as SocketServerHandler from "../features/socket-server/socket-server-handler";
import MsgpackParser from "socket.io-msgpack-parser";

/**
 * @param {express.Express} app
 * @param {http.Server} httpServer
 */
export const init = (app, httpServer) => {
    const { socketOptions, enableCorsWs, corsUrls } = appConfigs;
    const opts = socketOptions ?? { pingInterval: 25 * 1000, pingTimeout: 60 * 1000 };
    opts.allowEIO3 = true;
    opts.cors = {
        origin: enableCorsWs ? corsUrls : "*",
        credentials: true,
    };

    if (appConfigs.enableMsgpackParser) {
        opts.parser = MsgpackParser;
    }

    const socketServer = new Server(httpServer, opts);

    Metrics.init(socketServer);
    SocketServerHandler.init(socketServer);
    initRouter(app, socketServer);
};

/**
 *
 * @param {express.Express} app
 * @param {Server} socketServer
 */
const initRouter = async (app, socketServer) => {
    HttpRouter.init(app);
    SocketRouter.init(socketServer);
};
