import axios from "axios";
import { userSessions } from "sc-base-database";
import * as roundTimerHandler from "../features/round-timer/round-timer-handler";

import { logger } from "sc-common";
import appConfigs from "../app-configs";
import * as socketClientHandler from "../features/socket-clients/socket-client-handler";

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
        socket.data = {
            UID: session.userId,
            session,
        };
        const roundTimerGameOffered = await roundTimerHandler.getRoundTimerGameOffered(session);
        const newSession = { ...session, roundTimerGameOffered };

        socketClient.emit("auth", { authorized: true });

        next();
    } catch (ex) {
        logger.logError(ex);
    }
};
