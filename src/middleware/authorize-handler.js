import axios from "axios";
import { userSessions } from "sc-base-database";
import * as roundTimerHandler from "../features/round-timer/round-timer-handler";

import { logger } from "sc-common";
import { mongoEmitter } from "../adapters/socket-adapter";
import appConfigs from "../app-configs";
import clientEvents from "../constants/client-events";
import emitEvents from "../constants/emit-events";
import system from "../constants/system";

export const authenticate = async (socket, next) => {
    try {
        const userAgent = socket.request.headers["user-agent"];
        const authData = socket.handshake.auth;
        const request = {
            session: authData.ss,
            username: authData.username,
            browserUserAgent: userAgent,
        };

        const authResponse = await axios.post(`${appConfigs.userService.url}auth/session/verify`, request);

        if (!authResponse.data.isSuccessful) {
            socket.emit(clientEvents.auth, { authorized: false, ...authResponse.data });
            socket.disconnect(true);

            return;
        }

        const session = await userSessions.findOne({ sessionId: authData.ss }).lean().exec();
        const roundTimerGameOffered = await roundTimerHandler.getRoundTimerGameOffered(session);

        socket.data = {
            UID: session.userId,
            session: {
                ...session,
                roundTimerGameOffered,
            },
        };

        socket.emit(clientEvents.auth, { authorized: true });

        if (session.system !== system.instant && session.system !== system.mobileDirect) {
            const UID = session.userId;
            mongoEmitter.serverSideEmit(emitEvents.kickedOut, { UID, sid: socket.id });
        }

        next();
    } catch (ex) {
        logger.logError(ex);
    }
};
