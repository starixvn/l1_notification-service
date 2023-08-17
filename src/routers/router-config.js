import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import MsgpackParser from "socket.io-msgpack-parser";
import { initMongoAdapter, initMongoEmitter } from "../adapters/socket-adapter";
import appConfigs from "../app-configs";
import { isAllowAccess } from "../features/domain/cors-helper";
import * as SocketServerHandler from "../features/socket-server/socket-server-handler";
import * as Metrics from "../metrics";
import * as HttpRouter from "./http-router";
import * as SocketRouter from "./socket-router";
/**
 * @param {express.Express} app
 * @param {http.Server} httpServer
 */
export const init = (app, httpServer) => {
    const { socketOptions, disableCors } = appConfigs;
    const opts = socketOptions ?? { pingInterval: 25 * 1000, pingTimeout: 60 * 1000 };
    opts.allowEIO3 = true;
    opts.allowRequest = (req, callback) => {
        let allowAccess = false;
        if (disableCors || isAllowAccess(req.headers.origin)) {
            allowAccess = true;
        }

        callback(null, allowAccess);
    };

    if (appConfigs.enableMsgpackParser) {
        opts.parser = MsgpackParser;
    }

    const socketServer = new Server(httpServer, opts);
    initAdapter(socketServer);
    
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

const initAdapter = (socketServer) => {
    const collection = mongoose.connection.db.collection("notification_service_events");
    initMongoAdapter(socketServer, collection);
    initMongoEmitter(collection);
}