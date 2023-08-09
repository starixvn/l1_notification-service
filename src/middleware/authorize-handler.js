import axios from "axios";
import { userSessions } from "sc-base-database";
import * as socketClientHandler from "../features/socket-clients/socket-client-handler";
import * as roundTimerHandler from "../features/round-timer/round-timer-handler";

import appConfigs from "../app-configs";
import { logger } from "sc-common";

export const authenticate = async (socketClient, next) => {
    try {
        const userAgent = socketClient.request.headers["user-agent"];
        const authData = socketClient.handshake.auth;
        const request = {
            session: authData.ss,
            username: authData.username,
            browserUserAgent: userAgent,
        };

        const authResponse = await axios.post(`${appConfigs.userService.url}auth/session/verify`, request);

        if (!authResponse.data.isSuccessful) {
            socketClient.emit("auth", { authorized: false, ...authResponse.data });
            socketClient.disconnect(true);

            return;
        }

        const session = await userSessions.findOne({ sessionId: authData.ss }).lean().exec();

        socketClientHandler.addClient(socketClient, session);

        roundTimerHandler.initDataBySession(session);

        socketClient.emit("auth", { authorized: true });

        next();
    } catch (ex) {
        logger.logError(ex);
    }
};
