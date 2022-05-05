import { prop, compose, lt, pipe } from "ramda";
import { logger } from "sc-common";
import { findWithProjection } from "./game-notification-repository";
import { getClientSession } from "../socket-clients/socket-client-handler";

const getUID = pipe(prop("id"), getClientSession, prop("userId"));
const getGameId = prop("gameId");
const isValidRequest = compose(lt(0), getGameId);

const createFilter = (client, request) => {
    if (isValidRequest(request)) {
        return { uid: getUID(client), gameId: getGameId(request) };
    } else {
        return { uid: getUID(client) };
    }
};

const transformData = (error, data) => {
    if (error) {
        logger.logError(error);

        return [];
    }

    return data;
};

const findFromRepository = (sendData) => findWithProjection(compose(sendData, transformData));

export const findNotifications = (sendMessage) => compose(findFromRepository(sendMessage), createFilter);
export const tests = {
    createFilter,
    transformData,
    findFromRepository,
};
